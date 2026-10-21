// Re-renders the states in a states/*.json file with native/viewer (WKWebView in an NSGlassEffectView window —
// Raycast's own engine and materials) and composites native child panels at their computed frames.
// Usage: node capture-native.mjs states/onboarding.json [idRegex]
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const only = process.argv[3] ? new RegExp(process.argv[3]) : null;
const outDir = path.resolve(here, '../research/captures', spec.name, 'webkit');
await fs.mkdir(outDir, { recursive: true });
const KEY = { Enter: 'return', Tab: 'tab', Escape: 'escape', ArrowDown: 'down', ArrowUp: 'up' };
for (const state of spec.states.filter((s) => !only || only.test(s.id))) {
  const vp = state.viewport || spec.viewport;
  const steps = [{ wait: Math.max(0, (state.wait ?? 2500) - 3000) }];
  for (const a of state.actions || []) {
    if (a.type) steps.push({ keys: a.type });
    if (a.press) { const [mods, k] = a.press.includes('+') ? [a.press.split('+').slice(0, -1).map((m) => ({ Meta: 'cmd', Shift: 'shift', Alt: 'alt' })[m]), a.press.split('+').pop()] : [[], a.press]; steps.push({ key: KEY[k] || k.toLowerCase(), mods }); }
    // Scripted click on the element whose own text is exactly the label. (Routers that need trusted input,
    // e.g. the Settings Account link, don't respond; those states keep their Chromium capture.)
    if (a.click) steps.push({ js: `(() => { const t = ${JSON.stringify(a.click)}; const el = [...document.querySelectorAll('body *')].find(e => e.children.length === 0 && e.textContent.trim() === t); (el?.closest('button,a,[role=button],[role=link],[role=option],li') || el)?.click(); })()` });
    if (a.eval) steps.push({ js: a.eval });
    steps.push({ wait: a.wait ?? 1200 });
  }
  const stepsFile = path.join(outDir, `${state.id}.steps.json`);
  await fs.writeFile(stepsFile, JSON.stringify(steps));
  const out = path.join(outDir, `${state.id}.png`);
  await run(path.join(here, 'native/viewer'), [`http://localhost:4317${state.url}`, String(vp.width), String(vp.height), out, stepsFile], { timeout: 120000, env: { ...process.env, VIEWER_CHROME: state.chrome || spec.chrome || 'none' } });
  await fs.rm(stepsFile);
  // Composite child panels (action panel, menus) over the window at their frames.
  const panels = await fs.readFile(out.replace('.png', '--panels.json'), 'utf8').then(JSON.parse).catch(() => []);
  if (panels.length) await run(path.join(here, '.venv/bin/python'), ['-c', `
import json,sys
from PIL import Image
m=Image.open(sys.argv[1]).convert('RGBA'); sc=m.width/${vp.width}
ps=json.load(open(sys.argv[2]))
ims=[(Image.open(sys.argv[3]+'/'+p['file']).convert('RGBA'),round(p['x']*sc),round(p['y']*sc)) for p in ps]
x0=min([0]+[x for _,x,_ in ims]); y0=min([0]+[y for _,_,y in ims])
x1=max([m.width]+[x+i.width for i,x,_ in ims]); y1=max([m.height]+[y+i.height for i,_,y in ims])
c=Image.new('RGBA',(x1-x0,y1-y0),(0,0,0,0)); c.alpha_composite(m,(-x0,-y0))
for i,x,y in ims: c.alpha_composite(i,(x-x0,y-y0))
c.save(sys.argv[1].replace('.png','--composite.png'))`, out, out.replace('.png', '--panels.json'), outDir]);
  console.log(state.id, panels.length ? `+${panels.length} panel(s)` : '');
}
