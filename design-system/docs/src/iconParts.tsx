const BASE = import.meta.env.BASE_URL;

/**
 * An icon from the shipped sprite, by name. Drawn as a mask over currentColor, as the app tints
 * its symbols; the files in public/ds/icons are the sprite's own symbols.
 */
export function AppIcon({ name, size = 16 }: { name: string; size?: number }) {
  const url = `url("${BASE}ds/icons/${name}.svg")`;
  return (
    <span className="doc-icon" aria-hidden>
      <span className="doc-sym" style={{ width: size, height: size, WebkitMaskImage: url, maskImage: url }} />
    </span>
  );
}
