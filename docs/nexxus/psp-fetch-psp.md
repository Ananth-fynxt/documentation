---
title: PSP & Fetch-PSP Routing
description: PSP configuration, routing/risk/fee rules, and the fetch-psp resolution pipeline.
---

# PSP, Routing & Fetch-PSP Module — Developer Documentation

Payments / PSP-orchestration platform (`nexxus`), `brand` service.
Backend base packages: `fynxt.brand.psp`, `fynxt.brand.pspgroup`, `fynxt.brand.flow`, `fynxt.brand.routingrule`, `fynxt.brand.riskrule`, `fynxt.brand.fee`.

This module is the **payment-routing brain** of the platform. It answers one central question at payment time: *given a merchant's payment request, which PSP(s) can and should process it, and what fee applies?* That is the **fetch-psp** operation (`POST /requests/fetch-psp` → `PspResolutionService`).

---

## 1. Overview

| Concept | Package | What it is |
|---|---|---|
| **PSP** | `psp` | A Payment Service Provider / acquirer configuration (credentials, timeout, IP rules, failure-rate config, flow target). The thing a payment is actually routed to. |
| **PSP Operation** | `psp` (`psp_operations`) | Per-PSP × per-flow-action capability: which currencies/countries a PSP supports for a given action, and the `flowDefinitionId` (the VM script) to run. |
| **Maintenance Window** | `psp` (`maintenance_windows`) | Time window during which a PSP (for an action) is unavailable. |
| **PSP Group** | `pspgroup` | Named, versioned grouping of PSPs for a (brand, env, action, currency). |
| **Flow** | `flow` | Flow Type → Flow Target → Flow Action → Flow Definition hierarchy. Defines the payment "shape" (deposit/withdraw), input/output JSON schemas, and the executable VM `code`. |
| **Routing Rule** | `routingrule` | Data-driven rule that narrows/selects PSPs by threshold (amount/percentage/count) + condition (currency/country). |
| **Risk Rule** | `riskrule` | Rule that BLOCKs or ALERTs on a PSP when a spend threshold over a duration is exceeded (default or per-customer). |
| **Fee** | `fee` | Versioned fee definition (inclusive/exclusive, fixed/percentage components) applied per PSP. |

### How they fit together (fetch-psp)
```
Merchant POST /requests/fetch-psp
        │
        ▼
  PspResolutionService.resolvePsps(request)
        │
        ├─ 1. fetchGlobalPsps        → active PSPs for (brand,env,action[,currency])
        ├─ 2. load RiskRules, TransactionLimits, RoutingRules (enabled, matching criteria)
        ├─ 3. PspFilterPipeline.applyFilters  (4 strategies, priority-ordered)
        │        ① RiskRuleFilter      (prio 1)  → drop BLOCK-ed PSPs
        │        ② TransactionLimitFilter (prio 2) → drop PSPs outside min/max
        │        ③ PspConfigurationFilter (prio 3) → maintenance/operation/IP/access/failure-rate
        │        ④ RoutingRuleFilter    (prio 4)  → threshold + condition selection
        │
        ▼   filteredPsps
  RequestServiceImpl.fetchPsp
        ├─ load Fee rules (enabled, matching)
        ├─ FeeCalculationService.calculateFeesForPsps → PspInfo[] (amounts + fee breakdown + flowTarget.inputSchema)
        └─ persist Request, RequestPsp, RequestFee, RequestRiskRule, RequestTransactionLimit
        │
        ▼
  RequestOutputDto { requestId, psps[] }   → merchant renders payment options
```

---

## 2. Data Model

All entities extend `AuditingEntity` (soft-delete + auditing) and use `fynxt.common.enums.Status` (`ENABLED`/`DISABLED`) mapped to PG enum `status`. Rule entities (routing/risk/fee/pspgroup/transaction-limit) are **versioned** via an embeddable composite id `(id, version)`; update inserts a new version.

### 2.1 PSP — table `psps`
`fynxt.brand.psp.entity.Psp`

