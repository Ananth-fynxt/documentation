---
title: CRM / External Integration API
description: Corrected, complete external-integration contract — key management, runtime payment APIs, webhooks, and status.
---

# CRM / External Integration API

The authoritative contract for integrating an external system (e.g. a CRM) with Nexxus. Covers **key management** (brand signup + key rotation), the **runtime payment APIs** (flow actions → fetch-psp → transaction → status), **callbacks** (session/redirect + outbound webhooks), and the **embedded admin components**. Every field, header, error code, and ID format below is verified against the `brand` service source.

> This supersedes earlier integration drafts. Several claims in prior drafts were inaccurate — corrected here and flagged in §10.

---

## 1. Environments, Base URL & Identifiers

- **Base URL (prod):** `https://api.nexxus.fynxt.io/nexxus/v1`
- **Global prefix:** every path is under `/nexxus/v1`. HTTPS only.
- **Response envelope (all endpoints):**
  ```json
  { "timestamp": "2026-03-23T17:44:52Z", "code": "0000", "message": "...", "data": { } }
  ```
  `code` is the **application code**, not the HTTP status. Success = **`"0000"`**. (HTTP status is separate: 200/201 on success.)

### Identifier formats (verified)
| Entity | Format | Example |
|---|---|---|
| Brand id | **UUID** | `d290f1ee-6c54-4b01-90e6-d701748f0851` |
| Environment id | **UUID** | `4f8a…` |
| Environment secret (= API key) | **UUID** | `06392b12-1b06-4c34-b884-60fa9389f795` |
| Environment token | **UUID** | `…` |
| PSP id | **UUID** | `…` |
| Request id | **UUID** | `…` |
| Transaction id (`txnId`) | `ortx` + 12 alphanumerics | `ortx5nF7t1aEFS0P` |
| Flow ids (`flowTypeId`, `flowActionId`, `flowTargetId`, `flowDefinitionId`) | opaque string (config-generated) | `ftp_jUTDYCjauFgk…`, `fat_deposit_001` |

> **Correction:** brand/environment/PSP/request IDs and the API key are **UUIDs**, not `brn_`/`env_`/`sec_`-prefixed strings. Treat every ID as an opaque string returned by the API and echo it back verbatim; do not assume a prefix. Flow IDs are configured per environment and are constant for a given deployment.

---

## 2. Authentication Model (verified — read carefully)

Three headers, resolved in this priority order by the auth filter:

| Header | Who uses it | Applies to | What it proves |
|---|---|---|---|
| `X-ADMIN-TOKEN: <secret>` | **Internal ops only** | `/brands/**`, `/environments/**` | matches the server's configured admin token → bypasses RBAC |
| `X-SECRET-TOKEN: <env-secret-UUID>` | **CRM (runtime)** | flow / requests / transactions / psps / fees / rules / webhooks | resolves the environment → sets `brandId` + `environmentId` context |
| `Authorization: Bearer <jwt>` (+ `X-BRAND-ID`, `X-ENV-ID`) | Admin console / embedded components | config endpoints | user identity + RBAC |

### How the API key actually works (corrected)
- The environment **secret** is a random **`UUID.randomUUID()`**, stored in `environments.secret` and returned **once** at brand creation / rotation.
- On every runtime call the CRM sends `X-SECRET-TOKEN: <that-UUID>`.
- Nexxus does `UUID.fromString(token)` then a **direct database lookup** `findBySecret(uuid)`. If the token is not a valid UUID or has no matching environment → **`1015` Invalid secret token** (HTTP 401).

> **Correction:** the secret is **not SHA-256 hashed**. There is no "hash the incoming key and compare" step. Security rests on the secret being an unguessable random UUID matched directly, transmitted only over HTTPS. It is stored in the database as the raw UUID (unique, and nulled from normal read responses). If hashed-at-rest storage is a requirement, that is a **change request**, not current behaviour.

### Security rules (accurate)
- `X-ADMIN-TOKEN` is required **only** for Brand Signup and Environment secret rotation.
- The API key (secret) is returned only at creation/rotation and is **not retrievable** afterward via normal reads (`sanitizeSecrets` nulls it). It can be re-fetched via the credentials endpoint or regenerated via rotate.
- Rotating a secret **immediately invalidates** the old one.
- Send secrets over HTTPS only; keep them out of logs.

