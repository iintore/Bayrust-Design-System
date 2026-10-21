import { useEffect, useMemo, useRef, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { formatHtml } from './formatHtml';
import { useTheme } from './theme';
import type { SpecimenContext, WindowRef, Example as ExampleData } from './data';

const BASE = import.meta.env.BASE_URL;
const asset = (html: string) => html.replaceAll('"/ds/', `"${BASE}ds/`).replaceAll('&quot;/ds/', `&quot;${BASE}ds/`);
// Shadows and glows spill past a component's box; previews keep this much transparent room around it and
// shift by the same amount, so the component sits exactly where the page puts it.
const BLEED = 24;

// Previews are documents of their own, set up the way the app sets up a window: the root carries the attributes
// the runtime puts on <html> (macOS 27, scaled tokens, active theme, this Mac's accent) and the 158 shipped
// stylesheets apply unchanged. `no-background` is Bayrust's own class for a root without the window backdrop, so
// components sit on the docs canvas the way the playground puts them on its canvas.
const HEAD = `<meta charset="utf-8">
<link rel="stylesheet" href="${BASE}ds/bundle.css"><link rel="stylesheet" href="${BASE}ds/theme.css"><link rel="stylesheet" href="${BASE}ds/ds.css">
<style>html{overflow:hidden;background:transparent} body{height:auto;min-height:0;margin:0} .pv{position:relative;padding:${BLEED}px;display:flex;flex-direction:column;align-items:center;gap:var(--space-12)} .pv>.ds-row{margin:0;justify-content:center} .pv .ds-label{display:none} .pv:has(>section){align-items:stretch} .pv-panel{border-radius:var(--radius-18);background:var(--color-window-base);box-shadow:var(--shadow-panel-shadow),inset 0 0 0 0.5px var(--fg-20);overflow:hidden}</style>`;
const ROOT = (theme: string, extra = '') => `lang="en" macos="27" ${theme} class="scaled-tokens theme-root active-theme transitions-ready no-background${extra}" style="--zoom: 1; --color-system-accent: #007AFF;"`;

function contextFrame(body: string, elWidth: number, elHeight: number | null | undefined, ctx: SpecimenContext) {
  // The specimen is laid out in a box the size of its parent's content box in the app (so margins, stretching
  // and percentages resolve the same), inside the parent's font and layout, under any ancestor scaling.
  const k = (ctx.scale || 1) * (ctx.cssZoom || 1);
  // Along each axis: the parent's box where the specimen filled it (its margins then resolve the same), else its own
  // box (it shared the parent with siblings that aren't here).
  const [mt, mr, mb, ml] = (ctx.margin ?? [0, 0, 0, 0]).map((m) => m * k);
  // it filled its parent when its margin box was the parent's box
  const fills = (el: number | null | undefined, m: number, p: number | undefined) => !!(el && p && p > 0 && Math.abs(el + m - p * k) <= 1);
  const width = fills(elWidth, ml + mr, ctx.pw) ? ctx.pw! * k : elWidth + ml + mr;
  const height = fills(elHeight, mt + mb, ctx.ph) ? ctx.ph! * k : elHeight ? elHeight + mt + mb : elHeight;
  const flex = /flex|grid/.test(ctx.display)
    ? `display:${ctx.display};flex-direction:${ctx.flexDirection};align-items:${ctx.alignItems};justify-content:${ctx.justifyContent ?? 'normal'};gap:${ctx.gap ?? 'normal'};` +
      (/grid/.test(ctx.display) ? `grid-template-columns:${ctx.gridTemplateColumns};justify-items:${ctx.justifyItems ?? 'normal'};` : '')
    : '';
  const vars = Object.entries(ctx.vars ?? {}).map(([k, v]) => `${k}:${v};`).join('');
  const scaled = k !== 1 ? `transform:scale(${k});transform-origin:0 0;` : '';
  const zoomCls = ctx.zoom !== '1' ? ' scaled-tokens' : '';
  // ancestors as display: contents, so selectors and inheritance that depend on them still apply
  // (the window root itself is left out: the stylesheets hide it outside its window)
  const chain = (ctx.chain ?? []).filter((t) => !/class="[^"]*\bwindow-root\b|id="[a-z-]+-window-root"/.test(t));
  const tags = chain.map((t) => /^<([a-z0-9-]+)/.exec(t)![1]);
  body = chain.join('') + body.replace(/^\s*<([a-z0-9-]+)/, '<$1 data-specimen') + tags.reverse().map((t) => `</${t}>`).join('');
  const inner = `<div class="pv-ctx${zoomCls}" style="position:relative;width:${width / k}px;${height ? `height:${height / k}px;` : ''}${flex}font-size:${ctx.fontSize};line-height:${ctx.lineHeight};font-weight:${ctx.fontWeight};letter-spacing:${ctx.letterSpacing};color:${ctx.color};--zoom:${ctx.zoom};${vars}${scaled}">${body}</div>`;
  // an empty element with the window root's id, so the window's root-level :has() rules apply as in the app
  // (inline !important: the window's own `#…-window-root { display: flex; height: … }` must not lay it out)
  const marker = ctx.window ? `<template id="${ctx.window}" style="display:none !important"></template>` : '';
  // a native child panel (action panel, switcher) gets the surface the panel window draws around it in the app
  const panel = (ctx.chain ?? []).some((t) => /id="native-view-root"/.test(t)) ? ' pv-panel' : '';
  return `${marker}<div class="pv-frame${panel}" style="width:${width}px;${height ? `height:${height}px;` : ''}flex:none">${inner}</div>`;
}

