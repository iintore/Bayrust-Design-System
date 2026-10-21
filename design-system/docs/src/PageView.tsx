import { useEffect, useRef, useState } from 'react';
import { inline, renderMarkdown } from './markdown';
import type { Page } from './data';
import { navigate, pageHref } from './router';
import { Icon } from './icons';
import { Example, LiveMarkup, WindowPreview } from './Preview';
import { ColorGallery, Elevation, Gallery, IconGallery, LogoShowcase, RadiusScale, Screens, SpacingScale, ThemeTable, TypeScale } from './Foundations';

const GALLERY: Record<string, (page: Page) => React.ReactNode> = {
  colors: () => <ColorGallery />,
  type: () => <TypeScale />,
  spacing: () => <SpacingScale />,
  radius: () => <RadiusScale />,
  elevation: () => <Elevation />,
  icons: () => <IconGallery />,
  logo: (page) => <LogoShowcase page={page} />,
  screens: (page) => <Screens page={page} />,
  gallery: (page) => <Gallery page={page} />,
  themes: (page) => <ThemeTable page={page} />,
};
const GALLERY_TITLE: Record<string, string> = { colors: 'Tokens', type: 'Text styles', spacing: 'Scale', radius: 'Scale', elevation: 'Shadow tokens', icons: 'Icon set', logo: 'App icons', screens: 'Screens', gallery: 'Files', themes: 'Bundled themes' };
const galleryTitle = (page: Page) => (page.path.startsWith('flow-') ? 'States' : page.path.startsWith('templates-') ? 'Layouts' : page.path === 'introduction' ? 'Windows' : GALLERY_TITLE[page.kind!]);

