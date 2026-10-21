import { useState, type ReactNode } from 'react';
import { Icon } from './icons';

// Lightweight highlighting for the languages the docs show: html, tsx/ts, css, bash.
type Tok = [cls: string, text: string];

const RULES: Record<string, [RegExp, string][]> = {
  html: [
    [/<!--[\s\S]*?-->/y, 'c'],
    [/<\/?[A-Za-z][\w.-]*/y, 't'],
    [/\s[\w:@.-]+(?==)/y, 'a'],
    [/"[^"]*"|'[^']*'/y, 's'],
    [/\/?>/y, 't'],
  ],
  tsx: [
    [/\/\/[^\n]*/y, 'c'],
    [/"[^"]*"|'[^']*'|`[^`]*`/y, 's'],
    [/\b(import|from|export|const|let|function|return|if|else|new|type|interface|async|await)\b/y, 'k'],
    [/<\/?[A-Z][\w.]*|<\/?[a-z][\w-]*(?=[\s>/])|\/?>/y, 't'],
    [/\b\d+(\.\d+)?\b/y, 'n'],
  ],
  css: [
    [/\/\*[\s\S]*?\*\//y, 'c'],
    [/[.#]?[\w-]+(?=\s*\{)/y, 't'],
    [/[\w-]+(?=\s*:)/y, 'a'],
    [/var\(--[\w-]+\)|--[\w-]+/y, 'k'],
    [/"[^"]*"|'[^']*'/y, 's'],
    [/\b\d+(\.\d+)?(px|%|ms|s)?\b/y, 'n'],
  ],
  bash: [
    [/#[^\n]*/y, 'c'],
    [/^\s*[\w-]+/my, 'k'],
    [/"[^"]*"|'[^']*'/y, 's'],
  ],
};
RULES.ts = RULES.tsx;

function highlight(code: string, lang: string): ReactNode[] {
  const rules = RULES[lang];
  if (!rules) return [code];
  const toks: Tok[] = [];
  let i = 0;
  let plain = '';
  outer: while (i < code.length) {
    for (const [re, cls] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m.index === i && m[0].length) {
        if (plain) {
          toks.push(['', plain]);
          plain = '';
        }
        toks.push([cls, m[0]]);
        i += m[0].length;
        continue outer;
      }
    }
    plain += code[i++];
  }
  if (plain) toks.push(['', plain]);
  return toks.map(([cls, text], j) => (cls ? <span key={j} className={`tk-${cls}`}>{text}</span> : text));
}

export function CodeBlock({ code, lang = 'text', bare = false }: { code: string; lang?: string; bare?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable: the code stays selectable */
    }
  };
  return (
    <div className={'doc-code' + (bare ? ' bare' : '')}>
      {!bare && <span className="doc-code-lang">{lang}</span>}
      <button className="doc-code-copy" onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
        {copied ? <Icon.check /> : <Icon.copy />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <pre>
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}
