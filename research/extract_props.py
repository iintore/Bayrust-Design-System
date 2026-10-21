# For each named component, recover its props (destructured parameters with defaults) and the
# string values its body compares props against (variant enums), straight from the shipped source.
import re, json
inv = json.load(open('research/component-inventory.json'))
src_cache = {}
def src(m):
    if m not in src_cache: src_cache[m] = open(f'reference/frontend/{m}').read()
    return src_cache[m]

def balanced(s, i, open_='{', close='}'):
    depth = 0
    for j in range(i, len(s)):
        if s[j] == open_: depth += 1
        elif s[j] == close:
            depth -= 1
            if depth == 0: return j
    return -1

def params_and_body(s, local):
    # function X({...}){...}  |  X=...forwardRef(function(...)|(({...},ref)=>...)
    for pat in [r'function ' + re.escape(local) + r'\(', r'[,;{\s]' + re.escape(local) + r'=(?:[\w$.]+\.forwardRef\()?(?:function[\w$]*)?\(']:
        m = re.search(pat, s)
        if not m: continue
        p0 = m.end() - 1
        p1 = balanced(s, p0, '(', ')')
        params = s[p0 + 1:p1]
        b0 = s.find('{', p1)
        arrow = s[p1 + 1:p1 + 3] == '=>'
        if arrow and s[p1 + 3] != '{':
            body = s[p1 + 3:p1 + 3 + 4000]
        else:
            b1 = balanced(s, b0)
            body = s[b0:b1 + 1]
        return params, body
    return None, None

def parse_props(params):
    if not params or not params.startswith('{'): return []
    inner = params[1:balanced(params, 0)]
    props, depth, cur = [], 0, ''
    for ch in inner:
        if ch in '{[(' : depth += 1
        if ch in '}])' : depth -= 1
        if ch == ',' and depth == 0: props.append(cur); cur = ''
        else: cur += ch
    if cur: props.append(cur)
    out = []
    for p in props:
        p = p.strip()
        if p.startswith('...'): out.append({'name': '...rest'}); continue
        m = re.match(r'(["\w$-]+)(?::([\w$]+))?(?:=(.+))?$', p, re.S)
        if m: out.append({k: v for k, v in {'name': m.group(1).strip('"'), 'local': m.group(2), 'default': m.group(3)}.items() if v})
    return out

result = {}
for name, defs in inv.items():
    d = next((x for x in defs if x['export']), defs[0])
    s = src(d['module'])
    params, body = params_and_body(s, d['local'])
    props = parse_props(params)
    values = {}
    if body:
        for p in props:
            v = p.get('local') or p['name']
            if v.startswith('...'): continue
            found = set(re.findall(r'\b' + re.escape(v) + r'===`([^`]{1,40})`', body)) | set(re.findall(r'`([^`]{1,40})`===' + re.escape(v) + r'\b', body))
            if p.get('default', '').startswith('`'): found.add(p['default'].strip('`'))
            if found: values[p['name']] = sorted(found)
        data_attrs = sorted(set(re.findall(r'"(data-[a-z-]+)"', body)))
    else: data_attrs = []
    result[name] = {'module': d['module'], 'export': d['export'], 'props': props, 'values': values, 'dataAttributes': data_attrs,
                    'css': sorted(set(re.findall(r'`([a-z0-9-]+__[A-Za-z0-9]+_[0-9a-f]{5})`', body or '')))[:40]}
json.dump(result, open('research/component-props.json', 'w'), indent=1, sort_keys=True)
with_props = sum(1 for v in result.values() if v['props'])
print(len(result), 'components;', with_props, 'with recovered props')
for k in ['Badge', 'Button', 'IconButton', 'Checkbox', 'Spinner', 'VisualShortcut', 'InputField', 'Select', 'SearchInput', 'Logo', 'Popover', 'KeyboardShortcutRecorder', 'ActivityIndicator', 'BoxedEmoji']:
    v = result.get(k); print(k, json.dumps({'props': [p['name'] + ('=' + p['default'] if 'default' in p else '') for p in v['props']], 'values': v['values']})[:400] if v else None)
