# Nexxus Theming System

The Nexxus theme is built on Chakra UI v3's recipe system using `defineConfig` and `createSystem` APIs.

---

## Installation

```bash
npm install @nexxus/react @chakra-ui/react
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

## Theme Configuration

Use the `theme` config property to define the system theme. This property accepts the following properties:

- **tokens**: for defining design tokens (colors, fonts, spacing, etc.)
- **semanticTokens**: for defining theme-aware semantic tokens
- **recipes**: for defining component recipes
- **slotRecipes**: for defining component slot recipes

### theme.ts

```ts
import { createSystem, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react'

const config = defineConfig({
  cssVarsRoot: ':where(:root, :host)',
  cssVarsPrefix: 'ck',
  globalCss: {
    // Global styles
  },
  theme: {
    tokens: {
      // Design tokens
    },
    semanticTokens: {
      // Theme-aware tokens
    },
    recipes: {
      // Component recipes
    },
  },
})

const systemTheme = mergeConfigs(defaultConfig, config)
export const nexxusThemeSystem = createSystem(systemTheme)
```

---

## Global CSS

Use the `globalCss` property to define global styles applied to the entire application.

### globalCss

```ts
const config = defineConfig({
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
    'html[dir="rtl"]': {
      direction: 'rtl',
    },
    'html[dir="ltr"]': {
      direction: 'ltr',
    },
    '*': {
      borderColor: 'border',
    },
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
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
  },
})
```

---

## Tokens

Use the `tokens` property to define raw design tokens. Tokens are the foundation of the design system.

### tokens.fonts

Define font families used across the application.

```ts
const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Sora, system-ui, sans-serif' },
        body: { value: 'Sora, Lexend, system-ui, sans-serif' },
        mono: {
          value: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
        accent: { value: 'Poppins, system-ui, sans-serif' },
      },
    },
  },
})
```

| Token | Value | Usage |
| --- | --- | --- |
| `heading` | Sora, system-ui, sans-serif | Headings, titles |
| `body` | Sora, Lexend, system-ui, sans-serif | Body text |
| `mono` | ui-monospace, SFMono-Regular... | Code blocks |
| `accent` | Poppins, system-ui, sans-serif | Accent text |

---

### tokens.fontSizes

Define font sizes for display text, body text, and buttons.

```ts
const config = defineConfig({
  theme: {
    tokens: {
      fontSizes: {
        // Display Sizes (Sora)
        'display-xl': { value: '4.5rem' },   // 72px
        'display-l': { value: '3.75rem' },   // 60px
        'display-m': { value: '3rem' },      // 48px
        'display-s': { value: '2.25rem' },   // 36px
        'display-xs': { value: '1.875rem' }, // 30px

        // Text Sizes (Lexend)
        'text-l': { value: '1.125rem' },     // 18px
        'text-m': { value: '1rem' },         // 16px
        'text-s': { value: '0.875rem' },     // 14px
        'text-xs': { value: '0.75rem' },     // 12px

        // Button Sizes
        'button-l': { value: '1rem' },       // 16px
        'button-m': { value: '0.875rem' },   // 14px
        'button-s': { value: '0.75rem' },    // 12px

        // Caption
        caption: { value: '0.75rem' },       // 12px
      },
    },
  },
})
```

---

### tokens.fontWeights

Define font weight values.

```ts
const config = defineConfig({
  theme: {
    tokens: {
      fontWeights: {
        light: { value: '300' },
        regular: { value: '400' },
        medium: { value: '500' },
        'semi-bold': { value: '600' },
        bold: { value: '700' },
      },
    },
  },
})
```

---

### tokens.lineHeights

Define line height values for display and body text.

```ts
const config = defineConfig({
  theme: {
    tokens: {
      lineHeights: {
        // Display line heights (tight)
        'display-xl': { value: '1.1' },
        'display-l': { value: '1.1' },
        'display-m': { value: '1.2' },
        'display-s': { value: '1.2' },
        'display-xs': { value: '1.3' },

        // Text line heights (comfortable)
        'text-l': { value: '1.6' },
        'text-m': { value: '1.5' },
        'text-s': { value: '1.4' },
        'text-xs': { value: '1.4' },

        // Button & caption
        button: { value: '1.2' },
        caption: { value: '1.3' },
      },
    },
  },
})
```

---

### tokens.colors

Define raw color palettes. Each palette includes shades from 50 to 950.

```ts
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Primary Deep Blue
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

        // Secondary Light Blue
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

        // Success Green
        success: {
          50: { value: '#f0fdf4' },
          100: { value: '#dcfce7' },
          200: { value: '#bbf7d0' },
          300: { value: '#86efac' },
          400: { value: '#4ade80' },
          500: { value: '#22c55e' },
          600: { value: '#16a34a' },
          700: { value: '#15803d' },
          800: { value: '#166534' },
          900: { value: '#14532d' },
          950: { value: '#052e16' },
        },

        // Warning Amber
        warning: {
          50: { value: '#fffbeb' },
          100: { value: '#fef3c7' },
          200: { value: '#fde68a' },
          300: { value: '#fcd34d' },
          400: { value: '#fbbf24' },
          500: { value: '#f59e0b' },
          600: { value: '#d97706' },
          700: { value: '#b45309' },
          800: { value: '#92400e' },
          900: { value: '#78350f' },
          950: { value: '#451a03' },
        },

        // Error Red
        error: {
          50: { value: '#fef2f2' },
          100: { value: '#fee2e2' },
          200: { value: '#fecaca' },
          300: { value: '#fca5a5' },
          400: { value: '#f87171' },
          500: { value: '#ef4444' },
          600: { value: '#dc2626' },
          700: { value: '#b91c1c' },
          800: { value: '#991b1b' },
          900: { value: '#7f1d1d' },
          950: { value: '#450a0a' },
        },

        // Neutral Gray
        neutral: {
          10: { value: '#ffffff' },
          50: { value: '#fafafa' },
          100: { value: '#f4f4f5' },
          200: { value: '#e4e4e7' },
          300: { value: '#d4d4d8' },
          400: { value: '#c8c8c8' },
          500: { value: '#71717a' },
          600: { value: '#585858' },
          700: { value: '#3f3f46' },
          800: { value: '#27272a' },
          900: { value: '#18181b' },
          950: { value: '#09090b' },
        },
      },
    },
  },
})
```

---

## Semantic Tokens

Use the `semanticTokens` property to define theme-aware tokens that automatically adapt between light and dark modes.

### semanticTokens.colors

```ts
const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        // Background colors
        bg: {
          value: { base: '{colors.neutral.10}', _dark: '{colors.neutral.900}' },
        },
        'bg.subtle': {
          value: { base: '{colors.neutral.50}', _dark: '{colors.neutral.800}' },
        },
        'bg.panel': {
          value: { base: '{colors.neutral.50}', _dark: '{colors.neutral.900}' },
        },
        'bg.muted': {
          value: { base: '{colors.white}', _dark: '{colors.neutral.800}' },
        },
        'bg.emphasized': {
          value: { base: '{colors.neutral.100}', _dark: '{colors.neutral.700}' },
        },
        'bg.inverted': {
          value: { base: '{colors.neutral.900}', _dark: '{colors.neutral.50}' },
        },

        // Foreground colors
        fg: {
          value: { base: '{colors.neutral.900}', _dark: '{colors.neutral.50}' },
        },
        'fg.muted': {
          value: { base: '{colors.neutral.600}', _dark: '{colors.neutral.400}' },
        },
        'fg.subtle': {
          value: { base: '{colors.neutral.500}', _dark: '{colors.neutral.500}' },
        },
        'fg.inverted': {
          value: { base: '{colors.neutral.50}', _dark: '{colors.neutral.900}' },
        },
        'fg.error': {
          value: { base: '{colors.error.600}', _dark: '{colors.error.400}' },
        },
        'fg.warning': {
          value: { base: '{colors.warning.600}', _dark: '{colors.warning.400}' },
        },
        'fg.success': {
          value: { base: '{colors.success.600}', _dark: '{colors.success.400}' },
        },

        // Border colors
        border: {
          value: { base: '{colors.neutral.200}', _dark: '{colors.neutral.700}' },
        },
        'border.muted': {
          value: { base: '{colors.neutral.400}', _dark: '{colors.neutral.800}' },
        },
        'border.subtle': {
          value: { base: '{colors.neutral.100}', _dark: '{colors.neutral.800}' },
        },
        'border.emphasized': {
          value: { base: '{colors.neutral.200}', _dark: '{colors.neutral.800}' },
        },
        'border.inverted': {
          value: { base: '{colors.neutral.800}', _dark: '{colors.neutral.200}' },
        },
        'border.error': {
          value: { base: '{colors.error.500}', _dark: '{colors.error.800}' },
        },

        // Heading color
        heading: {
          value: { base: '{colors.neutral.600}', _dark: '{colors.neutral.50}' },
        },

        // Primary semantic tokens
        primary: {
          value: { base: '{colors.primary.950}', _dark: '{colors.primary.50}' },
        },
        'primary.solid': {
          value: { base: '{colors.primary.950}', _dark: '{colors.primary.50}' },
        },
        'primary.contrast': {
          value: { base: '{colors.white}', _dark: '{colors.neutral.900}' },
        },
        'primary.fg': {
          value: { base: '{colors.primary.600}', _dark: '{colors.primary.400}' },
        },
        'primary.muted': {
          value: { base: '{colors.primary.50}', _dark: '{colors.primary.950}' },
        },
        'primary.subtle': {
          value: { base: '{colors.primary.100}', _dark: '{colors.primary.900}' },
        },
        'primary.emphasized': {
          value: { base: '{colors.primary.200}', _dark: '{colors.primary.800}' },
        },
        'primary.focusRing': {
          value: { base: '{colors.primary.600}', _dark: '{colors.primary.500}' },
        },
        'primary.bg': {
          value: { base: '{colors.primary.50}', _dark: '{colors.primary.950}' },
        },
        'primary.border': {
          value: { base: '{colors.primary.300}', _dark: '{colors.primary.800}' },
        },

        // Secondary semantic tokens
        'secondary.solid': {
          value: { base: '{colors.secondary.700}', _dark: '{colors.secondary.500}' },
        },
        'secondary.contrast': {
          value: { base: '{colors.white}', _dark: '{colors.neutral.900}' },
        },
        'secondary.fg': {
          value: { base: '{colors.secondary.600}', _dark: '{colors.secondary.400}' },
        },
        'secondary.muted': {
          value: { base: '{colors.secondary.50}', _dark: '{colors.secondary.950}' },
        },
        'secondary.subtle': {
          value: { base: '{colors.secondary.100}', _dark: '{colors.secondary.900}' },
        },
        'secondary.emphasized': {
          value: { base: '{colors.secondary.200}', _dark: '{colors.secondary.800}' },
        },
        'secondary.focusRing': {
          value: { base: '{colors.secondary.600}', _dark: '{colors.secondary.500}' },
        },
        'secondary.bg': {
          value: { base: '{colors.secondary.50}', _dark: '{colors.secondary.950}' },
        },
        'secondary.border': {
          value: { base: '{colors.secondary.300}', _dark: '{colors.secondary.800}' },
        },

        // Success semantic tokens
        'success.solid': {
          value: { base: '{colors.success.600}', _dark: '{colors.success.500}' },
        },
        'success.contrast': {
          value: { base: '{colors.white}', _dark: '{colors.neutral.900}' },
        },
        'success.fg': {
          value: { base: '{colors.success.600}', _dark: '{colors.success.400}' },
        },
        'success.muted': {
          value: { base: '{colors.success.50}', _dark: '{colors.success.950}' },
        },
        'success.subtle': {
          value: { base: '{colors.success.100}', _dark: '{colors.success.900}' },
        },
        'success.emphasized': {
          value: { base: '{colors.success.200}', _dark: '{colors.success.800}' },
        },
        'success.focusRing': {
          value: { base: '{colors.success.600}', _dark: '{colors.success.500}' },
        },

        // Warning semantic tokens
        'warning.solid': {
          value: { base: '{colors.warning.500}', _dark: '{colors.warning.500}' },
        },
        'warning.contrast': {
          value: { base: '{colors.neutral.900}', _dark: '{colors.neutral.900}' },
        },
        'warning.fg': {
          value: { base: '{colors.warning.600}', _dark: '{colors.warning.400}' },
        },
        'warning.muted': {
          value: { base: '{colors.warning.50}', _dark: '{colors.warning.950}' },
        },
        'warning.subtle': {
          value: { base: '{colors.warning.100}', _dark: '{colors.warning.900}' },
        },
        'warning.emphasized': {
          value: { base: '{colors.warning.200}', _dark: '{colors.warning.800}' },
        },
        'warning.focusRing': {
          value: { base: '{colors.warning.500}', _dark: '{colors.warning.500}' },
        },

        // Error semantic tokens
        'error.solid': {
          value: { base: '{colors.error.600}', _dark: '{colors.error.500}' },
        },
        'error.contrast': {
          value: { base: '{colors.white}', _dark: '{colors.neutral.900}' },
        },
        'error.fg': {
          value: { base: '{colors.error.600}', _dark: '{colors.error.400}' },
        },
        'error.muted': {
          value: { base: '{colors.error.50}', _dark: '{colors.error.950}' },
        },
        'error.subtle': {
          value: { base: '{colors.error.100}', _dark: '{colors.error.900}' },
        },
        'error.emphasized': {
          value: { base: '{colors.error.200}', _dark: '{colors.error.800}' },
        },
        'error.focusRing': {
          value: { base: '{colors.error.600}', _dark: '{colors.error.500}' },
        },
      },
    },
  },
})
```

---

## Recipes

Use the `recipes` property to define component-level styling recipes.

### recipes.heading

```ts
import { defineStyle } from '@chakra-ui/react'

