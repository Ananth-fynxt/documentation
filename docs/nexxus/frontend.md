---
title: Frontend Architecture
description: React admin console, stores, api layer, widget, and backend collaboration.
---

# Frontend Architecture & Backend Collaboration

How the React admin console and the payment widget are structured, and exactly how the frontend collaborates with the backend on every call (headers, auth, error handling, data fetching). Per-module frontend details live in each module's section; this section is the **cross-cutting map**.

## 1. What & Why

The frontend is a **single-page admin console** (`frontend/`) plus a separate **hosted-checkout widget** (`widget/`). The console is where operators do every configuration task documented in sections 2–9; it never touches the database directly — every action is an authenticated REST call to the `brand` service. The widget is the end-user-facing payment page rendered from a transaction **session**.

## 2. Where — structure

```
frontend/src/
├── api/                      ← the entire backend-collaboration layer
│   ├── axios-instance.ts       apiClient (authed) + publicApiClient
│   ├── api-client.ts           typed request wrapper (ApiRequestConfig, toasts)
│   ├── auth-interceptor.ts     401 handling + single-flight refresh
│   ├── endpoints.ts            central endpoint registry (resolveEndpoint)
│   ├── services/               one service class per domain (brands, psp, fee, …)
│   └── service.types.ts
├── store/                    ← Zustand global state
│   ├── auth.store.ts           tokens + user (persisted "auth-storage")
│   ├── brand-environment.store.ts  selected brand/env (drives X-BRAND-ID/X-ENV-ID)
│   ├── network.store.ts        network/loading state
│   └── psp.store.ts            psp-screen state
├── routes/                   ← TanStack Router route tree (file-based, __root, $, per-area)
├── pages/                    ← screens: brand, psp, rules, conversion-rate,
│                                transaction-request, transactions, configuration,
│                                dashboard, user-management, login, onboard
├── context/                  ← AuthProvider (rehydrate + silent refresh)
├── hooks/  components/  helpers/  utils/  data/  recipes/  styles/  theme.ts
└── i18next.d.ts              ← i18n typing (localized labels/validation)

widget/src/                   ← separate Vite app: App.tsx, main.tsx, app/
```

## 3. How — the backend-collaboration layer (`api/`)

### 3.1 Two axios instances (`axios-instance.ts`)
Shared `baseURL = VITE_API_BASE_URL` (default `https://api.nexxus.fynxt.io/nexxus/v1`).
- **`apiClient`** (authenticated) — request interceptor injects:
  - `Authorization: Bearer <accessToken>` (from `auth.store`),
  - `X-BRAND-ID` + `X-ENV-ID` (from `brand-environment.store`) **only if they are valid UUIDs** (placeholder ids are filtered out).
- **`publicApiClient`** — brand/env headers only, no Bearer. Used for login/refresh (`isPublic: true`).

These headers are the whole tenancy mechanism: the backend's `BrandEnvironmentContextFilter` reads them to resolve the active tenant + role permissions (section 4 §3.3). The frontend therefore never puts brandId/envId in request bodies for role/user/psp/rule calls.

### 3.2 Typed request wrapper (`api-client.ts`)
`ApiRequestConfig{ method, url, data?, isPublic?, showSuccessToast?, showErrorToast?, successMessage?, errorMessage?, customErrorHandler? }`. Normalizes the backend envelope `ApiResponse{ data, message, status, error }` and centralizes toast behaviour. Success codes accepted: `"0000"` and `"200"`.

### 3.3 Endpoint registry (`endpoints.ts`)
All paths live in one `API_ENDPOINTS` object; services call `resolveEndpoint(API_ENDPOINTS, [...path], args)` to build URLs (e.g. `BRANDS.LIST_BY_FI_ID` → `/brands/by-fi/{fiId}`). Single source of truth for the surface documented across sections 2–9.

### 3.4 Services (`api/services/*.service.ts`)
One class per domain — `brands`, `environment`, `brand-roles`, `brand-users`, `psp`, `psp-group`, `flow`, `routing-rules`, `risk`, `rule`, `fee`, `transaction`, `transaction-limits`, `webhook`, `user`, `permissions`, `system`. Each maps 1:1 to a backend controller. Because tenancy is header-driven, service methods usually take only the meaningful payload.

