---
title: Connxt API V2 - Quick Start
description: Quick start guide for integrating with Connxt API V2
---

# Quick Start

This guide will walk you through the essential steps to integrate with Connxt API V2.

## Authentication

The Connxt API V2 uses **X-SECRET-TOKEN** authentication for external integrations.

### How It Works

1. Each environment in Connxt has a unique secret token
2. Include this token in the `X-SECRET-TOKEN` header for all API requests
3. The system automatically:
   - Validates the token
   - Extracts the associated `brandId` and `environmentId`
   - Sets these values as request attributes (you don't need to provide them in the body)

### Example

```bash
curl -X GET 'https://api.connect-dev.fynxt.io/connxt/v2/flow-types/definitions?type=PSP' \
  --header 'X-SECRET-TOKEN: sec_sRhq3pnWTDoGl5HZwKD19vB8tU'
```

### Security Notes

- **Never expose** your secret token in client-side code or public repositories
- **Rotate tokens** regularly for enhanced security
- **Use HTTPS** for all API communications
- Tokens are environment-specific and cannot be shared across environments

## Implementation Steps

### Step 1: Get Flow Type Definitions

Retrieve available payment service providers (PSPs) and their configurations:

```bash
GET /connxt/v2/flow-types/definitions?type=PSP
X-SECRET-TOKEN: <your_secret_token>
```

### Step 2: Create Payment Service Provider (PSP)

Register and configure a payment service provider in your Connxt environment:

```bash
POST /connxt/v2/psps/external
X-SECRET-TOKEN: <your_secret_token>
Content-Type: application/json

{
  "name": "MyPaymentGateway",
  "logo": "https://example.com/logo.png",
  "credential": "{\"apiKey\":\"your_api_key\"}",
  "flowTargetId": "ftg_01jt2ctt8veh48mkpcx2bdeatz",
  "operations": [
    {
      "flowActionId": "fat_01jt2cetrheh48mkp2m8z680xz",
      "flowDefinitionId": "fld_01jt2cyyskeh48mkpkf3y9z6j3",
      "status": "ENABLED"
    }
  ]
}
```

### Step 3: Create Transaction

Create and initiate a payment transaction:

```bash
POST /connxt/v2/transactions
X-SECRET-TOKEN: <your_secret_token>
Content-Type: application/json

{
  "flowActionId": "fat_01jt2cetrheh48mkp2m8z680xz",
  "flowTargetId": "ftg_01jt2ctt8veh48mkpcx2bdeatz",
  "pspId": "psp_gQzyS9RkkknYWFvgnJQj3zSNjP",
  "transactionType": "deposit",
  "txnCurrency": "USD",
  "txnAmount": 200,
  "executePayload": {
    "body": {
      "order": {
        "id": "ORDER_123",
        "money": {
          "amount": 12,
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
- Check [Error Handling](./error-handling.md) for common issues and solutions

