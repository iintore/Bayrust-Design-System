// Display-layer rename: the app is shown as "Bayrust". Rewrites only what a person reads — text nodes and
// user-facing attributes — so code, IPC method names (raycast.*), URL schemes and CSS classes are untouched.
// Disable with ?brand=original.
(() => {
  if (new URLSearchParams(location.search).get('brand') === 'original') return;
  const swap = (s) => s.replace(/Raycast/g, 'Bayrust').replace(/RAYCAST/g, 'BAYRUST');
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description', 'data-tooltip'];
  const fixText = (n) => { if (n.nodeValue && /Raycast|RAYCAST/.test(n.nodeValue)) n.nodeValue = swap(n.nodeValue); };
  const TEXT_INPUT = (el) => (el.tagName === 'INPUT' && /^(text|search|)$/.test(el.getAttribute('type') ?? '')) || el.tagName === 'TEXTAREA';
  const fixEl = (el) => {
    for (const a of ATTRS) { const v = el.getAttribute?.(a); if (v && /Raycast|RAYCAST/.test(v)) el.setAttribute(a, swap(v)); }
    // the value a text field shows (React mirrors it into the attribute)
    const v = el.getAttribute?.('value');
    if (v && /Raycast|RAYCAST/.test(v) && TEXT_INPUT(el)) el.setAttribute('value', swap(v));
  };
  const walk = (root) => {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) fixEl(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) n.nodeType === 3 ? fixText(n) : fixEl(n);
  };
  const watch = (doc) => {
    const obs = new MutationObserver((ms) => { for (const m of ms) {
      if (m.type === 'characterData') fixText(m.target);
      else if (m.type === 'attributes') fixEl(m.target);
      else m.addedNodes.forEach(walk);
    } });
    const start = () => { walk(doc.documentElement); obs.observe(doc.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS, 'value'] }); };
    doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', start) : start();
  };
  watch(document);
  const t = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
  Object.defineProperty(document, 'title', { get() { return t.get.call(this); }, set(v) { t.set.call(this, swap(String(v))); } });
  // Values the app puts into fields (a duplicated theme's name, a prefilled title) are text a person reads too.
  // Only values set by the app are rewritten; what someone types goes through untouched.
  for (const C of [HTMLInputElement, HTMLTextAreaElement]) {
    const d = Object.getOwnPropertyDescriptor(C.prototype, 'value');
    Object.defineProperty(C.prototype, 'value', { ...d, set(v) { d.set.call(this, typeof v === 'string' && /Raycast|RAYCAST/.test(v) ? swap(v) : v); } });
  }
  // Native child windows (action panel, menus) are documents rendered from this window.
  const open = window.open;
  window.open = function (...a) { const w = open.apply(this, a); try { w && watch(w.document); } catch {} return w; };
  window.__brand = { swap };
})();
