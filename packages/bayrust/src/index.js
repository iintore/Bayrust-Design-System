// @krackedui/bayrust: Bayrust 2.8.2's design system. Tokens, the CSS-module class names of the shipped styles, icon
// names, and the attributes of the element the styles and tokens apply under.
export { tokens } from './data/tokens.js';
export { classes } from './data/classes.js';
export { iconNames } from './data/icons.js';
export { setAssetsBase, assetsBase } from './config.js';

/**
 * Class names of the element that stands in for the app's root: the shipped tokens and themes apply under it.
 * `no-background` is Bayrust's own class for a root without the window's backdrop (an absolutely positioned layer
 * that would cover the page around it).
 */
export const rootClassName = 'theme-root active-theme scaled-tokens no-background';

/**
 * Attributes for that root element, as plain HTML attributes. `theme` picks Bayrust Dark or Bayrust Light; `platform`
 * the macOS 27 styles (the default) or Windows.
 */
export function rootAttributes(theme = 'dark', { platform = 'macos' } = {}) {
  return { class: rootClassName, [theme]: '', ...(platform === 'macos' ? { macos: '27' } : { windows: '' }), style: '--zoom: 1' };
}

/** A token's value: the CSS variable reference, for use in styles (`token('--space-8')` → `var(--space-8)`). */
export const token = (cssVar) => `var(${cssVar})`;
