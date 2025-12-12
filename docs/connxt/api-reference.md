---
title: Connxt API V2 - API Reference
description: Complete API reference for Connxt API V2 endpoints
---

# API Reference

Complete reference documentation for all Connxt API V2 endpoints.

## Base URL

All API endpoints are prefixed with `/connxt/v2`.

- Development: `https://api.connect-dev.fynxt.io/connxt/v2`
- Production: `https://api.connect.fynxt.io/connxt/v2`

## Common Response Format

All API responses follow this structure:

**Success Response**:
```json
{
  "timestamp": "2025-12-12T10:43:18Z",
  "code": "200",
  "message": "Operation completed successfully",
  "data": <response_data>
}
```

**Error Response**:
```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "<error_code>",
  "message": "<error_message>",
  "errors": []
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Invalid or missing X-SECRET-TOKEN
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate PSP)
- `500 Internal Server Error`: Server error

---

## Step 1: Get Flow Type Definitions

Retrieve available payment service providers (PSPs) and their configurations, including supported actions, input schemas, and credential requirements.

**Endpoint**: `GET /connxt/v2/flow-types/definitions`

**Query Parameters**:

| Parameter | Type   | Required | Description                    | Example |
|-----------|--------|----------|--------------------------------|---------|
| `type`    | string | Yes      | Flow type name (e.g., "PSP")   | `PSP`   |

**Headers**:
```
X-SECRET-TOKEN: <your_secret_token>
Content-Type: application/json
```

**Request Example**:
```bash
curl -X GET 'https://api.connect-dev.fynxt.io/connxt/v2/flow-types/definitions?type=PSP' \
  --header 'X-SECRET-TOKEN: sec_sRhq3pnWTDoGl5HZwKD19vB8tU'
