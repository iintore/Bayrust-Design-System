// Generates site/index.html: a Raycast window bootstrap (the shipped settings-window entry, so theme and
// stores are initialized by Raycast's own code) + every shipped stylesheet + the design-system app.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const fe = path.resolve(here, '../reference/frontend');
const settings = fs.readFileSync(path.join(fe, 'settings-window.html'), 'utf8');
const head = settings.match(/<head>([\s\S]*)<\/head>/)[1].replace(/(href|src)="\.\//g, '$1="/');
// Stylesheet order: as linked by the window entries (globals first), then any remaining shipped CSS.
const ordered = [];
for (const page of ['main-window.html', 'settings-window.html', 'ai-chat-window.html', 'notes-window.html', 'theme-studio-window.html', 'welcome-window.html', 'pro-walkthrough-window.html', 'feedback-window.html']) {
  for (const m of fs.readFileSync(path.join(fe, page), 'utf8').matchAll(/rel="stylesheet"[^>]*href="\.\/([^"]+)"/g)) if (!ordered.includes(m[1])) ordered.push(m[1]);
}
for (const f of fs.readdirSync(fe).filter(f => f.endsWith('.css')).sort()) if (!ordered.includes(f)) ordered.push(f);
const links = ordered.map(f => `    <link rel="stylesheet" href="/${f}">`).join('\n');
fs.writeFileSync(path.join(here, 'site/index.html'), `<!doctype html>
<html lang="en">
  <head>${head.replace('<title>Raycast</title>', '<title>Bayrust Design System</title>')}
${links}
    <link rel="stylesheet" href="/ds/ds.css">
    <script type="module" src="/ds/boot.js"></script>
  </head>
  <body>
    <div id="settings-window-root" class="window-root" hidden></div>
    <div id="ds-root"></div>
  </body>
</html>
`);
console.log('stylesheets:', ordered.length);
