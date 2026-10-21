"""Builds the Bayrust docs: src/content/content.json and the static files under public/.

Every value comes from the extraction outputs; nothing here is drawn or estimated:
  design-system/tokens/      resolved tokens (Dark + Light) and their source rules
  design-system/site/        motion.json, manifest.json (sprite symbols), flows.json (native renders)
  research/docs/capture.json live component markup and block markup (harness/docs-capture.mjs)
  research/component-props.json  props recovered from the shipped bundles
  research/organisms/        native crops of each block
  research/captures/*/webkit native WebKit renders of every flow state
  reference/frontend/        the shipped stylesheets, fonts, images and icon sprite
Display text is renamed Raycast → Bayrust, as harness/brand.js does in the running app.
"""
import json, os, re, shutil, glob, hashlib

DOCS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.abspath(os.path.join(DOCS, '..', '..'))
FE = os.path.join(ROOT, 'reference', 'frontend')
PUB = os.path.join(DOCS, 'public')
DS = os.path.join(PUB, 'ds')
J = lambda *p: json.load(open(os.path.join(ROOT, *p)))

def brand(s):
    return s.replace('Raycast', 'Bayrust').replace('RAYCAST', 'BAYRUST') if isinstance(s, str) else s

# previews are live; screenshots are no longer published
if os.path.isdir(os.path.join(DS, 'shots')): shutil.rmtree(os.path.join(DS, 'shots'))
for d in ['assets', 'sprite', 'icons', 'appicons', 'shots', 'native']:
    os.makedirs(os.path.join(DS, d), exist_ok=True)

# ---------------------------------------------------------------- shipped stylesheets → bundle.css
assets = set()
def css_urls(css):
    def sub(m):
        u = m.group(2)
        if u.startswith(('data:', 'http', '#', '/')): return m.group(0)
        name = u.split('/')[-1].split('?')[0].split('#')[0]
        if os.path.exists(os.path.join(FE, name)): assets.add(name)
        return f'url({m.group(1)}assets/{name}{m.group(1)})'
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', sub, css)
# css-*.css (globals, tokens) first, then every module stylesheet in name order
files = sorted(glob.glob(os.path.join(FE, '*.css')), key=lambda f: (not os.path.basename(f).startswith('css-'), os.path.basename(f)))
bundle = [f'/* {os.path.basename(f)} */\n' + css_urls(open(f).read()) for f in files]
open(os.path.join(DS, 'bundle.css'), 'w').write('/* The 158 stylesheets shipped in Raycast 2.8.2 frontend/, unmodified except asset URLs. */\n' + '\n'.join(bundle))

# The theme's base colours are set at runtime on .active-theme (from the theme JSON). Write them out
# per mode exactly as resolved, so previews outside the app get the same theme.
raw = J('design-system', 'tokens', 'tokens-raw.json')
_core = open(glob.glob(os.path.join(FE, 'css-*.css'))[0]).read()
def css_decl_early(var, sel):
    m = re.search(re.escape(sel) + r'\{[^}]*?' + re.escape(var) + r':([^;}]+)', _core)
    return m.group(1).strip() if m else None
theme_css = []
for mode in ['dark', 'light']:
    toks = raw[mode]['tokens']
    decl = [f'  {k}: {v["resolved"]};' for k, v in toks.items() if '.active-theme' in v['declaredIn']]
    theme_css.append(f'.active-theme[{mode}] {{\n' + '\n'.join(decl) + '\n}')
open(os.path.join(DS, 'theme.css'), 'w').write('/* Bayrust Dark / Bayrust Light base colours, as the runtime sets them on .active-theme. */\n' + '\n'.join(theme_css) + '\n')
shutil.copy(os.path.join(ROOT, 'design-system', 'site', 'ds.css'), os.path.join(DS, 'ds.css'))

# Docs chrome colours: the docs site's own variable names, pointed at Bayrust's resolved tokens.
CHROME = {
    'color-bg': 'color-window-base', 'color-bg-secondary': 'color-surface-list-hover', 'color-bg-hover': 'color-surface-list-hover',
    'color-bg-selected': 'color-surface-list-selection', 'color-bg-selected-secondary': 'color-surface-list-hover', 'color-bg-canvas': 'color-panel-backdrop',
    'color-text': 'color-text-primary', 'color-text-secondary': 'color-text-secondary', 'color-text-tertiary': 'color-text-tertiary',
    'color-text-danger': 'red', 'color-text-component': 'purple', 'color-icon': 'color-text-primary', 'color-icon-secondary': 'color-text-secondary',
    'color-icon-tertiary': 'color-text-tertiary', 'color-border': 'color-border-separator', 'color-bordertranslucent': 'color-border-separator',
}
chrome = ["@font-face{font-family:InterVariable;font-style:normal;font-weight:100 900;font-display:swap;src:url(assets/InterVariable.woff2) format('woff2')}",
          "@font-face{font-family:InterVariable;font-style:italic;font-weight:100 900;font-display:swap;src:url(assets/InterVariable-Italic.woff2) format('woff2')}",
          "@font-face{font-family:JetBrainsMono;font-style:normal;font-weight:400;font-display:swap;src:url(assets/JetBrainsMono-Regular.woff2) format('woff2')}"]