```

**Response** (200 OK):
```json
{
  "timestamp": "2025-12-12T10:43:18Z",
  "code": "200",
  "message": "Operation completed successfully",
  "data": {
    "name": "PSP",
    "targets": [
      {
        "id": "ftg_01jwra8pvkfey9h1f71gsw1qsw",
        "name": "Paymaxis",
        "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU.....",
        "status": "ENABLED",
        "credentialSchema": {
          "type": "object",
          "required": ["apiKey"],
          "properties": {
            "apiKey": {
              "type": "string"
            }
          }
        },
        "inputSchema": {
          "paymentMethods": {
            "type": "array",
            "items": {
              "enum": [],
              "type": "string"
            }
          },
          "countries": {
            "type": "array",
            "items": {
              "enum": [],
              "type": "string"
            }
          },
          "currencies": {
            "type": "array",
            "items": {
              "enum": [],
              "type": "string"
            }
          }
        },
        "actions": [
          {
            "id": "fat_01k5bqfxa3f6cawws5kyqpdkc9",
            "name": "REFUND",
            "definition": null
          },
          {
            "id": "fat_01jtj2hq14fexta3pcaeaswc62",
            "name": "WITHDRAW",
            "definition": {
              "id": "fld_01jwwmns3keh2bjgn21e7sq9nz",
              "description": "SYS-PSP-WITHDRAW-PAYMAXIS",
              "inputSchema": {}
            }
          },
          {
            "id": "fat_01jt2cetrheh48mkp2m8z680xz",
            "name": "DEPOSIT",
            "definition": {
              "id": "fld_01jwraa3kffey9h1f83mjfj0sv",
              "description": "SYS-PSP-DEPOSIT-PAYMAXIS",
              "inputSchema": {}
            }
          }
        ]
      }
    ]
  }
}
```

**Response Fields**:

| Field                    | Type   | Description                                                    |
|--------------------------|--------|----------------------------------------------------------------|
| `data.name`              | string | Flow type name (e.g., "PSP")                                  |
| `data.targets[]`         | array  | List of available payment gateways (flow targets)             |
| `targets[].id`           | string | Unique identifier for the flow target (use this as `flowTargetId`) |
| `targets[].name`         | string | Display name of the payment gateway                           |
| `targets[].logo`         | string | Base64-encoded logo or URL                                    |
| `targets[].status`       | string | Status of the target (`ENABLED` or `DISABLED`)                |
| `targets[].credentialSchema` | object | JSON schema for required credentials (used when creating PSP) |
| `targets[].inputSchema`  | object | Schema for transaction input data                             |
| `targets[].actions[]`    | array  | Available actions (DEPOSIT, WITHDRAW, REFUND)                 |
| `actions[].id`           | string | Flow action ID (use this as `flowActionId`)                   |
| `actions[].name`         | string | Action name (DEPOSIT, WITHDRAW, REFUND)                       |
| `actions[].definition`   | object\|null | Action definition with input schema (if configured)           |

**Understanding the Response**:

- **`targets[].id`** → Use as `flowTargetId` in Step 2 (Create PSP)
- **`actions[].id`** → Use as `flowActionId` in Step 2 (PSP operations) and Step 3 (transactions)
- **`actions[].definition.id`** → Use as `flowDefinitionId` in Step 2 (PSP operations)
- **`credentialSchema`** → Defines the structure of credentials needed for this PSP

**Error Responses**:
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing X-SECRET-TOKEN
- `404 Not Found`: Flow type not found
- `500 Internal Server Error`: Server error

---

## Step 2: Create Payment Service Provider (PSP)

Register and configure a payment service provider in your Connxt environment. This endpoint creates both the PSP configuration and its associated operations in a single request.

**Endpoint**: `POST /connxt/v2/psps/external`

**Headers**:
```
X-SECRET-TOKEN: <your_secret_token>
Content-Type: application/json
```

**Request Body**:

| Field           | Type   | Required | Description                                                                  | Example                              |
|-----------------|--------|----------|------------------------------------------------------------------------------|--------------------------------------|
| `name`          | string | Yes      | Display name for your PSP configuration                                      | `"Sticpay"`                          |
| `logo`          | string | No       | Logo URL or base64-encoded image                                             | `"https://example.com/logo.png"`     |
| `credential`    | string | Yes      | JSON string containing PSP credentials (must match `credentialSchema`)       | `"{\"apiKey\":\"abc123\"}"`          |
| `flowTargetId`  | string | Yes      | Flow target ID from Step 1                                                   | `"ftg_01jt2ctt8veh48mkpcx2bdeatz"`   |
| `operations[]`  | array  | Yes      | List of operations to enable for this PSP                                    | See below                            |
| `brandId`       | string | No       | Automatically set from X-SECRET-TOKEN (do not include)                       | -                                    |
| `environmentId` | string | No       | Automatically set from X-SECRET-TOKEN (do not include)                       | -                                    |

**Operations Array**:

Each operation in the `operations[]` array should have:

| Field              | Type   | Required | Description                                    | Example                              |
|--------------------|--------|----------|------------------------------------------------|--------------------------------------|
| `flowActionId`     | string | Yes      | Flow action ID from Step 1                     | `"fat_01jt2cetrheh48mkp2m8z680xz"`   |
| `flowDefinitionId` | string | Yes      | Flow definition ID from Step 1 (from action definition) | `"fld_01jt2cyyskeh48mkpkf3y9z6j3"` |
| `status`           | string | Yes      | Operation status (`ENABLED` or `DISABLED`)     | `"ENABLED"`                          |

**Request Example**:
```bash
curl -X POST 'https://api.connect-dev.fynxt.io/connxt/v2/psps/external' \
  --header 'Content-Type: application/json' \
  --header 'X-SECRET-TOKEN: sec_sRhq3pnWTDoGl5HZwKD19vB8tU' \
  --data '{
    "name": "Sticpay",
    "logo": "https://example.com/stripe-test.png",
    "credential": "{\"merchantEmail\": \"merchant@example.com\",\"apiKey\": \"your_api_key_here\"}",
    "flowTargetId": "ftg_01jt2ctt8veh48mkpcx2bdeatz",
    "operations": [
      {
        "flowActionId": "fat_01jt2cetrheh48mkp2m8z680xz",
        "flowDefinitionId": "fld_01jt2cyyskeh48mkpkf3y9z6j3",
        "status": "ENABLED"
      },
      {
        "flowActionId": "fat_01jtj2hq14fexta3pcaeaswc62",
        "flowDefinitionId": "fld_01jtj66c27fexta3r0gczv1a8b",
        "status": "ENABLED"
      }
    ]
  }'
