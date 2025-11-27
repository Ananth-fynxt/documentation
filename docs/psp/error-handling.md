---
title: PSP Transaction Flow - Error Handling
description: Common error scenarios and solutions for PSP transaction flows
---

# Error Handling

## Common Error Scenarios

### 1. Authentication Errors

**401 Unauthorized**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

**Solution**: Refresh your access token using the refresh token endpoint.

### 2. Validation Errors

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "amount",
      "message": "Amount must be positive"
    }
  }
}
```

**Solution**: Review the error details and correct the request payload.

### 3. Resource Not Found

**404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Flow type not found"
  }
}
```

**Solution**: Verify the resource ID exists and you have access to it.

### 4. No PSP Available

**404 Not Found** (from fetch-psp endpoint)

```json
{
  "success": false,
  "error": {
    "code": "NO_PSP_AVAILABLE",
    "message": "No suitable PSP found for the given criteria"
  }
}
```

**Solution**: 

- Check if any PSPs are configured for the given flow action
- Verify transaction criteria (amount, currency, country) match PSP capabilities
- Check if PSPs are in maintenance mode
- Review routing and risk rules

### 5. Duplicate Transaction

**409 Conflict**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_TRANSACTION",
    "message": "Transaction with this externalRequestId already exists"
  }
}
```

**Solution**: Use a unique `externalRequestId` for each transaction or retrieve the existing transaction.