### 3.5 401/refresh (`auth-interceptor.ts`)
Response interceptor → `AuthInterceptorService.handleAuthError`: acts **only on 401**; single-flight token refresh with a `failedQueue` that replays queued requests after refresh; on refresh failure → `resetAuth()` + redirect `/login`. **403 is not intercepted** — permission-denied surfaces as a toast (see section 4 §8.3). Full trace in section 4.

## 4. How — state, routing, forms

### 4.1 Global state (Zustand)
- `auth.store` — `persist`-ed to localStorage `"auth-storage"`: tokens, expiries, `user`, scope predicates (`isSystemUser/isBrandUser/isFIUser`), impersonation flags.
- `brand-environment.store` — the currently selected brand + environment; changing it changes `X-BRAND-ID`/`X-ENV-ID` on every subsequent call, effectively switching tenant context live.
- `network.store`, `psp.store` — UI/loading and psp-screen local concerns.

### 4.2 Routing & guards (TanStack Router, `routes/`, `utils/auth-guard.ts`)
File-based route tree (`__root.tsx`, `$.tsx` catch-all, per-area folders). Guards:
- `requireAuth()` — redirect unauthenticated to `/login` (saving `nexus-auth-redirect`); FI/SYSTEM users (not impersonating) confined to `/onboard` + `/brands/list`.
- `requireNoAuth()` — keep authenticated users off `/login`.
- `AuthProvider` (`context/auth-context.tsx`) — rehydrates on load; silently refreshes if the access token is expired but the refresh token is still valid.

### 4.3 Data fetching
**TanStack Query** everywhere: query keys are namespaced per domain (e.g. `brandQueryKeys.all`) and include brand/env so switching tenant refetches. Mutations invalidate the relevant keys on success and update `auth.store` where the brand list changes.

### 4.4 Forms & validation
**Zod schemas** (per module `validation/*.validation.ts`) + a shared `useCommonForm` (react-hook-form, mode `onChange`). Submit is gated on `isDirty && isValid`. Frontend validation **mirrors but sometimes tightens** backend rules — noted per module (e.g. brand email required on FE though optional on BE; webhook retry limited to 1–3 vs backend 0–10).

### 4.5 i18n & theming
`i18next` for localized labels and validation messages (`i18next.d.ts`); `theme.ts` + `styles/` for the design system. The rich-text PSP description editor (recent commit) supports localization.

## 5. The Widget (`widget/`)

### What & Why
A separate lightweight Vite/React app that renders the **hosted checkout** — the page an end user sees after a transaction is initiated. It is decoupled from the admin console so it can be embedded/hosted independently and kept minimal.

### How
The transaction flow produces a `sessionUrl = apiProperties.widgetUrl() + "/" + token` (section 8 §7.1). The widget loads that token and calls `GET /sessions/{token}` (section 4 §4c) to decode the transaction data (gzip+base64url payload), then drives the payment UI. Session lifecycle (5-min default, expiry/validation) is the auth-session infrastructure in section 4.

## 6. Ops appendix — Health

`HealthController` (`/health`): `GET /health` and `POST /health` return an `ApiResponse` liveness signal. It is a `public-path` (no auth) so load balancers / uptime checks can hit it. This is the only operational endpoint in the service; everything else is business API.

## 7. Use case — one console action, end to end (create a routing rule)
1. Operator (brand scope) selected brand+env → `brand-environment.store` holds them.
2. Fills the rule form (`pages/rules/…`), Zod validates, submit enabled on dirty+valid.
3. `RoutingRulesService.createRoutingRule(payload)` → `apiClient` `POST /routing-rules` with `Authorization: Bearer`, `X-BRAND-ID`, `X-ENV-ID` auto-attached.
4. Backend: `JwtAuthenticationStrategy` (valid ACCESS token, DB-active) → `BrandEnvironmentContextFilter` resolves roleId + permissions → `@RequiresScope({"FI","BRAND"})` + `@RequiresPermission(routing_rules, create)` → `RoutingRuleServiceImpl.create` inserts version 1.
5. Success → TanStack Query invalidates routing-rule keys → list refetches → toast "Created". A 403 (missing permission) would instead surface as an error toast without redirect.