```

**Response** (200 OK):
```json
{
  "timestamp": "2025-12-12T11:26:36Z",
  "code": "200",
  "message": "Operation completed successfully",
  "data": {
    "id": "psp_mSwZ5vYUDN96gEei1kiIjCJc3g",
    "name": "Sticpay",
    "description": null,
    "logo": "https://example.com/stripe-test.png",
    "credential": "***ENCRYPTED***",
    "brandId": "brn_McUjiTJboTbpIjdZIog2w6fWdx",
    "environmentId": "env_8AJmgfoJgGJ0eFoH8UZ6oeli42",
    "flowTargetId": "ftg_01jt2ctt8veh48mkpcx2bdeatz",
    "status": "ENABLED",
    "createdAt": "2025-12-12T16:56:36",
    "updatedAt": "2025-12-12T16:56:36",
    "createdBy": "env_8AJmgfoJgGJ0eFoH8UZ6oeli42",
    "updatedBy": "env_8AJmgfoJgGJ0eFoH8UZ6oeli42",
    "operations": [
      {
        "flowActionId": "fat_01jt2cetrheh48mkp2m8z680xz",
        "flowDefinitionId": "fld_01jt2cyyskeh48mkpkf3y9z6j3",
        "status": "ENABLED"
      },
      {
        "flowActionId": "fat_01jtj2hq14fexta3pcaeaswc62",
        "flowDefinitionId": "fld_01jtj66c27fexta3r0gczv1a8b",
        "status": "ENABLED"
      }
    ],
    "flowTarget": {
      "id": "ftg_01jt2ctt8veh48mkpcx2bdeatz",
      "credentialSchema": "{\"type\":\"object\",\"required\":[\"merchantEmail\",\"apiKey\"],\"properties\":{\"apiKey\":{\"type\":\"string\"},\"merchantEmail\":{\"type\":\"string\"}},\"additionalProperties\":false}",
      "flowTypeId": "ftp_01jt2ccyw4eh48mknzvb48erpk",
      "currencies": ["USD"],
      "countries": [],
      "paymentMethods": ["Bank"],
      "supportedActions": [
        {
          "flowActionId": "fat_01jtj2hq14fexta3pcaeaswc62",
          "flowDefinitionId": "fld_01jtj66c27fexta3r0gczv1a8b",
          "flowActionName": "WITHDRAW"
        },
        {
          "flowActionId": "fat_01jt2cetrheh48mkp2m8z680xz",
          "flowDefinitionId": "fld_01jt2cyyskeh48mkpkf3y9z6j3",
          "flowActionName": "DEPOSIT"
        }
      ]
    }
  }
}
```

**Response Fields**:

| Field               | Type   | Description                                            |
|---------------------|--------|--------------------------------------------------------|
| `data.id`           | string | **PSP ID** - Use this as `pspId` in Step 3             |
| `data.name`         | string | PSP display name                                       |
| `data.logo`         | string | Logo URL or base64-encoded image                       |
| `data.credential`   | string | Always returns `"***ENCRYPTED***"` for security        |
| `data.brandId`      | string | Brand ID (automatically set)                           |
| `data.environmentId`| string | Environment ID (automatically set)                     |
| `data.flowTargetId` | string | Flow target ID                                         |
| `data.status`       | string | PSP status (`ENABLED` or `DISABLED`)                   |
| `data.operations[]` | array  | List of configured operations                          |
| `data.flowTarget`   | object | Flow target details with supported currencies/countries|

**Important Notes**:

- **Credential Format**: The `credential` field must be a valid JSON string that matches the `credentialSchema` from Step 1
- **Operations**: You can specify multiple operations (DEPOSIT, WITHDRAW, REFUND) in a single request
- **PSP ID**: Save the returned `data.id` - you'll need it for creating transactions in Step 3
- **Duplicate Prevention**: If a PSP with the same name already exists for the same flow target, the request will fail

**Error Responses**:
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Invalid or missing X-SECRET-TOKEN
- `409 Conflict`: PSP with same name already exists
- `500 Internal Server Error`: Server error

---

## Step 3: Create Transaction

Create and initiate a payment transaction. This endpoint processes the transaction through the configured PSP and returns either a redirect URL (for browser-based flows) or transaction status.

**Endpoint**: `POST /connxt/v2/transactions`

**Headers**:
```
X-SECRET-TOKEN: <your_secret_token>
Content-Type: application/json
```

**Request Body**:

| Field             | Type   | Required | Description                                                      | Example                              |
|-------------------|--------|----------|------------------------------------------------------------------|--------------------------------------|
| `flowActionId`    | string | Yes      | Flow action ID from Step 1 (e.g., DEPOSIT, WITHDRAW, REFUND)    | `"fat_01jt2cetrheh48mkp2m8z680xz"`   |
| `flowTargetId`    | string | Yes      | Flow target ID from Step 1                                       | `"ftg_01jt2ctt8veh48mkpcx2bdeatz"`   |
| `pspId`           | string | Yes      | PSP ID from Step 2 response                                      | `"psp_gQzyS9RkkknYWFvgnJQj3zSNjP"`   |
| `transactionType` | string | No       | Type of transaction (e.g., "deposit", "withdrawal", "refund")    | `"deposit"`                          |
| `txnCurrency`     | string | Yes      | Transaction currency (ISO 4217 format)                           | `"USD"`                              |
| `txnAmount`       | number | Yes      | Transaction amount                                               | `200`                                |
| `executePayload`  | object | Yes      | Transaction payload with order, customer, and other data         | See below                            |
| `brandId`         | string | No       | Automatically set from X-SECRET-TOKEN (do not include)           | -                                    |
| `environmentId`   | string | No       | Automatically set from X-SECRET-TOKEN (do not include)           | -                                    |

**Execute Payload Structure**:

The `executePayload` object contains the transaction data that will be processed by the PSP. The structure may vary based on the PSP's requirements, but typically includes:

```json
{
  "body": {
    "order": {
      "id": "ORDER_123",
      "money": {
        "amount": 12,
        "currency": "USD"
      },
      "crmData": {
        "amount": 12,
        "currency": "USD",
        "conversionRate": 1
      },
      "timestamp": "1758818848508"
    },
    "customer": {
      "id": "cust_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "customer@example.com",
      "phone": {
        "phoneNumber": "1234567890",
        "countryCode": "1"
      },
      "address": {
        "line1": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94103",
        "country": "US"
      }
    },
    "language": "en",
    "customAttributes": {}
  }
}
```

**Request Example**:
```bash
curl -X POST 'https://api.connect-dev.fynxt.io/connxt/v2/transactions' \
  --header 'Content-Type: application/json' \
  --header 'X-SECRET-TOKEN: sec_sRhq3pnWTDoGl5HZwKD19vB8tU' \
  --data '{
    "flowActionId": "fat_01jt2cetrheh48mkp2m8z680xz",
    "flowTargetId": "ftg_01jt2ctt8veh48mkpcx2bdeatz",
    "pspId": "psp_gQzyS9RkkknYWFvgnJQj3zSNjP",
    "transactionType": "deposit",
    "txnCurrency": "USD",
    "txnAmount": 200,
    "executePayload": {
      "body": {
        "order": {
          "id": "1758818848508",
          "money": {
            "amount": 12,
            "currency": "USD"
          },
          "crmData": {
            "amount": 12,
            "currency": "USD",
            "conversionRate": 1
          },
          "timestamp": "1758818848508"
        },
        "customer": {
          "id": "cust_001",
          "firstName": "Premium",
          "lastName": "Customer",
          "email": "customer.a@example.com",
          "phone": {
            "phoneNumber": "1758818848508",
            "countryCode": "91"
          },
          "address": {
            "line1": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "zipCode": "94103",
            "country": "US"
          }
        },
        "language": "en",
        "customAttributes": {}
      }
    }
  }'
