"""Reads facts for the foundation pages straight from the shipped frontend and the captured states.
Output: research/docs/facts.json. Every value is quoted from the source; nothing is computed into a new value
except counts.
"""
import json, os, re, glob, collections, struct

DOCS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.abspath(os.path.join(DOCS, '..', '..'))
FE = os.path.join(ROOT, 'reference', 'frontend')

css_files = {os.path.basename(f): open(f).read() for f in glob.glob(os.path.join(FE, '*.css'))}
js_all = ''.join(open(f).read() for f in glob.glob(os.path.join(FE, '*.js')))
MOD = re.compile(r'\.([a-z][a-z0-9-]*)__[A-Za-z0-9]+_[0-9a-f]{5}')

def rules(css):
    """Flat (selector, body, enclosing at-rule) triples, one level of @media/@container/@supports."""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        sel = css[i:j].strip()
        if sel.startswith('@') and not sel.startswith(('@font-face', '@keyframes')):
            depth, k = 1, j + 1
            while k < n and depth:
                depth += {'{': 1, '}': -1}.get(css[k], 0); k += 1
            for s, b, _ in rules(css[j + 1:k - 1]): out.append((s, b, sel))
            i = k; continue
        if sel.startswith('@keyframes'):
            depth, k = 1, j + 1
            while k < n and depth:
                depth += {'{': 1, '}': -1}.get(css[k], 0); k += 1
            i = k; continue
        k = css.find('}', j)
        out.append((sel, css[j + 1:k], None)); i = k + 1
    return out

ALL = [(f, s, b, at) for f, css in css_files.items() for s, b, at in rules(css)]
def mods(sel): return sorted(set(MOD.findall(sel)))
def decls(body): return [(m.group(1).strip(), m.group(2).strip()) for m in re.finditer(r'([a-z-]+)\s*:\s*([^;]+)', body)]

facts = {}

# themes bundled with the app (the default accent J is #4FA3F8)
accent_default = re.search(r'var J=`(#[0-9A-Fa-f]{6})`,gn=\{id:`bundled-raycast-dark`', js_all)
themes = {}
for m in re.finditer(r'\{id:`(bundled-[a-z-]+)`,name:`([^`]+)`,isBundled:!0,appearance:`(dark|light)`,([^}]*)\}', js_all):
    vals = dict(re.findall(r'([a-zA-Z]+):`?(#[0-9A-Fa-f]{6}|J)`?', m.group(4)))
    if vals.get('accent') == 'J': vals['accent'] = accent_default.group(1) if accent_default else 'J'
    themes.setdefault(m.group(1), {'id': m.group(1), 'name': m.group(2), 'appearance': m.group(3), **vals})
facts['themes'] = list(themes.values())

# interface size (Settings › General): ma=[Default 1, Large 1+step, Larger 1+2·step], step and max from ui-testing-surfaces
step = re.search(r'var r=([0-9.]+),i=(\.[0-9]+),a=t\(\{defaultValue:1,minValue:1,maxValue:r,step:i\}\)', js_all)
facts['interfaceSize'] = {'step': float(step.group(2)), 'max': float(step.group(1)), 'options': [{'label': 'Default', 'zoom': 1}, {'label': 'Large', 'zoom': round(1 + float(step.group(2)), 2)}, {'label': 'Larger', 'zoom': round(1 + 2 * float(step.group(2)), 2)}]} if step else None

# media, container and supports queries with the modules they style
q = collections.defaultdict(lambda: {'count': 0, 'modules': set()})
for f, s, b, at in ALL:
    if at and at.startswith(('@media', '@container', '@supports')):
        q[at]['count'] += 1; q[at]['modules'].update(mods(s))
facts['queries'] = sorted([{'query': k, 'count': v['count'], 'modules': sorted(v['modules'])} for k, v in q.items()], key=lambda x: -x['count'])

def values(props, keep=lambda v: True):
    c, where, used = collections.Counter(), collections.defaultdict(set), collections.defaultdict(set)
    for f, s, b, at in ALL:
        for p, v in decls(b):
            if p in props and keep(v): c[v] += 1; where[v].update(mods(s)); used[v].add(p)
    # props: the properties the value is declared on (a gradient may be a background, a mask or a border image)
    return [{'value': v, 'count': n, 'modules': sorted(where[v])[:6], 'props': sorted(used[v])} for v, n in c.most_common()]