const headingRecipe = defineStyle({
  base: {
    fontFamily: 'heading',
    color: 'heading',
    fontWeight: 'semibold',
  },
})

const config = defineConfig({
  theme: {
    recipes: {
      heading: headingRecipe,
    },
  },
})
```

### recipes.button

```ts
import { buttonRecipe } from './button.recipe'

const config = defineConfig({
  theme: {
    recipes: {
      button: buttonRecipe,
    },
  },
})
```

---

## Complete Theme File

```ts
// theme.ts
import { createSystem, defaultConfig, defineConfig, defineStyle, mergeConfigs } from '@chakra-ui/react'
import { buttonRecipe } from './button.recipe'

const headingRecipe = defineStyle({
  base: {
    fontFamily: 'heading',
    color: 'heading',
    fontWeight: 'semibold',
  },
})

const config = defineConfig({
  cssVarsRoot: ':where(:root, :host)',
  cssVarsPrefix: 'ck',
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
  },
  theme: {
    recipes: {
      button: buttonRecipe,
      heading: headingRecipe,
    },
    tokens: {
      fonts: {
        heading: { value: 'Sora, system-ui, sans-serif' },
        body: { value: 'Sora, Lexend, system-ui, sans-serif' },
        mono: { value: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
        accent: { value: 'Poppins, system-ui, sans-serif' },
      },
      fontSizes: {
        'display-xl': { value: '4.5rem' },
        'display-l': { value: '3.75rem' },
        'display-m': { value: '3rem' },
        'display-s': { value: '2.25rem' },
        'display-xs': { value: '1.875rem' },
        'text-l': { value: '1.125rem' },
        'text-m': { value: '1rem' },
        'text-s': { value: '0.875rem' },
        'text-xs': { value: '0.75rem' },
        'button-l': { value: '1rem' },
        'button-m': { value: '0.875rem' },
        'button-s': { value: '0.75rem' },
        caption: { value: '0.75rem' },
      },
      fontWeights: {
        light: { value: '300' },
        regular: { value: '400' },
        medium: { value: '500' },
        'semi-bold': { value: '600' },
        bold: { value: '700' },
      },
      lineHeights: {
        'display-xl': { value: '1.1' },
        'display-l': { value: '1.1' },
        'display-m': { value: '1.2' },
        'display-s': { value: '1.2' },
        'display-xs': { value: '1.3' },
        'text-l': { value: '1.6' },
        'text-m': { value: '1.5' },
        'text-s': { value: '1.4' },
        'text-xs': { value: '1.4' },
        button: { value: '1.2' },
        caption: { value: '1.3' },
      },
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
          50: { value: '#f0fdf4' },
          100: { value: '#dcfce7' },
          200: { value: '#bbf7d0' },
          300: { value: '#86efac' },
          400: { value: '#4ade80' },
          500: { value: '#22c55e' },
          600: { value: '#16a34a' },
          700: { value: '#15803d' },
          800: { value: '#166534' },
          900: { value: '#14532d' },
          950: { value: '#052e16' },
        },
        warning: {
          50: { value: '#fffbeb' },
          100: { value: '#fef3c7' },
          200: { value: '#fde68a' },
          300: { value: '#fcd34d' },
          400: { value: '#fbbf24' },
          500: { value: '#f59e0b' },
          600: { value: '#d97706' },
          700: { value: '#b45309' },
          800: { value: '#92400e' },
          900: { value: '#78350f' },
          950: { value: '#451a03' },
        },
        error: {
          50: { value: '#fef2f2' },
          100: { value: '#fee2e2' },
          200: { value: '#fecaca' },
          300: { value: '#fca5a5' },
          400: { value: '#f87171' },
          500: { value: '#ef4444' },
          600: { value: '#dc2626' },
          700: { value: '#b91c1c' },
          800: { value: '#991b1b' },
          900: { value: '#7f1d1d' },
          950: { value: '#450a0a' },
        },
        neutral: {
          10: { value: '#ffffff' },
          50: { value: '#fafafa' },
          100: { value: '#f4f4f5' },
          200: { value: '#e4e4e7' },
          300: { value: '#d4d4d8' },
          400: { value: '#c8c8c8' },
          500: { value: '#71717a' },
          600: { value: '#585858' },
          700: { value: '#3f3f46' },
          800: { value: '#27272a' },
          900: { value: '#18181b' },
          950: { value: '#09090b' },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: { base: '{colors.neutral.10}', _dark: '{colors.neutral.900}' } },
        fg: { value: { base: '{colors.neutral.900}', _dark: '{colors.neutral.50}' } },
        'fg.muted': { value: { base: '{colors.neutral.600}', _dark: '{colors.neutral.400}' } },
        'fg.subtle': { value: { base: '{colors.neutral.500}', _dark: '{colors.neutral.500}' } },
        border: { value: { base: '{colors.neutral.200}', _dark: '{colors.neutral.700}' } },
        heading: { value: { base: '{colors.neutral.600}', _dark: '{colors.neutral.50}' } },
        // ... more semantic tokens
      },
    },
  },
})

const systemTheme = mergeConfigs(defaultConfig, config)
export const nexxusThemeSystem = createSystem(systemTheme)
```

---

## Usage

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

### Using Color Palettes

```tsx
<Box bg="primary.500">Primary 500</Box>
<Box bg="secondary.700">Secondary 700</Box>
<Box bg="success.600">Success 600</Box>
<Box bg="warning.500">Warning 500</Box>
<Box bg="error.600">Error 600</Box>
<Box bg="neutral.100">Neutral 100</Box>
```
