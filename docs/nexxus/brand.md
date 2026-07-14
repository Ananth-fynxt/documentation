---
title: Brand, Environment & Tenancy
description: Brand, Environment, Brand Role and Brand User — the tenancy backbone.
---

# BRAND Module — Developer Documentation

The BRAND module is the tenancy backbone of the PSP orchestration platform. It lives in the `brand` service (`fynxt.brand.*`) and is composed of four tightly-related sub-domains: **Brand**, **Environment**, **Brand Role**, and **Brand User**. All entities extend a common `AuditingEntity` (soft-delete + auditing) and are exposed through Spring REST controllers guarded by scope/permission annotations.

---

## 1. Overview

A **Brand** is a merchant/tenant onboarded onto the orchestration platform. It optionally belongs to a **Financial Institution (FI)** (`fiId`) and is the top-level container under which everything else is scoped.

The domain hierarchy is:

```
FI (fi_id)
 └── Brand (UUID id, name, email)
       └── Environment (UUID id, name, secret, token, redirect URLs)   e.g. "Production"
             ├── Brand Role   (name + JSON permission set)
             └── Brand User   (name, email, linked platform user, role, scope, status)
```

Key roles of each concept:

- **Brand** — the tenant identity. Creating a brand automatically provisions a default `"Production"` environment.
- **Environment** — an isolated runtime context within a brand (holds API credentials: `secret` + `token`, plus origin and success/failure redirect URLs). Credentials are auto-generated UUIDs and can be rotated.
- **Brand Role** — an RBAC role scoped to a `(brandId, environmentId)` pair, carrying a JSON permission document (`jsonb`).
- **Brand User** — a person assigned to a `(brandId, environmentId)` with a role; on creation a platform-level `User` is provisioned via `UserService`.

Runtime brand/environment context is carried in the HTTP headers `X-BRAND-ID` and `X-ENV-ID` (injected automatically by the frontend axios instance), not in the request body, for the role/user endpoints.

---

## 2. Data Model

All four entities extend `AuditingEntity` (`fynxt.database.audit.AuditingEntity`, `@MappedSuperclass`, `@Audited` via Hibernate Envers), which contributes:

| Field | Column | Type | Notes |
|-------|--------|------|-------|
| `createdAt` | `created_at` | `TIMESTAMP` NOT NULL, not updatable | `@CreatedDate` |
| `updatedAt` | `updated_at` | `TIMESTAMP` NOT NULL | `@LastModifiedDate` |
| `deletedAt` | `deleted_at` | `TIMESTAMP` NULL | soft-delete marker |
| `createdBy` | `created_by` | `INTEGER` NOT NULL | `@CreatedBy` |
| `updatedBy` | `updated_by` | `INTEGER` NOT NULL | `@LastModifiedBy` |
| `deletedBy` | `deleted_by` | `INTEGER` NULL | set on soft-delete |

`softDelete()` sets `deletedAt = now()` and `deletedBy` (defaults to `0` in the no-arg overload); `restore()` clears both; `isDeleted()` returns `deletedAt != null`. Every repository query filters `deletedAt IS NULL` (except the `...WithDeleted` finders used for restore-on-recreate).

### 2.1 Brand — table `brands`

Entity: `fynxt.brand.brand.entity.Brand`

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| `id` | `id` | `UUID` | PK, `@GeneratedValue(UUID)` |
| `fiId` | `fi_id` | `Short` / `SMALLINT` | nullable, FK → `fi(id)` |
| `name` | `name` | `String` / `TEXT` | NOT NULL |
| `email` | `email` | `String` / `TEXT` | NOT NULL (column); DTO treats it as optional/`@Email` |

DDL (`002-create-core-tables.sql`): `fi_id SMALLINT REFERENCES fi(id)`.
Indexes:
- `idx_brands_fi_id` on `(fi_id)`
- `idx_brands_fi_name` UNIQUE on `(COALESCE(fi_id::text,''), name) WHERE deleted_at IS NULL` — brand name unique per FI (null-FI treated as empty)
- `brands_email_key` UNIQUE on `(email) WHERE deleted_at IS NULL`