function documentFor(html: string, theme: string, width?: number | null, height?: number | null, ctx?: SpecimenContext | null, panel?: boolean) {
  const body = asset(html);
  let inner = width && ctx ? contextFrame(body, width, height, ctx) : width ? `<div class="pv-frame" style="width:${width}px;${height ? `height:${height}px;` : ''}flex:none;position:relative">${body}</div>` : body;
  if (panel && !inner.includes('pv-panel')) inner = `<div class="pv-panel">${inner}</div>`;
  return `<!doctype html><html ${ROOT(theme)}><head>${HEAD}</head><body><div class="pv">${inner}</div></body></html>`;
}

/** Measures a preview document and keeps its frame the size of its content. */
function useAutoHeight(frame: React.RefObject<HTMLIFrameElement | null>, srcDoc: string, pick: (doc: Document) => HTMLElement | null) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let ro: ResizeObserver | null = null;
    const onLoad = () => {
      const doc = el.contentDocument;
      const target = doc && pick(doc);
      if (!doc || !target) return;
      // Floating UI (toasts, alerts) was captured at its window position; bring it into the flow.
      for (const node of doc.querySelectorAll<HTMLElement>('.pv *')) {
        if (el.contentWindow!.getComputedStyle(node).position === 'fixed') Object.assign(node.style, { position: 'relative', inset: 'auto', transform: 'none', margin: '0' });
      }
      const measure = () => setSize({ w: Math.ceil(target.scrollWidth), h: Math.ceil(Math.max(target.scrollHeight, target.getBoundingClientRect().height)) });
      ro = new ResizeObserver(measure);
      ro.observe(target);
      measure();
      doc.fonts?.ready.then(measure);
    };
    el.addEventListener('load', onLoad);
    return () => {
      el.removeEventListener('load', onLoad);
      ro?.disconnect();
    };
  }, [srcDoc]);
  return size;
}