facts['shadows'] = values({'box-shadow'}, lambda v: v not in ('none', 'unset', 'inherit'))[:40]
facts['borders'] = values({'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'outline'}, lambda v: v not in ('none', '0', 'unset'))[:40]
facts['borderWidths'] = values({'border-width'})[:20]
facts['opacity'] = values({'opacity'})
facts['gradients'] = values({'background', 'background-image', 'mask-image', '-webkit-mask-image', 'border-image', 'fill'}, lambda v: 'gradient(' in v)[:50]
facts['filters'] = values({'backdrop-filter', '-webkit-backdrop-filter', 'filter'}, lambda v: v not in ('none',))[:30]

# interaction states: which selectors the stylesheets use, and on which modules
STATE_SEL = {
    'Hover': r':hover|\[data-state=["\']?hover|\[data-hover', 'Focus': r':focus(?:-visible|-within)?|\[data-state=["\']?focus|\[data-focus',
    'Active': r':active|\[data-state=["\']?pressed|\[data-pressed|\[data-active', 'Selected': r'\[data-selected|\[aria-selected|\[data-state=["\']?selected|\[aria-current',
    'Disabled': r':disabled|\[disabled|\[data-disabled|\[aria-disabled', 'Open': r'\[data-state=["\']?open|\[aria-expanded', 'Read-only': r'read-only|readonly',
    'Error': r'\[data-variant=["\']?error|\[data-state=["\']?error|\[aria-invalid', 'Checked': r':checked|\[data-checked|\[aria-checked|\[data-state=["\']?checked',
}
st = {}
for name, pat in STATE_SEL.items():
    rx = re.compile(pat); c = collections.Counter(); ex = {}
    for f, s, b, at in ALL:
        if rx.search(s):
            for m in mods(s) or ['(global)']:
                c[m] += 1
                ex.setdefault(m, (s[:160], b[:200]))
    st[name] = {'rules': sum(c.values()), 'modules': [{'module': m, 'rules': n, 'example': ex[m]} for m, n in c.most_common(25)]}
facts['states'] = st

# control sizes: declarations of each size variant
SIZED = ['base-button', 'button-primitive', 'icon-button', 'input-field-primitive', 'standard-list-item', 'switch', 'shortcut', 'badge', 'number-badge', 'button-radio-group-primitive', 'dropdown-button', 'color-swatch']
sizes = {}
for f, s, b, at in ALL:
    m = re.search(r'\[data-size=["\']?([a-z0-9-]+)', s)
    if not m: continue
    for mod in mods(s):
        if mod in SIZED:
            d = [(p, v) for p, v in decls(b) if p in ('height', 'min-height', 'width', 'padding', 'padding-inline', 'padding-block', 'font-size', 'gap', 'border-radius', '--icon-size', 'min-width', 'line-height')]
            if d: sizes.setdefault(mod, {}).setdefault(m.group(1), []).extend(d)
facts['sizes'] = {k: {s: list(dict.fromkeys(f'{p}: {v}' for p, v in d)) for s, d in v.items()} for k, v in sizes.items()}

# accessibility attributes in the captured states
roles, arias = collections.Counter(), collections.Counter()
for f in glob.glob(os.path.join(ROOT, 'research', 'captures', '*', '*.json')):
    if f.endswith('index.json'): continue
    h = json.load(open(f)).get('html', '')
    roles.update(re.findall(r'\brole="([^"]+)"', h)); arias.update(re.findall(r'\b(aria-[a-z]+)=', h))
facts['aria'] = {'roles': roles.most_common(), 'attributes': arias.most_common()}
facts['reducedMotion'] = sum(1 for f, s, b, at in ALL if at and 'prefers-reduced-motion' in at)
facts['contrast'] = sorted(set(re.findall(r'\[contrast-disabled\][^{]*', ''.join(css_files.values()))))[:6]

# images shipped with the frontend
def dims(p):
    with open(p, 'rb') as fh: b = fh.read(32)
    if b[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', b[16:24])
    return None
imgs = []
for f in sorted(os.listdir(FE)):
    ext = f.rsplit('.', 1)[-1].lower()
    if ext in ('png', 'jpg', 'jpeg', 'webp', 'svg', 'mp4'):
        p = os.path.join(FE, f); d = dims(p)
        imgs.append({'file': f, 'type': ext, 'bytes': os.path.getsize(p), 'w': d[0] if d else None, 'h': d[1] if d else None})
facts['images'] = imgs


# per module: the data-*/aria-* attribute values and pseudo-classes its selectors use (variants and states)
mattrs = collections.defaultdict(lambda: collections.defaultdict(set))
for f, s, b, at in ALL:
    for part in s.split(','):
        for m in MOD.finditer(part):
            mod = m.group(1)
            for a, v in re.findall(r'\[((?:data|aria)-[a-z-]+)(?:[~|^$*]?=["\']?([^\]"\']+))?', part): mattrs[mod][a].add(v or '(present)')
            for pc in re.findall(r':(hover|focus-visible|focus-within|focus|active|disabled|checked|empty|placeholder-shown)', part): mattrs[mod][':' + pc].add('')
facts['moduleAttrs'] = {m: {a: sorted(v) for a, v in d.items()} for m, d in mattrs.items()}

# per module: the captured states it appears in
mstates = collections.defaultdict(set)
for f in glob.glob(os.path.join(ROOT, 'research', 'captures', '*', '*.json')):
    if f.endswith('index.json'): continue
    h = json.load(open(f)).get('html', '')
    st = os.path.relpath(f, os.path.join(ROOT, 'research', 'captures'))[:-5]
    for m in set(re.findall(r'\b([a-z][a-z0-9-]*)__[A-Za-z0-9]+_[0-9a-f]{5}', h)): mstates[m].add(st)
facts['moduleStates'] = {m: sorted(v) for m, v in mstates.items()}

json.dump(facts, open(os.path.join(ROOT, 'research', 'docs', 'facts.json'), 'w'), indent=1)
print('themes', len(facts['themes']), '· queries', len(facts['queries']), '· shadows', len(facts['shadows']), '· gradients', len(facts['gradients']),
      '· sized', list(facts['sizes']), '· images', len(imgs), '· roles', len(roles))
