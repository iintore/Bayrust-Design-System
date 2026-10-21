// Crops organisms from native WebKit renders of live app states (native/viewer), using the element's
// bounding box measured inside the same WKWebView. Writes research/organisms/<id>.png + index.json.
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(await fs.readFile(path.join(here, 'states/organisms.json'), 'utf8'));
const out = path.resolve(here, '../research/organisms');
await fs.mkdir(out, { recursive: true });
const index = [];
for (const it of spec.items.filter((i) => !process.argv[2] || new RegExp(process.argv[2]).test(i.id))) { try {
  const steps = [{ wait: 1500 }, ...(it.steps || []), { wait: 800 },
    { print: `(() => { const e = document.querySelector(${JSON.stringify(it.selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return JSON.stringify({ x: r.x, y: r.y, w: r.width, h: r.height, cls: e.className.toString().split(' ').filter(c => c.includes('__')).join(' '), html: e.outerHTML.length }); })()` }];
  const stepsFile = path.join(out, `${it.id}.steps.json`); await fs.writeFile(stepsFile, JSON.stringify(steps));
  const full = path.join(out, `${it.id}--window.png`);
  const { stdout } = await run(path.join(here, 'native/viewer'), [`http://localhost:4317${it.url}`, String(it.viewport[0]), String(it.viewport[1]), full, stepsFile], { timeout: 120000 });
  await fs.rm(stepsFile);
  const line = stdout.split('\n').find((l) => l.startsWith('PRINT: ')); const rect = line && line.slice(7) !== 'nil' ? JSON.parse(line.slice(7)) : null;
  if (!rect) { console.log(it.id, 'selector not found'); continue; }
  await run(path.join(here, '.venv/bin/python'), ['-c', `import sys\nfrom PIL import Image\nm=Image.open(sys.argv[1]); s=m.width/${it.viewport[0]}\nx,y,w,h=[float(v) for v in sys.argv[3:7]]\nm.crop((max(0,round(x*s)),max(0,round(y*s)),min(m.width,round((x+w)*s)),min(m.height,round((y+h)*s)))).save(sys.argv[2])`, full, path.join(out, `${it.id}.png`), String(rect.x), String(rect.y), String(rect.w), String(rect.h)]);
  index.push({ ...it, rect, image: `research/organisms/${it.id}.png`, window: `research/organisms/${it.id}--window.png` });
  console.log(it.id, `${Math.round(rect.w)}×${Math.round(rect.h)}`, rect.cls.slice(0, 80));
  } catch (e) { console.log(it.id, 'failed', String(e.message || e).slice(0, 200)); }
}
const prev = await fs.readFile(path.join(out, 'index.json'), 'utf8').then(JSON.parse).catch(() => []);
const merged = [...prev.filter((p) => !index.some((i) => i.id === p.id)), ...index];
await fs.writeFile(path.join(out, 'index.json'), JSON.stringify(merged, null, 1));