for mode in ['light', 'dark']:
    toks = raw[mode]['tokens']
    decl = [f'  --{k}: {toks["--" + v]["resolved"]};' for k, v in CHROME.items()]
    # links, selection and focus use the accent as the app does with this Mac's accent colour (Blue)
    decl += ['  --color-text-brand: #007AFF;', '  --color-bg-brand: #007AFF;', '  --color-border-selected: #007AFF;', '  --color-text-onbrand: #fff;',
             '  --radius-4: 4px;', '  --radius: 8px;', f"  --shadow-elevation: {css_decl_early('--shadow-panel-shadow', '[macos]:root')};"]
    # Bayrust tokens the docs chrome uses directly (prefixed --b-), as resolved in this theme
    for v in ['fg', 'fg-5', 'fg-10', 'fg-20', 'fg-40', 'fg-60', 'fg-80', 'bg', 'bg-40', 'bg-secondary-40', 'color-window-base', 'color-window-bg', 'color-window-bg-secondary',
              'color-surface-list-hover', 'color-surface-list-selection', 'color-surface-control', 'color-surface-input-field', 'color-text-primary', 'color-text-secondary',
              'color-text-tertiary', 'color-border-separator', 'color-border-field', 'color-panel-backdrop', 'red', 'green', 'yellow', 'purple', 'orange', 'blue',
              'color-token-primary', 'color-token-secondary', 'color-token-tertiary', 'color-token-string', 'color-token-highlight', 'bg-80']:
        decl.append(f'  --b-{v}: {toks["--" + v]["resolved"]};')
    decl.append('  --b-accent: #007AFF;')
    chrome.append(f":root[data-theme='{mode}'] {{\n" + '\n'.join(decl) + '\n}')
# theme-independent values: the panel shadow, and each theme's foreground (labels on light and dark samples)
chrome.append(":root {\n  --b-shadow-panel: " + css_decl_early('--shadow-panel-shadow', '[macos]:root') + ";\n"
              f"  --b-fg-on-light: {raw['light']['tokens']['--fg']['resolved']};\n  --b-fg-on-dark: {raw['dark']['tokens']['--fg']['resolved']};\n"
              "  --b-traffic-light-inactive: rgb(69, 69, 69); /* macOS window controls, inactive (native; measured on this Mac) */\n}")
open(os.path.join(DS, 'chrome.css'), 'w').write('/* Docs chrome: generated from Bayrust tokens by scripts/build_content.py. */\n' + '\n'.join(chrome) + '\n')
for f in ['InterVariable.woff2', 'InterVariable-Italic.woff2', 'JetBrainsMono-Regular.woff2']: assets.add(f)


