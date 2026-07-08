# NexxusProvider

`NexxusProvider` is the single wrapper every Nexxus widget needs. It applies the theme system, isolates styles in a Shadow DOM, registers i18n resources, and mounts the toast renderer. Wrap your app (or the subtree that renders Nexxus widgets) with it once.

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";

function App() {
  return (
    <NexxusProvider theme={nexxusThemeSystem}>
      {/* Nexxus widgets */}
    </NexxusProvider>
  );
}
```

> **Migration note:** earlier versions used `<NexxusProvider value={...}>`. The prop is now **`theme`**, and it is **optional** — omit it to use the base `nexxus` system. The old `value` prop is no longer read.

---

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `theme` | `SystemContext` | No | `nexxusThemeSystem` | Theme system: `nexxusThemeSystem`, a variant from `themeVariants`, or the result of `createNexxusSystem(config)`. |
| `defaultLanguage` | `string` | No | — | Initial i18n language. Built-ins: `'en' \| 'es' \| 'ar'`. Any other language works once its bundles are supplied via `translations`. |
| `translations` | `NexxusTranslations` | No | — | App-provided translation bundles, keyed `language → namespace → strings`. Registered with i18next at runtime (deep-merged over built-ins). |
| `disableShadowDom` | `boolean` | No | `false` | Render without the Shadow DOM root, falling back to document-level style injection. Use only for SSR/debugging. |
| `children` | `ReactNode` | Yes | — | Application content. |

`NexxusProvider` also accepts the remaining `ChakraProvider` props (except `value`, which is replaced by `theme`).

---

## What the provider does

On mount, `NexxusProvider`:

1. **Resolves the theme** — uses the `theme` prop, or falls back to `nexxusThemeSystem` when omitted.
2. **Registers app translations** — for each `translations` entry it calls `i18n.addResourceBundle(language, namespace, resources, /* deepMerge */ true, /* overwrite */ true)`, so app strings win over built-ins.
3. **Applies the language** — if `defaultLanguage` differs from the current language, it calls `i18n.changeLanguage(defaultLanguage)`.
4. **Wraps children in a Shadow DOM** (unless `disableShadowDom`) via the internal `ShadowProvider`, scoping all styles to `:host`.
5. **Mounts `<Toaster />`** so any widget can trigger toasts through `useToast()`.

---

## Theme resolution

Pass whichever system fits your needs:

```tsx
// 1. Default base theme — omit the prop entirely
<NexxusProvider>{children}</NexxusProvider>

// 2. A built-in variant
import { themeVariants } from "@nexxus/react";
<NexxusProvider theme={themeVariants.ocean}>{children}</NexxusProvider>

// 3. A fully custom system from a NexxusThemeConfig
import { createNexxusSystem } from "@nexxus/react";
const system = createNexxusSystem({ colors: { primary: "#0f766e" } });
<NexxusProvider theme={system}>{children}</NexxusProvider>
```

See the [Theming Guide](./nexxus-theming.md) for variants, tokens, and the full `NexxusThemeConfig` reference.

### Re-mount when the theme changes

Because the theme's CSS variables are injected into the shadow root, switch themes by **re-mounting** the provider with a changing `key`. This guarantees the new theme's variables are cleanly re-injected with no stale styles from the previous theme:

```tsx
<NexxusProvider key={themeKey} theme={system}>
  {children}
</NexxusProvider>
```

---

## Shadow DOM isolation

By default children render inside a Shadow DOM so widget styles never leak into — or get overridden by — the host app's CSS. The Chakra system (CSS vars, preflight, global styles) is scoped to `:host`.

- Any CSS a widget needs must be injected **inside** the shadow root; stylesheets added to `document.head` won't reach the widgets.
- Set `disableShadowDom` to render with document-level styles instead — reserved for SSR or debugging.

```tsx
<NexxusProvider theme={nexxusThemeSystem} disableShadowDom>
  {children}
</NexxusProvider>
```

---

## Internationalization

`defaultLanguage` selects the starting language; `translations` adds or overrides bundles at runtime — this is how an app ships a language the library doesn't (e.g. Hindi) without modifying the library.

```tsx
import { NexxusProvider, type NexxusTranslations } from "@nexxus/react";

const translations: NexxusTranslations = {
  hi: {
    common: { save: "सहेजें", cancel: "रद्द करें" },
    psp: { details: "PSP विवरण", description: "विवरण" },
  },
};

<NexxusProvider
  theme={nexxusThemeSystem}
  defaultLanguage="hi"
  translations={translations}
>
  {children}
</NexxusProvider>
```

Individual widgets can also override the language per-instance via their `language` prop. See the [Theming Guide → i18n](./nexxus-theming.md#i18n-internationalization) for helpers, namespaces, and a full Hindi bundle.

---

## Full example

A host wrapper that exposes `themeVariant`, `themeConfig`, `language`, and `translations`, resolves the theme, and re-mounts the provider on change — the pattern used by the [dev sandbox](./dev-sandbox.md):

```tsx
import {
  NexxusProvider,
  createNexxusSystem,
  nexxusThemeSystem,
  themeVariants,
  type NexxusThemeConfig,
  type NexxusTranslations,
  type ThemeVariantName,
} from "@nexxus/react";
import { PSPComponent } from "@nexxus/psp";

function MyPSPPage({
  brandId,
  themeVariant,
  themeConfig,
  language,
  translations,
}: {
  brandId: string;
  themeVariant?: ThemeVariantName;
  themeConfig?: NexxusThemeConfig;
  language?: string;
  translations?: NexxusTranslations;
}) {
  // Precedence: themeConfig > themeVariant > base theme
  const theme = themeConfig
    ? createNexxusSystem(themeConfig)
    : (themeVariant && themeVariants[themeVariant]) || nexxusThemeSystem;

  const themeKey = themeConfig ? JSON.stringify(themeConfig) : themeVariant ?? "default";

  return (
    <NexxusProvider
      key={themeKey}          // re-mount so shadow-root CSS vars re-inject
      theme={theme}
      defaultLanguage={language}
      translations={translations}
    >
      <PSPComponent brandId={brandId} language={language} />
    </NexxusProvider>
  );
}
```

---

## Related exports

| Export | Description |
| --- | --- |
| `NexxusProvider` | The provider component (this page) |
| `nexxusThemeSystem` | Default theme system |
| `themeVariants` / `ThemeVariantName` | Built-in variant systems and their names |
| `createNexxusSystem` / `NexxusThemeConfig` | Build a system from a serializable config |
| `NexxusTranslations` | Type for app-provided translation bundles |
| `useToast` / `Toaster` | Trigger and render toasts |

See the [Theming Guide](./nexxus-theming.md) for tokens, palettes, recipes, and i18n details.
