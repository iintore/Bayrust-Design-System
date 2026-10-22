// Captures a design-system page section into Figma via Figma's html-to-design capture script.
// Usage: node figma-capture.mjs <sectionId> <captureId> [selector] [--light]
import { chromium } from 'playwright-core';
const [id, captureId, selector = '.ds-main'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const light = process.argv.includes('--light');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ locale: 'en-RW', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: light ? 'light' : 'dark', bypassCSP: true });
const page = await ctx.newPage();
await page.goto(`http://localhost:4317/ds/#${id}`);
await page.waitForSelector('.ds-nav', { timeout: 30000 });
if (light) { await page.click('text=Bayrust Light'); }
await page.waitForTimeout(3500);
const h = await page.evaluate(() => document.querySelector('.ds-main').scrollHeight);
await page.setViewportSize({ width: 1440, height: Math.min(h + 40, 16000) });
await page.waitForTimeout(1500);
// Figma knows these families as "Inter" / "JetBrains Mono": alias the same shipped font files under those
// names and point every element at them, so the capture keeps identical metrics with the right Figma fonts.
await page.evaluate(() => {
  const st = document.createElement('style');
  st.textContent = `@font-face{font-family:"Inter";font-weight:100 900;src:url(/InterVariable.woff2) format("woff2")}
@font-face{font-family:"Inter";font-style:italic;font-weight:100 900;src:url(/InterVariable-Italic.woff2) format("woff2")}
@font-face{font-family:"JetBrains Mono";font-weight:400;src:url(/JetBrainsMono-Regular.woff2) format("woff2")}`;
  document.head.appendChild(st);
  for (const el of document.querySelectorAll('.ds-main, .ds-main *')) {
    const f = getComputedStyle(el).fontFamily;
    if (f.includes('InterVariable') || f.includes('JetBrainsMono')) el.style.fontFamily = f.replace('InterVariable', 'Inter').replace('JetBrainsMono', '"JetBrains Mono"');
  }
  document.querySelector('.ds-main').style.background = 'var(--color-window-base)';
});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const script = await (await fetch('https://mcp.figma.com/mcp/html-to-design/capture.js')).text();
await page.evaluate((s) => { const el = document.createElement('script'); el.textContent = s; document.head.appendChild(el); }, script);
await page.waitForTimeout(800);
const r = await page.evaluate(({ captureId, selector }) => window.figma.captureForDesign({ captureId, endpoint: `https://mcp.figma.com/mcp/capture/${captureId}/submit?bindVariables=true`, selector }), { captureId, selector });
console.log(JSON.stringify(r).slice(0, 400));
await page.waitForTimeout(2000);
await browser.close();
