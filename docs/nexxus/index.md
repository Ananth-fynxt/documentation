---
title: Nexxus Platform — Overview
description: Architecture overview of the Nexxus multi-tenant payments / PSP-orchestration platform.
---

# Nexxus Platform — Architecture Overview

Developer documentation for the **Nexxus** multi-tenant payments / PSP-orchestration platform. This is the entry point; each module has its own detailed document (linked below).

---

## 1. What Nexxus Is

Nexxus is a **payment orchestration platform**. Merchants (brands) integrate once; Nexxus routes each payment to the best-fit **PSP** (Payment Service Provider / acquirer) based on configurable **risk rules**, **transaction limits**, **PSP configuration** (maintenance, IP, failure-rate), **routing rules**, and computes **fees** — then drives the payment through a data-defined **flow** executed in a sandboxed **Deno VM**, and notifies the merchant via **webhooks**.

---

## 2. Repository Layout

```
nexxus/
├── backend/
│   ├── services/brand/        ← the single Spring Boot service (all business logic)
│   │   └── src/main/java/fynxt/brand/
│   │       ├── brand/  environment/  brandrole/  branduser/   (tenancy)
│   │       ├── auth/  session/  permission/                   (authn/authz)
│   │       ├── psp/  pspgroup/  flow/  routingrule/  riskrule/  fee/  (routing)
│   │       ├── transaction/  transactionlimit/                (payments)
│   │       ├── request/  external/  webhook/                  (external API)
│   │       ├── user/  fi/  health/  config/
│   │       └── BrandApplication.java
│   └── libs/                   ← shared Spring Boot auto-config libraries
│       ├── auth/  jwt/  permission/   (security)
│       ├── common/  database/  mapper/  otel/  email/  scheduler/  denovm/
├── frontend/                   ← React + TanStack Router + TanStack Query + Zustand
│   └── src/{api, pages, store, context, components, hooks, ...}
├── widget/                     ← hosted-payment widget (session-based checkout UI)
└── pipelines/                  ← Azure CI/CD
```

**Key fact:** there is exactly **one** backend service (`brand`). All modules are packages inside it; "modules" are logical, not separate deployables.

---

## 3. Technology Stack

| Layer | Tech |
|---|---|
| Backend | Java, Spring Boot, Spring Security, Spring Data JPA / Hibernate (+ Envers auditing), MapStruct, Lombok, Gradle |
| DB | PostgreSQL (custom enum types, jsonb, TEXT[] arrays, partial unique indexes; Liquibase changelogs) |
| Auth | JWT (JJWT, HMAC-SHA) + DB-backed token store; AOP RBAC |
| Scripting | Deno VM (sandboxed per-PSP JavaScript) via `denovm` lib |
| Async | db-scheduler (`com.github.kagkarlsson`) for webhook delivery |
| Caching | Caffeine (flow config + flow-target lookups) |
| Frontend | React, TanStack Router + Query, Zustand (persisted), Zod, Axios, i18next |

---

## 4. Cross-Cutting Conventions

- **Package shape** per module: `controller / dto / entity / repository / service (+ service/impl, service/mappers)`.
- **Response envelope**: every endpoint returns `ApiResponse<Object>` = `{ timestamp, code, message, data }` (`ResponseBuilder`). Success code `"0000"`.
- **Global path prefix**: `/nexxus/v1` (added by `SecurityConfig`).
- **Tenancy headers**: `X-BRAND-ID` + `X-ENV-ID` select the active brand/environment; auto-injected by the frontend axios interceptor, read by `BrandEnvironmentContextFilter` into a thread-local.
- **Soft delete + auditing**: entities extend `AuditingEntity` (`created/updated/deleted at/by`); repositories filter `deleted_at IS NULL`.
- **Versioned rules**: routing/risk/fee/psp-group/transaction-limit and transactions use composite `(id/txnId, version)` PKs; "update" inserts a new version, keeping full history.
- **Error codes**: numeric codes in `fynxt.common.enums.ErrorCode` (e.g. `1011 AUTH_INVALID_CREDENTIALS`, `1043 TRANSACTION_NOT_FOUND`), thrown as `AppException`/`ResponseStatusException`.
- **Three auth mechanisms** by header: `X-ADMIN-TOKEN` (bypass), `X-SECRET-TOKEN` (machine/merchant), `Authorization: Bearer` (user JWT). Scopes: `FI`, `BRAND`, `EXTERNAL`.

---

## 5. Domain Hierarchy

```
Financial Institution (FI)
 └── Brand (tenant)
       └── Environment (Production/…, holds API secret+token, redirect URLs)
             ├── Brand Roles (JSON permission maps)      ─┐ RBAC
             ├── Brand Users (→ platform Users)          ─┘
             ├── PSPs (+ operations, maintenance windows)
             ├── PSP Groups
             ├── Routing / Risk / Fee / Transaction-Limit rules
             ├── Webhooks (outbound notification config)
             └── Requests → Transactions (versioned payment records)
```

---

## 6. The Two Main Runtime Flows

### 6.1 Merchant payment (server-to-server)
```
1. POST /requests/fetch-psp   (X-SECRET-TOKEN)   → PSP resolution + fee calc → { requestId, psps[] }
2. POST /transactions         → orchestrator: NEW→CREATED→INITIATED, Deno VM "initiate" → sessionUrl
3. User pays at PSP → PSP calls back:
     GET/POST /external/inbound/r/redirect/{token}/{txnId}   (browser 302)
     POST      /external/inbound/w/webhook/{token}/{txnId}   (server-to-server)
   → orchestrator advances: PG_ACCEPTED/PG_REJECTED → PG_SUCCESS/PG_FAILED → SUCCESS/FAILED
4. Platform → merchant outbound webhook (db-scheduler, retries)
```

### 6.2 Admin console (browser, JWT)
```
Login (POST /auth/login) → JWT access+refresh
→ select brand/env (X-BRAND-ID/X-ENV-ID)
→ CRUD brands, environments, PSPs, rules, fees, users, roles, webhooks
   (each gated by @RequiresScope + @RequiresPermission)
```

---

## 7. Module Documents

| # | Module | Doc | Covers |
|---|---|---|---|
| 02 | **Brand** | [02-brand-module.md](./brand) | Brand, Environment, Brand Role, Brand User — tenancy backbone |
| 03 | **Transaction** | [03-transaction-module.md](./transaction) | Versioned transaction records, orchestrator state machine, steps, limits |
| 04 | **PSP / Fetch-PSP** | [04-psp-fetch-psp-module.md](./psp-fetch-psp) | PSP config, routing/risk/fee rules, the fetch-psp resolution pipeline |
| 05 | **External API** | [05-external-api-module.md](./external-api) | Inbound PSP callbacks, merchant `/requests` API, outbound webhooks |
| 06 | **Auth** | [06-auth-module.md](./auth) | Login, JWT, sessions, RBAC scopes/permissions, token store |

---

## 8. How to Read This Documentation
- **New to the platform?** Read this overview, then Auth (06) → Brand (02) → PSP/Fetch-PSP (04) → Transaction (03) → External (05).
- **Integrating a merchant?** External API (05) + PSP/Fetch-PSP (04) §7 + Transaction (03) §7.
- **Building admin UI?** Brand (02) + PSP (04) + Auth (06) §7 (frontend integration sections).
- Each module doc ends with **Notable Observations / gotchas** worth reviewing before changing code.
