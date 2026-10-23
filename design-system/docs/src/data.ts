import content from './content/content.json';

export interface Example {
  title: string;
  sub: string;
  html: string;
  fill: boolean;
  /** Native render shown as the preview (blocks); the markup stays in the Code tab. */
  image?: string | null;
  w?: number;
  h?: number;
  /** Rendered live by the harness: a /ds/ specimen (row) or a playground section. */
  live?: { ds?: string; row?: number | null; pg?: string; section?: number } | null;
  /** How the example is written, read from React. */
  jsx?: string;
  /** A captured window to render live (flows, templates, blocks with `crop`). */
  win?: WindowRef | null;
  crop?: string | null;
  /** Captured from a native child window (dialog, menu): shown on the panel surface the window gives it. */
  panel?: boolean;
  /** Size the specimen had in its window, in points. */
  width?: number | null;
  height?: number | null;
  /** What it inherited or was laid out by there: its parent's font and layout, and ancestor scaling. */
  ctx?: SpecimenContext | null;
}

/** A captured window (public/ds/windows/<flow>/<state>.json), rendered live. */
export interface WindowRef {
  file: string;
  w?: number;
  h?: number;
}

export interface SpecimenContext {
  display: string;
  flexDirection: string;
  alignItems: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
  color: string;
  zoom: string;
  cssZoom: number;
  scale: number;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gap?: string;
  justifyItems?: string;
  justifyContent?: string;
  vars?: Record<string, string>;
  /** Opening tags of the ancestors in the app, outermost first (rendered as display: contents). */
  chain?: string[];
  /** The parent's content box in the app. */
  pw?: number;
  ph?: number;
  /** The window root it was in, and that window's size. */
  window?: string | null;
  /** Margins (top, right, bottom, left) in the app. */
  margin?: number[];
  vw?: number;
  vh?: number;
}

export type Status = 'yes' | 'variant' | 'composed' | 'uncaptured' | 'no';

/** One checklist item on a family page (Button › Link Button…). */
export interface Member {
  id: string;
  title: string;
  status: Status;
  statusLabel: string;
  lead: string;
  examples?: Example[] | null;
  md: string;
}

export interface Shot {
  src: string;
  caption: string;
  /** Sidebar-style group the state belongs to (flows with several paths). */
  group?: string;
  /** Size in points (renders are 2×). */
  w?: number;
  h?: number;
}

export interface Page {
  path: string;
  title: string;
  lead: string;
  md: string;
  kind?: 'component' | 'family' | 'windows' | 'block' | 'colors' | 'type' | 'spacing' | 'radius' | 'elevation' | 'icons' | 'logo' | 'screens' | 'gallery' | 'themes';
  /** Family pages: one section per checklist item. */
  members?: Member[];
  /** Live windows (flows, templates, introduction). */
  windows?: { win: WindowRef; caption: string; group?: string }[];
  /** Native renders shown in the page gallery (flows, templates, logo, introduction). */
  shots?: Shot[];
  /** Image gallery (illustrations, imagery). */
  gallery?: (Shot & { video?: boolean })[];
  /** Bundled themes (Themes page). */
  themes?: Record<string, string>[];
  /** A gallery of values from the shipped stylesheets, rendered with them (shadows, borders, opacity, gradients). */
  swatches?: { title: string; lead: string; html: string };
  /** Checklist status of a component page. */
  status?: Status;
  statusLabel?: string;
  group?: string;
  examples?: Example[] | null;
  full?: string;
  width?: number | null;
  height?: number;
  stageClass?: string;
  /** Cover markup shown above the title (Introduction). */
  hero?: string;
  /** Repository file that holds this page's content. */
  source?: string;
  /** Install and usage markdown for components published as npm packages. */
  install?: string;
  section: string;
  /** Sidebar sub-group (Actions, Inputs… for components; Shell, Panels, Views for blocks). */
  subsection?: string;
}

export interface NavItem {
  title: string;
  path: string;
}
export interface NavGroup {
  label: string;
  icon: string;
  items?: NavItem[];
  sub?: { label: string; items: NavItem[] }[];
}

/** Pages in navigation order, each tagged with its sidebar section. */
export function allPages(): Page[] {
  const raw = content.pages as unknown as Record<string, Omit<Page, 'path' | 'section'>>;
  const out: Page[] = [];
  for (const g of content.nav as NavGroup[]) {
    for (const it of g.items ?? []) out.push({ ...raw[it.path], path: it.path, section: g.label } as Page);
    for (const s of g.sub ?? []) for (const it of s.items) out.push({ ...raw[it.path], path: it.path, section: g.label, subsection: s.label } as Page);
  }
  return out;
}

/** The headings a page's outline lists, in order. */
export function headingsOf(md: string): { id: string; text: string; level: number }[] {
  const out: { id: string; text: string; level: number }[] = [];
  for (const line of md.split('\n')) {
    const m = /^(#{2,3}) (.*)$/.exec(line);
    if (m) {
      const text = m[2].replace(/[`*]/g, '');
      out.push({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), text, level: m[1].length });
    }
  }
  return out;
}
