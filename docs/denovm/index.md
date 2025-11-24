---
title: Fynxt DenoVM Library
description: Execute JavaScript code in a secure Deno runtime from your Spring Boot application.
---

# Fynxt DenoVM Library

Execute JavaScript code in a secure Deno runtime from your Spring Boot application.

## Quick Start

### Add Dependency

```gradle
implementation("com.fynxt:denovm:<version>")
```

### Enable & Configure

```yaml
deno.vm:
  enabled: true
  pool-enabled: true    # false for single-run mode
  pool-size: 2
  worker-concurrency: 4
  timeout-seconds: 30
```

### Use It

```java
@Autowired
private DenoVMService denoVMService;

    DenoVMRequest request = DenoVMRequest.builder()
    .id("script-001")
    .code("return { message: 'Hello from Deno!' };")
    .data(Map.of("userId", "123"))
        .build();
    
    DenoVMResult result = denoVMService.executeCode(request);
    
    if (result.isSuccess()) {
    System.out.println(result.getData());
    } else {
    System.err.println(result.getError());
}
```

## Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `deno.vm.enabled` | `false` | Enable DenoVM service (required) |
| `deno.vm.pool-enabled` | `true` | Worker pool mode (false = single-run per request) |
| `deno.vm.pool-size` | `1` | Number of persistent workers |
| `deno.vm.worker-concurrency` | `2` | Max concurrent tasks per worker |
| `deno.vm.timeout-seconds` | `15` | Execution timeout per request (seconds) |
| `deno.vm.pool-max-tasks-per-worker` | `1000` | Auto-recycle worker after N tasks (0 = disabled) |
| `deno.vm.pool-idle-kill-seconds` | `0` | Kill idle workers after N seconds (0 = disabled) |
| `deno.vm.pool-janitor-enabled` | `true` | Enable automatic cleanup of stale temp files |
| `deno.vm.pool-janitor-interval-seconds` | `60` | Janitor cleanup interval (seconds) |
| `deno.vm.pool-janitor-file-ttl-seconds` | `300` | Delete temp files older than N seconds |
| `deno.vm.v8-max-old-space-mb` | `32` | V8 heap size limit in MB |
| `deno.vm.executable` | `null` | Explicit path to Deno executable (auto-detected if not set) |

*Key properties:*
- `worker-concurrency`: Limits concurrent tasks per worker (prevents overload)
- `pool-max-tasks-per-worker`: Auto-recycles workers to prevent memory leaks
- `pool-idle-kill-seconds`: Terminates idle workers to save resources (set to 300+ for cost savings)

## Execution Modes

### Single Run Mode

Each request starts a new Deno process. Lower memory, higher latency.

```yaml
deno.vm:
  enabled: true
  pool-enabled: false
```

*Best for:* Development, low-volume scenarios

### Worker Pool Mode

Persistent workers handle multiple requests. Lower latency, higher memory.

```yaml
deno.vm:
  enabled: true
  pool-enabled: true
  pool-size: 2
  worker-concurrency: 4
```

*Best for:* Production workloads, consistent latency

## Writing Scripts

Scripts must export an async function matching the `step` name.

### Script Structure

```javascript
export async function validation(context, sdk) {
  // Your code here
  return sdk.response.success({ message: "Valid" });
}
```

### Input Context

```javascript
{
  id: "unique-execution-id",           // Required: String
  step: "validation",                  // Required: String
  code: "export async function validation(context, sdk) { ... }", // Required: JavaScript code
  credential: {                        // Optional: Object (string key-value pairs)
    apiKey: "sk_live_abc123",
    secret: "secret_key_xyz"
  },
  data: {                              // Optional: Object (any JSON-serializable values)
    userId: "cust_001",
    orderId: "ortxod0CVdTVrNcI",
    amount: 12,
    currency: "USD"
  },
  urls: {                              // Optional: Object
    server: {
      redirect: "https://api.example.com/redirect",
      webhook: "https://api.example.com/webhook"
    },
    origin: {
      successRedirectUrl: "https://app.example.com/success",
      failureRedirectUrl: "https://app.example.com/failure",
      webhookUrl: "https://app.example.com/webhook"
    }
  }
}
```

### Response Types

```javascript
// Success
return sdk.response.success({ orderId: "123", status: "completed" });

// Failure
return sdk.response.failure("Validation failed", 400);

// Redirect
return sdk.response.redirect("https://example.com/success", { token: "abc123" });
```

### SDK Reference

#### Logger (`sdk.logger`)

```javascript
sdk.logger.debug("Debug message");
sdk.logger.info("Info message");
sdk.logger.warn("Warning message");
sdk.logger.error("Error message");
```

*Note:* Logs are captured in `meta.logs` in the response.

#### HTTP Client (`sdk.http`)

```javascript
// GET request
const result = await sdk.http.get("https://api.example.com/data", {
  headers: { "Authorization": "Bearer token" }
});

// POST request
const result = await sdk.http.post("https://api.example.com/webhook", {
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "value" })
});

// PUT, PATCH, DELETE also available
await sdk.http.put(url, options);
await sdk.http.patch(url, options);
await sdk.http.delete(url, options);
```

