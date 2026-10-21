// Turns captured markup into readable code for the Code tab: sprite icons collapse to their name,
// asset paths go back to the app's own URL schemes, and tags are indented one per line.
const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon']);

export function formatHtml(html: string): string {
  let src = html
    .replace(/<svg\b[^>]*>\s*<use href="\/ds\/sprite\/([^".]+)\.svg#s"><\/use>\s*<\/svg>/g, '<Icon name="$1" />')
    .replace(/\/ds\/sprite\/([^".]+)\.svg#s/g, 'ipc://raycast-sprite/$1#s');
  // Any other inline SVG (logos, illustrations) collapses to a placeholder.
  src = src.replace(/<svg\b[\s\S]*?<\/svg>/g, '<svg>…</svg>');
  const tokens = src.match(/<[^>]+>|[^<]+/g) ?? [];
  const out: string[] = [];
  let depth = 0;
  for (const raw of tokens) {
    const t = raw.trim();
    if (!t) continue;
    const pad = '  '.repeat(depth);
    if (t.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      const last = out[out.length - 1];
      // Keep short elements on one line: <span>Label</span>
      if (last && !last.trimStart().startsWith('<') && out.length > 1 && !/^\s*<\//.test(out[out.length - 2]) && out[out.length - 2].trimEnd().endsWith('>') && !out[out.length - 2].trimEnd().endsWith('/>')) {
        const text = out.pop()!.trim();
        out[out.length - 1] = out[out.length - 1] + text + t;
      } else if (out.length && out[out.length - 1].trimEnd().endsWith('>') && new RegExp(`^\\s*<${t.slice(2, -1)}[\\s>]`).test(out[out.length - 1]) && !out[out.length - 1].includes('</')) {
        out[out.length - 1] += t;
      } else out.push('  '.repeat(depth) + t);
      continue;
    }
    if (t.startsWith('<')) {
      out.push(pad + t);
      const tag = /^<([\w.-]+)/.exec(t)?.[1]?.toLowerCase() ?? '';
      if (!t.endsWith('/>') && !VOID.has(tag) && !t.startsWith('<!') && !t.startsWith('<Icon ')) depth++;
      continue;
    }
    out.push(pad + t.replace(/\s+/g, ' '));
  }
  return out.join('\n');
}