### 2.2 Environment — table `environments`

Entity: `fynxt.brand.environment.entity.Environment`

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| `id` | `id` | `UUID` | PK, `@GeneratedValue(UUID)` |
| `name` | `name` | `String`/`TEXT` | NOT NULL |
| `secret` | `secret` | `UUID` | NOT NULL, UNIQUE — API key |
| `token` | `token` | `UUID` | NOT NULL, UNIQUE |
| `origin` | `origin` | `String`/`TEXT` | nullable |
| `successRedirectUrl` | `success_redirect_url` | `String`/`TEXT` | nullable |
| `failureRedirectUrl` | `failure_redirect_url` | `String`/`TEXT` | nullable |
| `brandId` | `brand_id` | `UUID` | NOT NULL, FK → `brands(id)` |

Indexes: `idx_environments_brand_id` on `(brand_id)`; `environments_secret_key` UNIQUE on `(secret) WHERE deleted_at IS NULL`; `environments_token_key` UNIQUE on `(token) WHERE deleted_at IS NULL`.

### 2.3 Brand Role — table `brand_roles`

Entity: `fynxt.brand.brandrole.entity.BrandRole` (DDL in `005-create-auth-tables.sql`)

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| `id` | `id` | `Integer` / `SERIAL` | PK, `@GeneratedValue(IDENTITY)` |
| `brandId` | `brand_id` | `UUID` | NOT NULL, FK → `brands(id)` |
| `environmentId` | `environment_id` | `UUID` | NOT NULL, FK → `environments(id)` |
| `name` | `name` | `String`/`TEXT` | NOT NULL |
| `permission` | `permission` | `JsonNode` / `JSONB` | NOT NULL, `@Type(JsonNodeJsonbType)` |

Indexes: `idx_brand_roles_brand_id` on `(brand_id, environment_id)`; `idx_brand_roles_brand_name_permission` UNIQUE on `(brand_id, environment_id, name) WHERE deleted_at IS NULL`.

### 2.4 Brand User — table `brand_users`

Entity: `fynxt.brand.branduser.entity.BrandUser`

| Field | Column | Type | Constraints |
|-------|--------|------|-------------|
| `id` | `id` | `Integer` / `SERIAL` | PK, `@GeneratedValue(IDENTITY)` |
| `brandId` | `brand_id` | `UUID` | FK → `brands(id)` (nullable in DDL) |
| `environmentId` | `environment_id` | `UUID` | FK → `environments(id)` (nullable) |
| `brandRoleId` | `brand_role_id` | `Integer` | FK → `brand_roles(id)` |
| `name` | `name` | `String`/`TEXT` | NOT NULL |
| `email` | `email` | `String`/`TEXT` | NOT NULL |
| `userId` | `user_id` | `Integer` | FK → `users(id)`, NOT NULL in DDL |
| `scope` | `scope` | `Scope` enum (`scope` PG type) | NOT NULL, default `BRAND` |
| `status` | `status` | `UserStatus` enum (`user_status` PG type) | NOT NULL, default `ACTIVE` |

Enums are mapped with `PostgreSQLEnumType`. Indexes: `idx_brand_users_brand_id` on `(brand_id, environment_id)`; `idx_brand_users_email` on `(email)`; `idx_brand_users_brand_name_email` UNIQUE on `(brand_id, environment_id, email) WHERE deleted_at IS NULL`.

---

## 3. REST API Endpoints

Responses are wrapped in `ApiResponse<Object>` (built by `ResponseBuilder`: `.created / .getAll / .get / .updated / .deleted`). Envelope shape (per frontend `BrandsApiResponse`): `{ timestamp, code, message, data }`.

### 3.1 BrandController — base path `/brands`

Class annotations: `@RequiresScope({"FI","BRAND"})`, `@Validated`. No per-method `@RequiresPermission`.

