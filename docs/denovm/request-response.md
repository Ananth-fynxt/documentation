---
title: DenoVM Request & Response
description: Understanding the request and response format for DenoVM
---

# Request & Response

## Java API

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

## Response Schema

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

## Accessing Metadata

```java
Map<String, Object> meta = result.getMeta();

// Access logs
@SuppressWarnings("unchecked")
Map<String, Object> logs = (Map<String, Object>) meta.get("logs");

// Access HTTP calls
@SuppressWarnings("unchecked")
Map<String, Object> httpCalls = (Map<String, Object>) meta.get("http");
```

