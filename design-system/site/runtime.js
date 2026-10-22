// Access to Raycast's own runtime: React (via the shipped JSX runtime and react-dom/client chunks),
// component lookup by displayName, and the shared stores. Everything resolves to shipped modules.
const ic = await import('/icon-CKbK2z_d.js');
const ch = await import('/chunk-CMxvf4Kt.js');
const ws = await import('/window-shell-core-BIQZePcT.js');
export const J = ic.O();
export const ReactDOM = ch.o(ws.i(), 1);
export const h = (type, props, ...children) => {
  const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  const p = { ...(props || {}) };
  if (kids.length === 1) p.children = kids[0];
  else if (kids.length > 1) p.children = kids;
  return kids.length > 1 ? J.jsxs(type, p) : J.jsx(type, p);
};
const moduleCache = new Map();
export const mod = (file) => {
  if (!moduleCache.has(file)) moduleCache.set(file, import(`/${file}`));
  return moduleCache.get(file);
};
// Find a component exported from `file` whose displayName is `name` (directly or inside a namespace export).
export async function component(file, name) {
  const m = await mod(file);
  for (const v of Object.values(m)) {
    if (v && v.displayName === name) return v;
    if (v && typeof v === 'object') for (const w of Object.values(v)) if (w && w.displayName === name) return w;
  }
  throw new Error(`${name} not found in ${file}`);
}
export async function services() {
  const m = await mod('services-CI1JjB8Y.js');
  return Object.values(m).find((v) => v && 'windowStateStore' in v);
}
export const json = (p) => fetch(p).then((r) => r.json());
const time = await import('/time-BgPLLP_H.js');
export const React = ch.o(time.n(), 1); // the same React instance the shipped components use
window.__dsReact = React;
