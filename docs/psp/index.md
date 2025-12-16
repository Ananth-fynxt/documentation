---
title: PSP Transaction Flow
description: Complete guide for implementing Payment Service Provider (PSP) transaction flows in the Nexxus payment platform
---

# PSP Transaction Flow

Complete guide for implementing Payment Service Provider (PSP) transaction flows in the Nexxus payment platform.

## Overview

This guide provides detailed instructions for implementing the Payment Service Provider (PSP) transaction flow in the Nexxus payment platform. The flow enables external systems to:

1. Discover available flow types and their associated actions
2. Fetch available PSPs based on transaction criteria (includes flow target details and input schema)
3. Create and process transactions through the selected PSP

## Prerequisites

### Required Information

- **Base URL**: Your Nexxus API endpoint (e.g., `http://localhost:8001` or production URL)
- **API Version**: `/nexxus/v1`
- **Authentication**: X-SECRET-TOKEN is required for all API endpoints

### Authentication

#### X-SECRET-TOKEN
- **Header**: `X-SECRET-TOKEN: <secret-token>`
- **Usage**: Required for all API endpoints (Flow Action, Request Fetch PSP, and Transaction APIs)
- **Authentication**: Validates against environment secret token stored in database
- **Context**: Automatically sets `brandId` and `environmentId` from the environment record

### Required Headers

All API requests must include:

```
Content-Type: application/json
X-SECRET-TOKEN: <secret-token>
```

**Note**: `brandId` and `environmentId` are automatically extracted from the `X-SECRET-TOKEN` authentication context. You do not need to include these values in request bodies.

## Transaction Flow

The PSP transaction flow consists of three main steps that enable external systems to process payments through the Nexxus platform.

### High-Level Flow

![PSP Transaction Flow - High Level](../assets/psp-tnx-flow-high-level.svg)

**High-Level Flow Overview**

The diagram above illustrates the complete PSP transaction flow from the user's perspective, showing how external systems interact with the Nexxus API to process payments. The flow includes:

1. **Get Flow Actions** - Retrieve available flow actions for a specific flow type
2. **Fetch PSP List** - Get available payment providers with fees and input schema
3. **Create Transaction** - Submit and process the payment transaction

### Detailed API Flow

![PSP Transaction Flow - Low Level](../assets/psp-tnx-flow-low-level.svg)

**Detailed API Interactions**

The diagram above shows the detailed sequence of API calls and internal processing steps. It illustrates:

- **Step 1**: Retrieve flow actions for the selected flow type
- **Step 2**: Complex PSP evaluation process including:
  - Querying PSPs based on transaction criteria
  - Calculating fees
  - Applying currency conversion
  - Retrieving flow target input schema
  - Saving request data
  - Returning response with inputSchema included
- **Step 3**: Transaction creation and processing

This detailed view helps developers understand the internal processing that occurs within the Nexxus API during each step.

## Quick Navigation

- [Quick Start Guide](./quick-start.md) - Get started with PSP transactions
- [API Reference](./api-reference.md) - Complete API endpoint documentation
- [Error Handling](./error-handling.md) - Common errors and solutions
- [Best Practices](./best-practices.md) - Recommended implementation patterns

