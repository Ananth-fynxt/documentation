---
title: Transaction Lifecycle
description: Versioned transaction records, the orchestrator state machine, and limits.
---

# Transaction Module — Developer Documentation

Payments / PSP-orchestration platform (`nexxus`), `brand` service.
Backend base package: `fynxt.brand.transaction` and `fynxt.brand.transactionlimit`.

---

## 1. Overview

### What a transaction is
A **transaction** represents a single payment attempt (deposit, withdrawal, refund, etc.) that flows through a PSP (Payment Service Provider). It is created against a pre-existing **Request** (`requestId`) and a **flow** identified by `flowTargetId` + `flowActionId`. Every transaction is uniquely identified by a generated `txnId` (prefix `ortx` + 12 random alphanumeric chars, e.g. `ortxA1b2C3d4E5f6`).

### Event-sourced / versioned record model
The transaction table is **append-only and versioned**. The primary key is a composite `EmbeddableTransactionId(txnId, version)`. Every state change does **not** mutate a row — instead it inserts a **new row with the same `txnId` and `version + 1`** and the new status (`AbstractTransactionStep.createAndSaveNewVersion` → `TransactionMapper.createNewVersionedRecord`). "The current state" of a transaction = the row with the **maximum version** for that `txnId`. This gives a full audit trail of every status transition.

### Lifecycle (high level)
1. Client calls `POST /transactions` with `requestId`, `flowActionId`, `flowTargetId`, `pspId`, `txnAmount`, `txnCurrency`, `externalRequestId`, `executePayload`.
2. Orchestrator creates an in-memory `Transaction` in status `NEW`, enriches customer fields from the Request, then drives the state machine forward automatically (`executeNextStep`) as far as the flow configuration + step preconditions allow.
3. Typical path: `NEW → CREATED → INITIATED` (initiation runs a Deno VM script against the PSP; produces redirect/session data).
4. A **session URL** is created (widget URL) if initiation succeeded, and returned to the caller.
5. Later, PG (payment gateway) callbacks — redirect data and/or webhook data — drive further transitions: `INITIATED → PG_ACCEPTED/PG_REJECTED → PG_SUCCESS/PG_FAILED → SUCCESS/FAILED` (exact allowed transitions come from the flow definition JSON).
6. Manual/back-office transitions are possible via `PUT /transactions/{txnId}/status`.