| Method | Path | Path/Query | Body (DTO) | Response `data` | Auth |
|--------|------|-----------|------------|-----------------|------|
| POST | `/brands` | — | `BrandDto` (required, `@Validated`) | `BrandDto` (+ generated `environments[]`) | scope FI/BRAND |
| GET | `/brands` | — | — | `List<BrandDto>` (all non-deleted) | scope FI/BRAND |
| GET | `/brands/by-fi/{fiId}` | path `fiId` (String, `@NotBlank`, parsed to `Short`) | — | `List<BrandDto>` | scope FI/BRAND |
| GET | `/brands/{id}` | path `id` (UUID) | — | `BrandDto` | scope FI/BRAND |
| PUT | `/brands/{id}` | path `id` (UUID) | `BrandDto` (`@NotNull @Validated`); `id` overwritten from path | `BrandDto` | scope FI/BRAND |
| DELETE | `/brands/{id}` | path `id` (UUID) | — | none (message only) | scope FI/BRAND |

**`BrandDto` fields** (`fynxt.brand.brand.dto.BrandDto`, `@JsonInclude(NON_NULL)`):

| Field | Type | Access | Validation |
|-------|------|--------|------------|
| `id` | UUID | READ_ONLY | — |
| `name` | String | required | `@NotBlank("Brand name is required")` |
| `fiId` | Short | optional | — |
| `createdAt` | LocalDateTime (`yyyy-MM-dd'T'HH:mm:ss`) | READ_ONLY | — |
| `updatedAt` | LocalDateTime | READ_ONLY | — |
| `email` | String | — | `@Email("Invalid email Id")` |
| `environments` | `List<EnvironmentInfo>` | READ_ONLY | populated on create only |

`EnvironmentInfo` (nested): `id` (UUID), `apiKey` (UUID — maps from environment `secret`), `name` (String) — all READ_ONLY.

### 3.2 EnvironmentController — base path `/environments`

Class annotations: `@RequiresScope({"FI","BRAND","EXTERNAL"})`, `@Validated`.

| Method | Path | Headers | Path | Body | Response `data` | Auth |
|--------|------|---------|------|------|-----------------|------|
| POST | `/environments` | `X-BRAND-ID` (UUID, `@NotNull`, hidden) | — | `EnvironmentDto` (`@NotNull @Validated`); `brandId` set from header | `EnvironmentDto` (secret+token returned) | scope FI/BRAND/EXTERNAL |
| GET | `/environments` | — | — | — | `List<EnvironmentDto>` (secrets nulled) | " |
| GET | `/environments/{id}` | — | `id` (UUID) | — | `EnvironmentDto` (secrets nulled) | " |
| PUT | `/environments/{id}` | `X-BRAND-ID` | `id` (UUID) | `EnvironmentDto`; `brandId`+`id` overwritten | `EnvironmentDto` (secrets nulled) | " |
| DELETE | `/environments/{id}` | — | `id` (UUID) | — | none | " |
| GET | `/environments/brand/{brandId}` | — | `brandId` (UUID, `@NotNull`) | — | `List<EnvironmentDto>` (secrets nulled) | " |
| PUT | `/environments/{id}/rotate-secret` | — | `id` (UUID) | — | `EnvironmentDto` (**new secret+token returned, not nulled**) | " |
| GET | `/environments/{id}/credentials` | — | `id` (UUID) | — | `EnvironmentCredentialsDto` `{id, secret, token}` | " |

**`EnvironmentDto` fields** (`@JsonInclude(NON_NULL)`):

| Field | Type | Access | Validation |
|-------|------|--------|------------|
| `id` | UUID | READ_ONLY | — |
| `name` | String | required | `@NotBlank("Environment name is required")` |
| `secret` | UUID | READ_ONLY | nulled by `sanitizeSecrets` except on create/rotate |
| `token` | UUID | READ_ONLY | same |
| `origin` | String | writable | — |
| `successRedirectUrl` | String | writable | — |
| `failureRedirectUrl` | String | writable | — |
| `brandId` | UUID | writable (set from header) | — |
| `createdBy` / `updatedBy` | Integer | READ_ONLY | — |
| `createdAt` / `updatedAt` | LocalDateTime | READ_ONLY | — |

**`EnvironmentCredentialsDto`**: `id`, `secret`, `token` (all UUID). Built directly via JPQL constructor projection `findCredentialsById`.