| Field | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | UUID (PK) | |
| `name` | `name` | text | |
| `description` | `description` | text | |
| `logo` | `logo` | text | |
| `credential` | `credential` | jsonb NOT NULL | **encrypted** PSP gateway credentials |
| `timeout` | `timeout` | Integer | seconds; drives session timeout |
| `blockVpnAccess` | `block_vpn_access` | Boolean | IP validation |
| `blockDataCenterAccess` | `block_data_center_access` | Boolean | IP validation |
| `failureRate` | `failure_rate` | Boolean | enable failure-rate gating |
| `ipAddress` | `ip_address` | TEXT[] | IP allowlist |
| `brandId` | `brand_id` | UUID | tenant |
| `environmentId` | `environment_id` | UUID | tenant |
| `flowTargetId` | `flow_target_id` | String | links PSP to a flow target (inputSchema) |
| `status` | `status` | enum `status` | default `ENABLED` |
| `failureRateThreshold` | `failure_rate_threshold` | Float | max acceptable failure % |
| `failureRateDurationMinutes` | `failure_rate_duration_minutes` | Integer | window for failure-rate calc |

### 2.2 PSP Operation — table `psp_operations`
`(pspId, flowActionId)` composite (`PspOperationId`). Fields: `flowDefinitionId` (String), `status`, `currencies` (text[]), `countries` (text[]). Defines which currencies/countries a PSP supports for an action, and which flow definition (VM script) to run.

### 2.3 Maintenance Window — table `maintenance_windows`
`id` (Integer), `pspId` (UUID), `flowActionId` (String), `startAt`/`endAt` (LocalDateTime), `status`. A PSP whose action falls inside `[startAt, endAt]` with status `ENABLED` is filtered out.

### 2.4 PSP Group — tables `psp_groups` + `psp_group_psps`
`PspGroup` (`EmbeddablePspGroupId(id, version)`): `brandId`, `environmentId`, `name`, `flowActionId`, `currency`, `status`, `pspGroupPsps[]`. `PspGroupPsp` join: `(pspGroupId, pspGroupVersion, pspId)`.

### 2.5 Routing Rule — tables `routing_rules` + `routing_rule_psps`
`RoutingRule` (`EmbeddableRoutingRuleId(id, version)`):

| Field | Column | Type |
|---|---|---|
| `name` | `name` | String |
| `brandId`/`environmentId` | | UUID |
| `pspSelectionMode` | `psp_selection_mode` | enum `PspSelectionMode` = `PRIORITY` \| `WEIGHTAGE` |
| `routingType` | `routing_type` | enum `RoutingType` = `AMOUNT` \| `PERCENTAGE` \| `COUNT` |
| `duration` | `duration` | enum `RoutingDuration` = `HOUR` \| `DAY` \| `WEEK` \| `MONTH` |
| `conditionJson` | `condition_json` | jsonb — currency/country match condition |
| `status` | `status` | enum |

`RoutingRulePsp` carries per-PSP `pspValue` (the threshold value) + `pspId`.

### 2.6 Risk Rule — tables `risk_rule` + `risk_rule_psps`
`RiskRule` (`EmbeddableRiskRuleId(id, version)`):

| Field | Column | Type |
|---|---|---|
| `name` | `name` | String |
| `type` | `type` | enum `RiskType` = `DEFAULT` \| `CUSTOMER` |
| `action` | `action` | enum `RiskAction` = `BLOCK` \| `ALERT` |
| `currency` | `currency` | String |
| `duration` | `duration` | enum `RiskDuration` = `HOUR` \| `DAY` \| `WEEK` \| `MONTH` |
| `maxAmount` | `max_amount` | BigDecimal — the spend threshold |
| `brandId`/`environmentId` | | UUID |
| `flowActionId` | `flow_action_id` | String |
| `criteriaType` | `criteria_type` | enum `RiskCustomerCriteriaType` = `TAG` \| `ACCOUNT_TYPE` (customer rules) |
| `criteriaValue` | `criteria_value` | text[] |
| `status` | `status` | enum |

