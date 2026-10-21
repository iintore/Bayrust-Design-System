# Bayrust Design System

Raycast 2.8.2, rebuilt from its own shipped frontend and renamed **Bayrust**, documented as a design system:
foundations → components → patterns → blocks → templates → flows. Every preview in the docs is the real component,
running live.

> **Private study material.** Raycast's code, artwork and icons (in `reference/frontend/` and everything captured from
> it) are Raycast's property. Keep this repository private and don't redistribute it.

The rename is display-only: `harness/brand.js` rewrites visible text and labels (`Raycast` → `Bayrust`) in every
window. Add `?brand=raycast` to a URL to turn it off. Logo and app-icon artwork are unchanged. Nothing is redrawn or
approximated: the UI is rendered by Raycast's own JavaScript, CSS, fonts and images, its backend runs from its own
Node code, and only the native host bridge is stubbed.

## Quick start

Requires macOS on Apple silicon, Node 20+, Python 3 and Google Chrome (for the capture and audit scripts).

```bash
git clone --recurse-submodules https://github.com/iintore/Bayrust-Design-System.git
cd Bayrust-Design-System
npm run setup        # tools, the backend's Node runtime, harness and docs dependencies
npm run harness      # the live app and component runtime, http://localhost:4317
npm run docs         # the documentation site, http://localhost:5174 (in a second terminal)
```

The docs' live previews run in the harness, so keep both running. Without the harness, previews fall back to their
captured markup.

| Command | What it does |
|---|---|
| `npm run docs:content` | Rebuilds the docs content (`src/content/content.json`, `public/ds/`) from the captures |
| `npm run check` | Typecheck, tests and production build of the docs |
| `npm run audit` | Opens every component page, waits for each live preview and saves a picture of each to `research/docs/audit/` (`THEME=light npm run audit` checks the light theme, into `audit-light/`) |
| `npm run verify` | Checks every in-app specimen against the size it had in its window |
| `npm run package:build` | Builds the `@krackedui/bayrust` package (`packages/bayrust/dist/`) |
| `npm run package:test` | Packs it, installs it with npm, pnpm and yarn into a Vite + React app, and checks it in Chrome |

## Repository layout

| Path | Contents |
|---|---|
| `packages/bayrust/` | The `@krackedui/bayrust` package: tokens, styles, icons and the shipped components, for npm, pnpm and yarn |
| `design-system/docs/` | The documentation site (Vite + React). `scripts/` builds its content; `scripts/coverage.py` maps the 226-item checklist to Bayrust |
| `design-system/site/` | The `/ds/` component runtime inside the live app; `composed.js` holds the components composed from Bayrust parts |
| `design-system/tokens/`, `assets/` | Design tokens (Dark and Light), 730 icons, native catalog images, the icon-workflow package |
| `harness/` | The server, sandboxed backend, host stubs, specimen tools and the capture, audit and verify scripts |
| `reference/frontend/` | Raycast 2.8.2's web frontend, unmodified |
| `research/` | Captures (DOM, tokens, native renders), component inventory and props, ground-truth screenshots, REA evidence |
| `tools/` | `rea`, `extract-site` and `web-icon-extraction-workflow`, as git submodules |

Not in git: `node_modules/`, the backend's Node binary (`npm run setup` downloads the official release), the sandbox's
runtime state (recreated on first run) and audit output. The REA graphs are stored as `.json.xz`; `xz -dk` restores them.

## Package and hosting

**Package.** `packages/bayrust` builds `@krackedui/bayrust` (see its README). It's set to publish with restricted
access, so only members of the `@krackedui` scope can install it:

```bash
cd packages/bayrust && npm login && npm publish
```

**Docs on Vercel.** `vercel.json` builds only the docs app and serves it as a static site (deep links included);
`.vercelignore` keeps the upload to the docs folder (about 56 MB). Without the harness, each preview shows its captured
markup instead of the live component. From the repository root:

```bash
npx vercel login
npx vercel deploy
```

`vercel deploy` makes a preview deployment, which Vercel Authentication can keep to your team; `--prod` publishes it.

## The live app

With `npm run harness` running, open:

| URL | What |
|---|---|
| `http://localhost:4317/ds/` | Working design-system site inside the live runtime: foundations → icons → atoms → molecules → organisms → templates → flows → component index |
| `http://localhost:4317/main-window.html` | Live launcher (750 × 475) |
| `http://localhost:4317/main-window.html?windowMode=compact` | Live launcher, compact (750 × 64, expands on typing) |
| `http://localhost:4317/welcome-window.html?variant=simplified` · `?step=features` · `?step=migration&userType=classic` | Onboarding (1280 × 760) |
| `http://localhost:4317/settings-window.html`, `ai-chat-window.html`, `notes-window.html`, `theme-studio-window.html`, `pro-walkthrough-window.html`, `feedback-window.html` | The other windows |

`.claude/launch.json` defines the same server for the Claude desktop browser pane.

### Documentation site

`design-system/docs` is the Bayrust design-system documentation. It follows AlignUI's documentation structure
(Getting started → Foundations → Components A–Z, each component page: examples per variant, then API reference) and
takes Bayrust's own look: the layout, type and colours of the app's internal component playground.

