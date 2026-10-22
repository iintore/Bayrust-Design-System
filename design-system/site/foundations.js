// Foundations: every value below is a shipped CSS custom property, rendered live through var(--token)
// and annotated with its resolved Raycast Dark / Raycast Light values from tokens/raycast.tokens.json.
import { h, json, React } from './runtime.js';

const flat = (tokens) => Object.fromEntries(Object.values(tokens).flatMap((g) => Object.entries(g)));
const info = (data, name) => flat(data.tokens)[name]?.$extensions?.raycast;
const PALETTE = ['bg', 'bg-secondary', 'fg', 'accent', 'selection', 'loader', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta'];
const STEPS = ['', '-80', '-60', '-40', '-20', '-10', '-5', '-0'];

export function Section({ t, title, children, note }) {
  return h(
    'section',
    { className: 'ds-section' },
    title && h('h2', { className: t('heading2') }, title),
    note && h('p', { className: `ds-note ${t('text', { color: 'secondary' })}` }, note),
    children,
  );
}
export function TokenRow({ data, t, name, preview }) {
  const i = info(data, name) || {};
  return h(
    'div',
    { className: 'ds-token-row' },
    h('div', { className: 'ds-token-preview' }, preview),
    h('code', { className: t('small-mono-text') }, `--${name}`),
    h('span', { className: t('small-mono-text', { color: 'secondary' }) }, i.source ?? ''),
    h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, i.dark ?? ''),
    h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, i.light ?? ''),
  );
}
const TokenHead = ({ t }) =>
  h(
    'div',
    { className: `ds-token-row ds-token-head ${t('small-text-strong', { color: 'tertiary' })}` },
    h('span', null, ''),
    h('span', null, 'Token'),
    h('span', null, 'Source'),
    h('span', null, 'Bayrust Dark'),
    h('span', null, 'Bayrust Light'),
  );
const swatch = (name) => h('div', { className: 'ds-swatch', style: { background: `var(--${name})` } });

function Color({ data, t }) {
  const group = (prefix) => Object.keys(data.tokens['color.' + prefix] || {});
  return h(
    'div',
    null,
    h(
      Section,
      {
        t,
        title: 'System accent',
        note: 'On macOS the host injects the system accent colour; --accent is var(--color-system-accent, var(--theme-accent)), so the macOS accent (here Blue, #007AFF) overrides the theme accent everywhere accent is used.',
      },
      h(
        'div',
        { className: 'ds-wrap' },
        ['color-system-accent', 'accent'].map((n) =>
          h(
            'div',
            { key: n, className: 'ds-chip' },
            h('div', { className: 'ds-swatch', style: { background: `var(--${n})` } }),
            h('code', { className: t('small-mono-text') }, `--${n}`),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        t,
        title: 'Theme palette',
        note: 'Each theme defines 13 base colors (bundled-raycast-dark / bundled-raycast-light). Every base color is expanded into alpha steps with rgb(from var(--x) r g b / n%).',
      },
      h(
        'div',
        { className: 'ds-palette' },
        PALETTE.map((c) =>
          h(
            'div',
            { key: c, className: 'ds-palette-col' },
            h('div', { className: t('small-text-strong') }, c),
            STEPS.map(
              (s) =>
                info(data, c + s) &&
                h(
                  'div',
                  { key: s, className: 'ds-palette-cell', title: `--${c}${s}` },
                  swatch(c + s),
                  h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, s ? s.slice(1) + '%' : '100%'),
                ),
            ),
          ),
        ),
      ),
    ),
    ['text', 'border', 'surface', 'semantic', 'other'].map((g) =>
      h(
        Section,
        {
          key: g,
          t,
          title: { text: 'Text', border: 'Border', surface: 'Surfaces & window', semantic: 'Semantic, contrast & on-tint', other: 'Brand & other' }[g],
        },
        h(TokenHead, { t }),
        group(g).map((n) =>
          h(TokenRow, {
            key: n,
            data,
            t,
            name: n,
            preview: g === 'text' ? h('span', { className: t('text-strong'), style: { color: `var(--${n})` } }, 'Aa') : swatch(n),
          }),
        ),
      ),
    ),
  );
}

const TEXT_STYLES = [
  ['heading1', 'inter', 24, 600],
  ['heading2', 'inter', 18, 600],
  ['extra-large-text', 'inter', 18, 400],
  ['extra-large-text-strong', 'inter', 18, 500],
  ['large-text', 'inter', 16, 400],
  ['large-text-strong', 'inter', 16, 500],
  ['text', 'inter', 13, 400],
  ['text-strong', 'inter', 13, 500],
  ['small-text', 'inter', 11, 400],
  ['small-text-strong', 'inter', 11, 500],
  ['mini-text', 'inter', 8, 400],
  ['mini-text-strong', 'inter', 8, 500],
  ['mono-text', 'mono', 13, 400],
  ['mono-text-strong', 'mono', 13, 600],
  ['small-mono-text', 'mono', 11, 400],
];
const TEXT_COLORS = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'disabled',
  'link',
  'accent',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'magenta',
];

