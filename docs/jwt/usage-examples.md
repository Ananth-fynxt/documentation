---
title: JWT Usage Examples
description: Examples of using the JWT library
---

# Usage Examples

## Generate Access Token

```java
JwtTokenRequest request = JwtTokenRequest.builder()
    .subject("user123")
    .claims(Map.of("userId", "123", "role", "admin"))
    .tokenType(TokenType.ACCESS)
    .build();

JwtTokenResponse response = jwtExecutor.generateToken(request);
String token = response.getToken();
```

## Generate Refresh Token

```java
JwtTokenRequest request = JwtTokenRequest.builder()
    .subject("user123")
    .tokenType(TokenType.REFRESH)
    .build();

JwtTokenResponse response = jwtExecutor.generateToken(request);
String refreshToken = response.getToken();
```

## Validate Token

```java
JwtValidationRequest request = JwtValidationRequest.builder()
    .token(token)
    .build();

JwtValidationResponse response = jwtExecutor.validateToken(request);

if (response.isValid()) {
    String subject = response.getSubject();
    Map<String, Object> claims = response.getClaims();
} else {
    String error = response.getErrorMessage();
}
```

