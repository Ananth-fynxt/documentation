---
title: JWT Configuration
description: Configuration options for JWT library
---

# Configuration

> **Note:** If you haven't set up the repository and dependency yet, please refer to the [Quick Start Guide](./quick-start.md) for Maven and Gradle setup instructions.

## Basic Configuration

```yaml
fynxt:
  jwt:
    enabled: true  # Defaults to true
    issuer: "my-application"
    audience: "my-api"
    signing-key-id: "keyid-abc123"
    refresh-signing-key-id: "refreshid-xyz789"
    access-token-expiration: "PT1H"  # 1 hour (ISO-8601)
    refresh-token-expiration: "P7D"  # 7 days (ISO-8601)
```

## Duration Format (ISO-8601)

* `PT15M` - 15 minutes
* `PT30M` - 30 minutes
* `PT1H` - 1 hour
* `P1D` - 1 day
* `P7D` - 7 days
* `P30D` - 30 days

## Per-Request Overrides

Override defaults per request:

```java
JwtTokenRequest request = JwtTokenRequest.builder()
    .issuer("custom-issuer")
    .audience("custom-audience")
    .signingKeyId("custom-key-id")
    .tokenType(TokenType.REFRESH)
    .expiresAt(OffsetDateTime.now().plusDays(30))
    .build();
```