| Section | Contents |
|---|---|
| Getting started | Introduction, Installation, **Coverage** (all 226 checklist items and what Bayrust has for each), Changelog |
| Foundations | 26 pages: tokens, colour, type, spacing, sizing, grid, layout, breakpoints, responsive design, icons, illustrations, imagery, logo, elevation, shadows, borders, radius, opacity, gradients, motion, animation, transitions, accessibility, themes, dark mode, interaction states |
| Components | 32 families, A–Z (Button holds Button, Compact, Fancy, Link, Icon, Toggle, Group, Split, Floating Action, Back to Top; Input holds every kind of input…), each checklist item a section |
| Patterns | States, overlays, drag & drop, onboarding |
| Blocks, Templates, Flows | Live windows: each captured window's own DOM at its size, with open panels at their native frames |

Every preview is the real thing. Shipped components run live in the harness, in an iframe, interactive; until a live
preview is ready its captured markup stands in (it renders at once from the shipped stylesheets), so the shimmer
skeleton only shows for an example with nothing to stand in. Live previews boot six at a time in the order they come
into view. The Code tab shows the JSX each example is written with, read from React. Window states render from their
captured DOM with their native panels. Nothing on the docs pages is a screenshot (only the image assets themselves, on
Illustrations, Imagery and Logo).

The docs' own navigation is Bayrust's component index (the playground sidebar), rendered with the shipped class names;
`scripts/build_content.py` extracts the rules it needs from the bundle into `public/ds/native.css`, scoped to the nav.

Two things Chrome can't do as the Mac app does, handled the way Bayrust itself does:

