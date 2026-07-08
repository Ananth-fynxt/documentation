# Dev Sandbox & Sample Files

This page collects the working sample files from **`psp-test-app`** — a standalone Vite app used to develop and test the Nexxus widgets against live library source. It doubles as a copy-paste reference for integrating the widgets into a real host app: theme wiring (variants + advanced config), app-driven i18n (including a language the library doesn't ship), and API proxying with auth.

The sandbox renders the **real wrapper components** (`MyPSPPage`, `TransactionRulesPage`) and imports every `@nexxus/*` package straight from the library's `src`, so edits in the library or wrapper hot-reload instantly — no build/publish loop.

---

## How live reload works

The Vite dev server aliases each `@nexxus/*` package name to the library's source directories (reusing the library's own `createWorkspaceAliases()` helper). Because the source — not a built `dist/` — is what's imported, any change in `nexus-frontend-library/packages/*/src` or in the wrapper hot-updates in the browser.

- Third-party deps (Chakra, Emotion, TanStack Query, Tiptap, …) resolve from the **library's** `node_modules`, so nothing extra is installed in the sandbox and no private registry auth is needed.
- Only `react`/`react-dom` are shared, so they're deduped to a single copy.
- The private `@fynxt/language-provider` package is replaced with a local shim.
- Backend calls (`/api/nexus-adaptor/*`) are proxied to a real environment, with the `app_session` cookie injected server-side for auth.

---

## `vite.config.ts` {#vite-config-ts}

Package→source aliasing, the API proxy, and server-side session-cookie injection.

```ts
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
// Reuse the library's own alias helper so package -> source mappings stay in sync.
import {
  createWorkspaceAliases,
  workspacePackages,
} from "../nexus-frontend-library/vite.workspace.config";

const LIBRARY_ROOT = path.resolve(__dirname, "../nexus-frontend-library");
const WRAPPER_ROOT = path.resolve(__dirname, "../nexxus_ctrl_panel_wrapper");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const proxyTarget =
    env.VITE_PROXY_TARGET || "https://brand1.crm-int.fynxt.com";
  // Backend auth uses the `app_session` cookie, which the browser only has on
  // the real domain. Inject it server-side so localhost requests authenticate.
  const sessionCookie = env.VITE_APP_SESSION
    ? `app_session=${env.VITE_APP_SESSION}`
    : "";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        // @nexxus/* -> nexus-frontend-library/packages/*/src/lib (live HMR)
        ...createWorkspaceAliases(LIBRARY_ROOT),
        // Private Azure-feed package -> local dev shim
        {
          find: "@fynxt/language-provider",
          replacement: path.resolve(__dirname, "src/shims/language-provider.tsx"),
        },
        // Real wrapper source (PSPComponent.tsx etc.) -> live HMR too
        { find: "@wrapper", replacement: path.resolve(WRAPPER_ROOT, "src") },
      ],
      // Both this app and the aliased library source import react — force one copy.
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 5199,
      fs: {
        // Vite must be allowed to serve files from both sibling repos.
        allow: [__dirname, LIBRARY_ROOT, WRAPPER_ROOT],
      },
      proxy: {
        // Widgets call `${window.location.origin}/api/nexus-adaptor/...`
        "/api/nexus-adaptor": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          // Attach the session cookie to every proxied request.
          ...(sessionCookie && { headers: { cookie: sessionCookie } }),
        },
      },
    },
    optimizeDeps: {
      // Aliased-to-source packages must never be prebundled.
      exclude: Object.keys(workspacePackages),
    },
  };
});
```

---

## `src/App.tsx` {#app-tsx}

Wires up the theme selector (variants + `custom`), language selector (`default`/`en`/`es`/`ar`/`hi`), and a tiny history router. The key detail is how it forwards `themeConfig`/`themeVariant`, `language`, and `translations` to the wrapper widgets.

```tsx
import { useEffect, useState } from "react";
import MyPSPPage from "@wrapper/components/PSPComponent";
import TransactionRulesPage from "@wrapper/components/TransactionRulesComponent";
import { themeVariants, type ThemeVariantName } from "@nexxus/react";
import { BRAND_ID } from "./config";
import { customThemeConfig } from "./custom-theme";
import { hindiTranslations } from "./translations/hi";

// "custom" applies the full NexxusThemeConfig (colors, fonts, sizes,
// label/button look & feel) via the widgets' `themeConfig` prop; the named
// entries are the library's preset variants.
type ThemeChoice = ThemeVariantName | "custom";

// "default" = don't pass a language prop; widgets keep the detected/current
// language (falling back to English). en/es/ar ship with the library; hi is
// app-owned (src/translations/hi.ts) and injected via `translations`.
type LanguageChoice = "default" | "en" | "es" | "ar" | "hi";

export default function App() {
  const [theme, setTheme] = useState<ThemeChoice>("nexxus");
  const [languageChoice, setLanguageChoice] = useState<LanguageChoice>("default");

  // themeConfig (full custom config) takes precedence; otherwise pass a variant name.
  const themeProps =
    theme === "custom"
      ? { themeConfig: customThemeConfig }
      : { themeVariant: theme };

  const language = languageChoice === "default" ? undefined : languageChoice;

  return (
    <MyPSPPage
      brandId={BRAND_ID}
      {...themeProps}
      language={language}
      translations={hindiTranslations}
    />
  );
}
```

