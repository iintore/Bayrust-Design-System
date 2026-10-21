// Captures exact component specimens for the docs from three sources in the live Bayrust runtime (Chromium):
//  1. the AI Chat playground (/playground in ai-chat-window): Bayrust's own internal component gallery, with its
//     groups, descriptions, notes and labelled variants
//  2. the main window's internal test views (/debug/menu-test, …)
//  3. component instances inside the captured flow states (research/captures/*/*.json), grouped by CSS module
//     and part, with their size in the window they came from
// Output: research/docs/specimens.json (assets rewritten to /ds/ like docs-capture.mjs).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { rewrite } from './docs-rewrite.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../research/docs');
const captures = path.resolve(here, '../research/captures');
const BASE = 'http://localhost:4317';
const only = process.argv[2]; // playground | debug | live | instances

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ locale: 'en-RW', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' });
const prev = await fs.readFile(path.join(out, 'specimens.json'), 'utf8').then(JSON.parse).catch(() => ({}));
const result = { ...prev };

// The window routers are TanStack routers held in React props; find one by walking the fiber tree.
const routerNavigate = (to) => {
  const el = document.querySelector('[id$="-window-root"]') ?? document.querySelector('[id$="-root"]');
  const key = Object.keys(el).find((k) => k.startsWith('__reactContainer'));
  const stack = [el[key].stateNode?.current ?? el[key]];
  const seen = new Set();
  while (stack.length) {
    const f = stack.pop();
    if (!f || seen.has(f)) continue;
    seen.add(f);
    if (f.memoizedProps?.router?.navigate) return f.memoizedProps.router.navigate({ to }), true;
    if (f.child) stack.push(f.child);
    if (f.sibling) stack.push(f.sibling);
  }
  return false;
};