### Payment flow context
- **Flow configuration** (allowed status transitions) is data-driven, stored in a `FlowDefinition` entity keyed by `flowTargetId`+`flowActionId`. `flowConfiguration` is a JSONB map: `{ "<currentStatus>": ["<allowedNext>", ...], ... }`.
- **Deno VM** (`VMExecuteService` / `DenoVMResult`) executes per-PSP JavaScript (the flow definition's `code`) to talk to the actual gateway (`step = "initiate"`).
- **Transaction limits** and **risk/routing rules** are enforced during **PSP resolution** (see §5.6), not inside the transaction steps themselves.

---

## 2. Data model

### 2.1 Entity: `Transaction`
`entity/Transaction.java` — `@Table(name = "transactions")`, audited (`AuditingEntityListener`).

| Field | Java type | Column | Notes |
|---|---|---|---|
| `id` | `EmbeddableTransactionId` | `@EmbeddedId` | composite (`txn_id`, `version`) |
| `brandId` | `UUID` | `brand_id` | tenant |
| `environmentId` | `UUID` | `environment_id` | tenant |
| `requestId` | `UUID` | `request_id` | FK to Request |
| `flowActionId` | `String` | `flow_action_id` | e.g. deposit/withdrawal action |
| `flowTargetId` | `String` | `flow_target_id` | flow target |
| `pspId` | `UUID` | `psp_id` | chosen PSP |
| `pspTxnId` | `String` | `psp_txn_id` | gateway ref (read-only) |
| `externalRequestId` | `String` | `external_request_id` | client idempotency key |
| `transactionType` | `String` | `transaction_type` | e.g. deposit/withdraw/refund |
| `status` | `TransactionStatus` | `status` (PG enum `transaction_status`) | current status of this version |
| `txnCurrency` | `String` | `txn_currency` | |
| `txnFee` | `BigDecimal` | `txn_fee` | |
| `txnAmount` | `BigDecimal` | `txn_amount` | |
| `executePayload` | `JsonNode` (jsonb) | `execute_payload` | payload passed to VM |
| `customerId` | `String` | `customer_id` | populated from Request |
| `customerTag` | `String` | `customer_tag` | populated from Request |
| `customerAccountType` | `String` | `customer_account_type` | populated from Request |
| `createdAt` / `updatedAt` | `LocalDateTime` | `created_at` / `updated_at` | auditing |
| `createdBy` / `updatedBy` | `Integer` | `created_by` / `updated_by` | auditing |

**`EmbeddableTransactionId`** (`@Embeddable`): `txnId` (`txn_id`, annotated `@TransactionId`), `version` (`version`, Integer).

**`TransactionId`** — custom Hibernate `@IdGeneratorType` annotation bound to `TransactionIdGenerator`.

**`TransactionIdGenerator`** — generates `"ortx"` + 12 random chars (`SecureRandom`, alphanumeric). If a `txnId` is already set, it is reused (so versioning keeps the same id).

### 2.2 Enums

**`enums/TransactionStatus`** (Postgres enum `transaction_status`) — 10 values, in declaration order:
`NEW`, `CREATED`, `INITIATED`, `PG_ACCEPTED`, `PG_REJECTED`, `REJECTED`, `PG_SUCCESS`, `PG_FAILED`, `SUCCESS`, `FAILED`.
- Failure set used for failure-rate calc (`TransactionServiceImpl.FAILURE_STATUSES`): `FAILED`, `PG_FAILED`, `REJECTED`, `PG_REJECTED`.
- "Successful amount" queries count `SUCCESS` (routing calc also counts `PG_SUCCESS`).

**`enums/TimeRange`** — search time windows, each computes `start = now().minus(amount, unit)`, `end = now()`:
`LAST_24_HOURS` (1 DAY), `LAST_2_DAYS`, `LAST_3_DAYS`, `LAST_4_DAYS`, `LAST_7_DAYS`, `LAST_30_DAYS`, `LAST_3_MONTHS` (3 MONTHS), `LAST_6_MONTHS`, `LAST_YEAR` (1 YEAR). Nested `record DateRange(start, end)`.

### 2.3 Transaction-limit entities (`transactionlimit/entity`)

**`TransactionLimit`** — `@Table("transaction_limits")`, extends `AuditingEntity`, soft-deletable.
- `transactionLimitId` : `EmbeddableTransactionLimitId` (`@EmbeddedId`) = (`id` Integer, `version` Integer)
- `name` (String), `brandId` (UUID), `environmentId` (UUID), `currency` (String)
- `countries` : `String[]` (`TEXT[]`), `customerTags` : `String[]` (`TEXT[]`)
- `status` : `fynxt.common.enums.Status` (PG enum `status`, default `ENABLED`)

**`TransactionLimitPsp`** — `@Table("transaction_limit_psps")`, `@IdClass(TransactionLimitPspId)`. Composite PK: `transactionLimitId` (Integer), `transactionLimitVersion` (Integer), `pspId` (UUID). Join between a limit version and PSPs.

**`TransactionLimitPspAction`** — `@Table("transaction_limit_psps_actions")`, `@IdClass(TransactionLimitPspActionId)`. Composite PK: `transactionLimitId`, `transactionLimitVersion`, `flowActionId` (String). Payload: `minAmount` (BigDecimal), `maxAmount` (BigDecimal). This is the per-action min/max amount rule.

Limits are versioned like transactions: create → version 1; update → inserts a new version (`existing.version + 1`) and re-creates PSP + action associations; delete → soft delete of the latest version.

---

## 3. Transaction orchestration (CORE)

### 3.1 Components
- **`orchestrator/TransactionOrchestrator`** (interface): `createTransaction(dto)`, `executeNextStep(ctx)`, `transitionToStatus(ctx, targetStatus)`.
- **`orchestrator/impl/TransactionOrchestratorImpl`** — the engine.
- **`context/TransactionExecutionContext`** — carries `transaction`, `txnId`, `isFirstExecution` flag, and a `Map<String,Object> customData`. `getTxnId()` falls back to `transaction.id.txnId`. `customData` keys used: `vmExecutionResponse`, `pgRedirectData`, `pgWebhookData`.
- **`step/TransactionStep`** (interface): `precondition(ctx)`, `execute(ctx)`, `getDestinationStatus()`.
- **`step/AbstractTransactionStep`** — base for all steps.
- **`step/factory/TransactionStepFactory`** — builds an `EnumMap<TransactionStatus, TransactionStep>` at startup by calling each injected step's `getDestinationStatus()`. `getStepForStatus(status)` returns the step whose **destination** = that status (or null).
- **`service/TransactionFlowConfigurationService`** — reads the `FlowDefinition` JSONB and answers "given current status, what are the allowed next statuses?" (Caffeine-cached, max 5000, TTL 5 min).

### 3.2 Step classes and their destination status

| Step class | `getDestinationStatus()` | `customPrecondition` logic | `doExecute` side effect |
|---|---|---|---|
| `TransactionCreationStep` | `CREATED` | (none; runs full create validations in `doExecute`) | Runs 6 create-validations; if `pspId` set, `pspService.getPspIfEnabled`. **Overrides `execute()`** with its own `@Transactional` (does NOT lock latest row like the abstract base). |
| `TransactionInitiationStep` | `INITIATED` | default `true` | Builds `VmExecutionDto` (pspId, amount, currency, brand/env, `step="initiate"`, flowActionId, txnId, executePayload); calls `VMExecuteService.executeVmRequest`; stores `DenoVMResult` in `customData["vmExecutionResponse"]`. |
| `TransactionPgAcceptedStep` | `PG_ACCEPTED` | `pgRedirectData.isSuccess()` if present, else `pgWebhookData.isSuccess()`, else `false` | none |
| `TransactionPgRejectedStep` | `PG_REJECTED` | `!pgRedirectData.isSuccess()` if present, else `!pgWebhookData.isSuccess()`, else `false` | none |
| `TransactionPgSuccessStep` | `PG_SUCCESS` | `pgWebhookData.isSuccess()` (only webhook) | none |
| `TransactionPgFailedStep` | `PG_FAILED` | `!pgWebhookData.isSuccess()` (only webhook) | none |
| `TransactionSuccessStep` | `SUCCESS` | default `true` | none |
| `TransactionRejectedStep` | `REJECTED` | default `true` | none |
| `TransactionFailedStep` | `FAILED` | default `true` | none |

There is **no step for `NEW`** — `NEW` is only the initial in-memory status set by the orchestrator.

### 3.3 `precondition` (in `AbstractTransactionStep`)
`precondition = isStatusTransitionAllowed(ctx) && customPrecondition(ctx)`
- `isStatusTransitionAllowed`: returns `false` if `flowTargetId`/`flowActionId` null; otherwise `transactionFlowConfigurationService.isValidTransition(flowTargetId, flowActionId, currentStatus, destinationStatus)`. Any exception → `false`.

### 3.4 `execute` template (in `AbstractTransactionStep`)
`@Transactional(REQUIRED)`:
1. `getLatestTransactionForUpdate` — `transactionRepository.findLatestByTxnIdForUpdate(txnId)` (**`PESSIMISTIC_WRITE` lock** on the latest version → serializes concurrent transitions).
2. Set the locked row into context.
3. Re-check `precondition`; if false → throw `AppException(TRANSACTION_INVALID_TRANSITION_STATUS)` with a detailed message (`from -> to`, flow ids, txnId).
4. `doExecute(ctx)` (subclass business logic).
5. `createAndSaveNewVersion` — map to a new record with `version+1` and `status = destinationStatus`, `save`.

(Note: `TransactionCreationStep` intentionally overrides `execute()` and skips the `findLatestByTxnIdForUpdate` lock because at creation there is no persisted row yet.)

### 3.5 Orchestrator algorithm

**`createTransaction(dto)`**
1. `transactionMapper.toEntity(dto)`; `setStatus(NEW)`.
2. `populateCustomerFields` — via `requestService.getCustomerInfoByRequestId(requestId)` set `customerId`, `customerTag`, `customerAccountType` (best-effort; swallows exceptions).
3. Build context with `isFirstExecution = true`.
4. `executeNextStep(context)`.

**`executeNextStep(ctx)`**
1. `possibleNextStatuses = flowConfigurationService.getNextStatuses(flowTargetId, flowActionId, currentStatus)`.
2. If empty:
   - if `isFirstExecution` → throw `AppException(TRANSACTION_NO_VALID_STEPS_FOUND)`.
   - else → return ctx (terminal / nothing to do).
3. `determineNextStep(ctx)` → `getValidNextSteps`:
   - for each possible next status, get its step from the factory and evaluate `step.precondition(ctx)`; collect those that pass.
   - **exactly one** valid step required: 0 → `TRANSACTION_NO_VALID_STEPS_FOUND`; >1 → `TRANSACTION_MULTIPLE_STEPS_FOUND`; else the single step.
4. `executeStep(ctx, step)`.

**`executeStep(ctx, step)`**
1. `ctx = step.execute(ctx)` (persists new version).
2. `ctx.setFirstExecution(false)`.
3. **Recurse** `executeNextStep(ctx)` — keeps advancing until no valid next step.
4. On any exception: if `isFirstExecution` → rethrow; else → swallow and return the last good ctx (so a partially advanced chain still returns).

**`transitionToStatus(ctx, targetStatus)`** (used by `moveToStatus` endpoint)
1. `verifyTransition` — `isValidTransition(flowTargetId, flowActionId, currentStatus, targetStatus)`; else `TRANSACTION_INVALID_STATUS`.
2. `getStepForStatus(targetStatus)`; if none → `TRANSACTION_PROCESSING_ERROR`.
3. `executeStep(ctx, targetStep)` (which then also recurses forward).

### 3.6 Flow-configuration resolution (`TransactionFlowConfigurationService`)
- `getNextStatuses(flowTargetId, flowActionId, currentStatus)` — cache key `flowTargetId_flowActionId_STATUS`; on miss loads `FlowDefinition` (`findByFlowTargetIdAndFlowActionId`), parses `flowConfiguration` JSONB (handles textual JSON too), reads array at key `currentStatus.name()` → `List<TransactionStatus>`. Missing/non-array → empty list. Parse failure → `RuntimeException`.
- `isValidTransition(...)` = `getNextStatuses(...).contains(nextStatus)`.
- `getFlowDefinition(...)` returns the `FlowDefinition` (used by creation validation to require a `code`/script).
- Cache admin: `reloadFlowDefinition`, `reloadAllFlowConfigurations`, `invalidateCacheEntry`, `invalidateAllCache`, `getCacheStats`. Config in `config/TransactionFlowCacheConfig` (`FLOW_CACHE_MAXIMUM_SIZE=5000`, `expireAfterWrite=5 min`).

### 3.7 State machine (text diagram)
Transitions are **data-driven per flow**, but the code + step preconditions imply this canonical graph:

```
        [orchestrator sets NEW in-memory]
                     │  (CreationStep: run create validations)
                     ▼
NEW ───────────────► CREATED
                        │  (InitiationStep: run Deno VM "initiate", store vmExecutionResponse)
                        ▼
                    INITIATED ──────────► session URL returned to caller
                        │
        ┌───────────────┴────────────────┐
        │ pgRedirectData / pgWebhookData  │  (evaluated by PG* step preconditions)
        ▼                                 ▼
   PG_ACCEPTED (success)            PG_REJECTED (redirect/webhook failure)
        │                                 │
        ▼ (webhook success)               ▼
   PG_SUCCESS                         REJECTED  (terminal)
        │
        ├──► SUCCESS  (terminal)
        │
   PG_FAILED (webhook failure) ──► FAILED (terminal)
```

Selection between competing steps (e.g. `PG_ACCEPTED` vs `PG_REJECTED`) is made by `customPrecondition` inspecting `customData` (`pgRedirectData` / `pgWebhookData` → `DenoVMResult.isSuccess()`), combined with what the flow JSON lists as allowed next statuses. The engine requires the allowed-next set + preconditions to resolve to exactly one step.

---

## 4. REST API endpoints

### 4.1 `TransactionFlowController` — base `/transactions`

| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `POST` | `/transactions` | none (`@RequiresPermission` absent) | body `TransactionDto` (`@Validated`) | `ApiResponse<TransactionResponseDto>` — "Transaction created successfully" |
| `PUT` | `/transactions/{txnId}/status` | `transactions:update` | path `txnId`, query `status` (`TransactionStatus`), body `TransactionDto` | updated `TransactionDto` — "Transaction status updated successfully" |
| `GET` | `/transactions/{txnId}` | `transactions:read` | path `txnId` | `TransactionDto` (latest version) |
| `GET` | `/transactions/{txnId}/status` | none | path `txnId` | `TransactionStatusResponseDto` `{ status }` |
| `POST` | `/transactions/search` | `transactions:read` | headers `X-BRAND-ID`, `X-ENV-ID` (optional); body `TransactionSearchCriteria` | paginated `Page<TransactionDto>` |

Notes:
- `createTransaction` and `moveToStatus` pull `brandId`/`environmentId` from `BrandEnvironmentContextHolder` (auth context); if missing → 400 `MISSING_REQUIRED_PARAMETER`.
- `createTransaction` delegates to `TransactionFlowService.createTransactionWithSession(dto, brandId, envId)`.

### 4.2 `TransactionLimitController` — base `/transaction-limits`
Class-level `@RequiresScope({"FI","BRAND"})`.

| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `POST` | `/transaction-limits` | `transaction_limits:create` | headers `X-BRAND-ID`/`X-ENV-ID`; body `TransactionLimitDto` | created `TransactionLimitDto` |
| `GET` | `/transaction-limits/{id}` | `transaction_limits:read` | path `id` (Integer) | latest `TransactionLimitDto` |
| `GET` | `/transaction-limits` | `transaction_limits:read` | headers `X-BRAND-ID`/`X-ENV-ID` | `List<TransactionLimitDto>` |
| `GET` | `/transaction-limits/psp/{pspId}` | `transaction_limits:read` | path `pspId` (UUID) | `List<TransactionLimitDto>` |
| `PUT` | `/transaction-limits/{id}` | `transaction_limits:update` | path `id`; body `TransactionLimitDto` | updated (new version) `TransactionLimitDto` |
| `DELETE` | `/transaction-limits/{id}` | `transaction_limits:delete` | path `id` | "Transaction limit deleted successfully" (soft delete) |

### 4.3 DTO field reference

**`TransactionDto`** — request/response for transaction endpoints. Writable: `requestId`, `flowActionId`, `flowTargetId`, `flowDefinitionId`, `pspId`, `externalRequestId`, `transactionType`, `status`, `txnCurrency`, `txnFee`, `txnAmount`, `executePayload` (`Map`), `customData` (`Map`). Read-only: `brandId`, `environmentId`, `txnId`, `version`, `pspTxnId`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `customerId`, `customerTag`, `customerAccountType`.

**`TransactionResponseDto`** — `txnId`, `txnSuccess` (Boolean), `txnMeta` (Object), `txnError` (String), `sessionUrl` (String). Built in `createTransactionWithSession` from the `DenoVMResult`.

**`TransactionStatusResponseDto`** — `status` (`TransactionStatus`).

**`TransactionSearchCriteria`** — `page` (`@Min(0)`), `size` (`@Min(1)`), `sortBy` (String), `sortDirection` (String → `Sort.Direction`, invalid → null), `filters` (`Map<String,Object>`).

**`TransactionLimitDto`** — `id`/`version` (RO), `name` (`@NotBlank`), `brandId`/`environmentId` (required, from headers), `currency` (`@NotBlank`), `countries` (`@NotEmpty List<String>`), `customerTags` (`@NotEmpty List<String>`), `status` (`Status`, default `ENABLED`), `pspActions` (`@NotEmpty @Valid List<TransactionLimitPspActionDto>`), `psps` (`@NotEmpty List<IdNameDto>`), audit (RO).

**`TransactionLimitPspActionDto`** — `flowActionId` (`@NotBlank`), `flowActionName` (String), `minAmount` (`@NotNull @DecimalMin "0.00"`), `maxAmount` (`@NotNull @DecimalMin "0.01"`).

---

## 5. Validations

### 5.1 Bean validations
- Controller params: `@NotNull` on `txnId`, `status`, request bodies; `@Validated`/`@Valid` on DTOs.
- `TransactionSearchCriteria`: `@Min(0)` page, `@Min(1)` size.
- Transaction-limit DTOs: `@NotBlank`, `@NotEmpty`, `@NotNull`, `@DecimalMin` as in §4.3.

### 5.2 Business validations — `TransactionCreationStep.performCreateValidations` (in order)
1. **`validateExternalRequestIdPresence`** — transaction not null; `externalRequestId` has text → else `INVALID_REQUEST_BODY` / `BAD_REQUEST`.
2. **`validateDuplicateTransaction`** — `findLatestByExternalRequestIdForContext(brand, env, flowActionId, externalRequestId)`; if exists → `TRANSACTION_DUPLICATE` (message includes existing txnId).
3. **`validateRequestIdNotAlreadyMapped`** — `requestId` required (`TRANSACTION_REQUEST_ID_NOT_FOUND`); `findLatestByRequestIdForContext`; if exists → `DUPLICATE_RESOURCE`.
4. **`validateTxnAmountMatchesRequestAmount`** — load Request by id (`RESOURCE_NOT_FOUND` if absent); tenant check brand/env; both amounts present (`TRANSACTION_AMOUNT_REQUIRED`); `request.amount == txnAmount` (`TRANSACTION_AMOUNT_INVALID`); flowActionIds present + match (`TRANSACTION_FLOW_ACTION_ID_REQUIRED` / `TRANSACTION_VALIDATION_FAILED`); currencies present + match case-insensitive (`TRANSACTION_CURRENCY_REQUIRED` / `TRANSACTION_CURRENCY_INVALID`).
5. **`validateRequestIdAndPspIdMapping`** — if `pspId` set, require `request_psps` mapping `RequestPspId(requestId, pspId)` to exist; else `VALIDATION_ERROR`.
6. **`validateFlowDefinitionHasScript`** — `getFlowDefinition(flowTargetId, flowActionId)` must exist (`FLOW_DEFINITION_NOT_FOUND`) and have non-blank `code` (`FLOW_DEFINITION_CODE_REQUIRED`).

Also: if `pspId` set, `pspService.getPspIfEnabled(pspId)` (PSP must exist and be enabled).

### 5.3 State-machine validations
- Every transition validated against flow config (`isValidTransition`) in both `precondition` and `verifyTransition`.
- Step selection cardinality: 0 valid → `TRANSACTION_NO_VALID_STEPS_FOUND`; >1 → `TRANSACTION_MULTIPLE_STEPS_FOUND`.
- No step for a status → `TRANSACTION_PROCESSING_ERROR`.
- Invalid manual transition → `TRANSACTION_INVALID_STATUS`; precondition fail inside `execute` → `TRANSACTION_INVALID_TRANSITION_STATUS`.
- Concurrency: `findLatestByTxnIdForUpdate` (`PESSIMISTIC_WRITE`) serializes transitions on a `txnId`.

### 5.4 Transaction-limit validations
- Create: `verifyTransactionLimitNotExists` (unique `brandId+environmentId+name`) → `TRANSACTION_LIMIT_ALREADY_EXISTS` (409).
- Update: name-uniqueness check only when name changes; not-found → `TRANSACTION_LIMIT_NOT_FOUND` (404).

### 5.5 Error codes (`fynxt.common.enums.ErrorCode`)
| Code | Enum | Message |
|---|---|---|
| 1043 | `TRANSACTION_NOT_FOUND` | Transaction not found |
| 1044 | `TRANSACTION_VALIDATION_FAILED` | Transaction validation failed |
| 1045 | `TRANSACTION_PROCESSING_ERROR` | Transaction processing error |
| 1046 | `TRANSACTION_NO_VALID_STEPS_FOUND` | No valid transaction steps found |
| 1047 | `TRANSACTION_MULTIPLE_STEPS_FOUND` | Multiple valid transaction steps found |
| 1048 | `TRANSACTION_INVALID_STATUS` | Invalid transaction status |
| 1049 | `TRANSACTION_INVALID_TRANSITION_STATUS` | Invalid transaction transition status |
| 1050 | `TRANSACTION_REQUEST_ID_NOT_FOUND` | Request Id is required |
| 1051 | `TRANSACTION_DUPLICATE` | Duplicate transaction detected |
| 1052 | `TRANSACTION_AMOUNT_REQUIRED` | Amount is required |
| 1053 | `TRANSACTION_AMOUNT_INVALID` | Invalid transaction amount |
| 1054 | `TRANSACTION_FLOW_ACTION_ID_REQUIRED` | Flow action ID is required |
| 1055 | `TRANSACTION_CURRENCY_REQUIRED` | Currency is required |
| 1056 | `TRANSACTION_CURRENCY_INVALID` | Invalid transaction currency |
| 1057 | `FLOW_DEFINITION_NOT_FOUND` | Flow definition not found |
| 1058 | `FLOW_DEFINITION_CODE_REQUIRED` | Flow definition code is required |
| 1063 | `TRANSACTION_LIMIT_NOT_FOUND` | Transaction limit not found |
| 1064 | `TRANSACTION_LIMIT_ALREADY_EXISTS` | Transaction limit already exists |

### 5.6 Where limits are actually enforced
Transaction limits (min/max amount per PSP+action) are **not** enforced in the transaction steps. They are consumed during **PSP resolution** (`PspResolutionService`), which loads `readLatestEnabledTransactionLimitsByCriteria(pspIds, brand, env, actionId, currency, ENABLED)` into a `PspFilterContext`, then runs a filter pipeline (`RiskRuleFilterStrategy`, `RoutingRuleFilterStrategy`, transaction-limit filter). Historical totals feeding thresholds come from `TransactionCalculationService` / `RoutingCalculationService`. So limits gate which PSP a request can be routed to, **before** the transaction is created. See the Fetch-PSP module doc.

---

## 6. Frontend integration

### 6.1 Services
- **`api/services/transaction.service.ts`** — `TransactionService.searchTransactions(searchRequest)` → `POST /transactions/search`. Only search is wired to the backend from the FE.
- **`api/services/transaction-limits.service.ts`** — `getTransactionLimitsByPSP(pspId)`, `getTransactionLimits()`, `getTransactionLimitById(id)`, `createTransactionLimit(data)`, `updateTransactionLimit(id, data)`, `deleteTransactionLimit(id)`.

### 6.2 Types (`pages/transaction-request/transaction-types.ts`)
- `Transaction` — mirrors backend fields plus FE-only/legacy fields (`walletId`, `walletCurrency`, `boApprovedBy`, `boApprovalDate`, `remarks`, `receivedAmount`, `receivedCurrency`, `insertedByIpAddress`, `updatedByIpAddress`). `status` is the 10-value union `| string`.
- `TransactionSearchRequest` — `{ page, size, sortBy, sortDirection: "ASC"|"DESC", filters: { txnType?, transactionType?, txnTime?, txnStatus?, psp?, customer?, flowAction?, amount?, currency?, status?, customerId?, flowActionId? } }`.
- `TransactionSearchResponse` — tolerant envelope with `metadata.pagination`.

### 6.3 Pages
- **`pages/transaction-request/transaction-request.tsx`** — tabbed page ("Deposit Request", "Withdrawal Request", "Refund Request") using `<Outlet/>`.
- **`shared/transaction-request-list.tsx`** — `TransactionRequestList` (`txnType: "deposit"|"withdraw"|"refund"`). TanStack Query keyed by brand/env/params; fixed search (`page 0, size 10, sortBy createdAt, DESC, filters { txnType }`); `select` normalizes envelope; renders `DataTable`.
- **`shared/transaction-request-columns.tsx`** — columns: Txn ID, PSP ID, Requested date, Amount, Txn fee, **Credit to Wallet** (`txnAmount - txnFee`), Status (colored badge), Actions. Status colors: green = `SUCCESS`/`PG_SUCCESS`; orange = `NEW`/`CREATED`/`INITIATED`/`PG_ACCEPTED`; red = `REJECTED`/`FAILED`/`PG_REJECTED`/`PG_FAILED`; gray default.
- Tabs `tabs/{deposit-request,withdrawal-request,refund-request}/list.tsx` wrap `TransactionRequestList`.
- **`pages/transactions/all.tsx`, `pending.tsx`, `completed.tsx`** — currently **static mock UIs** (hardcoded sample rows), not wired to the API. The live listing is the transaction-request tabs.

There is **no FE UI that calls `POST /transactions` or `PUT /.../status`** — transaction creation/state changes are driven server-to-server (client integrations / PG callbacks). The FE is read-only (search + limits admin).

---

## 7. End-to-end use cases

### 7.1 Initiate a transaction (create → auto-advance → session)
1. Caller `POST /transactions` with `TransactionDto`.
2. `TransactionFlowController.createTransaction` injects brand/env from auth context → `TransactionFlowService.createTransactionWithSession`.
3. `orchestrator.createTransaction`: entity built, `status=NEW`, customer fields enriched from Request.
4. `executeNextStep`: `NEW` → `[CREATED]` → `TransactionCreationStep` → 6 create validations + PSP-enabled check → saves version 1 (`CREATED`).
5. Recurse: `CREATED` → `[INITIATED]` → `TransactionInitiationStep` → builds `VmExecutionDto (step="initiate")` → `VMExecuteService.executeVmRequest` → `DenoVMResult` stored → saves version 2 (`INITIATED`).
6. Recurse: `INITIATED` → `[]` (waits for PG callback) → loop ends.
7. `createTransactionWithSession` reads `vmExecutionResponse`; if success, fetches PSP timeout, `sessionService.createSessionFromTransaction(...)` → `sessionUrl = widgetUrl + "/" + token`.
8. Returns `TransactionResponseDto { txnId, txnSuccess, txnMeta, txnError, sessionUrl }`.

### 7.2 Process through steps via PG callbacks
1. PG redirect/webhook handler builds a context for the `txnId`, puts a `DenoVMResult` into `customData` under `pgRedirectData` (redirect) or `pgWebhookData` (webhook).
2. `orchestrator.executeNextStep` (or `transitionToStatus`). `AbstractTransactionStep.execute` re-loads and locks the latest version.
3. Step selection uses flow config + `customPrecondition`: success redirect → `PG_ACCEPTED`; failure redirect → `PG_REJECTED`; webhook → `PG_SUCCESS`/`PG_FAILED` depending on flow config.
4. Chain continues to a terminal status (`SUCCESS`/`FAILED`/`REJECTED`), each transition writing a new version.

### 7.3 Manual status update
`PUT /transactions/{txnId}/status?status=X` → `moveToStatus` → `transitionToStatus`: `verifyTransition`, pick step for target, `executeStep` (locks latest, validates precondition, saves new version), then auto-advances.

### 7.4 Reads & search
- `GET /transactions/{txnId}` → `findLatestByTxnId` (max version) → 404 `TRANSACTION_NOT_FOUND` if none.
- `GET /transactions/{txnId}/status` → latest status only.
- `POST /transactions/search` → `TransactionQueryBuilder` builds a `Specification`: base `brandId=`, `environmentId=`, **`latestVersion()`** (subquery `version = max(version) per txnId`); filter mapping `txnTime→createdAt`, `txnStatus/status→status` (comma list → `IN`), `psp→pspId`, `customer/customerId→customerId`, `flowAction/flowActionId→flowActionId`, `txnType→transactionType`, `currency`, `amount`; `timeRange` → `TimeRange` → `createdBetween`. Default sort `createdAt DESC`, size 20.

### 7.5 Limits enforcement path (create-time routing)
Before transaction creation, PSP resolution loads enabled `TransactionLimit`s (pspIds, brand, env, actionId, currency), plus risk & routing rules, and runs the PSP filter pipeline. Historical spend totals from:
- `TransactionCalculationService` — `calculateTotalAmount(...)`, `calculateCustomerTotalAmount(...)`, `getStartTimeForDuration(RiskDuration)`. Sums only `SUCCESS`.
- `RoutingCalculationService` — `calculateRoutingThresholds(...)` returns per-PSP `RoutingCalculationResult(totalAmount, transactionCount, percentage)`; counts `SUCCESS`+`PG_SUCCESS`.
- `TransactionService.calculateFailureRate` / `calculateFailureRateByCustomer` — failed/total over window using `FAILURE_STATUSES`.
