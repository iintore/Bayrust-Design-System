// Class names of the Bayrust 2.8.2 components the docs chrome renders itself, exactly as the app's markup has them.
// Their rules ship in public/ds/native.css (extracted from the bundle by scripts/build_content.py) and apply inside
// a `.doc-native` root, which carries the app root's classes and attributes.

const text = (size: 8 | 11, weight: 400 | 500, color: 'primary' | 'secondary' | 'tertiary') =>
  [
    'text__text_054b5',
    'text__font-inter_5a99a',
    { 8: 'text__size-8_75ba1', 11: 'text__size-11_638bc' }[size],
    { 400: 'text__weight-400_36886', 500: 'text__weight-500_9bfa4' }[weight],
    { primary: 'text__color-primary_37304', secondary: 'text__color-secondary_76316', tertiary: 'text__color-tertiary_8f805' }[color],
    'text__align-left_43d84',
  ].join(' ');

/** The component index sidebar of Bayrust's playground (AI Chat › /playground). */
export const indexSidebar = {
  group: 'ai-chat-playground__entryGroup_63e47',
  header: 'ai-chat-playground__groupHeader_eadad',
  title: text(11, 500, 'secondary'),
  count: 'ai-chat-playground__groupCount_fdb7d ' + text(8, 500, 'tertiary'),
  entries: 'ai-chat-playground__groupEntries_8532c',
  entry: 'ai-chat-playground__entryButton_e1cf0 radius__radius-8_b77d9 ' + text(11, 400, 'primary'),
};

/** Attributes of the element that stands in for the app's root, in the given theme. */
export const nativeRoot = (theme: 'light' | 'dark') => ({
  className: 'doc-native theme-root active-theme scaled-tokens',
  macos: '27',
  [theme]: '',
  style: { '--zoom': 1 } as React.CSSProperties,
});
