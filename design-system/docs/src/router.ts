import { useSyncExternalStore } from 'react';

// Path routing under Vite's base URL (e.g. /Open-Figment/components/button). GitHub Pages serves
// 404.html (a copy of index.html) for deep links, so every route loads the app.
const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
const listeners = new Set<() => void>();

function current(): string {
  const p = decodeURIComponent(location.pathname).slice(BASE.length).replace(/^\/+|\/+$/g, '');
  return p || 'introduction';
}

export const pageHref = (path: string) => `${BASE}/${path}`;

export function navigate(path: string, hash = '') {
  const url = pageHref(path) + hash;
  if (url !== location.pathname + location.hash) history.pushState(null, '', url);
  listeners.forEach((l) => l());
  if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
  else document.getElementById('doc-main')?.scrollTo({ top: 0 });
}

if (typeof window !== 'undefined') window.addEventListener('popstate', () => listeners.forEach((l) => l()));

export const usePath = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    current,
  );
