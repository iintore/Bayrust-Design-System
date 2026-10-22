// Runs a sandboxed copy of Bayrust's shipped backend (HOME = harness/sandbox-home) over its stdio protocol.
// Browser IPC requests addressed to "backend" are forwarded here; the backend's own requests to "host"
// are answered from host-mocks.mjs. Never touches the user's real Bayrust data.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { hostMock, installedApps } from './host-mocks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendDir = '/Applications/Raycast.app/Contents/Resources/macos-app_RaycastDesktopApp.bundle/Contents/Resources/backend';
const node = path.join(here, 'runtime/node-v22.23.3-darwin-arm64/bin/node');
const home = path.join(here, 'sandbox-home');
const logFile = path.join(here, 'logs/backend.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });
for (const d of ['tmp', 'Library/Application Support/com.raycast.macos', 'Library/Caches/com.raycast.macos', 'Library/Logs/Raycast']) fs.mkdirSync(path.join(home, d), { recursive: true });
const log = (...a) => fs.appendFileSync(logFile, a.join(' ') + '\n');

const pending = new Map();
const listeners = new Set();
export const onNotification = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const unknownHostMethods = new Set();

const child = spawn(node, [path.join(backendDir, 'index.mjs')], {
  cwd: backendDir, stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    PATH: process.env.PATH, HOME: home, TMPDIR: path.join(home, 'tmp'),
    RAYCAST_API_ENVIRONMENT: 'Production', RAYCAST_BUNDLE_ID: 'com.raycast.macos', RAYCAST_VERSION: '2.8.2',
    RAYCAST_APPLICATION_PATH: '/Applications/Raycast.app', RAYCAST_OS_NAME: 'macOS', RAYCAST_OS_VERSION: '27.0.1',
    RAYCAST_OS_ARCH: 'arm64', RAYCAST_OS_IDENTIFIER: 'macos',
    RAYCAST_SUPPORT_DIR: path.join(home, 'Library/Application Support/com.raycast.macos'),
    RAYCAST_CACHE_DIR: path.join(home, 'Library/Caches/com.raycast.macos'),
    RAYCAST_LOGS_DIR: path.join(home, 'Library/Logs/Raycast'),
    RAYCAST_PID_FILE_PATH: path.join(home, 'backend.pid'),
    RAYCAST_UPDATE_LOG_FILE_PATH: path.join(home, 'Library/Logs/Raycast/update.log'),
    RAYCAST_LOCALE_DECIMAL_SEPARATOR: '.', RAYCAST_LOCALE_GROUPING_SEPARATOR: ',', RAYCAST_SENTRY: 'false',
  },
});
const send = (msg) => child.stdin.write(JSON.stringify(msg) + '\n');
send({ type: 'initialize', databaseKey: 'a'.repeat(64), signatureSecret: 'harness', releaseApiToken: '', posthogApiKey: '' });

let buf = Buffer.alloc(0);
child.stdout.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  let i;
  while ((i = buf.indexOf(10)) >= 0) {
    const line = buf.subarray(0, i); buf = buf.subarray(i + 1);
    if (line.length) try { handleLine(line); } catch (e) { log('PARSE', String(e), line.subarray(0,2).toString('hex'), line.subarray(-30).toString('hex'), line.toString().slice(0, 200)); }
  }
});
child.stderr.on('data', (d) => log('STDERR', String(d)));
child.on('exit', (c) => log('EXIT', c));

function handleLine(line) {
  // Frame: 0x1E <header JSON> [0x1F <data JSON>] 0x1D
  let b = line;
  if (b[0] === 0x1e) b = b.subarray(1);
  if (b[b.length - 1] === 0x1d) b = b.subarray(0, -1);
  const sep = b.indexOf(0x1f);
  const header = JSON.parse(b.subarray(0, sep < 0 ? b.length : sep).toString());
  const data = sep < 0 ? undefined : JSON.parse(b.subarray(sep + 1).toString());
  if (header.type === 'log') return log(`[${header.level}]`, header.message);
  if (header.type !== 'message') return log('CTRL', JSON.stringify(header).slice(0, 300));
  if (header.kind === 'response') {
    const p = pending.get(header.id); if (!p) return;
    pending.delete(header.id);
    return 'error' in header ? p.reject(new Error(header.error)) : p.resolve(data ?? null);
  }
  if (header.kind === 'request') {
    if (header.destination === 'host') {
      Promise.resolve(hostMock(header.method, data, unknownHostMethods))
        .then((value) => send({ type: 'message', id: header.id, data: value ?? null }))
        .catch((e) => send({ type: 'message', id: header.id, error: String(e) }));
    } else {
      log('REQ→', header.destination, header.method);
      send({ type: 'message', id: header.id, data: null });
    }
    return;
  }
  if (header.kind === 'notification') for (const fn of listeners) fn(header.method, data, header);
}

export function backendRequest(method, data, timeoutMs = 30000) {
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ type: 'message', id, method, data: data ?? null });
    setTimeout(() => { if (pending.delete(id)) reject(new Error(`timeout ${method}`)); }, timeoutMs);
  });
}
process.on('exit', () => child.kill());

// The native host pushes an application snapshot to the indexer at launch; do the same with this Mac's apps.
setTimeout(() => backendRequest('indexer.prepopulate', { initialItems: installedApps() }, 120000)
  .then(() => log('HARNESS prepopulated application index'))
  .catch((e) => log('HARNESS prepopulate failed', String(e))), 1500);
