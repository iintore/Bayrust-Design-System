// Atoms, molecules and organisms. Each specimen mounts the shipped component (resolved by displayName
// from its shipped module). Variant values come from the component's CSS module selectors
// (research/css-variants.json) and props from its source (research/component-props.json).
import { h, React, component, mod } from './runtime.js';
import { Section } from './foundations.js';

const C = async (file, name) =>
  component(file, name).catch((e) => {
    console.warn(`Bayrust: ${name} could not be loaded from ${file}; specimens using it will not render.`, e);
    return null;
  });
const shortcuts = await mod('shortcuts-CslcL67B.js');
const keys = shortcuts.f; // bare key proxy: keys.enter → { modifiers: [], keyEquivalentName: 'enter' }
const cmdProxy = shortcuts.i; // primary-modifier proxy: cmdProxy.k → { mac: {⌘K}, win: {Ctrl+K} }
const cmd = new Proxy({}, { get: (_, k) => cmdProxy[k].mac }); // Shortcut takes { modifiers, keyEquivalentName }
const mac = (x) => (Array.isArray(x) ? x[0] : x).mac;
const HOTKEY_ALT_SPACE = {
  kind: {
    type: 'SingleStep',
    shortcut: { modifiers: [{ modifier: 'Alt' }], key: { type: 'LayoutDependent', keyType: { type: 'Character', equivalent: ' ' } } },
  },
  locality: 'Global',
};
const HOTKEY_CMD_K = {
  kind: {
    type: 'SingleStep',
    shortcut: { modifiers: [{ modifier: 'Meta' }], key: { type: 'LayoutDependent', keyType: { type: 'Character', equivalent: 'k' } } },
  },
};

