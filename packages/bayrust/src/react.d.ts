import type { CSSProperties, ElementType, ReactElement, ReactNode, SVGProps } from 'react';
export declare function ThemeRoot(props: {
  theme?: 'dark' | 'light';
  platform?: 'macos' | 'windows';
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [attr: string]: unknown;
}): ReactElement;
export declare function Icon(props: { name: string; size?: number } & SVGProps<SVGSVGElement>): ReactElement;
export declare function Bayrust(props: { component: string; props?: Record<string, unknown>; base?: string; className?: string; style?: CSSProperties }): ReactElement;
