// Specimen tools, injected into every harness page.
//  window.__toJSX(node)   the JSX a component was written with, read from React (element types' displayNames and
//                         props), for the docs' Code tab. Playground scaffolding (annotations, example frames) and
//                         bare layout wrappers are unwrapped, so what's left is the component usage itself.
//  ?specimen-playground=<group>/<entry>&section=<n>
//                         Bayrust's playground (AI Chat › /playground) showing one section alone, live and
//                         interactive, on a transparent page; its size is posted to the embedding docs page.
(() => {
  const q = new URLSearchParams(location.search);

  // ------------------------------------------------------------------ JSX from React elements
  const nameOf = (type) => {
    if (typeof type === 'string') return type;
    if (!type) return null;
    return type.displayName || type.name || type.render?.displayName || type.render?.name || type.type?.displayName || type.type?.name || null;
  };
  const SCAFFOLD = /^(Playground|Boundary|Controlled|Fragment$|Suspense$)|Examples?$/;
  const isScaffold = (el) => {
    const n = nameOf(el.type);
    if (typeof el.type === 'string') {
      const cls = String(el.props?.className ?? '');
      const own = Object.keys(el.props ?? {}).filter((k) => !['children', 'className', 'key'].includes(k));
      // layout wrappers of examples and docs (their class is a -examples__ part or a ds- helper)
      return /-examples__|playground-|^ds-|\bds-/.test(cls) || (!cls && !own.length && el.type === 'div');
    }
    return !n || SCAFFOLD.test(n) || n.length <= 2; // minified internal helpers
  };
  // Bayrust's named text styles, from the text module's classes (the app writes className={text('small-text', …)})
  const STYLE = { '24/600': 'heading1', '18/600': 'heading2', '18/400': 'extra-large-text', '18/500': 'extra-large-text-strong', '16/400': 'large-text', '16/500': 'large-text-strong',
    '13/400': 'text', '13/500': 'text-strong', '11/400': 'small-text', '11/500': 'small-text-strong', '8/400': 'mini-text', '8/500': 'mini-text-strong', 'mono13/400': 'mono-text', 'mono13/600': 'mono-text-strong', 'mono11/400': 'small-mono-text' };
  const className = (cls) => {
    const parts = String(cls).split(/\s+/).filter(Boolean);
    const t = {};
    const rest = [];
    for (const c of parts) {
      const m = /^text__(font|size|weight|color|align)-([a-z0-9-]+)_[0-9a-f]{5}$/.exec(c);
      if (m) t[m[1]] = m[2];
      else if (/^text__text_[0-9a-f]{5}$/.test(c)) continue;
      else rest.push(c.replace(/^radius__(radius-[a-z0-9]+)_[0-9a-f]{5}$/, '$1').replace(/_[0-9a-f]{5}$/, ''));
    }
    const name = t.size && STYLE[(t.font === 'mono' ? 'mono' : '') + t.size + '/' + (t.weight ?? '400')];
    const opts = [t.color && t.color !== 'primary' && t.color !== 'inherit' ? `color: '${t.color}'` : '', t.align && t.align !== 'left' ? `align: '${t.align}'` : ''].filter(Boolean);
    const call = name ? `text('${name}'${opts.length ? `, { ${opts.join(', ')} }` : ''})` : '';
    if (call && rest.length) return `{clsx(${call}, ${rest.map((r) => `'${r}'`).join(', ')})}`;
    if (call) return `{${call}}`;
    return JSON.stringify(rest.join(' '));
  };
  const SHORTCUT_KEYS = { enter: 'enter', return: 'enter', escape: 'escape', tab: 'tab', space: 'space', backspace: 'backspace', delete: 'delete' };
  const literal = (v, depth = 0) => {
    if (v === null || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
    if (typeof v === 'function') return '() => {}';
    if (Array.isArray(v)) return `[${v.map((x) => literal(x, depth + 1)).join(', ')}]`;
    if (typeof v === 'object') {
      if (v.$$typeof) return jsx(v, 0).trim();
      // a key combination, written the way the app writes it: keys.enter, cmd.k
      if ('keyEquivalentName' in v && Array.isArray(v.modifiers)) {
        const k = v.keyEquivalentName;
        if (!v.modifiers.length) return `keys.${SHORTCUT_KEYS[k] ?? k}`;
        if (v.modifiers.length === 1 && v.modifiers[0] === 'meta') return `cmd.${k}`;
      }
      // a shortcut per platform: the same key everywhere, or ⌘ on macOS and Ctrl on Windows
      if (v.mac && v.win && 'keyEquivalentName' in v.mac) {
        const same = JSON.stringify(v.mac) === JSON.stringify(v.win);
        if (same) return `anyPlatform(${literal(v.mac)})`;
        if (v.mac.keyEquivalentName === v.win.keyEquivalentName && v.mac.modifiers.join() === 'meta' && v.win.modifiers.join() === 'control') return `mod.${v.mac.keyEquivalentName}`;
      }
      const e = Object.entries(v).filter(([, x]) => x !== undefined);
      return `{ ${e.map(([k, x]) => `${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${literal(x, depth + 1)}`).join(', ')} }`;
    }
    return String(v);
  };
  const fmt = (v, key) => {
    if (key === 'className' && typeof v === 'string') return className(v);
    if (typeof v === 'string') return JSON.stringify(v);
    return `{${literal(v)}}`;
  };
  // React children as a flat list, adjacent text joined the way it reads ({'Hide'} {'overlay'} → Hide overlay)
  const children = (c) => (Array.isArray(c) ? c.flat(Infinity) : c == null ? [] : [c])
    .filter((x) => x !== null && x !== undefined && x !== false && x !== true && x !== '')
    .reduce((out, x) => {
      const text = typeof x === 'string' || typeof x === 'number';
      if (text && typeof out.at(-1) === 'string') out[out.length - 1] += String(x);
      else out.push(text ? String(x) : x);
      return out;
    }, []);
  function jsx(el, depth) {
    const pad = '  '.repeat(depth);
    if (typeof el === 'string' || typeof el === 'number') return pad + String(el).trim() + '\n';
    if (!el || typeof el !== 'object' || !el.$$typeof) return '';
    if (typeof el.type === 'string' && /\bds-cell\b/.test(String(el.props?.className ?? ''))) return children(el.props?.children).slice(1).map((c) => jsx(c, depth)).join('');
    if (isScaffold(el)) return children(el.props?.children).map((c) => jsx(c, depth)).join('');
    const n = nameOf(el.type);
    const attrs = Object.entries(el.props ?? {})
      .filter(([k, v]) => k !== 'children' && v !== undefined && !(k === 'className' && typeof el.type !== 'string'))
      .map(([k, v]) => (v === true ? k : `${k}=${fmt(v, k)}`));
    const kids = children(el.props?.children);
    const open = attrs.join(' ').length > 70 ? `<${n}\n${attrs.map((a) => pad + '  ' + a).join('\n')}\n${pad}` : `<${n}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
    if (!kids.length) return `${pad}${open}${open.endsWith('\n' + pad) ? '' : ' '}/>\n`;
    if (kids.length === 1 && (typeof kids[0] === 'string' || typeof kids[0] === 'number')) return `${pad}${open}>${String(kids[0]).trim()}</${n}>\n`;
    return `${pad}${open}>\n${kids.map((c) => jsx(c, depth + 1)).join('')}${pad}</${n}>\n`;
  }
  // From a DOM node: the elements React rendered into it (the props.children of its host fiber).
  window.__toJSX = (node, { skip, skipTags = ['h2', 'h3'] } = {}) => {
    const key = Object.keys(node).find((k) => k.startsWith('__reactProps$'));
    const props = key ? node[key] : null;
    const kids = children(props?.children).filter((c) => !(skip && c?.props?.className && String(c.props.className).includes(skip)) && !skipTags.includes(c?.type));
    return kids.map((c) => jsx(c, 0)).join('').replace(/\n{2,}/g, '\n').trim();
  };

  // ------------------------------------------------------------------ playground specimen mode
  const spec = q.get('specimen-playground');
  if (!spec) return;
  const [group, entry] = spec.includes('/') ? spec.split('/') : [null, spec];
  const index = Number(q.get('section') ?? 0);
  document.documentElement.classList.add('no-background');
  const style = document.createElement('style');
  style.textContent = 'html,body{background:transparent!important;overflow:hidden!important} .theme-root:before{display:none!important}';
  document.head.append(style);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const routerNavigate = (to) => {
    const el = document.querySelector('[id$="-window-root"]');
    if (!el) return false;
    const k = Object.keys(el).find((x) => x.startsWith('__reactContainer'));
    const stack = [el[k]?.stateNode?.current ?? el[k]];
    const seen = new Set();
    while (stack.length) {
      const f = stack.pop();
      if (!f || seen.has(f)) continue;
      seen.add(f);
      if (f.memoizedProps?.router?.navigate) return f.memoizedProps.router.navigate({ to }), true;
      if (f.child) stack.push(f.child);
      if (f.sibling) stack.push(f.sibling);
    }
    return false;
  };
  (async () => {
    for (let i = 0; i < 60 && !routerNavigate('/playground'); i++) await wait(200);
    let button = null;
    for (let i = 0; i < 60 && !button; i++) {
      await wait(200);
      const groups = [...document.querySelectorAll('[class*="ai-chat-playground__entryGroup"]')];
      for (const g of groups) {
        if (group && !g.querySelector('[class*="groupHeader"]')?.textContent.startsWith(group)) continue;
        button = [...g.querySelectorAll('[class*="ai-chat-playground__entryButton"]')].find((b) => b.textContent.trim() === entry) ?? button;
      }
    }
    button?.click();
    await wait(800);
    const stage = document.querySelector('[class*="ai-chat-playground__stage"]');
    const root = stage?.firstElementChild ?? stage;
    const sections = root ? [...root.querySelectorAll(':scope > section')] : [];
    const target = sections[index] ?? root;
    if (!target) return;
    // keep the section where React rendered it; hide everything around it and take the padding away
    for (let el = target; el && el !== document.body; el = el.parentElement) {
      for (const sib of el.parentElement?.children ?? []) if (sib !== el && sib.tagName !== 'SCRIPT') sib.style.setProperty('display', 'none', 'important');
      if (el !== target) Object.assign(el.style, { padding: '0', margin: '0', background: 'transparent', overflow: 'visible', height: 'auto', minHeight: '0', maxWidth: 'none', gap: '0' });
    }
    // the section's heading and playground notes are the docs example's title already
    target.querySelectorAll(':scope > h2, :scope > h3, [class*="playground-annotation__root"]').forEach((h) => h.style.setProperty('display', 'none', 'important'));
    Object.assign(target.style, { paddingBottom: '0', flex: 'none' });
    // full-height layouts (sidebars, shells) take the viewer's height in the app; without one they collapse
    const box = target.getBoundingClientRect();
    if (box.height < 60 && [...target.querySelectorAll('*')].some((el) => el.getBoundingClientRect().bottom > box.bottom + 8)) target.style.height = '420px';
    const app = target.getBoundingClientRect();
    const leaves = [...target.querySelectorAll('*')].filter((el) => !el.children.length && el.textContent.trim());
    const leafHeights = leaves.map((el) => el.getBoundingClientRect().height);
    Object.assign(target.style, { paddingBottom: '0', width: 'max-content', maxWidth: '100vw' });
    // content that fills its container (overlays, sidebars, bars) has no width of its own: when its text wraps
    // or it collapses at max-content: give it the width it had in the app
    const fit = target.getBoundingClientRect();
    const wraps = leaves.some((el, i) => el.getBoundingClientRect().height > leafHeights[i] + 4);
    if (wraps || fit.width < 40 || fit.height < 4) target.style.width = `${Math.min(Math.max(app.width, 320), 720)}px`;
    const post = () => {
      const r = target.getBoundingClientRect();
      parent.postMessage({ type: 'bayrust-specimen', id: q.get('id'), w: Math.ceil(r.width), h: Math.ceil(r.height) }, '*');
    };
    new ResizeObserver(post).observe(target);
    post();
  })();
})();
