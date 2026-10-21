// Packs the package, installs it with npm, pnpm and yarn into a fresh Vite + React app each, and checks it works there:
// the core exports in Node, then the app in Vite dev and as a production build, in Chrome (a shipped component inside
// the app's React, its events reaching the app, an icon, the theme tokens, the plain runtime, no errors).
// Usage: npm test [-- npm|pnpm|yarn …]
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const managers = process.argv.slice(2).length ? process.argv.slice(2) : ['npm', 'pnpm', 'yarn'];
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'bayrust-install-'));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', env: { ...process.env, npm_config_yes: 'true' } });

console.log('› building and packing');
run('node', ['scripts/build.mjs'], pkg);
const tarball = path.join(work, JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', work], pkg))[0].filename);
console.log(`  ${path.basename(tarball)}, ${(fs.statSync(tarball).size / 1e6).toFixed(1)} MB`);

const INSTALL = {
  npm: (t) => ['npm', ['install', '--no-audit', '--no-fund', t, 'react@19', 'react-dom@19', 'vite@8']],
  pnpm: (t) => ['pnpm', ['add', t, 'react@19', 'react-dom@19', 'vite@8']],
  yarn: (t) => ['npx', ['--yes', 'yarn@1.22.22', 'add', `file:${t}`, 'react@19', 'react-dom@19', 'vite@8']],
};

const APP = {
  'index.html': '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Bayrust test</title></head><body><div id="app"></div><div id="plain-host"></div><script type="module" src="/main.js"></script></body></html>\n',
  'vite.config.js': "import bayrust from '@krackedui/bayrust/vite';\nexport default { plugins: [bayrust()] };\n",
  'main.js': `import '@krackedui/bayrust/css';
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { tokens, classes, iconNames, rootAttributes } from '@krackedui/bayrust';
import { ThemeRoot, Icon, Bayrust } from '@krackedui/bayrust/react';
import { loadBayrust } from '@krackedui/bayrust/components';

function App() {
  const [clicks, setClicks] = useState(0);
  return h(ThemeRoot, { theme: 'dark', id: 'root', style: { padding: 24, background: 'var(--color-window-base)' } },
    h('div', { id: 'island' }, h(Bayrust, { component: 'Button', props: { text: 'Clicked ' + clicks, variant: 'secondary', onClick: () => setClicks((n) => n + 1) } })),
    h(Icon, { name: 'magnifying-glass', id: 'icon' }),
    h('span', { id: 'classed', className: classes['action-button'].button }, 'styled by class'),
    h('output', { id: 'clicks' }, clicks));
}
createRoot(document.getElementById('app')).render(h(App));
const ui = await loadBayrust();
const Toggle = await ui.get('Toggle');
for (const [name, value] of Object.entries(rootAttributes('dark'))) document.getElementById('plain-host').setAttribute(name, value);
ui.render(document.getElementById('plain-host'), ui.h(Toggle, { checked: true, 'aria-label': 'Toggle' }));
window.__counts = { tokens: Object.keys(tokens).length, icons: iconNames.length, components: ui.names.length };
`,
};

const browser = await chromium.launch({ channel: 'chrome' });
async function check(url) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text().slice(0, 200)));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto(url);
  const button = page.locator('#island button');
  await button.waitFor({ timeout: 20000 });
  await button.click();
  await page.waitForFunction(() => document.querySelector('#clicks')?.textContent === '1', null, { timeout: 5000 });
  await page.locator('#plain-host [role=switch]').waitFor({ timeout: 10000 });
  const r = await page.evaluate(async () => {
    const use = document.querySelector('#icon use').getAttribute('href');
    const icon = await fetch(use.split('#')[0]).then((x) => x.text());
    const root = getComputedStyle(document.getElementById('root'));
    return {
      buttonClass: document.querySelector('#island button').className.split(' ')[0],
      buttonText: document.querySelector('#island button').textContent,
      iconOk: icon.includes('<symbol id="s"'),
      windowBase: root.getPropertyValue('--color-window-base').trim(),
      font: root.fontFamily.split(',')[0],
      classedHeight: document.getElementById('classed').getBoundingClientRect().height,
      counts: window.__counts,
    };
  });
  await page.close();
  const ok = r.buttonClass.startsWith('base-button__root') && r.buttonText === 'Clicked 1' && r.iconOk && r.windowBase && r.counts?.components > 300 && !errors.length;
  return { ok, ...r, errors };
}

function serve(cwd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['vite', ...args, '--port', '0', '--strictPort', 'false'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    const onData = (d) => {
      out += d;
      const m = /(http:\/\/localhost:\d+\/)/.exec(out.replace(/\x1b\[[0-9;]*m/g, ''));
      if (m) resolve({ url: m[1], stop: () => p.kill() });
    };
    p.stdout.on('data', onData);
    p.stderr.on('data', onData);
    p.on('exit', (c) => reject(new Error(`vite ${args.join(' ')} exited ${c}: ${out.slice(-400)}`)));
  });
}

let failed = 0;
for (const manager of managers) {
  const dir = path.join(work, manager);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: `bayrust-test-${manager}`, private: true, type: 'module' }));
  for (const [f, s] of Object.entries(APP)) fs.writeFileSync(path.join(dir, f), s);
  console.log(`› ${manager}: install`);
  const [cmd, args] = INSTALL[manager](tarball);
  run(cmd, args, dir);
  const node = JSON.parse(run('node', ['--input-type=module', '-e', "import { tokens, classes, iconNames, rootAttributes } from '@krackedui/bayrust'; import { createRequire } from 'node:module'; const r = createRequire(import.meta.url); console.log(JSON.stringify({ tokens: Object.keys(tokens).length, modules: Object.keys(classes).length, icons: iconNames.length, root: rootAttributes('light').class, css: !!r.resolve('@krackedui/bayrust/css'), icon: !!r.resolve('@krackedui/bayrust/icons/magnifying-glass.svg') }))"], dir));
  console.log(`  node: ${JSON.stringify(node)}`);
  const results = {};
  const dev = await serve(dir, []);
  results.dev = await check(dev.url).finally(dev.stop);
  run('npx', ['vite', 'build', '--logLevel', 'error'], dir);
  const preview = await serve(dir, ['preview']);
  results.build = await check(preview.url).finally(preview.stop);
  for (const [mode, r] of Object.entries(results)) {
    console.log(`  ${mode}: ${r.ok ? 'ok' : 'FAILED'} — button ${r.buttonClass} "${r.buttonText}", icon ${r.iconOk}, --color-window-base ${r.windowBase}, font ${r.font}, ${JSON.stringify(r.counts)}${r.errors.length ? `, errors: ${r.errors.join(' | ')}` : ''}`);
    if (!r.ok) failed++;
  }
}
await browser.close();
console.log(failed ? `${failed} check(s) failed (work dir: ${work})` : `All checks passed with ${managers.join(', ')}.`);
process.exit(failed ? 1 : 0);