/** Captured product markup, rendered with the shipped stylesheets in the docs theme, on the page canvas. */
export function LiveMarkup({ html, width, boxHeight, ctx, panel }: { html: string; width?: number | null; boxHeight?: number | null; ctx?: SpecimenContext | null; panel?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const theme = useTheme();
  const srcDoc = useMemo(() => documentFor(html, theme, width, boxHeight, ctx, panel), [html, theme, width, boxHeight, ctx, panel]);
  const size = useAutoHeight(frame, srcDoc, (d) => d.querySelector<HTMLElement>('.pv'));
  // at least as wide as the specimen's window, so the window's media queries match as in the app
  const w = width || ctx?.vw ? Math.max((width ?? 0) + 2 * BLEED, ctx?.vw ?? 0) : undefined;
  return (
    <div className="doc-live-slot" style={{ height: size ? size.h - 2 * BLEED : undefined, minHeight: size ? undefined : 32 }}>
      <iframe ref={frame} className={'doc-live' + (size ? '' : ' loading')} title="Preview" srcDoc={srcDoc} style={{ height: size?.h ?? 80, width: w ? `${w}px` : `calc(100% + ${2 * BLEED}px)`, margin: -BLEED }} />
    </div>
  );
}

/** A captured window, live: its own DOM and root attributes at its real size, with its open child panels at their
 * native frames, scaled to fit. `crop` shows one element of it (a block) instead of the whole window. */
export function WindowPreview({ win, crop, caption }: { win: WindowRef; crop?: string | null; caption?: string }) {
  const theme = useTheme();
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [data, setData] = useState<null | { w: number; h: number; chrome: string; attrs: Record<string, string>; html: string; panels: { feature: string; x: number; y: number; w: number; h: number; html: string }[] }>(null);
  const [avail, setAvail] = useState(800);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [radius, setRadius] = useState('20px');
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth));
    ro.observe(el);
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setVisible(true), { rootMargin: '600px' });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!visible || data) return;
    fetch(`${BASE}ds/windows/${win.file}`).then((r) => r.json()).then(setData, () => undefined);
  }, [visible, win.file, data]);
  const doc = useMemo(() => {
    if (!data) return '';
    // the captured root attributes, with the docs theme; the glass behind a window is a macOS material, so the
    // window draws on --color-window-base here
    const attrs = Object.entries(data.attrs).filter(([k]) => !['dark', 'light', 'class', 'style'].includes(k)).map(([k, v]) => `${k}="${v}"`).join(' ');
    const cls = (data.attrs.class ?? '').replace(/\bno-background\b/, '');
    const style = (data.attrs.style ?? '').replace(/"/g, '&quot;');
    return `<!doctype html><html ${attrs} ${theme} class="${cls}" style="${style}"><head><meta charset="utf-8"><link rel="stylesheet" href="${BASE}ds/bundle.css"><link rel="stylesheet" href="${BASE}ds/theme.css"><style>html{background:var(--color-window-base)}</style></head><body>${asset(data.html)}</body></html>`;
  }, [data, theme]);
  useEffect(() => {
    const el = frame.current;
    if (!el || !doc) return;
    const onLoad = () => {
      const d = el.contentDocument!;
      setRadius(getComputedStyle(d.documentElement).getPropertyValue('--radius-window').trim() || '20px');
      if (crop) {
        const t = d.querySelector(crop);
        const r = t?.getBoundingClientRect();
        if (r) setRect({ x: r.x, y: r.y, w: r.width, h: r.height });
      }
    };
    el.addEventListener('load', onLoad);
    // the document may have loaded before this effect ran
    if (el.contentDocument?.readyState === 'complete' && el.contentDocument.body?.childElementCount) onLoad();
    return () => el.removeEventListener('load', onLoad);
  }, [doc, crop]);
  const w = data?.w ?? win.w ?? 750;
  const h = data?.h ?? win.h ?? 475;
  const view = crop && rect ? rect : { x: 0, y: 0, w, h };
  const k = Math.min(1, avail / view.w);
  return (
    <figure className="doc-window" ref={box}>
      <div className={'doc-window-frame' + (crop ? ' crop' : '')} style={{ width: view.w * k, height: view.h * k, borderRadius: crop ? 0 : `calc(${radius} * ${k})` }}>
        <div style={{ width: w, height: h, transform: `scale(${k}) translate(${-view.x}px, ${-view.y}px)`, transformOrigin: '0 0', position: 'relative' }}>
          {doc && <iframe ref={frame} title={caption ?? 'Window'} srcDoc={doc} style={{ width: w, height: h, border: 0, display: 'block' }} />}
          {data?.chrome === 'standard' && !crop && (
            // the macOS window controls (native, not part of the DOM), inactive, as measured on this Mac: 14 pt, centres 23 pt apart
            <span className="doc-traffic" aria-hidden>
              <i /> <i /> <i />
            </span>
          )}
          {data?.panels.map((p) => <Panel key={p.feature} p={p} theme={theme} />)}
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** A native child panel (action panel, menu, popover) at its frame, rendered from its own document. */
function Panel({ p, theme }: { p: { x: number; y: number; w: number; h: number; html: string }; theme: string }) {
  const doc = `<!doctype html><html ${ROOT(theme)}><head>${HEAD.replace(/padding:\d+px;/, 'padding:0;')}</head><body>${asset(p.html)}</body></html>`;
  return <iframe className="doc-panel" title="Panel" srcDoc={doc} style={{ position: 'absolute', left: p.x, top: p.y, width: p.w, height: p.h, border: 0 }} />;
}

// The live app (the harness). Previews of shipped components run there, so they behave exactly as in the app.
const HARNESS = (import.meta.env.VITE_HARNESS as string | undefined) ?? 'http://localhost:4317';
let harnessUp: Promise<boolean> | null = null;
const harnessReachable = () => (harnessUp ??= fetch(`${HARNESS}/ds/manifest.json`, { mode: 'no-cors' }).then(() => true, () => false));
let seq = 0;

/** Bayrust's loading shimmer (the shipped shimmer block: fg-5 → fg-10 → fg-5, 1.5 s). */
function Skeleton({ w, h }: { w?: number; h?: number }) {
  return (
    <div className="doc-skeleton" aria-label="Loading" role="status">
      <span style={{ width: w ? Math.min(w, 560) : 280, height: h ? Math.min(h, 240) : 32 }} />
    </div>
  );
}

/** A shipped component running in the harness: interactive, in the docs theme, sized from the message it posts. */
export function LiveSpecimen({ live, fallback }: { live: NonNullable<ExampleData['live']>; fallback: React.ReactNode }) {
  const theme = useTheme();
  const [id] = useState(() => `s${++seq}`);
  const [state, setState] = useState<'checking' | 'loading' | 'ready' | 'off'>('checking');
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setVisible(true), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    harnessReachable().then((ok) => alive && setState(ok ? 'loading' : 'off'));
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== 'bayrust-specimen' || e.data.id !== id) return;
      setSize({ w: e.data.w, h: e.data.h });
      setState('ready');
    };
    addEventListener('message', onMessage);
    const timer = setTimeout(() => alive && setState((s) => (s === 'ready' ? s : 'off')), 20000);
    return () => {
      alive = false;
      removeEventListener('message', onMessage);
      clearTimeout(timer);
    };
  }, [visible, id, theme]);
  useEffect(() => {
    setSize(null);
    setState((s) => (s === 'ready' ? 'loading' : s));
  }, [theme]);
  const src = live.ds
    ? `${HARNESS}/ds/?specimen=${encodeURIComponent(live.ds)}${live.row != null ? `&row=${live.row}` : ''}&appearance=${theme}&id=${id}`
    : `${HARNESS}/ai-chat-window.html?specimen-playground=${encodeURIComponent(live.pg ?? '')}&section=${live.section ?? 0}&appearance=${theme}&id=${id}`;
  // /ds/ specimens keep 24 pt of room for shadows inside their page; take it back so they sit where the layout puts them
  const bleed = live.ds ? 24 : 0;
  return (
    <div ref={box} className="doc-live-specimen">
      {state === 'off' ? (
        fallback
      ) : (
        <>
          {state !== 'ready' && <Skeleton />}
          {visible && state !== 'checking' && (
            <iframe
              key={src}
              title="Live preview"
              src={src}
              className="doc-live-frame"
              // while loading it keeps a real size (a 1 px cross-origin frame is throttled and never finishes booting)
              style={size ? { width: size.w, height: size.h, margin: -bleed, opacity: 1 } : { width: '100%', height: 160, opacity: 0, position: 'absolute', inset: 0, pointerEvents: 'none' }}
            />
          )}
        </>
      )}
    </div>
  );
}