---

## 3. Key Management

### 3.1 Brand Signup (API key generation)
`POST /nexxus/v1/brands` — internal, `X-ADMIN-TOKEN`.

**Headers:** `X-ADMIN-TOKEN: <secret>`, `Content-Type: application/json`

**Body:**
```json
{ "name": "AXI", "email": "axi@example.com" }
```
`name` required (`@NotBlank`); `email` `@Email` (optional at bean level, but the column is NOT NULL — always send a valid email).

**Success (HTTP 201, `code:"0000"`):** creating a brand auto-provisions a default **Production** environment; its `apiKey` (the environment `secret`) is returned **once**.
```json
{
  "timestamp": "2026-03-23T17:32:13Z",
  "code": "0000",
  "message": "Resource created successfully",
  "data": {
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "name": "AXI",
    "email": "axi@example.com",
    "createdAt": "2026-03-23T17:32:13",
    "updatedAt": "2026-03-23T17:32:13",
    "environments": [
      {
        "id": "4f8a2c10-9b3e-4d21-8c77-1a2b3c4d5e6f",   // environmentId — store this
        "apiKey": "06392b12-1b06-4c34-b884-60fa9389f795", // the X-SECRET-TOKEN — store securely, shown once
        "name": "Production"
      }
    ]
  }
}
```
**Store both `data.environments[0].id` (environmentId) and `apiKey` (secret).** The CRM sends the `apiKey` as `X-SECRET-TOKEN` on all runtime calls.

**Errors:**
| HTTP | code | message |
|---|---|---|
| 400 | `1001` | Validation failed (e.g. "Brand name is required") |
| 401 | `1014` | Invalid token (bad `X-ADMIN-TOKEN`) |
| 409 | `1007` / `1018` | brand name/email already exists |

### 3.2 API Key Rotation (overwrite)
`PUT /nexxus/v1/environments/{environmentId}/rotate-secret` — internal, `X-ADMIN-TOKEN`.

**Path param:** `environmentId` (UUID, from signup response). **Body:** empty `{}`.

**Success (HTTP 200, `code:"0000"`):** returns the **new** `secret` (+ `token`) — the only time they're shown. The old secret is invalidated immediately.
```json
{
  "timestamp": "2026-03-23T08:30:00Z",
  "code": "0000",
  "message": "Environment secret rotated successfully",
  "data": {
    "id": "4f8a2c10-9b3e-4d21-8c77-1a2b3c4d5e6f",
    "name": "Production",
    "secret": "b7e2f9a1-3c4d-4e5f-8a9b-0c1d2e3f4a5b",  // new X-SECRET-TOKEN
    "token":  "…",
    "brandId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "createdAt": "…", "updatedAt": "…"
  }
}
```
CRM must replace its stored key immediately.

**Errors:** 401 `1014` (bad admin token); 404 `1023` (environment not found); 500 `1000` (unexpected).

> **Correction:** the endpoint field is `secret` (the API key). Prior drafts showed `sec_…`/`tok_…` prefixed values — real values are UUIDs.

---

## 4. Runtime Payment APIs (CRM → Nexxus, `X-SECRET-TOKEN`)

All three require `X-SECRET-TOKEN: <env-secret-UUID>` + `Content-Type: application/json`. `brandId`/`environmentId` are derived from the token — never send them in the body.

### 4.1 Flow Actions
`GET /nexxus/v1/flow-types/{flowTypeId}/flow-actions`

`flowTypeId` is a constant configured per environment. Returns the available actions (Deposit/Withdraw/Refund) with their status steps and JSON schemas.
```json
{ "code": "0000", "message": "Flow actions retrieved successfully", "data": [
  { "id": "fat_deposit_001", "name": "Deposit",
    "steps": ["CREATED","INITIATED","PG_ACCEPTED"],
    "flowTypeId": "ftp_…",
    "inputSchema":  "{\"type\":\"object\",\"properties\":{\"amount\":{\"type\":\"number\"}}}",
    "outputSchema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}" } ] }
```
Use the returned `id` as `actionId` in fetch-psp and as `flowActionId` in the transaction.

