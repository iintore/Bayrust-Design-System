import { useSyncExternalStore } from 'react';
import { CodeBlock } from './CodeBlock';

// The package manager choice is shared by every install block and remembered between visits.
const MANAGERS = ['npm', 'pnpm', 'yarn'] as const;
type Manager = (typeof MANAGERS)[number];
const KEY = 'of-docs-pm';
const listeners = new Set<() => void>();
const read = (): Manager => {
  try {
    const v = localStorage.getItem(KEY);
    return MANAGERS.includes(v as Manager) ? (v as Manager) : 'npm';
  } catch {
    return 'npm';
  }
};
const choose = (m: Manager) => {
  try {
    localStorage.setItem(KEY, m);
  } catch {
    // storage unavailable: the choice still applies for this page view
  }
  current = m;
  listeners.forEach((l) => l());
};
let current: Manager | null = null;
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
const snapshot = () => (current ??= read());

const command = (m: Manager, pkgs: string) => (m === 'npm' ? `npm install ${pkgs}` : m === 'pnpm' ? `pnpm add ${pkgs}` : `yarn add ${pkgs}`);

/** `npm install` / `pnpm add` / `yarn add` for the given packages, with a copy button. */
export function InstallTabs({ packages }: { packages: string }) {
  const pm = useSyncExternalStore(subscribe, snapshot, () => 'npm' as Manager);
  return (
    <div className="doc-install">
      <div className="doc-install-tabs" role="tablist" aria-label="Package manager">
        {MANAGERS.map((m) => (
          <button key={m} role="tab" aria-selected={pm === m} className={pm === m ? 'on' : ''} onClick={() => choose(m)}>
            {m}
          </button>
        ))}
      </div>
      <CodeBlock code={command(pm, packages)} lang="bash" bare />
    </div>
  );
}
