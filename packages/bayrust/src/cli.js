#!/usr/bin/env node
// npx bayrust copy <dir>: copies the files the components and icons load at runtime (runtime/, icons/) into a folder
// your site serves, e.g. public/bayrust for Next.js. Then the default assets base, /bayrust/, finds them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [command, target] = process.argv.slice(2);
if (command !== 'copy' || !target) {
  console.log('Usage: bayrust copy <dir>   (e.g. bayrust copy public/bayrust)');
  process.exit(command ? 1 : 0);
}
for (const d of ['runtime', 'icons']) fs.cpSync(path.join(here, d), path.resolve(target, d), { recursive: true });
console.log(`Copied runtime/ and icons/ to ${path.resolve(target)}`);
