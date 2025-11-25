---
title: Flow Validation
description: JSON schema validation in Flow library
---

# Validation

The library includes JSON schema validation support through `FlowJsonSchemaAndPayloadValidator`. This validator is automatically configured and can be injected into your services.

```java
@Autowired
private FlowJsonSchemaAndPayloadValidator validator;

// Validate input against schema
ValidationResult result = validator.validate(schemaJson, payloadJson);
if (!result.isValid()) {
    // Handle validation errors
    result.getErrors().forEach(error -> log.error("Validation error: {}", error));
}
```

