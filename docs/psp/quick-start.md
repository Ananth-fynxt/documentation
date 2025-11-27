---
title: PSP Transaction Flow - Quick Start
description: Quick start guide for implementing PSP transaction flows
---

# Quick Start

This guide will walk you through the essential steps to implement PSP transaction flows in your application.

## Authentication

Before making any API calls, you must obtain a JWT access token:

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Authentication successful"
}
```

Use the `accessToken` in the `Authorization` header for all subsequent API calls.

## Implementation Steps

### Step 1: Get Flow Types

Retrieve all available flow types:

```bash
GET /api/v1/flow-types
Authorization: Bearer <token>
```

### Step 2: Get Flow Actions

Get actions for a specific flow type:

```bash
GET /api/v1/flow-types/{flowTypeId}/flow-actions
Authorization: Bearer <token>
```

### Step 3: Fetch Available PSPs

Request available PSPs based on transaction criteria:

```bash
POST /api/v1/requests/fetch-psp
Authorization: Bearer <token>
Content-Type: application/json

{
  "brandId": "brn_001",
  "environmentId": "env_uat_001",
  "amount": 100.00,
  "currency": "USD",
  "actionId": "flow_action_001",
  "country": "US",
  "customerId": "brand_customer_001",
  "customerTag": "premium",
  "customerAccountType": "INDIVIDUAL"
}
```

### Step 4: Create Transaction

**Note**: The `inputSchema` and `flowTargetId` are already included in Step 3's response (`flowTarget.inputSchema` and `flowTarget.flowTargetId`), so no additional API call is needed.

Create and process the transaction:

```bash
POST /api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "brandId": "brn_001",
  "environmentId": "env_uat_001",
  "flowActionId": "flow_action_001",
  "flowTargetId": "flow_target_001",
  "pspId": "psp_001",
  "customerId": "brand_customer_001",
  "txnCurrency": "USD",
  "txnAmount": 100.00,
  "executePayload": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}
```

## Next Steps

- Read the [Complete API Reference](./api-reference.md) for detailed endpoint documentation
- Review [Best Practices](./best-practices.md) for recommended implementation patterns
- Check [Error Handling](./error-handling.md) for common issues and solutions

