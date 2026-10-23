import { useMemo, useState } from 'react';
import content from './content/content.json';
import type { Page, Shot } from './data';
import { useTheme } from './theme';
import { NativeShot } from './Preview';

const BASE = import.meta.env.BASE_URL;
interface Tok {
  name: string;
  value: string | Record<string, string>;
  usage: string;
}
const T = content.tokens as unknown as {
  color: { groups: { name: string; tokens: Tok[] }[] };
  type: { families: Record<string, string>; styles: { name: string; family: string; fontSize: number; fontWeight: number }[] };
  spacing: { tokens: Tok[] };
  radius: { tokens: Tok[] };
  shadow: { tokens: Tok[] };
};
const val = (t: Tok, theme: string) => (typeof t.value === 'string' ? t.value : t.value[theme] ?? t.value.dark);
// Window base under each theme, so translucent tokens show as they do in the app.
const GROUND: Record<string, string> = { light: '#ffffff', dark: '#262626' };

// Usage notes mention tokens in backticks; show them as code.
function Usage({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part))}
    </>
  );
}

function CopyName({ name, copy }: { name: string; copy?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="doc-token-name"
      title="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(copy ?? `var(--${name})`).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1200);
        }, () => undefined);
      }}
    >
      {done ? 'Copied' : copy ? name : `--${name}`}
    </button>
  );
}

