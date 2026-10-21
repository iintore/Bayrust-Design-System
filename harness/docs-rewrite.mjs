// Shared by the docs capture scripts: rewrites asset references in captured markup to static paths
// under /ds/ and saves the app icons the host served (ipc://image) as PNGs.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = path.resolve(here, '../research/docs/files');
await fs.mkdir(path.join(files, 'appicons'), { recursive: true });
const BASE = 'http://localhost:4317';

export const appIcons = new Map();
export async function rewrite(html) {
  // ipc://image (app icons served by the host) → saved PNGs
  for (const m of html.matchAll(/\/__ipc\/(?:image|file-preview)\?[^"' )]+/g)) {
    const url = m[0].replace(/&amp;/g, '&');
    if (!appIcons.has(url)) {
      const name = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12) + '.png';
      const res = await fetch(BASE + url);
      if (res.ok) { await fs.writeFile(path.join(files, 'appicons', name), Buffer.from(await res.arrayBuffer())); appIcons.set(url, `/ds/appicons/${name}`); }
      else appIcons.set(url, '');
    }
  }
  return html
    .replace(/\/__ipc\/(?:image|file-preview)\?[^"' )]+/g, (u) => appIcons.get(u.replace(/&amp;/g, '&')) || u)
    .replace(/\/__ipc\/raycast-sprite\/([^"'#)]+)#s/g, '/ds/sprite/$1.svg#s')
    .replace(/(src|href)="\/(?!ds\/)([^"/]+\.(?:png|svg|jpg|webp|mp4))"/g, '$1="/ds/assets/$2"')
    .replace(/url\(&quot;\/(?!ds\/)([^&]+?\.(?:png|svg|jpg|webp))&quot;\)/g, 'url(&quot;/ds/assets/$1&quot;)');
}
