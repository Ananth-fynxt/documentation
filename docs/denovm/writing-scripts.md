---
title: DenoVM Writing Scripts
description: Guide to writing scripts for DenoVM
---

# Writing Scripts

Scripts must export an async function matching the `step` name.

## Script Structure

```javascript
export async function validation(context, sdk) {
  // Your code here
  return sdk.response.success({ message: "Valid" });
}
```

## Input Context

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

## Response Types

```javascript
// Success
return sdk.response.success({ orderId: "123", status: "completed" });

// Failure
return sdk.response.failure("Validation failed", 400);

// Redirect
return sdk.response.redirect("https://example.com/success", { token: "abc123" });
```

## SDK Reference

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

## Script Examples

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

