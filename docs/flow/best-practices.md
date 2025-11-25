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