export function ColorGallery() {
  return (
    <div className="doc-colors">
      {T.color.groups.map((g) => (
        <div key={g.name}>
          <h3 id={'colors-' + g.name.toLowerCase().replace(/[^a-z]+/g, '-')}>{g.name}</h3>
          <div className="doc-swatches">
            {g.tokens.map((t) => (
              <div key={t.name} className="doc-swatch">
                <div className="doc-swatch-chips">
                  {(['light', 'dark'] as const).map((m) => (
                    <span key={m} className={m} style={{ background: `linear-gradient(${val(t, m)}, ${val(t, m)}), ${GROUND[m]}` }}>
                      <i>{m === 'light' ? 'Light' : 'Dark'}</i>
                      {val(t, m)}
                    </span>
                  ))}
                </div>
                <div className="doc-swatch-meta">
                  <CopyName name={t.name} />
                  <p>
                    <Usage text={t.usage} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TypeScale() {
  return (
    <div className="doc-type">
      {T.type.styles.map((s) => (
        <div key={s.name} className="doc-type-row">
          <div className="doc-type-meta">
            <CopyName name={s.name} copy={s.name} />
            <span>
              {s.family === 'mono' ? 'JetBrains Mono' : 'Inter'} · {s.fontSize}px · {s.fontWeight}
            </span>
          </div>
          <div>
            <div style={{ fontFamily: T.type.families[s.family], fontSize: s.fontSize, fontWeight: s.fontWeight, fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1, "ss03" 1' }}>Search for apps and commands…</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Scale({ tokens, render }: { tokens: Tok[]; render: (t: Tok) => React.ReactNode }) {
  return (
    <div className="doc-scale">
      {tokens.map((t) => (
        <div key={t.name} className="doc-scale-row">
          <CopyName name={t.name} />
          <span className="doc-scale-val">{typeof t.value === 'string' && t.value.length < 24 ? t.value : ''}</span>
          <div className="doc-scale-vis">{render(t)}</div>
          <p>
            <Usage text={t.usage} />
          </p>
        </div>
      ))}
    </div>
  );
}

export const SpacingScale = () => <Scale tokens={T.spacing.tokens} render={(t) => <span className="doc-bar" style={{ width: Math.min(parseFloat(t.value as string), 260) }} />} />;
export const RadiusScale = () => <Scale tokens={T.radius.tokens} render={(t) => <span className="doc-radius" style={{ borderRadius: Math.min(parseFloat(t.value as string), 40) }} />} />;

export function Elevation() {
  const theme = useTheme();
  return (
    <Scale
      tokens={T.shadow.tokens}
      render={(t) => (
        <span className="doc-elev">
          <span style={{ boxShadow: val(t, theme) }} />
        </span>
      )}
    />
  );
}

export function IconGallery() {
  const icons = content.icons as string[];
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState('');
  const names = useMemo(() => icons.filter((n) => n.toLowerCase().includes(q.toLowerCase())), [icons, q]);
  return (
    <div>
      <label className="doc-filter">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${icons.length} icons`} aria-label="Filter icons" />
      </label>
      <div className="doc-icons">
        {names.map((n) => {
          const url = `url("${BASE}ds/icons/${n}.svg")`;
          return (
            <button
              key={n}
              className="doc-icon-tile"
              title={`Copy ipc://raycast-sprite/${n}#s`}
              onClick={() => {
                navigator.clipboard?.writeText(`ipc://raycast-sprite/${n}#s`).then(() => {
                  setCopied(n);
                  window.setTimeout(() => setCopied(''), 1200);
                }, () => undefined);
              }}
            >
              <span className="doc-sym" style={{ width: 16, height: 16, WebkitMaskImage: url, maskImage: url }} />
              <span className="doc-icon-name">{copied === n ? 'Copied' : n}</span>
            </button>
          );
        })}
        {!names.length && <p className="doc-muted">No icon matches “{q}”.</p>}
      </div>
    </div>
  );
}

export function LogoShowcase({ page }: { page: Page }) {
  return (
    <div className="doc-logos">
      {(page.shots ?? []).map((s) => (
        <figure key={s.src}>
          <div className="doc-logo-stage">
            <img src={s.src.replace(/^\/ds\//, `${BASE}ds/`)} width={s.w ?? 128} height={s.w ?? 128} alt={`${s.caption} app icon`} />
          </div>
          <figcaption>{s.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Native renders, grouped when the page has several paths (onboarding variants). */
export function Screens({ page }: { page: Page }) {
  useTheme();
  const groups = new Map<string, Shot[]>();
  for (const s of page.shots ?? []) groups.set(s.group ?? '', [...(groups.get(s.group ?? '') ?? []), s]);
  return (
    <div className="doc-screens">
      {[...groups].map(([g, shots]) => (
        <div key={g}>
          {g && <h3 id={'states-' + g.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{g}</h3>}
          {shots.map((s) => (
            <figure key={s.src}>
              <NativeShot src={s.src} alt={s.caption} w={s.w} h={s.h} />
              <figcaption>{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Shipped image files (illustrations, imagery), grouped, at their own size up to the column width. */
export function Gallery({ page }: { page: Page }) {
  const groups = new Map<string, NonNullable<Page['gallery']>>();
  for (const g of page.gallery ?? []) groups.set(g.group ?? '', [...(groups.get(g.group ?? '') ?? []), g]);
  return (
    <div className="doc-gallery-files">
      {[...groups].map(([name, items]) => (
        <div key={name}>
          {name && <h3 id={'files-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{name}</h3>}
          <div className={'doc-files' + (name ? ' small' : '')}>
            {items.map((g) => (
              <figure key={g.src}>
                <div className="doc-file-stage">
                  {g.video ? (
                    <video src={g.src.replace(/^\/ds\//, `${BASE}ds/`)} muted loop autoPlay playsInline />
                  ) : (
                    <img src={g.src.replace(/^\/ds\//, `${BASE}ds/`)} alt={g.caption} loading="lazy" style={{ maxWidth: g.w ? Math.min(g.w / (name ? 1 : 2), 100000) : undefined }} />
                  )}
                </div>
                <figcaption>
                  {g.caption}
                  {g.w ? <span> · {g.w} × {g.h}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The bundled themes, drawn from their own base colours. */
export function ThemeTable({ page }: { page: Page }) {
  const hues = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta'];
  return (
    <div className="doc-themes">
      {(page.themes ?? []).map((t) => (
        <figure key={t.id} className="doc-theme-card">
          <div className="doc-theme-stage" style={{ background: `linear-gradient(to bottom, ${t.background}, ${t.backgroundSecondary})`, color: t.foreground }}>
            <span className="doc-theme-name">{t.name.replace('Raycast', 'Bayrust')}</span>
            <span className="doc-theme-sel" style={{ background: t.selection, opacity: 0.2 }} />
            <span className="doc-theme-hues">
              {hues.map((h) => (
                <i key={h} title={`${h} ${t[h]}`} style={{ background: t[h] }} />
              ))}
              <i title={`accent ${t.accent}`} style={{ background: t.accent, outline: `1px solid ${t.foreground}` }} />
            </span>
          </div>
          <figcaption>
            {t.appearance} · {t.background} / {t.backgroundSecondary} · text {t.foreground}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
