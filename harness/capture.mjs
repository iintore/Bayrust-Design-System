// Captures states of the shipped Bayrust frontend (served by server.mjs) at native window size @2x.
// For each state: PNG, rendered DOM, computed CSS custom properties, IPC methods used, and an
// icon-extraction capture produced by tools/web-icon-extraction-workflow/workflow/capture.js (unmodified).
// Usage: node capture.mjs states/onboarding.json
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '..');
const spec = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const base = process.env.HARNESS_URL || 'http://localhost:4317';
const outDir = path.join(project, 'research/captures', spec.name);
const iconRunDir = path.join(project, 'research/icon-runs', spec.name);
await fs.mkdir(outDir, { recursive: true });

// Load capture.js exactly as shipped by the workflow repo.
const captureSrc = await fs.readFile(path.join(project, 'tools/web-icon-extraction-workflow/workflow/capture.js'), 'utf8');
const ctx = vm.createContext({ console, import: (m) => import(m) });
vm.runInContext(captureSrc.replace(/await import\(/g, 'await globalThis.import(') + '\nglobalThis.createIconCapture = createIconCapture;', ctx);

const browser = await chromium.launch({ channel: 'chrome', headless: true });

const only = process.argv[3] ? new RegExp(process.argv[3]) : null;
for (const state of spec.states.filter(s => !only || only.test(s.id))) {
  const viewport = state.viewport || spec.viewport;
  const context = await browser.newContext({ locale: 'en-RW', viewport, deviceScaleFactor: 2, colorScheme: state.colorScheme || 'dark' });
  const page = await context.newPage();
  // pageAssets adapter: records image/stylesheet responses the page actually loaded.
  const assetDir = path.join(outDir, '.assets');
  await fs.mkdir(assetDir, { recursive: true });
  const seen = []; const failures = [];
  page.on('response', async (res) => {
    const type = res.request().resourceType();
    const kind = type === 'image' ? 'image' : type === 'stylesheet' ? 'stylesheet' : null;
    if (!kind) return;
    try {
      const body = await res.body();
      const file = path.join(assetDir, crypto.createHash('sha1').update(res.url()).digest('hex'));
      await fs.writeFile(file, body);
      seen.push({ kind, url: res.url(), name: path.basename(new URL(res.url()).pathname), contentType: res.headers()['content-type'], path: file });
    } catch (e) { failures.push({ url: res.url(), reason: String(e) }); }
  });
  page.on('requestfailed', (req) => { if (!req.url().startsWith('data:')) failures.push({ url: req.url(), reason: req.failure()?.errorText || 'failed' }); });
  const tab = {
    playwright: page,
    capabilities: { get: async () => ({
      list: async () => ({ id: 'inv-' + Date.now() }),
      bundle: async ({ kinds }) => ({ assets: seen.filter(a => kinds.includes(a.kind)), failures: [...failures] }),
    }) },
  };
  await page.goto(base + state.url, { waitUntil: 'load' });
  await page.waitForTimeout(state.wait ?? 2500);
  // Native child windows (action panel, menus, popovers) open via window.open(); the host sizes them to
  // #native-view-root. Capture them the same way, as separate images.
  const popups = [];
  page.on('popup', (pop) => popups.push(pop));
  for (const step of state.actions || []) {
    if (step.type) await page.keyboard.type(step.type, { delay: 40 });
    if (step.press) await page.keyboard.press(step.press);
    if (step.click) await page.getByText(step.click, { exact: true }).first().click({ timeout: 5000 }).catch(() => console.warn('click not found:', step.click));
    if (step.eval) await page.evaluate(step.eval);
    await page.waitForTimeout(step.wait ?? 1200);
  }
  const id = state.id;
  await page.screenshot({ path: path.join(outDir, `${id}.png`) });
  for (const [i, pop] of popups.entries()) {
    await pop.waitForTimeout(800);
    const r = await pop.evaluate(() => { const e = document.getElementById('native-view-root'); const b = e?.getBoundingClientRect(); return b && { w: Math.ceil(b.width), h: Math.ceil(b.height), feature: new URL(location.href).searchParams.get('feature') }; });
    if (!r || !r.w) continue;
    await pop.setViewportSize({ width: r.w, height: r.h });
    await pop.waitForTimeout(400);
    await pop.screenshot({ path: path.join(outDir, `${id}--${r.feature || 'popup'}${i ? '-' + i : ''}.png`) });
    await fs.writeFile(path.join(outDir, `${id}--${r.feature || 'popup'}${i ? '-' + i : ''}.json`), JSON.stringify({ feature: r.feature, size: r, url: pop.url(), html: await pop.evaluate(() => document.body.outerHTML) }, null, 1));
  }
  const snapshot = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const vars = {};
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of rules) if (r.style) for (const p of r.style) if (p.startsWith('--')) vars[p] = cs.getPropertyValue(p).trim();
    }
    for (const p of document.documentElement.style) if (p.startsWith('--')) vars[p] = cs.getPropertyValue(p).trim();
    return {
      url: location.href,
      htmlAttributes: Object.fromEntries([...document.documentElement.attributes].map(a => [a.name, a.value])),
      tokens: vars,
      html: document.body.outerHTML,
      text: document.body.innerText,
      ipc: [...new Set(window.__ipcCalls.filter(c => c.method).map(c => c.method))],
    };
  });
  await fs.writeFile(path.join(outDir, `${id}.json`), JSON.stringify({ id, label: state.label, viewport, ...snapshot }, null, 1));
  const capture = await ctx.createIconCapture(tab, iconRunDir, { run: {
    name: `Bayrust 2.8.2 — ${spec.name}`, entryUrl: base + spec.states[0].url, timezone: 'Africa/Kigali',
    scope: { origin: base, pathPrefix: '/' },
    limitations: ['Shipped frontend served locally with a stubbed native host bridge; host-provided images (ipc://) are unavailable.'],
    notes: ['Source: /Applications/Raycast.app (2.8.2) macos-app_RaycastDesktopApp.bundle/Contents/Resources/frontend'],
  } });
  const r = await capture(state.label, { status: 'rendered state verified', notes: state.notes || '' });
  console.log(id, '→', r);
  await context.close();
}
await browser.close();
// Flow index for the design-system site.
const entries = [];
for (const f of (await fs.readdir(outDir)).filter(f => f.endsWith('.json') && f !== 'index.json' && !f.includes('--')).sort()) {
  const j = JSON.parse(await fs.readFile(path.join(outDir, f), 'utf8'));
  entries.push({ id: j.id, label: j.label, url: j.url, viewport: j.viewport, ipc: j.ipc });
}
await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify(entries, null, 1));
