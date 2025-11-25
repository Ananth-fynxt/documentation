---
title: Flow Troubleshooting
description: Common issues and solutions for Flow library
---

# Troubleshooting

## Entity Not Managed Error

If you see "Not a managed type" errors, ensure Flow entity packages are included in your EntityManagerFactory's `setPackagesToScan()`.

## Auto-Configuration Not Working

* Check that `fynxt.flow.enabled` is not set to `false`
* Verify the library is on the classpath
* Check Spring Boot auto-configuration logs