### 4.2 Fetch PSP
`POST /nexxus/v1/requests/fetch-psp`

**Body:**
```json
{
  "amount": 100.00,
  "currency": "USD",
  "actionId": "fat_deposit_001",
  "country": "US",
  "customerId": "brand_customer_001",
  "customerTag": "premium",
  "customerAccountType": "INDIVIDUAL"
}
```
All fields required. `customerId`/`customerTag`/`customerAccountType` feed risk rules — send your CRM customer identifiers; Nexxus stores them for risk evaluation.

**Success:** returns a `requestId` and the eligible PSPs after routing/risk/limit filtering + fee calc.
```json
{ "code": "0000", "data": {
  "requestId": "…uuid…",
  "psps": [ {
    "id": "…psp-uuid…", "name": "SticPay", "logo": "…",
    "brandId": "…", "environmentId": "…",
    "flowActionId": "fat_deposit_001", "flowDefintionId": "…",
    "currency": "USD",
    "originalAmount": 100.00, "appliedFeeAmount": 2.50,
    "totalAmount": 102.50, "netAmountToUser": 97.50,
    "inclusiveFeeAmount": 2.50, "exclusiveFeeAmount": 0.00,
    "feeApplied": true,
    "flowTarget": { "flowTargetId": "…", "inputSchema": "{…}" }
  } ] } }
```
- **`feeApplied`** is the JSON key (the model field `isFeeApplied` serializes to `feeApplied`).
- `flowDefintionId` is spelled as-is in the API (note the missing 'i').
- Empty `psps: []` = no PSP available for that currency/criteria (not an error) — see currency-conversion note §7.
- Carry `requestId`, the chosen `id` (pspId), `flowActionId`, and `flowTarget.flowTargetId` into the transaction call.

**Errors:** 400 `1001` (validation, e.g. "Amount is required"); 401 `1015` (invalid secret token).

### 4.3 Create Transaction
`POST /nexxus/v1/transactions`

**Body:**
```json
{
  "flowActionId": "fat_deposit_001",
  "flowTargetId": "…",
  "requestId": "…uuid from fetch-psp…",
  "pspId": "…psp-uuid…",
  "externalRequestId": "ext_sd001",
  "transactionType": "deposit",
  "txnCurrency": "USD",
  "txnFee": 2,
  "txnAmount": 100,
  "executePayload": { "body": { "order": {…}, "customer": {…}, "language": "en", "customAttributes": {} } }
}
```
Key rules:
- `pspId` + `flowTargetId` + `flowActionId` must come from the same `requestId`'s fetch-psp result (validated: `RequestPspId(requestId, pspId)` must exist).
- `txnAmount` + `txnCurrency` + `flowActionId` must **match the Request** (validated).
- `externalRequestId` must be **unique** per brand/environment/action — it's your idempotency key.

**Success (HTTP 200, `code:"0000"`)** — two shapes depending on the gateway script result:
```json
// success: hosted-payment session produced
{ "code":"0000", "message":"Transaction created successfully", "data": {
  "txnId":"ortxlwzD0R7tUurZ", "txnSuccess": true,
  "txnMeta": { "logs": {…}, "http": {…} }, "txnError": null,
  "sessionUrl": "https://widget.nexxus.fynxt.io/<token>" } }

// script/validation failure (still HTTP 200, txnSuccess=false)
{ "code":"0000", "message":"Transaction created successfully", "data": {
  "txnId":"ortx0VyoJsQVWhLA", "txnSuccess": false, "txnMeta": {},
  "txnError": "Output validation failed for step 'initiate': …", "sessionUrl": null } }
```
- **`sessionUrl`** (present only when `txnSuccess:true`) is the **hosted-checkout URL** — redirect/open it for the end user to complete payment.
- `txnMeta` carries execution logs + the outbound HTTP request/response to the gateway (diagnostics).

