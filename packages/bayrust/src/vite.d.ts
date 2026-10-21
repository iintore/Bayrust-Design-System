import type { Plugin } from 'vite';
/** Serves the package's runtime/ and icons/ at `base` (default `/bayrust/`) in dev and copies them into the build. */
export default function bayrust(options?: { base?: string }): Plugin;
