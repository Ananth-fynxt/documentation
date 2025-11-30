---
title: Flow Usage Examples
description: Examples of using the Flow library
---

# Usage Examples

## Creating a Flow Type

```java
FlowTypeDto flowType = FlowTypeDto.builder()
    .name("Payment Processing")
    .build();

FlowTypeDto created = flowTypeService.create(flowType);
```

## Creating a Flow Action

```java
FlowActionDto action = FlowActionDto.builder()
    .name("Process Payment")
    .flowTypeId("ftp001")
    .inputSchema("{\"type\":\"object\",\"properties\":{\"amount\":{\"type\":\"number\"}}}")
    .outputSchema("{\"type\":\"object\",\"properties\":{\"transactionId\":{\"type\":\"string\"}}}")
    .build();

FlowActionDto created = flowActionService.create(action);
```

## Creating a Flow Target

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

## Creating a Flow Definition

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

## Using the Dashboard

The dashboard provides a web UI for all flow management operations. No code required!

### Access Dashboard

1. Start your application
2. Navigate to: `http://localhost:{your-port}/fynxt-flow-dashboard`
3. Use the UI to create and manage flows

### Dashboard Configuration

**Default (same port):**
```yaml
fynxt:
  flow:
    dashboard:
      enabled: true  # Default
      # Runs on same port as application
```

**Custom path:**
```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      path: /my-dashboard  # Custom path
```

**Separate port:**
```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      port: 9000  # Separate port
```

See [Dashboard Guide](./dashboard.md) for detailed configuration and troubleshooting.

