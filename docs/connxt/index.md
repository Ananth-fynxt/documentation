---
title: Connxt API V2
description: Complete guide for integrating with Connxt Payment Engine using X-SECRET-TOKEN authentication
---

# Connxt API V2

Complete guide for integrating with Connxt Payment Engine using X-SECRET-TOKEN authentication. This API enables external systems to discover payment gateways, configure PSPs, and process transactions.

## Overview

The Connxt API V2 provides external integrations with a simplified authentication model using `X-SECRET-TOKEN`. This API enables you to:

1. **Discover Payment Gateways** - Retrieve available payment service providers (PSPs) and their configurations
2. **Configure PSPs** - Register and configure payment gateways in your environment
3. **Process Transactions** - Create and manage payment transactions (deposits, withdrawals, refunds)

### Key Features

- **Simplified Authentication** - Uses `X-SECRET-TOKEN` header for all external API calls
- **Automatic Context** - Brand ID and Environment ID are automatically extracted from the secret token
- **Complete Transaction Lifecycle** - Full support for transaction creation, processing, and status updates
- **RESTful Design** - Standard HTTP methods and JSON responses

## Prerequisites

### Required Information

- **Base URL**: Your Connxt API endpoint
  - Development: `https://api.connect-dev.fynxt.io`
  - Production: `https://api.connect.fynxt.io`
- **API Version**: `/connxt/v2`
- **Secret Token**: Your environment's secret token (obtained from Connxt admin)
- **Brand ID**: Automatically extracted from secret token
- **Environment ID**: Automatically extracted from secret token

### Required Headers

All API requests must include:

```
Content-Type: application/json
X-SECRET-TOKEN: <your_secret_token>
```

**Important:** The `X-SECRET-TOKEN` header authenticates your request and automatically provides `brandId` and `environmentId` context. You do not need to include these values in request bodies.

## Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Connxt API V2 Integration Flow                │
└─────────────────────────────────────────────────────────────────┘

  1. Get Flow Type Definitions
     ↓
     Discover available payment gateways (PSPs)
     Get flow targets, actions, and input schemas
     
  2. Create Payment Service Provider (PSP)
     ↓
     Configure your PSP with credentials
     Set up operations (DEPOSIT, WITHDRAW, REFUND)
     
  3. Create Transaction
     ↓
     Initiate payment transaction
     Receive redirect URL or webhook notifications
     
```

## Transaction Status Flow

The Connxt transaction system processes payments through a state machine with multiple stages:

```
NEW → CREATED → INITIATED → [PG_ACCEPTED | PG_REJECTED] → [SUCCESS | FAILED | REJECTED]
```

### Status Descriptions

| Status       | Description                                                           |
|--------------|-----------------------------------------------------------------------|
| `NEW`        | Transaction initialized                                              |
| `CREATED`    | Transaction entity created in database                               |
| `INITIATED`  | VM execution started, transaction sent to PSP                        |
| `PG_ACCEPTED`| Payment gateway accepted the transaction                             |
| `PG_REJECTED`| Payment gateway rejected the transaction                             |
| `PG_SUCCESS` | Payment gateway reported successful processing                        |
| `PG_FAILED`  | Payment gateway reported failure                                     |
| `SUCCESS`    | Transaction completed successfully                                   |
| `FAILED`     | Transaction failed permanently                                       |
| `REJECTED`   | Transaction was rejected                                             |

## Quick Navigation

- [Quick Start Guide](./quick-start.md) - Get started with Connxt API V2
- [API Reference](./api-reference.md) - Complete API endpoint documentation
- [Error Handling](./error-handling.md) - Common errors and solutions

