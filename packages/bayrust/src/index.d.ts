export interface Token {
  /** The token's group, e.g. `space`, `color.text`. */
  group: string;
  value: string;
  /** Resolved in Bayrust Dark. */
  dark: string;
  /** Resolved in Bayrust Light. */
  light: string;
}
/** Every design token, keyed by its CSS variable (`--space-8`, `--color-text-primary`…). */
export declare const tokens: Record<`--${string}`, Token>;
/** CSS-module classes of the shipped styles: `classes['action-button'].button` → `action-button__button_d53a6`. */
export declare const classes: Record<string, Record<string, string>>;
/** The 730 icon names of the shipped sprite. */
export declare const iconNames: string[];
export declare const rootClassName: string;
export declare function rootAttributes(theme?: 'dark' | 'light', options?: { platform?: 'macos' | 'windows' }): Record<string, string>;
export declare function token(cssVar: `--${string}`): string;
export declare function setAssetsBase(url: string): void;
export declare function assetsBase(): string;
