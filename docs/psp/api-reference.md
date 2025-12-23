---
title: Nexxus – CRM Integration API Documentation
description: Complete API reference for Nexxus CRM Integration API endpoints
---

# API Reference

Complete reference documentation for all Nexxus CRM Integration API endpoints.

## Table of Contents

1. [Authentication](#authentication)
2. [Flow Action API](#1-flow-action-api) - Uses X-SECRET-TOKEN
3. [Request Fetch PSP API](#2-request-fetch-psp-api) - Uses X-SECRET-TOKEN
4. [Transaction API](#3-transaction-api) - Uses X-SECRET-TOKEN

---

## Authentication

### X-SECRET-TOKEN
- **Header**: `X-SECRET-TOKEN: <secret-token>`
- **Usage**: Required for all API endpoints (Flow Action, Request Fetch PSP, and Transaction APIs)
- **Authentication**: Validates against environment secret token stored in database
- **Context**: Automatically sets `brandId` and `environmentId` from the environment record

---

## Base URL

All API endpoints are prefixed with `/nexxus/v1`.

## Common Response Format

All API responses follow this structure:

**Success Response**:
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "200",
  "message": "Operation completed successfully",
  "data": <response_data>
}
```

**Error Response**:
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "<error_code>",
  "message": "<error_message>",
  "data": null
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: Insufficient permissions or scope
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate transaction)
- `500 Internal Server Error`: Server error

---

## 1. Flow Action API

### Endpoint
```
GET /nexxus/v1/flow-types/{flowTypeId}/flow-actions
```

### Headers
```
X-SECRET-TOKEN: <secret-token>
Content-Type: application/json 
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `flowTypeId` | string | Yes | Unique identifier of the flow type |

### cURL Example
```bash
curl -X GET 'http://localhost:8001/nexxus/v1/flow-types/ftg_payment_001/flow-actions' \
  --header 'X-SECRET-TOKEN: sec_nexxus_uat_123' \
  --header 'Content-Type: application/json'
```

### Success Response (200 OK)
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "200",
  "message": "Flow actions retrieved successfully",
  "data": [
    {
      "id": "fat_deposit_001",
      "name": "Deposit",
      "steps": ["CREATED", "INITIATED", "PG_ACCEPTED"],
      "flowTypeId": "ftg_payment_001",
      "inputSchema": "{\"type\":\"object\",\"properties\":{\"amount\":{\"type\":\"number\"}}}",
      "outputSchema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}",
      "createdAt": "2025-12-16T08:30:00",
      "updatedAt": "2025-12-16T08:30:00"
    }
  ]
}
```

### Error Responses

**400 Bad Request** - Invalid flow type ID
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "400",
  "message": "Invalid flow type ID format",
  "data": null
}
```

**401 Unauthorized** - Invalid X-SECRET-TOKEN
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "401",
  "message": "Invalid secret token",
  "data": null
}
```

---

## 2. Request Fetch PSP API

### Endpoint
```
POST /nexxus/v1/requests/fetch-psp
```

### Headers
```
X-SECRET-TOKEN: <secret-token>
Content-Type: application/json
```

### Request Body
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

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Transaction amount (must be positive) |
| `currency` | string | Yes | Currency code (ISO 4217 format) |
| `actionId` | string | Yes | Unique identifier of the flow action |
| `country` | string | Yes | Country code (ISO 3166-1 alpha-2) |
| `customerId` | string | Yes | Unique identifier of the customer |
| `customerTag` | string | Yes | Customer tag for categorization |
| `customerAccountType` | string | Yes | Type of customer account |

**Note**: `brandId` and `environmentId` are automatically extracted from the `X-SECRET-TOKEN` authentication context.

### cURL Example
```bash
curl -X POST 'http://localhost:8001/nexxus/v1/requests/fetch-psp' \
  --header 'X-SECRET-TOKEN: sec_nexxus_uat_123' \
  --header 'Content-Type: application/json' \
  --data '{
    "amount": 100.00,
    "currency": "USD",
    "actionId": "fat_deposit_001",
    "country": "US",
    "customerId": "brand_customer_001",
    "customerTag": "premium",
    "customerAccountType": "INDIVIDUAL"
  }'
