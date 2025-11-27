---
title: PSP Transaction Flow - Best Practices
description: Best practices for implementing PSP transaction flows
---

# Best Practices

## 1. Idempotency

Always provide a unique `externalRequestId` when creating transactions to prevent duplicate processing:

```json
{
  "externalRequestId": "your_unique_id_" + timestamp + "_" + random_string
}
```

## 2. Payload Validation

Before creating a transaction:

- Validate `executePayload` against the `inputSchema` from Step 3 (`flowTarget.inputSchema`)