`RiskRulePsp` links the rule to affected PSPs.

### 2.7 Fee — tables `fee` + `fee_components` + `fee_psps`
`Fee` (`EmbeddableFeeId(id, version)`): `name`, `currency`, `countries` (text[]), `chargeFeeType` (enum `ChargeFeeType` = `INCLUSIVE` \| `EXCLUSIVE`), `brandId`, `environmentId`, `flowActionId`, `status`. `FeeComponent` (`EmbeddableFeeComponentId`): `type` (enum `FeeComponentType` = `FIXED` \| `PERCENTAGE`), `amount`, `minValue`, `maxValue` (min/max as % of txn amount, applied to percentage components). `FeePsp` links a fee to PSPs.

---

## 3. Fetch-PSP / Routing Logic (CORE)

### 3.1 Entry point — `PspResolutionService.resolvePsps(RequestInputDto)`

**Step 1 — Fetch global PSPs (`fetchGlobalPsps`), first-match strategy:**
1. `findActivePspsByBrandEnvironmentActionAndCurrency(brand, env, action, currency)` → strategy `CURRENCY_ACTION`.
2. If empty: `findActivePspsByBrandEnvironmentAndAction(brand, env, action)` → strategy `ACTION_ONLY`.
3. If still empty → return empty result, `fetchStrategy="NONE"`.

**Step 2 — Load rule data (only if PSPs found):**
- `riskRules` = `riskRuleService.readLatestEnabledRiskRulesByCriteria(pspIds, brand, env, action, currency, RiskAction.BLOCK, ENABLED)`.
- `transactionLimits` = `transactionLimitService.readLatestEnabledTransactionLimitsByCriteria(pspIds, brand, env, action, currency, ENABLED)`.
- `routingRules` = `routingRuleService.findEnabledRoutingRulesByBrandAndEnvironment(brand, env)`.

**Step 3 — Run the filter pipeline** (`PspFilterContext.initialize` seeds `filteredPsps = originalPsps`).

Result (`PspResolutionResult`): `filteredPsps`, `globalPsps`, `riskRules`, `transactionLimits`, `resolvedByStrategy` (`"CompleteFilterPipeline"` or `"GlobalPspResolution"`), `usedRoutingRuleRefinement` (routingRules non-empty), `fetchStrategy`.

### 3.2 The filter pipeline — `PspFilterPipeline.applyFilters`
Strategies are Spring-injected `PspFilterStrategy` beans, filtered by `shouldApply(context)`, sorted by `getPriority()`, applied in order. After each strategy, `<name>_filtered_count` is recorded in `filterMetadata`. **Short-circuits** as soon as `filteredPsps` becomes empty.

Interface `PspFilterStrategy`: `apply(ctx)`, `getPriority()`, `getStrategyName()`, `shouldApply(ctx)`.

| Priority | Strategy | Applies when | Effect |
|---|---|---|---|
| 1 | `RiskRuleFilter` | risk rules present | removes BLOCK-ed PSPs |
| 2 | `TransactionLimitFilter` | limits present & amount non-null | removes PSPs whose limits reject the amount |
| 3 | `PspConfigurationFilter` | always | maintenance → operation → IP → access → failure-rate |
| 4 | `RoutingRuleFilter` | routing rules present | threshold + condition selection |

### 3.3 ① RiskRuleFilter (`RiskRuleFilterStrategy`, priority 1)
For each rule, `isRiskRuleApplicable`:
- Rule must match `flowActionId` **and** `currency` of the request.
- **`DEFAULT` rule** (`isDefaultRuleApplicable`): sum successful transaction amounts across the rule's PSPs over `[startTime, now]` (window from `RiskDuration`) via `TransactionCalculationService.calculateTotalAmountForPsps`; rule applies if `total + request.amount > rule.maxAmount`.
- **`CUSTOMER` rule** (`isCustomerRuleApplicable`): first `isCustomerCriteriaValid` — if `criteriaType`/`criteriaValue` set, the request's `customerTag` (TAG) or `customerAccountType` (ACCOUNT_TYPE) must match (case-insensitive); then sum the customer's spend (`calculateCustomerTotalAmount` by tag / account-type / customerId) and apply if `customerTotal + amount > maxAmount`.

