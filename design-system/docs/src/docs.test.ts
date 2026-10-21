import { describe, expect, it } from 'vitest';
import content from './content/content.json';
import { formatHtml } from './formatHtml';
import { headingsOf } from './data';
import { slugify } from './markdown';

describe('formatHtml (Code tab)', () => {
  it('shows sprite icons by name and indents nested elements', () => {
    const html = `<button class="btn"><svg class="icon" width="16" height="16"><use href="/ds/sprite/plus.svg#s"></use></svg> Create</button>`;
    expect(formatHtml(html)).toBe(['<button class="btn">', '  <Icon name="plus" />', '  Create', '</button>'].join('\n'));
  });

  it('keeps short elements on one line', () => {
    expect(formatHtml('<label class="field"><span class="field-label">X</span><input value="493"></label>')).toBe(
      ['<label class="field">', '  <span class="field-label">X</span>', '  <input value="493">', '</label>'].join('\n'),
    );
  });

  it('collapses SVGs that are not in the icon set', () => {
    expect(formatHtml('<div><svg viewBox="0 0 1 1"><path d="M0 0"></path></svg></div>')).toBe(['<div>', '  <svg>…</svg>', '</div>'].join('\n'));
  });
});

describe('page outline', () => {
  it('lists h2 and h3 headings with ids matching the rendered anchors', () => {
    const md = '## When to use\ntext\n### `btn` classes\n#### Not listed\n## Rules';
    expect(headingsOf(md)).toEqual([
      { id: 'when-to-use', text: 'When to use', level: 2 },
      { id: 'btn-classes', text: 'btn classes', level: 3 },
      { id: 'rules', text: 'Rules', level: 2 },
    ]);
    expect(slugify('`btn` classes')).toBe('btn-classes');
  });
});

describe('content', () => {
  const pages = content.pages as Record<string, { title: string; lead: string; examples?: { html: string }[] | null; kind?: string }>;
  it('every page has a title and a lead', () => {
    for (const [path, p] of Object.entries(pages)) {
      expect(p.title, path).toBeTruthy();
      expect(p.lead, path).toBeTruthy();
    }
  });

  it('every icon in the set has a sprite file name', () => {
    expect((content.icons as string[]).length).toBeGreaterThan(700);
  });

  it('every checklist item on a family page shows a live specimen, links to its page, or says why not', () => {
    type M = { id: string; status: string; md: string; lead: string; examples?: unknown[] | null };
    for (const [path, p] of Object.entries(pages as unknown as Record<string, { members?: M[] }>)) {
      for (const m of p.members ?? []) {
        const where = `${path}#${m.id}`;
        // the reason it has no preview opens the entry, ahead of its collapsed specs
        if (m.status === 'uncaptured') expect(m.md.split('+++ Specs')[0].trim(), where).toBeTruthy();
        else if (m.status === 'no') expect(m.lead, where).toBeTruthy();
        else expect((m.examples?.length ?? 0) > 0 || (m.md.includes('See also') || m.md.includes('Previewed under')), where).toBe(true);
      }
    }
  });

  it('nothing on a page is a screenshot: previews are live markup or live windows', () => {
    for (const [path, p] of Object.entries(pages as unknown as Record<string, { examples?: { image?: string | null }[] | null; members?: { examples?: { image?: string | null }[] | null }[] }>)) {
      const all = [...(p.examples ?? []), ...(p.members ?? []).flatMap((m) => m.examples ?? [])];
      expect(all.filter((e) => e.image).length, path).toBe(0);
    }
  });

  it('every page is reachable from the navigation', () => {
    type Nav = { items?: { path: string }[]; sub?: { items: { path: string }[] }[] };
    const listed = new Set((content.nav as Nav[]).flatMap((g) => [...(g.items ?? []), ...(g.sub ?? []).flatMap((s) => s.items)]).map((i) => i.path));
    expect([...Object.keys(pages)].filter((p) => !listed.has(p))).toEqual([]);
  });
});
