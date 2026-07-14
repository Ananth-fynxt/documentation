---
title: Coverage & Framework
description: How to read the Nexxus platform docs — what/why/where/how framework and full module coverage matrix.
---

# How to Read This Guide — Framework & Coverage

This guide documents **the entire Nexxus platform as implemented today** — backend (`fynxt.brand.*` Spring Boot service + shared libs) and frontend (React admin console + payment widget). Every section answers the same five questions so you can navigate consistently.

## The What / Why / Where / How framework

Each module section is written to answer:

| Question | What it tells you |
|---|---|
| **What** | The concept in domain terms — what this thing *is* to a merchant/operator, not just the class name. |
| **Why** | The business reason it exists; the problem it solves in the payment flow. |
| **Where** | Exact source locations — backend package, DB tables, frontend pages/services — so you can jump to code. |
| **How** | The mechanics — request → validation → service logic → persistence → response; the algorithm or state machine; frontend ↔ backend collaboration. |
| **Validations** | Every bean-validation annotation, business rule, uniqueness constraint, and error code. |
| **Use cases** | Concrete end-to-end traces (frontend action → API → DB, or PSP callback → orchestrator → webhook). |

## Coverage matrix — implemented vs documented

Every backend package (controller base path) and every frontend area, mapped to the section that covers it.

| Backend package | Base path | Documented in section |
|---|---|---|
| `fi` | `/fi` | 2 — Identity, FI, Users & Onboarding |
| `user` | (no controller) | 2 — Identity, FI, Users & Onboarding |
| `brand` | `/brands` | 3 — Brand, Environment & Tenancy |
| `environment` | `/environments` | 3 |
| `brandrole` | `/brand-roles` | 3 + 4 (RBAC) |
| `branduser` | `/brand-users` | 3 + 4 |
| `auth` | `/auth` | 4 — Authentication & Authorization |
| `permission` | `/permissions` | 4 |
| `session` | `/sessions` | 4 |
| `psp` | `/psps` | 5 — PSP & Fetch-PSP |
| `pspgroup` | `/psp-groups` | 5 |
| `routingrule` | `/routing-rules` | 5 |
| `riskrule` | `/risk-rules` | 5 |
| `fee` | `/fees` | 5 |
| `request` | `/requests` | 6 — Request Domain & Fetch-PSP Persistence |
| `flow` | `/flow-types`, `/flow-targets`, `/flow-actions`, `/flow-definitions` | 7 — Flow Engine & Deno VM |
| `denovm` (lib) | — | 7 |
| `transaction` | `/transactions` | 8 — Transaction Lifecycle |
| `transactionlimit` | `/transaction-limits` | 8 |
| `external` | `/external` | 9 — External API, Callbacks & Webhooks |
| `webhook` | `/webhooks` | 9 |
| `health` | `/health` | 10 — Frontend + Ops appendix |
| Frontend (`frontend/src`) | — | 10 — Frontend Architecture |
| Widget (`widget/src`) | — | 10 |

**Nothing implemented is left undocumented.** Config/bootstrap packages (`config`, `BrandApplication`) and generated code are intentionally omitted.

## Reading paths

- **New engineer onboarding:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 (linear; each builds on the last).
- **Merchant integrator:** 6 (fetch-psp) → 8 (create transaction) → 9 (callbacks/webhooks) → 5 (which PSPs, why).
- **Admin-console developer:** 10 (frontend) → 3 (brand) → 5 (PSP config) → 4 (auth/RBAC).
- **Debugging a live payment:** 8 (orchestrator states) → 7 (VM execution) → 9 (callback handling).

## One-paragraph mental model

A **Financial Institution** onboards **Brands** (merchant tenants); each brand has **Environments** holding API credentials. Operators (identified by **Users**, authorized by **Brand Roles** via JWT + RBAC) configure **PSPs** and the **routing / risk / fee / limit** rules that decide *which* PSP a payment may use. At runtime a merchant calls **fetch-psp** with a payment intent; the **Request** domain resolves eligible PSPs through a filter pipeline and snapshots the decision. The merchant then **creates a Transaction**, which the **orchestrator** drives through a data-defined **Flow** whose per-PSP JavaScript runs sandboxed in the **Deno VM** to talk to the real gateway. The PSP calls back via the **External API**; the orchestrator advances the transaction to a terminal state and fires **outbound webhooks** to the merchant. The **frontend** admin console drives all configuration; the **widget** renders the hosted checkout from a transaction session.