```

**Response** (200 OK - Redirect):

For deposit transactions that require user redirect to payment page:

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "200",
  "message": "Transaction created successfully",
  "data": {
    "success": true,
    "data": {
      "__type": "success",
      "data": {
        "navigation": {
          "type": "redirect",
          "contentType": "url",
          "value": "https://pay.sticpay.com/1.1/pay/consume_token/54d9029814dcd97e88b8856029bc4b15216b94b499192d06001765529704"
        },
        "status": "success",
        "orderId": "ortxggdqGELpiuCQ",
        "userId": "cust_001"
      }
    },
    "error": null,
    "meta": {
      "logs": { ... },
      "http": { ... }
    }
  }
}
```

**Response** (200 OK - Direct Response):

For transactions that complete immediately without redirect:

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "200",
  "message": "Transaction created successfully",
  "data": {
    "txnId": "ortxggdqGELpiuCQ",
    "status": "SUCCESS",
    "pspTxnId": "psp_transaction_123",
    ...
  }
}
```

**Response Fields**:

| Field                           | Type   | Description                                           |
|---------------------------------|--------|-------------------------------------------------------|
| `data.success`                  | boolean| Indicates if the transaction was initiated successfully |
| `data.data.navigation.value`    | string | **Redirect URL** - Redirect user to this URL for payment |
| `data.data.data.orderId`        | string | Transaction order ID (matches your order.id)          |
| `data.data.data.status`         | string | Transaction status                                    |

**Handling Redirect Responses**:

When you receive a response with `navigation.type === "redirect"`:

1. **Extract the redirect URL** from `data.data.data.navigation.value`
2. **Redirect the user** to this URL in their browser
3. **Wait for callback** - The PSP will redirect back to your configured callback URL after payment processing

**Error Responses**:
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Invalid or missing X-SECRET-TOKEN
- `500 Internal Server Error`: Server error

---

## Transaction Status Flow

The Connxt transaction system processes payments through a state machine with multiple stages:

```
NEW → CREATED → INITIATED → [PG_ACCEPTED | PG_REJECTED] → [SUCCESS | FAILED | REJECTED]
```

### Transaction Lifecycle

1. **Creation**: Transaction is created with status `NEW`
2. **Initiation**: VM script executes to communicate with PSP (`INITIATED`)
3. **Gateway Response**: PSP processes and responds (`PG_ACCEPTED` or `PG_REJECTED`)
4. **Completion**: Transaction reaches terminal state (`SUCCESS`, `FAILED`, or `REJECTED`)

### Redirect and Webhook Callbacks

After initiating a transaction, the PSP may:

- **Redirect back**: User is redirected to your configured callback URL after payment
- **Send webhook**: PSP sends an asynchronous notification about transaction status

These callbacks are automatically handled by Connxt's external endpoints and update the transaction status accordingly.

