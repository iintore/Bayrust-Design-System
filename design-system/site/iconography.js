// Iconography & brand: the shipped sprite rendered through Raycast's Icon component, every shipped image
// asset by family, native Assets.car exports, the Logo component, fonts and sounds.
import { h, React, component } from './runtime.js';
import { Section } from './foundations.js';
import { LogoSwitcher } from './components.js';

const Icon = await component('icon-CKbK2z_d.js', 'Icon');
const Logo = await component('logo-BeUik7hM.js', 'Logo');

function Icons({ data, t }) {
  const [q, setQ] = React.useState('');
  const [size, setSize] = React.useState('16');
  const list = data.manifest.symbols.filter((s) => s.id.includes(q.toLowerCase()));
  return h(
    Section,
    {
      t,
      note: `${data.manifest.symbols.length} symbols from ${data.manifest.sprite}, rendered with the app's Icon component (served the native way via ipc://raycast-sprite/<name>). Color follows currentColor.`,
    },
    h(
      'div',
      { className: 'ds-toolbar' },
      h('input', { className: `ds-input ${t('text')}`, placeholder: 'Filter icons…', value: q, onChange: (e) => setQ(e.target.value) }),
      ['12', '16', '22', '32'].map((s) =>
        h(
          'button',
          { key: s, className: `ds-pill ${t('small-text-strong')}`, 'data-active': s === size || undefined, onClick: () => setSize(s) },
          `--icon-${s}`,
        ),
      ),
      h('span', { className: t('small-text', { color: 'tertiary' }) }, `${list.length} shown`),
    ),
    // The original sprite file, loaded as an image so asset capture records its exact bytes.
    h('img', { src: `/${data.manifest.sprite}`, alt: '', width: 1, height: 1, style: { position: 'absolute', opacity: 0, pointerEvents: 'none' } }),
    h(
      'div',
      { className: 'ds-icon-grid', style: { '--ds-icon': `var(--icon-${size})` } },
      list.map((s) =>
        h(
          'div',
          { key: s.id, className: 'ds-icon-cell', title: `${s.id} · viewBox ${s.viewBox}` },
          h(Icon, { name: s.id, className: 'ds-icon' }),
          h('span', { className: t('mini-text', { color: 'secondary' }) }, s.id),
        ),
      ),
    ),
  );
}

function Assets({ data, t }) {
  const fams = [...new Set(data.manifest.assets.map((a) => a.family))].filter((f) => !['Fonts', 'Video'].includes(f));
  const [fam, setFam] = React.useState(fams[0]);
  const list = data.manifest.assets.filter((a) => a.family === fam);
  return h(
    Section,
    { t, note: 'Original files from the frontend bundle (content-hashed names kept). Nothing is redrawn.' },
    h(
      'div',
      { className: 'ds-toolbar' },
      fams.map((f) =>
        h(
          'button',
          { key: f, className: `ds-pill ${t('small-text-strong')}`, 'data-active': f === fam || undefined, onClick: () => setFam(f) },
          `${f} (${data.manifest.assets.filter((a) => a.family === f).length})`,
        ),
      ),
    ),
    h(
      'div',
      { className: 'ds-asset-grid' },
      list.map((a) =>
        h(
          'a',
          { key: a.file, className: 'ds-asset', href: `/${a.file}`, target: '_blank', title: `${a.file} · ${a.bytes} bytes` },
          h('div', { className: 'ds-asset-img' }, h('img', { src: `/${a.file}`, loading: 'lazy', alt: a.name })),
          h('span', { className: t('mini-text', { color: 'secondary' }) }, a.name),
        ),
      ),
    ),
  );
}

const NATIVE = ['production-appicon', 'internal-appicon', 'development-appicon', 'RayConfig'];
const MENUBAR = [
  'logo-small',
  'logo-small-lines-rounded',
  'logo-small-lines-square',
  'raycast-focus-40',
  'app-window-list-16',
  'envelope-16',
  'info-01-16',
  'slack-logo-16',
  'speech-bubble-important-16',
  'target-16',
  'warning-16',
  'x-16',
  'youtube-mono-16',
];

function Brand({ data, t }) {
  return h(
    'div',
    null,
    h(
      Section,
      {
        t,
        title: 'Logo component',
        note: 'Logo (logo-*.js): two vector variants — lines-square and lines-rounded (240×240 viewBox) — and three flavors: Production (fill var(--red)), Internal (purple→blue gradient), Development (#e57643 dark / #c74107 light → yellow).',
      },
      h(LogoSwitcher, { t, size: 96 }),
    ),
    h(
      Section,
      { t, title: 'App icons', note: 'Exported from the app bundle’s Contents/Resources/Assets.car via NSBundle.image(forResource:) at 1024px.' },
      h(
        'div',
        { className: 'ds-wrap' },
        NATIVE.map((n) =>
          h(
            'div',
            { key: n, className: 'ds-specimen-tile' },
            h('img', { src: `/ds-data/design-system/assets/native/app-icons/${n}-1024.png`, width: 128, height: 128 }),
            h('span', { className: t('small-text', { color: 'secondary' }) }, n),
          ),
        ),
      ),
    ),
    h(
      Section,
      { t, title: 'Native menu bar & HUD glyphs', note: 'icons/* entries of Assets.car (template images; PDF vectors exported alongside).' },
      h(
        'div',
        { className: 'ds-wrap' },
        MENUBAR.map((n) =>
          h(
            'div',
            { key: n, className: 'ds-specimen-tile ds-glyph' },
            h('img', { src: `/ds-data/design-system/assets/native/menu-bar/${n}.png`, width: 32, height: 32 }),
            h('span', { className: t('mini-text', { color: 'secondary' }) }, n),
          ),
        ),
      ),
    ),
    h(
      Section,
      { t, title: 'Fonts' },
      data.manifest.assets
        .filter((a) => a.family === 'Fonts')
        .map((a) => h('div', { key: a.file, className: t('small-mono-text') }, `${a.file} · ${(a.bytes / 1024).toFixed(0)} KB`)),
    ),
    h(
      Section,
      { t, title: 'Video' },
      h(
        'div',
        { className: 'ds-wrap' },
        data.manifest.assets
          .filter((a) => a.family === 'Video')
          .map((a) =>
            h(
              'figure',
              { key: a.file, className: 'ds-video' },
              h('video', { src: `/${a.file}`, muted: true, loop: true, autoPlay: true, playsInline: true }),
              h('figcaption', { className: t('mini-text', { color: 'secondary' }) }, a.file),
            ),
          ),
      ),
    ),
    h(
      Section,
      { t, title: 'Sounds', note: 'Dictation feedback sounds shipped in Contents/Resources/audio.' },
      data.manifest.audio.map((a) =>
        h(
          'div',
          { key: a.file, className: 'ds-audio' },
          h('span', { className: t('small-mono-text') }, a.name),
          h('audio', { controls: true, src: `/ds-data/reference/${a.file}` }),
        ),
      ),
    ),
  );
}

export const iconography = [
  { id: 'icons', label: 'Icons (sprite)', level: 'Iconography', render: Icons },
  { id: 'assets', label: 'Images & Illustrations', level: 'Iconography', render: Assets },
  { id: 'brand', label: 'Brand, App Icons & Media', level: 'Iconography', render: Brand },
];