```

### Success Response (200 OK)
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "200",
  "message": "PSP fetched successfully",
  "data": {
    "requestId": "req_123456789",
    "psps": [
      {
        "id": "psp_7MwmzoMRKFhpip2yFVcePL8LPl",
        "name": "SticPay",
        "description": "SticPay Payment Gateway",
        "logo": "https://example.com/logo.png",
        "brandId": "brn_001",
        "environmentId": "env_uat_001",
        "flowActionId": "fat_deposit_001",
        "flowDefintionId": "flow_def_001",
        "currency": "USD",
        "originalAmount": 100.00,
        "appliedFeeAmount": 2.50,
        "totalAmount": 102.50,
        "netAmountToUser": 97.50,
        "inclusiveFeeAmount": 2.50,
        "exclusiveFeeAmount": 0.00,
        "isFeeApplied": true,
        "flowTarget": {
          "flowTargetId": "ftg_sticpay_001",
          "inputSchema": "{\"type\":\"object\",\"properties\":{}}"
        }
      }
    ]
  }
}
```

### Error Responses

**400 Bad Request** - Invalid request data
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "400",
  "message": "Amount is required",
  "data": null
}
```

**401 Unauthorized** - Invalid X-SECRET-TOKEN
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "401",
  "message": "Invalid secret token",
  "data": null
}
```

