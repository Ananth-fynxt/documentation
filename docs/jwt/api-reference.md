---
title: JWT API Reference
description: API reference for JWT library
---

# API Reference

## JwtExecutor

Main service for JWT operations.

* `generateToken(JwtTokenRequest)` - Generate a JWT token
* `validateToken(JwtValidationRequest)` - Validate a JWT token

## Token Types

* **ACCESS** - Short-lived tokens (default: 1 hour)
* **REFRESH** - Long-lived tokens (default: 7 days)