/** An icon from the shipped sprite (public/ds/icons), tinted with currentColor. */
function Sym({ name }: { name: string }) {
  const url = `url("${BASE}ds/icons/${name}.svg")`;
  return <span className="doc-sym" style={{ width: 16, height: 16, WebkitMaskImage: url, maskImage: url }} aria-hidden />;
}

/**
 * One example as a playground: a bar (Preview / Code, zoom, Copy) above its own container, set apart from the page
 * by its surface, where the component sits centred. Preview and Code switch inside the same container.
 */
export function Example({ title, html, jsx, live, image, imageSize, width, height, ctx, win, crop, panel, index = 0 }: { title?: string; html: string; jsx?: string; live?: ExampleData['live']; image?: string | null; imageSize?: [number, number]; width?: number | null; height?: number | null; ctx?: SpecimenContext | null; win?: WindowRef | null; crop?: string | null; panel?: boolean; index?: number }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  // the code: the JSX the example is written with (read from React), else its markup
  const code = useMemo(() => (jsx ? jsx : formatHtml(html)), [jsx, html]);
  const id = title ? 'ex-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + (index ? '-' + index : '') : undefined;
  const copy = () =>
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }, () => undefined);
  const staticPreview = image ? <NativeShot src={image} w={imageSize?.[0]} h={imageSize?.[1]} /> : <LiveMarkup html={html} width={width} boxHeight={height} ctx={ctx} panel={panel} />;
  return (
    <div className="doc-example">
      {title && (
        <div className="doc-example-head">
          <h3 id={id}>{title}</h3>
        </div>
      )}
      <div className="doc-playground">
        <div className="doc-playground-bar">
          <div className="doc-playground-tabs" role="tablist" aria-label="Example view">
            <button role="tab" aria-selected={tab === 'preview'} className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>
              <Sym name="eye" />
              Preview
            </button>
            {code && (
              <button role="tab" aria-selected={tab === 'code'} className={tab === 'code' ? 'on' : ''} onClick={() => setTab('code')}>
                <Sym name="code" />
                Code
              </button>
            )}
          </div>
          <div className="doc-playground-actions">
            {tab === 'preview' && !win && (
              <button className="doc-playground-btn" aria-pressed={zoom === 2} onClick={() => setZoom(zoom === 1 ? 2 : 1)} title="Zoom">
                <Sym name="magnifying-glass-plus" />
                {zoom * 100}%
              </button>
            )}
            {code && (
              <button className="doc-playground-btn" onClick={copy}>
                <Sym name={copied ? 'check' : 'copy-clipboard'} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>
        <div className={'doc-playground-stage' + (tab === 'code' ? ' code' : '') + (win ? ' window' : '')}>
          {tab === 'preview' ? (
            <div className="doc-canvas" style={{ zoom }}>
              {win ? <WindowPreview win={win} crop={crop} /> : live ? <LiveSpecimen live={live} fallback={staticPreview} /> : staticPreview}
            </div>
          ) : (
            <CodeBlock code={code} lang={jsx ? 'tsx' : 'html'} bare />
          )}
        </div>
      </div>
    </div>
  );
}

/** A native WebKit render (2×), shown at its size in points; the size reserves its space before it loads. */
export function NativeShot({ src, alt = '', w, h }: { src: string; alt?: string; w?: number; h?: number }) {
  return (
    <img
      className="doc-native"
      src={src.replace(/^\/ds\//, `${BASE}ds/`)}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={w}
      height={h}
      style={{ width: w, maxWidth: '100%', height: 'auto', aspectRatio: w && h ? `${w} / ${h}` : undefined }}
    />
  );
}