- **Liquid Glass.** `-apple-visual-effect` only draws in WebKit on macOS. Elsewhere the glass controls (the launcher
  footer's pills) take `--tahoe-dimmed-bg`, the material Bayrust uses when the glass is off, instead of turning
  transparent over the list.
- **Many windows on one page.** Every harness window used to hold its own backend event stream, which used up the
  browser's six connections per host after a few live previews. One window now holds the stream and relays it to the
  others (`harness/shim.js`).

**Composed components.** Checklist items Bayrust doesn't ship (Tabs, Breadcrumb, Pagination, Avatar Group, charts…) are
built in `design-system/site/composed.js` only from Bayrust's shipped React primitives, text styles and tokens, and are
labelled "Composed from Bayrust parts" wherever they appear.

Specimens are exact and come from four places, all in the running app:

| Source | Script |
|---|---|
| Bayrust's internal component playground (AI Chat window, route `/playground`, 68 components with its own notes and variant labels) | `harness/docs-specimens.mjs playground` |
| Live interactions with their native panels (colour picker, Create Project dialog, theme editor, Start Focus Session with its duration picker and block list, Search AI Commands, legacy password, crash view, Create Automation) | `harness/docs-specimens.mjs live` |
| Composed components, rendered from shipped primitives in the `/ds/` runtime | `harness/docs-capture.mjs` |
| Live windows for flows, templates and blocks | `harness/docs-windows.mjs` |
| Component instances in the 94 captured states, with the context they had (parent box, font, window, ancestors, scale) | `harness/docs-specimens.mjs instances` |
| The in-runtime `/ds/` specimens and blocks | `harness/docs-capture.mjs` |

`harness/docs-verify.mjs` renders every docs page and checks each in-app specimen against the size it had in its
window. Current result: 41 of 42 identical; one differs by under 6 px (the "Index Files" action button). `harness/docs-audit.mjs`
opens every page and checks that each preview rendered, is centred and doesn't overflow: 0 issues across 48 pages.

```bash
cd design-system/docs
npm install
python3 scripts/facts.py   # facts for the foundation pages, from the shipped CSS and JS
npm run content            # src/content/content.json and public/ds/
npm run dev
```

`scripts/coverage.py` maps the checklist to Bayrust. Every component name in it is checked against the inventory at
build time. Items Bayrust doesn't have get no page; items that exist in code but need an account or live data are
documented from their props and marked as such.

The AlignUI docs (extracted locally with `extract-site`, not kept in this repository) were used only as a reference for
page structure and interactions. None of their content or styling ships in the Bayrust docs.

## How it works

| Piece | Path | Role |
|---|---|---|
| Shipped frontend (copy) | `reference/frontend/` | Raycast's web UI, unmodified |
| Harness server | `harness/server.mjs` | Serves the frontend and injects the bridge stub (`shim.js`, `mocks.js`, `keyboard-layout-abc.js`) |
| Real backend, sandboxed | `harness/backend.mjs` | Runs Raycast's own `backend/index.mjs` on its bundled Node 22 over its stdio protocol (`0x1E header 0x1F data 0x1D`), with `HOME=harness/sandbox-home`. It never touches your real Raycast data. |
| Host responses | `harness/host-table.mjs` | Answers the native host's methods; hot-reloaded. Unknown calls are listed at `/__unknown-host` |
| Mac data | `harness/native/macos-host` | Installed/running apps and exact system icons via AppKit (read-only) |
| Native renderer | `harness/native/viewer` | WKWebView inside an `NSGlassEffectView` window with WebKit `useSystemAppearance` on, as Raycast's host does. This draws the `-apple-visual-effect` Liquid Glass and opens `window.open()` child panels (⌘K, menus) as native panels. |
| Ground-truth watcher | `harness/native/watcher` | Read-only screenshots of real Raycast windows into `research/ground-truth/auto/` |

Capture pipelines: `harness/capture.mjs` (Chromium: DOM, tokens, IPC log and icon capture) and
`harness/capture-native.mjs` (WebKit: final images, child panels composited at their computed frames),
both driven by `harness/states/*.json`. Organism crops come from `harness/organisms.mjs`.

## What was extracted

| Output | Path | Notes |
|---|---|---|
| Design tokens (Dark + Light, resolved) | `design-system/tokens/` | ≈450 CSS variables, each with its source rule. W3C-style JSON plus CSS |
| Component inventory | `research/component-inventory.json`, `research/component-props.json` | 1,783 named components, 1,241 with recovered props |
| Variant matrices | `research/css-variants.json` | Taken from the CSS-module `[data-*=…]` selectors |
| Motion | `design-system/site/motion.json` | 118 keyframes, transitions and animations, 28 Framer Motion configs |
| Icons | `design-system/assets/icons-svg/` | 730 sprite symbols as standalone SVGs |
| Icon-workflow package | `design-system/assets/icon-workflow/raycast-2.8.2/` (+ `.zip`) | Built by `web-icon-extraction-workflow`: 1,599 verified SVGs, 646 originals, gallery and coverage report |
| Native catalog images | `design-system/assets/native/` | App icons (Production/Internal/Dev/RayConfig) and menu-bar glyphs (PNG + PDF) from `Assets.car` |
| Flows | `research/captures/<flow>/` (`webkit/` = native renders) | Onboarding 13, Launcher 13, AI Chat 5, Pro Walkthrough 7, Settings 39, Notes 3, Theme Studio 3, Feedback 2 |
| Organisms | `research/organisms/` | Exact element crops from live states |
| REA evidence | `research/rea-*.json` | Asset-catalog inspection, plus partial JS graphs (REA hit its 1-hour limit on `compose-ai-command-prompt-*.js` and `dist-*.js`) |

## Known gaps

- **Full screen** renders cover the whole display (1710 × 1107). The native viewer lets titled windows cover the
  menu bar and Dock area, as a macOS full-screen window does (`UnclampedWindow` in `harness/native/viewer.swift`).
- **Window sizes** are all real. Measured on this Mac (CGWindowList, screenshots in `research/ground-truth/windows/`):
  Main 750 × 475, Welcome 1280 × 760, Settings 800 × 786, Theme Studio 1370 × 570, Send Feedback 420 × 714, Notes 396 wide
  with a content-driven height (830 for the welcome note). Pro Walkthrough is 1280 × 760 / 712 (from code). AI Chat is
  750 × 600 (this Mac's saved frame).
- **System accent.** The host injects the macOS accent colour (`window.systemAccentColor`), and it overrides the theme accent
  (`--accent: var(--color-system-accent, var(--theme-accent))`). The harness injects this Mac's: Blue, `#007AFF`.
  `?systemAccent=` changes it.
- **Window controls.** Settings, Theme Studio, Send Feedback and Welcome show the standard macOS traffic lights; the launcher and Notes don't.
  Native captures show them in the inactive (gray) state.
- **Notes backdrop.** The real Notes window uses a lighter native material than the default `NSGlassEffectView`. Its content
  matches exactly, but the backdrop tone differs.
- **Account-dependent content.** Signed in, Send Feedback has no Email field and adds "Include Raycast Logs". The sandbox is signed out.
- **Inferred host response.** `applications.getDefaultSearchScopes`: the paths come from the host binary's strings; the
  `canDisable` flags are not visible statically.
- **Settings › Account** is a Chromium capture. Its router ignores scripted clicks in the native viewer.
- **Window backdrop.** The native renders use a default `NSGlassEffectView`. Raycast's private glass variant settings are not reproduced.
- **Account state.** The sandboxed backend can't sign in (the sign-in redirect returns to the real app). The harness
  answers `auth.getUser` the way Raycast's own Internal Settings › Auth State override builds a user: a Pro trial ending
  27 Oct, this Mac's plan (`?account=trial`, the default; `pro`; `signed-out`, the default in onboarding). Pro screens
  render fully; anything served by Raycast's servers (AI answers, synced data, credit amounts) stays empty.
- **Locale.** The harness uses this Mac's locale (`en_RW`), so dates read "27 Oct" as in the app.
- **Figma** (`IST UX & Design` drafts, file `mB3mUgeHlPKGWt5BJ93glv`). Done: variables, text styles, Foundations, 730 icon components,
  Atoms/Molecules/Organisms captures, Templates and Onboarding. Paused on request: the Launcher, AI Chat, Pro, Settings and
  Notes/Theme/Feedback flow pages (their images are listed in `design-system/site/flows.json`).