**Errors:**
| HTTP | code | message |
|---|---|---|
| 400 | `1051` | Duplicate: "Transaction with externalRequestId '…' already exists … Existing transaction ID: …" |
| 400 | `1053`/`1056` | amount/currency mismatch vs Request |
| 401 | `1015` | invalid secret token |

> **Correction:** duplicate-transaction code is **`1051`** (`TRANSACTION_DUPLICATE`), not `1936`.

### 4.4 Transaction Status
`GET /nexxus/v1/transactions/{txnId}/status`

```bash
curl 'https://api.nexxus.fynxt.io/nexxus/v1/transactions/ortx5nF7t1aEFS0P/status' \
  -H 'X-SECRET-TOKEN: 06392b12-1b06-4c34-b884-60fa9389f795'
```
```json
{ "code":"0000", "message":"Transaction status retrieved successfully",
  "data": { "status": "SUCCESS" }, "timestamp":"2026-03-23T17:44:52Z" }
```

**Status values (in lifecycle order):** `NEW`, `CREATED`, `INITIATED`, `PG_ACCEPTED`, `PG_REJECTED`, `REJECTED`, `PG_SUCCESS`, `PG_FAILED`, `SUCCESS`, `FAILED`.
- **Terminal:** `SUCCESS`, `FAILED`, `REJECTED`.
- Prefer receiving the **outbound webhook** (§6) over polling; poll status only as a fallback/reconciliation.

---

## 5. Payment Completion — Session & Redirect Flow

What happens after `POST /transactions` returns a `sessionUrl`:

```
CRM opens sessionUrl (hosted checkout / widget)
      → end user completes payment at the PSP
      → PSP redirects the browser back to Nexxus:
            GET/POST /nexxus/v1/external/inbound/r/redirect/{token}/{txnId}   (302 → your success/failure URL)
      → PSP sends async server-to-server confirmation:
            POST     /nexxus/v1/external/inbound/w/webhook/{token}/{txnId}
      → Nexxus advances the transaction (PG_ACCEPTED/REJECTED → PG_SUCCESS/FAILED → SUCCESS/FAILED)
      → Nexxus fires the outbound webhook to the CRM (§6)
```
The `/external/**` callback URLs are generated by Nexxus and handed to the PSP; the CRM does **not** call them. The CRM's success/failure redirect targets come from the environment's configured redirect URLs.

---

## 6. Webhooks (Nexxus → CRM)

### 6.1 Register a webhook
`POST /nexxus/v1/webhooks` — `X-SECRET-TOKEN` (+ optional `X-BRAND-ID`, `X-ENV-ID`).

> **Correction:** path is `/nexxus/v1/webhooks` (not `/nexxus/api/v1/webhooks`).

**Body:**
```json
{ "statusType": "NOTIFICATION", "url": "https://your-crm/webhooks/nexxus", "retry": 3, "status": "ENABLED", "apiKey": "your-shared-key" }
```
| Field | Type | Rule |
|---|---|---|
| `statusType` | enum | `SUCCESS` \| `FAILURE` \| `NOTIFICATION` (required) |
| `url` | string | required, must match `^https?://.*` |
| `retry` | number | 0–10 (default 3) |
| `status` | enum | `ENABLED` \| `DISABLED` |
| `apiKey` | string | optional; sent back to you as the `x-api-key` header on every delivery |

**Register one webhook per `statusType`** you want. A `(brandId, environmentId, statusType)` combination is unique — re-registering the same type returns **409 `1007`** (duplicate).

**Success:**
```json
{ "code":"0000", "data": { "id": 123, "statusType":"NOTIFICATION", "url":"…", "retry":3, "status":"ENABLED", "createdAt":"…" } }
```

