import { useEffect, useMemo, useRef, useState } from 'react';
import { AppIcon } from './iconParts';

import { inline } from './markdown';
import content from './content/content.json';

// Each result shows its sidebar section as that section's icon, the same one the sidebar uses.
const SECTION_ICON: Record<string, string> = Object.fromEntries((content.nav as { label: string; icon: string }[]).map((g) => [g.label, g.icon]));
import { navigate } from './router';
import { headingsOf, type Page } from './data';

interface Hit {
  page: Page;
  heading?: { id: string; text: string };
  excerpt?: string;
  score: number;
}

const plain = (md: string) => md.replace(/```[\s\S]*?```/g, ' ').replace(/[#*`|>]/g, ' ').replace(/\s+/g, ' ');

function excerpt(text: string, at: number, len: number) {
  // Start and end on word boundaries around the match.
  let start = Math.max(0, at - 40);
  if (start) start = text.indexOf(' ', start) + 1 || start;
  let end = Math.min(text.length, at + len + 60);
  const space = text.lastIndexOf(' ', end);
  if (end < text.length && space > at + len) end = space;
  return (start ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

function search(pages: Page[], q: string): Hit[] {
  const t = q.trim().toLowerCase();
  if (!t) return pages.slice(0, 8).map((page) => ({ page, score: 0 }));
  const hits: Hit[] = [];
  for (const page of pages) {
    const title = page.title.toLowerCase();
    const leadHit = !title.includes(t) && page.lead.toLowerCase().includes(t);
    if (title.startsWith(t)) hits.push({ page, score: 0 });
    else if (title.includes(t)) hits.push({ page, score: 1 });
    else if (leadHit) hits.push({ page, score: 3 });
    let headingHit = false;
    // family pages: each checklist item is a section (Button › Link Button)
    for (const m of page.members ?? [])
      if (m.title.toLowerCase().includes(t)) {
        hits.push({ page, heading: { id: m.id, text: m.title }, score: m.title.toLowerCase().startsWith(t) ? 0 : 1 });
        headingHit = true;
      }
    for (const h of headingsOf(page.md))
      if (h.text.toLowerCase().includes(t)) {
        hits.push({ page, heading: h, score: 2 });
        headingHit = true;
      }
    if (!headingHit && !leadHit && !title.includes(t)) {
      const body = plain(page.md);
      const at = body.toLowerCase().indexOf(t);
      if (at >= 0) hits.push({ page, excerpt: excerpt(body, at, t.length), score: 4 });
    }
  }
  return hits.sort((a, b) => a.score - b.score).slice(0, 30);
}

export function SearchDialog({ pages, onClose }: { pages: Page[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hl, setHl] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => search(pages, q), [pages, q]);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    list.current?.querySelector('[data-hl="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [hl]);
  const go = (h: Hit) => {
    navigate(h.page.path, h.heading ? '#' + h.heading.id : '');
    onClose();
  };
  // results grouped by sidebar section, in order of first appearance (the launcher's "Suggestions / Commands")
  const groups: { section: string; hits: { h: Hit; i: number }[] }[] = [];
  hits.forEach((h, i) => {
    const g = groups.find((x) => x.section === h.page.section) ?? (groups.push({ section: h.page.section, hits: [] }), groups[groups.length - 1]);
    g.hits.push({ h, i });
  });
  return (
    <div className="doc-search-backdrop" onMouseDown={onClose}>
      {/* The docs search is a Bayrust launcher: measured from the main window (750 wide, radius 26; 64 pt search
          header with 18/350 text; 38 pt rows with a 22 pt icon, selected fg-10 at radius 10; 44 pt action bar). */}
      <div className="bs-launcher" role="dialog" aria-modal="true" aria-label="Search documentation" onMouseDown={(e) => e.stopPropagation()}>
        <label className="bs-search">
          <span className="bs-search-icon">
            <AppIcon name="magnifying-glass" size={22} />
          </span>
          <input
            ref={input}
            value={q}
            placeholder="Search components, foundations and guidelines…"
            aria-controls="doc-search-results"
            onChange={(e) => {
              setQ(e.target.value);
              setHl(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') setHl(Math.min(hits.length - 1, hl + 1));
              else if (e.key === 'ArrowUp') setHl(Math.max(0, hl - 1));
              else if (e.key === 'Enter' && hits[hl]) go(hits[hl]);
              else if (e.key === 'Escape') onClose();
              else return;
              e.preventDefault();
            }}
          />
        </label>
        <div className="bs-list" id="doc-search-results" role="listbox" ref={list}>
          {!hits.length && <div className="bs-empty">No results for “{q}”</div>}
          {groups.map((g) => (
            <div key={g.section} role="group" aria-label={g.section}>
              <div className="bs-section">{g.section}</div>
              {g.hits.map(({ h, i }) => (
                <button
                  key={h.page.path + (h.heading?.id ?? '')}
                  role="option"
                  aria-selected={i === hl}
                  data-hl={i === hl}
                  className={'bs-item' + (i === hl ? ' selected' : '')}
                  onMouseMove={() => setHl(i)}
                  onClick={() => go(h)}
                >
                  <span className="bs-item-icon">
                    <AppIcon name={SECTION_ICON[h.page.section] ?? 'blank-document'} size={16} />
                  </span>
                  <span className="bs-item-title">{h.heading ? h.heading.text : h.page.title}</span>
                  <span className="bs-item-subtitle">{h.heading ? h.page.title : h.excerpt ?? inline(h.page.lead)}</span>
                  <span className="bs-item-accessory">{h.heading ? 'Section' : 'Page'}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="bs-actions">
          <span className="bs-brand">
            <img src={`${import.meta.env.BASE_URL}ds/logo-mark.svg`} alt="" width="16" height="16" />
          </span>
          <span className="bs-action">
            Move
            <kbd>↑</kbd>
            <kbd>↓</kbd>
          </span>
          <span className="bs-action">
            Open Page
            <kbd>↵</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
