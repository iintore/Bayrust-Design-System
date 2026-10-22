// Bayrust Design System — rendered with Bayrust's own runtime, components, stylesheets and assets.
import { h, ReactDOM, React, mod, services, json } from './runtime.js';
import { foundations } from './foundations.js';
import { iconography } from './iconography.js';
import { atoms, molecules, organisms } from './components.js';
import { composed } from './composed.js';
import { templates } from './templates.js';
import { flows } from './flows.js';
import { componentIndex } from './component-index.js';
import { overview } from './overview.js';

const text = await mod('text-dqPlQ8gN.js');
export const t = (variant, opts) => text.i(variant, opts); // the app's named text styles, e.g. t('heading1')

const data = {
  tokens: await json('/ds-data/design-system/tokens/bayrust.tokens.json'),
  props: await json('/ds-data/research/component-props.json'),
  manifest: await json('/ds/manifest.json'),
};

const sections = [
  { id: 'overview', label: 'Overview', level: 'Start', render: overview },
  ...foundations,
  ...iconography,
  ...atoms,
  ...molecules,
  ...organisms,
  ...composed,
  ...templates,
  ...flows,
  { id: 'component-index', label: 'Component Index', level: 'Reference', render: componentIndex },
];

function Nav({ current, onSelect }) {
  const levels = [...new Set(sections.map((s) => s.level))];
  return h(
    'nav',
    { className: 'ds-nav' },
    h('div', { className: `ds-brand ${t('text-strong')}` }, 'Bayrust Design System'),
    h('div', { className: t('small-text', { color: 'tertiary' }) }, 'Bayrust 2.8.2 · built from the shipped app'),
    levels.map((level) =>
      h(
        'div',
        { key: level, className: 'ds-nav-group' },
        h('div', { className: `ds-nav-level ${t('small-text-strong', { color: 'tertiary' })}` }, level),
        sections
          .filter((s) => s.level === level)
          .map((s) =>
            h(
              'a',
              {
                key: s.id,
                href: `#${s.id}`,
                'data-active': s.id === current || undefined,
                className: `ds-nav-item ${t('text', { color: s.id === current ? 'primary' : 'secondary' })}`,
                onClick: () => {
                  onSelect(s.id);
                  document.querySelector('.ds-main')?.scrollTo(0, 0);
                },
              },
              s.label,
            ),
          ),
      ),
    ),
  );
}

function Theme() {
  return h(
    'div',
    { className: 'ds-theme-switch' },
    ['dark', 'light'].map((a) =>
      h(
        'button',
        {
          key: a,
          className: t('small-text-strong'),
          onClick: () => setAppearance(a),
        },
        a === 'dark' ? 'Bayrust Dark' : 'Bayrust Light',
      ),
    ),
  );
}

async function setAppearance(appearance) {
  const svc = await services();
  const actions = svc.windowStateStore.actions;
  (actions.updateAppearance || actions.setAppearance)?.(appearance);
  localStorage.setItem('ds-appearance', appearance);
}

function App() {
  const [current, setCurrent] = React.useState(location.hash.slice(1) || 'overview');
  React.useEffect(() => {
    const f = () => setCurrent(location.hash.slice(1) || 'overview');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const section = sections.find((s) => s.id === current) || sections[0];
  return h(
    'div',
    { className: 'ds-layout' },
    h(Nav, { current, onSelect: setCurrent }),
    h(
      'main',
      { className: 'ds-main' },
      h(
        'header',
        { className: 'ds-header' },
        h(
          'div',
          null,
          h('div', { className: t('small-text-strong', { color: 'tertiary' }) }, section.level),
          h('h1', { className: t('heading1') }, section.label),
        ),
        h(Theme),
      ),
      h(section.render, { data, t, key: section.id }),
    ),
  );
}

// Bayrust's WindowShell provides ServiceContext, AppearanceContext and the toast/alert/HUD hosts.
const WindowShell = (await mod('window-shell-B9r2-F80.js')).t;
const root = ReactDOM.createRoot(document.getElementById('ds-root'));
const params = new URLSearchParams(location.search);
if (params.get('specimen')) {
  // Specimen mode, for the docs: one specimen (or one of its rows), live, on a transparent page; its size is posted
  // to the embedding page. ?specimen=<name>&row=<n>&appearance=dark|light&id=<docs id>
  const { specimenList } = await import('./components.js');
  const { composedList } = await import('./composed.js');
  const s = [...composedList(), ...specimenList()].find((x) => x.name === params.get('specimen'));
  document.documentElement.classList.add('no-background');
  document.body.classList.add('ds-specimen-mode');
  function Specimen() {
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
      const el = ref.current;
      const rows = [...el.querySelectorAll('.ds-row')].filter((r) => !r.parentElement.closest('.ds-row'));
      const n = params.get('row');
      if (n !== null)
        rows.forEach((r, i) => {
          if (i !== Number(n)) r.style.display = 'none';
        });
      const post = () => {
        const r = el.getBoundingClientRect();
        parent.postMessage({ type: 'bayrust-specimen', id: params.get('id'), w: Math.ceil(r.width), h: Math.ceil(r.height) }, '*');
      };
      const ro = new ResizeObserver(post);
      ro.observe(el);
      post();
      return () => ro.disconnect();
    }, []);
    return h('div', { ref, className: 'ds-specimen-stage' }, s ? s.render(t) : h('div', null, `No specimen “${params.get('specimen')}”`));
  }
  root.render(h(WindowShell, null, h(Specimen)));
  setAppearance(params.get('appearance') ?? 'dark');
} else {
  root.render(h(WindowShell, null, h(App)));
  const saved = localStorage.getItem('ds-appearance');
  if (saved) setAppearance(saved);
}
