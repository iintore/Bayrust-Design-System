// Fidelity check for the docs: every specimen taken from a window of the running app recorded its size there.
// Renders each docs page (dev server on :5174) and measures every such specimen in its preview; a specimen
// that comes out at a different size than it had in the app is reported.
// Usage: node docs-verify.mjs [pagePathRegex]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const content = JSON.parse(await fs.readFile(path.resolve(here, '../design-system/docs/src/content/content.json'), 'utf8'));
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
let checked = 0;
const off = [];
for (const [p, pg] of Object.entries(content.pages)) {
  if (only && !only.test(p)) continue;
  // examples in page order: family members first, then the page's own
  const all = [...(pg.members ?? []).flatMap((m) => m.examples ?? []), ...(pg.examples ?? [])];
  const sized = all.map((e, i) => ({ ...e, i })).filter((e) => e.width && e.height && e.ctx && !e.image && !e.win);
  if (!sized.length) continue;
  await page.goto(`http://localhost:5174/${p}`);
  // every member's previews, including those behind "Show N more"
  await page.waitForTimeout(1000);
  for (const more of await page.locator('.doc-more[aria-expanded="false"]').all()) await more.click();
  await page.waitForTimeout(3000);
  const got = await page.evaluate(async () => {
    const frames = [...document.querySelectorAll('.doc-example')].map((ex) => ex.querySelector('iframe'));
    await Promise.all(frames.map((f) => f?.contentDocument?.fonts?.ready));
    return frames.map((f) => {
      let el = f?.contentDocument?.querySelector('.pv-ctx [data-specimen]') ?? f?.contentDocument?.querySelector('.pv-frame > *');
      // a whole view (display: contents) has no box: its frame is the view
      if (el && f.contentWindow.getComputedStyle(el).display === 'contents') el = f.contentDocument.querySelector('.pv-frame');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [Math.round(r.width), Math.round(r.height)];
    });
  });
  for (const e of sized) {
    checked++;
    const g = got[e.i];
    if (!g) { off.push(`${p} #${e.i} ${e.title}: not rendered`); continue; }
    if (Math.abs(g[0] - e.width) > 1 || Math.abs(g[1] - e.height) > 1) off.push(`${p} #${e.i} ${e.title} (${e.sub}): app ${e.width}×${e.height}, docs ${g[0]}×${g[1]}`);
  }
}
await browser.close();
console.log(`${checked} specimens checked against their size in the app, ${off.length} differ`);
for (const o of off) console.log('  ' + o);
