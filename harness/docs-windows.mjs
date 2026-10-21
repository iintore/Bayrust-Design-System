// Live windows for the docs: every captured flow state as the window's own DOM (body markup, root attributes,
// window size) plus its open native child panels (action panel, menus, popovers) with the frames the native viewer
// gave them. The docs render these with the shipped stylesheets instead of showing screenshots.
// Output: research/docs/windows/<flow>/<state>.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewrite } from './docs-rewrite.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const captures = path.join(root, 'research/captures');
const out = path.join(root, 'research/docs/windows');
const flows = JSON.parse(await fs.readFile(path.join(root, 'design-system/site/flows.json'), 'utf8'));
const readJson = (p) => fs.readFile(p, 'utf8').then(JSON.parse).catch(() => null);

let n = 0;
for (const flow of flows) {
  const spec = (await readJson(path.join(here, 'states', `${flow.id}.json`))) ?? {};
  const chromeOf = (id) => spec.states?.find((x) => x.id === id)?.chrome ?? spec.chrome ?? 'none';
  await fs.mkdir(path.join(out, flow.id), { recursive: true });
  for (const g of flow.groups) {
    for (const st of g.states) {
      const snap = await readJson(path.join(captures, flow.id, `${st.id}.json`));
      if (!snap?.html) continue;
      const vp = st.viewport ?? snap.viewport;
      // native frames of child panels, from the WebKit render
      const frames = (await readJson(path.join(captures, flow.id, 'webkit', `${st.id}--panels.json`))) ?? [];
      const panels = [];
      for (const f of await fs.readdir(path.join(captures, flow.id))) {
        if (!f.startsWith(`${st.id}--`) || !f.endsWith('.json')) continue;
        const p = await readJson(path.join(captures, flow.id, f));
        if (!p?.html) continue;
        const feature = p.feature ?? f.slice(st.id.length + 2, -5);
        const fr = frames.find((x) => x.feature === feature) ?? null;
        const q = new URL(p.url.replace('about:blank', 'http://x/')).searchParams;
        // without a native frame, place it as the host does: at the reference point, on the given side and alignment
        const w = fr?.w ?? p.size?.w ?? 350, h = fr?.h ?? p.size?.h ?? 280;
        const rx = +(q.get('referenceX') ?? 0), ry = +(q.get('referenceY') ?? 0), rw = +(q.get('referenceWidth') ?? 0), rh = +(q.get('referenceHeight') ?? 0);
        const x = fr?.x ?? (q.get('align') === 'end' ? rx + rw - w : q.get('align') === 'center' ? rx + rw / 2 - w / 2 : rx);
        const y = fr?.y ?? (q.get('side') === 'top' ? ry - h : ry + rh);
        panels.push({ feature, x, y, w, h, html: await rewrite(p.html.replace(/^<body[^>]*>|<\/body>$/g, '')) });
      }
      const body = snap.html.trim().replace(/^<body[^>]*>|<\/body>$/g, '');
      await fs.writeFile(path.join(out, flow.id, `${st.id}.json`), JSON.stringify({
        id: st.id, label: st.label, w: vp.width, h: vp.height, chrome: chromeOf(st.id), attrs: snap.htmlAttributes ?? {}, html: await rewrite(body), panels,
      }));
      n++;
    }
  }
}
console.log('windows', n);