When a rule applies: `BLOCK` action → add its PSPs to `blockedPspIds`; `ALERT` → add to `alertPspIds` (email TODO, not yet implemented). Blocked PSPs removed from `filteredPsps`. Metadata: `risk_rule_blocked_psps`, `risk_rule_alert_psps`. Any calc exception → rule treated as **not** applicable (fail-open).

### 3.4 ② TransactionLimitFilter (`TransactionLimitFilterStrategy`, priority 2)
For each PSP, find the limits that reference it (`limitAppliesToPsp`). If a PSP has **no** applicable limit → **kept** (pass-through). Otherwise the PSP is kept if **any** applicable limit says `isTransactionAllowed`:
- limit `currency` must equal request currency;
- if limit has `countries`, request `country` must be in them;
- if limit has `customerTags`, request `customerTag` must match (case-insensitive);
- at least one `pspAction` with matching `flowActionId` and `minAmount ≤ amount ≤ maxAmount` (null min/max = unbounded).

Metadata: `transaction_limit_filtered_count`.

### 3.5 ③ PspConfigurationFilter (`PspConfigurationFilterStrategy`, priority 3)
Always applies. Chains five sub-filters, short-circuiting on empty:
1. `MaintenanceWindowService.filterPspsNotInMaintenance(psps, actionId)` — drops PSPs currently in an enabled maintenance window for the action.
2. `PspOperationValidationService.filterValidPspOperations(psps, request)` — keeps PSPs whose `psp_operations` row for the action is enabled and supports the request currency/country.
3. `IpValidationService.filterValidIps(psps, request)` — enforces `ipAddress` allowlist + `blockVpnAccess`/`blockDataCenterAccess` against the caller's `clientIpAddress` (uses `IpApiService`/`IpApiResponse` for VPN/DC lookup).
4. `AccessValidationService.filterValidAccess(psps, request)` — additional access checks.
5. `FailureRateValidationService.filterValidFailureRates(psps, request)` — for PSPs with `failureRate=true`, drops those whose recent failure % over `failureRateDurationMinutes` exceeds `failureRateThreshold`.

Metadata: `psp_configuration_filtered_count`.

### 3.6 ④ RoutingRuleFilter (`RoutingRuleFilterStrategy`, priority 4)
Runs **last** (refines the already-valid PSP set):
1. Compute per-PSP routing metrics once: `RoutingCalculationService.calculateRoutingThresholds(rules, brand, env, action, currency, [startTime,now])` → `Map<pspId, RoutingCalculationResult(totalAmount, transactionCount, percentage)>`. Window from `rules.get(0).duration`.
2. For each rule in order, if `isRoutingRuleApplicable` (evaluates `conditionJson` against `{currency, country}` via `ConditionValidator.matches`; null condition = applies):
   - If `routingType == null` → select the rule's PSPs that are present in the current set (pure allowlist).
   - Else, keep each rule PSP whose metric is **within** its `pspValue` threshold: `AMOUNT` → `totalAmount ≤ value`; `PERCENTAGE` → `percentage ≤ value`; `COUNT` → `transactionCount ≤ value`. Missing metric → within (kept).
   - **First rule that yields ≥1 PSP wins** (`break`).
3. If no rule produced PSPs → **fall back to the current PSP set** (routing never empties the result on its own). Metadata: `routing_rule_filtered_count`.

`pspSelectionMode` (`PRIORITY`/`WEIGHTAGE`) is stored on the rule for downstream ordering/weighting; the threshold filter itself is mode-agnostic.

