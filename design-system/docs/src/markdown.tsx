import { navigate } from './router';
import { Fragment, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import { InstallTabs } from './InstallTabs';

// A small Markdown renderer for the docs content: headings (with anchors), paragraphs, lists,
// pipe tables, fenced code and inline code / bold / italic / links. The content is ours, so it
// only needs to cover what the guidelines use.

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[`*]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('`')) out.push(<code key={k++}>{t.slice(1, -1)}</code>);
    else if (t.startsWith('**')) out.push(<strong key={k++}>{inline(t.slice(2, -2))}</strong>);
    else if (t.startsWith('*')) out.push(<em key={k++}>{inline(t.slice(1, -1))}</em>);
    else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      out.push(
        <a
          key={k++}
          href={lm[2]}
          target={lm[2].startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          onClick={(e) => {
            // Links to other doc pages stay in the app.
            if (!lm[2].startsWith('/') || e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            const [path, hash] = lm[2].slice(1).split('#');
            navigate(path, hash ? '#' + hash : '');
          }}
        >
          {lm[1]}
        </a>,
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const splitRow = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'));

/** Renders Markdown and collects its headings (for the page outline). */
export function renderMarkdown(src: string, headings: Heading[] = [], keyPrefix = 'md'): ReactNode {
  const lines = src.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  const key = () => `${keyPrefix}-${k++}`;
  while (i < lines.length) {
    const line = lines[i];
    // +++ Title … +++ : a collapsed section (long reference material that shouldn't crowd the page)
    if (line.startsWith('+++ ')) {
      const title = line.slice(4).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '+++') buf.push(lines[i++]);
      i++;
      blocks.push(
        <details key={key()} className="doc-details">
          <summary>{inline(title)}</summary>
          <div className="doc-details-body">{renderMarkdown(buf.join('\n'), [], `${keyPrefix}-${k}`)}</div>
        </details>,
      );
      continue;
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      blocks.push(lang === 'install' ? <InstallTabs key={key()} packages={buf.join(' ').trim()} /> : <CodeBlock key={key()} code={buf.join('\n')} lang={lang || 'text'} />);
      continue;
    }
    const h = /^(#{2,4}) (.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/[`*]/g, '');
      const id = slugify(text);
      headings.push({ id, text, level });
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
      blocks.push(
        <Tag key={key()} id={id}>
          <a className="doc-anchor" href={`#${id}`} aria-hidden tabIndex={-1}>
            #
          </a>
          {inline(h[2])}
        </Tag>,
      );
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const head = splitRow(rows[0]);
      const body = rows.slice(2).map(splitRow);
      blocks.push(
        <div key={key()} className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                {head.map((c, j) => (
                  <th key={j}>{inline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, j) => (
                    <td key={j}>{inline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*([-*]|\d+\.) /.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: { text: string; nested: boolean }[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])) {
        items.push({ text: lines[i].replace(/^\s*([-*]|\d+\.) /, ''), nested: /^\s{2,}/.test(lines[i]) });
        i++;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List key={key()}>
          {items.map((it, j) => (
            <li key={j} className={it.nested ? 'nested' : undefined}>
              {inline(it.text)}
            </li>
          ))}
        </List>,
      );
      continue;
    }
    if (line.trim()) {
      const buf = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !/^(#|\||```|\s*([-*]|\d+\.) )/.test(lines[i])) buf.push(lines[i++]);
      blocks.push(<p key={key()}>{inline(buf.join(' '))}</p>);
      continue;
    }
    i++;
  }
  return <Fragment>{blocks}</Fragment>;
}
