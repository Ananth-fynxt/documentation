---
title: Identity — FI, Users & Onboarding
description: Financial Institution, platform Users, and the onboarding chain.
---

# Identity — Financial Institution, Users & Onboarding

Covers the two identity primitives that sit **above and beneath** the Brand: the **Financial Institution (FI)** (the top of the tenancy tree) and the platform **User** (the credential record every human/role attaches to). Also the onboarding flow that ties FI → Brand → Environment → User together.

## 1. Financial Institution (FI)

### What
An **FI** is the top-level operator tenant — a financial institution / payment company that owns one or more **Brands**. Where a Brand is a merchant, the FI is the organization running the Nexxus deployment segment above those merchants.

### Why
Multi-tenancy needs a root. The FI scope grants unrestricted, cross-brand access (an FI operator can onboard/impersonate any brand under it). Brand-name uniqueness is enforced *per FI*, so two FIs can each have a brand named "Acme".

### Where
- Backend: `fynxt.brand.fi` — `entity/Fi`, `controller/FiController`, `service`.
- Table: `fi`.
- Referenced by: `Brand.fiId` (FK → `fi.id`); `BrandServiceImpl.verifyFiExists`; login scope resolution (`AuthServiceImpl` → `fiService.findByUserId`).

### How — data model (`fi` table)
| Field | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | `Short` / SMALLINT (PK) | small id space — FIs are few |
| `name` | `name` | text NOT NULL | |
| `email` | `email` | text NOT NULL | |
| `userId` | `user_id` | Integer | the platform `User` that logs in as this FI |
| `scope` | `scope` | enum `scope` | fixed `FI` |
| `status` | `status` | enum `user_status` | default `ACTIVE` |

### API
| Method | Path | Scope | Body | Notes |
|---|---|---|---|---|
| POST | `/fi` | `@RequiresScope({"FI"})` | `FiDto` (`@NotNull @Validated`) | create an FI. This is the only FI endpoint — FIs are provisioned rarely, listing/editing is out of band. |

### Use case — FI login determines everything downstream
On login, `AuthServiceImpl.buildUserInfo` calls `fiService.findByUserId(userId)` **first**. If a row exists, the user is an **FI-scope** user: the JWT carries `fi_id`, `fi_name`, and a `brands[]` claim (every brand under the FI). That claim is what lets the frontend show the brand selector / impersonation UI (`pages/brand/list.tsx` → `BrandImpersonateModal`).

---

## 2. Platform User

### What
A **User** is the bare credential record — an email + password — that authentication runs against. It is deliberately minimal; *roles and tenancy live elsewhere* (`brand_users`, `fi`). One User can be an FI operator, a brand operator, or both, depending on which linking rows point at it.

### Why
Decoupling "who can log in" (User) from "what they can do" (BrandUser + BrandRole, or FI) means a person is provisioned once and granted access in many brands/environments without duplicating credentials.

### Where
- Backend: `fynxt.brand.user` — `entity/User`, `service/UserService` (+ impl). **No REST controller** in this service.
- Table: `users` (`id` Integer PK, `email` text UNIQUE NOT NULL, `password` text NOT NULL).
- Created by: `BrandUserServiceImpl.create` (via `userService.createUser`). Consumed by: `AuthServiceImpl` (login/refresh), `BrandUserAuthenticationServiceImpl`.

### How — provisioning (`UserServiceImpl.createUser`)
1. Called when a **Brand User is created** (see section 3). Input `UserRequest{ email }`.
2. Generates a random 16-char password (`PasswordUtil`, `SecureRandom`), encrypts it (AES/GCM via `CryptoUtil`), stores in `users.password`.
3. Sends a `welcome-email` template (the `email` lib) so the new operator can set/receive credentials.
4. Returns the created user's id, which `BrandUser.userId` is set to.

Other methods: `updatePassword(userId, {currentPassword, newPassword})` — decrypt-compare current, re-encrypt new (`INVALID_CREDENTIALS 1008` on mismatch); `findByEmailForAuthentication`, `findByIdForAuthentication` (used by the auth flow).

### Password handling — important
Passwords are stored **reversibly encrypted (AES/GCM), not one-way hashed**. Login (`validateUserPassword`) decrypts and string-compares. See section 4 (Auth) for the full security discussion and the `CryptoUtil` default-key caveat. Frontend password-lifecycle endpoints (`/users/forgot-password`, `/users/reset-password/{token}`, `/users/accept-invite/{token}`) are called by `UserService` on the frontend but are served by a different service (not this `brand` service).

---

## 3. Onboarding — how identity, tenancy and access connect

### What & Why
Onboarding is the sequence that turns "a new merchant" into a fully working tenant with credentials and at least one operator. It threads every identity primitive together.

### How — the chain (with the auto-provisioning side effects)
```
Create FI (POST /fi)                       → fi row (+ its login User)
   │
Onboard Brand (POST /brands, FI scope)     → brands row
   │   └─ auto-creates default "Production" Environment (secret+token generated)
   │
Create Brand Role (POST /brand-roles)      → brand_roles row (JSON permission map)
   │
Assign Brand User (POST /brand-users)      → brand_users row
       └─ auto-creates platform User (random pwd + welcome-email)
           → that User can now log in with BRAND scope,
             JWT carries accessible_brands[] with the roleId per environment
```
Each auto-provisioning step is detailed in section 3 (Brand) §5.1 / §5.4 and section 2 above. The net effect: after these four calls a merchant has a tenant, an environment with API credentials (surfaced once as `apiKey`), a permission role, and a login-capable operator.

### Where — frontend
- `pages/onboard/onboard.tsx` — the onboarding surface for FI/SYSTEM users (guarded so FI users land here first, see `utils/auth-guard.ts`).
- `pages/brand/list.tsx` — "Onboard Brand" action; impersonation to enter a brand's context.
- `pages/user-management/` — manage brand users & roles once inside a brand.

### Use case — end-to-end operator provisioning
1. FI operator logs in (FI scope) → routed to `/onboard`.
2. Onboards a brand → backend creates brand + default Production environment; response returns the environment `apiKey` (the only time it's shown).
3. Creates a brand role with a permission JSON (e.g. `{ "psps": {"actions":["read","create"]}, ... }`).
4. Assigns a brand user (email) → backend creates the `users` row + emails the welcome template; the user is linked to the role under (brand, env).
5. New operator logs in (BRAND scope) → JWT `accessible_brands[]` includes the brand/env/roleId → RBAC now gates their console actions (section 4).
