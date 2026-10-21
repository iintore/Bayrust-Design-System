// Serves Raycast's shipped frontend unchanged, injecting shim.js (host bridge stub) into each HTML page.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import { hostMock } from './host-mocks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../reference/frontend');
const port = Number(process.env.PORT || 4317);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wasm': 'application/wasm' };
const ipcLog = [];
const unknownHost = new Set();
let spriteSource;
const backend = process.env.NO_BACKEND ? null : await import('./backend.mjs');
const sseClients = new Set();
backend?.onNotification((method, data) => { const msg = `data: ${JSON.stringify({ method, data })}\n\n`; for (const res of sseClients) res.write(msg); });

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__ipc-log') {
    if (req.method === 'POST') { let b = ''; req.on('data', c => b += c); req.on('end', () => { ipcLog.push(...JSON.parse(b)); res.end('ok'); }); return; }
    res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify(ipcLog));
  }
  if (url.pathname === '/__backend' && backend) {
    let b = ''; req.on('data', c => b += c);
    req.on('end', async () => {
      const { method, data } = JSON.parse(b);
      try { const v = await backend.backendRequest(method, data); res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(v ?? null)); }
      catch (e) { res.statusCode = 500; res.end(String(e.message || e)); }
    });
    return;
  }
  if (url.pathname === '/__backend-events' && backend) {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store' });
    sseClients.add(res); req.on('close', () => sseClients.delete(res)); return;
  }
  if (url.pathname === '/__host') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', async () => {
      const { method, data } = JSON.parse(b);
      try { const v = await hostMock(method, data, unknownHost); res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(v ?? null)); }
      catch (e) { res.statusCode = 500; res.end(String(e.message || e)); }
    });
    return;
  }
  // ipc://image|file-preview?path=…&width=…&height=… → system icon or image, rendered by native/macos-host.
  if (url.pathname === '/__ipc/image' || url.pathname === '/__ipc/file-preview') {
    const p = url.searchParams.get('path'); const px = Math.max(Number(url.searchParams.get('width') || 64), Number(url.searchParams.get('height') || 64));
    if (!p) { res.statusCode = 400; return res.end(); }
    const out = path.join(here, 'cache', crypto.createHash('sha1').update(p + px).digest('hex') + '.png');
    const send = () => fs.readFile(out, (e, buf) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', 'image/png'); res.end(buf); });
    if (fs.existsSync(out)) return send();
    fs.mkdirSync(path.dirname(out), { recursive: true });
    return execFile(path.join(here, 'native/macos-host'), ['icon', p, String(px), out], send);
  }
  // ipc://raycast-sprite/<name>#s → that symbol from the shipped sprite, wrapped as id "s" (what the UI references).
  if (url.pathname.startsWith('/__ipc/raycast-sprite/')) {
    const name = decodeURIComponent(url.pathname.split('/').pop());
    const sprite = spriteSource ??= fs.readFileSync(path.join(root, fs.readdirSync(root).find(f => /^icons-.*\.svg$/.test(f))), 'utf8');
    const m = sprite.match(new RegExp(`<symbol id="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"( [^>]*)>([\\s\\S]*?)</symbol>`));
    if (!m) { res.statusCode = 404; return res.end(); }
    res.setHeader('content-type', 'image/svg+xml');
    return res.end(`<svg xmlns="http://www.w3.org/2000/svg"><symbol id="s"${m[1]}>${m[2]}</symbol></svg>`);
  }
  if (url.pathname === '/__unknown-host') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ fromBackend: [...(backend?.unknownHostMethods || [])], fromUi: [...unknownHost] })); }
  const dsRoot = path.resolve(here, '../design-system');
  if (url.pathname === '/ds' ) { res.statusCode = 302; res.setHeader('location', '/ds/'); return res.end(); }
  let file = url.pathname.startsWith('/ds/') ? path.join(dsRoot, 'site', decodeURIComponent(url.pathname.slice(4)) || 'index.html')
    : url.pathname.startsWith('/ds-data/') ? path.join(dsRoot, '..', decodeURIComponent(url.pathname.slice(9)))
    : url.pathname === '/__shim.js' ? path.join(here, 'shim.js')
    : url.pathname.startsWith('/__mocks/') ? path.join(here, url.pathname.slice(9))
    : path.join(root, decodeURIComponent(url.pathname));
  if (url.pathname.endsWith('/ds/')) file = path.join(dsRoot, 'site/index.html');
  if (!file.startsWith(root) && !file.startsWith(here) && !file.startsWith(dsRoot) && !file.startsWith(path.resolve(here, '../research')) && !file.startsWith(path.resolve(here, '../reference'))) { res.statusCode = 403; return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end('not found'); }
    const ext = path.extname(file);
    res.setHeader('content-type', types[ext] || 'application/octet-stream');
    res.setHeader('cache-control', 'no-store');
    if (ext === '.js' && /\.worker-/.test(file)) buf = Buffer.concat([Buffer.from(`{const f=self.fetch;self.fetch=(u,o)=>f(typeof u==='string'&&u.startsWith('ipc://')?'/__ipc/'+u.slice(6):u,o);}\n`), buf]);
    if (ext === '.html') buf = Buffer.from(buf.toString().replace('<head>', '<head>\n    <script src="/__shim.js"></script><script src="/__mocks/mocks.js"></script><script src="/__mocks/brand.js"></script><script src="/__mocks/specimen-tools.js"></script><script type="module" src="/__mocks/keyboard-layout-abc.js"></script>'));
    res.end(buf);
  });
}).listen(port, () => console.log(`harness ready on http://localhost:${port}`));