### 3.7 Fee calculation — `FeeCalculationService.calculateFeesForPsps`
Called by `RequestServiceImpl.fetchPsp` **after** resolution, with the enabled fee rules (`feeService.readLatestEnabledFeeRulesByCriteria`). For each filtered PSP:
- Resolve `flowTargetId → FlowTargetDto` (cached via `FlowTargetLookupService.readByIds`, `flowCacheManager`, cache `FLOW_TARGET_CACHE`) to attach `flowTarget.inputSchema`.
- Resolve `flowDefinitionId` per PSP via `PspOperationsService.fetchFlowDefinitionIds(pspIds, actionId)`.
- Apply the PSP's applicable fees (`FeePsp` link). Per component: `FIXED` → `amount`; `PERCENTAGE` → `amount% of txnAmount`, clamped to `minValue%..maxValue%` of txn amount. Round HALF_UP to 2 dp.
- Aggregate into inclusive vs exclusive buckets:
  - `totalAmount = originalAmount + exclusiveFee` (exclusive fees added on top, charged to payer)
  - `netAmountToUser = originalAmount − inclusiveFee` (inclusive fees deducted from amount)
  - `isFeeApplied = totalFee > 0`
- Emits `RequestOutputDto.PspInfo{ id, name, description, logo, brandId, environmentId, flowActionId, flowDefintionId, currency, originalAmount, appliedFeeAmount, totalAmount, netAmountToUser, inclusiveFeeAmount, exclusiveFeeAmount, isFeeApplied, flowTarget{flowTargetId, inputSchema} }`.

### 3.8 Persistence (fetch-psp side effects)
`RequestServiceImpl.fetchPsp` (transactional): save `Request` → resolve PSPs → compute fees → persist `RequestPsp` (per PspInfo), `RequestRiskRule`, `RequestFee`, `RequestTransactionLimit` snapshots → return `RequestOutputDto{ requestId, psps[] }`. These snapshots let the later `POST /transactions` validate `RequestPspId(requestId, pspId)` mapping (see Transaction module §5.2).

---

## 4. REST API Endpoints

All admin controllers below are `@RequiresScope({"FI","BRAND"})` with per-method `@RequiresPermission`. Brand/env from `X-BRAND-ID`/`X-ENV-ID` headers (fallback to auth context). Responses wrapped in `ApiResponse<Object>`.

### 4.1 `PspController` — `/psps` (permission module `psps`: create/read/update — **no delete**)
| Method | Path | Perm | Notes |
|---|---|---|---|
| POST | `/psps` | create | body `PspDto`; brand/env from header |
| GET | `/psps/{pspId}` | read | |
| GET | `/psps` | read | all for brand+env |
| GET | `/psps/{flowActionId}/{status}/{currency}` | read | filter by action+status+currency |
| GET | `/psps/{flowActionId}/{status}` | read | filter by action+status |
| GET | `/psps/currencies` | read | supported currencies for brand+env |
| GET | `/psps/countries` | read | supported countries for brand+env |
| PUT | `/psps/{pspId}` | update | body `UpdatePspDto` |
| PUT | `/psps/{pspId}/{status}` | update | status change |

### 4.2 `PspGroupController` — `/psp-groups` (module `psp_groups`: full CRUD)
POST `/psp-groups` (create, headers required `@NotNull`), GET `/psp-groups/{id}` (read latest version), GET `/psp-groups` (read by brand+env), GET `/psp-groups/psp/{pspId}` (read), PUT `/psp-groups/{id}` (update → new version), DELETE `/psp-groups/{id}` (soft delete).

### 4.3 `RoutingRuleController` — `/routing-rules` (module `routing_rules`: full CRUD)
POST, GET `/routing-rules/{id}`, GET `/routing-rules` (by brand+env), PUT `/routing-rules/{id}`, DELETE `/routing-rules/{id}`. IDs are String (versioned rule id).

