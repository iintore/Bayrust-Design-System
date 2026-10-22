# @krackedui/bayrust

Bayrust 2.8.2's design system as a package: its design tokens, the shipped component styles and both themes, its
730 icons, and the shipped React components themselves, running as they do in the app.

```bash
npm install @krackedui/bayrust
pnpm add @krackedui/bayrust
yarn add @krackedui/bayrust
```

Public on npm under the `@krackedui` scope: no login needed to install.

**Images included, video not.** The components load their own images at runtime, so the package carries them: icons,
empty states, backgrounds and illustrations render as they do in the app. The two shipped `.mp4` files are the only
thing left out.

## Entry points

| Import | What it is |
|---|---|
| `@krackedui/bayrust/css` | The shipped component styles, both themes, the glass fallback and the fonts |
| `@krackedui/bayrust` | `tokens` (typed, by CSS variable), `classes` (CSS-module class names by module and part), `iconNames`, `rootAttributes()`, `rootClassName` |
| `@krackedui/bayrust/react` | `ThemeRoot`, `Icon`, and `Bayrust`, which runs a shipped component inside your React app |
| `@krackedui/bayrust/components` | `loadBayrust()`: every shipped component by name, rendered with its own React |
| `@krackedui/bayrust/vite` | Vite plugin: serves `runtime/` and `icons/` at `/bayrust/` in dev and copies them into the build |
| `@krackedui/bayrust/tokens.css`, `/tokens.json`, `/icons/<name>.svg` | Tokens as CSS and JSON, icons as files |
| `npx bayrust copy <dir>` | Copies `runtime/` and `icons/` into a public folder, for setups without the Vite plugin |

## Use

```ts
// vite.config.ts
import bayrust from '@krackedui/bayrust/vite';
export default { plugins: [bayrust()] };
```

```tsx
import '@krackedui/bayrust/css';
import { ThemeRoot, Icon, Bayrust } from '@krackedui/bayrust/react';

<ThemeRoot theme="dark">
  <Icon name="magnifying-glass" />
  <Bayrust component="Button" props={{ text: 'Run Script', variant: 'secondary', onClick: run }} />
</ThemeRoot>;
```

The shipped styles and tokens apply under a theme root: `ThemeRoot`, or any element with `rootAttributes('dark' | 'light')`.
`Bayrust` mounts the shipped component with the React it was built with; its props, event handlers included, are
passed as given. Components that need the Mac app's host (installed apps, system data) render without that data.

Elsewhere (Next.js and others), run `npx bayrust copy public/bayrust` once; the default assets URL, `/bayrust/`, then
finds the runtime. A different URL: `setAssetsBase(url)` from `@krackedui/bayrust`, or `loadBayrust({ base })`.

## Develop

```bash
npm run build   # dist/ from the repository (run `npm run content` in design-system/docs first)
npm test        # packs, installs with npm, pnpm and yarn into a Vite + React app, and checks it in Chrome
```

