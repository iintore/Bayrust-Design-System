import { h } from './runtime.js';
import { Section } from './foundations.js';
export function overview({ data, t }) {
  const n = (x) => x.toLocaleString();
  return h(
    'div',
    null,
    h(
      Section,
      {
        t,
        note: 'Every color, size, icon, image, animation and component on these pages is rendered by the app’s own shipped code and stylesheets (Bayrust 2.8.2, built from the shipped macOS app), running in a local harness with its real backend in a sandbox. Nothing is redrawn or approximated; where a layer is native (window vibrancy, Liquid Glass), it is called out and documented from real-window captures.',
      },
      h(
        'div',
        { className: 'ds-stats' },
        [
          [n(Object.keys(data.props).length), 'named components'],
          [n(data.manifest.symbols.length), 'sprite icons'],
          [n(data.manifest.assets.length), 'image/media assets'],
          [n(Object.values(data.tokens).reduce((a, g) => a + Object.keys(g).length, 0)), 'design tokens'],
          ['8', 'window templates'],
          ['13', 'onboarding states'],
        ].map(([v, l]) =>
          h(
            'div',
            { key: l, className: 'ds-stat' },
            h('div', { className: t('heading1') }, v),
            h('div', { className: t('small-text', { color: 'secondary' }) }, l),
          ),
        ),
      ),
    ),
    h(
      Section,
      { t, title: 'How it was extracted' },
      h(
        'ol',
        { className: `ds-list-plain ${t('text', { color: 'secondary' })}` },
        [
          'REA (morluto/rea) — analyze-javascript-application on the frontend bundle; inspect-asset-catalog on the app bundle.',
          'Harness — serves the shipped frontend unmodified; stubs only the WKWebView bridge; runs the shipped Node backend sandboxed (HOME = harness/sandbox-home).',
          'Host data from this Mac (installed/running apps, icons, keyboard layout ABC) via AppKit; public API data (suggested extensions) fetched as the backend does.',
          'web-icon-extraction-workflow — capture.js (unmodified) bound to Playwright; packaged SVGs, originals, manifests and coverage.',
          'Tokens resolved at runtime in Bayrust Dark and Bayrust Light; variants from CSS module selectors; props from component source.',
        ].map((s) => h('li', { key: s }, s)),
      ),
    ),
  );
}
