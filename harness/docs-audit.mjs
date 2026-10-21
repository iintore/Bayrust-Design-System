// Audit of every component preview in the docs: opens each family page (dev server :5174, harness :4317), brings
// every example into view, waits for it, and records whether it rendered and at what size, with a picture of each
// preview container for review. Output: research/docs/audit/ (audit.json, <page>--<n>.png, sheets/<page>.png)
// Usage: node docs-audit.mjs [pagePathRegex]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../research/docs/audit');
await fs.mkdir(out, { recursive: true });
const content = JSON.parse(await fs.readFile(path.resolve(here, '../design-system/docs/src/content/content.json'), 'utf8'));
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const pages = Object.entries(content.pages).filter(([p, pg]) => (pg.members || pg.examples) && (!only || only.test(p)));

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'dark' });
const page = await ctx.newPage();
const results = [];
for (const [p] of pages) {
  await page.goto(`http://localhost:5174/${p}`);
  await page.waitForTimeout(1500);
  // every member's previews, including those behind "Show N more"
  for (const more of await page.locator('.doc-more[aria-expanded="false"]').all()) await more.click();
  const n = await page.locator('.doc-example').count();
  for (let i = 0; i < n; i++) {
    const ex = page.locator('.doc-example').nth(i);
    await ex.scrollIntoViewIfNeeded();
    // live specimens: wait until the frame reports in (or falls back); windows and markup: a short settle
    const kind = await ex.evaluate((el) => (el.querySelector('.doc-live-specimen') ? 'live' : el.querySelector('.doc-window') ? 'window' : 'markup'));
    if (kind === 'live') await ex.locator('.doc-skeleton').waitFor({ state: 'detached', timeout: 25000 }).catch(() => undefined);
    await page.waitForTimeout(kind === 'window' ? 2500 : 900);
    const info = await ex.evaluate((el) => {
      const stage = el.querySelector('.doc-playground-stage');
      const frame = el.querySelector('.doc-live-frame, .doc-live, .doc-window-frame');
      const r = frame?.getBoundingClientRect();
      const sr = stage?.getBoundingClientRect();
      return {
        title: el.querySelector('h3')?.textContent ?? '',
        member: el.closest('.doc-member')?.querySelector('h2')?.firstChild?.textContent ?? '',
        loading: !!el.querySelector('.doc-skeleton'),
        frame: r ? [Math.round(r.width), Math.round(r.height)] : null,
        // horizontal centring of the preview inside its container
        offCentre: r && sr ? Math.round(((r.left + r.right) / 2 - (sr.left + sr.right) / 2)) : null,
        overflow: stage ? stage.scrollWidth > stage.clientWidth + 2 : false,
      };
    });
    const file = `${p}--${String(i).padStart(2, '0')}.png`;
    await ex.locator('.doc-playground-stage').screenshot({ path: path.join(out, file) }).catch(() => undefined);
    results.push({ page: p, i, kind, file, ...info });
    process.stdout.write(`${p} #${i} ${kind} ${info.loading ? 'LOADING ' : ''}${info.frame ?? 'no frame'} off ${info.offCentre}\n`);
  }
}
await browser.close();
await fs.writeFile(path.join(out, 'audit.json'), JSON.stringify(results, null, 1));
const bad = results.filter((r) => r.loading || !r.frame || r.frame[1] < 8 || Math.abs(r.offCentre ?? 0) > 4 || r.overflow);
console.log(`${results.length} previews on ${pages.length} pages; ${bad.length} to look at`);
for (const b of bad) console.log(`  ${b.page} #${b.i} ${b.member} › ${b.title}: ${b.loading ? 'still loading ' : ''}${!b.frame || b.frame[1] < 8 ? 'empty ' : ''}${Math.abs(b.offCentre ?? 0) > 4 ? `off-centre ${b.offCentre}px ` : ''}${b.overflow ? 'overflows' : ''}`);
