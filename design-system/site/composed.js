// Composed components: checklist items Bayrust doesn't ship as components, built only from its own parts —
// shipped React primitives (Button, IconButton, Avatar, InputField, Checkbox, CommandPanel, DatePicker, …), its
// named text styles and its token variables. Nothing here has a value of its own: every size, colour, radius and
// space is a Bayrust token or a shipped component's own styling. Each specimen names the parts it uses.
import { h, React, component, mod } from './runtime.js';
import { Section } from './foundations.js';
import './components.js'; // sets window.__dsPrimitives

const text = await mod('text-dqPlQ8gN.js');
const t = (v, o) => text.i(v, o);
const P = window.__dsPrimitives;
const C = async (file, name) =>
  component(file, name).catch((e) => {
    console.warn(`Bayrust: ${name} could not be loaded from ${file}; specimens using it will not render.`, e);
    return null;
  });
const X = {
  DatePicker: await C('date-picker-DGYqtT_d.js', 'DatePicker'),
  MultiSelect: await C('multi-select-KiFjfIT3.js', 'MultiSelect'),
  RadioItem: await C('button-radio-group-primitive.namespace-Cq6TCn-G.js', 'ButtonRadioGroupPrimitive.Item'),
  ActionButton: await C('action-button-BrPX43U1.js', 'ActionButton'),
  ActionButtonSeparator: await C('command-list-item-accessory-Dj_BTsa3.js', 'ActionButtonSeparator'),
  Markdown: await C('markdown-BzX5SNgt.js', 'Markdown'),
  SettingsTable: await C('settings-ui.namespace-DAWDtWTB.js', 'SettingsUI.Table'),
  SettingsTableRow: await C('settings-ui.namespace-DAWDtWTB.js', 'SettingsUI.TableRow'),
  DataListRoot: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Root'),
  DataListItem: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Item'),
  DataListLabel: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Label'),
  DataListValue: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Value'),
  DataListItems: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Items'),
  DataListTitle: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Title'),
  DataListSeparator: await C('data-list.namespace-BcgBDfOn.js', 'DataList.Separator'),
  ChatDropzoneOverlay: await C('context-window-breakdown-B-1opWw4.js', 'ChatDropzoneOverlay'),
  FormColumn: await C('form-layout.namespace-C3qKgtvN.js', 'FormLayout.Column'),
};
const shortcuts = await mod('shortcuts-CslcL67B.js');
const keys = shortcuts.f;
const cmd = new Proxy({}, { get: (_, k) => shortcuts.i[k].mac });
// ActionButton takes a shortcut per platform ({ mac, win }), as the app's shortcut tables define them
const anyPlatform = (k) => ({ mac: k, win: k });
// avatars without a picture are filled with a colour (in the app, the organization's): from the palette
const AVATAR_COLORS = ['var(--blue)', 'var(--purple)', 'var(--orange)', 'var(--green)'];

const row = (label, ...kids) =>
  h('div', { className: 'ds-row' }, h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, label), ...kids);
const flex = (style, ...kids) => h('div', { style: { display: 'flex', ...style } }, ...kids);
const icon = (name, size = 16, color) => h(P.Icon, { name, width: size, height: size, style: color ? { color } : undefined });
// Bayrust surfaces (tokens)
const panel = { background: 'var(--color-panel-background)', boxShadow: 'var(--shadow-panel)', borderRadius: 'var(--radius-12)' };
const card = { background: 'var(--color-surface-inner-panel)', borderRadius: 'var(--radius-12)', padding: 'var(--space-12)' };
const field = {
  background: 'var(--color-surface-input-field)',
  borderRadius: 'var(--radius-8)',
  boxShadow: 'inset 0 0 0 var(--half-pixel) var(--color-border-field)',
};
const HUES = ['var(--blue)', 'var(--purple)', 'var(--green)', 'var(--orange)', 'var(--magenta)', 'var(--yellow)', 'var(--red)'];
function Controlled({ init, children }) {
  const [v, set] = React.useState(init);
  return children(v, set);
}