> The full sandbox `App.tsx` also renders a top bar with the theme/language `<select>`s (persisted to `localStorage`), a side-nav, and routing between `MyPSPPage` and `TransactionRulesPage`. The snippet above is trimmed to the integration-relevant parts.

---

## Custom theme — `src/custom-theme.ts` {#custom-theme-ts}

A complete, annotated `NexxusThemeConfig`. Every section is optional; remove anything to fall back to the base `nexxus` theme. See the [Theming Guide](./nexxus-theming.md#advanced-theme-configuration) for the full field reference.

```ts
import type { NexxusThemeConfig } from "@nexxus/react";

export const customThemeConfig: NexxusThemeConfig = {
  colors: {
    // Brand palettes: a single hex auto-expands to a 50–950 scale,
    // or pass a full record { 50: "#…", …, 950: "#…" } for exact control.
    primary: "#0f766e",   // teal
    secondary: "#d97706", // amber — drives buttons/links
    bg: "#fbfaf6",        // page background (warm off-white)
    bgSubtle: "#f3efe6",  // section panels
    cardBg: "#ffffff",    // widget card surface (PSP cards)
    fg: "#1c1917",        // body text
    fgMuted: "#78716c",   // secondary text
    border: "#d6d3d1",
    heading: "#0f766e",   // heading text color
  },
  fonts: {
    heading: "Georgia, 'Times New Roman', serif",
    body: "Verdana, Geneva, sans-serif",
  },
  // Heading scale (maps to the display-xl/l/m/s/xs tokens)
  headingSizes: { m: "2.75rem", s: "2rem", xs: "1.6rem" },
  // Body text scale (maps to the text-l/m/s/xs tokens)
  textSizes: { l: "1.15rem", m: "1rem", s: "0.9rem", xs: "0.8rem" },
  // Form label look & feel (Field.Label across all widgets)
  label: {
    color: "#0f766e",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  // Button look & feel
  button: {
    borderRadius: "9999px", // pill buttons
    fontWeight: 600,
    textTransform: "uppercase",
    bg: "#0f766e",          // solid variant
    color: "#ffffff",
    hoverBg: "#115e59",
    outlineColor: "#0f766e", // outline/ghost variants
    sizes: {
      sm: { fontSize: "0.7rem", paddingX: "4", paddingY: "1.5" },
      md: { fontSize: "0.85rem", paddingX: "6", paddingY: "2.5" },
      lg: { fontSize: "1rem", paddingX: "8", paddingY: "3" },
    },
  },
};
```

---

## Hindi translations — `src/translations/hi.ts` {#translations-hi-ts}

Hindi is **not** shipped by the library — it lives with the app and is injected via `NexxusProvider`'s `translations` prop. Bundles are keyed **language → namespace → strings**. Below is the shape; the real file fills in every key for the `common` and `psp` namespaces.

```ts
import type { NexxusTranslations } from "@nexxus/react";

// `common` namespace — shared strings used by @nexxus/react widgets.
const common = {
  save: "सहेजें",
  cancel: "रद्द करें",
  delete: "हटाएं",
  edit: "संपादित करें",
  search: "खोजें",
  loading: "लोड हो रहा है...",
  // …
};

// `psp` namespace — mirrors the shape of the PSP component's en/es/ar bundles.
const psp = {
  details: "PSP विवरण",
  description: "विवरण",
  supportedCurrencies: "समर्थित मुद्राएँ",
  supportedCountries: "समर्थित देश",
  list: {
    enabledPSP: "सक्षम PSP",
    availablePSP: "उपलब्ध PSP",
    searchByPSPName: "PSP नाम से खोजें...",
    // …
  },
  // configuration, operation, limits, fees, risk, security, configModal, modals …
};

export const hindiTranslations: NexxusTranslations = {
  hi: { common, psp },
};
```

Select `hi` in the language dropdown and the widgets render Hindi wherever a bundle key exists, falling back to English elsewhere. To add another language, add another top-level key (`fr`, `de`, …) with the same namespace shape.

---

## `src/config.ts` {#config-ts}

```ts
export const BRAND_ID: string =
  (import.meta.env.VITE_BRAND_ID as string | undefined) ||
  "REPLACE_WITH_BRAND_ID";

export const PROXY_TARGET: string =
  (import.meta.env.VITE_PROXY_TARGET as string | undefined) ||
  "https://brand1.crm-int.fynxt.com";
```

---

## `src/shims/language-provider.tsx` {#shim-tsx}

Local stand-in for the private `@fynxt/language-provider` package so the sandbox needs no Azure-feed auth. Returning `""` from `translate()` makes the wrapper's `translate(key) || "English fallback"` pattern show its fallbacks.

```tsx
import type { ReactNode } from "react";

export function useTranslations(_namespace?: string) {
  return (_key: string): string => "";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default { useTranslations, LanguageProvider };
```

---

## `.env`

```bash
# Backend the Vite dev server proxies /api/nexus-adaptor/* to
VITE_PROXY_TARGET=https://brand1.crm-int.fynxt.com
# Brand to test with (required — page shows instructions until set)
VITE_BRAND_ID=
# Optional: app_session cookie value, injected into proxied requests for auth
VITE_APP_SESSION=
```

---

## Running

```bash
cd psp-test-app
npm install
npm run dev   # http://localhost:5199
```

Set `VITE_BRAND_ID` (and, for authenticated data, `VITE_APP_SESSION`) in `.env`, then edit any file under `nexus-frontend-library/packages/*/src` or the wrapper and watch it hot-reload.
