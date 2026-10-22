// Captures documentation content from the live Bayrust runtime (Chromium, Bayrust Dark):
//  - component examples: the real rendered markup of every specimen on the design-system site, one
//    example per variant row; host-rendered feedback (toast, HUD, alert) opened through their stores
//  - block markup: outerHTML of each block from its live window state (harness/states/organisms.json)
// Asset references are rewritten to static paths under /ds/ and the referenced files are collected.
// Output: research/docs/capture.json and research/docs/files/ (copied into the docs' public/ds/).
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { rewrite, appIcons } from './docs-rewrite.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../research/docs');
const files = path.join(out, 'files');
await fs.mkdir(path.join(files, 'appicons'), { recursive: true });
const BASE = 'http://localhost:4317';


const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ locale: 'en-RW', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' });
const page = await ctx.newPage();
await page.goto(`${BASE}/ds/#atoms`);
await page.waitForSelector('.ds-nav', { timeout: 30000 });

const components = [];
for (const section of ['atoms', 'molecules', 'organisms', 'composed']) {
  await page.evaluate((s) => { location.hash = s; }, section);
  await page.waitForTimeout(3500);
  const specs = await page.evaluate(() => [...document.querySelectorAll('article.ds-specimen')].map((a) => {
    const stage = a.querySelector('.ds-stage');
    const rows = [...stage.querySelectorAll(':scope > div > .ds-row, :scope > .ds-row')];
    const clean = (el) => { const c = el.cloneNode(true); c.querySelectorAll('.ds-label').forEach((l) => l.remove()); return c.outerHTML; };
    // jsx: how the row is written, read from React (window.__toJSX, harness/specimen-tools.js)
    const code = (el) => { try { return window.__toJSX(el, { skip: 'ds-label' }); } catch { return ''; } };
    const examples = rows.length > 1
      ? rows.map((r, i) => ({ title: r.querySelector('.ds-label')?.textContent.trim() || `Example ${i + 1}`, html: clean(r), jsx: code(r), row: i }))
      : [{ title: rows[0]?.querySelector('.ds-label')?.textContent.trim() || 'Default', html: stage.innerHTML, jsx: code(rows[0] ?? stage.firstElementChild ?? stage), row: rows.length ? 0 : null }];
    return { name: a.querySelector('h3')?.textContent.trim(), note: a.querySelector('.ds-specimen > p')?.textContent.trim() || '', variants: a.querySelector('.ds-specimen-head span')?.textContent.trim() || '', examples };
  }));
  for (const s of specs) {
    if (s.name.startsWith('Feedback')) continue; // captured below from the hosts
    for (const e of s.examples) e.html = await rewrite(e.html);
    components.push({ ...s, section });
  }
}

// Host-rendered feedback: open each through the shipped stores, capture what the WindowShell hosts render.
const feedback = [
  ['Toast', 'Toast · success', 'success'], ['Toast', 'Toast · failure', 'failure'], ['Toast', 'Toast · pending', 'pending'],
  ['HUD', 'HUD', 'default'], ['Alert', 'Alert · default', 'default'], ['Alert', 'Alert · destructive', 'destructive'],
];
const hostCaptures = {};
for (const [comp, button, title] of feedback) {
  await page.evaluate(() => { location.hash = 'organisms'; });
  await page.waitForTimeout(1500);
  const before = await page.evaluate(() => new Set([...document.querySelectorAll('#ds-root *')].map((e) => e)).size);
  await page.getByText(button, { exact: true }).click();
  await page.waitForTimeout(1200);
  const html = await page.evaluate(() => {
    const main = document.querySelector('.ds-layout');
    const host = [...document.querySelectorAll('#ds-root > *, body > *')].filter((e) => !e.contains(main) && e.id !== 'settings-window-root' && e.tagName !== 'SCRIPT');
    const cands = [...document.querySelectorAll('[role=alertdialog],[role=dialog],[class*="toast"],[class*="hud__"],[class*="alert"]')].filter((e) => !main.contains(e) || e.closest('[class*="host"]'));
    const top = cands.filter((c) => !cands.some((o) => o !== c && o.contains(c)));
    // Each WindowShell host on the page renders the same feedback; one window shows one.
    return top[0]?.outerHTML || host.map((e) => e.outerHTML).join('\n');
  });
  (hostCaptures[comp] ??= []).push({ title, html: await rewrite(html) });
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.reload(); await page.waitForSelector('.ds-nav'); await page.waitForTimeout(1500);
}
for (const [name, examples] of Object.entries(hostCaptures)) components.push({ name, note: 'Rendered by the WindowShell hosts after opening it through its store, exactly as the app does.', variants: '', examples, section: 'organisms' });

// Blocks: markup of each block in its live window.
const spec = JSON.parse(await fs.readFile(path.join(here, 'states/organisms.json'), 'utf8'));
const blocks = [];
for (const it of spec.items) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: it.viewport[0], height: it.viewport[1] });
  await p.goto(BASE + it.url); await p.waitForTimeout(4500);
  for (const st of it.steps || []) {
    if (st.keys) await p.keyboard.type(st.keys, { delay: 30 });
    if (st.key) await p.keyboard.press({ return: 'Enter', tab: 'Tab', escape: 'Escape' }[st.key] || st.key);
    if (st.wait) await p.waitForTimeout(st.wait);
  }
  const html = await p.evaluate((sel) => document.querySelector(sel)?.outerHTML || '', it.selector);
  blocks.push({ id: it.id, label: it.label, url: it.url, viewport: it.viewport, selector: it.selector, html: await rewrite(html) });
  await p.close();
}
await browser.close();
await fs.writeFile(path.join(out, 'capture.json'), JSON.stringify({ components, blocks }, null, 1));
console.log('components', components.length, 'examples', components.reduce((a, c) => a + c.examples.length, 0), 'blocks', blocks.length, 'app icons', appIcons.size);
