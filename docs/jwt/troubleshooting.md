---
title: JWT Troubleshooting
description: Common issues and solutions for JWT library
---

# Troubleshooting

## Token Generation Fails

* Verify `fynxt.jwt.enabled` is not `false`
* Check issuer, audience, and signing-key-id are configured
* Ensure signing key ID is not empty
* Check logs for specific error messages

## Token Validation Fails

* Verify token hasn't expired
* Check issuer and audience match configuration
* Ensure signing key ID matches generation key
* Verify token format (three parts separated by dots)

## Exceptions

* `JwtTokenGenerationException` - Token generation failed (check cause for details)
* `JwtSigningKeyException` - Signing key operation failed (verify key ID configuration)

