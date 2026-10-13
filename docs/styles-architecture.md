# Styles Architecture - Developer Guide

How styling works in this project, and how to add to it without breaking the
cascade. For _why_ it's built this way (the decision record), see
[`css-architecture-proposal.md`](./css-architecture-proposal.md).

---

## TL;DR

- **Global, far-reaching styles** live in `src/styles/`, organised into
  [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture)
  layers: `settings → tools → generic → elements → objects`.
- **Component-specific styles** live next to the component as `*.module.scss`
  (CSS Modules), and _consume_ the global layers.
- **Design values are tokens, not literals.** Colour / spacing / radius / motion
  are CSS custom properties; breakpoints are Sass variables.
- **Shared patterns are Sass mixins** (`card-surface`, `coin-grid`,
  `button-secondary`, `focus-ring`, `media.from/until`, `reduced-motion`), not
  copy-pasted rules.

---

## The layer model

ITCSS orders styles from most generic / least specific to most specific. We
adopt its **layering** but drop its global BEM-style naming, because CSS Modules
already scopes class names per file.

```
┌─────────────────────────────────────────────────────────────┐
│ settings   tokens: colour, spacing, radius, motion, breakpts │  no/low output
│ tools      mixins: media(), focus-ring(), reduced-motion()   │  no output until used
│ generic    reset / box-sizing / img reset                    │  global CSS
│ elements   bare element defaults (body, button, input…)      │  global CSS
│ objects    shared undecorated patterns (card, grid, button)  │  mixins → used by components
│ ─────────────────────────────────────────────────────────── │
│ components *.module.scss, scoped, consume everything above   │  scoped CSS
└─────────────────────────────────────────────────────────────┘
```

Reading order top→bottom is also roughly the cascade order: later layers are
allowed to override earlier ones, and scoped component styles win last.

### Folder layout

```
src/
  styles/
    settings/
      _theme.scss        # colour custom properties (light + dark)
      _spacing.scss      # --space-1 … --space-14
      _radii.scss        # --radius-xs/sm/md/lg
      _motion.scss       # --duration-* and --ease-*
      _breakpoints.scss  # $bp-* Sass vars (used in @media)
    tools/
      _media.scss        # @mixin from / until
      _focus.scss        # @mixin focus-ring
      _a11y.scss         # @mixin reduced-motion
    generic/
      _reset.scss        # box-sizing, html, img reset
    elements/
      _base.scss         # :root font, body, button/input/select defaults
    objects/
      _card.scss         # @mixin card-surface
      _grid.scss         # @mixin coin-grid
      _button.scss       # @mixin button-secondary
  index.scss             # global entry: @use of settings + generic + elements
  app/App.module.scss                        # component layer
  components/ui/*.module.scss                 # component layer
  features/coins/components/*.module.scss     # component layer
```

`index.scss` is imported once (via `main.tsx`) and pulls in the global layers:

```scss
// src/index.scss
@use "./styles/settings/theme";
@use "./styles/settings/spacing";
@use "./styles/settings/radii";
@use "./styles/settings/motion";
@use "./styles/generic/reset";
@use "./styles/elements/base";
```

Tokens that emit CSS (everything except `_breakpoints.scss`) are loaded here so
their custom properties exist globally. `_breakpoints.scss`, `tools/*`, and
`objects/*` emit nothing on their own - components `@use` them directly where
needed.

---

## Settings - the tokens

### Colour (`settings/_theme.scss`)

Colours are runtime CSS custom properties defined under `:root`, with a dark
override. The theme is switched by a `data-theme` attribute on `<html>` (set by
the [Zustand preferences store](../src/stores/use-preferences-store.ts) and an
inline script in `index.html` that applies the persisted value before paint).

```scss
:root,
:root[data-theme="light"] {
  color-scheme: light;
  --color-surface: #ffffff;
  --color-text: #18181b;
  --color-focus: #6366f1;
  /* … */
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --color-surface: #111b30;
  --color-text: #e8eefc;
  --color-focus: #60a5fa;
  /* … */
}
```

