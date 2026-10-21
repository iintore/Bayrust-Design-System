// Answers requests addressed to the native host — from the sandboxed backend and from the UI.
// Values follow what the shipped code reads; machine data comes from native/macos-host (AppKit, read-only).
// Unknown methods answer null and are recorded (GET /__unknown-host) so they can be filled from the code.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const macosHost = (...args) => JSON.parse(execFileSync(path.join(here, 'native/macos-host'), args, { encoding: 'utf8', maxBuffer: 1 << 26 }));
export const installedApps = () => macosHost('apps');

// host-table.mjs is re-imported when it changes, so stubs can be edited without restarting the backend.
let cached = { mtime: 0, table: {} };
async function table() {
  const file = path.join(here, 'host-table.mjs');
  const mtime = fs.statSync(file).mtimeMs;
  if (mtime !== cached.mtime) cached = { mtime, table: (await import(`./host-table.mjs?v=${mtime}`)).table(macosHost, installedApps) };
  return cached.table;
}

export async function hostMock(method, data, unknown) {
  const t = await table();
  if (method in t) { const v = t[method]; return typeof v === 'function' ? v(data) : v; }
  unknown.add(method);
  return null;
}