### 3.3 BrandRoleController — base path `/brand-roles`

Class annotations: `@RequiresScope({"FI","BRAND"})`, `@Validated`, plus per-method `@RequiresPermission`.

| Method | Path | Headers | Path | Body | `@RequiresPermission` | Response `data` |
|--------|------|---------|------|------|-----------------------|-----------------|
| POST | `/brand-roles` | `X-BRAND-ID`, `X-ENV-ID` (UUID `@NotNull`, hidden) | — | `BrandRoleDto` (`@NotNull @Validated`); brandId/envId from headers | module `brand_roles`, action `create` | `BrandRoleDto` |
| GET | `/brand-roles` | `X-BRAND-ID`, `X-ENV-ID` | — | — | `brand_roles`/`read` | `List<BrandRoleDto>` for (brand,env) |
| GET | `/brand-roles/{id}` | — | `id` (String `@NotBlank`, parsed to Integer) | — | `brand_roles`/`read` | `BrandRoleDto` |
| PUT | `/brand-roles/{id}` | `X-BRAND-ID`, `X-ENV-ID` | `id` (String `@NotBlank`) | `BrandRoleDto`; ids set from headers/path | `brand_roles`/`update` | `BrandRoleDto` |
| DELETE | `/brand-roles/{id}` | — | `id` (String `@NotBlank`) | — | `brand_roles`/`delete` | none |

**`BrandRoleDto` fields**:

| Field | Type | Access | Validation |
|-------|------|--------|------------|
| `id` | Integer | READ_ONLY | — |
| `brandId` | UUID | set from `X-BRAND-ID` | — |
| `environmentId` | UUID | set from `X-ENV-ID` | — |
| `name` | String | required | `@NotBlank("Role name is required")` |
| `permission` | String (JSON string; mapped to/from `JsonNode`) | required | `@NotBlank("Permission is required")` |
| `createdAt` / `updatedAt` | LocalDateTime | READ_ONLY | — |

Mapper converts `permission` via `stringToJsonNode` (write) / `jsonNodeToString` (read).

### 3.4 BrandUserController — base path `/brand-users`

Class annotations: `@RequiresScope({"FI","BRAND"})`, `@Validated`, plus per-method `@RequiresPermission`.

| Method | Path | Headers | Path | Body | `@RequiresPermission` | Response `data` |
|--------|------|---------|------|------|-----------------------|-----------------|
| POST | `/brand-users` | `X-BRAND-ID`, `X-ENV-ID` | — | `BrandUserDto`; brandId/envId from headers | `brand_users`/`create` | `BrandUserDto` |
| GET | `/brand-users` | `X-BRAND-ID`, `X-ENV-ID` | — | — | `brand_users`/`read` | `List<BrandUserDto>` for (brand,env) |
| GET | `/brand-users/{id}` | — | `id` (String `@NotBlank`→Integer) | — | `brand_users`/`read` | `BrandUserDto` |
| PUT | `/brand-users/{id}` | `X-BRAND-ID`, `X-ENV-ID` | `id` (String `@NotBlank`) | `BrandUserDto` | `brand_users`/`update` | `BrandUserDto` |
| DELETE | `/brand-users/{id}` | — | `id` (String `@NotBlank`) | — | `brand_users`/`delete` | none |

**`BrandUserDto` fields**:

| Field | Type | Access | Validation |
|-------|------|--------|------------|
| `id` | Integer | READ_ONLY | — |
| `brandId` | UUID | from header | — |
| `environmentId` | UUID | from header | — |
| `brandRoleId` | Integer | required | `@NotNull("Brand Role ID is required")` |
| `name` | String | required | `@NotBlank("Name is required")` |
| `email` | String | required | `@NotBlank("Email is required")` + `@Email("Email should be valid")` |
| `userId` | Integer | READ_ONLY | — |
| `scope` | `Scope` enum | default `BRAND` | — |
| `status` | `UserStatus` enum | default `ACTIVE` | — |
| `createdAt` / `updatedAt` | LocalDateTime | READ_ONLY | — |

---

