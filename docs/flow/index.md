---
title: Fynxt Flow Library
description: Spring Boot starter for Fynxt Lowcode Flow management. Auto-configures all Flow components when on the classpath.
---

# Fynxt Flow Library

Spring Boot starter for Fynxt Lowcode Flow management. Auto-configures all Flow components when on the classpath.

## Overview

The Fynxt Flow library provides a complete solution for managing lowcode flows in Spring Boot applications. It follows the Spring Boot starter pattern and requires minimal configuration.

### Key Features

* **Auto-Configuration**: All components are automatically configured when the library is on the classpath
* **JPA Integration**: Built-in Spring Data JPA repositories for all Flow entities
* **Type Safety**: Strongly typed entities and DTOs with MapStruct mappers
* **Validation**: JSON schema validation support for flow configurations
* **Auditing**: Automatic entity auditing with timestamps
* **Custom IDs**: Support for custom ID generation with prefixes

### Core Components

#### FlowType

Represents the type/category of a flow. Used to classify flows into different categories.

#### FlowAction

Represents an action that can be performed within a flow. Contains input/output schemas for validation and belongs to a FlowType.

#### FlowTarget

Represents the target destination or endpoint for a flow execution. Defines credential and input schemas and belongs to a FlowType.

#### FlowDefinition

The main flow definition that combines FlowAction and FlowTarget with execution code and configuration.

See [Architecture](./architecture.md) for detailed information.

