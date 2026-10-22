// Waits for Bayrust's own window bootstrap (settings-window entry) to finish before loading the site,
// so shared modules (i18n, stores, theme) are initialized by Bayrust first.
const ready = () => document.documentElement.classList.contains('transitions-ready');
await new Promise((resolve) => {
  if (ready()) return resolve();
  const o = new MutationObserver(() => {
    if (ready()) {
      o.disconnect();
      resolve();
    }
  });
  o.observe(document.documentElement, { attributes: true });
});
await import('./app.js');