## 4. Validations

### 4.1 Bean validation (annotation-level)

- **BrandDto**: `name` `@NotBlank` "Brand name is required"; `email` `@Email` "Invalid email Id".
- **EnvironmentDto**: `name` `@NotBlank` "Environment name is required".
- **BrandRoleDto**: `name` `@NotBlank` "Role name is required"; `permission` `@NotBlank` "Permission is required".
- **BrandUserDto**: `brandRoleId` `@NotNull` "Brand Role ID is required"; `name` `@NotBlank` "Name is required"; `email` `@NotBlank` "Email is required" + `@Email` "Email should be valid".
- **Controller-level**: request bodies `@NotNull @Validated`; headers `X-BRAND-ID`/`X-ENV-ID` `@NotNull`; path IDs `@NotBlank` (role/user string IDs) or typed `UUID`; `by-fi/{fiId}` `@NotBlank`. Controllers are `@Validated` so header/param constraints are enforced.

### 4.2 Service-layer business validations & error codes

Error codes from `fynxt.common.enums.ErrorCode` (thrown as `ResponseStatusException` with the **code string** as the reason). Relevant codes:

| Code | Message | HTTP |
|------|---------|------|
| `1007` DUPLICATE_RESOURCE | "Resource already exists" | 409 |
| `1017` BRAND_NOT_FOUND | "Brand not found" | 404 |
| `1019` BRAND_ROLE_NOT_FOUND | "Brand role not found" | 404 |
| `1020` BRAND_ROLE_ALREADY_EXISTS | "Brand role already exists" | 409 |
| `1021` BRAND_USER_NOT_FOUND | "Brand user not found" | 404 |
| `1022` BRAND_USER_ALREADY_EXISTS | "Brand user already exists" | 409 |
| `1023` ENVIRONMENT_NOT_FOUND | "Environment not found" | 404 |
| `1024` ENVIRONMENT_ALREADY_EXISTS | "Environment already exists" | 409 |
| `1025` FI_NOT_FOUND | "Financial Institution not found" | 404 |

**Brand.create**:
- If `fiId != null` → `verifyFiExists`: `fiRepository.existsById(fiId)` else 404 `1025`.
- `NameUniquenessService.validateForCreate(existsByFiIdAndName, "Brand", name)` → on duplicate throws 409 with reason `"1007: Brand with name '<name>' already exists"`.
- If `email` non-blank and `existsByEmail(email)` → 409 `1007` (DUPLICATE_RESOURCE, bare code).

**Brand.update**:
- 404 `1017` if brand not found.
- `verifyFiExists` if `fiId != null`.
- If name changed and `existsByFiIdAndNameAndIdNot(fiId, name, id)` → 409 with literal reason **"Brand name already exists for this FI"** (not an ErrorCode).

**Brand.read/delete**: 404 `1017` if not found. Delete is soft-delete.

**Environment.create**: `verifyEnvironmentNameExistsForBrand(brandId, name)` — `existsByBrandIdAndName` → 409 `1024`. read/update/delete/rotateSecret/readCredentials → 404 `1023` if not found. `readByToken`/`readBySecret`/`findBySecret` → 404 `1023`.

**BrandRole.create**: `verifyBrandRoleNameExistsForBrandAndEnvironment` — `existsByBrandIdAndEnvironmentIdAndName` → 409 `1020`. read/update/delete → 404 `1019`.

**BrandUser.create**: `verifyBrandRoleExists(brandRoleId)` (uses JpaRepo `existsById`) → 404 `1019` if role missing; `verifyBrandUserEmailExists(brandId, envId, email)` → 409 `1022`. update also re-checks role exists; read/update/delete → 404 `1021`.

### 4.3 Uniqueness (DB-enforced, partial unique indexes where `deleted_at IS NULL`)

- Brand: name unique per FI (`idx_brands_fi_name`), email globally (`brands_email_key`).
- Environment: `secret` and `token` unique.
- BrandRole: `(brand_id, environment_id, name)` unique.
- BrandUser: `(brand_id, environment_id, email)` unique.

### 4.4 Authorization