Available colour tokens: `--color-background`, `--color-surface`,
`--color-surface-hover`, `--color-text`, `--color-text-secondary`,
`--color-border`, `--color-border-strong`, `--color-positive`,
`--color-negative`, `--color-accent`, `--color-focus`,
`--color-error-background`, `--color-error-border`, `--color-error-text`,
`--color-skeleton`, `--color-skeleton-highlight`, `--shadow-card`,
`--shadow-card-hover`.

> **Rule:** never hardcode a hex colour in a component. A literal won't switch
> with the theme - that was the real dark-mode focus-ring bug this architecture
> fixed.

### Spacing (`settings/_spacing.scss`)

A numeric scale. Values are inherited verbatim from the pre-refactor styles, so
the scale is granular rather than a clean 4px grid (consolidating near-duplicates
would be a visible change, so it's deferred).

| Token       | Value |     | Token        | Value |
| ----------- | ----- | --- | ------------ | ----- |
| `--space-1` | 5px   |     | `--space-8`  | 16px  |
| `--space-2` | 7px   |     | `--space-9`  | 18px  |
| `--space-3` | 8px   |     | `--space-10` | 20px  |
| `--space-4` | 9px   |     | `--space-11` | 24px  |
| `--space-5` | 10px  |     | `--space-12` | 28px  |
| `--space-6` | 12px  |     | `--space-13` | 32px  |
| `--space-7` | 14px  |     | `--space-14` | 40px  |

```scss
.card {
  padding: var(--space-9); // 18px
  gap: var(--space-7); // 14px
}
```

### Radius (`settings/_radii.scss`)

| Token         | Value | Used for                  |
| ------------- | ----- | ------------------------- |
| `--radius-xs` | 6px   | skeleton placeholder bars |
| `--radius-sm` | 8px   | buttons, inputs, selects  |
| `--radius-md` | 12px  | panels, empty states      |
| `--radius-lg` | 14px  | cards                     |

### Motion (`settings/_motion.scss`)

| Token                | Value  | Used for                       |
| -------------------- | ------ | ------------------------------ |
| `--duration-fast`    | 150ms  | hover / focus transitions      |
| `--duration-theme`   | 180ms  | theme (bg + colour) transition |
| `--duration-shimmer` | 1.5s   | skeleton shimmer               |
| `--ease-default`     | ease   | general easing                 |
| `--ease-linear`      | linear | shimmer loop                   |

```scss
transition:
  background-color var(--duration-fast) var(--ease-default),
  border-color var(--duration-fast) var(--ease-default);
```

### Breakpoints (`settings/_breakpoints.scss`)

Breakpoints are **Sass variables, not custom properties** - custom properties
cannot be used inside `@media` queries.

| Variable       | Value  | Purpose                 |
| -------------- | ------ | ----------------------- |
| `$bp-grid-sm`  | 600px  | coin grid 1 → 2 columns |
| `$bp-grid-md`  | 900px  | coin grid 2 → 3 columns |
| `$bp-grid-lg`  | 1200px | coin grid 3 → 4 columns |
| `$bp-toolbar`  | 480px  | App header collapse     |
| `$bp-controls` | 640px  | CoinControls stack      |

`$bp-toolbar` (480) and `$bp-controls` (640) are intentionally distinct from the
grid scale - they drive different reflows. Don't "consolidate" them without a
product decision.

---

## Tools - the mixins

Mixins emit nothing until a component `@include`s them.

### `tools/_media.scss`

```scss
@mixin from($bp) {
  @media (min-width: $bp) {
    @content;
  }
}
@mixin until($bp) {
  @media (max-width: $bp) {
    @content;
  }
}
```

Usage - always pass a breakpoint token, never a literal:

```scss
@use "../../../styles/settings/breakpoints" as bp;
@use "../../../styles/tools/media" as media;

.list {
  grid-template-columns: 1fr;

  @include media.from(bp.$bp-grid-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.controls {
  @include media.until(bp.$bp-controls) {
    flex-direction: column;
  }
}
```

### `tools/_focus.scss`

A consistent, themed keyboard focus ring. Extra focus-only declarations go in
the block body (`@content`).

```scss
@mixin focus-ring($offset: 3px) {
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: $offset;
    @content;
  }
}
```

```scss
@use "../../styles/tools/focus" as focus;

.toggle {
  @include focus.focus-ring; // default 3px offset
}

.searchInput {
  @include focus.focus-ring(2px) {
    // custom offset + extra decl
    border-color: var(--color-focus);
  }
}
```

### `tools/_a11y.scss`

```scss
@mixin reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}
```

```scss
@use "../../../styles/tools/a11y" as a11y;

@include a11y.reduced-motion {
  .card {
    transition: none;
  }
}
```

---

## Generic & Elements

- **`generic/_reset.scss`** - `box-sizing`, `html` sizing/background, `img`
  reset. Structural resets, no design decisions.
- **`elements/_base.scss`** - bare element defaults: `:root` font settings,
  `body` background/colour/transition, and `button/input/select` normalisation
  including the global `:focus-visible` ring.

These are global stylesheets (they emit CSS directly). You rarely touch them;
add a bare-element default here only when it should apply app-wide to an element
type, not to a class.

---

## Objects - shared patterns

Objects are the _undecorated_ skeletons of repeated UI, expressed as Sass mixins
so there's a single source of truth. Components `@include` them and add their own
decoration.

### `objects/_card.scss` - `card-surface`

```scss
@mixin card-surface {
  display: flex;
  align-items: center;
  gap: var(--space-7);
  min-width: 0;
  padding: var(--space-9);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
```

Consumed by both the live card and the skeleton card:

```scss
// CoinGrid.module.scss
@use "../../../styles/objects/card" as card;

.card {
  @include card.card-surface;
  box-shadow: 0 1px 2px var(--shadow-card); // card-specific decoration
  &:hover {
    border-color: var(--color-border-strong);
  }
}
```

```scss
// CoinGridSkeleton.module.scss
.card {
  @include card.card-surface;
  min-height: 78px; // skeleton-specific
}
```

### `objects/_grid.scss` - `coin-grid`

The responsive 1 → 2 → 3 → 4 column grid, breakpoints included:

```scss
@use "../settings/breakpoints" as bp;
@use "../tools/media" as media;

@mixin coin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;

  @include media.from(bp.$bp-grid-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @include media.from(bp.$bp-grid-md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @include media.from(bp.$bp-grid-lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

```scss
@use "../../../styles/objects/grid" as grid;

.list {
  @include grid.coin-grid;
}
```

### `objects/_button.scss` - `button-secondary`

The shared secondary-button surface: border, fill, text, hover, disabled, and
focus. Callers add their own **padding / layout / transition**.

```scss
@use "../tools/focus" as focus;

@mixin button-secondary {
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 500;

  &:hover:not(:disabled) {
    background: var(--color-surface-hover);
  }
  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  @include focus.focus-ring;
}
```

```scss
// ErrorState.module.scss - minimal
@use "../../styles/objects/button" as button;

.retryButton {
  @include button.button-secondary;
  padding: var(--space-5) var(--space-8);
}
```

```scss
// App.module.scss - with extras
.refreshButton {
  @include button.button-secondary;
  flex-shrink: 0;
  padding: var(--space-5) var(--space-8);
  transition:
    background-color var(--duration-fast) var(--ease-default),
    border-color var(--duration-fast) var(--ease-default);

  &:hover:not(:disabled) {
    border-color: var(--color-text-secondary);
  }
}
```

> Note: `button-secondary` deliberately does **not** set `padding` - the three
> buttons use different padding, and baking one in would silently change them.
> Keep parameter-free mixins to the truly-shared declarations; let callers own
> the variants.

---

## Components

Component modules are ordinary `*.module.scss` files co-located with their
`.tsx`. They import from the global layers and compose everything above.

### `@use` path reference

Paths are relative to the component file:

| Component location                            | Prefix to `src/styles/` |
| --------------------------------------------- | ----------------------- |
| `src/app/*.module.scss`                       | `../styles/`            |
| `src/components/ui/*.module.scss`             | `../../styles/`         |
| `src/features/coins/components/*.module.scss` | `../../../styles/`      |

Namespace imports (`@use "…" as x`) keep call sites readable: `bp.$bp-grid-sm`,
`media.from(...)`, `button.button-secondary`.

---

## Conventions & rules

1. **Tokens over literals.** Use a token for any colour, spacing, radius, or
   motion value. A literal is only acceptable for a genuine one-off _dimension_
   that isn't a design decision - e.g. a fixed `40px` icon size, a skeleton
   placeholder's `width: 76px`, or `border-radius: 50%`.
2. **Breakpoints only via `media.from/until` + a `$bp-*` token.** No bare
   `@media (min-width: 600px)` in a component.
3. **Focus rings via `focus-ring`.** Guarantees the themed `--color-focus`.
4. **Reduced motion via `reduced-motion`.** Any transition/animation a component
   adds should have a matching `reduced-motion` opt-out.
5. **Reach for an object on the _third_ duplication**, not the first. We have
   three objects today (`card`, `grid`, `button-secondary`); add a fourth only
   when a pattern is genuinely repeated and stable.

### Why mixins for shared patterns?

Shared patterns are **Sass mixins**. The cost is that each consumer duplicates
the mixin's declarations in the compiled CSS - but it compresses to ~nothing in
gzip, and the _source_ stays DRY, which was the actual goal.

---

## Cookbook

### Add a spacing / radius / motion token

Add it to the matching `settings/` partial. Because these files are already
`@use`d by `index.scss`, the custom property is immediately available
everywhere - no import needed in components.

```scss
// settings/_radii.scss
:root {
  --radius-pill: 999px; // new
}
```

### Add a breakpoint

Add a `$bp-*` variable to `settings/_breakpoints.scss`, then `@use` the
breakpoints partial in the component and pass it to `media.from/until`.

```scss
// settings/_breakpoints.scss
$bp-wide: 1440px;
```

```scss
@use "../../../styles/settings/breakpoints" as bp;
@use "../../../styles/tools/media" as media;

.list {
  @include media.from(bp.$bp-wide) {
    gap: var(--space-11);
  }
}
```

### Add a new theme colour

Add the token to **both** blocks in `settings/_theme.scss` so it switches:

```scss
:root,
:root[data-theme="light"] {
  --color-warning: #b45309;
}
:root[data-theme="dark"] {
  --color-warning: #fbbf24;
}
```

### Create a new component stylesheet

```scss
// src/features/alerts/components/AlertBanner.module.scss
@use "../../../styles/tools/a11y" as a11y;
@use "../../../styles/tools/focus" as focus;

.banner {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  transition: background-color var(--duration-fast) var(--ease-default);
}

.dismiss {
  @include focus.focus-ring;
}

@include a11y.reduced-motion {
  .banner {
    transition: none;
  }
}
```

```tsx
import styles from "./AlertBanner.module.scss";
// <div className={styles.banner}> … <button className={styles.dismiss}> …
```

### Reuse the card or grid

```scss
@use "../../../styles/objects/card" as card;

.tile {
  @include card.card-surface;
} // + your own decoration
```

---

## Verifying a style change

The Vitest suite asserts roles/text, not pixels, so it can't catch visual drift.
After a styling change:

```bash
npm run build      # must compile clean - no lightningcss "Unknown at rule" warnings
npm run dev        # eyeball the change in BOTH light and dark themes
```

A clean `build` plus a two-theme visual pass is the real verification.

---

## Not yet adopted

- **Native CSS `@layer`** (wrapping the global layers to lock cascade order by
  construction) is deferred. The current module cascade behaves correctly at
  this app's size; revisit if specificity conflicts ever appear.
- **A utilities layer** - intentionally skipped. Spacing/layout is handled by
  tokens + component rules; a global utility layer isn't needed in a
  scoped-modules world.
