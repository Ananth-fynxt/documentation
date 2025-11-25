---
title: Flow Architecture
description: Architecture and system components of the Flow library
---

# Architecture

## Auto-Configuration Sequence

![Flow Auto-Configuration Sequence](../assets/flow-autoconfig.png)

## Flow Component Sequence

The following diagram shows the sequence of creating and using Flow components:

![Flow Component Sequence Diagram](../assets/flow-sequence.png)

## System Components

| Component | Purpose |
|-----------|---------|
| `FlowTypeService` | Manages flow type entities - categories for organizing flows |
| `FlowActionService` | Manages flow action entities - defines actions with input/output schemas |
| `FlowTargetService` | Manages flow target entities - defines targets with credential schemas |
| `FlowDefinitionService` | Manages flow definition entities - combines actions and targets with code |
| `FlowModuleConfiguration` | Auto-configuration class - sets up all components when library is on classpath |
| `FlowSchemaInitializer` | Initializes database schema on application startup |
| `FlowJsonSchemaAndPayloadValidator` | Validates JSON payloads against JSON schemas |

