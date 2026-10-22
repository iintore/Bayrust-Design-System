"""Checklist-driven pages: one page per component in the design-system checklist that Bayrust has, the new
foundation pages, Coverage and Changelog. Called from build_content.py with its helpers in `ctx`.

Specimens are exact: Bayrust's own playground, the live /ds/ specimens, instances from captured states,
live dialogs and pickers, and native renders. Text that describes a component is either quoted from the app
(playground descriptions and notes) or a plain statement of where a specimen came from.
"""
import json, os, re, collections

# Bayrust's playground annotation markup (classes from the shipped playground-annotation module).
ANN = ('<div class="playground-annotation__root_781d8"><span class="playground-annotation__marker_5c284">{m}</span>'
       '<span class="playground-annotation__content_56730">{c}</span></div>')


def build(ctx):
    J, md_table, slug, brand, shot, localize, one_copy = (ctx[k] for k in ('J', 'md_table', 'slug', 'brand', 'shot', 'localize', 'one_copy'))
    pages, raw, tokens, motion, symbols = ctx['pages'], ctx['raw'], ctx['tokens'], ctx['motion'], ctx['symbols']
    import coverage
    CHECK = coverage.CHECKLIST
    sp = J('research', 'docs', 'specimens.json')
    cap = J('research', 'docs', 'capture.json')
    facts = J('research', 'docs', 'facts.json')
    props = J('research', 'component-props.json')
    inventory = J('research', 'component-inventory.json')
    flows = J('design-system', 'site', 'flows.json')
    state_label = {f"{f['id']}/{s['id']}": (f['label'], brand(s['label'].split(' — ', 1)[-1])) for f in flows for g in f['groups'] for s in g['states']}
    ds = {c['name']: c for c in cap['components']}
    blocks = {b['id']: b for b in cap['blocks']}
    pg = sp['playground']
    live = {l['id']: l for l in sp['live']}
    dbg = {d['id']: d for d in sp['debug']}

    def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    # ------------------------------------------------------------ sources → examples
    # a description every entry of a playground group carries describes the group, not the component
    group_text = {d for d, n in collections.Counter(e.get('description') for e in pg).items() if d and n > 1}

    def pg_entry(key):
        g, _, n = key.rpartition('/')
        return next(e for e in pg if e['name'] == n and (not g or e['group'] == g))

    # blocks: the window state each was captured in (the docs render that window live, cropped to the block)
    BLOCK_STATE = {'launcher-search-bar': 'launcher/01-root', 'root-search-list': 'launcher/01-root', 'action-bar': 'launcher/01-root',
                   'calculator-card': 'launcher/03-calculator', 'emoji-grid': 'launcher/07-emoji', 'snippet-form': 'launcher/11-create-snippet',
                   'settings-sidebar': 'settings/01-general', 'ai-chat-composer': 'ai-chat/01-new-chat', 'ai-chat-sidebar': 'ai-chat/01-new-chat',
                   'onboarding-navigation': 'onboarding/standard-02-features', 'onboarding-feature-grid': 'onboarding/standard-02-features',
                   'permission-rows': 'onboarding/standard-04-permissions'}
    ctx['BLOCK_STATE'] = BLOCK_STATE
    def view_ctx(window, w, h):
        """Context for a whole view of a window (a base view): the window's size, root and default text."""
        return {'display': 'flex', 'flexDirection': 'column', 'alignItems': 'stretch', 'fontSize': '13px', 'lineHeight': 'normal', 'fontWeight': '400',
                'letterSpacing': 'normal', 'color': 'var(--color-text-primary)', 'zoom': '1', 'cssZoom': 1, 'scale': 1, 'window': window, 'vw': w, 'vh': h, 'pw': w, 'ph': h}

    def examples_for(src):
        """Returns (examples, links, notes) for one source reference."""
        t, _, v = src.partition(':'); key, _, frag = v.partition('#')
        ex, links, notes = [], [], []
        if t == 'ds':
            c = ds[key]
            composed = c.get('section') == 'composed'
            for e in c['examples']:
                if frag and e['title'] != frag: continue
                # live: rendered by the harness in specimen mode (/ds/?specimen=…&row=…); host-rendered feedback has no row
                ex.append({'title': brand(e['title']) if e['title'] not in ('Default', 'default') or len(c['examples']) > 1 else '',
                           'html': localize(one_copy(e['html'])), 'jsx': e.get('jsx') or '',
                           'live': {'ds': key, 'row': e['row']} if 'row' in e else None})
            if c.get('note') and not composed: notes.append(brand(c['note']))
        elif t == 'pg':
            e = pg_entry(key)
            if e.get('description') and e['description'] not in group_text: notes.append(brand(e['description']))
            for si, s in enumerate(e['sections']):
                if frag and s['title'] != frag: continue
                # a state that shows nothing (no text, image or control) has nothing to preview
                if 'renders nothing' in s['title'].lower(): continue
                body = re.sub(r'<h[23][^>]*>.*?</h[23]>|<[^>]*class="[^"]*playground-annotation[^"]*"[^>]*>.*?</div>', '', s['html'], flags=re.S)
                if not re.sub(r'<[^>]+>', '', body).strip() and not re.search(r'<(img|svg|canvas|video|input|textarea)\b', body): continue
                # the section as Bayrust's playground lays it out; live from the playground itself
                ex.append({'title': brand(s['title']) or e['title'], 'html': localize(s['html']), 'jsx': (s.get('jsx') or '').replace('http://localhost:4317/', '/'),
                           'live': {'pg': f"{e['group']}/{e['name']}", 'section': si}})
        elif t == 'in':
            found = sp['instances'].get(key, [])
            for x in ([found[int(frag)]] if frag.isdigit() and int(frag) < len(found) else found[:3]):
                flow, st = state_label.get(x['state'].split('--')[0], (x['state'].split('/')[0], x['state']))
                where = f"{brand(flow)} › {st}" + (' (panel)' if '--' in x['state'] else '')
                ex.append({'title': '', 'html': localize(x['html']), 'width': x['w'], 'height': x['h'], 'ctx': x.get('ctx'), 'sig': x['sig'], 'snapshot': True})
        elif t == 'live':
            l = live[key]
            for e in l['elements']:
                big = e['w'] >= 600
                ex.append({'title': l['title'], 'html': localize(e['html']), 'width': e['w'], 'height': e['h'],
                           'ctx': view_ctx(e.get('window'), e['w'], e['h']) if big else None, 'panel': not big})
            # native child windows (menus, popovers): drawn on the panel surface macOS gives them
            for p in l['panels']: ex.append({'title': l['title'] + (' panel' if l['elements'] else ''), 'html': localize(p['html']), 'panel': True})
        elif t == 'win':
            fl, _, st = key.partition('/')
            ex.append({'title': state_label.get(key, (fl, st))[1], 'html': '', 'win': {'file': f'{key}.json'}})
        elif t == 'dbg':
            d = dbg[key]
            ex.append({'title': d['title'], 'html': localize(d['html']), 'width': 750, 'height': 475, 'ctx': view_ctx('main-window-root', 750, 475)})
        elif t == 'blk':
            b = blocks[key]
            ex.append({'title': brand(b['label']), 'html': localize(b['html']), 'win': {'file': BLOCK_STATE[key] + '.json'}, 'crop': b['selector']})
            links.append((brand(b['label']), 'block-' + key))
        elif t in ('flow', 'tmpl'):
            path = ('flow-' if t == 'flow' else 'templates-') + key
            p = pages.get(path)
            if p:
                for w in p.get('windows', [])[:2]:
                    ex.append({'title': w['caption'], 'html': '', 'win': w['win']})
                links.append((p['title'] + (' flow' if t == 'flow' else ' template'), path))
        elif t == 'page':
            links.append((pages[key]['title'] if key in pages else key, key))
        return ex, links, notes

    def modules_in(html):
        """CSS modules of the outermost elements in a specimen."""
        m = re.findall(r'<[a-z0-9]+[^>]*class="([^"]*)"', html[:4000])
        out = []
        for cls in m[:3]:
            for c in cls.split():
                mm = re.match(r'([a-z][a-z0-9-]*)__[A-Za-z0-9]+_[0-9a-f]{5}$', c)
                if mm and mm.group(1) not in ('text', 'radius', 'icon', 'playground-annotation') and mm.group(1) not in out: out.append(mm.group(1))
        return out

    def api_md(names):
        md = ''
        for n in names:
            p = props.get(n)
            if not p: continue
            rows = []
            for pr in p.get('props', []):
                if pr['name'].startswith('...'): continue
                vals = p.get('values', {}).get(pr['name'])
                rows.append([f"`{pr['name']}`", f"`{pr['default'].strip('`')}`" if pr.get('default') else '—', ', '.join(f'`{x}`' for x in vals) if vals else '—'])
            mod = re.sub(r'-[A-Za-z0-9_-]{8}[.]js$', '', p['module'])
            md += f"### {n}\n\n" + (md_table(['Prop', 'Default', 'Values'], rows) if rows else 'No props.\n') + f"\nShipped in `{mod}`.\n\n"
        return md

    def anatomy_md(names, mods):
        subs = []
        for n in names:
            base = n.split('.')[0]
            subs += [x for x in inventory if x.startswith(base + '.') and x not in subs]
        parts = {}
        for m in mods:
            ps = sorted({k.split('/')[1] for k in sp['instances'] if k.startswith(m + '/')})
            if ps: parts[m] = ps
        md = ''
        if subs: md += 'Sub-components: ' + ', '.join(f'`{s}`' for s in subs[:24]) + '.\n\n'
        if parts: md += md_table(['CSS module', 'Parts'], [[f'`{m}`', ', '.join(f'`{p}`' for p in ps[:16])] for m, ps in parts.items()])
        return md

    def states_md(mods):
        rows = []
        for m in mods:
            for a, vals in facts['moduleAttrs'].get(m, {}).items():
                rows.append([f'`{m}`', f'`{a}`', ', '.join(f'`{v}`' for v in vals if v) or '—'])
        return md_table(['Module', 'Selector', 'Values'], rows) if rows else ''

    def a11y_md(htmls):
        h = ' '.join(htmls)
        roles = collections.Counter(re.findall(r'\brole="([^"]+)"', h))
        arias = collections.Counter(re.findall(r'\b(aria-[a-z]+)="', h))
        tags = collections.Counter(t for t in re.findall(r'<(button|input|textarea|select|a|h[1-6]|ul|ol|li|label|img|kbd)\b', h))
        if not (roles or arias or tags): return ''
        md = ''
        if tags: md += 'Native elements: ' + ', '.join(f'`<{t}>` ×{n}' for t, n in tags.most_common()) + '.\n\n'
        if roles: md += 'Roles: ' + ', '.join(f'`{r}` ×{n}' for r, n in roles.most_common()) + '.\n\n'
        if arias: md += 'ARIA attributes: ' + ', '.join(f'`{a}` ×{n}' for a, n in arias.most_common()) + '.\n\n'
        return md

    def appears_md(mods):
        seen = []
        for m in mods:
            for st in facts['moduleStates'].get(m, []):
                if st.startswith('design-system-assets') or st in seen: continue
                seen.append(st)
        if not seen: return ''
        by = collections.defaultdict(list)
        for st in seen:
            fl, lab = state_label.get(st.split('--')[0], (st.split('/')[0], st))
            by[(fl, st.split('/')[0])].append(lab + (' (panel)' if '--' in st else ''))
        return '\n'.join(f"- **[{brand(fl)}](/flow-{fid})**: " + ', '.join(sorted(set(v))[:12]) + (f' and {len(set(v)) - 12} more' if len(set(v)) > 12 else '') for (fl, fid), v in sorted(by.items())) + '\n'

    # ------------------------------------------------------------ component and pattern pages (families)
    STATUS = {'yes': 'In Bayrust', 'variant': 'Variant', 'composed': 'Composed from Bayrust parts', 'uncaptured': 'In the code, not shown in the sandbox', 'excluded': 'In Bayrust, not published', 'no': 'Not in Bayrust'}
    by_item = {c[0]: c for c in CHECK}
    item_page = {}

    def member(item):
        _, section, status, names, srcs, note = by_item[item]
        examples, links, notes, htmls, mods = [], [], [], [], []
        for s in srcs:
            e, li, no = examples_for(s)
            examples += e; links += li
            for n in no:
                if n not in notes: notes.append(n)
        live_count = sum(1 for e in examples if e.get('live') or e.get('win'))
        if live_count:
            examples = [e for e in examples if not e.get('snapshot')]
        for e in examples:
            if e.get('html'): htmls.append(e['html'])
            for m in modules_in(e.get('html', '')):
                if m not in mods: mods.append(m)
        for s in srcs:
            if s.startswith('in:'):
                m = s[3:].split('/')[0]
                if m not in mods: mods.insert(0, m)
        if status == 'composed':
            mods = []  # a composition has no module of its own
        lead = brand(note) if note else (notes[0] if notes else '')
        if names: lead = (lead + ' ' if lead else '') + 'Bayrust: ' + ', '.join(f'`{n}`' for n in names) + '.'
        if status == 'composed' and not note:
            # the specimen's own note: "Composed from Bayrust parts: Button, IconButton."
            lead = next((brand(c['note']) for c in cap['components'] if c['name'] == item and c.get('note')), 'Composed from Bayrust parts.')
            lead = 'Bayrust doesn’t ship this. ' + lead
        if status == 'no' and not lead: lead = 'Nothing in Bayrust corresponds to this.'
        md = ''
        if status == 'uncaptured': md += f"{brand(note)}\n\n"
        extra = [n for n in notes if n != lead.split(' Bayrust:')[0]]
        if extra: md += '\n'.join(f'- {n}' for n in extra) + '\n\n'
        # reference material, collapsed: the page leads with the components
        spec = ''
        api = api_md(names)
        if api: spec += '#### API reference\n\n' + api.replace('### ', '##### ')
        s_md = states_md(mods)
        if s_md: spec += '#### Variants and states\n\n' + s_md + '\n'
        a_ = anatomy_md(names, mods)
        if a_: spec += '#### Anatomy\n\n' + a_ + '\n'
        acc = a11y_md(htmls)
        if acc: spec += '#### Accessibility\n\n' + acc.replace('\n\n', ' ').strip() + '\n\n'
        app = appears_md(mods)
        if app:
            lines = [l for l in app.split('\n') if l.strip()]
            spec += '#### Appears in\n\n' + '\n'.join(lines[:4]) + (f'\n- and {len(lines) - 4} more flows' if len(lines) > 4 else '') + '\n\n'
        if mods: spec += 'Source: ' + ', '.join(f'`{m}`' for m in mods[:6]) + ' (Bayrust 2.8.2).\n'
        if spec: md += '+++ Specs\n' + spec + '\n+++\n\n'
        if links: md += 'See also: ' + ', '.join(f'[{brand(t)}](/{p})' for t, p in dict.fromkeys(links)) + '.\n'
        return {'id': slug(item), 'title': item, 'status': status, 'statusLabel': STATUS[status], 'lead': lead, 'md': md,
                'examples': [{'title': e['title'], 'html': e.get('html', ''), 'jsx': e.get('jsx', ''), 'live': e.get('live'), 'fill': False, 'image': e.get('image'), 'width': e.get('width'),
                              'height': e.get('height'), 'ctx': e.get('ctx'), 'win': e.get('win'), 'crop': e.get('crop'), 'panel': e.get('panel', False)} for e in examples] or None}

    def family_pages(families, section_label):
        items = []
        for fam, members in sorted(families.items(), key=lambda kv: kv[0].lower()):
            path = slug(fam)
            if path in pages: path = 'c-' + path  # a foundation page of the same name keeps its path
            ms = [member(i) for i in members]
            # a preview already shown higher on the page isn't repeated; the later entry points to it
            shown = {}
            for m in ms:
                keep = []
                for e in m['examples'] or []:
                    sig = e['html'] or json.dumps(e.get('win')) + str(e.get('crop'))
                    if sig in shown and shown[sig] != m['id']:
                        first = next(x for x in ms if x['id'] == shown[sig])
                        note = f"Previewed under [{first['title']}](#{first['id']}).\n"
                        if note not in m['md']: m['md'] = note + m['md']
                        continue
                    shown.setdefault(sig, m['id']); keep.append(e)
                m['examples'] = keep or None
            for m in ms: item_page[m['title']] = f"{path}#{m['id']}"
            kinds = [m['title'] for m in ms]
            lead = (', '.join(kinds[:-1]) + ' and ' + kinds[-1] + '.') if len(ms) > 1 else ms[0]['lead']
            pages[path] = {'title': fam, 'lead': lead, 'md': '', 'kind': 'family', 'members': ms}
            items.append({'title': fam, 'path': path})
        return items

    comp_items = family_pages(coverage.FAMILIES, 'Components')
    pattern_items = family_pages(coverage.PATTERN_FAMILIES, 'Patterns')
    ctx['comp_items'], ctx['pattern_items'], ctx['item_page'] = comp_items, pattern_items, item_page

    # ------------------------------------------------------------ new foundation pages
    F = ctx['fpage']
    fam = collections.Counter(); ex1 = {}
    tj = J('design-system', 'tokens', 'bayrust.tokens.json')
    for g, v in tj.items(): fam[g] = len(v); ex1[g] = next(iter(v))
    F('design-tokens', 'Design tokens', f"{sum(fam.values())} CSS variables, resolved for Bayrust Dark and Bayrust Light.", """## How tokens work

Every value in the interface is a CSS variable. Some are fixed (`--radius-8: 8px`), some are built from others (`--color-text-secondary: var(--fg-60)`), and some scale with Interface Size (`--space-12: round(calc(12 * var(--spx)), 1px)`).

- **Theme base.** Thirteen colours come from the theme and are set at runtime on `.active-theme`. Everything else in colour derives from them.
- **Scale.** `--spx` is `calc(1px * var(--zoom, 1))`; space, icon and font-size tokens multiply it and round to whole pixels.
- **Platform.** `[macos]`, `[macos="26"]`, `[macos="27"]` and `[windows]` on the root swap platform values (window radius, blur, header heights).

## Families

""" + md_table(['Family', 'Tokens', 'Example'], [[g, n, f'`--{ex1[g]}`'] for g, n in fam.items()]) + """
## Files

| File | Contents |
|---|---|
| `design-system/tokens/bayrust.tokens.json` | W3C-style tokens by family, with the source declaration and the Dark and Light values |
| `design-system/tokens/tokens.css` | The resolved values as CSS, one block per theme |
| `design-system/tokens/tokens-raw.json` | Every variable with its declaration, resolved value and declaring selectors |
""")
    size_rows = []
    for mod, sz in facts['sizes'].items():
        for s, d in sz.items(): size_rows.append([f'`{mod}`', f'`{s}`', '; '.join(f'`{x}`' for x in d)])
    F('sizing', 'Sizing', 'Icon sizes, control sizes and window sizes.', """## Icon sizes

""" + md_table(['Token', 'Value'], [[f"`--{t['name']}`", t['value']] for t in tokens['iconSize']['tokens']]) + """
## Control sizes

Each control's `data-size` variants, with the declarations the stylesheets give them.

""" + md_table(['Module', 'Size', 'Declarations'], size_rows) + """
## Windows

See [Layout](/layout) for every window's size.
""")
    F('breakpoints', 'Breakpoints', 'The media and container queries in the shipped stylesheets, and what they style.', """## Viewport queries

Windows have fixed or measured sizes, so most of the UI has no breakpoints. The onboarding (Welcome) window is the exception: its steps change layout at 801 px wide and 600 px tall.

""" + md_table(['Query', 'Rules', 'Modules'], [[f"`{q['query']}`", q['count'], ', '.join(f'`{m}`' for m in q['modules'][:8]) + (' …' if len(q['modules']) > 8 else '')] for q in facts['queries'] if q['query'].startswith('@media')]) + """
## Container queries

""" + md_table(['Query', 'Rules', 'Modules'], [[f"`{q['query']}`", q['count'], ', '.join(f'`{m}`' for m in q['modules'][:8])] for q in facts['queries'] if q['query'].startswith('@container')]) + """
## Feature queries

""" + md_table(['Query', 'Rules'], [[f"`{q['query']}`", q['count']] for q in facts['queries'] if q['query'].startswith('@supports')]))
    isz = facts['interfaceSize']
    F('responsive-design', 'Responsive design', 'How the interface adapts: Interface Size, window modes, full screen and resizable windows.', f"""## Interface Size

Settings › General › Interface Size sets `--zoom` on the root, and every space, icon and font-size token scales with it, rounded to whole pixels.

""" + md_table(['Option', '--zoom'], [[o['label'], o['zoom']] for o in isz['options']]) + f"""
The step is {isz['step']} and the maximum {isz['max']}. AI Chat and Notes have their own content zoom (`ZoomControls`, Reset / − / %).

## Window modes

The launcher opens **Default** (750 × 475, results shown) or **Compact** (the 64 pt search bar alone, expanding as you type). See [Launcher](/templates-launcher).

## Full screen

Windows with traffic lights (Settings, AI Chat, Notes, Theme Studio, Send Feedback) can fill the screen. Their content stretches; tokens stay the same. Each template page shows the full-screen render.

## Content-driven height

Notes sizes its window to the note's height until it's resized by hand ("Enable Window Auto-Sizing" restores it).

## Reduced motion

{facts['reducedMotion']} rules apply under `prefers-reduced-motion: reduce`. See [Breakpoints](/breakpoints) for the queries.
""")
    # Illustrations and Imagery are not published as galleries: they were the only thing pulling every image file
    # galleries were the only thing pulling all 490 image files into the site. Only the images the component and
    # window markup actually references are collected (build_content.localize and the stylesheet URLs).
    # ---- "in use" galleries: every value from the shipped stylesheets, rendered with those stylesheets
    GLOBAL_VARS = set(raw['dark']['tokens'])
    TX = 'text__text_054b5 text__align-left_43d84 '
    MONO = TX + 'text__font-mono_67e13 text__size-11_638bc text__weight-400_36886 text__color-primary_37304'
    META = TX + 'text__font-inter_5a99a text__size-11_638bc text__weight-400_36886 text__color-secondary_76316'
    def attr(v): return v.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
    def local_vars(v):
        """Variables a value reads that only its component defines (no global token, no fallback)."""
        return sorted({m for m, fb in re.findall(r'var\((--[\w-]+)\s*(,)?', v) if m not in GLOBAL_VARS and not fb})
    def swatch(kind, item):
        v = item['value']
        if kind == 'gradient':
            if any('mask' in p for p in item['props']):
                return f'<div style="height:64px;border-radius:var(--radius-8);background:var(--color-text-primary);-webkit-mask-image:{attr(v)};mask-image:{attr(v)}"></div>'
            return f'<div style="height:64px;border-radius:var(--radius-8);background:{attr(v)}"></div>'
        box = 'width:96px;height:48px;border-radius:var(--radius-8);'
        if kind == 'shadow':
            inner = f'<div style="{box}background:var(--color-window-base);box-shadow:{attr(v)}"></div>'
        elif kind == 'border':
            prop = 'outline' if item['props'] == ['outline'] else 'border'
            inner = f'<div style="{box}{prop}:{attr(v)}"></div>'
        else:
            inner = f'<div style="{box}background:var(--color-text-primary);opacity:{attr(v)}"></div>'
        return f'<div style="height:96px;display:flex;align-items:center;justify-content:center">{inner}</div>'
    def gallery(kind, items):
        cards = []
        for it in items:
            missing = local_vars(it['value'])
            if missing:
                # can't be shown outside its component: say which variable it needs instead of guessing a colour
                sw = (f'<div style="height:64px;border-radius:var(--radius-8);box-shadow:inset 0 0 0 var(--half-pixel) var(--color-border-separator);'
                      f'display:flex;align-items:center;justify-content:center;padding:0 var(--space-12);text-align:center" class="{META}">'
                      f'Takes {", ".join(missing)} from its component</div>')
            else:
                sw = f'<div style="border-radius:var(--radius-8);background:var(--color-window-base)">{swatch(kind, it)}</div>'
            where = ', '.join(it['modules'][:4]) + (' …' if len(it['modules']) > 4 else '')
            props = ' · '.join(it['props']) if kind == 'gradient' else ''
            cards.append(f'<div style="display:flex;flex-direction:column;gap:var(--space-8);padding:var(--space-12);border-radius:var(--radius-12);background:var(--color-surface-inner-panel);min-width:0">'
                         f'{sw}<code class="{MONO}" style="overflow-wrap:anywhere;user-select:text">{attr(it["value"])}</code>'
                         f'<span class="{META}">{it["count"]} {"use" if it["count"] == 1 else "uses"}{" · " + props if props else ""} · {where}</span></div>')
        return f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-12);width:100%">{"".join(cards)}</div>'

    F('shadows', 'Shadows', 'Panel shadow tokens and every box shadow in the shipped stylesheets.', '', 'elevation',
      swatches={'title': 'Box shadows in use', 'lead': f"All {len(facts['shadows'])} box shadows in the shipped stylesheets, most used first.", 'html': gallery('shadow', facts['shadows'])})
    F('borders', 'Borders', 'Hairlines, separators and focus rings.', """## Tokens

| Token | Value |
|---|---|
| `--half-pixel` | `1px`; `.5px` at 2× (`@media (resolution>=2x)`) |
| `--focus-ring-width` | `2px` (`1px` on Windows) |
| `--focus-ring` | `var(--focus-ring-width) solid var(--color-border-focus-ring)` |
| `--color-border-separator` | `var(--fg-10)` |
| `--color-border-field` | `var(--fg-20)` |

Many hairlines are drawn as inset box shadows rather than borders, for example `inset 0 0 0 var(--half-pixel) var(--fg-10)`.
""", swatches={'title': 'Borders in use', 'lead': f"All {len(facts['borders'])} border and outline values in the shipped stylesheets, most used first.", 'html': gallery('border', facts['borders'])})
    F('opacity', 'Opacity', 'Alpha steps for every theme colour, and the opacity values used.', """## Alpha steps

Each theme colour has `-0`, `-5`, `-10`, `-20`, `-40`, `-60` and `-80` steps, made with relative colour syntax: `--fg-60: rgb(from var(--fg) r g b / 60%)`. Text, borders and surfaces use them; see [Color](/color).
""", swatches={'title': 'Opacity in use', 'lead': f"All {len(facts['opacity'])} opacity values in the shipped stylesheets, most used first.", 'html': gallery('opacity', facts['opacity'])})
    n_mask = sum(1 for g in facts['gradients'] if any('mask' in p for p in g['props']))
    F('gradients', 'Gradients', 'The window gradient, gradient borders, glows and fades.', """## Window

`.theme-root:before` paints `linear-gradient(to bottom, var(--color-window-bg), var(--color-window-bg-secondary))` over the glass: the theme's background and secondary background at 40%.

## Gradient border

`GradientBorder` draws a conic or linear gradient around its parent (`data-type`, `data-animated`), used by standout buttons and badges. See [Fancy Button](/button#fancy-button).

## Masks and fills

Most gradients in Bayrust are masks, not colours: they fade content out at the edges of lists, scroll areas and previews. Masks are shown here applied to the primary text colour; fills are shown as they are.
""", swatches={'title': 'Gradients in use', 'lead': f"All {len(facts['gradients'])} gradients in the shipped stylesheets, most used first: {n_mask} masks and {len(facts['gradients']) - n_mask} fills.", 'html': gallery('gradient', facts['gradients'])})
    kf = J('design-system', 'site', 'motion.json')['keyframes']
    def kf_module(k): return re.sub(r'-[A-Za-z0-9_-]{8}[.]css$', '', k['file'])
    def kf_name(k): return re.sub(r'^[a-z0-9-]+__|_[0-9a-f]{5}$', '', k['name'])
    by_mod = collections.defaultdict(list)
    for k in kf: by_mod[kf_module(k)].append(kf_name(k))
    F('animation', 'Animation', f'{len(kf)} keyframe animations from the shipped stylesheets.',
      '## Keyframes by module\n\n' + md_table(['Module', 'Animations'], [[f'`{m}`', ', '.join(f'`{n}`' for n in sorted(set(v)))] for m, v in sorted(by_mod.items())])
      + '\n+++ CSS of every animation\n```css\n' + '\n'.join(k['css'] for k in kf) + '\n```\n+++\n')
    tr = motion['cssTransitions']
    fm = motion['framerMotionTransitions']
    F('transitions', 'Transitions', 'CSS transitions and Framer Motion configurations.',
      '## CSS transitions\n\nThe most used.\n\n' + md_table(['Transition', 'Uses'], [[f'`{t}`', n] for t, n in tr[:12]])
      + (f'\n+++ All {len(tr)} transitions\n' + md_table(['Transition', 'Uses'], [[f'`{t}`', n] for t, n in tr[12:]]) + '+++\n' if len(tr) > 12 else '')
      + '\n## Framer Motion\n\n' + md_table(['Transition', 'Uses'], [[f"`{t['transition']}`", t['count']] for t in fm[:8]])
      + (f"\n+++ All {len(fm)} configurations\n" + md_table(['Transition', 'Uses', 'Files'], [[f"`{t['transition']}`", t['count'], ', '.join(re.sub(r'-[A-Za-z0-9_-]{8}[.]js$', '', f) for f in t['files'][:3])] for t in fm]) + '+++\n'))
    F('accessibility', 'Accessibility', 'What the app provides: contrast improvement, focus rings, reduced motion and transparency, and semantic markup.', f"""## Contrast

The contrast-improvement feature adjusts hue tokens for legibility: `--red-contrast`, `--red-on-tint-10`, `--red-on-tint-20` and the same for each hue. With `[contrast-disabled]` on the root they fall back to the plain hue. (Internal command: "Toggle Contrast Improvement".)

## Focus

`--focus-ring: var(--focus-ring-width) solid var(--color-border-focus-ring)`, 2 px on macOS. Controls style `:focus-visible`; see [Interaction states](/states).

## Motion and transparency

{facts['reducedMotion']} rules respond to `prefers-reduced-motion: reduce`. `.theme-root.no-transparency` swaps the translucent backdrop for an opaque one on Windows.

## Keyboard

Every action has a keyboard path: ⌘K opens the Action Panel from any item, and the action bar shows each action's shortcut. See [Keyboard Shortcut](/keyboard-shortcut).

## In the captured states

""" + md_table(['Role', 'Count'], [[f'`{r}`', n] for r, n in facts['aria']['roles']]) + '\n' + md_table(['Attribute', 'Count'], [[f'`{a}`', n] for a, n in facts['aria']['attributes']]))
    th = facts['themes']
    def swatch(c): return f'<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:{c};vertical-align:-2px;box-shadow:inset 0 0 0 1px rgba(128,128,128,.4)"></span> `{c}`'
    F('themes', 'Themes', f'{len(th)} bundled themes, plus custom themes made in Theme Studio.', """## Base colours

Each theme sets the thirteen base colours; everything else derives from them. The accent can be overridden by the macOS accent colour.

""" + md_table(['Theme', 'Appearance', 'Background', 'Secondary', 'Foreground', 'Accent', 'Selection', 'Loader'], [[brand(t['name']), t['appearance'], t.get('background', ''), t.get('backgroundSecondary', ''), t.get('foreground', ''), t.get('accent', ''), t.get('selection', ''), t.get('loader', '')] for t in th]) + """
## Hues

""" + md_table(['Theme', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Magenta'], [[brand(t['name'])] + [t.get(h, '') for h in ('red', 'orange', 'yellow', 'green', 'blue', 'purple', 'magenta')] for t in th]) + """
## Theme Studio

Themes are edited in Theme Studio: name, appearance, background (solid or gradient), the primary colours (text, selection, loader) and the seven support colours, each with the colour picker. See [Color Picker](/color-picker-slider#color-picker) and the [Theme Studio flow](/flow-theme-studio).
""", 'themes', themes=th)
    F('dark-mode', 'Dark mode', 'Light and dark appearance, following the system or set per appearance.', """## How it works

The root gets `dark` or `light` and the window's `.theme-root` takes `color-scheme: dark` or `light`. `--color-window-base` is `#262626` in dark and `#fff` in light; `--color-fg-max` and `--color-bg-max` swap.

## Settings

Settings › General: **Follow System Appearance**, and a **Dark Theme** and a **Light Theme** used for each appearance (Bayrust Dark and Bayrust Light by default).

## In these docs

Every live specimen follows the docs theme switch: try any component page in both. Colour tokens list both values on [Color](/color).
""")
    st = facts['states']
    st_md = ''
    for name, d in st.items():
        st_md += f"## {name}\n\n{d['rules']} rules.\n\n" + md_table(['Module', 'Rules', 'Example selector'], [[f"`{m['module']}`", m['rules'], f"`{m['example'][0][:110]}`"] for m in d['modules'][:12]]) + '\n'
    F('states', 'Interaction states', 'Hover, focus, active, selected, disabled, open, checked, error and read-only, as the stylesheets define them.', """## How states are expressed

Components set state as attributes, and the stylesheets style the attributes: `data-state="hover|pressed|focus|open"` on buttons, `data-selected` on list items, `data-variant="error"` on fields, plus native `:hover`, `:focus-visible`, `:active` and `:disabled`. Notes shows a read-only banner (`NotesReadOnlyBanner`) when a note can't be edited.

""" + st_md)

    # ------------------------------------------------------------ coverage
    rows = []
    for item, section, status, names, srcs, note in CHECK:
        p = item_page.get(item) or next((s[5:] for s in srcs if s.startswith('page:')), None)
        link = f'[{item}](/{p})' if p else item
        rows.append((section, [link, STATUS[status], ', '.join(f'`{n}`' for n in names) or '—', brand(note) or '']))
    cnt = collections.Counter(c[2] for c in CHECK)
    md = f"""## Summary

| Status | Items |
|---|---|
| In Bayrust | {cnt['yes']} |
| Variant of another component | {cnt['variant']} |
| Composed from Bayrust parts | {cnt['composed']} |
| In the code, not shown in the sandbox | {cnt['uncaptured']} |
| In Bayrust, not published | {cnt['excluded']} |
| Not in Bayrust | {cnt['no']} |

Composed components aren't shipped by the app: they are built only from Bayrust's own primitives, text styles and
tokens, and each one is labelled.

"""
    for sec in ('Getting started', 'Foundations', 'Components', 'Patterns', 'Documentation'):
        md += f'## {sec}\n\n' + md_table(['Item', 'Status', 'Bayrust', 'Note'], [r for s, r in rows if s == sec]) + '\n'
    pages['coverage'] = {'title': 'Coverage', 'lead': f'Every item of the design-system checklist ({len(CHECK)}), and what Bayrust has for it.', 'md': md}
    pages['changelog'] = {'title': 'Changelog', 'lead': 'What these docs were built from, and when.', 'md': """## 2026-10-22

- The Illustrations and Imagery galleries are gone, and the site
  carries only the images the component and window markup references. Both checklist items now read
  "In Bayrust, not published".
- The two shipped `.mp4` files are left out of the site and the package.
- `@krackedui/bayrust` is public on npm, and its runtime carries code, styles, fonts and SVG only.

## 2026-10-21 (later)

- Components are grouped into 32 families (Button holds every kind of button, Input every kind of input…), with each checklist item a section.
- Every preview is live: components, Bayrust's playground sections, live views and dialogs, and whole windows (flows, templates, blocks) rendered from their own markup. No screenshots remain.
- Previews follow Bayrust's playground: components straight on the canvas at their real size, with Variant/source annotations.
- The sandbox runs as a Pro trial account (the app's own auth-override shape), so Pro screens are documented: Account, AI sub-pages, Cloud Sync, automations.
- Components Bayrust doesn't ship are composed from its own primitives and tokens, and labelled.
- New live captures: Start Focus Session (duration picker, block list), Search AI Commands (master-detail layout), legacy password form, crash view, Dictation activity graph.

## 2026-10-21

- Components follow the design-system checklist, one page each, A–Z, with [Coverage](/coverage) for every item.
- New specimen sources: Bayrust's own component playground (68 components), internal test views, live dialogs and the colour picker, and component instances from all 94 captured states.
- New foundation pages: design tokens, sizing, breakpoints, responsive design, illustrations, imagery, shadows, borders, opacity, gradients, animation, transitions, accessibility, themes, dark mode and interaction states.
- Full-screen renders at the whole display (1710 × 1107).
- The docs take the look of Bayrust's own playground.

## 2026-10-20

- App renamed Bayrust (display layer), all 94 flow states re-rendered natively.
- Docs site built on the Open Figment docs app: foundations, components, blocks, templates and flows.
- Token extraction fixed for non-colour tokens (shadows, focus ring).

## Source

Everything is extracted from the shipped macOS app at version 2.8.2, nothing is drawn or estimated. Module names on each page carry the shipped file's hash, which identifies the exact build.
"""
}