### 4.4 `RiskRuleController` — `/risk-rules` (`@RequestMapping("risk-rules")`; module `risk_rules`: full CRUD)
POST, GET `/risk-rules/{id}` (latest), GET `/risk-rules/{id}/version/{version}`, GET `/risk-rules` (by brand+env), GET `/risk-rules/psp/{pspId}`, PUT `/risk-rules/{id}`, DELETE `/risk-rules/{id}`.

### 4.5 `FeeController` — `/fees` (module `fees`: full CRUD)
POST, GET `/fees/{id}` (latest), GET `/fees` (by brand+env), GET `/fees/psp/{pspId}`, PUT `/fees/{id}`, DELETE `/fees/{id}`.

### 4.6 Flow controllers (no `@RequiresScope`/permission annotations observed — platform/config level)
- `FlowTypeController` — `/flow-types`: POST, GET, GET `/{id}`, PUT `/{id}`, DELETE `/{id}`, GET `/name/{name}`.
- `FlowTargetController` — `/flow-types/{flowTypeId}/flow-targets`: POST, GET, GET `/{id}`, PUT `/{id}`, DELETE `/{id}`.
- `FlowActionController` — `/flow-types/{flowTypeId}/flow-actions`: POST, GET, GET `/{id}`, GET `/name/{name}`, PUT `/{id}`, DELETE `/{id}`.
- `FlowDefinitionController` — `/flow-definitions`: POST, GET, GET `/flow-target/{flowTargetId}`, GET `/{id}`, PUT `/{id}`, DELETE `/{id}`. The Flow Definition holds `flowConfiguration` (state-transition JSON) + `code` (VM script) consumed by the Transaction orchestrator.

### 4.7 Fetch-PSP (the runtime endpoint) — `/requests/fetch-psp`
`POST /nexxus/v1/requests/fetch-psp`, `@RequiresScope({"EXTERNAL"})`, `X-SECRET-TOKEN` auth. Body `RequestInputDto{ amount, currency, actionId, country, customerId, customerTag, customerAccountType }` (all `@NotBlank`/`@NotNull @Positive`). Returns `RequestOutputDto{ requestId, psps[] }`. (See External-API module for auth details.)

---

## 5. Validations

### 5.1 Bean/DTO validations
- **RoutingRuleDto**: `@PspSelectionModeValidation` custom class-level validator (`PspSelectionModeValidator`) — enforces PSP-value consistency with `pspSelectionMode` (PRIORITY vs WEIGHTAGE) and routing type.
- **RiskRuleDto**: `@ValidCustomerCriteria` (`ValidCustomerCriteriaValidator`) — for `CUSTOMER` type, requires coherent `criteriaType`+`criteriaValue`.
- **FeeDto**: `@ValidFeeComponents` (`FeeComponentsValidator`) — validates component set (types, min/max coherence).
- **RoutingRule** `conditionJson` validated/evaluated via `ConditionValidator`.
- Path IDs `@NotBlank`; PSP config headers `@NotNull` (psp-groups) or fallback-to-context (others).

### 5.2 Runtime resolution "validations" (filters — see §3)
Each filter is fail-safe: risk/routing calc exceptions → treat rule as non-applicable (fail-open), so a data/calc error does not block all PSPs. TransactionLimit is fail-permissive for PSPs with no applicable limit. RoutingRule never returns an empty set on its own (falls back to input).

### 5.3 Error codes (`fynxt.common.enums.ErrorCode`, PSP/rule related)
`PSP_NOT_FOUND`, `PSP_ALREADY_EXISTS`, `PSP_DISABLED` (via `getPspIfEnabled`), `PSP_GROUP_NOT_FOUND`/`_ALREADY_EXISTS`, `ROUTING_RULE_NOT_FOUND`/`_ALREADY_EXISTS`, `RISK_RULE_NOT_FOUND`/`_ALREADY_EXISTS`, `FEE_NOT_FOUND`/`_ALREADY_EXISTS`, `FLOW_DEFINITION_NOT_FOUND`, `TRANSACTION_LIMIT_*`. (Duplicate name checks per (brand,env,name) → 409; missing → 404.)

