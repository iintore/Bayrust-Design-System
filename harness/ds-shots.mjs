// Screenshots each design-system page (full page) for review: node ds-shots.mjs [sectionIds…] [--light]
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
const args = process.argv.slice(2); const light = args.includes('--light');
const ids = args.filter(a => !a.startsWith('--'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ locale: 'en-RW', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: light ? 'light' : 'dark' });
const page = await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text().slice(0, 200)); });
page.on('pageerror', e => errors.push('PAGEERROR ' + String(e).slice(0, 200)));
await page.goto('http://localhost:4317/ds/#overview');
await page.waitForSelector('.ds-nav', { timeout: 30000 });
if (light) { await page.click('text=Bayrust Light'); await page.waitForTimeout(800); }
await fs.mkdir('../research/ds-shots', { recursive: true });
for (const id of ids) {
  await page.evaluate((id) => { location.hash = id; }, id);
  await page.waitForTimeout(2500);
  const h = await page.evaluate(() => document.querySelector('.ds-main').scrollHeight);
  await page.setViewportSize({ width: 1440, height: Math.min(h + 40, 12000) });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `../research/ds-shots/${id}${light ? '-light' : ''}.png` });
  await page.setViewportSize({ width: 1440, height: 900 });
}
console.log(JSON.stringify([...new Set(errors)].slice(0, 30), null, 1));
await browser.close();
