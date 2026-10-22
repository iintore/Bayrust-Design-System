// Templates: the shipped window shells at their native sizes, live from the harness (Bayrust's own code).
import { h } from './runtime.js';
import { Section } from './foundations.js';

export const WINDOWS = [
  {
    id: 'main',
    title: 'Main window (launcher)',
    url: '/main-window.html',
    w: 750,
    h: 475,
    note: 'Measured 750 × 475 (CGWindowList) = --main-window-width × --main-window-expanded-height.',
  },
  { id: 'welcome', title: 'Welcome window (onboarding)', url: '/welcome-window.html?step=features', w: 1280, h: 760, note: 'Measured 1280 × 760.' },
  { id: 'settings', title: 'Settings window', url: '/settings-window.html', w: 800, h: 786, note: 'Measured 800 × 786 on this Mac (CGWindowList).' },
  {
    id: 'ai-chat',
    title: 'AI Chat window',
    url: '/ai-chat-window.html',
    w: 750,
    h: 600,
    note: 'Saved frame on this Mac: 750 × 600 (NSWindow Frame ai-chat-window).',
  },
  {
    id: 'notes',
    title: 'Notes window',
    url: '/notes-window.html',
    w: 396,
    h: 830,
    note: 'Measured width 396; height follows content via raycast.resizeWindow (830 for the welcome note).',
  },
  { id: 'theme-studio', title: 'Theme Studio window', url: '/theme-studio-window.html', w: 1370, h: 570, note: 'Measured 1370 × 570 on this Mac.' },
  {
    id: 'pro-walkthrough',
    title: 'Pro walkthrough window',
    url: '/pro-walkthrough-window.html',
    w: 1280,
    h: 760,
    note: 'Set by the shipped code: 1280 × 760, or 1280 × 712 on feature pages.',
  },
  { id: 'feedback', title: 'Feedback window', url: '/feedback-window.html', w: 420, h: 714, note: 'Measured 420 × 714 on this Mac.' },
];

function Frame({ win, scale = 0.6, src }) {
  return h(
    'div',
    { className: 'ds-frame', style: { width: win.w * scale, height: win.h * scale } },
    h('iframe', { src: src || win.url, width: win.w, height: win.h, style: { transform: `scale(${scale})` }, loading: 'lazy', title: win.title }),
  );
}
export { Frame };

function Templates({ t }) {
  return h(
    'div',
    null,
    WINDOWS.map((w) =>
      h(
        Section,
        {
          key: w.id,
          t,
          title: `${w.title} · ${w.w} × ${w.h}${w.provisional ? ' (provisional)' : ''}`,
          note: w.note || 'Native size pending a measurement of the real window on this Mac.',
        },
        h(Frame, { win: w }),
        h('a', { className: t('small-text', { color: 'link' }), href: w.url, target: '_blank' }, 'Open live window ↗'),
      ),
    ),
  );
}
export const templates = [{ id: 'templates', label: 'Window Templates', level: 'Templates', render: Templates }];
