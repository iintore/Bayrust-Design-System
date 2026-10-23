// Every named component in the shipped bundle (displayName), with module, export and recovered props.
import { h, React } from './runtime.js';
import { Section } from './foundations.js';
export function componentIndex({ data, t }) {
  const [q, setQ] = React.useState('');
  const names = Object.keys(data.props).filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  return h(Section, { t, note: `${Object.keys(data.props).length} components recovered from displayName assignments in the shipped JavaScript (research/component-inventory.json, research/component-props.json).` },
    h('input', { className: `ds-input ${t('text')}`, placeholder: 'Filter components…', value: q, onChange: (e) => setQ(e.target.value) }),
    h('table', { className: `ds-table ${t('small-text')}` }, h('tbody', null, names.slice(0, 400).map((n) => { const p = data.props[n]; return h('tr', { key: n },
      h('td', { className: t('small-text-strong') }, n), h('td', { className: t('small-mono-text', { color: 'tertiary' }) }, p.module),
      h('td', { className: t('small-mono-text', { color: 'secondary' }) }, p.props.map((x) => x.name).join(', '))); }))),
    names.length > 400 && h('p', { className: t('small-text', { color: 'tertiary' }) }, `${names.length - 400} more — refine the filter.`));
}