const P = {
  Icon: await C('icon-CKbK2z_d.js', 'Icon'),
  Button: await C('button-BRq4uR-U.js', 'Button'),
  BaseButtonRoot: await C('base-button.namespace-CigLQP3Y.js', 'BaseButton.Root'),
  BaseButtonText: await C('base-button.namespace-CigLQP3Y.js', 'BaseButton.Text'),
  IconButton: await C('icon-button-BbF1-aNu.js', 'IconButton'),
  Badge: await C('badge-Dh6uJYp3.js', 'Badge'),
  BaseBadge: await C('badge-Dh6uJYp3.js', 'BaseBadge'),
  NumberBadge: await C('number-badge-B7ganJCi.js', 'NumberBadge'),
  Checkbox: await C('checkbox-COjZyIbI.js', 'Checkbox'),
  Toggle: await C('switch-i2OvgDTB.js', 'Toggle'),
  Spinner: await C('spinner-qyusY7tI.js', 'Spinner'),
  ActivityIndicator: await C('activity-indicator-Dn8pi_r8.js', 'ActivityIndicator'),
  Shortcut: await C('shortcut-tWD_Kfmz.js', 'Shortcut'),
  KeyboardKey: await C('shortcut-tWD_Kfmz.js', 'KeyboardKey'),
  KeyboardShortcut: await C('window-shell-hosts-B46oCtq_.js', 'KeyboardShortcut'),
  VisualShortcut: await C('visual-shortcut-BjJ8gtPS.js', 'VisualShortcut'),
  TagIcon: await C('tag-icon-qm1DNVeJ.js', 'TagIcon'),
  Avatar: await C('internal-command-icon-DoqCpW6a.js', 'Avatar'),
  AppIcon: await C('app-icon-xrEhvo9d.js', 'AppIcon'),
  Logo: await C('logo-BeUik7hM.js', 'Logo'),
  GradientBorder: await C('gradient-border-D--GRPWL.js', 'GradientBorder'),
  InputField: await C('input-field-D291AOwI.js', 'InputField'),
  Textarea: await C('textarea-C-Zj7rM5.js', 'Textarea'),
  SearchInput: await C('search-input-9Kt4Kmi4.js', 'SearchInput'),
  DropdownButton: await C('dropdown-button-D5fgSFHB.js', 'DropdownButton'),
  Select: await C('select-8fcF79hx.js', 'Select'),
  ZoomControls: await C('zoom-controls-d68Kmm2j.js', 'ZoomControls'),
  RadioRoot: await C('button-radio-group-primitive.namespace-Cq6TCn-G.js', 'ButtonRadioGroupPrimitive.Root'),
  EmptyState: await C('empty-state-image-CD8fCmXU.js', 'EmptyState'),
  ErrorState: await C('error-state-CWepYQxu.js', 'ErrorState'),
  ListItemRoot: await C('standard-list-item.namespace-BiNx9yfm.js', 'StandardListItem.Root'),
  ListItemIcon: await C('standard-list-item.namespace-BiNx9yfm.js', 'StandardListItem.Icon'),
  ListItemTitle: await C('standard-list-item.namespace-BiNx9yfm.js', 'StandardListItem.Title'),
  ListItemSubtitle: await C('standard-list-item.namespace-BiNx9yfm.js', 'StandardListItem.Subtitle'),
  ListItemAccessories: await C('standard-list-item.namespace-BiNx9yfm.js', 'StandardListItem.Accessories'),
  ListItemLabelAccessory: await C('standard-list-item.namespace-BiNx9yfm.js', 'StandardListItem.LabelAccessory'),
  ListItem: await C('standard-list-item.namespace-BiNx9yfm.js', 'List.Item'),
  ListSectionHeader: await C('standard-list-item.namespace-BiNx9yfm.js', 'List.SectionHeader'),
  ListSectionHeaderTitle: await C('standard-list-item.namespace-BiNx9yfm.js', 'List.SectionHeaderTitle'),
  CommandPanelRoot: await C('command-panel.namespace-BnpkWES6.js', 'CommandPanel.Root'),
  CommandPanelContent: await C('command-panel.namespace-BnpkWES6.js', 'CommandPanel.Content'),
  CommandPanelAction: await C('command-panel.namespace-BnpkWES6.js', 'CommandPanel.Action'),
  CommandPanelFooter: await C('command-panel.namespace-BnpkWES6.js', 'CommandPanel.Footer'),
  CommandPanelHeaderTitle: await C('command-panel.namespace-BnpkWES6.js', 'CommandPanel.HeaderTitle'),
  ActionBarRoot: await C('action-bar-ui.namespace-Bg_UL5kF.js', 'ActionBarUI.Root'),
  ActionBarLeft: await C('action-bar-ui.namespace-Bg_UL5kF.js', 'ActionBarUI.Left'),
  ActionBarCenter: await C('action-bar-ui.namespace-Bg_UL5kF.js', 'ActionBarUI.Center'),
  ActionBarRight: await C('action-bar-ui.namespace-Bg_UL5kF.js', 'ActionBarUI.Right'),
  HudRoot: await C('window-shell-hosts-B46oCtq_.js', 'Hud.Root'),
  HudIcon: await C('window-shell-hosts-B46oCtq_.js', 'Hud.Icon'),
  HudTitle: await C('window-shell-hosts-B46oCtq_.js', 'Hud.Title'),
  FormRoot: await C('form-layout.namespace-C3qKgtvN.js', 'FormLayout.Root'),
  FormRow: await C('form-layout.namespace-C3qKgtvN.js', 'FormLayout.Row'),
  FormColumn: await C('form-layout.namespace-C3qKgtvN.js', 'FormLayout.Column'),
  ProgressiveBlur: await C('progressive-blur-ip186o7J.js', 'ProgressiveBlur'),
};
window.__dsPrimitives = P;

class Boundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? h('div', { className: 'ds-error' }, String(this.state.error.message || this.state.error)) : this.props.children;
  }
}

