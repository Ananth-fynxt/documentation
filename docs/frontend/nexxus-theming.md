# Nexxus Theming System

The Nexxus theme is built on Chakra UI v3's recipe system using `defineConfig` and `createSystem` APIs. It includes design tokens, semantic tokens, component recipes, theme variants, and built-in i18n support.

---

## Installation

```bash
npm install @nexxus/react @chakra-ui/react @emotion/react
```

---

## Quick Start

Wrap your application with the Nexxus provider:

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";

function App() {
  return (
    <NexxusProvider value={nexxusThemeSystem}>
      {/* Your application */}
    </NexxusProvider>
  );
}
```

---

## NexxusProvider Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `SystemContext` | Yes | Theme system (e.g., `nexxusThemeSystem` or a variant). |
| `defaultLanguage` | `'en' \| 'es' \| 'ar'` | No | Sets the default i18n language. Initializes i18next on mount. |
| `children` | `ReactNode` | Yes | Application content. |

The provider wraps your app with `ChakraProvider` and renders a `<Toaster />` for toast notifications.

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
    <NexxusProvider value={themeVariants.ocean}>
      {/* Themed with ocean palette */}
    </NexxusProvider>
  );
}
```

All variants share the same typography, success/warning/error/neutral palettes, and semantic token structure. Only the primary and secondary palettes differ.

---

## Theme Configuration

The theme uses `defineConfig` with the following structure:

- **tokens** - Raw design tokens (colors, fonts, spacing)
- **semanticTokens** - Theme-aware tokens that adapt to light/dark mode
- **recipes** - Component-level styling recipes
- **globalCss** - Global styles

### theme.ts

```ts
import { createSystem, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react'

const config = defineConfig({
  cssVarsRoot: ':where(:root, :host)',
  cssVarsPrefix: 'ck',
  preflight: false,
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

### Supported Languages

| Code | Language | Direction |
| --- | --- | --- |
| `en` | English | LTR |
| `es` | Spanish | LTR |
| `ar` | Arabic | RTL |

### Setup

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";

<NexxusProvider value={nexxusThemeSystem} defaultLanguage="en">
  {/* App content */}
</NexxusProvider>
```

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
| `NexxusProvider` | Theme + i18n provider component |
| `nexxusThemeSystem` | Default theme system |
| `themeVariants` | Object with all theme variants |
| `ThemeVariantName` | Union type of variant names |
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
