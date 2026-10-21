// Where the package's served files (runtime/ and icons/) are reachable from the page. The Vite plugin serves them
// at /bayrust/; elsewhere, copy them with `npx bayrust copy <public dir>` and set the URL here if it differs.
let base = '/bayrust/';

/** Sets the URL of the folder holding the package's runtime/ and icons/ (default `/bayrust/`). */
export function setAssetsBase(url) {
  base = url.endsWith('/') ? url : `${url}/`;
}

/** The URL of that folder, resolved against the page. */
export function assetsBase() {
  return typeof document === 'undefined' ? base : new URL(base, document.baseURI).href;
}
