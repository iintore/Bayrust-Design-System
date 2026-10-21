import { useSyncExternalStore } from 'react';

// Light / dark / system theme for the docs. The resolved theme is written to <html data-theme>,
// which both the docs chrome and the component previews read.
export type ThemeChoice = 'light' | 'dark' | 'system';
const KEY = 'bayrust-docs-theme';
const listeners = new Set<() => void>();
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

let choice: ThemeChoice = readChoice();
const resolve = (): 'light' | 'dark' => (choice === 'system' ? (media?.matches ? 'dark' : 'light') : choice);

function apply() {
  document.documentElement.dataset.theme = resolve();
  listeners.forEach((l) => l());
}
media?.addEventListener('change', () => choice === 'system' && apply());
if (typeof document !== 'undefined') apply();

export function setThemeChoice(next: ThemeChoice) {
  choice = next;
  try {
    if (next === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
  apply();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The theme currently shown: 'light' or 'dark'. */
export const useTheme = () => useSyncExternalStore(subscribe, resolve);
/** What the user picked, including 'system'. */
export const useThemeChoice = () => useSyncExternalStore(subscribe, () => choice);