function Typography({ data, t }) {
  return h(
    'div',
    null,
    h(
      Section,
      {
        t,
        title: 'Typefaces',
        note: 'InterVariable (normal + italic, weights 100–900) and JetBrains Mono Regular, shipped as woff2. Root features: "liga" 1, "calt" 1, "kern" 1, "ss03" 1; font-synthesis none; -webkit-font-smoothing subpixel-antialiased on macOS.',
      },
      h(
        'div',
        { className: 'ds-type-specimen' },
        h('div', { className: t('heading1'), style: { fontSize: 56, lineHeight: 1.1 } }, 'Inter Variable'),
        h('div', { className: t('mono-text'), style: { fontSize: 32 } }, 'JetBrains Mono'),
        h('div', { className: t('large-text', { color: 'secondary' }) }, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ⌘⌥⇧⌃↵⇥⌫'),
      ),
    ),
    h(
      Section,
      { t, title: 'Text styles', note: 'The 15 named styles from the shipped text module (text.i(variant)). Sizes are --font-size-* tokens scaled by --zoom.' },
      TEXT_STYLES.map(([name, font, size, weight]) =>
        h(
          'div',
          { key: name, className: 'ds-type-row' },
          h('div', { className: t(name) }, 'Search for apps and commands…'),
          h('code', { className: t('small-mono-text', { color: 'secondary' }) }, name),
          h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, `${font === 'mono' ? 'JetBrains Mono' : 'Inter'} · ${size}px · ${weight}`),
        ),
      ),
    ),
    h(
      Section,
      { t, title: 'Text colors' },
      h(
        'div',
        { className: 'ds-wrap' },
        TEXT_COLORS.map((c) => h('div', { key: c, className: 'ds-chip' }, h('span', { className: t('text-strong', { color: c }) }, c))),
      ),
    ),
  );
}

function Scale({ data, t, prefix, render, note, title }) {
  const names = Object.values(data.tokens)
    .flatMap((g) => Object.keys(g))
    .filter((n) => n.startsWith(prefix))
    .sort((a, b) => parseFloat(a.split('-').pop()) - parseFloat(b.split('-').pop()));
  return h(
    Section,
    { t, title, note },
    h(TokenHead, { t }),
    names.map((n) => h(TokenRow, { key: n, data, t, name: n, preview: render(n) })),
  );
}

function Spacing(p) {
  return h(
    'div',
    null,
    h(Scale, {
      ...p,
      title: 'Spacing',
      prefix: 'space-',
      note: 'round(calc(n * var(--spx)), 1px) where --spx = 1px × --zoom (Interface Size setting).',
      render: (n) => h('div', { className: 'ds-bar', style: { width: `var(--${n})` } }),
    }),
    h(Scale, {
      ...p,
      title: 'Icon sizes',
      prefix: 'icon-',
      render: (n) => h('div', { className: 'ds-square', style: { width: `var(--${n})`, height: `var(--${n})` } }),
    }),
    h(Scale, { ...p, title: 'Font sizes', prefix: 'font-size-', render: (n) => h('span', { style: { fontSize: `var(--${n})` } }, 'Aa') }),
    h(Scale, { ...p, title: 'Font weights', prefix: 'font-weight-', render: (n) => h('span', { style: { fontWeight: `var(--${n})` } }, 'Aa') }),
  );
}

