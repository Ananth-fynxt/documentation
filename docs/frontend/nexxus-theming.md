# Nexxus Theming System

The Nexxus theme is built on Chakra UI v3's recipe system using `defineConfig` and `createSystem` APIs. It includes design tokens, semantic tokens, component recipes, theme variants, an advanced serializable theme config, Shadow DOM style isolation, and built-in i18n support.

There are three ways to theme Nexxus widgets, from simplest to most flexible:

1. **Default theme** — pass nothing; the base `nexxus` system is used.
2. **Theme variants** — pick one of the built-in presets (`ocean`, `forest`, …) via the `theme` prop or a widget's `themeVariant` prop.
3. **Advanced config** — describe colors, fonts, sizes, labels and buttons in a plain `NexxusThemeConfig` object and turn it into a system with `createNexxusSystem()` (or pass it to a widget's `themeConfig` prop).

---

## Installation

```bash
npm install @nexxus/react @chakra-ui/react @emotion/react
```

---

## Quick Start

Wrap your application with the Nexxus provider. The theme system is passed via the `theme` prop:

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";

function App() {
  return (
    <NexxusProvider theme={nexxusThemeSystem}>
      {/* Your application */}
    </NexxusProvider>
  );
}
```

> **Migration note:** earlier versions used `<NexxusProvider value={...}>`. The prop is now `theme`, and it is **optional** — omit it to use the base `nexxus` system. The old `value` prop is no longer read.

---

## NexxusProvider Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `theme` | `SystemContext` | No | Theme system (e.g., `nexxusThemeSystem`, a variant from `themeVariants`, or the result of `createNexxusSystem(...)`). Defaults to `nexxusThemeSystem`. |
| `defaultLanguage` | `string` | No | Initial i18n language. Built-ins: `'en' \| 'es' \| 'ar'`. Any other language works once its bundles are supplied via `translations`. |
| `translations` | `NexxusTranslations` | No | App-provided translation bundles keyed by language → namespace → strings. Registered with i18next at runtime (deep-merged over built-ins), so an app can add or override languages without editing the library. |
| `disableShadowDom` | `boolean` | No | Opt out of Shadow DOM isolation (e.g. for SSR or debugging). Default `false`. |
| `children` | `ReactNode` | Yes | Application content. |

By default the provider renders your app inside a Shadow DOM (see [Shadow DOM Isolation](#shadow-dom-isolation)) and mounts a `<Toaster />` for toast notifications.

> For a dedicated deep-dive on the provider — theme resolution, re-mount-on-change, i18n registration, and full examples — see the [NexxusProvider](./nexxus-provider.md) page.

---

## Shadow DOM Isolation

`NexxusProvider` renders its children inside a Shadow DOM root so the widgets' styles never leak into — or get overridden by — the host application's CSS. This is what lets you drop a Nexxus widget into any app (Tailwind, Bootstrap, legacy CSS) without collisions.

Key implications:

- The Chakra system is scoped to `:host` rather than `:root`. All CSS variables (`--ck-*`), preflight, and global styles apply inside the shadow root only.
- Any CSS a component needs (for example the routing rule's query-builder styles) must be injected **inside** the shadow root — importing a stylesheet into `document.head` will not reach the widgets.
- Set `disableShadowDom` to fall back to global (document-level) style injection. Use this only when the shadow root causes problems (some SSR setups, snapshot testing).

```tsx
// Debug / SSR: render without the shadow root
<NexxusProvider theme={nexxusThemeSystem} disableShadowDom>
  {/* widgets use document-level styles */}
</NexxusProvider>
```

---

## Theme Variants

Six built-in theme variants are available, each with different primary and secondary color palettes:

| Variant | Primary | Secondary |
| --- | --- | --- |
| `nexxus` | Deep blue | Light blue |
| `halloween` | Orange | Dark gray |
| `ocean` | Blue | Teal |
| `forest` | Green | Brown/tan |
| `sunset` | Purple | Orange |
| `monochrome` | Gray | Blue |

### Using a Theme Variant

```tsx
import { NexxusProvider, themeVariants } from "@nexxus/react";

function App() {
  return (
    <NexxusProvider theme={themeVariants.ocean}>
      {/* Themed with ocean palette */}
    </NexxusProvider>
  );
}
```

All variants share the same typography, success/warning/error/neutral palettes, and semantic token structure. Only the primary and secondary palettes differ.

The theme is always applied through `NexxusProvider theme={...}`. Nexxus widgets themselves don't take a theme prop — instead, a thin **host wrapper** typically accepts a `themeVariant` name, resolves it to a system, and passes it to the provider. This is the pattern used by the dev sandbox's `MyPSPPage`:

```tsx
import { NexxusProvider, themeVariants, nexxusThemeSystem, type ThemeVariantName } from "@nexxus/react";
import { PSPComponent } from "@nexxus/psp";

function MyPSPPage({ themeVariant }: { themeVariant?: ThemeVariantName }) {
  const theme = (themeVariant && themeVariants[themeVariant]) || nexxusThemeSystem;
  return (
    <NexxusProvider theme={theme}>
      <PSPComponent brandId="..." />
    </NexxusProvider>
  );
}
```

---

## Advanced Theme Configuration

For full control — brand colors, fonts, type scale, form-label and button styling — describe the theme as a plain, serializable `NexxusThemeConfig` object and build a system from it with `createNexxusSystem()`. This is the Chakra-style configuration surface exposed to host apps; it preserves all the Shadow-DOM wiring (`cssVarsRoot`/preflight scoped to `:host`) that the widgets depend on.

Every field is optional — anything you omit falls back to the base `nexxus` theme.

```tsx
import { NexxusProvider, createNexxusSystem, type NexxusThemeConfig } from "@nexxus/react";

const themeConfig: NexxusThemeConfig = {
  colors: {
    primary: "#0f766e",   // brand — a single hex auto-expands to a 50–950 scale
    secondary: "#d97706",  // accent — drives buttons/links
    bg: "#fbfaf6",         // page background
    bgSubtle: "#f3efe6",   // section panels
    cardBg: "#ffffff",     // widget card surface (PSP cards)
    fg: "#1c1917",         // body text
    heading: "#0f766e",    // heading color
  },
  fonts: { heading: "Georgia, serif", body: "Verdana, sans-serif" },
  button: { borderRadius: "9999px", textTransform: "uppercase" },
};

const system = createNexxusSystem(themeConfig);

function App() {
  return (
    <NexxusProvider theme={system}>
      {/* fully custom-themed widgets */}
    </NexxusProvider>
  );
}
```

The same wrapper pattern lets a host app expose a `themeConfig` prop and build the system internally, so callers pass a plain object:

```tsx
function MyPSPPage({ themeConfig, themeVariant }: {
  themeConfig?: NexxusThemeConfig;
  themeVariant?: ThemeVariantName;
}) {
  const theme = themeConfig
    ? createNexxusSystem(themeConfig)
    : (themeVariant && themeVariants[themeVariant]) || nexxusThemeSystem;
  return (
    <NexxusProvider theme={theme}>
      <PSPComponent brandId="..." />
    </NexxusProvider>
  );
}
```

> Precedence in the wrapper: `themeConfig` (full custom config) **>** `themeVariant` (named preset) **>** base theme. Re-mount the provider (via a `key`) when the theme changes so the shadow root's CSS variables are cleanly re-injected.

### `NexxusThemeConfig` reference

| Section | Field | Type | Description |
| --- | --- | --- | --- |
| `colors` | `primary` | `string \| Record<string,string>` | Brand color. A single hex derives a 50–950 palette; a full record gives exact control. |
| | `secondary` | `string \| Record<string,string>` | Accent color used by buttons/links. |
| | `bg` | `string` | Page background. |
| | `bgSubtle` | `string` | Subtle/panel background (section boxes). |
| | `cardBg` | `string` | Widget card surface (e.g. PSP cards). Defaults to the muted background. |
| | `fg` | `string` | Main foreground (body text). |
| | `fgMuted` | `string` | Muted foreground (secondary text, captions). |
| | `border` | `string` | Default border color. |
| | `heading` | `string` | Heading text color. |
| `fonts` | `heading` / `body` / `mono` | `string` | Font-family stacks. `body` is also wired to `--default-font-family` and `--global-font-body` so it wins over the bundled preflights. |
| `headingSizes` | `xl \| l \| m \| s \| xs` | `string` | Overrides the `display-*` heading size tokens. |
| `textSizes` | `l \| m \| s \| xs` | `string` | Overrides the `text-*` body size tokens. |
| `label` | `color`, `fontSize`, `fontWeight`, `textTransform`, `letterSpacing` | — | Form label (`Field.Label`) look & feel across all widgets. Applied with `!important` so it wins over per-component inline label styling. |
| `button` | `borderRadius`, `fontWeight`, `textTransform` | — | Shared button shape/typography. |
| | `bg`, `color`, `hoverBg` | `string` | Solid-variant colors. |
| | `outlineColor` | `string` | Outline/ghost variant accent (defaults to `bg`). |
| | `sizes` | `{ sm?, md?, lg? }` | Per-size `{ fontSize, paddingX, paddingY }` overrides for the button scale. |

### Customizing the card surface

Widget cards (such as the PSP cards) read the `bg.card` semantic token. Set `colors.cardBg` to make every card a solid color — e.g. white cards on a tinted page background:

```tsx
const themeConfig: NexxusThemeConfig = {
  colors: { bg: "#f3efe6", cardBg: "#ffffff" },
};
```

A complete, annotated `NexxusThemeConfig` example (colors, fonts, sizes, label and button styling) lives in the [dev sandbox sample files](./dev-sandbox.md#custom-theme-ts).

---

## Theme Configuration (internals)

The base system is built with `defineConfig` using the following structure:

- **tokens** - Raw design tokens (colors, fonts, spacing)
- **semanticTokens** - Theme-aware tokens that adapt to light/dark mode
- **recipes** - Component-level styling recipes
- **globalCss** - Global styles

Note the Shadow-DOM wiring: `cssVarsRoot` and `preflight` are scoped to `:host` so the system applies inside the shadow root only (see [Shadow DOM Isolation](#shadow-dom-isolation)). `createNexxusSystem()` produces an equivalent config from a `NexxusThemeConfig` object.

### theme.ts

```ts
import { createSystem, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react'

const config = defineConfig({
  cssVarsRoot: ':where(:root, :host)',
  cssVarsPrefix: 'ck',
  preflight: { scope: ':host' }, // scoped to the shadow root
  globalCss: { /* ... */ },
  theme: {
    tokens: { /* ... */ },
    semanticTokens: { /* ... */ },
    recipes: { /* ... */ },
  },
})

const systemTheme = mergeConfigs(defaultConfig, config)
export const nexxusThemeSystem = createSystem(systemTheme)
```

---

## Global CSS

```ts
globalCss: {
  'html, body': {
    margin: 0,
    padding: 0,
    fontFamily: 'body',
    lineHeight: 'base',
    bg: 'bg',
    color: 'fg',
    transition: 'background-color 0.2s, color 0.2s',
  },
  'html[dir="rtl"]': { direction: 'rtl' },
  'html[dir="ltr"]': { direction: 'ltr' },
  '*': { borderColor: 'border' },
  '*, *::before, *::after': { boxSizing: 'border-box' },
  'input[type="password"]': {
    fontFamily: 'monospace !important',
    letterSpacing: '0.1em',
    fontSize: '1.2em',
    '&::placeholder': {
      fontFamily: 'body !important',
      letterSpacing: 'normal',
      fontSize: 'inherit',
    },
  },
}
```

---

## Tokens

### Fonts

| Token | Value | Usage |
| --- | --- | --- |
| `heading` | Sora, system-ui, sans-serif | Headings, titles |
| `body` | Sora, Lexend, system-ui, sans-serif | Body text |
| `mono` | ui-monospace, SFMono-Regular, ... | Code blocks |
| `accent` | Poppins, system-ui, sans-serif | Accent text |

### Font Sizes

| Token | Value | Pixels |
| --- | --- | --- |
| `display-xl` | 4.5rem | 72px |
| `display-l` | 3.75rem | 60px |
| `display-m` | 3rem | 48px |
| `display-s` | 2.25rem | 36px |
| `display-xs` | 1.875rem | 30px |
| `text-l` | 1.125rem | 18px |
| `text-m` | 1rem | 16px |
| `text-s` | 0.875rem | 14px |
| `text-xs` | 0.75rem | 12px |
| `button-l` | 1rem | 16px |
| `button-m` | 0.875rem | 14px |
| `button-s` | 0.75rem | 12px |
| `caption` | 0.75rem | 12px |

### Font Weights

| Token | Value |
| --- | --- |
| `light` | 300 |
| `regular` | 400 |
| `medium` | 500 |
| `semi-bold` | 600 |
| `bold` | 700 |

### Line Heights

| Token | Value |
| --- | --- |
| `display-xl` | 1.1 |
| `display-l` | 1.1 |
| `display-m` | 1.2 |
| `display-s` | 1.2 |
| `display-xs` | 1.3 |
| `text-l` | 1.6 |
| `text-m` | 1.5 |
| `text-s` | 1.4 |
| `text-xs` | 1.4 |
| `button` | 1.2 |
| `caption` | 1.3 |

---

## Color Palettes

Six color palettes, each with shades 50-950:

| Palette | Description | Range |
| --- | --- | --- |
| `primary` | Deep blue | `#f6f9ff` - `#002666` |
| `secondary` | Light blue | `#fafdff` - `#0e3b5d` |
| `success` | Green | `#f0fdf4` - `#052e16` |
| `warning` | Amber | `#fffbeb` - `#451a03` |
| `error` | Red | `#fef2f2` - `#450a0a` |
| `neutral` | Gray (includes shade `10`) | `#ffffff` - `#09090b` |

<details>
<summary>Full color token values</summary>

```ts
colors: {
  primary: {
    50: { value: '#f6f9ff' },
    100: { value: '#ecf2ff' },
    200: { value: '#dde9ff' },
    300: { value: '#c6daff' },
    400: { value: '#a7c6ff' },
    500: { value: '#70a3ff' },
    600: { value: '#528fff' },
    700: { value: '#2d77ff' },
    800: { value: '#1165ff' },
    900: { value: '#0040b3' },
    950: { value: '#002666' },
  },
  secondary: {
    50: { value: '#fafdff' },
    100: { value: '#f0f9ff' },
    200: { value: '#e4f4fe' },
    300: { value: '#caeaff' },
    400: { value: '#b2e0ff' },
    500: { value: '#7acaff' },
    600: { value: '#51b9ff' },
    700: { value: '#0099ff' },
    800: { value: '#0874c5' },
    900: { value: '#0d629b' },
    950: { value: '#0e3b5d' },
  },
  success: {
    50: { value: '#f0fdf4' },  100: { value: '#dcfce7' },
    200: { value: '#bbf7d0' }, 300: { value: '#86efac' },
    400: { value: '#4ade80' }, 500: { value: '#22c55e' },
    600: { value: '#16a34a' }, 700: { value: '#15803d' },
    800: { value: '#166534' }, 900: { value: '#14532d' },
    950: { value: '#052e16' },
  },
  warning: {
    50: { value: '#fffbeb' },  100: { value: '#fef3c7' },
    200: { value: '#fde68a' }, 300: { value: '#fcd34d' },
    400: { value: '#fbbf24' }, 500: { value: '#f59e0b' },
    600: { value: '#d97706' }, 700: { value: '#b45309' },
    800: { value: '#92400e' }, 900: { value: '#78350f' },
    950: { value: '#451a03' },
  },
  error: {
    50: { value: '#fef2f2' },  100: { value: '#fee2e2' },
    200: { value: '#fecaca' }, 300: { value: '#fca5a5' },
    400: { value: '#f87171' }, 500: { value: '#ef4444' },
    600: { value: '#dc2626' }, 700: { value: '#b91c1c' },
    800: { value: '#991b1b' }, 900: { value: '#7f1d1d' },
    950: { value: '#450a0a' },
  },
  neutral: {
    10: { value: '#ffffff' },  50: { value: '#fafafa' },
    100: { value: '#f4f4f5' }, 200: { value: '#e4e4e7' },
    300: { value: '#d4d4d8' }, 400: { value: '#c8c8c8' },
    500: { value: '#71717a' }, 600: { value: '#585858' },
    700: { value: '#3f3f46' }, 800: { value: '#27272a' },
    900: { value: '#18181b' }, 950: { value: '#09090b' },
  },
}
```

</details>

---

## Semantic Tokens

Semantic tokens automatically adapt between light and dark modes.

### Background Tokens

| Token | Light | Dark |
| --- | --- | --- |
| `bg` | `neutral.10` | `neutral.900` |
| `bg.subtle` | `neutral.50` | `neutral.800` |
| `bg.panel` | `neutral.50` | `neutral.900` |
| `bg.muted` | `white` | `neutral.800` |
| `bg.card` | `bg.muted` | `bg.muted` (widget card surface; override with `colors.cardBg`) |
| `bg.emphasized` | `neutral.100` | `neutral.700` |
| `bg.inverted` | `neutral.900` | `neutral.50` |

### Foreground Tokens

| Token | Light | Dark |
| --- | --- | --- |
| `fg` | `neutral.900` | `neutral.50` |
| `fg.muted` | `neutral.600` | `neutral.400` |
| `fg.subtle` | `neutral.500` | `neutral.500` |
| `fg.inverted` | `neutral.50` | `neutral.900` |
| `fg.error` | `error.600` | `error.400` |
| `fg.warning` | `warning.600` | `warning.400` |
| `fg.success` | `success.600` | `success.400` |

### Border Tokens

| Token | Light | Dark |
| --- | --- | --- |
| `border` | `neutral.200` | `neutral.700` |
| `border.muted` | `neutral.400` | `neutral.800` |
| `border.subtle` | `neutral.100` | `neutral.800` |
| `border.emphasized` | `neutral.200` | `neutral.800` |
| `border.inverted` | `neutral.800` | `neutral.200` |
| `border.error` | `error.500` | `error.800` |

### Primary/Secondary Semantic Tokens

Each color group (`primary`, `secondary`, `success`, `warning`, `error`) provides:

| Token suffix | Purpose |
| --- | --- |
| `.solid` | Solid background |
| `.contrast` | Text on solid background |
| `.fg` | Foreground accent |
| `.muted` | Subtle background |
| `.subtle` | Very subtle background |
| `.emphasized` | Emphasized background |
| `.focusRing` | Focus ring color |
| `.bg` | Background tint |
| `.border` | Border accent |

---

## Recipes

### Button Recipe

Three variants with three sizes:

| Variant | Description |
| --- | --- |
| `solid` | Filled background (default) |
| `outline` | Border only |
| `ghost` | No background |

| Size | Font Size | Padding |
| --- | --- | --- |
| `sm` | `button-s` | Compact |
| `md` | `button-m` | Standard (default) |
| `lg` | `button-l` | Spacious |

### Heading Recipe

```ts
heading: {
  base: {
    fontFamily: 'heading',
    color: 'heading',
    fontWeight: 'semibold',
  }
}
```

---

## i18n (Internationalization)

`@nexxus/react` includes built-in i18n support powered by `i18next` and `react-i18next`.

### Built-in Languages

The library ships bundles for three languages out of the box:

| Code | Language | Direction |
| --- | --- | --- |
| `en` | English | LTR |
| `es` | Spanish | LTR |
| `ar` | Arabic | RTL |

Any **other** language can be added by the host app at runtime via the `translations` prop — the library does not need to be modified. See [App-provided languages](#app-provided-languages-eg-hindi) below.

### Setup

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";

<NexxusProvider theme={nexxusThemeSystem} defaultLanguage="en">
  {/* App content */}
</NexxusProvider>
```

### Choosing the language: props vs. helper

There are two ways to drive language, and they serve different purposes:

- **`defaultLanguage` (on `NexxusProvider`)** and the per-widget **`language` prop** are the recommended, declarative path. Pass the language you want and the widgets follow it. Omit them and the widgets keep the previously detected/selected language, falling back to English for any namespace that doesn't provide the active language.
- **`changeLanguage(lng)` helper** switches the language imperatively at runtime. Note it is **typed to the built-in union** (`'en' | 'es' | 'ar'`) — for app-registered languages (like Hindi) use the `language`/`defaultLanguage` props instead, which accept any string.

```tsx
// Declarative — widget follows the prop (accepts any registered language)
<PSPComponent language="es" brandId="..." />
```

Internally each widget applies its `language` prop through the `useComponentLanguage(language?)` hook, which calls the raw i18next instance so it accepts any registered language, not just the built-in union.

### App-provided languages (e.g. Hindi)

To add a language the library doesn't ship — or to override built-in strings — the host app supplies translation bundles through the `translations` prop. Bundles are keyed **language → namespace → strings** and registered with i18next at runtime (deep-merged over the built-ins):

```tsx
import { NexxusProvider, type NexxusTranslations } from "@nexxus/react";

const hindiTranslations: NexxusTranslations = {
  hi: {
    common: { save: "सहेजें", cancel: "रद्द करें" /* … */ },
    psp: { details: "PSP विवरण", description: "विवरण" /* … */ },
  },
};

<NexxusProvider
  theme={nexxusThemeSystem}
  defaultLanguage="hi"
  translations={hindiTranslations}
>
  {/* widgets now render Hindi where bundles are provided, English elsewhere */}
</NexxusProvider>
```

This keeps languages **owned by the app**, not hardcoded in the library. A complete Hindi bundle used by the dev sandbox is shown in the [sample files](./dev-sandbox.md#translations-hi-ts).

### Language Utilities

```tsx
import {
  changeLanguage,
  getCurrentLanguage,
  getLanguageDisplayName,
  isRTL,
  useTranslation,
} from "@nexxus/react";

// Change language at runtime
changeLanguage('es');

// Check current language
const lang = getCurrentLanguage(); // 'en'
const name = getLanguageDisplayName('ar'); // 'Arabic'
const rtl = isRTL('ar'); // true
```

### Component Translations

Each component package can register its own translation namespace:

```tsx
import {
  registerComponentTranslations,
  useComponentTranslation,
  setupComponentTranslations,
} from "@nexxus/react";

// Register translations for a component
registerComponentTranslations('myComponent', {
  en: { title: 'My Component', save: 'Save' },
  es: { title: 'Mi Componente', save: 'Guardar' },
  ar: { title: 'مكوني', save: 'حفظ' },
});

// Use in a component
function MyComponent() {
  const { t } = useComponentTranslation('myComponent');
  return <h1>{t('title')}</h1>;
}
```

### Toast Notifications

```tsx
import { useToast } from "@nexxus/react";

function MyComponent() {
  const toast = useToast();

  const handleSave = () => {
    toast.success({ title: "Saved", description: "Changes saved." });
    // Also: toast.error(), toast.warning(), toast.info(), toast.loading()
  };
}
```

---

## Usage Examples

### Using Tokens

```tsx
<Text fontFamily="body" fontSize="text-m" fontWeight="regular">
  Body text using design tokens
</Text>

<Heading fontFamily="heading" fontSize="display-m" fontWeight="bold">
  Heading using design tokens
</Heading>
```

### Using Semantic Tokens

```tsx
<Box bg="bg" color="fg" borderColor="border">
  Automatically adapts to light/dark mode
</Box>

<Box bg="primary.muted" color="primary.fg" borderColor="primary.border">
  Primary color semantic tokens
</Box>

<Text color="fg.error">Error message</Text>
<Text color="fg.success">Success message</Text>
<Text color="fg.warning">Warning message</Text>
```

### Using Color Palettes Directly

```tsx
<Box bg="primary.500">Primary 500</Box>
<Box bg="secondary.700">Secondary 700</Box>
<Box bg="success.600">Success 600</Box>
<Box bg="warning.500">Warning 500</Box>
<Box bg="error.600">Error 600</Box>
<Box bg="neutral.100">Neutral 100</Box>
```

---

## Exports Reference

| Export | Description |
| --- | --- |
| `NexxusProvider` | Theme + i18n provider component (Shadow DOM wrapped) |
| `nexxusThemeSystem` | Default theme system |
| `themeVariants` | Object with all theme variants |
| `ThemeVariantName` | Union type of variant names |
| `createNexxusSystem` | Builds a Chakra system from a `NexxusThemeConfig` object |
| `NexxusThemeConfig` | Type for the advanced, serializable theme config |
| `NexxusTranslations` | Type for app-provided translation bundles (`lang → namespace → strings`) |
| `Toaster` | Toast notification renderer |
| `useToast` | Hook for triggering toasts |
| `changeLanguage` | Switch language at runtime |
| `getCurrentLanguage` | Get active language code |
| `getLanguageDisplayName` | Get language display name |
| `isRTL` | Check if language is RTL |
| `useTranslation` | i18next translation hook |
| `useComponentTranslation` | Component-scoped translation hook |
| `registerComponentTranslations` | Register component translations |
| `setupComponentTranslations` | Batch-register translations |
