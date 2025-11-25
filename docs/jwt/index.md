---
title: Fynxt JWT Library
description: JWT token generation and validation library for Java/Spring. Provides JWT token generation and validation capabilities with configurable signing keys.
---

# Fynxt JWT Library

JWT token generation and validation library for Java/Spring. Provides JWT token generation and validation capabilities with configurable signing keys.

## Overview

The Fynxt JWT library provides JWT token generation and validation for Spring Boot applications. It follows the Spring Boot starter pattern and requires minimal configuration.

### Key Features

* **Auto-Configuration**: All components automatically configured when on the classpath
* **Token Generation & Validation**: Generate and validate JWT tokens with signature verification
* **Dual Token Support**: Separate configuration for access (1 hour) and refresh (7 days) tokens
* **Flexible Configuration**: Per-request overrides or use default configuration
* **HMAC-SHA256 Signing**: Configurable signing keys derived from key IDs

See [Architecture](./architecture.md) for detailed information.

