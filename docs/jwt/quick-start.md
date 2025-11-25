---
title: JWT Quick Start
description: Get started with JWT library quickly
---

# Quick Start

## Add Dependency

```gradle
implementation("com.fynxt:jwt:<version>")
```

## Enable & Configure

```yaml
fynxt:
  jwt:
    enabled: true  # Defaults to true
    issuer: "my-app"
    audience: "my-api"
    signing-key-id: "keyid-abc123"
    refresh-signing-key-id: "refreshid-xyz789"
    access-token-expiration: "PT1H"  # 1 hour (ISO-8601 format)
    refresh-token-expiration: "P7D"  # 7 days (ISO-8601 format)
```

## Use It

The library auto-configures all components. Just inject the JWT executor:

```java
@Autowired
private JwtExecutor jwtExecutor;

// Generate token
JwtTokenRequest request = JwtTokenRequest.builder()
    .subject("user123")
    .claims(Map.of("role", "admin"))
    .build();

JwtTokenResponse response = jwtExecutor.generateToken(request);
String token = response.getToken();

// Validate token
JwtValidationRequest validationRequest = JwtValidationRequest.builder()
    .token(token)
    .build();

JwtValidationResponse validation = jwtExecutor.validateToken(validationRequest);
if (validation.isValid()) {
    String subject = validation.getSubject();
    Map<String, Object> claims = validation.getClaims();
}
```

