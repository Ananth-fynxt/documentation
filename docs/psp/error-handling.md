---
title: PSP Transaction Flow - Error Handling
description: Common error scenarios and solutions for PSP transaction flows
---

# Error Handling

## Common Error Scenarios

### 1. Authentication Errors

**401 Unauthorized** - Invalid X-ADMIN-TOKEN or X-SECRET-TOKEN

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "401",
  "message": "Invalid admin token",
  "data": null
}
```

or

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "401",
  "message": "Invalid secret token",
  "data": null
}
```

**Solution**: 
- Verify the token is correct and not expired
- For X-SECRET-TOKEN: Ensure the token matches the environment's secret token
- For X-ADMIN-TOKEN: Verify the admin token is valid

### 2. Validation Errors

**400 Bad Request**

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "400",
  "message": "Amount is required",
  "data": null
}
```

**Solution**: Review the error message and correct the request payload. Ensure all required fields are present and valid.

### 3. Resource Not Found

**404 Not Found**

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "404",
  "message": "Environment not found",
  "data": null
}
```

**Solution**: Verify the resource ID exists and you have access to it. Check that you're using the correct environment ID or flow type ID.

### 4. No PSP Available

**404 Not Found** (from fetch-psp endpoint)

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "404",
  "message": "No suitable PSP found for the given criteria",
  "data": null
}
```

**Solution**: 

- Check if any PSPs are configured for the given flow action
- Verify transaction criteria (amount, currency, country) match PSP capabilities
- Check if PSPs are in maintenance mode
- Review routing and risk rules
- Consider currency conversion if no PSPs are available for the requested currency

### 5. Duplicate Transaction

**400 Bad Request** (duplicate externalRequestId)

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "1936",
  "message": "Transaction with external request ID 'ext_sd001' already exists. Existing transaction ID: ortxl8cL2eNhtRaL",
  "data": null
}
```

**Solution**: Use a unique `externalRequestId` for each transaction or retrieve the existing transaction using the provided transaction ID.

### 6. Insufficient Permissions

**403 Forbidden**

```json
{
  "timestamp": "2025-12-16T08:30:00Z",
  "code": "403",
  "message": "Insufficient permissions or scope",
  "data": null
}
```

**Solution**: Verify your token has the required permissions for the requested operation.