function Shape(p) {
  return h(
    'div',
    null,
    h(Scale, {
      ...p,
      title: 'Radius',
      prefix: 'radius-',
      note: '--radius-window resolves per OS: 26px on macOS 26, 20px on macOS 27, 8px on Windows. This page runs with the [macos="27"] root attribute.',
      render: (n) => h('div', { className: 'ds-radius', style: { borderRadius: `var(--${n})` } }),
    }),
    h(Scale, {
      ...p,
      title: 'Blur',
      prefix: 'blur-',
      note: 'macOS values; Windows overrides to 15/35/60/120px.',
      render: (n) =>
        h('div', { className: 'ds-blur-demo' }, h('div', { style: { backdropFilter: `blur(var(--${n}))`, WebkitBackdropFilter: `blur(var(--${n}))` } })),
    }),
    h(Scale, { ...p, title: 'Shadows', prefix: 'shadow-', render: (n) => h('div', { className: 'ds-shadow', style: { boxShadow: `var(--${n})` } }) }),
  );
}

function Materials({ data, t }) {
  return h(
    'div',
    null,
    h(
      Section,
      {
        t,
        title: 'Window material',
        note: 'On macOS the window backdrop is native vibrancy (NSVisualEffectView / Liquid Glass on macOS 27). The web layer paints .theme-root:before = linear-gradient(to bottom, var(--color-window-bg), var(--color-window-bg-secondary)) — i.e. --bg-40 → --bg-secondary-40 — on top. --color-window-base (#262626 dark / #fff light) is the opaque stand-in used where no vibrancy exists.',
      },
      h(
        'div',
        { className: 'ds-wrap' },
        h(
          'div',
          { className: 'ds-material', style: { background: 'var(--color-window-base)' } },
          h('div', { className: 'ds-material-layer' }),
          h('span', { className: t('small-text') }, 'window-base + window-bg gradient'),
        ),
        h(
          'div',
          { className: 'ds-material', style: { background: 'var(--color-panel-backdrop)' } },
          h('span', { className: t('small-text') }, '--color-panel-backdrop'),
        ),
        h(
          'div',
          { className: 'ds-material', style: { background: 'var(--color-panel-overlay)' } },
          h('span', { className: t('small-text') }, '--color-panel-overlay'),
        ),
      ),
    ),
    h(
      Section,
      { t, title: 'Window metrics', note: 'Measured from the native windows on this Mac (CGWindowList) and the shipped CSS.' },
      h(
        'table',
        { className: `ds-table ${t('small-text')}` },
        h(
          'tbody',
          null,
          [
            ['Main window (launcher)', '750 × 475', '--main-window-width / --main-window-expanded-height'],
            ['Main window header', '64px (macOS) / 66px', '--main-window-header-height'],
            ['Main window footer (action bar)', '44px (macOS) / 42px', '--main-window-footer-height'],
            ['Default window header / footer', '52px / 44px (macOS)', '--default-window-header-height / footer'],
            ['Notes footer (macOS 27)', '48px', '--notes-window-footer-height'],
            ['Welcome window', '1280 × 760', 'native (measured)'],
            ['Settings window', '800 × 786', 'native (measured)'],
            ['Theme Studio window', '1370 × 570', 'native (measured)'],
            ['Send Feedback window', '420 × 714', 'native (measured)'],
            ['Notes window', '396 × content height', 'raycast.resizeWindow'],
            ['AI Chat window', '750 × 600', 'saved frame on this Mac'],
            ['Pro walkthrough', '1280 × 760 / 712', 'pro-walkthrough-presentation.js'],
            ['Window radius', '20px (macOS 27) · 26px (macOS 26)', '--radius-window'],
            ['Hairline', '0.5px on 2× displays', '--half-pixel'],
            ['Focus ring', '2px solid fg @ 30%', '--focus-ring'],
          ].map(([a, b, c]) =>
            h(
              'tr',
              { key: a },
              h('td', null, a),
              h('td', { className: t('small-mono-text') }, b),
              h('td', { className: t('small-mono-text', { color: 'tertiary' }) }, c),
            ),
          ),
        ),
      ),
    ),
  );
}

