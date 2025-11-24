---
title: Fynxt Flow Library
description: Spring Boot starter for Fynxt Lowcode Flow management. Auto-configures all Flow components when on the classpath.
---

# Fynxt Flow Library

Spring Boot starter for Fynxt Lowcode Flow management. Auto-configures all Flow components when on the classpath.

## Quick Start

### Add Dependency

```gradle
implementation("com.fynxt:lowcode-flow:<version>")
```

### Enable & Configure

```yaml
fynxt:
  flow:
    enabled: true  # Defaults to true, can be disabled
```

### Use It

The library auto-configures all components. Just inject the services:

```java
@Autowired
private FlowTypeService flowTypeService;

@Autowired
private FlowActionService flowActionService;

@Autowired
private FlowTargetService flowTargetService;

@Autowired
private FlowDefinitionService flowDefinitionService;
```

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

## Configuration

### Basic Configuration

```yaml
fynxt:
  flow:
    enabled: true  # Enable/disable the Flow module
```

### Entity Manager Configuration

IMPORTANT: You must include Flow entity packages in your EntityManagerFactory configuration:

```java
@Bean
public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
    LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
    em.setPackagesToScan(
        "your.entities",
        "fynxt.flowtype",
        "fynxt.flowaction",
        "fynxt.flowtarget",
        "fynxt.flowdefinition"
    );
    // ... other configuration
    return em;
}
```

## Usage Examples

### Creating a Flow Type

```java
FlowTypeDto flowType = FlowTypeDto.builder()
    .name("Payment Processing")
    .build();

FlowTypeDto created = flowTypeService.create(flowType);
```

### Creating a Flow Action

```java
FlowActionDto action = FlowActionDto.builder()
    .name("Process Payment")
    .flowTypeId("ftp001")
    .inputSchema("{\"type\":\"object\",\"properties\":{\"amount\":{\"type\":\"number\"}}}")
    .outputSchema("{\"type\":\"object\",\"properties\":{\"transactionId\":{\"type\":\"string\"}}}")
    .build();

FlowActionDto created = flowActionService.create(action);
```

### Creating a Flow Target

```java
FlowTargetDto target = FlowTargetDto.builder()
    .name("Payment Gateway API")
    .flowTypeId("ftp001")
    .logo("https://example.com/logo.png")
    .credentialSchema("{\"type\":\"object\",\"properties\":{\"apiKey\":{\"type\":\"string\"}}}")
    .inputSchema("{\"type\":\"object\",\"properties\":{\"amount\":{\"type\":\"number\"}}}")
    .build();

FlowTargetDto created = flowTargetService.create(target);
```

### Creating a Flow Definition

```java
FlowDefinitionDto definition = FlowDefinitionDto.builder()
    .flowActionId("fat001")
    .flowTargetId("ftg001")
    .description("Process credit card payment")
    .code("export async function processPayment(data) { ... }")
    .flowConfiguration(objectMapper.readTree("{\"timeout\":30}"))
    .build();

FlowDefinitionDto created = flowDefinitionService.create(definition);
```

## Services

### FlowTypeService

Manages flow types.

* `create(FlowTypeDto)` - Create a new flow type
* `read(String id)` - Read a flow type by ID
* `update(String id, FlowTypeDto)` - Update a flow type
* `delete(String id)` - Delete a flow type
* `list()` - List all flow types

### FlowActionService

Manages flow actions with schema validation.

* `create(FlowActionDto)` - Create a new flow action
* `read(String id)` - Read a flow action by ID
* `readAll(String flowTypeId)` - Read all flow actions for a flow type
* `update(String flowTypeId, String id, FlowActionDto)` - Update a flow action
* `delete(String id)` - Delete a flow action

### FlowTargetService

Manages flow targets.

* `create(FlowTargetDto)` - Create a new flow target
* `read(String id)` - Read a flow target by ID
* `readAll(String flowTypeId)` - Read all flow targets for a flow type
* `readWithAssociations(String id)` - Read flow target with associated flow definitions
* `update(String flowTypeId, String id, FlowTargetDto)` - Update a flow target
* `delete(String id)` - Delete a flow target
* `validateCredentialsForFlowTarget(String flowTargetId, String credentials)` - Validate credentials against schema

### FlowDefinitionService

Manages flow definitions with code and configuration.

* `create(FlowDefinitionDto)` - Create a new flow definition
* `read(String id)` - Read a flow definition by ID
* `update(String id, FlowDefinitionDto)` - Update a flow definition
* `delete(String id)` - Delete a flow definition
* `list()` - List all flow definitions

## Validation

The library includes JSON schema validation support through `FlowJsonSchemaAndPayloadValidator`. This validator is automatically configured and can be injected into your services.

```java
@Autowired
private FlowJsonSchemaAndPayloadValidator validator;

// Validate input against schema
ValidationResult result = validator.validate(schemaJson, payloadJson);
if (!result.isValid()) {
    // Handle validation errors
    result.getErrors().forEach(error -> log.error("Validation error: {}", error));
}
```

## Best Practices

### ID Generation

The library uses custom ID generators with prefixes:

* FlowType: `ftp` prefix
* FlowAction: `fat` prefix
* FlowTarget: `ftg` prefix
* FlowDefinition: `fld` prefix

### Schema Design

* Use JSON Schema for input/output validation
* Keep schemas versioned and backward compatible
* Document schema changes

### Flow Definitions

* Keep flow code modular and testable
* Use meaningful descriptions for better maintainability
* Store configuration as JSON for flexibility
* Ensure flowActionId and flowTargetId reference valid entities

## Troubleshooting

### Entity Not Managed Error

If you see "Not a managed type" errors, ensure Flow entity packages are included in your EntityManagerFactory's `setPackagesToScan()`.

### Auto-Configuration Not Working

* Check that `fynxt.flow.enabled` is not set to `false`
* Verify the library is on the classpath
* Check Spring Boot auto-configuration logs

