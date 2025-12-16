---
title: PSP Transaction Flow - Quick Start
description: Quick start guide for implementing PSP transaction flows
---

# Quick Start

This guide will walk you through the essential steps to implement PSP transaction flows in your application.

## Authentication

The Nexxus API uses two types of authentication tokens:

### X-ADMIN-TOKEN
Used for admin operations (Brand Create, Environment management):
```
X-ADMIN-TOKEN: <admin-token>
```

### X-SECRET-TOKEN
Used for transaction operations (Flow Action, Fetch PSP, Transaction):
```
X-SECRET-TOKEN: <secret-token>
```

**Note**: The `X-SECRET-TOKEN` automatically provides `brandId` and `environmentId` context. You do not need to include these values in request bodies.

## Implementation Steps

### Step 1: Get Flow Actions

Get actions for a specific flow type:

```bash
GET /nexxus/v1/flow-types/{flowTypeId}/flow-actions
X-SECRET-TOKEN: <secret-token>
Content-Type: application/json
```

### Step 2: Fetch Available PSPs

Request available PSPs based on transaction criteria:

```bash
POST /nexxus/v1/requests/fetch-psp
X-SECRET-TOKEN: <secret-token>
Content-Type: application/json

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

**Note**: `brandId` and `environmentId` are automatically extracted from the `X-SECRET-TOKEN`.

### Step 3: Create Transaction

**Note**: The `inputSchema` and `flowTargetId` are already included in Step 2's response (`flowTarget.inputSchema` and `flowTarget.flowTargetId`), so no additional API call is needed.

Create and process the transaction:

```bash
POST /nexxus/v1/transactions
X-SECRET-TOKEN: <secret-token>
Content-Type: application/json

{
  "flowActionId": "fat_deposit_001",
  "flowTargetId": "ftg_sticpay_001",
  "pspId": "psp_7MwmzoMRKFhpip2yFVcePL8LPl",
  "txnCurrency": "USD",
  "txnAmount": 100.00,
  "executePayload": {
    "body": {
      "order": {
        "id": "ORDER_123",
        "money": {
          "amount": 100,
          "currency": "USD"
        }
      },
      "customer": {
        "id": "cust_001",
        "email": "customer@example.com"
      }
    }
  }
}
```

## Next Steps

- Read the [Complete API Reference](./api-reference.md) for detailed endpoint documentation
- Review [Best Practices](./best-practices.md) for recommended implementation patterns
- Check [Error Handling](./error-handling.md) for common issues and solutions

