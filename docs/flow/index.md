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
* **Auditing**: Automatic entity auditing with timestamps (createdAt, updatedAt)
* **Custom IDs**: Support for custom ID generation with prefixes
* **Dashboard UI**: Built-in React dashboard for managing flows (default: `/fynxt-flow-dashboard`)
* **Flexible Deployment**: Dashboard runs on same port by default, or separate port if configured
* **CORS & Security**: Automatic CORS configuration and security bypass for dashboard paths

### Core Components

#### FlowType

Represents the type/category of a flow. Used to classify flows into different categories.

#### FlowAction

Represents an action that can be performed within a flow. Contains input/output schemas for validation and belongs to a FlowType.

#### FlowTarget

Represents the target destination or endpoint for a flow execution. Defines credential and input schemas and belongs to a FlowType.

#### FlowDefinition

The main flow definition that combines FlowAction and FlowTarget with execution code and configuration.

#### Dashboard

Built-in web dashboard for managing flows. Provides a React-based UI for creating, editing, and managing flow types, actions, targets, and definitions.

- Default path: `/fynxt-flow-dashboard`
- Runs on same port as application by default
- Automatic CORS configuration for ngrok/custom domains
- No authentication required

See [Dashboard Guide](./dashboard.md) for detailed information.

## Quick Links

* [Quick Start](./quick-start.md) - Get started in minutes
* [Configuration](./configuration.md) - Configure Flow and Dashboard
* [Dashboard](./dashboard.md) - Dashboard setup and usage
* [Architecture](./architecture.md) - System architecture and components
* [Services](./services.md) - Available services and APIs
* [Usage Examples](./usage-examples.md) - Code examples
* [Best Practices](./best-practices.md) - Recommended practices
* [Troubleshooting](./troubleshooting.md) - Common issues and solutions

