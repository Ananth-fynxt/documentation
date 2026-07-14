---
title: Request Domain & Persistence
description: The Request domain — payment intent plus routing-decision snapshots.
---

# Request Domain & Fetch-PSP Persistence

The **Request** domain is the durable record of a single fetch-psp call — the payment intent a merchant submits *before* a transaction exists, plus a **snapshot** of every routing decision the platform made for it. It is the bridge between PSP resolution (section 5) and transaction creation (section 8).

## 1. What

A **Request** is created every time a merchant calls `POST /requests/fetch-psp`. It captures the payment intent (amount, currency, action, country, customer attributes) and, through four join tables, **freezes** which PSPs were offered and which fee/risk/limit rule *versions* applied at that moment.

## 2. Why

- **Idempotent linkage to transactions.** A later `POST /transactions` must reference a `requestId` and a `pspId` that were actually offered. The `request_psps` snapshot is what `TransactionCreationStep.validateRequestIdAndPspIdMapping` checks (`RequestPspId(requestId, pspId)` must exist) — a merchant cannot create a transaction against a PSP that was never offered for that request.
- **Auditability / reproducibility.** Rules are versioned; a Request pins the exact rule versions used, so you can reconstruct *why* a given PSP set was returned even after the rules change.
- **Amount validation.** `TransactionCreationStep.validateTxnAmountMatchesRequestAmount` compares the transaction's amount/currency/action against the stored Request — preventing tampering between fetch-psp and create.

## 3. Where

- Backend: `fynxt.brand.request` — `controller/RequestController`, `service/impl/RequestServiceImpl`, `dto/{RequestInputDto,RequestOutputDto}`, `entity/*` (9 classes), mappers.
- Tables (Liquibase `011-create-request-tables.sql`): `requests`, `request_psps`, `request_fees`, `request_risk_rules`, `request_transaction_limits`.
- Collaborators: `PspResolutionService` (section 5), `FeeCalculationService` (section 5), the rule services (fee/risk/limit).

## 4. How — data model

### `requests`
`fynxt.brand.request.entity.Request` (plain audit columns, not soft-deletable):

| Field | Column | Type | Notes |
|---|---|---|---|
| `id` | `id` | UUID (PK) | the `requestId` returned to the merchant |
| `brandId` | `brand_id` | UUID NOT NULL | tenant (from secret-token env) |
| `environmentId` | `environment_id` | UUID NOT NULL | tenant |
| `customerId` | `customer_id` | text NOT NULL | |
| `customerTag` | `customer_tag` | text | feeds risk rules |
| `customerAccountType` | `customer_account_type` | text | feeds risk rules |
| `flowActionId` | `flow_action_id` | text NOT NULL | deposit/withdraw/… |
| `amount` | `amount` | numeric | the intent amount |
| `currency` | `currency` | text | |
| `country` | `country` | text | feeds routing/limit rules |
| `createdAt/By`, `updatedAt/By` | | | audit |

### Snapshot join tables (all `@IdClass` composite PKs)
| Table | Entity | Composite PK | Extra columns |
|---|---|---|---|
| `request_psps` | `RequestPsp` | `(requestId, pspId)` | `flowTargetId`, `flowDefinitionId`, `currency` (+ fee amounts) |
| `request_fees` | `RequestFee` | `(requestId, feeId, feeVersion)` | pins the fee rule **version** |
| `request_risk_rules` | `RequestRiskRule` | `(requestId, riskRuleId, riskRuleVersion)` | pins the risk rule version |
| `request_transaction_limits` | `RequestTransactionLimit` | `(requestId, transactionLimitId, transactionLimitVersion)` | pins the limit version |

The `*_version` columns are the crux: because fee/risk/limit rules are versioned (new version on every edit), snapshotting `(id, version)` makes the Request an immutable record of the exact rule set evaluated.

## 5. How — fetch-psp lifecycle (`RequestServiceImpl.fetchPsp`, `@Transactional`)

```
POST /requests/fetch-psp  (X-SECRET-TOKEN → brand/env context; clientIpAddress from X-Forwarded-For)
        │
1. build Request from RequestInputDto (+ brandId/environmentId/clientIpAddress server-set)
2. requestRepository.save(request)                       → requests row (mints requestId)
3. resolutionResult = pspResolutionService.resolvePsps(input)   → filteredPsps  (section 5 pipeline)
4. feeRules = feeService.readLatestEnabledFeeRulesByCriteria(...)   (only if filteredPsps non-empty)
5. pspsWithFees = feeCalculationService.calculateFeesForPsps(filteredPsps, feeRules, input)  → PspInfo[]
6. persist snapshots:
     createPsps()             → request_psps  (one per PspInfo)
     create RequestRiskRule   → request_risk_rules
     create RequestFee        → request_fees
     create RequestTransactionLimit → request_transaction_limits
        │
7. return RequestOutputDto { requestId, psps:[PspInfo...] }
```

`RequestInputDto` (validated): `amount` `@NotNull @Positive`, `currency`/`actionId`/`country`/`customerId`/`customerTag`/`customerAccountType` all `@NotBlank`. `brandId`, `environmentId`, `clientIpAddress` are server-set (read-only). Missing brand/env context → 400 `MISSING_REQUIRED_PARAMETER`.

`RequestOutputDto.PspInfo` (per offered PSP): `id`, `name`, `description`, `logo`, `brandId`, `environmentId`, `flowActionId`, `flowDefintionId`, `currency`, `originalAmount`, `appliedFeeAmount`, `totalAmount`, `netAmountToUser`, `inclusiveFeeAmount`, `exclusiveFeeAmount`, `isFeeApplied`, `flowTarget{ flowTargetId, inputSchema }`. The `inputSchema` tells the merchant/widget what fields to collect for that PSP; `flowDefinitionId`/`flowTargetId` are what the subsequent transaction/VM will execute.

## 6. Validations

- Bean: `RequestInputDto` constraints above; auth via `@RequiresScope({"EXTERNAL"})` + `X-SECRET-TOKEN`.
- Business: no eligible PSP → `RequestOutputDto` with empty `psps[]` (not an error); the merchant simply has no payment option.
- Downstream (enforced at transaction time, section 8 §5.2): `RequestPspId` mapping must exist; amount/currency/action must match the Request; a Request already mapped to a transaction is rejected (`DUPLICATE_RESOURCE`).

## 7. Use case — request → transaction handoff
1. Merchant `POST /requests/fetch-psp {amount:100, currency:"USD", actionId:"deposit", country:"US", customerId, customerTag, customerAccountType}`.
2. Platform resolves 3 PSPs, computes fees, snapshots rule versions, returns `{ requestId:R, psps:[A,B,C] }` — each with `totalAmount` and `flowTarget.inputSchema`.
3. Merchant renders A/B/C, user picks B, fills B's `inputSchema` fields.
4. Merchant `POST /transactions { requestId:R, pspId:B, txnAmount:100, txnCurrency:"USD", flowActionId:"deposit", flowTargetId:..., externalRequestId, executePayload:{...} }`.
5. `TransactionCreationStep` validates: `RequestPspId(R, B)` exists ✓, Request R amount/currency/action match ✓, R not already used ✓ → transaction created; flow proceeds (section 8 + 7).
