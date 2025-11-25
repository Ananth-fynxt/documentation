---
title: JWT Best Practices
description: Best practices for using the JWT library
---

# Best Practices

## Signing Keys

* Use unique key IDs per environment (dev, staging, prod)
* Keep key IDs secure - don't expose in client-side code
* Rotate keys periodically by updating key IDs
* Use different keys for access and refresh tokens

## Token Lifecycle

* Keep access tokens short-lived (15 minutes to 1 hour)
* Use refresh tokens for longer sessions (7-30 days)
* Implement token refresh logic
* Handle expiration gracefully

## Security

* Keep claims minimal - only necessary information
* Don't store sensitive data (tokens are signed, not encrypted)
* Always validate tokens server-side
* Use HTTPS to prevent interception
* Implement secure token storage (httpOnly cookies for web)