**404 Not Found** - No suitable PSP found
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "404",
  "message": "No suitable PSP found for the given criteria",
  "data": null
}
```

---

## 3. Transaction API

### Endpoint
```
POST /nexxus/v1/transactions
```

### Headers
```
X-SECRET-TOKEN: <secret-token>
Content-Type: application/json
```

### Request Body
```json
{
  "flowActionId": "fat_deposit_001",
  "flowTargetId": "ftg_sticpay_001",
  "requestId": "req_OQBMcPQb1SpuPq2xs07mKeLTro",
  "pspId": "psp_7MwmzoMRKFhpip2yFVcePL8LPl",
  "externalRequestId": "ext_sd001",
  "transactionType": "deposit",
  "txnCurrency": "USD",
  "txnFee": 2,
  "txnAmount": 10,
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
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `flowActionId` | string | Yes | Unique identifier of the flow action |
| `flowTargetId` | string | Yes | Unique identifier of the flow target |
| `requestId` | string | No | Request ID associated with this transaction |
| `pspId` | string | Yes | Unique identifier of the Payment Service Provider |
| `externalRequestId` | string | No | External request ID (must be unique) |
| `transactionType` | string | No | Type of transaction (e.g., "deposit", "withdrawal") |
| `txnCurrency` | string | No | Currency of the transaction (ISO 4217 format) |
| `txnFee` | number | No | Transaction fee amount |
| `txnAmount` | number | No | Transaction amount |
| `executePayload` | object | No | Payload data for transaction execution |

**Note**: `brandId` and `environmentId` are automatically extracted from the `X-SECRET-TOKEN` authentication context.

### cURL Example
```bash
curl -X POST 'http://localhost:8001/nexxus/v1/transactions' \
  --header 'X-SECRET-TOKEN: sec_nexxus_uat_123' \
  --header 'Content-Type: application/json' \
  --data '{
    "flowActionId": "fat_deposit_001",
    "flowTargetId": "ftg_sticpay_001",
    "requestId": "req_OQBMcPQb1SpuPq2xs07mKeLTro",
    "pspId": "psp_7MwmzoMRKFhpip2yFVcePL8LPl",
    "externalRequestId": "ext_sd001",
    "transactionType": "deposit",
    "txnCurrency": "USD",
    "txnFee": 2,
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

### Success Response (200 OK)

**When transaction is successful:**
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "200",
  "message": "Transaction created successfully",
  "data": {
    "txnId": "ortxlwzD0R7tUurZ",
    "txnSuccess": true,
    "txnMeta": {
      "logs": {
        "0": {
          "level": "info",
          "message": "Transaction processed successfully",
          "timestamp": "2025-12-16T08:30:00.816Z"
        }
      },
      "http": {
        "0": {
          "request": {
            "url": "https://api.sticpay.com/rest_pay/pay",
            "method": "POST",
            "headers": {
              "Content-Type": "application/json"
            }
          },
          "response": {
            "status": 200,
            "headers": {},
            "data": {}
          },
          "duration": 1330
        }
      }
    },
    "txnError": null,
    "sessionUrl": "eyJfX3R5cGUiOiJzdWNjZXNzIiwiZGF0YSI6eyJuYXZpZ2F0aW9uIjp7InR5cGUiOiJyZWRpcmVjdCIsImNvbnRlbnRUeXBlIjoidXJsIiwidmFsdWUiOiJodHRwczovL3BheS5zdGljcGF5LmNvbS8xLjEvcGF5L2NvbnN1bWVfdG9rZW4vYWJjMTIzIn19"
  }
}
```

**When transaction fails:**
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "200",
  "message": "Transaction created successfully",
  "data": {
    "txnId": "ortx0VyoJsQVWhLA",
    "txnSuccess": false,
    "txnMeta": {},
    "txnError": "Output validation failed for step 'initiate': Schema validation failed: $: required property 'navigation' not found",
    "sessionUrl": null
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `txnId` | string | Unique transaction identifier |
| `txnSuccess` | boolean | Whether the transaction execution was successful |
| `txnMeta` | object | Transaction metadata (logs, HTTP requests/responses) |
| `txnError` | string | Error message if transaction failed (null if successful) |
| `sessionUrl` | string | Session token URL (only present if transaction was successful) |

### Error Responses

**400 Bad Request** - Invalid request data or duplicate transaction
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "1936",
  "message": "Transaction with external request ID 'ext_sd001' already exists. Existing transaction ID: ortxl8cL2eNhtRaL",
  "data": null
}
```

**401 Unauthorized** - Invalid X-SECRET-TOKEN
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "401",
  "message": "Invalid secret token",
  "data": null
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "403",
  "message": "Insufficient permissions or scope",
  "data": null
}
```

---

## Currency Conversion Handling

**Important**: Currency conversion is handled by the CRM, not by Nexxus. Nexxus does not perform currency conversion internally.

### Conversion Flow

When a transaction is initiated with a currency that has no available PSPs, the CRM should handle currency conversion as follows:

1. **Initial Request**: CRM sends a request to `/nexxus/v1/requests/fetch-psp` with the original currency and amount
   - Example: `currency: "INR"`, `amount: 1000`

2. **No PSP Available**: If Nexxus API returns an empty PSP list or no suitable PSPs are found for the requested currency

3. **CRM Performs Conversion**: CRM converts the amount to an alternative currency using its own conversion service or exchange rates
   - Example: Convert 1000 INR to USD → 14 USD (using current exchange rate)

4. **Retry with Converted Currency**: CRM sends a new request to `/nexxus/v1/requests/fetch-psp` with the converted currency and amount
   - Example: `currency: "USD"`, `amount: 14`

5. **PSP Selection**: Nexxus API may return available PSPs for the converted currency

### Example Scenario

```
Step 1: User initiates transaction
  - Currency: INR
  - Amount: 1000

Step 2: CRM calls Nexxus API
  POST /nexxus/v1/requests/fetch-psp
  {
    "currency": "INR",
    "amount": 1000,
    ...
  }

Step 3: Nexxus API Response
  {
    "requestId": "req_123",
    "psps": []  // No PSPs available for INR
  }

Step 4: CRM performs currency conversion
  - Exchange Rate: 1 USD = 71.43 INR
  - Converted Amount: 1000 INR ÷ 71.43 = 14 USD

Step 5: CRM retries with converted currency
  POST /nexxus/v1/requests/fetch-psp
  {
    "currency": "USD",
    "amount": 14,
    ...
  }

Step 6: Nexxus API Response
  {
    "requestId": "req_456",
    "psps": [
      {
        "id": "psp_001",
        "currency": "USD",
        "totalAmount": 14.50,  // Includes fees
        ...
      }
    ]
  }
```

### Best Practices

- **Conversion Responsibility**: CRM is responsible for:
  - Obtaining current exchange rates
  - Performing the currency conversion calculation
  - Handling conversion fees (if applicable)
  - Retrying the request with converted values

- **Transaction Creation**: When creating a transaction after currency conversion:
  - Use the converted `currency` and `amount` values in the transaction request
  - The `txnCurrency` and `txnAmount` fields should reflect the converted values
  - Store the original currency and amount in `executePayload` or custom fields if needed for reference

- **User Communication**: CRM should inform users when currency conversion is applied:
  - Display both original and converted amounts
  - Show the exchange rate used
  - Indicate any conversion fees

### Important Considerations

- Nexxus API does not validate or verify conversion rates
- Nexxus API does not store or track original vs. converted currencies
- All fee calculations in Nexxus are based on the currency and amount provided in the request
- CRM must ensure conversion accuracy and handle any discrepancies