// ---------------------------------------------------------------- 1. playground
if (!only || only === 'playground') {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ai-chat-window.html`);
  await page.waitForTimeout(5000);
  if (!(await page.evaluate(routerNavigate, '/playground'))) throw new Error('AI Chat router not found');
  await page.waitForSelector('[class*="ai-chat-playground__entryButton"]', { timeout: 20000 });
  const groups = await page.evaluate(() => [...document.querySelectorAll('[class*="ai-chat-playground__entryGroup"]')].map((g) => ({
    group: g.querySelector('[class*="ai-chat-playground__groupHeader"]')?.firstChild?.textContent.trim() ?? g.querySelector('[class*="groupHeader"]').innerText.split('\n')[0],
    items: [...g.querySelectorAll('[class*="ai-chat-playground__entryButton"]')].map((b) => b.innerText.trim()),
  })));
  const entries = [];
  for (const [gi, g] of groups.entries()) {
    for (const [ii, name] of g.items.entries()) {
      await page.evaluate(([gi, ii]) => document.querySelectorAll('[class*="ai-chat-playground__entryGroup"]')[gi].querySelectorAll('[class*="ai-chat-playground__entryButton"]')[ii].click(), [gi, ii]);
      await page.waitForTimeout(1200);
      const e = await page.evaluate(() => {
        const q = (s) => document.querySelector(`[class*="ai-chat-playground__${s}"]`);
        const stage = q('stage');
        const root = stage.firstElementChild ?? stage;
        const marker = (a) => a.querySelector('[class*="playground-annotation__marker"]')?.textContent.trim();
        const content = (a) => a.querySelector('[class*="playground-annotation__content"]')?.textContent.trim();
        const annots = (el) => [...el.querySelectorAll('[class*="playground-annotation__root"]')];
        const box = (els) => { const r = els.map((x) => x.getBoundingClientRect()); return { w: Math.ceil(Math.max(...r.map((b) => b.width))), h: Math.ceil(r.reduce((a, b) => a + b.height, 0)) }; };
        const sectionEls = [...root.querySelectorAll(':scope > section')];
        const sections = (sectionEls.length ? sectionEls : [root]).map((sec) => {
          const title = sec.querySelector(':scope > h2, :scope > h3, :scope > header h2')?.textContent.trim() ?? '';
          const notes = annots(sec).filter((a) => marker(a) === 'Note').map(content);
          const variants = annots(sec).filter((a) => marker(a) === 'Variant').map((a) => {
            const frame = [...a.parentElement.children].filter((c) => c !== a && !c.matches('[class*="playground-annotation__root"]'));
            return { label: content(a), html: frame.map((c) => c.outerHTML).join(''), ...box(frame) };
          });
          if (!variants.length) {
            const c = sec.cloneNode(true);
            c.querySelectorAll(':scope > h2, :scope > h3, [class*="playground-annotation__root"]').forEach((n) => n.remove());
            const kids = [...sec.children].filter((k) => !k.matches('h2, h3, [class*="playground-annotation__root"]'));
            variants.push({ label: '', html: c.innerHTML, ...box(kids.length ? kids : [sec]) });
          }
          // the section as Bayrust lays it out (rows, variations, frames and annotations), without its title
          const whole = sec.cloneNode(true);
          whole.querySelectorAll(':scope > h2, :scope > h3').forEach((n) => n.remove());
          let jsx = '';
          try { jsx = window.__toJSX(sec); } catch {}
          return { title, notes, variants, html: whole.outerHTML, jsx, ...box([sec]) };
        });
        return { eyebrow: q('eyebrow')?.textContent.trim(), title: q('pageTitle')?.textContent.trim(), description: q('pageDescription')?.textContent.trim() ?? '', root: root.className, sections };
      });
      for (const s of e.sections) { s.html = await rewrite(s.html); for (const v of s.variants) v.html = await rewrite(v.html); }
      entries.push({ group: g.group, name, ...e });
      process.stdout.write(`playground ${g.group} › ${name}: ${e.sections.length} sections\n`);
    }
  }
  result.playground = entries;
  await page.close();
}

// ---------------------------------------------------------------- 2. internal test views (main window)
if (!only || only === 'debug') {
  const views = [
    ['menu-test', 'Menu Test', '/debug/menu-test'],
    ['list-items-test', 'List Items Test', '/debug/list-items-test'],
    ['grid-items-test', 'Grid Items Test', '/debug/grid-items-test'],
    ['rich-text-editor-test', 'Rich Text Editor Playground', '/debug/rich-text-editor-test'],
    ['tooltip-test', 'Tooltip Test', '/debug/tooltip-test'],
    ['letter-spacing', 'Letter Spacing', '/debug/letter-spacing'],
  ];
  result.debug = [];
  for (const [id, title, route] of views) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: 750, height: 475 });
    const popups = [];
    page.on('popup', (p) => popups.push(p));
    await page.goto(`${BASE}/main-window.html`);
    await page.waitForTimeout(4000);
    await page.evaluate((to) => window.mainRouter.navigate({ to }), route);
    await page.waitForTimeout(2500);
    if (id === 'tooltip-test') {
      // hover the first coloured square: the tooltip opens as a native child panel
      const sq = await page.evaluate(() => { const el = [...document.querySelectorAll('div')].find((d) => { const r = d.getBoundingClientRect(); return r.width > 40 && r.width < 140 && Math.abs(r.width - r.height) < 2 && getComputedStyle(d).backgroundColor !== 'rgba(0, 0, 0, 0)'; }); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      if (sq) { await page.mouse.move(sq[0], sq[1]); await page.waitForTimeout(1500); }
    }
    const html = await page.evaluate(() => [...document.querySelectorAll('[data-is-base-view-root]')].at(-1)?.outerHTML ?? document.body.innerHTML);
    const shot = path.join(out, 'files', 'shots', `debug-${id}.png`);
    await fs.mkdir(path.dirname(shot), { recursive: true });
    await page.screenshot({ path: shot });
    const panels = [];
    for (const p of popups) panels.push({ url: p.url(), html: await rewrite(await p.evaluate(() => document.body.innerHTML).catch(() => '')) });
    result.debug.push({ id, title, route, html: await rewrite(html), shot: `/ds/shots/debug-${id}.png`, panels });
    process.stdout.write(`debug ${id}: ${html.length} chars, ${panels.length} panels\n`);
    await page.close();
  }
}

// ---------------------------------------------------------------- 2b. live interactions (dialogs, pickers)
if (!only || only === 'live') {
  // Each: open a window, act, then keep the element(s) and any native child panels (window.open) it opened.
  const LIVE = [
    { id: 'theme-editor', title: 'Theme Studio editor', url: '/theme-studio-window.html', viewport: [1370, 570],
      act: async (p) => { await p.getByText('Duplicate Theme', { exact: true }).click(); await p.waitForTimeout(2000); },
      select: '[class*="theme-studio-window-view__"][class*="ditor"], [class*="theme-studio-window-view__sidebarRight"], [class*="theme-studio-window-view__right"]' },
    { id: 'color-picker', title: 'Colour picker', url: '/theme-studio-window.html', viewport: [1370, 570],
      act: async (p) => { await p.getByText('Duplicate Theme', { exact: true }).click(); await p.waitForTimeout(2000); await p.getByText('Red', { exact: true }).last().click(); await p.waitForTimeout(2000); } },
    { id: 'new-project-dialog', title: 'New Project dialog', url: '/ai-chat-window.html', viewport: [750, 600],
      act: async (p) => { await p.locator('[aria-label="New Project"]').first().click(); await p.waitForTimeout(2500); }, select: '[role="dialog"], [class*="dialog-primitive__"]' },
    // main window views reached through commands and internal routes (the last base view is the open one)
    { id: 'focus-form', title: 'Start Focus Session', url: '/main-window.html', viewport: [750, 475], last: true,
      act: async (p) => { await p.keyboard.type('start focus session', { delay: 20 }); await p.waitForTimeout(1200); await p.keyboard.press('Enter'); await p.waitForTimeout(2500); }, select: '[data-is-base-view-root]' },
    { id: 'focus-duration', title: 'Duration picker', url: '/main-window.html', viewport: [750, 475],
      act: async (p) => { await p.keyboard.type('start focus session', { delay: 20 }); await p.waitForTimeout(1200); await p.keyboard.press('Enter'); await p.waitForTimeout(2500); await p.getByText('No Limit', { exact: true }).last().click(); await p.waitForTimeout(2000); } },
    { id: 'focus-block', title: 'Block apps and websites', url: '/main-window.html', viewport: [750, 475],
      act: async (p) => { await p.keyboard.type('start focus session', { delay: 20 }); await p.waitForTimeout(1200); await p.keyboard.press('Enter'); await p.waitForTimeout(2500); await p.locator('[placeholder="What apps or websites do you want to block?"]').last().click(); await p.waitForTimeout(2000); } },
    { id: 'legacy-password', title: 'Legacy Database Password', url: '/main-window.html', viewport: [750, 475], last: true,
      act: async (p) => { await p.evaluate(() => window.mainRouter.navigate({ to: '/debug/legacy-database-password' })); await p.waitForTimeout(2500); }, select: '[data-is-base-view-root]' },
    { id: 'error-view', title: 'Something went wrong', url: '/main-window.html', viewport: [750, 475], last: true,
      act: async (p) => { await p.evaluate(() => window.mainRouter.navigate({ to: '/debug/emit-sentry-frontend-error-in-react-render' })); await p.waitForTimeout(2500); }, select: '[data-is-base-view-root]' },
    { id: 'ai-commands', title: 'Search AI Commands', url: '/main-window.html', viewport: [750, 475], last: true,
      act: async (p) => { await p.keyboard.type('search ai commands', { delay: 20 }); await p.waitForTimeout(1200); await p.keyboard.press('Enter'); await p.waitForTimeout(3000); }, select: '[data-is-base-view-root]' },
    { id: 'dictation-activity', title: 'Dictation activity', url: '/settings-window.html', viewport: [800, 786],
      act: async (p) => { await p.getByText('Dictation', { exact: true }).first().click(); await p.waitForTimeout(2000); await p.getByText('Activity', { exact: true }).first().click(); await p.waitForTimeout(1500); },
      select: '[class*="dictation-activity-graph__root"]' },
    { id: 'chat-settings-menu', title: 'Chat settings menu', url: '/ai-chat-window.html', viewport: [750, 600],
      act: async (p) => { await p.locator('[aria-label="Open Chat Settings"]').first().click(); await p.waitForTimeout(2500); }, select: '[class*="popover__popover"], [class*="menu__root"], [role="dialog"], [role="menu"]' },
  ];
  result.live = [];
  for (const l of LIVE) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: l.viewport[0], height: l.viewport[1] });
    const popups = [];
    page.on('popup', (p) => popups.push(p));
    await page.goto(`${BASE}${l.url}`);
    await page.waitForTimeout(4500);
    let err = null;
    try { await l.act(page); } catch (e) { err = String(e).split('\n')[0]; }
    const els = l.select ? await page.evaluate(([sel, last]) => {
      let found = [...document.querySelectorAll(sel)].filter((e, i, a) => !a.some((o) => o !== e && o.contains(e)));
      // the open view: the last one that is laid out (views underneath in the navigation stack are not)
      // (the open base view is display: contents, the ones underneath display: none; a view fills the window)
      if (last) found = found.filter((e) => getComputedStyle(e).display !== 'none').slice(-1);
      return found.map((e) => { const r = e.getBoundingClientRect(); const view = getComputedStyle(e).display === 'contents';
        return { html: e.outerHTML, w: view ? innerWidth : Math.ceil(r.width), h: view ? innerHeight : Math.ceil(r.height), window: document.querySelector('[id$="-window-root"]')?.id ?? null }; });
    }, [l.select, !!l.last]) : [];
    const panels = [];
    await new Promise((r) => setTimeout(r, 800));
    for (const p of popups) {
      // panels that closed themselves (tooltips, transient menus) are skipped
      if (p.isClosed()) continue;
      const b = await p.evaluate(() => { const root = document.querySelector('#native-view-root') ?? document.body; const r = root.firstElementChild?.getBoundingClientRect?.() ?? root.getBoundingClientRect(); return { html: root.innerHTML, w: Math.ceil(r.width), h: Math.ceil(r.height) }; }).catch(() => null);
      if (b) panels.push({ url: p.url(), ...b, html: await rewrite(b.html) });
    }
    for (const e of els) e.html = await rewrite(e.html);
    const shot = path.join(out, 'files', 'shots', `live-${l.id}.png`);
    await page.screenshot({ path: shot }).catch(() => undefined);
    result.live.push({ id: l.id, title: l.title, url: l.url, error: err, elements: els, panels, shot: `/ds/shots/live-${l.id}.png` });
    process.stdout.write(`live ${l.id}: ${els.length} elements, ${panels.length} panels${err ? ' · ' + err : ''}\n`);
    await page.close();
  }
}

// ---------------------------------------------------------------- 3. instances in captured states
if (!only || only === 'instances') {
  const MODULES = (await fs.readFile(path.join(here, 'states/docs-modules.txt'), 'utf8')).split(/\s+/).filter(Boolean);
  const stateFiles = [];
  for (const flow of await fs.readdir(captures)) {
    const dir = path.join(captures, flow);
    if (!(await fs.stat(dir)).isDirectory()) continue;
    for (const f of await fs.readdir(dir)) if (f.endsWith('.json') && f !== 'index.json') stateFiles.push(path.join(dir, f));
  }
  const instances = {};
  const page = await ctx.newPage();
  for (const file of stateFiles.sort()) {
    const snap = JSON.parse(await fs.readFile(file, 'utf8'));
    const parent = file.includes('--') ? JSON.parse(await fs.readFile(file.replace(/--[^/]+\.json$/, '.json'), 'utf8')) : snap;
    if (!parent.url || !snap.html) continue;
    const vp = snap.size ? { width: snap.size.w, height: snap.size.h } : parent.viewport ?? { width: 750, height: 475 };
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(parent.url.startsWith("http") ? parent.url : `${BASE}${parent.url}`);
    await page.waitForTimeout(2500);
    // Replace the live DOM with the captured one (static), on the window's own stylesheets and root attributes.
    await page.evaluate(([html, attrs]) => {
      document.body.outerHTML = html.trim().startsWith('<body') ? html : `<body>${html}</body>`;
      for (const [k, v] of Object.entries(attrs ?? {})) document.documentElement.setAttribute(k, v);
    }, [snap.html, parent.htmlAttributes]);
    await page.waitForTimeout(400);
    const found = await page.evaluate((mods) => {
      const res = [];
      for (const m of mods) {
        const re = new RegExp(`^${m}__([A-Za-z0-9]+)_[0-9a-f]{5}$`);
        const own = (el) => [...el.classList].map((c) => re.exec(c)).find(Boolean);
        const all = [...document.querySelectorAll(`[class*="${m}__"]`)].filter((el) => own(el));
        // outermost element of each instance of each part (a list's root and its items are both kept)
        const tops = all.filter((el) => !all.some((o) => o !== el && o.contains(el) && own(o)[1] === own(el)[1]));
        for (const el of tops) {
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          // only what was visible in the app (an inactive tab's content keeps its box but isn't shown)
          if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
          const sig = [...el.attributes].filter((a) => a.name.startsWith('data-') && !/draggable|selectable|testid|key|index|id$/.test(a.name)).map((a) => `${a.name}=${a.value}`).sort().join(' ');
          // what the element inherits or is laid out by in its window, so a preview can give it the same context
          const pcs = getComputedStyle(el.parentElement ?? el);
          const ctx = { display: pcs.display, flexDirection: pcs.flexDirection, alignItems: pcs.alignItems, fontSize: pcs.fontSize, lineHeight: pcs.lineHeight,
            fontWeight: pcs.fontWeight, letterSpacing: pcs.letterSpacing, color: pcs.color, zoom: getComputedStyle(el).getPropertyValue('--zoom').trim() || '1' };
          // the window it is in (root-level :has(#…-window-root) rules) and the window's size (media queries)
          ctx.window = document.querySelector('[id$="-window-root"]')?.id ?? null;
          ctx.vw = innerWidth; ctx.vh = innerHeight;
          // its margins: the frame holds the margin box, so flex layout doesn't shrink it to fit them
          const ecs0 = getComputedStyle(el);
          ctx.margin = ['Top', 'Right', 'Bottom', 'Left'].map((sd) => parseFloat(ecs0['margin' + sd]) || 0);
          // the parent's content box: the space the element was laid out in
          const par = el.parentElement ?? el;
          ctx.pw = Math.round((par.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight)) * 100) / 100;
          ctx.ph = Math.round((par.clientHeight - parseFloat(pcs.paddingTop) - parseFloat(pcs.paddingBottom)) * 100) / 100;
          Object.assign(ctx, { gridTemplateColumns: pcs.gridTemplateColumns, gridTemplateRows: pcs.gridTemplateRows, gap: pcs.gap, justifyItems: pcs.justifyItems, justifyContent: pcs.justifyContent });
          // window-scoped variables the element reads (set on :root:has(#…-window-root) in the app)
          const ecs = getComputedStyle(el);
          ctx.vars = Object.fromEntries(['--window-header-height', '--window-footer-height', '--main-window-header-height', '--main-window-footer-height'].map((v) => [v, ecs.getPropertyValue(v).trim()]).filter(([, v]) => v));
          // the ancestor chain (tag, classes, data-* and custom properties), outermost first, for descendant selectors
          const chain = [];
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const attrs = [...a.attributes].filter((x) => x.name === 'class' || x.name.startsWith('data-') || x.name === 'id').map((x) => `${x.name}="${x.value.replace(/"/g, '&quot;')}"`);
            const vars = (a.getAttribute('style') ?? '').split(';').filter((d) => d.trim().startsWith('--')).join(';');
            chain.unshift(`<${a.tagName.toLowerCase()} ${attrs.join(' ')} style="display:contents;${vars.replace(/"/g, '&quot;')}">`);
          }
          ctx.chain = chain;
          // CSS zoom and transforms on ancestors (e.g. the scaled previews in the Pro walkthrough)
          let cz = 1;
          for (let a = el.parentElement; a; a = a.parentElement) cz *= parseFloat(getComputedStyle(a).zoom) || 1;
          ctx.cssZoom = Math.round(cz * 1000) / 1000;
          ctx.scale = el.offsetWidth ? Math.round((r.width / el.offsetWidth / cz) * 1000) / 1000 : 1;
          res.push({ module: m, part: own(el)[1], sig, html: el.outerHTML, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, ctx });
        }
      }
      return res;
    }, MODULES);
    const state = path.relative(captures, file).replace(/\.json$/, '');
    for (const f of found) {
      if (f.html.length > 120000) continue;
      const key = `${f.module}/${f.part}`;
      const list = (instances[key] ??= []);
      // keep up to 4 distinct variants (data-* signature), preferring the smallest markup of each
      const same = list.find((x) => x.sig === f.sig);
      if (same) { if (f.html.length < same.html.length) Object.assign(same, { ...f, state }); continue; }
      if (list.length < 4) list.push({ ...f, state });
    }
    process.stdout.write(`instances ${state}: ${found.length}\n`);
  }
  for (const list of Object.values(instances)) for (const x of list) x.html = await rewrite(x.html);
  result.instances = instances;
  await page.close();
}

await browser.close();
await fs.writeFile(path.join(out, 'specimens.json'), JSON.stringify(result, null, 1));
console.log('playground', result.playground?.length, 'debug', result.debug?.length, 'instance groups', Object.keys(result.instances ?? {}).length);