---

## 6. Frontend Integration

### 6.1 Services (`frontend/src/api/services/`)
- `psp.service.ts` — PSP CRUD + status + currencies/countries + by-action queries.
- `psp-group.service.ts` — PSP group CRUD.
- `routing-rules.service.ts` — routing rule CRUD.
- `risk.service.ts` / `rule.service.ts` — risk rule CRUD.
- `fee.service.ts` — fee CRUD.
- `flow.service.ts` — flow types/targets/actions/definitions.
All auto-inject `X-BRAND-ID`/`X-ENV-ID`.

### 6.2 Pages (`frontend/src/pages/`)
- `psp/` — PSP configuration UI (credentials, IP rules, failure-rate, operations, maintenance windows).
- `rules/` — routing rule + risk rule builders (threshold config, condition builder, PSP selection with priority/weightage).
- `conversion-rate/` — fee / rate configuration.
- `configuration/` — cross-cutting config tabs (webhooks etc.).

---

## 7. End-to-End Use Cases

### 7.1 Configure a PSP
Admin (`psps:create`) → `POST /psps` with credentials (encrypted server-side into `credential` jsonb), `timeout`, IP rules, `failureRateThreshold`/`failureRateDurationMinutes`, `flowTargetId`. Then define `psp_operations` (supported currencies/countries + `flowDefinitionId` per action) and optional `maintenance_windows`.

### 7.2 Build a routing rule
Admin (`routing_rules:create`) → `POST /routing-rules` with `routingType` (AMOUNT/PERCENTAGE/COUNT), `duration`, `conditionJson` (currency/country), `pspSelectionMode`, and per-PSP `pspValue` thresholds. Stored versioned.

### 7.3 Fetch/select PSP at payment time (the core flow)
1. Merchant `POST /requests/fetch-psp` (secret-token) `{amount, currency, actionId, country, customerId, customerTag, customerAccountType}`.
2. `PspResolutionService`: fetch active PSPs (currency+action, else action-only) → load risk/limit/routing rules → run pipeline: RiskRuleFilter (drop BLOCKed) → TransactionLimitFilter (drop out-of-range) → PspConfigurationFilter (maintenance/operation/IP/access/failure-rate) → RoutingRuleFilter (threshold+condition selection).
3. `FeeCalculationService` computes per-PSP fees + attaches `flowTarget.inputSchema` + `flowDefinitionId`.
4. Persist Request + RequestPsp/RequestFee/RequestRiskRule/RequestTransactionLimit snapshots.
5. Return `{ requestId, psps[] }`; merchant shows the eligible PSPs with final amounts, then creates a transaction against one of them (`POST /transactions`, which re-validates the `RequestPspId` mapping).

### 7.4 Fee calc example
Request amount 100 USD. PSP has one EXCLUSIVE fee: PERCENTAGE component 2.5% (min 1%, max 5%). `feeAmount = 2.50`; within [1.00, 5.00]. `totalAmount = 102.50`, `netAmountToUser = 100` (no inclusive), `isFeeApplied = true`. If instead INCLUSIVE: `totalAmount = 100`, `netAmountToUser = 97.50`.

---

## 8. Notable Observations
- **Filter order matters and is fixed by `getPriority()`**: Risk(1) → Limit(2) → Config(3) → Routing(4). Routing runs last and never empties the set alone.
- **Fail-open risk/routing**: any exception in threshold calculation silently treats the rule as non-applicable — a broken rule cannot block payments, but also cannot enforce.
- **Fees are NOT part of `PspResolutionResult`** (it sets `feeRules = List.of()`); fees are loaded and applied separately in `RequestServiceImpl.fetchPsp`.
- **`PspController` has no `delete`** permission/endpoint — PSPs are disabled via status, not removed.
- `FlowTargetLookupService` uses a manual cache-aside `readByIds` (batch) plus a `@Cacheable` single-id `readById`, both on `flowCacheManager` (shared with transaction flow-config cache).
