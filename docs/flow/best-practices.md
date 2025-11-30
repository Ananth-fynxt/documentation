---
title: Flow Best Practices
description: Best practices for using the Flow library
---

# Best Practices

## ID Generation

The library uses custom ID generators with prefixes:

* FlowType: `ftp` prefix
* FlowAction: `fat` prefix
* FlowTarget: `ftg` prefix
* FlowDefinition: `fld` prefix

## Schema Design

* Use JSON Schema for input/output validation
* Keep schemas versioned and backward compatible
* Document schema changes

## Flow Definitions

* Keep flow code modular and testable
* Use meaningful descriptions for better maintainability
* Store configuration as JSON for flexibility
* Ensure flowActionId and flowTargetId reference valid entities

## Dashboard Configuration

### Production

* Use **same-port configuration** (default) for simplicity
* Single port to manage, easier deployment
* Same domain for all requests, no CORS issues

### Development

* Use **separate port** if you want dashboard isolated
* Useful for testing dashboard independently

### Security

* Dashboard is **public by default** (no authentication)
* Disable if not needed:
  ```yaml
  fynxt:
    flow:
      dashboard:
        enabled: false
  ```

### Deployment

* Dashboard works automatically with **ngrok** and **custom domains**
* CORS configured automatically - no additional setup needed
* All assets properly served with correct MIME types