// ---- charts: SVG drawn with Bayrust tokens (hues, fg-10 grid, small-mono-text labels)
const SERIES = [12, 18, 15, 24, 22, 30, 27, 34, 31, 38];
function axes(w, hgt) {
  return [0.25, 0.5, 0.75, 1].map((f) => h('line', { key: f, x1: 0, x2: w, y1: hgt * f, y2: hgt * f, stroke: 'var(--fg-10)', strokeWidth: 1 }));
}
function LineChart({ area }) {
  const w = 320,
    hh = 120,
    max = 40;
  const pts = SERIES.map((v, i) => [i * (w / (SERIES.length - 1)), hh - (v / max) * hh]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return h(
    'svg',
    { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, style: { overflow: 'visible' } },
    axes(w, hh),
    area && h('path', { d: `${d} L${w},${hh} L0,${hh} Z`, fill: 'var(--accent-20)' }),
    h('path', { d, fill: 'none', stroke: 'var(--accent)', strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' }),
  );
}
function Pie({ donut }) {
  const vals = [38, 24, 18, 12, 8],
    r = 56,
    c = 64;
  let a = -Math.PI / 2;
  const arcs = vals.map((v, i) => {
    const a2 = a + (v / 100) * Math.PI * 2;
    const p = [c + r * Math.cos(a), c + r * Math.sin(a), c + r * Math.cos(a2), c + r * Math.sin(a2)];
    const large = a2 - a > Math.PI ? 1 : 0;
    a = a2;
    return h('path', { key: i, d: `M${c},${c} L${p[0]},${p[1]} A${r},${r} 0 ${large} 1 ${p[2]},${p[3]} Z`, fill: HUES[i] });
  });
  return h('svg', { width: 128, height: 128 }, arcs, donut && h('circle', { cx: c, cy: c, r: 34, fill: 'var(--color-window-base)' }));
}
function Scatter() {
  const w = 320,
    hh = 120;
  const pts = [
    [20, 90],
    [48, 70],
    [70, 82],
    [96, 52],
    [120, 60],
    [150, 40],
    [176, 46],
    [204, 28],
    [230, 34],
    [262, 18],
    [290, 24],
  ];
  return h(
    'svg',
    { width: w, height: hh },
    axes(w, hh),
    pts.map(([x, y], i) => h('circle', { key: i, cx: x, cy: y, r: 4, fill: i % 3 ? 'var(--accent)' : 'var(--purple)' })),
  );
}
function Sparkline() {
  const w = 96,
    hh = 24,
    max = 40;
  const d = SERIES.map((v, i) => `${i ? 'L' : 'M'}${i * (w / (SERIES.length - 1))},${hh - (v / max) * hh}`).join(' ');
  return h('svg', { width: w, height: hh }, h('path', { d, fill: 'none', stroke: 'var(--green)', strokeWidth: 1.5, strokeLinejoin: 'round' }));
}

// ---- window-like stage for overlays (drawer, sheet, lightbox): the window base and its gradient
const stage = (w, hgt, ...kids) =>
  h(
    'div',
    {
      className: 'theme-root',
      style: { position: 'relative', width: w, height: hgt, borderRadius: 'var(--radius-window)', overflow: 'hidden', background: 'var(--color-window-base)' },
    },
    ...kids,
  );
const listItem = (title, iconName, selected) =>
  h(P.ListItem, { isSelected: selected }, h(P.ListItemRoot, { size: 'small' }, h(P.ListItemIcon, null, icon(iconName)), h(P.ListItemTitle, null, title)));

const SPECIMENS = [
  // shipped components with no ready-made specimen elsewhere, rendered here from their own modules
  {
    name: 'Toolbar',
    parts: 'ActionBarUI, ActionButton, ActionButtonSeparator',
    real: true,
    render: () =>
      row(
        'launcher footer',
        h(
          'div',
          {
            style: {
              position: 'relative',
              width: 560,
              height: 'var(--main-window-footer-height)',
              borderRadius: 'var(--radius-12)',
              background: 'var(--color-window-base)',
              overflow: 'hidden',
            },
          },
          h(
            P.ActionBarRoot,
            null,
            h(
              P.ActionBarLeft,
              null,
              h(X.ActionButton, { variant: 'secondary', hoverVariant: 'outset', icon: '/extension-calculator-BWxdIc50.png', title: 'Calculator' }),
            ),
            h(
              P.ActionBarRight,
              null,
              h(X.ActionButton, { title: 'Copy Answer', shortcut: anyPlatform(keys.enter) }),
              h(X.ActionButtonSeparator),
              h(X.ActionButton, { variant: 'secondary', title: 'Actions', shortcut: shortcuts.i.k }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Table',
    parts: 'Markdown',
    real: true,
    render: () =>
      row(
        'markdown',
        h(
          'div',
          { style: { width: 480 } },
          h(
            X.Markdown,
            null,
            '| Command | Extension | Shortcut |\n|---|---|---|\n| Clipboard History | Bayrust | ⌥ ⌘ C |\n| Search Files | File Search | ⌥ Space |\n| Quick AI | Bayrust AI | ⇥ |',
          ),
        ),
      ),
  },
  {
    name: 'Data Table',
    parts: 'SettingsUI.Table, SettingsUI.TableRow',
    real: true,
    render: () =>
      row(
        'settings',
        h(
          'div',
          { style: { width: 480 } },
          h(
            X.SettingsTable,
            null,
            [
              ['Clipboard History', 'Enabled'],
              ['Snippets', 'Enabled'],
              ['Quicklinks', 'Disabled'],
            ].map(([l, r]) =>
              h(X.SettingsTableRow, {
                key: l,
                left: h('span', { className: t('text') }, l),
                right: h('span', { className: t('text', { color: 'secondary' }) }, r),
              }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Description List',
    parts: 'DataList',
    real: true,
    render: () =>
      row(
        'detail',
        h(
          'div',
          { style: { width: 320 } },
          h(
            X.DataListRoot,
            null,
            h(
              X.DataListItems,
              null,
              [
                ['Application', 'Safari'],
                ['Characters', '1,284'],
                ['Copied', 'Today at 09:12'],
              ].map(([l, v]) => h(X.DataListItem, { key: l }, h(X.DataListLabel, null, l), h(X.DataListValue, null, v))),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Drag & Drop Upload',
    parts: 'ChatDropzoneOverlay',
    real: true,
    render: () =>
      row(
        'active',
        h(
          'div',
          {
            style: {
              position: 'relative',
              width: 420,
              height: 200,
              borderRadius: 'var(--radius-12)',
              overflow: 'hidden',
              background: 'var(--color-window-base)',
            },
          },
          h(X.ChatDropzoneOverlay, { isActive: true, contained: true }),
        ),
      ),
  },

  {
    name: 'Split Button',
    parts: 'Button, DropdownButton',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--half-pixel)' },
          h(P.Button, { text: 'Run Script', variant: 'secondary' }),
          h(P.DropdownButton, { variant: 'default', 'aria-label': 'More' }),
        ),
      ),
  },
  {
    name: 'Floating Action Button',
    parts: 'IconButton, --shadow-panel',
    render: () =>
      row(
        'medium',
        h(
          'div',
          { style: { borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-panel)', display: 'inline-flex' } },
          h(P.IconButton, { icon: 'plus', size: 'medium', className: 'radius__radius-full_1cbd4', 'aria-label': 'New' }),
        ),
      ),
  },
  {
    name: 'Avatar Group',
    parts: 'Avatar, --color-window-base ring',
    render: () =>
      row(
        'default',
        flex(
          {},
          ['TL', 'AK', 'JM', 'RS'].map((i, n) =>
            h(
              'div',
              {
                key: i,
                style: { marginLeft: n ? 'calc(-1 * var(--space-6))' : 0, borderRadius: 'var(--radius-full)', boxShadow: '0 0 0 2px var(--color-window-base)' },
              },
              h(P.Avatar, { initials: i, width: 24, height: 24, textTransform: 'uppercase', placeholderColor: AVATAR_COLORS[n] }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Avatar Group Compact',
    parts: 'Avatar, NumberBadge',
    render: () =>
      row(
        'default',
        flex(
          { alignItems: 'center', gap: 'var(--space-4)' },
          flex(
            {},
            ['TL', 'AK'].map((i, n) =>
              h(
                'div',
                {
                  key: i,
                  style: {
                    marginLeft: n ? 'calc(-1 * var(--space-6))' : 0,
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 0 0 2px var(--color-window-base)',
                  },
                },
                h(P.Avatar, { initials: i, width: 16, height: 16, textTransform: 'uppercase', placeholderColor: AVATAR_COLORS[n] }),
              ),
            ),
          ),
          h(P.NumberBadge, { size: 'small', value: 5 }),
        ),
      ),
  },
  {
    name: 'Rating',
    parts: 'Icon (star, star-filled), --yellow',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-2)' },
          [1, 2, 3, 4, 5].map((n) => h('span', { key: n, style: { color: n <= 4 ? 'var(--yellow)' : 'var(--fg-20)' } }, icon(n <= 4 ? 'star-filled' : 'star'))),
        ),
      ),
  },
  {
    name: 'Drawer',
    parts: 'panel tokens, List items, IconButton',
    render: () =>
      row(
        'trailing',
        stage(
          560,
          300,
          h(
            'div',
            {
              style: {
                position: 'absolute',
                top: 'var(--space-8)',
                right: 'var(--space-8)',
                bottom: 'var(--space-8)',
                width: 240,
                ...panel,
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              },
            },
            flex(
              { alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-8)' },
              h('span', { className: t('text-strong') }, 'Details'),
              h(P.IconButton, { icon: 'xmark', size: 'small', 'aria-label': 'Close' }),
            ),
            listItem('Clipboard History', 'clipboard', true),
            listItem('Snippets', 'snippets'),
            listItem('Quicklinks', 'link'),
          ),
        ),
      ),
  },
  {
    name: 'Bottom Sheet',
    parts: 'panel tokens, Button',
    render: () =>
      row(
        'default',
        stage(
          560,
          300,
          h(
            'div',
            {
              style: {
                position: 'absolute',
                left: 'var(--space-8)',
                right: 'var(--space-8)',
                bottom: 'var(--space-8)',
                ...panel,
                padding: 'var(--space-16)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-12)',
              },
            },
            h('span', { className: t('large-text-strong') }, 'Share Note'),
            h('span', { className: t('text', { color: 'secondary' }) }, 'Anyone with the link can view this note.'),
            flex(
              { gap: 'var(--space-8)', justifyContent: 'flex-end' },
              h(P.Button, { text: 'Cancel', variant: 'secondary' }),
              h(P.Button, { text: 'Copy Link' }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Checkbox Group',
    parts: 'Checkbox, text styles',
    render: () =>
      row(
        'default',
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' } },
          [
            ['Applications', true],
            ['Commands', true],
            ['Files', false],
          ].map(([l, c]) =>
            h(
              'label',
              { key: l, style: { display: 'flex', alignItems: 'center', gap: 'var(--space-8)' } },
              h(P.Checkbox, { defaultChecked: c }),
              h('span', { className: t('text') }, l),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Date Picker',
    parts: 'DatePicker (shipped)',
    real: true,
    render: () =>
      h(
        'div',
        null,
        row('empty', h('div', { style: { width: 240 } }, h(X.DatePicker, {}))),
        row('with value', h('div', { style: { width: 240 } }, h(X.DatePicker, { defaultValue: new Date(Date.UTC(2026, 9, 27)) }))),
      ),
  },
  {
    name: 'Date Range Picker',
    parts: 'DatePicker ×2',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-8)', alignItems: 'center' },
          h(X.DatePicker, { defaultValue: new Date(Date.UTC(2026, 9, 21)) }),
          icon('arrow-right', 16, 'var(--color-text-tertiary)'),
          h(X.DatePicker, { defaultValue: new Date(Date.UTC(2026, 9, 27)) }),
        ),
      ),
  },
  {
    name: 'Multi Select',
    parts: 'MultiSelect (shipped)',
    real: true,
    render: () =>
      h(
        'div',
        null,
        ['default', 'ghost'].map((v) =>
          row(
            v,
            h(
              'div',
              { style: { width: 260 } },
              h(X.MultiSelect, {
                variant: v,
                options: [
                  { value: 'safari', label: 'Safari' },
                  { value: 'slack', label: 'Slack' },
                  { value: 'mail', label: 'Mail' },
                ],
                defaultValue: v === 'default' ? ['safari', 'slack'] : [],
              }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Digit Input',
    parts: 'InputField (small)',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-6)' },
          ['4', '2', '', ''].map((d, i) =>
            h(
              'div',
              { key: i, style: { width: 32 } },
              h(P.InputField, { size: 'small', defaultValue: d, style: { textAlign: 'center' }, 'aria-label': `Digit ${i + 1}` }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'OTP Input',
    parts: 'InputField',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-6)', alignItems: 'center' },
          ['8', '3', '1', '', '', ''].map((d, i) => [
            i === 3 && h('span', { key: 'sep', className: t('text', { color: 'tertiary' }) }, '–'),
            h(
              'div',
              { key: i, style: { width: 36 } },
              h(P.InputField, { defaultValue: d, style: { textAlign: 'center' }, 'aria-label': `Code digit ${i + 1}` }),
            ),
          ]),
        ),
      ),
  },
  {
    name: 'Number Input',
    parts: 'ZoomControls (shipped stepper)',
    real: true,
    render: () =>
      row(
        'default',
        h(Controlled, { init: 1 }, (v, set) =>
          h(P.ZoomControls, {
            value: v,
            onChange: set,
            defaultValue: 1,
            minValue: 1,
            maxValue: 1.2,
            getPreviousValue: (x) => Math.round((x - 0.1) * 10) / 10,
            getNextValue: (x) => Math.round((x + 0.1) * 10) / 10,
            'aria-labelledby': 'n',
          }),
        ),
      ),
  },
  {
    name: 'Range Slider',
    parts: 'color-slider track and thumb styling (tokens)',
    render: () =>
      row(
        'default',
        h(
          'div',
          { style: { position: 'relative', width: 240, height: 16 } },
          h('div', { style: { position: 'absolute', left: 0, right: 0, top: 6, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--fg-10)' } }),
          h('div', {
            style: { position: 'absolute', left: '25%', right: '30%', top: 6, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--accent)' },
          }),
          ['25%', '70%'].map((l) =>
            h('div', {
              key: l,
              style: {
                position: 'absolute',
                left: `calc(${l} - 8px)`,
                top: 0,
                width: 16,
                height: 16,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-fg-max)',
                boxShadow: 'var(--shadow-panel)',
              },
            }),
          ),
        ),
      ),
  },
  {
    name: 'Breadcrumb',
    parts: 'Icon (chevron-right-small), text styles',
    render: () =>
      row(
        'default',
        flex(
          { alignItems: 'center', gap: 'var(--space-4)' },
          ['Settings', 'AI', 'Models & Providers'].map((s, i, a) => [
            h('span', { key: s, className: t('small-text', { color: i === a.length - 1 ? 'primary' : 'secondary' }) }, s),
            i < a.length - 1 && h('span', { key: s + '>', style: { color: 'var(--color-text-tertiary)', display: 'flex' } }, icon('chevron-right-small', 12)),
          ]),
        ),
      ),
  },
  {
    name: 'Tabs',
    parts: 'playground entry styling: 28 pt, radius-8, selected fg-10',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-4)' },
          ['General', 'Models', 'History'].map((s, i) =>
            h(
              'button',
              {
                key: s,
                className: `radius__radius-8_b77d9 ${t('small-text', { color: 'primary' })}`,
                style: { height: 28, padding: 'var(--space-6) var(--space-8)', background: i === 0 ? 'var(--color-surface-list-selection)' : 'transparent' },
              },
              s,
            ),
          ),
        ),
      ),
  },
  {
    name: 'Tab Menu Horizontal',
    parts: 'ButtonRadioGroupPrimitive (shipped segmented control)',
    real: true,
    render: () =>
      row(
        'default',
        h(Controlled, { init: 'general' }, (v, set) =>
          h(
            P.RadioRoot,
            { value: v, onValueChange: set, size: 'small', name: 'tabs' },
            [
              ['general', 'General'],
              ['models', 'Models'],
              ['history', 'History'],
            ].map(([val, l]) => h(X.RadioItem, { key: val, value: val }, l)),
          ),
        ),
      ),
  },
  {
    name: 'Bottom Navigation',
    parts: 'IconButton, text styles',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-24)', padding: 'var(--space-8) var(--space-16)', ...panel },
          [
            ['house', 'Home'],
            ['magnifying-glass', 'Search'],
            ['bell', 'Activity'],
            ['person', 'Account'],
          ].map(([i, l], n) =>
            h(
              'div',
              {
                key: l,
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: n === 0 ? 'var(--accent)' : 'var(--color-text-secondary)',
                },
              },
              icon(i),
              h('span', { className: t('mini-text-strong', { color: 'inherit' }) }, l),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Mega Menu',
    parts: 'List section headers and list items in a panel',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-8)', padding: 'var(--space-8)', ...panel, width: 520 },
          [
            [
              'Create',
              [
                ['Create Snippet', 'snippets'],
                ['Create Quicklink', 'link'],
                ['Create Note', 'blank-document'],
              ],
            ],
            [
              'Search',
              [
                ['Search Files', 'magnifying-glass'],
                ['Search Emoji', 'emoji'],
                ['Clipboard History', 'clipboard'],
              ],
            ],
          ].map(([title, items]) =>
            h(
              'div',
              { key: title, style: { flex: 1 } },
              h(P.ListSectionHeader, null, h(P.ListSectionHeaderTitle, null, title)),
              items.map(([l, i], n) => h('div', { key: l }, listItem(l, i, title === 'Create' && n === 0))),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Pagination',
    parts: 'IconButton, Button (ghost, secondary)',
    render: () =>
      row(
        'default',
        flex(
          { alignItems: 'center', gap: 'var(--space-4)' },
          h(P.IconButton, { icon: 'chevron-left', size: 'small', 'aria-label': 'Previous' }),
          [1, 2, 3, 4].map((n) => h(P.Button, { key: n, text: String(n), size: 'small', variant: n === 2 ? 'secondary' : 'ghost' })),
          h(P.IconButton, { icon: 'chevron-right', size: 'small', 'aria-label': 'Next' }),
        ),
      ),
  },
  {
    name: 'Timeline',
    parts: 'TagIcon, separator token, text styles',
    render: () =>
      row(
        'default',
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column' } },
          [
            ['Note created', '09:12', 'blue'],
            ['Shared with team', '10:40', 'purple'],
            ['Exported as PDF', '11:05', 'green'],
          ].map(([l, time, c], i, a) =>
            h(
              'div',
              { key: l, style: { display: 'flex', gap: 'var(--space-12)' } },
              h(
                'div',
                { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 } },
                h('div', { style: { marginTop: 'var(--space-4)' } }, h(P.TagIcon, { color: c })),
                i < a.length - 1 && h('div', { style: { flex: 1, width: 1, background: 'var(--color-border-separator)', minHeight: 'var(--space-24)' } }),
              ),
              h(
                'div',
                { style: { paddingBottom: 'var(--space-12)' } },
                h('div', { className: t('text') }, l),
                h('div', { className: t('small-text', { color: 'tertiary' }) }, time),
              ),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Tree View',
    parts: 'List items, Icon (chevron, folder)',
    render: () =>
      row(
        'default',
        h(
          'div',
          { style: { width: 280 } },
          [
            [0, 'chevron-down-small', 'folder', 'Projects'],
            [1, 'chevron-down-small', 'folder', 'Bayrust'],
            [2, null, 'blank-document', 'tokens.css'],
            [2, null, 'blank-document', 'README.md'],
            [1, 'chevron-right-small', 'folder', 'Archive'],
          ].map(([d, c, i, l], n) =>
            h(
              P.ListItem,
              { key: n, isSelected: n === 2 },
              h(
                'div',
                { style: { paddingLeft: `calc(${d} * var(--space-16))` } },
                h(
                  P.ListItemRoot,
                  { size: 'small' },
                  h(
                    P.ListItemIcon,
                    null,
                    flex(
                      { alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' },
                      c ? icon(c, 12) : h('span', { style: { width: 12 } }),
                      icon(i),
                    ),
                  ),
                  h(P.ListItemTitle, null, l),
                ),
              ),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Lightbox',
    parts: 'bg-80 overlay, IconButton, radius tokens',
    render: () =>
      row(
        'default',
        stage(
          560,
          320,
          h(
            'div',
            { style: { position: 'absolute', inset: 0, background: 'var(--bg-80)', display: 'grid', placeItems: 'center' } },
            h('img', { src: '/grid-item-2-dark-DvoHvLMG.jpg', style: { width: 360, borderRadius: 'var(--radius-12)', boxShadow: 'var(--shadow-panel)' } }),
            h(
              'div',
              { style: { position: 'absolute', top: 'var(--space-12)', right: 'var(--space-12)' } },
              h(P.IconButton, { icon: 'xmark', size: 'medium', 'aria-label': 'Close' }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Aspect Ratio',
    parts: 'shipped images, radius-8',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-12)', alignItems: 'flex-end' },
          [
            ['16 / 9', 160],
            ['4 / 3', 120],
            ['1 / 1', 96],
          ].map(([r, w]) =>
            h(
              'div',
              { key: r, style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' } },
              h('img', { src: '/grid-item-1-dark-CwUBzXhW.jpg', style: { width: w, aspectRatio: r, objectFit: 'cover', borderRadius: 'var(--radius-8)' } }),
              h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, r),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Container',
    parts: 'space and radius tokens',
    render: () =>
      row(
        'default',
        h(
          'div',
          {
            style: {
              width: 360,
              padding: 'var(--space-16)',
              borderRadius: 'var(--radius-12)',
              boxShadow: 'inset 0 0 0 var(--half-pixel) var(--color-border-separator)',
            },
          },
          h('div', { style: { ...card, height: 48 } }),
        ),
      ),
  },
  {
    name: 'Stack',
    parts: 'space tokens',
    render: () =>
      row(
        'gap 8',
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', width: 200 } },
          [1, 2, 3].map((n) => h('div', { key: n, style: { ...card, padding: 0, height: 28 } })),
        ),
      ),
  },
  {
    name: 'Flex',
    parts: 'space tokens',
    render: () =>
      row(
        'gap 12',
        flex(
          { gap: 'var(--space-12)' },
          [64, 96, 48].map((w) => h('div', { key: w, style: { ...card, padding: 0, width: w, height: 32 } })),
        ),
      ),
  },
  {
    name: 'Spacer',
    parts: 'space tokens',
    render: () =>
      h(
        'div',
        null,
        ['space-8', 'space-16', 'space-24'].map((s) =>
          row(
            s,
            flex(
              { alignItems: 'center' },
              h('div', { style: { ...card, padding: 0, width: 32, height: 32 } }),
              h('div', { style: { width: `var(--${s})`, height: 2, background: 'var(--accent-40)' } }),
              h('div', { style: { ...card, padding: 0, width: 32, height: 32 } }),
            ),
          ),
        ),
      ),
  },
  {
    name: 'KPI Card',
    parts: 'inner panel surface, text styles, Badge',
    render: () =>
      row(
        'default',
        flex(
          { gap: 'var(--space-12)' },
          [
            ['Commands run', '1,284', '+12%', 'green'],
            ['AI messages', '342', '−4%', 'red'],
          ].map(([l, v, d, c]) =>
            h(
              'div',
              { key: l, style: { ...card, width: 180, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' } },
              h('span', { className: t('small-text', { color: 'secondary' }) }, l),
              flex(
                { alignItems: 'center', justifyContent: 'space-between' },
                h('span', { className: t('heading1') }, v),
                h(P.Badge, { text: d, color: c, size: 'small' }),
              ),
            ),
          ),
        ),
      ),
  },
  { name: 'Line Chart', parts: 'SVG: --accent, --fg-10 grid', render: () => row('default', h(LineChart)) },
  { name: 'Area Chart', parts: 'SVG: --accent, --accent-20, --fg-10 grid', render: () => row('default', h(LineChart, { area: true })) },
  { name: 'Pie Chart', parts: 'SVG: theme hues', render: () => row('default', h(Pie)) },
  { name: 'Donut Chart', parts: 'SVG: theme hues, --color-window-base', render: () => row('default', h(Pie, { donut: true })) },
  { name: 'Scatter Chart', parts: 'SVG: --accent, --purple, --fg-10 grid', render: () => row('default', h(Scatter)) },
  {
    name: 'Sparkline',
    parts: 'SVG: --green',
    render: () =>
      row(
        'default',
        flex(
          { alignItems: 'center', gap: 'var(--space-8)' },
          h('span', { className: t('text') }, 'Commands'),
          h(Sparkline),
          h('span', { className: t('small-mono-text', { color: 'secondary' }) }, '+12%'),
        ),
      ),
  },
  {
    name: 'Table of Contents',
    parts: 'text styles, list selection fill',
    render: () =>
      row(
        'default',
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', width: 200 } },
          h(
            'span',
            { className: t('mini-text-strong', { color: 'tertiary' }), style: { padding: '0 var(--space-8) var(--space-4)', textTransform: 'uppercase' } },
            'On this page',
          ),
          ['Overview', 'Shortcuts', 'Appearance', 'Advanced'].map((s, i) =>
            h(
              'span',
              {
                key: s,
                className: `radius__radius-8_b77d9 ${t('small-text', { color: i === 1 ? 'primary' : 'secondary' })}`,
                style: { padding: 'var(--space-4) var(--space-8)', background: i === 1 ? 'var(--color-surface-list-selection)' : 'transparent' },
              },
              s,
            ),
          ),
        ),
      ),
  },
  {
    name: 'Registration',
    parts: 'FormLayout.Column, InputField, Button',
    render: () =>
      row(
        'default',
        authForm(
          'Create Account',
          [
            ['Name', 'Name'],
            ['Email', 'name@example.com'],
            ['Password', '••••••••'],
          ],
          'Create Account',
        ),
      ),
  },
  {
    name: 'Password Reset',
    parts: 'FormLayout.Column, InputField, Button',
    render: () =>
      row('default', authForm('Reset Password', [['Email', 'name@example.com']], 'Send Reset Link', 'We’ll email you a link to reset your password.')),
  },
  {
    name: 'Verification',
    parts: 'InputField, Button, text styles',
    render: () =>
      row(
        'default',
        h(
          'div',
          {
            style: { ...panel, width: 360, padding: 'var(--space-24)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-12)' },
          },
          icon('envelope', 32, 'var(--color-text-secondary)'),
          h('span', { className: t('large-text-strong') }, 'Check Your Email'),
          h('span', { className: t('text', { color: 'secondary' }), style: { textAlign: 'center' } }, 'Enter the 6-digit code we sent to name@example.com.'),
          flex(
            { gap: 'var(--space-6)' },
            ['8', '3', '1', '', '', ''].map((d, i) =>
              h('div', { key: i, style: { width: 36 } }, h(P.InputField, { defaultValue: d, style: { textAlign: 'center' }, 'aria-label': `Digit ${i + 1}` })),
            ),
          ),
          h(P.Button, { text: 'Verify', size: 'medium' }),
        ),
      ),
  },
  {
    name: 'Drag Handle',
    parts: 'Icon (drag-handle), List item',
    render: () =>
      row(
        'default',
        h(
          'div',
          { style: { width: 280 } },
          h(
            P.ListItem,
            {},
            h(
              P.ListItemRoot,
              { size: 'small' },
              h(P.ListItemIcon, null, h('span', { style: { color: 'var(--color-text-tertiary)', display: 'flex' } }, icon('drag-handle'))),
              h(P.ListItemTitle, null, 'Quick AI'),
              h(P.ListItemSubtitle, null, 'Drag to reorder'),
            ),
          ),
        ),
      ),
  },
  {
    name: 'Resize Handle',
    parts: 'separator token, sidebar surfaces',
    render: () =>
      row(
        'default',
        stage(
          420,
          200,
          flex(
            { height: '100%' },
            h('div', { style: { width: 160, background: 'var(--color-window-bg-secondary)' } }),
            h(
              'div',
              { style: { width: 9, margin: '0 -4px', display: 'flex', justifyContent: 'center', cursor: 'col-resize', position: 'relative', zIndex: 1 } },
              h('div', { style: { width: 1, background: 'var(--color-border-separator)' } }),
              h('div', {
                style: {
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--fg-20)',
                },
              }),
            ),
            h('div', { style: { flex: 1 } }),
          ),
        ),
      ),
  },
  {
    name: 'Back to Top',
    parts: 'IconButton, --shadow-panel',
    render: () =>
      row(
        'default',
        h(
          'div',
          {
            style: {
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-panel)',
              display: 'inline-flex',
              background: 'var(--color-panel-background)',
            },
          },
          h(P.IconButton, { icon: 'arrow-up', size: 'small', className: 'radius__radius-full_1cbd4', 'aria-label': 'Back to top' }),
        ),
      ),
  },
  {
    name: 'Cookie Banner',
    parts: 'panel tokens, Button, text styles',
    render: () =>
      row(
        'default',
        flex(
          { ...panel, padding: 'var(--space-12) var(--space-16)', gap: 'var(--space-16)', alignItems: 'center', width: 560 },
          h(
            'span',
            { className: t('text', { color: 'secondary' }), style: { flex: 1 } },
            'We use cookies to keep you signed in and to understand how the app is used.',
          ),
          h(P.Button, { text: 'Decline', variant: 'secondary', size: 'small' }),
          h(P.Button, { text: 'Accept', size: 'small' }),
        ),
      ),
  },
];

function authForm(title, fields, cta, note) {
  return h(
    'div',
    { style: { ...panel, width: 360, padding: 'var(--space-24)', display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' } },
    h('span', { className: t('large-text-strong') }, title),
    note && h('span', { className: t('text', { color: 'secondary' }) }, note),
    // a narrow card: each label above its field (FormLayout.Root's three columns are for full-width forms)
    h(
      'div',
      null,
      fields.map(([l, ph]) =>
        h(
          X.FormColumn,
          { key: l },
          h('label', { className: t('small-text', { color: 'secondary' }) }, l),
          h(P.InputField, { placeholder: ph, 'aria-label': l }),
        ),
      ),
    ),
    h(P.Button, { text: cta, size: 'medium' }),
  );
}

function Specimen({ s }) {
  return h(
    'article',
    { className: 'ds-specimen', id: s.name },
    h(
      'div',
      { className: 'ds-specimen-head' },
      h('h3', { className: t('large-text-strong') }, s.name),
      h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, s.real ? `shipped: ${s.parts}` : `composed from ${s.parts}`),
    ),
    h('p', { className: t('small-text', { color: 'secondary' }) }, s.real ? `Bayrust’s own ${s.parts}.` : `Composed from Bayrust parts: ${s.parts}.`),
    h('div', { className: 'ds-stage' }, s.render()),
  );
}
export const composedList = () => SPECIMENS;
export const composed = [
  {
    id: 'composed',
    label: 'Composed',
    level: 'Components',
    render: () =>
      h(
        'div',
        null,
        h(Section, {
          t,
          title: 'Composed from Bayrust parts',
          note: 'Checklist components Bayrust doesn’t ship, built only from its primitives, text styles and tokens.',
        }),
        SPECIMENS.map((s) => h(Specimen, { key: s.name, s })),
      ),
  },
];