### 6.2 What Nexxus delivers (the payload you receive)
On each step Nexxus POSTs JSON to your registered `url`, with header **`x-api-key: <your apiKey>`** (if you set one) and `Content-Type: application/json`:
```json
{
  "transactionId": "ortx…",
  "brandId": "…", "environmentId": "…", "pspId": "…",
  "flowActionId": "fat_deposit_001",
  "externalRequestId": "ext_sd001",
  "step": "redirect | webhook",
  "timestamp": 1758818848508,
  "response": { }   // the gateway result data (or null)
}
```
- **`statusType` selection:** step `redirect` → `SUCCESS` if a result is present else `FAILURE`; step `webhook` → `NOTIFICATION`. Only webhooks whose `statusType` matches fire.
- **Correlation:** `transactionId` = your key back to the transaction; pair with `externalRequestId`.
- **Delivery:** success = HTTP 2xx from your endpoint. On non-2xx/timeout Nexxus retries up to `retry` times (~60s spacing). Timeouts: 5s connect / 30s read.
- **Verification:** the only auth on the delivery is the optional static `x-api-key`. There is **no HMAC signature** — validate `x-api-key`, use HTTPS, and treat `transactionId`+`status` as the source of truth (re-fetch status if unsure).

---

## 7. Currency Conversion (CRM-owned)

Nexxus does **not** convert currency. If `fetch-psp` returns an empty `psps: []` for the requested currency, the CRM converts to a supported currency (its own FX) and retries `fetch-psp` with the converted `currency`/`amount`. Example: INR 1000 → (no PSP) → CRM converts to USD 14 → retry → PSPs returned. All fees Nexxus reports are in the PSP's currency.

---

## 8. Embedded Admin Components (Nexxus in the CRM UI)

Nexxus ships React components the CRM embeds to let broker admins configure PSPs/rules inside the CRM portal. The CRM owns RBAC; it proxies component data calls to Nexxus using the environment credentials.

- Components: **PSP List**, **Transaction Rule**, **Routing Rule**, **Risk Rule**, **Fee Rule** (+ optional theming).
- Data flow: `CRM portal UI → CRM backend (role checks) → Nexxus API (X-SECRET-TOKEN or brand/env JWT)`.
- The PSP component chains: `GET /flow-types` → `GET /psps` → `GET /flow-types/{flowTypeId}/flow-targets` (credential schema, supported currencies/countries/actions/payment-methods).
- `onPspCardClick` returns the selected PSP object (id, name, logo, status, brandId, environmentId, flowTargetId, …).

> The component package names / props (e.g. `@nexxus/react`, `@nexxus/psp`) are frontend-SDK surface owned by the frontend team — confirm exact package + prop names against the current SDK release before coding against them.

---

## 9. Error Codes (verified subset)

| code | meaning | typical HTTP |
|---|---|---|
| `0000` | Success | 200/201 |
| `1000` | Unexpected error | 500 |
| `1001` | Validation failed | 400 |
| `1003` | Resource not found | 404 |
| `1007` | Resource already exists (duplicate) | 409 |
| `1014` | Invalid token (`X-ADMIN-TOKEN`) | 401 |
| `1015` | Invalid secret token (`X-SECRET-TOKEN`) | 401 |
| `1017` | Brand not found | 404 |
| `1023` | Environment not found | 404 |
| `1043` | Transaction not found | 404 |
| `1051` | Duplicate transaction | 400 |
| `1053` | Invalid transaction amount | 400 |
| `1056` | Invalid transaction currency | 400 |

---

## 10. Corrections vs prior drafts (summary)

| Prior draft claim | Verified reality |
|---|---|
| API key stored as **SHA-256 hash**; incoming key hashed & compared | **Plaintext UUID**, direct DB lookup (`UUID.fromString` → `findBySecret`). No hashing. |
| IDs look like `brn_`/`env_`/`sec_`/`psp_`/`req_` | **UUIDs**. Secret/key must be a valid UUID. |
| Error `2083` invalid token | `1014` |
| Error `1400` not found | `1023` (env) / `1003` (generic) |
| Error `1639` invalid secret | `1015` |
| Error `1936` duplicate transaction | `1051` |
| Created response `code:"201"` | `code:"0000"` (HTTP 201) |
| Webhook path `/nexxus/api/v1/webhooks` | `/nexxus/v1/webhooks` |
| fetch-psp field `isFeeApplied` | JSON key `feeApplied` |
| Webhook doc omits delivered payload & `apiKey`/`x-api-key` | Delivered payload documented in §6.2; `apiKey` → `x-api-key` header |
| Missing: Transaction Status API, session/redirect flow, webhook delivery, key-storage truth | Added §4.4, §5, §6, §2 |