function PropsTable({ data, t, name }) {
  const p = data.props[name];
  if (!p) return null;
  return h(
    'details',
    { className: 'ds-props' },
    h('summary', { className: t('small-text-strong', { color: 'secondary' }) }, `Props · ${p.module}`),
    h(
      'table',
      { className: `ds-table ${t('small-text')}` },
      h(
        'tbody',
        null,
        p.props.map((x) =>
          h(
            'tr',
            { key: x.name },
            h('td', { className: t('small-mono-text') }, x.name),
            h('td', { className: t('small-mono-text', { color: 'tertiary' }) }, x.default ?? ''),
            h('td', { className: t('small-mono-text', { color: 'tertiary' }) }, (p.values[x.name] || []).join(' · ')),
          ),
        ),
      ),
    ),
  );
}

function Specimen({ data, t, s }) {
  return h(
    'article',
    { className: 'ds-specimen', id: s.name },
    h(
      'div',
      { className: 'ds-specimen-head' },
      h('h3', { className: t('large-text-strong') }, s.name),
      s.variants && h('span', { className: t('small-mono-text', { color: 'tertiary' }) }, s.variants),
    ),
    s.note && h('p', { className: t('small-text', { color: 'secondary' }) }, s.note),
    h('div', { className: `ds-stage ${s.stage || ''}` }, h(Boundary, null, s.render(t))),
    (s.props || [s.name]).map((n) => h(PropsTable, { key: n, data, t, name: n })),
  );
}

