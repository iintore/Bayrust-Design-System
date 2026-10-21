// Vite plugin: serves the package's runtime/ and icons/ at /bayrust/ in dev and copies them into the build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SERVED = ['runtime', 'icons'];
const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm', '.lottie': 'application/zip', '.wasm': 'application/wasm' };

export default function bayrust({ base = '/bayrust/' } = {}) {
  const prefix = base.endsWith('/') ? base : `${base}/`;
  let outDir = 'dist';
  return {
    name: 'bayrust',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        if (!url.startsWith(prefix)) return next();
        const file = path.resolve(here, url.slice(prefix.length));
        const inside = SERVED.some((d) => file.startsWith(path.join(here, d) + path.sep));
        if (!inside || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
        res.setHeader('content-type', TYPES[path.extname(file)] ?? 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
    // builds only (closeBundle also runs when the dev server stops)
    writeBundle() {
      for (const d of SERVED) fs.cpSync(path.join(here, d), path.join(outDir, prefix, d), { recursive: true });
    },
  };
}