- `@RequiresScope` (class-level) gates by caller scope: Brand/BrandRole/BrandUser require `FI` or `BRAND`; Environment additionally allows `EXTERNAL`.
- `@RequiresPermission(module, action)` (method-level, only on BrandRole and BrandUser controllers) enforces fine-grained RBAC per CRUD action against modules `brand_roles` / `brand_users`.

---

## 5. Business Logic / Flows

### 5.1 Brand creation (`BrandServiceImpl.create`) — `@Transactional`
1. If `fiId` present, verify the FI exists (404 `1025` otherwise).
2. Validate brand-name uniqueness for that FI via `NameUniquenessService`.
3. If email supplied and non-blank, reject duplicate email (409 `1007`).
4. Map DTO → `Brand`, save.
5. **Auto-provision default environment**: `createDefaultEnvironments(brandId)` builds an `EnvironmentDto{name:"Production", brandId}` and calls `environmentService.create`. Wrapped in try/catch → returns `null` on failure (brand creation still succeeds).
6. Map saved brand → DTO; if the created environment has a `secret`, attach an `EnvironmentInfo{id, apiKey=secret, name}` to `brandDto.environments`. This is the only time the environment's secret/API key is surfaced through the brand response.

### 5.2 Environment creation (`EnvironmentServiceImpl.create`) — `@Transactional`
1. Reject duplicate env name within brand (409 `1024`).
2. Map DTO → entity, then **generate** `secret = UUID.randomUUID()` and `token = UUID.randomUUID()`.
3. Save; return DTO with secret+token intact (create is the moment credentials are exposed).

`readAll`/`read`/`findByBrandId`/`update` all pass results through `sanitizeSecrets` which nulls `secret` and `token`. To retrieve credentials afterward, callers use `GET /environments/{id}/credentials` (constructor-projection query) or `rotate-secret`.

**`rotateSecret`**: loads env (404 `1023`), assigns fresh `secret` + `token`, saves, returns DTO **without** sanitizing (new credentials returned once).

### 5.3 Brand Role creation (`BrandRoleServiceImpl.create`) — restore-on-recreate pattern
1. `verifyBrandRoleNameExistsForBrandAndEnvironment` → if an active role with same name exists, 409 `1020`.
2. Look up any role (including soft-deleted) by `(brandId, envId, name)` via `findByBrandIdAndEnvIdAndNameWithDeleted`. If found and `isDeleted()`, `restore()` it and apply DTO via `toUpdateBrandRole` (revives the old row instead of inserting a new one). Otherwise map a brand-new entity.
3. Save; `permission` JSON string ↔ `JsonNode` conversion handled by mapper.

`getRolePermissions(roleId)` reads the role, extracts the `permission` `JsonNode`, and deserializes it to `Map<String,Object>` (returns `null` on any failure) — used by the permission subsystem.

### 5.4 Brand User creation (`BrandUserServiceImpl.create`) — provisions a platform user
1. `verifyBrandRoleExists(brandRoleId)` → 404 `1019` if role missing.
2. `verifyBrandUserEmailExists(brandId, envId, email)` → 409 `1022` if active duplicate.
3. Restore-on-recreate: find `(brandId, envId, email)` incl. deleted; if soft-deleted, `restore()` + `toUpdateBrandUser`.
4. Otherwise: call `userService.createUser(UserRequest{email})` to create the platform-level `User`, map the DTO to a `BrandUser`, set its `userId` to the newly created user's id. `scope` defaults to `BRAND`, `status` to `ACTIVE`.
5. Save and return.