*Response format:*
```javascript
{
  success: true,    // boolean
  status: 200,      // number
  headers: {},      // object
  data: {}          // parsed JSON or error object
}
```

#### Encoding (`sdk.encoding`)

```javascript
// Base64
const encoded = sdk.encoding.base64.encode("Hello World");
const decoded = sdk.encoding.base64.decode(encoded);

// Base64URL (URL-safe)
const encoded = sdk.encoding.base64url.encode("Hello World");
const decoded = sdk.encoding.base64url.decode(encoded);
```

### Script Examples

#### Example 1: HTTP API Call

```javascript
export async function processOrder(context, sdk) {
  sdk.logger.info("Processing order", context.data.orderId);
  
  const result = await sdk.http.get(
    `https://api.example.com/orders/${context.data.orderId}`,
    { headers: { "Authorization": `Bearer ${context.credential.apiKey}` } }
  );
  
  if (!result.success) {
    return sdk.response.failure("Order not found", result.status);
  }
  
  return sdk.response.success({
    orderId: context.data.orderId,
    status: result.data.status,
    total: result.data.total
  });
}
```

#### Example 2: Validation with Redirect

```javascript
export async function validatePayment(context, sdk) {
  const { amount, cardNumber } = context.data;
  
  if (amount <= 0) {
    return sdk.response.failure("Invalid amount", 400);
  }
  
  if (!cardNumber || cardNumber.length < 16) {
    return sdk.response.redirect(
      context.urls.origin.failureRedirectUrl,
      { error: "Invalid card number" }
    );
  }
  
  return sdk.response.redirect(
    context.urls.origin.successRedirectUrl,
    { transactionId: "txn-123" }
  );
}
```

## Request & Response

### Java API

```java
// Request
DenoVMRequest request = DenoVMRequest.builder()
    .id("unique-id")                    // Required
    .code("export async function...")   // Required: JavaScript code
    .data(Map.of("key", "value"))       // Optional: Input data
    .credential(Map.of("apiKey", "...")) // Optional: Credentials
    .urls(DenoVMUrls.builder()          // Optional: URLs
        .server(DenoVMServerUrls.builder()
            .redirect("https://...")
            .webhook("https://...")
            .build())
        .origin(DenoVMOriginUrls.builder()
            .successRedirectUrl("https://...")
            .failureRedirectUrl("https://...")
            .webhookUrl("https://...")
            .build())
        .build())
    .step("validation")                  // Required: Step identifier
    .build();

// Execute
DenoVMResult result = denoVMService.executeCode(request);

// Response
if (result.isSuccess()) {
    Object data = result.getData();        // Execution result
    Map<String, Object> meta = result.getMeta(); // Metadata
} else {
    String error = result.getError();      // Error message
}
```

### Response Schema

```json
{
  "success": true,                    // Boolean: Execution success
  "data": {                           // Object | null: Script result
    "__type": "success",              // "success" | "failure" | "redirect"
    "data": {                         // Actual data returned by script
      "orderId": "ortxod0CVdTVrNcI",
      "userId": "cust_001",
      "status": "success"
    }
  },
  "error": null,                     // String | null: Error message (if success = false)
  "meta": {                           // Object: Execution metadata
    "logs": {                         // Object: Script logs
      "0": {
        "level": "info",              // "debug" | "info" | "warn" | "error"
        "message": "\"Processing order\"",
        "timestamp": "2025-11-19T07:30:19.216Z"
      }
    },
    "http": {                         // Object: HTTP call history
      "0": {
        "request": {
          "url": "https://api.example.com/orders/ORD-456",
          "method": "POST",
          "headers": { "Content-Type": "application/json" },
          "data": "{\"key\":\"value\"}"
        },
        "response": {
          "status": 200,
          "headers": {},
          "data": { "success": true }
        },
        "duration": 904               // milliseconds
      }
    }
  }
}
```

### Accessing Metadata

```java
Map<String, Object> meta = result.getMeta();

// Access logs
@SuppressWarnings("unchecked")
Map<String, Object> logs = (Map<String, Object>) meta.get("logs");

// Access HTTP calls
@SuppressWarnings("unchecked")
Map<String, Object> httpCalls = (Map<String, Object>) meta.get("http");
```

## Architecture

See [Architecture](./architecture.md) for detailed information.

## Limitations

* Scripts must complete within `timeout-seconds` (default 15s)
* Memory limited by `v8-max-old-space-mb` (default 32MB)
* No state persistence between executions
* Requires Deno executable on host
* JavaScript/TypeScript only (no Python/WASM)

## Troubleshooting

* *Timeout errors:* Increase `timeout-seconds` or optimize script
* *Memory errors:* Increase `v8-max-old-space-mb` or reduce script complexity
* *Pool initialization fails:* Check Deno executable path via `deno.vm.executable`
* *Workers not starting:* Verify Deno is installed and accessible