function Motion({ t }) {
  const [m, setM] = React.useState(null);
  React.useEffect(() => {
    json('/ds/motion.json').then(setM);
  }, []);
  if (!m) return null;
  const list = (rows, fmt) =>
    h(
      'table',
      { className: `ds-table ${t('small-text')}` },
      h(
        'tbody',
        null,
        rows.map((r, i) => h('tr', { key: i }, fmt(r))),
      ),
    );
  return h(
    'div',
    null,
    h(
      Section,
      { t, title: 'Easing tokens' },
      list(
        [
          ['--easing-ease-out-expo', 'cubic-bezier(.16, 1, .3, 1)'],
          ['--easing-ease-out-back', 'cubic-bezier(.34, 1.56, .64, 1)'],
          ['--macos-27-glass-button-active-state-transition', 'transform .36s var(--easing-ease-out-back)'],
        ],
        ([a, b]) => [
          h('td', { key: 0, className: t('small-mono-text') }, a),
          h('td', { key: 1, className: t('small-mono-text', { color: 'secondary' }) }, b),
          h('td', { key: 2 }, h('div', { className: 'ds-ease', style: { '--ease': b.includes('transform') ? 'var(--easing-ease-out-back)' : b } })),
        ],
      ),
    ),
    h(
      Section,
      { t, title: 'Durations & easings in use', note: 'Frequency across all shipped stylesheets.' },
      h(
        'div',
        { className: 'ds-columns' },
        list(m.durations.slice(0, 16), ([d, n]) => [
          h('td', { key: 0, className: t('small-mono-text') }, d),
          h('td', { key: 1, className: t('small-mono-text', { color: 'tertiary' }) }, `×${n}`),
        ]),
        list(m.easings.slice(0, 16), ([d, n]) => [
          h('td', { key: 0, className: t('small-mono-text') }, d),
          h('td', { key: 1, className: t('small-mono-text', { color: 'tertiary' }) }, `×${n}`),
        ]),
      ),
    ),
    h(
      Section,
      { t, title: `Framer Motion transitions (${m.framerMotionTransitions.length})` },
      list(m.framerMotionTransitions, (r) => [
        h('td', { key: 0, className: t('small-mono-text') }, r.transition),
        h('td', { key: 1, className: t('small-mono-text', { color: 'tertiary' }) }, `×${r.count}`),
        h('td', { key: 2, className: t('small-mono-text', { color: 'tertiary' }) }, r.files.join(', ')),
      ]),
    ),
    h(
      Section,
      { t, title: `Keyframes (${m.keyframes.length})`, note: 'Verbatim from the shipped CSS modules.' },
      h(
        'div',
        { className: 'ds-keyframes' },
        m.keyframes.map((k) =>
          h(
            'details',
            { key: k.name + k.file },
            h('summary', { className: t('small-mono-text') }, `${k.name} `, h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, k.file)),
            h('pre', { className: t('small-mono-text', { color: 'secondary' }) }, k.css),
          ),
        ),
      ),
    ),
  );
}

export const foundations = [
  { id: 'color', label: 'Color', level: 'Foundations', render: Color },
  { id: 'typography', label: 'Typography', level: 'Foundations', render: Typography },
  { id: 'spacing', label: 'Spacing & Sizing', level: 'Foundations', render: Spacing },
  { id: 'shape', label: 'Radius, Blur & Shadow', level: 'Foundations', render: Shape },
  { id: 'materials', label: 'Materials & Windows', level: 'Foundations', render: Materials },
  { id: 'motion', label: 'Motion', level: 'Foundations', render: Motion },
];
