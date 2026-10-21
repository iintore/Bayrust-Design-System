export interface BayrustRuntime {
  /** The React instance the shipped components were built with (not your app's). */
  React: any;
  ReactDOM: { createRoot(container: Element): { render(element: unknown): void; unmount(): void } };
  /** Creates an element with the shipped JSX runtime: `h(Button, { text: 'Run' })`. */
  h(type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]): unknown;
  /** A shipped component by name, e.g. `await get('Button')`. */
  get(name: string): Promise<any>;
  /** Mounts an element (made with `h`) into a container; returns its root. */
  render(container: Element, element: unknown): { render(element: unknown): void; unmount(): void };
  /** Imports one shipped module by file name. */
  load(file: string): Promise<Record<string, any>>;
  names: string[];
}
export declare function loadBayrust(options?: { base?: string }): Promise<BayrustRuntime>;
export declare const componentNames: string[];