`update` uses `toUpdateBrandUser` with `NullValuePropertyMappingStrategy.IGNORE` (partial update — null fields don't overwrite). `hasAccessToEnvironment(userId, brandId, envId, roleId)` and `findByUserId(userId)` support access/context resolution elsewhere (e.g., `BrandRepository.findByUserId` joins `BrandUser`).

### 5.5 Deletion (all sub-domains)
Uniformly soft-delete: load entity (404 if missing), call `entity.softDelete()` (sets `deletedAt`/`deletedBy`), save. No cascade — child rows are not auto-deleted.

---

## 6. Frontend Integration

### 6.1 API services & endpoint mapping

Endpoints resolved via `resolveEndpoint(API_ENDPOINTS, [...], args)` (`frontend/src/api/endpoints.ts`). `X-BRAND-ID` / `X-ENV-ID` headers are injected automatically by the axios request interceptor (`frontend/src/api/axios-instance.ts`, lines ~55–62) from the selected brand/environment context — so role/user/environment services never pass those in the body.

**`brands.service.ts`** (`BrandsService`):
| Method | Endpoint key | Resolves to |
|--------|--------------|-------------|
| `getBrands(fiId)` | `BRANDS.LIST_BY_FI_ID` | `GET /brands/by-fi/{fiId}` |
| `createBrand(data)` | `BRANDS.CREATE` | `POST /brands` |
| `updateBrand(id, data)` | `BRANDS.UPDATE_BY_ID` | `PUT /brands/{id}` |
| `deleteBrand(id)` | `BRANDS.DELETE_BY_ID` | `DELETE /brands/{id}` |

(`BRANDS.LIST` = `/brands`, `GET_BY_ID` = `/brands/{id}` also defined.)

**`environment.service.ts`** (`EnvironmentService`): `getEnvironments` → `GET /environments`; `getEnvironmentsByBrand(brandId)` → `GET /environments/brand/{brandId}`; `getEnvironmentById(id)` → `GET /environments/{id}`; `createEnvironment(data)` → `POST /environments`; `updateEnvironment(id, data)` → `PUT /environments/{id}`; `rotateSecret(id)` → `PUT /environments/{id}/rotate-secret`; `getCredentials(id)` → `GET /environments/{id}/credentials` (returns `{id, secret, token}`). Payload interfaces `EnvironmentCreatePayload`/`EnvironmentUpdatePayload`: `{name, origin?, successRedirectUrl?, failureRedirectUrl?}`.

**`brand-roles.service.ts`** (`BrandRolesService`): `getBrandRoles()`, `createBrandRole(data)`, `updateBrandRole(roleId, data)`, `deleteBrandRole(roleId)`. brandId/environmentId come from headers.

**`brand-users.service.ts`** (`BrandUsersService`): `getBrandUsers()`, `createBrandUser(userData)`, `updateBrandUser(userId, userData)`, `deleteBrandUser(userId)`. Payload type is `Omit<CreateUserRequest, "brandId" | "environmentId">` — those two come from headers.

### 6.2 Pages & components (`frontend/src/pages/brand/`)

- **`list.tsx` (`BrandsList`)** — main brand management page. Uses TanStack Query (`brandQueryKeys.all`) calling `BrandsService.getBrands(user.fiId)`. Renders a `DataTable`, an "Onboard Brand" button, global search. Handles create/edit/view(impersonate) modals. On create success it calls `refreshAccessToken()` to refresh brand context in the JWT and updates the auth store's brand list.
- **`components/brand-modals.tsx`** — `BrandModal` (+ `CreateBrandModal`/`EditBrandModal`). Submit disabled unless `isDirty && isValid`.
- **`components/brand-form.tsx`** — two `CommonInput`s: **name** and **email** (`fiId` derived from JWT, not an input).
- **`components/brand-impersonate-modal.tsx`** — FI/system user impersonates a brand (sets selected brand + `startImpersonation`, navigates to `/`).
- Supporting: `components/brand-table-columns.tsx`, `helpers/query-keys.ts` (`brandQueryKeys`), `types.ts`, `validation/brand.validation.ts`, `hooks/use-brand-form.ts`, `hooks/use-brand-operations.ts`.

### 6.3 Frontend types & validation

`types.ts`: `Brand {id, name, fiId?, email?, status?, createdAt?, updatedAt?}`; `CreateBrandRequest {name, fiId, email?}`; `UpdateBrandRequest extends CreateBrandRequest {id}`.

`validation/brand.validation.ts` (Zod, `createBrandSchema(t)`):
- `name`: `z.string().min(1, required)`
- `email`: `z.string().min(1, required).email(email-error)` — **required on the frontend** (backend treats it as optional/`@Email` only)
- `fiId`: `z.number().min(1, required)`

`hooks/use-brand-form.ts`: builds the form via `useCommonForm` (mode `onChange`), pulls `fiId` from `user.fiId`. Submit builds `CreateBrandRequest {name, email, fiId}`.

`hooks/use-brand-operations.ts`: TanStack `useMutation` `createBrand`/`updateBrand`. On success invalidate `brandQueryKeys.all` and update auth store's brand list.

---

## 7. End-to-End Use Cases

### 7.1 Onboard (create) a brand
1. FI user clicks "Onboard Brand" → `CreateBrandModal` → `BrandForm`. Enters name + email; `fiId` auto-filled from JWT.
2. Zod validates (name non-empty, valid email, fiId ≥ 1). Submit enabled only when dirty+valid.
3. `useBrandOperations.createBrand` → `BrandsService.createBrand` → `POST /brands` body `{name, email, fiId}` (+ scope FI/BRAND enforced).
4. Backend: verify FI exists → check name unique per FI → check email unique → insert into `brands` → auto-create `"Production"` row in `environments` with generated `secret`/`token`.
5. Response `BrandDto` includes `environments:[{id, apiKey(=secret), name}]` (only place the API key is shown).
6. Frontend invalidates brand query, appends brand to auth store, calls `refreshAccessToken()`, closes modal.

### 7.2 List brands
`BrandsList` → `getBrands(user.fiId)` → `GET /brands/by-fi/{fiId}` → `BrandRepository.findByFiId` (filters `deleted_at IS NULL`) → table renders.

### 7.3 Update a brand
Edit modal → `PUT /brands/{id}` with `{name, email, fiId, id}`. Backend loads brand (404 `1017` if gone), re-verifies FI, and only if the name changed checks `existsByFiIdAndNameAndIdNot` (409 "Brand name already exists for this FI"). MapStruct `toUpdateBrand` applies changes; save.

### 7.4 Delete a brand
`DELETE /brands/{id}` → soft-delete (`deletedAt`/`deletedBy` set). Environments/roles/users are **not** cascade-deleted.

### 7.5 Manage environments for a brand
With a brand selected (header `X-BRAND-ID`), `POST /environments {name, origin?, successRedirectUrl?, failureRedirectUrl?}` creates an env with fresh secret/token (returned once). Subsequent `GET`s null out secrets; `GET /environments/{id}/credentials` retrieves them, `PUT /environments/{id}/rotate-secret` regenerates. Env name unique within brand (409 `1024`).

### 7.6 Create a brand role
With brand+env selected, `POST /brand-roles {name, permission(JSON string)}`, requires `brand_roles:create`. Rejects duplicate name for that (brand,env) (409 `1020`) or restores a soft-deleted role of the same name. `permission` stored as `jsonb`.

### 7.7 Assign a brand user (brand-user assignment)
With brand+env context, `POST /brand-users {brandRoleId, name, email, scope?, status?}`, requires `brand_users:create`. Backend: verify role exists (404 `1019`), reject duplicate email within (brand,env) (409 `1022`), else create platform `User` via `UserService.createUser({email})`, then a `BrandUser` linking `userId` + `brandRoleId` under that (brand, env) with `scope=BRAND`, `status=ACTIVE`. Re-creating a removed email restores the soft-deleted row.

---

## 8. Notable Observations / Gotchas

- Two distinct "duplicate name" behaviors on Brand: create uses `NameUniquenessService` → reason `"1007: Brand with name '...' already exists"`; update uses hard-coded literal `"Brand name already exists for this FI"`. Inconsistent error surface.
- `BrandDto.email` is optional/`@Email` on backend but the DB column is `NOT NULL` and the frontend Zod schema makes it required — a blank email would fail at DB layer even though bean validation permits it.
- Environment credentials (`secret`/`token`) exposed only on create, rotate-secret, and `/credentials`; all other reads null them via `sanitizeSecrets`.
- Restore-on-recreate (reviving soft-deleted rows) is implemented for BrandRole and BrandUser, but **not** for Brand or Environment.