function Outline({ items }: { items: { id: string; text: string; level: number }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  // While a click-triggered smooth scroll runs, keep the clicked item active.
  const pinned = useRef<{ id: string; until: number } | null>(null);
  useEffect(() => {
    const main = document.getElementById('doc-main');
    if (!main) return;
    // The article scrolls inside #doc-main on wide screens and with the document on narrow ones.
    const scroller = () => (main.scrollHeight > main.clientHeight + 1 ? main : document.scrollingElement!);
    const update = () => {
      const pin = pinned.current;
      if (pin && performance.now() < pin.until) return setActive(pin.id);
      pinned.current = null;
      const sc = scroller();
      const top = sc === main ? main.getBoundingClientRect().top : 0;
      const view = sc === main ? main.clientHeight : innerHeight;
      const els = items.map((it) => document.getElementById(it.id)).filter((el): el is HTMLElement => !!el);
      if (!els.length) return;
      // The activation line sits near the top, then slides down over the last screen of the
      // page, so headings near the end (which can never reach the top) still each get a turn.
      const max = sc.scrollHeight - sc.clientHeight;
      const span = Math.min(view, max);
      const line = span > 0 ? 96 + (view - 96) * Math.max(0, 1 - (max - sc.scrollTop) / span) : 96;
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top - top <= line) cur = el.id;
      setActive(cur);
    };
    update();
    main.addEventListener('scroll', update, { passive: true });
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      main.removeEventListener('scroll', update);
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, [items]);
  if (!items.length) return <aside className="doc-toc" />;
  return (
    <aside className="doc-toc" aria-label="On this page">
      <div className="doc-toc-title">On this page</div>
      <ul>
        {items.map((it) => (
          <li key={it.id} className={(it.level === 3 ? 'l3 ' : '') + (it.id === active ? 'on' : '')}>
            <a
              href={'#' + it.id}
              aria-current={it.id === active ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                pinned.current = { id: it.id, until: performance.now() + 900 };
                setActive(it.id);
                document.getElementById(it.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', '#' + it.id);
              }}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Live windows, grouped (flows with several paths). */
function Windows({ page }: { page: Page }) {
  const groups = new Map<string, NonNullable<Page['windows']>>();
  for (const w of page.windows ?? []) groups.set(w.group ?? '', [...(groups.get(w.group ?? '') ?? []), w]);
  return (
    <section className="doc-windows">
      {[...groups].map(([g, list]) => (
        <div key={g}>
          {g && <h2 id={'states-' + g.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{g}</h2>}
          {list.map((w) => (
            <WindowPreview key={w.win.file} win={w.win} caption={w.caption} />
          ))}
        </div>
      ))}
    </section>
  );
}

export function PageView({ path, pages }: { path: string; pages: Page[] }) {
  const index = pages.findIndex((p) => p.path === path);
  const page = pages[index];
  // The outline lists the headings actually rendered in the article (prose, examples and
  // gallery sections alike), so every page gets one that matches what's on screen.
  const [outline, setOutline] = useState<{ id: string; text: string; level: number }[]>([]);
  useEffect(() => {
    const article = document.querySelector('.doc-article');
    if (!article) return;
    const read = () => {
      const sel = article.querySelector('.doc-member') ? '.doc-member > h2[id], .doc-windows h2[id]' : 'h2[id], h3[id]';
      const next = [...article.querySelectorAll<HTMLElement>(sel)].map((h) => {
        const copy = h.cloneNode(true) as HTMLElement;
        copy.querySelectorAll('.doc-anchor, .doc-example-sub, .doc-status, [aria-hidden="true"]').forEach((n) => n.remove());
        return { id: h.id, text: copy.textContent!.trim(), level: h.tagName === 'H3' ? 3 : 2 };
      });
      setOutline((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(article, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [page]);

  useEffect(() => {
    document.title = page ? `${page.title} · Bayrust` : 'Bayrust';
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
  }, [page]);

  if (!page) {
    return (
      <main className="doc-main" id="doc-main">
        <article className="doc-article">
          <h1>Page not found</h1>
          <p className="doc-lead">There’s no page at this address. Use the sidebar or search (/) to find what you need.</p>
        </article>
      </main>
    );
  }
  const prev = pages[index - 1];
  const next = pages[index + 1];
  const isBlock = page.kind === 'block';
  return (
    <main className="doc-main" id="doc-main" tabIndex={-1}>
      <div className="doc-page">
        <article className="doc-article">
          <div className="doc-eyebrow">{page.subsection ? `${page.section} · ${page.subsection}` : page.section}</div>
          <h1>
            {page.title}
            {page.statusLabel && page.status !== 'yes' && <span className={'doc-status ' + page.status}>{page.statusLabel}</span>}
          </h1>
          <p className="doc-lead">{inline(page.lead)}</p>
          {page.kind && GALLERY[page.kind] && (
            <section className="doc-gallery">
              <h2 id="gallery">{galleryTitle(page)}</h2>
              {GALLERY[page.kind](page)}
            </section>
          )}
          {page.install && (
            <section className="doc-install-section">
              <h2 id="install">Install</h2>
              {renderMarkdown(page.install)}
            </section>
          )}
          {page.members?.map((m) => (
            <section key={m.id} className="doc-member">
              <h2 id={m.id}>
                {m.title}
                {m.status !== 'yes' && <span className={'doc-status ' + m.status}>{m.statusLabel}</span>}
              </h2>
              {m.lead && m.lead !== page.lead && <p className="doc-member-lead">{inline(m.lead)}</p>}
              {m.examples?.length ? <MemberExamples key={m.id} examples={m.examples} /> : null}
              {m.md && <div className="doc-prose doc-member-ref">{renderMarkdown(m.md)}</div>}
            </section>
          ))}
          {page.windows?.length ? <Windows page={page} /> : null}
          {page.examples?.length ? (
            <section>
              <h2 id="examples">Examples</h2>
              {page.examples.map((e, i) => (
                <Example key={i} index={i} title={e.title} html={e.html} jsx={e.jsx} live={e.live} image={e.image} imageSize={e.w && e.h ? [e.w, e.h] : undefined} width={e.width ?? (isBlock ? page.width ?? null : null)} height={e.height} ctx={e.ctx} win={e.win} crop={e.crop} panel={e.panel} />
              ))}
            </section>
          ) : page.full ? (
            <section>
              <h2 id="preview">Preview</h2>
              <div className="doc-block-preview">
                <LiveMarkup html={page.full} width={page.width ?? null} />
              </div>
            </section>
          ) : null}
          <div className="doc-prose">{renderMarkdown(page.md)}</div>
          {page.swatches && (
            <section className="doc-swatch-gallery">
              <h2 id={page.swatches.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{page.swatches.title}</h2>
              <p className="doc-member-lead">{page.swatches.lead}</p>
              <LiveMarkup html={page.swatches.html} />
            </section>
          )}
          <footer className="doc-footer">
            {page.source && <span>Source: {page.source}</span>}
            <span>Bayrust 2.8.2 · built from the shipped app, for private study</span>
          </footer>
          <nav className="doc-pager" aria-label="Pagination">
            {prev ? (
              <a
                href={pageHref(prev.path)}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(prev.path);
                }}
              >
                <span className="doc-pager-dir">
                  <Icon.arrowLeft /> Previous
                </span>
                <span className="doc-pager-title">{prev.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a
                className="next"
                href={pageHref(next.path)}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(next.path);
                }}
              >
                <span className="doc-pager-dir">
                  Next <Icon.arrowRight />
                </span>
                <span className="doc-pager-title">{next.title}</span>
              </a>
            )}
          </nav>
        </article>
        <Outline items={outline} />
      </div>
    </main>
  );
}

type MemberExample = NonNullable<NonNullable<Page['members']>[number]['examples']>[number];

/** A member's previews: the first few, the rest (more states of the same thing) a click away. */
const SHOWN = 6;
function MemberExamples({ examples }: { examples: MemberExample[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? examples : examples.slice(0, SHOWN);
  return (
    <>
      {shown.map((e, i) => (
        <Example key={i} index={i} title={e.title} html={e.html} jsx={e.jsx} live={e.live} image={e.image} imageSize={e.w && e.h ? [e.w, e.h] : undefined} width={e.width ?? null} height={e.height} ctx={e.ctx} win={e.win} crop={e.crop} panel={e.panel} />
      ))}
      {examples.length > SHOWN && (
        <button type="button" className="doc-more" onClick={() => setAll(!all)} aria-expanded={all}>
          {all ? 'Show fewer' : `Show ${examples.length - SHOWN} more`}
        </button>
      )}
    </>
  );
}
