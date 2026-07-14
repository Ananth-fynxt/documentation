---
title: Flow Engine & Deno VM
description: Flow hierarchy, flow definitions, and the sandboxed Deno VM execution engine.
---

# Flow Engine & Deno VM Execution

This is the **execution core** shared by fetch-psp and transactions. The **Flow** hierarchy is the data that defines *what a payment looks like* (its shape, allowed state transitions, input/output schemas, and the executable gateway code); the **Deno VM** is the sandboxed runtime that actually runs that per-PSP code to talk to the real payment gateway.

## 1. The Flow hierarchy

### What
A four-level configuration tree that describes payment behaviour without hard-coding any PSP:
```
Flow Type        e.g. "Card", "Wallet"            (broad category)
 └─ Flow Target  e.g. "Hosted Checkout"           (a concrete integration shape; carries inputSchema)
      └─ Flow Action  e.g. "deposit","withdraw"   (the operation; carries per-step input/output JSON schemas)
           └─ Flow Definition                      (the executable: flowConfiguration + code, keyed by flowTarget+flowAction)
```

### Why
Onboarding a new PSP or payment method should be **data + a script**, not a code deploy. The flow tree lets operators define the state machine (which status can follow which) and the gateway integration (JavaScript) as configuration. A `Psp` row points at a `flowTargetId`; a `PspOperation` points at a `flowDefinitionId`.

### Where
- Backend: `fynxt.brand.flow` — controllers `FlowTypeController` (`/flow-types`), `FlowTargetController` (`/flow-types/{flowTypeId}/flow-targets`), `FlowActionController` (`/flow-types/{flowTypeId}/flow-actions`), `FlowDefinitionController` (`/flow-definitions`). Flow-target lookup + input-schema service in `psp` (`FlowTargetLookupService`, `FlowTargetInputSchemaService`) and shared `fynxt.flowtarget` types (`FlowTargetDto`, `FlowTargetService`).
- Tables: `flow_type`, `flow_target`, `flow_action`, `flow_definition` (+ related, Liquibase changelogs).

### How — the two payload-bearing fields on Flow Definition
| Field | Purpose | Consumed by |
|---|---|---|
| `flowConfiguration` (jsonb) | The **state machine**: `{ "<currentStatus>": ["<allowedNext>", ...] }` map of allowed transitions. | Transaction orchestrator (`TransactionFlowConfigurationService`, section 8 §3.6) |
| `code` (text) | The **gateway integration JavaScript** run per step (`initiate`, `redirect`, `webhook`). | Deno VM (`VMExecuteImpl` → `DenoVMService`) |

Flow Action additionally carries `inputSchema` and `outputSchema` (JSON Schema Draft V7, keyed by step) — used to validate VM input/output (section 9 §5.2 in External API) and to tell the merchant/widget what to collect (`flowTarget.inputSchema` in the fetch-psp response).

### API (config-level; flow controllers have no scope/permission annotations — platform admin)
| Controller | Base path | Endpoints |
|---|---|---|
| `FlowTypeController` | `/flow-types` | POST, GET, GET `/{id}`, GET `/name/{name}`, PUT `/{id}`, DELETE `/{id}` |
| `FlowTargetController` | `/flow-types/{flowTypeId}/flow-targets` | POST, GET, GET `/{id}`, PUT `/{id}`, DELETE `/{id}` |
| `FlowActionController` | `/flow-types/{flowTypeId}/flow-actions` | POST, GET, GET `/{id}`, GET `/name/{name}`, PUT `/{id}`, DELETE `/{id}` |
| `FlowDefinitionController` | `/flow-definitions` | POST, GET, GET `/flow-target/{flowTargetId}`, GET `/{id}`, PUT `/{id}`, DELETE `/{id}` |

### Caching
`FlowTargetLookupService` (batch cache-aside `readByIds` + `@Cacheable readById`) and `TransactionFlowConfigurationService` both use `flowCacheManager` (Caffeine, max 5000, TTL 5 min). Flow config/target reads are hot on every payment, so they are cached with explicit invalidation hooks (`reloadFlowDefinition`, `invalidateAllCache`, etc.).

---

## 2. Deno VM — the sandboxed execution engine

### What
A shared library (`fynxt.denovm`, `backend/libs/denovm`) that runs a Flow Definition's `code` in a **sandboxed Deno subprocess**, passing in decrypted PSP credentials + the payment payload + platform callback URLs, and returning a structured result.

### Why
PSP integrations are untrusted, PSP-specific JavaScript. Running them **out-of-process in Deno** with restricted permissions isolates a misbehaving/malicious script from the JVM and the host: no filesystem writes, scoped reads, capped memory, no interactive prompts.

