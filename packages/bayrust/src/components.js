// The shipped components, running as they do in the app: loaded at runtime from the package's runtime/ folder (the
// shipped frontend, served at assetsBase()) and rendered with the React instance they were built with.
import { components } from './data/components.js';
import { assetsBase } from './config.js';

// The shipped modules that expose the JSX runtime, ReactDOM and React (Bayrust 2.8.2's build).
const JSX = 'icon-CKbK2z_d.js';
const INTEROP = 'chunk-CMxvf4Kt.js';
const REACT_DOM = 'window-shell-core-BIQZePcT.js';
const REACT = 'time-BgPLLP_H.js';
const SPRITE = 'ipc://raycast-sprite/';

// One instance per assets base: the same base returns the same instance, a different one loads its own.
const loading = new Map();

/** Loads the runtime for an assets base once; later calls with that base return the same instance. */
export function loadBayrust(options = {}) {
  const base = options.base ?? assetsBase();
  let instance = loading.get(base);
  if (!instance) {
    // a failed boot is not kept, so a later call can try again
    instance = boot(base).catch((e) => {
      loading.delete(base);
      throw e;
    });
    loading.set(base, instance);
  }
  return instance;
}

/** The names of every component that can be loaded with `get`. */
export const componentNames = Object.keys(components);

// The app asks its Mac host for icons (ipc://raycast-sprite/<name>#s); here they are the package's icon files.
// The interceptor is installed once, however many bases are loaded, and resolves against the base booted last.
let spriteRoot = null;
function interceptSpriteUrls(root) {
  spriteRoot = root;
  if (interceptSpriteUrls.installed) return;
  interceptSpriteUrls.installed = true;
  const setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if ((name === 'href' || name === 'src') && typeof value === 'string' && value.startsWith(SPRITE)) {
      value = `${spriteRoot}icons/${value.slice(SPRITE.length).replace(/#s$/, '')}.svg#s`;
    }
    return setAttribute.call(this, name, value);
  };
}

async function boot(base) {
  const root = new URL(base, typeof document === 'undefined' ? undefined : document.baseURI).href.replace(/\/?$/, '/');
  const load = (file) => import(/* @vite-ignore */ `${root}runtime/${file}`);
  interceptSpriteUrls(root);
  const [jsxModule, interop, reactDom, react] = await Promise.all([JSX, INTEROP, REACT_DOM, REACT].map(load));
  const jsx = jsxModule.O();
  const ReactDOM = interop.o(reactDom.i(), 1);
  const React = interop.o(react.n(), 1);

  const h = (type, props, ...children) => {
    const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
    const p = { ...(props ?? {}) };
    if (kids.length === 1) p.children = kids[0];
    else if (kids.length > 1) p.children = kids;
    return kids.length > 1 ? jsx.jsxs(type, p) : jsx.jsx(type, p);
  };

  const cache = new Map();
  async function get(name) {
    if (!cache.has(name)) cache.set(name, resolve(name));
    return cache.get(name);
  }
  async function resolve(name) {
    const def = components[name];
    if (!def) throw new Error(`Bayrust has no component named ${name}`);
    const [file, exportName] = def;
    const m = await load(file);
    if (exportName && m[exportName]) return m[exportName];
    // namespace members (BaseButton.Root) and the like: by displayName
    for (const v of Object.values(m)) {
      if (v?.displayName === name) return v;
      if (v && typeof v === 'object') for (const w of Object.values(v)) if (w?.displayName === name) return w;
    }
    throw new Error(`${name} not found in ${file}`);
  }

  function render(container, element) {
    const r = ReactDOM.createRoot(container);
    r.render(element);
    return r;
  }

  return { React, ReactDOM, h, get, render, load, names: componentNames };
}