const row = (...kids) => h('div', { className: 'ds-row' }, ...kids);
const col = (label, t, ...kids) => h('div', { className: 'ds-cell' }, h('span', { className: t('mini-text', { color: 'tertiary' }) }, label), ...kids);
const BUTTON_VARIANTS = ['default', 'secondary', 'ghost', 'link', 'standout', 'destructive'];
const SIZES4 = ['mini', 'small', 'medium', 'large'];
const COLORS = ['default', 'accent', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta', 'secondary'];

const ATOMS = [
  {
    name: 'Button',
    props: ['Button', 'ButtonPrimitive.Root', 'BaseButton.Root'],
    variants: 'variant × size × color (base-button CSS)',
    render: (t) =>
      h(
        'div',
        null,
        BUTTON_VARIANTS.map((v) =>
          row(
            h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, v),
            SIZES4.map((s) => h(P.Button, { key: s, variant: v, size: s, text: `${s}` })),
            h(P.Button, { variant: v, text: 'With icon', icon: 'plus', iconPosition: 'start' }),
            h(P.Button, { variant: v, text: 'Disabled', disabled: true }),
          ),
        ),
        row(
          h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, 'color'),
          COLORS.map((c) => h(P.Button, { key: c, color: c, text: c })),
        ),
      ),
  },
  {
    name: 'IconButton',
    variants: 'size: mini · small · medium',
    render: () =>
      row(
        ['mini', 'small', 'medium'].map((s) => h(P.IconButton, { key: s, size: s, icon: 'cog', 'aria-label': 'Settings' })),
        h(P.IconButton, { icon: 'plus', isLoading: true, 'aria-label': 'Loading' }),
        h(P.IconButton, { icon: 'trash', color: 'red', 'aria-label': 'Delete' }),
      ),
  },
  {
    name: 'Badge',
    props: ['Badge', 'BaseBadge'],
    variants: 'variant: default · standout · size: small · medium · large · color: blue gray green orange red yellow',
    render: (t) =>
      h(
        'div',
        null,
        ['default', 'standout'].map((v) =>
          row(
            h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, v),
            ['blue', 'gray', 'green', 'orange', 'red', 'yellow'].map((c) => h(P.Badge, { key: c, variant: v, color: c, text: c === 'blue' ? 'Pro' : c })),
          ),
        ),
        row(
          h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, 'size'),
          ['small', 'medium', 'large'].map((s) => h(P.Badge, { key: s, size: s, text: s })),
        ),
        row(h(P.Badge, { text: 'Free Pro Trial Unlocked for 7 Days', icon: 'check-rosette' })),
      ),
  },
  {
    name: 'NumberBadge',
    variants: 'size: small · large · color: default · accent',
    render: () => row(['small', 'large'].flatMap((s) => ['default', 'accent'].map((c) => h(P.NumberBadge, { key: s + c, size: s, color: c, value: 3 })))),
  },
  {
    name: 'Checkbox',
    render: (t) =>
      row(
        col('off', t, h(P.Checkbox, { defaultChecked: false })),
        col('on', t, h(P.Checkbox, { defaultChecked: true })),
        col('indeterminate', t, h(P.Checkbox, { indeterminate: true })),
        col('disabled', t, h(P.Checkbox, { disabled: true, defaultChecked: true })),
      ),
  },
  {
    name: 'Toggle',
    variants: 'size: medium · large (switch CSS)',
    render: (t) =>
      row(
        ['medium', 'large'].flatMap((s) =>
          [false, true].map((on) => col(`${s} · ${on ? 'on' : 'off'}`, t, h(P.Toggle, { key: s + on, size: s, defaultChecked: on }))),
        ),
        col('disabled', t, h(P.Toggle, { disabled: true, defaultChecked: true })),
      ),
  },
  { name: 'Spinner', render: () => row(h(P.Spinner)) },
  {
    name: 'ActivityIndicator',
    variants: 'variant: pending · success · warning · failure · determinate progress',
    render: (t) =>
      row(
        ['pending', 'success', 'warning', 'failure'].map((v) => col(v, t, h(P.ActivityIndicator, { key: v, variant: v }))),
        [0.25, 0.5, 0.75].map((p) => col(`progress ${p}`, t, h(P.ActivityIndicator, { key: p, variant: 'pending', progress: p }))),
      ),
  },
  {
    name: 'Shortcut',
    props: ['Shortcut', 'KeyboardKey'],
    variants: 'variant: default · framed · prominent · success · error · size: small · medium',
    render: (t) =>
      h(
        'div',
        null,
        ['default', 'framed', 'prominent', 'success', 'error'].map((v) =>
          row(
            h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, v),
            ['small', 'medium'].map((s) => h(P.Shortcut, { key: s, variant: v, size: s, keyCombination: cmd.k })),
            h(P.Shortcut, { variant: v, keyCombination: keys.enter }),
            h(P.Shortcut, { variant: v, keyCombination: mac(shortcuts.t.copy) }),
          ),
        ),
      ),
  },
  {
    name: 'KeyboardShortcut',
    render: () => row(h(P.KeyboardShortcut, { shortcut: HOTKEY_ALT_SPACE }), h(P.KeyboardShortcut, { shortcut: HOTKEY_CMD_K, size: 'small' })),
  },
  {
    name: 'VisualShortcut',
    note: 'Keycap rendering used by hotkey recorders (onboarding launch step).',
    render: () => row(h(P.VisualShortcut, { shortcut: HOTKEY_ALT_SPACE })),
  },
  { name: 'TagIcon', render: () => row(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta'].map((c) => h(P.TagIcon, { key: c, color: c }))) },
  {
    name: 'Avatar',
    render: () =>
      row(
        h(P.Avatar, { initials: 'RC', width: 16, height: 16, placeholderColor: 'var(--blue)' }),
        h(P.Avatar, { initials: 'RC', width: 24, height: 24, placeholderColor: 'var(--purple)' }),
        h(P.Avatar, { initials: 'TL', width: 32, height: 32, placeholderColor: 'var(--orange)' }),
      ),
  },
  {
    name: 'AppIcon',
    note: 'App icons are served by the host (ipc://image) — here, this Mac’s real icons.',
    render: () =>
      row(
        ['/Applications/Raycast.app', '/System/Applications/Notes.app', '/System/Applications/Calendar.app', '/System/Library/CoreServices/Finder.app'].map(
          (p) => h('div', { key: p, style: { width: 32, height: 32 } }, h(P.AppIcon, { src: `ipc://image?path=${encodeURIComponent(p)}&width=64&height=64` })),
        ),
      ),
  },
  {
    name: 'Logo',
    note: 'Logo renders its own <linearGradient id="logo-gradient">, so only one flavor is mounted at a time (as in the app).',
    render: (t) => h(LogoSwitcher, { t, size: 48 }),
  },
  {
    name: 'GradientBorder',
    note: 'Used by standout buttons/badges.',
    render: () =>
      row(
        h(
          'div',
          { className: 'ds-gradient-box' },
          h(P.GradientBorder, {
            type: 'conic',
            angle: 135,
            position: 'inside',
            weight: 0.5,
            color1: 'var(--fg-5)',
            color2: 'var(--fg-60)',
            parentRadius: '8px',
            animated: true,
          }),
        ),
      ),
  },
];

const toastStore = (await mod('toast-store-yMR5z_cG.js')).a;
const hudStore = await mod('hud-store-D8l7mVGu.js');
const alertStore = (await mod('alert-store-DE6kVJ-t.js')).t;
function FeedbackDemo({ t }) {
  const b = (label, fn) => h('button', { key: label, className: `ds-pill ${t('small-text-strong')}`, onClick: fn }, label);
  return h(
    'div',
    { className: 'ds-row' },
    b('Toast · success', () => toastStore.open({ variant: 'success', title: 'Copied to Clipboard' })),
    b('Toast · failure', () => toastStore.open({ variant: 'failure', title: 'Could Not Delete Chat', message: 'Please try again.' })),
    b('Toast · pending', () => toastStore.open({ variant: 'pending', title: 'Transferring settings and data' })),
    b('HUD', () => hudStore.n.open({ title: 'Copied to Clipboard' })),
    b('Alert · default', () =>
      alertStore.open({
        icon: 'brand-ollama',
        title: 'Start Ollama Server?',
        description: "The Ollama server isn't running, so your local models can't be synced. Bayrust will start the server and then sync your models.",
        primaryAction: { title: 'Start & Sync', action: () => {} },
      }),
    ),
    b('Alert · destructive', () =>
      alertStore.open({
        title: 'Delete "Travel Plans" project?',
        description: 'Chats in this project will be moved back to the main list.',
        primaryAction: { title: 'Delete', variant: 'destructive', action: () => {} },
      }),
    ),
  );
}

export function LogoSwitcher({ t, size }) {
  const [flavor, setFlavor] = React.useState('Production');
  return h(
    'div',
    { className: 'ds-row' },
    h(P.Logo, { key: flavor, flavor, width: size, height: size }),
    ['Production', 'Internal', 'Development'].map((f) =>
      h('button', { key: f, className: `ds-pill ${t('small-text-strong')}`, 'data-active': f === flavor || undefined, onClick: () => setFlavor(f) }, f),
    ),
  );
}

function Controlled({ init, children }) {
  const [v, set] = React.useState(init);
  return children(v, set);
}

const MOLECULES = [
  {
    name: 'InputField',
    props: ['InputField', 'InputFieldPrimitiveInner.Root'],
    variants: 'size: default · small · state: error',
    render: (t) =>
      h(
        'div',
        { className: 'ds-stack' },
        h(P.InputField, { placeholder: 'Placeholder' }),
        h(P.InputField, { placeholder: 'Small', size: 'small' }),
        h(P.InputField, { placeholder: 'With icon', iconLeading: 'magnifying-glass' }),
        h(P.InputField, { defaultValue: 'Invalid value', state: 'error' }),
        h(P.InputField, { placeholder: 'Disabled', disabled: true }),
      ),
  },
  {
    name: 'Textarea',
    render: () =>
      h(
        'div',
        { className: 'ds-stack' },
        h(P.Textarea, { placeholder: 'Please provide details about your feedback…', rows: 3 }),
        h(P.Textarea, { defaultValue: 'Error state', error: true, rows: 2 }),
      ),
  },
  {
    name: 'SearchInput',
    variants: 'variant: settings-sidebar · settings-header',
    render: () =>
      h(
        'div',
        { className: 'ds-stack' },
        h(P.SearchInput, { placeholder: 'Search settings…', variant: 'settings-sidebar' }),
        h(P.SearchInput, { placeholder: 'Search…', variant: 'settings-header' }),
        h(P.SearchInput, { placeholder: 'Loading', isLoading: true }),
      ),
  },
  {
    name: 'DropdownButton',
    variants: 'variant: default · ghost · bare · macos-nav · settings-header · size: default · small',
    render: (t) =>
      h(
        'div',
        null,
        ['default', 'ghost', 'bare', 'macos-nav', 'settings-header'].map((v) =>
          row(
            h('span', { className: `ds-label ${t('small-mono-text', { color: 'tertiary' })}` }, v),
            ['default', 'small'].map((s) => h(P.DropdownButton, { key: s, variant: v, size: s, text: 'Bayrust Dark', icon: 'moon' })),
            h(P.DropdownButton, { variant: v, placeholder: 'Select…' }),
          ),
        ),
      ),
  },
  {
    name: 'Select',
    variants: 'variant: default · ghost · macos-nav',
    render: () =>
      row(
        ['default', 'ghost', 'macos-nav'].map((v) =>
          h(Controlled, { key: v, init: 'dark' }, (value, set) =>
            h(P.Select, {
              variant: v,
              value,
              onValueChange: set,
              options: [
                { value: 'dark', label: 'Bayrust Dark' },
                { value: 'light', label: 'Bayrust Light' },
              ],
            }),
          ),
        ),
      ),
  },
  {
    name: 'ZoomControls',
    note: 'Settings › General › Interface Size.',
    render: () =>
      h(Controlled, { init: 1 }, (value, set) =>
        h(P.ZoomControls, {
          value,
          onChange: set,
          minValue: 0.85,
          maxValue: 1.15,
          getPreviousValue: (v) => Math.round((v - 0.15) * 100) / 100,
          getNextValue: (v) => Math.round((v + 0.15) * 100) / 100,
          'aria-labelledby': 'zoom',
        }),
      ),
  },
  {
    name: 'StandardListItem',
    props: ['StandardListItem.Root', 'List.Item'],
    variants: 'size: small · medium · large · multiline · state: selected',
    render: (t) =>
      h(
        'div',
        { className: 'ds-list' },
        [
          ['large', true],
          ['large', false],
          ['small', false],
        ].map(([size, selected], i) =>
          h(
            P.ListItem,
            { key: i, isSelected: selected },
            h(
              P.ListItemRoot,
              { size },
              h(P.ListItemIcon, null, h('img', { src: '/extension-clipboard-history-Bwcr0QuF.png', width: '100%', height: '100%' })),
              h(P.ListItemTitle, null, 'Clipboard History'),
              h(P.ListItemSubtitle, null, 'Bayrust'),
              h(P.ListItemAccessories, null, h(P.ListItemLabelAccessory, null, `Command · ${size}${selected ? ' · selected' : ''}`)),
            ),
          ),
        ),
      ),
  },
  {
    name: 'List.SectionHeader',
    props: ['List.SectionHeader', 'List.SectionHeaderTitle'],
    render: () => h('div', { className: 'ds-list' }, h(P.ListSectionHeader, null, h(P.ListSectionHeaderTitle, null, 'Suggestions'))),
  },
  {
    name: 'EmptyState',
    props: ['EmptyState'],
    render: () => h('div', { className: 'ds-box' }, h(P.EmptyState, { title: 'No Results', description: 'Try a different search term.' })),
  },
  { name: 'ErrorState', props: ['ErrorState'], render: () => h('div', { className: 'ds-box ds-box-tall' }, h(P.ErrorState, { reload: () => {} })) },
  {
    name: 'Hud.Root',
    props: ['Hud.Root'],
    note: 'HUD shown after actions (e.g. “Copied to Clipboard”).',
    render: () => row(h(P.HudRoot, { isMockedNativeView: true }, h(P.HudIcon, { icon: 'check-circle' }), h(P.HudTitle, null, 'Copied to Clipboard'))),
  },
];

const ORGANISMS = [
  {
    name: 'Feedback: Toast · HUD · Alert',
    props: ['Toast', 'Alert', 'Hud.Root'],
    note: 'Opened through the shipped toast, HUD and alert stores and rendered by the WindowShell hosts — the same path the app uses. Copy is taken verbatim from call sites in the bundle.',
    render: (t) => h(FeedbackDemo, { t }),
  },
  {
    name: 'ProgressiveBlur',
    variants: 'position: top · bottom · both',
    render: () =>
      row(
        ['top', 'bottom', 'both'].map((p) =>
          h(
            'div',
            { key: p, className: 'ds-blur-stage' },
            h('img', { src: '/abstract-background-B6jC_xhM.png' }),
            h(P.ProgressiveBlur, { position: p, height: 48 }),
          ),
        ),
      ),
  },
];

const page = (list, extra) =>
  function Page({ data, t }) {
    return h(
      'div',
      null,
      extra && h(extra, { data, t }),
      list.map((s) => h(Specimen, { key: s.name, data, t, s })),
    );
  };

// Organisms cropped from native WebKit renders of live app states (harness/organisms.mjs), plus native child panels.
const crops = await fetch('/ds-data/research/organisms/index.json')
  .then((r) => r.json())
  .catch(() => []);
const flowsIndex = await fetch('/ds/flows.json')
  .then((r) => r.json())
  .catch(() => []);
const panels = flowsIndex.flatMap((f) => f.groups.flatMap((g) => g.states.flatMap((st) => st.panels.map((file) => ({ flow: f.id, state: st, file })))));
function LiveOrganisms({ t }) {
  return h(
    'div',
    null,
    h(
      Section,
      {
        t,
        title: 'From the live app',
        note: 'Exact element crops from Bayrust’s own UI rendered in WebKit (as in the app, with native glass). Each links to the live window state.',
      },
      h(
        'div',
        { className: 'ds-organisms' },
        crops.map((c) =>
          h(
            'figure',
            { key: c.id, className: 'ds-organism' },
            h('a', { href: c.url, target: '_blank' }, h('img', { src: `/ds-data/${c.image}`, style: { width: Math.min(c.rect.w, 760) } })),
            h(
              'figcaption',
              null,
              h('span', { className: t('text-strong') }, c.label),
              h(
                'span',
                { className: t('mini-text', { color: 'tertiary' }) },
                `${Math.round(c.rect.w)}×${Math.round(c.rect.h)} · ${c.rect.cls.split(' ')[0] || c.selector}`,
              ),
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        t,
        title: 'Native child panels',
        note: 'Action panels and menus open as native child windows (window.open → panel sized to #native-view-root, anchored at the reference with the code’s zero offsets).',
      },
      h(
        'div',
        { className: 'ds-organisms' },
        panels.map((p) =>
          h(
            'figure',
            { key: p.file, className: 'ds-organism' },
            h('img', { src: `/ds-data/research/captures/${p.flow}/webkit/${p.file}`, style: { width: 350 } }),
            h(
              'figcaption',
              null,
              h('span', { className: t('text-strong') }, p.file.split('--').pop().replace('.png', '')),
              h('span', { className: t('mini-text', { color: 'tertiary' }) }, p.state.label),
            ),
          ),
        ),
      ),
    ),
  );
}
// every specimen, for the docs' specimen mode (app.js ?specimen=)
export const specimenList = () => [...ATOMS, ...MOLECULES, ...ORGANISMS];
export const atoms = [{ id: 'atoms', label: 'Atoms', level: 'Components', render: page(ATOMS) }];
export const molecules = [{ id: 'molecules', label: 'Molecules', level: 'Components', render: page(MOLECULES) }];
export const organisms = [{ id: 'organisms', label: 'Organisms', level: 'Components', render: page(ORGANISMS, LiveOrganisms) }];
