// macOS "ABC" keyboard layout (this Mac's selected input source), as virtual key codes from
// Carbon HIToolbox/Events.h (kVK_*). Applied to the UI's KeyboardLayoutStore.
(() => {
  const codes = {
    a: 0, s: 1, d: 2, f: 3, h: 4, g: 5, z: 6, x: 7, c: 8, v: 9, b: 11, q: 12, w: 13, e: 14, r: 15, y: 16, t: 17,
    1: 18, 2: 19, 3: 20, 4: 21, 6: 22, 5: 23, '=': 24, 9: 25, 7: 26, '-': 27, 8: 28, 0: 29, ']': 30, o: 31, u: 32,
    '[': 33, i: 34, p: 35, l: 37, j: 38, "'": 39, k: 40, ';': 41, '\\': 42, ',': 43, '/': 44, n: 45, m: 46, '.': 47,
    ' ': 49, '`': 50,
    Enter: 36, Tab: 48, Backspace: 51, Escape: 53, CapsLock: 57, Delete: 117, Home: 115, End: 119, PageUp: 116,
    PageDown: 121, ArrowLeft: 123, ArrowRight: 124, ArrowDown: 125, ArrowUp: 126, NumpadEnter: 76,
    F1: 122, F2: 120, F3: 99, F4: 118, F5: 96, F6: 97, F7: 98, F8: 100, F9: 101, F10: 109, F11: 103, F12: 111,
  };
  const scanCodeToEquivalent = {}, equivalentToScanCodes = {};
  for (const [eq, code] of Object.entries(codes)) { scanCodeToEquivalent[code] = eq; (equivalentToScanCodes[eq] ??= []).push(code); }
  const layout = { id: 'com.apple.keylayout.ABC', name: 'ABC', scanCodeToEquivalent, equivalentToScanCodes };
  window.__abcLayout = layout;
  // Same effect as the host's `updateKeyboardLayoutSelection` request: update the UI's KeyboardLayoutStore.
  const services = [...document.querySelectorAll('link[rel=modulepreload]')].map(l => l.getAttribute('href')).find(h => /\/services-[\w-]+\.js$/.test(h));
  // Bootstrap resets the store, so reapply until the selection holds (as the host does on window load).
  if (services) import(new URL(services, location.href).href).then(m => {
    const svc = Object.values(m).find(v => v && 'keyboardLayoutStore' in v);
    const started = Date.now();
    const timer = setInterval(() => {
      const store = svc.keyboardLayoutStore; // bootstrap swaps in a new store instance
      if (!store) return;
      if (store.peek().selectedLayout?.id !== layout.id) store.actions.updateSelection({ selectedLayout: layout, asciiCapableLayout: layout });
      if (Date.now() - started > 8000) clearInterval(timer);
    }, 100);
  });
})();