### Where
- Lib: `backend/libs/denovm/src/main/java/fynxt/denovm/` — `service/DenoVMService` (+ `impl/DenoVMServiceImpl`), `dto/{DenoVMRequest, DenoVMResult, DenoVMExecutionContext}`, resource `subprocess-executor.js`.
- Caller in the brand service: `fynxt.brand.external.service.impl.VMExecuteImpl` (builds the request, decrypts credentials, validates I/O schemas, sanitizes output).

### How — request/result contract
**`DenoVMRequest`**: `id`, `code` (the flow definition script), `credential` (`Map<String,String>`, decrypted per-call), `data` (`Map<String,Object>`, the payload), `step` (`initiate` | `redirect` | `webhook`), and `urls`:
- `urls.server.redirect` / `urls.server.webhook` — the platform's own `/external/inbound/...` callback URLs handed to the PSP.
- `urls.origin.successRedirectUrl` / `failureRedirectUrl` / `webhookUrl` — the environment's configured origins.

**`DenoVMResult`**: `success` (boolean), `data` (Object — gateway response, e.g. `{url}` for a hosted-payment redirect), `error` (String), `meta` (`Map`). `isSuccess()` drives orchestrator step selection.

### How — execution (`DenoVMServiceImpl.executeCode`)
1. Write the flow `code` to a temp `.ts` file (`Files.createTempFile("deno-vm-", ".ts")`); write the bundled `subprocess-executor.js` to a temp `.js`.
2. Resolve the `deno` binary: `$DENO_INSTALL/bin/deno`, else `~/.deno/bin/deno`, else `/opt/homebrew/bin/deno`.
3. Spawn (`ProcessBuilder`):
   ```
   deno run \
     --allow-net \                       # gateway HTTP calls allowed
     --allow-read=<scoped path> \        # read only the temp script dir
     --no-prompt \                       # never wait for interactive permission
     --no-check \                        # skip type-check for speed
     --v8-flags=--max-old-space-size=64  # 64 MB heap cap
     <executor.js>
   ```
   Sandbox posture: **network yes, scoped read, no write, no env, capped memory, non-interactive.**
4. Feed the `DenoVMExecutionContext` (code path + serialized request) to the subprocess; enforce a **timeout** (→ `DenoVMResult.error("VM execution timeout")`).
5. Parse stdout → `DenoVMResult`. `executeCodeAsync` wraps this in a `CompletableFuture`.

### Integration with `VMExecuteImpl` (brand service)
Before/after the VM call, `VMExecuteImpl`:
- **Decrypts** `Psp.credential` jsonb (`CryptoUtil.decryptCredentialJsonNode`; failure → 500 `TOKEN_DECRYPTION_FAILED`).
- **Builds callback URLs** (`buildDenoVMUrls`): `…/external/inbound/r/redirect/{token}/{txnId}` and `…/external/inbound/w/webhook/{token}/{txnId}`.
- **Validates input** against `flowAction.inputSchema[step]` and **output** against `flowAction.outputSchema[step]` (JSON Schema Draft V7, `com.networknt.schema`).
- **Sanitizes** credentials out of `error`/`meta` (`CredentialSanitizer` → `**ENCRYPTED**`). Note: `data`-field sanitization is currently commented out.
- Detects failure via DenoVM `data.__type`/`data._type == "failure"`.

## 3. Use cases

### 3.1 Transaction initiation runs the VM
`TransactionInitiationStep` builds a `VmExecutionDto{ step:"initiate", ... }` → `VMExecuteService.executeVmRequest` → `VMExecuteImpl` decrypts creds, validates input schema, calls `DenoVMService.executeCode` → the PSP's script hits the gateway and returns `{data:{url}}` → stored in `customData["vmExecutionResponse"]` → the transaction advances to `INITIATED` and a session/redirect URL is produced (section 8 §7.1).

### 3.2 PSP callback re-runs the VM
When the PSP calls `/external/inbound/r/redirect/...` or `/w/webhook/...`, `ExternalServiceImpl.read` re-runs the VM for `step="redirect"`/`"webhook"` with the callback body as `data`, producing a `DenoVMResult` whose `isSuccess()` drives the orchestrator's PG_* step preconditions (section 8 §7.2, section 9).

### 3.3 Onboarding a new PSP integration (no code deploy)
Operator creates a Flow Type → Flow Target (with `inputSchema`) → Flow Action (with per-step input/output schemas) → Flow Definition (with `flowConfiguration` state map + `code` script). A `Psp` is pointed at the `flowTargetId` and a `PspOperation` at the `flowDefinitionId`. The new PSP is now routable and executable entirely through configuration.
