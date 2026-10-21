import { useEffect, useMemo, useState } from 'react';
import content from './content/content.json';
import { Icon } from './icons';
import { AppIcon } from './iconParts';
import { navigate, usePath, pageHref } from './router';
import { setThemeChoice, useThemeChoice } from './theme';
import { SearchDialog } from './Search';
import { PageView } from './PageView';
import { allPages, type NavGroup } from './data';

const BASE = import.meta.env.BASE_URL;

function Sidebar({ path, open, onClose }: { path: string; open: boolean; onClose: () => void }) {
  const nav = content.nav as NavGroup[];
  // which groups are collapsed, remembered between visits
  const [collapsed, setCollapsedState] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('bayrust-docs-nav') ?? '{}');
    } catch {
      return {};
    }
  });
  const setCollapsed = (next: Record<string, boolean>) => {
    setCollapsedState(next);
    try {
      localStorage.setItem('bayrust-docs-nav', JSON.stringify(next));
    } catch {
      /* storage unavailable: the state lasts for this visit */
    }
  };
  const link = (item: { title: string; path: string }) => (
    <a
      key={item.path}
      href={pageHref(item.path)}
      className={'doc-nav-link' + (item.path === path ? ' on' : '')}
      aria-current={item.path === path ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault();
        navigate(item.path);
        onClose();
      }}
    >
      {item.title}
    </a>
  );
  return (
    <aside className={'doc-sidebar' + (open ? ' open' : '')} aria-label="Documentation">
      <nav>
        {nav.map((g) => {
          const isCollapsed = collapsed[g.label];
          return (
            <section key={g.label} className="doc-nav-group">
              <button className="doc-nav-head" aria-expanded={!isCollapsed} onClick={() => setCollapsed({ ...collapsed, [g.label]: !isCollapsed })}>
                <AppIcon name={g.icon} size={16} />
                <span>{g.label}</span>
                <span className="doc-nav-count">{(g.items?.length ?? 0) + (g.sub ?? []).reduce((n, x) => n + x.items.length, 0)}</span>
                <span className="doc-nav-chev">
                  <Icon.chevron />
                </span>
              </button>
              <div className="doc-nav-body" hidden={isCollapsed}>
                {g.items?.map(link)}
                {g.sub?.map((s) => (
                  <div key={s.label} className="doc-nav-sub">
                    <div className="doc-nav-sublabel">{s.label}</div>
                    <div className="doc-nav-subitems">{s.items.map(link)}</div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}

function ThemeSwitch() {
  const choice = useThemeChoice();
  const opts = [
    { v: 'light', label: 'Light theme', icon: <Icon.sun /> },
    { v: 'system', label: 'Match system theme', icon: <span className="doc-sys">A</span> },
    { v: 'dark', label: 'Dark theme', icon: <Icon.moon /> },
  ] as const;
  return (
    <div className="doc-theme" role="radiogroup" aria-label="Theme">
      {opts.map((o) => (
        <button key={o.v} role="radio" aria-checked={choice === o.v} aria-label={o.label} title={o.label} className={choice === o.v ? 'on' : ''} onClick={() => setThemeChoice(o.v)}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}

export function App() {
  const path = usePath();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pages = useMemo(() => allPages(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, [contenteditable="true"]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="doc-app">
      <a className="doc-skip" href="#doc-main">
        Skip to content
      </a>
      <header className="doc-header">
        <button className="doc-menu-btn" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <Icon.close /> : <Icon.menu />}
        </button>
        <a
          className="doc-brand"
          href={pageHref('introduction')}
          onClick={(e) => {
            e.preventDefault();
            navigate('introduction');
          }}
        >
          <img src={`${BASE}ds/logo-mark.svg`} alt="" width="24" height="24" />
          <span>Bayrust</span>
          <span className="doc-version">2.8.2</span>
        </a>
        <button className="doc-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search documentation">
          <Icon.search />
          <span>Search docs…</span>
          <kbd>/</kbd>
        </button>
        <div className="doc-header-end">
          <ThemeSwitch />
        </div>
      </header>
      <div className="doc-body">
        <Sidebar path={path} open={menuOpen} onClose={() => setMenuOpen(false)} />
        {menuOpen && <div className="doc-scrim" onClick={() => setMenuOpen(false)} />}
        <PageView key={path} path={path} pages={pages} />
      </div>
      {searchOpen && <SearchDialog pages={pages} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
