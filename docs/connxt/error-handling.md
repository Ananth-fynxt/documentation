---
title: Connxt API V2 - Error Handling
description: Common error scenarios and solutions for Connxt API V2
---

# Error Handling

## Common Error Responses

All error responses follow this structure:

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "<error_code>",
  "message": "<error_message>",
  "errors": []
}
```

## Error Codes

| Code | HTTP Status | Description                          | Solution                                |
|------|-------------|--------------------------------------|-----------------------------------------|
| `1000`| 500         | Generic server error                 | Check server logs, retry request        |
| `4001`| 400         | Invalid request data                 | Validate request body format            |
| `4002`| 401         | Authentication required              | Check X-SECRET-TOKEN header            |
| `4003`| 403         | Insufficient permissions             | Verify token has required access        |
| `4004`| 404         | Resource not found                   | Verify IDs are correct                 |
| `4005`| 409         | Resource conflict (duplicate)        | Check if resource already exists        |

## Common Error Scenarios

### 1. Authentication Errors

**401 Unauthorized**

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "4002",
  "message": "Authentication required"
}
```

**Solution**: 
- Verify the `X-SECRET-TOKEN` header is included in the request
- Check that the token is valid and not expired
- Ensure the token matches the environment you're accessing

### 2. Validation Errors

**400 Bad Request**

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "4001",
  "message": "Validation failed",
  "errors": [
    {
      "field": "flowActionId",
      "message": "Flow action ID is required"
    },
    {
      "field": "credential",
      "message": "Credential does not match credentialSchema"
    }
  ]
}
```

**Solution**: 
- Review the error details in the `errors` array
- Validate request body format against the API documentation
- Ensure all required fields are present
- Verify credential format matches the `credentialSchema` from Step 1

### 3. Resource Not Found

**404 Not Found**

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "4004",
  "message": "Resource not found"
}
```

**Solution**: 
- Verify the resource ID exists (flowTargetId, flowActionId, pspId, etc.)
- Check that you have access to the resource
- Ensure you're using IDs from the correct environment

### 4. Duplicate Resource

**409 Conflict**

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "4005",
  "message": "PSP with same name already exists"
}
```

**Solution**: 
- Use a different name for the PSP
- Check if the PSP already exists and reuse it if appropriate
- Verify you're not creating duplicate resources

### 5. Server Errors

**500 Internal Server Error**

```json
{
  "timestamp": "2025-12-12T08:55:04Z",
  "code": "1000",
  "message": "Generic server error"
}
```

**Solution**: 
- Implement retry logic with exponential backoff
- Check server status and logs
- Contact support if the issue persists

## Best Practices for Error Handling

1. **Always check HTTP status codes** before processing response data
2. **Implement retry logic** for 5xx errors with exponential backoff
3. **Validate request data** client-side before sending to reduce 400 errors
4. **Log error responses** for debugging and monitoring
5. **Handle redirect responses** correctly to ensure proper user flow
6. **Provide user-friendly error messages** based on error codes
7. **Monitor error rates** to identify integration issues early

