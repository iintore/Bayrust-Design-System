// Loads each window page and reports console errors, IPC methods requested, and a screenshot.
// Usage: node probe.mjs main-window.html[?query] [width height]
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
const [page_, w = 750, h = 475] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ locale: 'en-RW', viewport: { width: +w, height: +h }, deviceScaleFactor: 2, colorScheme: 'dark' });
const page = await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('ipc://')) errors.push(m.text().slice(0, 300)); });
page.on('pageerror', e => errors.push('PAGEERROR ' + String(e).slice(0, 300)));
await page.goto('http://localhost:4317/' + page_);
await page.waitForTimeout(+(process.env.WAIT || 4000));
const ipc = await page.evaluate(() => [...new Set(window.__ipcCalls.filter(c => c.method).map(c => c.method))]);
await fs.mkdir('../research/probe', { recursive: true });
await page.screenshot({ path: `../research/probe/${page_.replace(/[^\w-]/g, '_')}.png` });
console.log(JSON.stringify({ ipc, errors: [...new Set(errors)].slice(0, 25) }, null, 1));
await browser.close();
