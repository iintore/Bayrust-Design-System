// Flows: ordered state captures of the shipped UI. Images are native WebKit renders (Raycast's engine, with
// -apple-visual-effect glass and native child panels composited at their computed frames) where available.
import { h, json } from './runtime.js';
import { Section } from './foundations.js';

const FLOWS = await json('/ds/flows.json');
function FlowPage({ t, flow }) {
  return h(
    'div',
    null,
    flow.groups.map((g) =>
      h(
        Section,
        { key: g.label, t, title: g.label },
        h(
          'div',
          { className: 'ds-flow' },
          g.states.map((s, i) =>
            h(
              'figure',
              { key: s.id, className: 'ds-flow-step' },
              h('a', { href: s.url, target: '_blank', title: 'Open the live state in the harness' }, h('img', { src: `/ds-data/${s.image}`, loading: 'lazy' })),
              h(
                'figcaption',
                null,
                h('span', { className: t('small-text-strong') }, `${i + 1}/${g.states.length} · ${s.label.split('—').pop().trim()}`),
                h(
                  'span',
                  { className: t('mini-text', { color: 'tertiary' }) },
                  `${s.viewport.width}×${s.viewport.height} · ${s.engine === 'webkit' ? 'WebKit (native)' : 'Chromium'} · ${s.ipc.length} host/backend methods${s.panels.length ? ` · ${s.panels.length} native panel` : ''}`,
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
export const flows = FLOWS.map((f) => ({ id: `flow-${f.id}`, label: f.label, level: 'Flows', render: (p) => h(FlowPage, { ...p, flow: f }) }));
