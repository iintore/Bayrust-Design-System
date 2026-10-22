// Boots a sandboxed copy of Bayrust's shipped backend (HOME = harness/sandbox-home) and logs its traffic.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const backendDir = '/Applications/Raycast.app/Contents/Resources/macos-app_RaycastDesktopApp.bundle/Contents/Resources/backend';
const node = path.join(here, 'runtime/node-v22.23.3-darwin-arm64/bin/node');
const child = spawn(node, [path.join(backendDir, 'index.mjs')], {
  cwd: backendDir, env: (() => {
    const home = path.join(here, 'sandbox-home');
    return {
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
    };
  })(),
  stdio: ['pipe', 'pipe', 'pipe'],
});
let buf = '';
child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { console.log('OUT', buf.slice(0, i).slice(0, 400)); buf = buf.slice(i + 1); } });
child.stderr.on('data', d => console.log('ERR', String(d).slice(0, 400)));
child.on('exit', c => console.log('EXIT', c));
child.stdin.write(JSON.stringify({ type: 'initialize', databaseKey: 'a'.repeat(64), signatureSecret: 'harness', releaseApiToken: '', posthogApiKey: '' }) + '\n');
setTimeout(() => { child.kill(); process.exit(0); }, Number(process.env.T || 8000));
