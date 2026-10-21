// Stub of the WKWebView host bridge. Records every IPC method the shipped UI requests.
(() => {
  const pending = [];
  const flush = () => { if (!pending.length) return; const b = JSON.stringify(pending.splice(0)); fetch('/__ipc-log', { method: 'POST', body: b }); };
  setInterval(flush, 500);
  window.__ipcCalls = [];
  window.__ipcMocks = window.__ipcMocks || {};
  const other = (name) => ({ postMessage: (msg) => { const e = { page: location.pathname, handler: name, msg }; window.__ipcCalls.push(e); if (name !== 'logger') pending.push(e); return Promise.resolve(JSON.stringify(window.__ipcMocks['@' + name] ?? null)); } });
  const ipcRequest = { postMessage: async (msg) => {
    let data; try { data = msg.data ? JSON.parse(msg.data) : undefined; } catch { data = msg.data; }
    const entry = { page: location.pathname, method: msg.method, destination: msg.destination, data };
    window.__ipcCalls.push(entry); pending.push(entry);
    const mock = window.__ipcMocks[msg.method];
    if (mock === undefined && msg.destination === 'host') {
      const res = await fetch('/__host', { method: 'POST', body: JSON.stringify({ method: msg.method, data }) });
      if (!res.ok) throw new Error(await res.text());
      return await res.text();
    }
    if (mock === undefined && msg.destination === 'backend') {
      // Forward to the sandboxed shipped backend (harness/backend.mjs).
      const res = await fetch('/__backend', { method: 'POST', body: JSON.stringify({ method: msg.method, data }) });
      if (!res.ok) throw new Error(await res.text());
      return await res.text();
    }
    const value = typeof mock === 'function' ? await mock(data) : mock;
    return JSON.stringify(value === undefined ? null : value);
  } };
  // ipc:// resources (host-served images) → harness endpoints.
  const rewrite = (u) => typeof u === 'string' && u.startsWith('ipc://') ? '/__ipc/' + u.slice(6) : u;
  const patchWindow = (w) => {
    const f = w.fetch; w.fetch = (u, o) => f.call(w, rewrite(u), o);
    const setAttr = w.Element.prototype.setAttribute;
    w.Element.prototype.setAttribute = function (n, v) { return setAttr.call(this, n, (n === 'src' || n === 'href') ? rewrite(v) : v); };
    const srcDesc = Object.getOwnPropertyDescriptor(w.HTMLImageElement.prototype, 'src');
    Object.defineProperty(w.HTMLImageElement.prototype, 'src', { ...srcDesc, set(v) { srcDesc.set.call(this, rewrite(v)); } });
  };
  patchWindow(window);
  // Native child windows (action panel, menus) are window.open() documents rendered into from this window.
  const open = window.open;
  window.open = function (...a) { const w = open.apply(this, a); try { w && patchWindow(w); } catch {} return w; };
  // Backend notifications → the UI's notification entry point.
  const events = new EventSource('/__backend-events');
  events.onmessage = (e) => { const { method, data } = JSON.parse(e.data); window.ipcNotification?.(method, JSON.stringify(data)); };
  window.webkit = { messageHandlers: new Proxy({ ipcRequest }, { get: (t, k) => t[k] ?? (t[k] = other(String(k))) }) };
})();