# ---------------------------------------------------------------- icons
manifest = J('design-system', 'site', 'manifest.json')
sprite = open(os.path.join(FE, manifest['sprite'])).read()
symbols = []
for m in re.finditer(r'<symbol id="([^"]+)"( [^>]*)>([\s\S]*?)</symbol>', sprite):
    name, attrs, body = m.groups()
    open(os.path.join(DS, 'sprite', name + '.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg"><symbol id="s"{attrs}>{body}</symbol></svg>')
    symbols.append(name)
for f in glob.glob(os.path.join(ROOT, 'design-system', 'assets', 'icons-svg', '*.svg')):
    shutil.copy(f, os.path.join(DS, 'icons'))
for f in glob.glob(os.path.join(ROOT, 'research', 'docs', 'files', 'appicons', '*.png')):
    shutil.copy(f, os.path.join(DS, 'appicons'))
for f in glob.glob(os.path.join(ROOT, 'design-system', 'assets', 'native', 'app-icons', '*.png')):
    shutil.copy(f, os.path.join(DS, 'native'))

# ---------------------------------------------------------------- shots (native renders)
def shot(src, name):
    """Copies a render into public/ds/shots and returns its URL path (composited child panels when present)."""
    comp = src.replace('.png', '--composite.png')
    if os.path.exists(os.path.join(ROOT, comp)): src = comp
    if not os.path.exists(os.path.join(ROOT, src)): return None
    shutil.copy(os.path.join(ROOT, src), os.path.join(DS, 'shots', name + '.png'))
    return f'/ds/shots/{name}.png'

def png_size(path):
    with open(os.path.join(ROOT, path) if not path.startswith('/') else path, 'rb') as f:
        b = f.read(24)
    return int.from_bytes(b[16:20], 'big'), int.from_bytes(b[20:24], 'big')

# ---------------------------------------------------------------- tokens
tok = J('design-system', 'tokens', 'raycast.tokens.json')
def ext(t): return t['$extensions']['raycast']
def usage(e):
    src = e['source']
    return f"Source `{src}` · declared in `{', '.join(e['declaredIn'][:2])}`" if src not in (e['dark'], e['light']) else f"Declared in `{', '.join(e['declaredIn'][:2])}`"

COLOR_GROUPS = [('Palette', 'color.palette'), ('Text', 'color.text'), ('Borders', 'color.border'), ('Surfaces', 'color.surface'), ('Semantic', 'color.semantic'), ('Other', 'color.other')]
color_groups = []
for label, key in COLOR_GROUPS:
    items = []
    for name, t in tok[key].items():
        e = ext(t)
        # palette: base hues and their 10/20 steps only (the 0/5/40/60/80 steps follow the same formula)
        if key == 'color.palette' and re.search(r'-(0|5|40|60|80)$', name): continue
        items.append({'name': name, 'value': {'dark': e['dark'], 'light': e['light']}, 'usage': usage(e)})
    color_groups.append({'name': label, 'tokens': items})
# colours the runtime sets on .active-theme from the theme JSON
BASE13 = ['bg', 'bg-secondary', 'fg', 'theme-accent', 'selection', 'loader', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta']
themed = {'Theme base': [], 'Contrast variants': [], 'Code tokens': [], 'Other theme colours': []}
for k, v in raw['dark']['tokens'].items():
    if '.active-theme' not in v['declaredIn']: continue
    n = k[2:]
    grp = 'Theme base' if n in BASE13 else 'Contrast variants' if re.search(r'-(contrast|on-tint-\d+)$', n) else 'Code tokens' if n.startswith('color-token-') else 'Other theme colours'
    note = {'Theme base': 'Theme base colour', 'Contrast variants': 'Hue adjusted for contrast on the window or on its own tint', 'Code tokens': 'Syntax colour for code', 'Other theme colours': 'Theme colour'}[grp]
    themed[grp].append({'name': n, 'value': {'dark': v['resolved'], 'light': raw['light']['tokens'][k]['resolved']}, 'usage': note + ', set on `.active-theme` by the theme (Bayrust Dark / Bayrust Light)'})
themed['Theme base'].sort(key=lambda t: BASE13.index(t['name']))
color_groups[:0] = [{'name': g, 'tokens': t} for g, t in themed.items() if t]
_seen = set()
for g in color_groups:
    g['tokens'] = [t for t in g['tokens'] if not (t['name'] in _seen or _seen.add(t['name']))]
color_groups = [g for g in color_groups if g['tokens']]

def scale(key, prefix=None):
    out = []
    for name, t in tok[key].items():
        if prefix and not name.startswith(prefix): continue
        e = ext(t)
        out.append({'name': name, 'value': e['dark'], 'usage': usage(e)})
    return sorted(out, key=lambda x: float(re.sub(r'[^0-9.]', '', x['name'].split('-')[-1]) or 1e9))

# Shadows: the computed-style read of these resolves to a colour, so take the declarations from the CSS.
core = open(glob.glob(os.path.join(FE, 'css-*.css'))[0]).read()
def css_decl(var, sel):
    m = re.search(re.escape(sel) + r'\{[^}]*?' + re.escape(var) + r':([^;}]+)', core)
    return m.group(1).strip() if m else None
def shadow_tok(var, sel, note):
    d, l = raw['dark']['tokens'].get('--' + var, {}).get('resolved'), raw['light']['tokens'].get('--' + var, {}).get('resolved')
    if d and l and 'px' in d: return {'name': var, 'value': {'dark': d, 'light': l}, 'usage': note}
    return {'name': var, 'value': css_decl('--' + var, sel), 'usage': note}
_shadows_unused = [
    {'name': 'shadow-panel-shadow', 'value': css_decl('--shadow-panel-shadow', '[macos]:root'), 'usage': 'Panel and popover shadow on macOS (`[macos]:root`)'},
    {'name': 'shadow-panel-border', 'value': css_decl('--shadow-panel-border', ':root'), 'usage': 'Panel hairline on Windows (`:root`); macOS panels use the glass edge instead'},
    {'name': 'shadow-panel', 'value': css_decl('--shadow-panel', '[macos]:root'), 'usage': 'Combined panel shadow on macOS (`[macos]:root`)'},
]
shadows = [shadow_tok('shadow-panel-shadow', '[macos]:root', 'Panel and popover shadow on macOS (`[macos]:root`)'),
           shadow_tok('shadow-panel-border', ':root', 'Panel hairline on Windows (`:root`); macOS panels use the glass edge instead'),
           shadow_tok('shadow-panel', '[macos]:root', 'Combined panel shadow on macOS (`[macos]:root`)')]

TEXT_STYLES = [['heading1', 'inter', 24, 600], ['heading2', 'inter', 18, 600], ['extra-large-text', 'inter', 18, 400], ['extra-large-text-strong', 'inter', 18, 500],
  ['large-text', 'inter', 16, 400], ['large-text-strong', 'inter', 16, 500], ['text', 'inter', 13, 400], ['text-strong', 'inter', 13, 500],
  ['small-text', 'inter', 11, 400], ['small-text-strong', 'inter', 11, 500], ['mini-text', 'inter', 8, 400], ['mini-text-strong', 'inter', 8, 500],
  ['mono-text', 'mono', 13, 400], ['mono-text-strong', 'mono', 13, 600], ['small-mono-text', 'mono', 11, 400]]
type_styles = [{'name': n, 'family': f, 'fontSize': s, 'fontWeight': w} for n, f, s, w in TEXT_STYLES]

motion = J('design-system', 'site', 'motion.json')

tokens = {
    'name': 'Bayrust', 'version': '2.8.2',
    'color': {'groups': color_groups},
    'type': {'families': {'inter': 'InterVariable, system-ui, sans-serif', 'mono': 'JetBrainsMono, monospace'}, 'styles': type_styles},
    'spacing': {'tokens': scale('space')},
    'iconSize': {'tokens': scale('icon-size')},
    'fontSize': {'tokens': scale('typography', 'font-size')},
    'radius': {'tokens': scale('radius')},
    'blur': {'tokens': scale('blur')},
    'shadow': {'tokens': shadows},
    'motion': {'easings': motion['easings'], 'durations': motion['durations'], 'framer': motion['framerMotionTransitions'], 'keyframes': [k['name'] for k in motion['keyframes']]},
}

# ---------------------------------------------------------------- helpers
pages, nav = {}, []
def md_table(head, rows):
    esc = lambda c: str(c).replace('|', '\\|').replace('\n', ' ')
    return '| ' + ' | '.join(head) + ' |\n|' + '---|' * len(head) + '\n' + '\n'.join('| ' + ' | '.join(esc(c) for c in r) + ' |' for r in rows) + '\n'
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def one_copy(html):
    """Host-rendered feedback was captured once per WindowShell host on the page; a window shows one."""
    parts = re.split(r'\n(?=<)', html)
    return parts[0] if len(parts) > 1 and all(p.strip() == parts[0].strip() for p in parts) else html

def localize(html):
    """Collects the frontend images the captured markup references into public/ds/assets."""
    for name in re.findall(r'/ds/assets/([^"&\')\s]+)', html):
        if os.path.exists(os.path.join(FE, name)): assets.add(name)
    return html


# ---------------------------------------------------------------- live windows (harness/docs-windows.mjs)
WIN_SRC = os.path.join(ROOT, 'research', 'docs', 'windows')
if os.path.isdir(os.path.join(DS, 'windows')): shutil.rmtree(os.path.join(DS, 'windows'))
if os.path.isdir(WIN_SRC): shutil.copytree(WIN_SRC, os.path.join(DS, 'windows'))
# States whose capture is identical to an earlier state of the same flow didn't reach the screen they're named after
# (the capture never advanced); they're left out rather than shown under the wrong name. Typing in the compact
# launcher expands it to the full search, so that pair is equal by design.
SAME_BY_DESIGN = {'launcher/02-search-clip'}
def _content(fid, sid):
    d = json.load(open(os.path.join(WIN_SRC, fid, sid + '.json')))
    return d, hashlib.md5((d['html'] + json.dumps(d['attrs'], sort_keys=True) + ''.join(p['html'] for p in d['panels'])).encode()).hexdigest()
REPEATS = set()
if os.path.isdir(WIN_SRC):
    for _f in J('design-system', 'site', 'flows.json'):
        _seen = set()
        for _g in _f['groups']:
            for _st in _g['states']:
                if not os.path.exists(os.path.join(WIN_SRC, _f['id'], _st['id'] + '.json')): continue
                _h = _content(_f['id'], _st['id'])[1]
                if _h in _seen and f"{_f['id']}/{_st['id']}" not in SAME_BY_DESIGN: REPEATS.add(f"{_f['id']}/{_st['id']}")
                _seen.add(_h)

def win(fid, sid):
    """A captured window state, rendered live by the docs (None when it wasn't captured)."""
    f = os.path.join(WIN_SRC, fid, sid + '.json')
    if not os.path.exists(f) or f'{fid}/{sid}' in REPEATS: return None
    d = json.load(open(f))
    return {'file': f'{fid}/{sid}.json', 'w': d['w'], 'h': d['h']}

# ---------------------------------------------------------------- Getting started
cap = J('research', 'docs', 'capture.json')
props = J('research', 'component-props.json')
inventory = J('research', 'component-inventory.json')
flows = J('design-system', 'site', 'flows.json')
n_states = sum(len(g['states']) for f in flows for g in f['groups'])

pages['introduction'] = {
    'title': 'Introduction',
    'lead': 'Bayrust is the launcher, AI chat, notes and settings app documented here, rebuilt from the shipped 2.8.2 frontend. These docs cover its foundations, components, blocks, window templates and every captured flow.',
    'kind': 'windows',
    'windows': [w for w in [
        {'win': win('launcher', '01-root'), 'caption': 'Launcher, 750 × 475'},
        {'win': win('launcher', '00-compact'), 'caption': 'Launcher, compact, 750 × 64'},
        {'win': win('settings', '01-general'), 'caption': 'Settings, 800 × 786'},
        {'win': win('onboarding', 'standard-01-welcome'), 'caption': 'Onboarding, 1280 × 760'},
    ] if w['win']],
    'md': f"""## What's in the system

Everything on these pages is the app itself: its stylesheets, tokens, icon sprite, fonts and images, and its own components and windows rendered live from their markup. Nothing is redrawn and nothing is a screenshot. Components Bayrust doesn't ship are composed from its own parts and labelled as such.

- **Foundations:** colour, typography, spacing, radius, elevation and materials, motion, iconography, logo and window layout. Each value is a CSS variable with a Dark and a Light value.
- **Components:** {len(cap['components'])} documented components, listed A–Z. Each example is the component's own rendered markup, previewed with the shipped stylesheets.
- **Blocks:** {len(cap['blocks'])} larger pieces of UI (search bar, list, action bar, sidebars, composer, onboarding cards), shown as native renders with their markup.
- **Templates:** the window layouts: default, compact and full screen.
- **Flows:** {n_states} states across {len(flows)} flows, from onboarding to Send Feedback, rendered natively at measured window sizes.

## Sources

| Output | Count |
|---|---|
| Named components in the frontend | {len(inventory):,} |
| Components with recovered props | {sum(1 for v in props.values() if v.get('props')):,} |
| CSS variables (Dark + Light) | {len(raw['dark']['tokens'])} |
| Icon sprite symbols | {len(symbols)} |
| Shipped stylesheets | {len(files)} |
| Flow states | {n_states} |

## Conventions

- **Theme.** Previews follow the docs theme switch: Bayrust Dark or Bayrust Light.
- **Accent.** The app uses the macOS accent colour when the host provides it (`--accent: var(--color-system-accent, var(--theme-accent))`). Previews use this Mac's: Blue, `#007AFF`.
- **Size.** All sizes are at Interface Size 100% (`--zoom: 1`). Every space, icon and font token scales with `--spx`.
""",
}
pages['installation'] = {
    'title': 'Installation',
    'lead': 'Start the harness to use the live app, then the docs site.',
    'md': """## The live app

The harness serves the shipped frontend, runs the app's own backend in a sandbox, and answers the native host's calls.

```bash
node harness/server.mjs
```

| URL | Window |
|---|---|
| `http://localhost:4317/main-window.html` | Launcher, 750 × 475 |
| `http://localhost:4317/main-window.html?windowMode=compact` | Launcher, compact |
| `http://localhost:4317/welcome-window.html?variant=standard` | Onboarding, 1280 × 760 |
| `http://localhost:4317/settings-window.html` | Settings, 800 × 786 |
| `http://localhost:4317/ai-chat-window.html` | AI Chat, 750 × 600 |
| `http://localhost:4317/notes-window.html` | Notes, 396 wide |
| `http://localhost:4317/theme-studio-window.html` | Theme Studio, 1370 × 570 |
| `http://localhost:4317/feedback-window.html` | Send Feedback, 420 × 714 |

Add `?brand=raycast` to any window to turn the Bayrust rename off.

## The docs

```bash
cd design-system/docs
npm install
npm run content
npm run dev
```

`npm run content` rebuilds `src/content/content.json` and `public/ds/` from the extraction outputs.
""",
}

# ---------------------------------------------------------------- Foundations
def prov(e): return e
found = []
def fpage(path, title, lead, md, kind=None, **kw):
    pages[path] = {'title': title, 'lead': lead, 'md': md, **({'kind': kind} if kind else {}), **kw}
    found.append({'title': title, 'path': path})

fpage('color', 'Color', 'Thirteen theme base colours, each with alpha steps, and semantic text, border and surface tokens built from them.', """## How colour is built

The theme sets thirteen base colours on `.active-theme`: `--bg`, `--bg-secondary`, `--fg`, `--theme-accent`, `--selection`, `--loader` and the seven hues. Every other colour is derived from these:

- **Alpha steps.** `.theme-root` defines `-0`, `-5`, `-10`, `-20`, `-40`, `-60` and `-80` for each base colour, as `rgb(from var(--fg) r g b / 60%)`.
- **Semantic tokens.** Text, border and surface tokens point at those steps, for example `--color-text-secondary: var(--fg-60)`.
- **Accent.** `--accent: var(--color-system-accent, var(--theme-accent))`. When the host provides the macOS accent colour, it wins over the theme's.
- **Window.** The window backdrop is `linear-gradient(to bottom, var(--color-window-bg), var(--color-window-bg-secondary))` over the native glass material.

The palette above lists the 10% and 20% steps; the other steps follow the same formula.
""", 'colors')

fpage('typography', 'Typography', 'InterVariable for the interface and JetBrains Mono for code, in fifteen named text styles.', """## Typefaces

| Family | Files | Use |
|---|---|---|
| InterVariable | `InterVariable.woff2`, `InterVariable-Italic.woff2` (weights 100–900) | Interface text |
| JetBrainsMono | `JetBrainsMono-Regular.woff2` | Code, shortcuts and numbers in mono styles |

Root settings: `font-feature-settings: "liga" 1, "calt" 1, "kern" 1, "ss03" 1`, `font-synthesis: none`, `font-optical-sizing: none`. On macOS, `-webkit-font-smoothing: subpixel-antialiased` and `font-family: InterVariable, system-ui, sans-serif`. Line height is left at the browser default.

## Text colours

`text` takes a `color` prop: `primary`, `secondary`, `tertiary`, `quaternary`, `disabled`, `link`, `accent`, `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `magenta` (and `inherit`). Each maps to a `--color-text-*` token or a hue.
""" + '\n## Font sizes\n\n' + md_table(['Token', 'Value'], [[f"`--{t['name']}`", t['value']] for t in tokens['fontSize']['tokens']]), 'type')

fpage('spacing', 'Spacing', 'Eleven spacing steps and four icon sizes, all scaled by Interface Size.', """## Scaling

Space, icon and font tokens are `round(calc(n * var(--spx)), 1px)` with `--spx: calc(1px * var(--zoom, 1))`. `--zoom` follows the Interface Size setting (Settings › General), so the whole UI scales on whole pixels.

## Icon sizes

""" + md_table(['Token', 'Value'], [[f"`--{t['name']}`", t['value']] for t in tokens['iconSize']['tokens']]), 'spacing')

fpage('radius', 'Radius', 'Corner radii from 2 px to the window radius, which depends on the macOS version.', """## Window radius

`--radius-window` is `--radius-window-macos-27` (20 px) on macOS 27 and `--radius-window-macos-26` (26 px) on macOS 26. On Windows it is 8 px.

## Concentric corners

The radius classes also set `--radius-closest`, so nested elements can use the radius of their nearest rounded parent.
""", 'radius')

fpage('elevation', 'Elevation & materials', 'Panels float on a layered shadow over native glass; blurs come in four steps.', """## Materials

Windows are native `NSGlassEffectView` windows. The web content draws its backdrop with WebKit's `-apple-visual-effect: -apple-system-glass-material-media-controls`, which needs the host's `useSystemAppearance`, and a translucent gradient on top (`.theme-root:before`).

Child panels (the action panel, menus) are separate native windows opened with `window.open()`, sized to their content.

## Blur

""" + md_table(['Token', 'macOS', 'Windows'], [[f"`--{t['name']}`", t['value'], {'blur-1': '15px', 'blur-2': '35px', 'blur-3': '60px', 'blur-4': '120px'}.get(t['name'], '')] for t in tokens['blur']['tokens']]), 'elevation')

ease_rows = [[f'`{e}`', n] for e, n in motion['easings']]
dur_rows = [[f'`{d}`', n] for d, n in motion['durations'][:20]]
fpage('motion', 'Motion', f"{len(motion['keyframes'])} keyframe animations, CSS transitions and {len(motion['framerMotionTransitions'])} Framer Motion configurations.", """## Named easings

| Token | Value |
|---|---|
| `--easing-ease-out-expo` | `cubic-bezier(.16, 1, .3, 1)` |
| `--easing-ease-out-back` | `cubic-bezier(.34, 1.56, .64, 1)` |

Buttons on macOS 27 scale on press with `transform .36s var(--easing-ease-out-back)`.

## Easings in use

How often each timing function appears across the shipped stylesheets.

""" + md_table(['Easing', 'Uses'], ease_rows) + """
## Durations in use

""" + md_table(['Duration', 'Uses'], dur_rows[:10]) + """
See [Transitions](/transitions) for every transition and Framer Motion configuration, and [Animation](/animation) for every keyframe animation.
""", 'motion')

fpage('iconography', 'Iconography', f'{len(symbols)} icons from the shipped sprite, drawn on a 16 × 16 grid.', """## Using icons

The UI references a symbol with `<use href="ipc://raycast-sprite/<name>#s">`; the host serves the symbol from the sprite. Sizes come from `--icon-12`, `--icon-16`, `--icon-22` and `--icon-32`, and colour from `currentColor`.

Names ending in `-1px` are thin-stroke variants; names ending in `-20` are drawn for 20 px. `brand-*` icons are third-party marks.
""", 'icons')

logo_c = next(c for c in cap['components'] if c['name'] == 'Logo')
logo_svg = re.search(r'<svg[\s\S]*?</svg>', logo_c['examples'][0]['html']).group(0)
mark = re.search(r'<path[\s\S]*?</path>', logo_svg).group(0)
open(os.path.join(DS, 'logo-mark.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 228 228" fill="{raw["dark"]["tokens"]["--red"]["resolved"]}">{mark}</svg>')
def flavored(f): return re.sub(r'data-flavor="[^"]+"', 'data-flavor="%s"' % f, logo_svg)
logo_ex = [{'title': f, 'sub': '', 'html': '<div class="ds-row">' + flavored(f) + '</div>', 'fill': False} for f in ['Production', 'Internal', 'Development']]
fpage('logo', 'Logo', 'The mark in its three flavors, and the app icons from the asset catalog.', """## Flavors

`Logo` takes `flavor`: `Production` fills with `--red`; `Internal` and `Development` fill with a two-stop gradient (`--purple` → `--blue`, and `--logo-color1-development` → `--yellow`).

## App icons

The app icons are the PNG renditions in `Assets.car`: Production, Internal, Development and RayConfig.

## Name

The artwork is unchanged. Only the displayed name is Bayrust.
""", 'logo', examples=logo_ex, shots=[{'src': f'/ds/native/{os.path.basename(f)}', 'caption': {'production': 'Production', 'internal': 'Internal', 'development': 'Development', 'RayConfig': 'RayConfig'}[os.path.basename(f).replace('-appicon-1024.png', '').replace('-1024.png', '')], 'w': 128} for f in sorted(glob.glob(os.path.join(DS, 'native', '*.png')))])

WINDOWS = [
    ('Launcher', '750 × 475', 'CSS tokens `--main-window-width`, `--main-window-expanded-height`; measured', 'No'),
    ('Launcher, compact', '750 × 64', '`--main-window-header-height` (64 on macOS)', 'No'),
    ('Onboarding', '1280 × 760', 'Measured', 'Yes'),
    ('Pro walkthrough', '1280 × 760 (712 on feature pages)', 'Code', 'Yes'),
    ('AI Chat', '750 × 600', 'Saved window frame', 'Yes'),
    ('Settings', '800 × 786', 'Measured', 'Yes'),
    ('Notes', '396 wide, height follows the note (830 for the welcome note)', 'Measured', 'No'),
    ('Theme Studio', '1370 × 570', 'Measured', 'Yes'),
    ('Send Feedback', '420 × 714', 'Measured', 'Yes'),
    ('Any window, full screen', '1710 × 1107 (this Mac’s built-in display)', 'Measured', '—'),
]
fpage('layout', 'Layout', 'Window sizes, header and footer heights, split views, and how windows fill the screen.', """## Windows

""" + md_table(['Window', 'Size (pt)', 'Source', 'Traffic lights'], WINDOWS) + """
## Header and footer

| Token | macOS | Elsewhere |
|---|---|---|
| `--main-window-header-height` | 64 | 66 |
| `--main-window-footer-height` | 44 (`--default-window-footer-height`) | 42 |
| `--default-window-header-height` | 52 | 52 (Windows: `--space-40`) |
| `--notes-window-footer-height` | 48 on macOS 27 | 52 |
| `--ai-chat-window-header-height` | 52 (44 on macOS 26) | 52 |

## Compact and full screen

The launcher has two window modes (Settings › General › Window Mode): **Default** opens at 750 × 475 with root search results; **Compact** opens as the 64 pt search bar alone and expands once you type. Windows with traffic lights can also fill the screen. Their content stretches and keeps the same tokens. See [Templates](/templates-launcher) for each window in each mode.
""")

# ---------------------------------------------------------------- Blocks (live: the window they belong to, cropped to them)
BLOCK_STATE = {'launcher-search-bar': 'launcher/01-root', 'root-search-list': 'launcher/01-root', 'action-bar': 'launcher/01-root',
               'calculator-card': 'launcher/03-calculator', 'emoji-grid': 'launcher/07-emoji', 'snippet-form': 'launcher/11-create-snippet',
               'settings-sidebar': 'settings/01-general', 'ai-chat-composer': 'ai-chat/01-new-chat', 'ai-chat-sidebar': 'ai-chat/01-new-chat',
               'onboarding-navigation': 'onboarding/standard-02-features', 'onboarding-feature-grid': 'onboarding/standard-02-features',
               'permission-rows': 'onboarding/standard-04-permissions'}
block_items = []
for b in cap['blocks']:
    fid, sid = BLOCK_STATE[b['id']].split('/')
    w = win(fid, sid)
    window = b['url'].split('?')[0].strip('/').replace('-window.html', '').replace('-', ' ').title()
    pages['block-' + b['id']] = {
        'title': brand(b['label']), 'kind': 'block',
        'lead': f"From the {window} window. Rendered live from the window's markup, cropped to the block.",
        'examples': [{'title': 'Block', 'sub': f'Live · {fid} › {sid}', 'html': localize(b['html']), 'win': w, 'crop': b['selector'], 'fill': False},
                     {'title': 'In its window', 'sub': f'Live · {fid} › {sid}', 'html': '', 'win': w, 'fill': False}] if w else [],
        'md': f"## Where it appears\n\n`{b['url']}`, element `{b['selector']}`.\n",
    }
    block_items.append({'title': brand(b['label']), 'path': 'block-' + b['id']})

# ---------------------------------------------------------------- Templates
def flow_state(fid, sid):
    for f in flows:
        if f['id'] != fid: continue
        for g in f['groups']:
            for s in g['states']:
                if s['id'] == sid: return s
TEMPLATES = [
    ('launcher', 'Launcher', 'The launcher in its two window modes.', [('launcher', '01-root', 'Default, 750 × 475'), ('launcher', '00-compact', 'Compact, 750 × 64'), ('launcher', '00-compact-typing', 'Compact, expanded after typing')]),
    ('onboarding', 'Onboarding', 'The welcome window: 1280 × 760, with a centred step and a bottom navigation.', [('onboarding', 'standard-01-welcome', 'Welcome'), ('onboarding', 'standard-02-features', 'Step with cards')]),
    ('settings', 'Settings', 'Sidebar and page, 800 × 786 by default, or the full screen.', [('settings', '01-general', 'Default, 800 × 786'), ('settings', 'fs-01-general', 'Full screen, 1710 × 1107'), ('settings', 'fs-02-ai', 'Full screen, AI page')]),
    ('ai-chat', 'AI Chat', 'Chat with sidebar and composer, 750 × 600 by default, or the full screen.', [('ai-chat', '01-new-chat', 'Default, 750 × 600'), ('ai-chat', 'fs-01-new-chat', 'Full screen, 1710 × 1107'), ('ai-chat', 'fs-02-typing', 'Full screen, typing')]),
    ('notes', 'Notes', 'A single note, 396 wide with the height of the note, or the full screen.', [('notes', '01-welcome-note', 'Default, 396 × 830'), ('notes', 'fs-01-welcome-note', 'Full screen, 1710 × 1107')]),
    ('theme-studio', 'Theme Studio', 'Theme list, editor and preview, 1370 × 570, or the full screen.', [('theme-studio', '01-raycast-dark', 'Default, 1370 × 570'), ('theme-studio', 'fs-01-raycast-dark', 'Full screen, 1710 × 1107')]),
    ('feedback', 'Send Feedback', 'A single form, 420 × 714, or the full screen.', [('feedback', '01-empty', 'Default, 420 × 714'), ('feedback', 'fs-01-empty', 'Full screen, 1710 × 1107')]),
    ('pro-walkthrough', 'Pro walkthrough', 'Welcome page at 1280 × 760, feature pages at 1280 × 712.', [('pro-walkthrough', '00-welcome', 'Welcome, 1280 × 760'), ('pro-walkthrough', '02-dictation', 'Feature page')]),
]
tmpl_items = []
for tid, title, lead, states in TEMPLATES:
    wins, missing = [], []
    for fid, sid, cap_ in states:
        w = win(fid, sid)
        (wins if w else missing).append({'win': w, 'caption': cap_} if w else cap_)
    md = '' if not missing else '## Not captured\n\n' + '\n'.join(f'- {m}' for m in missing) + '\n'
    pages['templates-' + tid] = {'title': title, 'lead': lead, 'kind': 'windows', 'windows': wins, 'md': md}
    tmpl_items.append({'title': title, 'path': 'templates-' + tid})

# ---------------------------------------------------------------- Flows
flow_items = []
for f in flows:
    wins = []
    for g in f['groups']:
        for st in g['states']:
            w = win(f['id'], st['id'])
            if w: wins.append({'win': w, 'caption': brand(st['label'].split(' — ', 1)[-1]), 'group': brand(g['label']) if len(f['groups']) > 1 else ''})
    vp = f['groups'][0]['states'][0]['viewport']
    pages['flow-' + f['id']] = {'title': brand(f['label']), 'lead': f"{len(wins)} states, live at {vp['width']} × {vp['height']}.", 'kind': 'windows', 'windows': wins, 'md': ''}
    flow_items.append({'title': brand(f['label']), 'path': 'flow-' + f['id']})

# ---------------------------------------------------------------- checklist pages (components, patterns, new foundations)
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pages2
ctx = dict(J=J, md_table=md_table, slug=slug, brand=brand, shot=shot, localize=localize, one_copy=one_copy, pages=pages, raw=raw,
           tokens=tokens, motion=motion, symbols=symbols, fpage=fpage, assets=assets)
pages2.build(ctx)

FOUNDATION_ORDER = ['design-tokens', 'color', 'typography', 'spacing', 'sizing', 'grid', 'layout', 'breakpoints', 'responsive-design', 'iconography',
                    'illustrations', 'imagery', 'logo', 'elevation', 'shadows', 'borders', 'radius', 'opacity', 'gradients', 'motion', 'animation',
                    'transitions', 'accessibility', 'themes', 'dark-mode', 'states']
def nav_item(path): return {'title': pages[path]['title'], 'path': path}
nav[:] = [
    {'label': 'Getting started', 'icon': 'house', 'items': [nav_item(p) for p in ('introduction', 'installation', 'coverage', 'changelog')]},
    {'label': 'Foundations', 'icon': 'swatch', 'items': [nav_item(p) for p in FOUNDATION_ORDER if p in pages]},
    {'label': 'Components', 'icon': 'app-window-grid-2x2', 'items': [i for i in ctx['comp_items'] if i['path'] not in FOUNDATION_ORDER]},
    {'label': 'Patterns', 'icon': 'layers', 'items': ctx['pattern_items']},
    {'label': 'Blocks', 'icon': 'app-window', 'items': block_items},
    {'label': 'Templates', 'icon': 'app-window-sidebar-left', 'items': tmpl_items},
    {'label': 'Flows', 'icon': 'stars', 'items': flow_items},
]
# internal links must point at a page (and, on family pages, at a member)
def _anchors(p): return {m['id'] for m in p.get('members') or []}
for path, p in pages.items():
    texts = [p.get('md', ''), p.get('lead', '')] + [m.get('md', '') + m.get('lead', '') for m in p.get('members') or []]
    for t in texts:
        for target in re.findall(r'\]\(/([^)\s]+)\)', t):
            dest, _, frag = target.partition('#')
            if dest not in pages or (frag and pages[dest].get('members') and frag not in _anchors(pages[dest])):
                print(f'broken link on {path}: /{target}')
missing = [p for p in pages if not any(i['path'] == p for g in nav for i in g['items'])]
if missing: print('pages not in nav:', missing)

# ---------------------------------------------------------------- assets referenced by CSS and markup
for name in assets:
    shutil.copy(os.path.join(FE, name), os.path.join(DS, 'assets', name))

def pt(url):
    w, h = png_size(os.path.join(PUB, url.lstrip('/')))
    return (w // 2, h // 2) if 'native/' not in url else (w, h)
for p in pages.values():
    for sh in p.get('shots') or []:
        if sh.get('src') and 'native/' not in sh['src']:
            sh['w'], sh['h'] = pt(sh['src'])
    for e in p.get('examples') or []:
        if e.get('image'): e['w'], e['h'] = pt(e['image'])
content = {'pages': pages, 'nav': nav, 'tokens': tokens, 'icons': symbols}
out = os.path.join(DOCS, 'src', 'content', 'content.json')
json.dump(content, open(out, 'w'), ensure_ascii=False, indent=1)
print(f"pages {len(pages)} · components {len(nav[2]['items'])} · patterns {len(nav[3]['items'])} · blocks {len(block_items)} · templates {len(tmpl_items)} · flows {len(flow_items)} · icons {len(symbols)} · assets {len(assets)} · shots {len(os.listdir(os.path.join(DS, 'shots')))}")
