---
title: Flow Quick Start
description: Get started with Flow library quickly
---

# Quick Start

## Add Dependency

```gradle
implementation("com.fynxt:lowcode-flow:<version>")
```

## Enable & Configure

```yaml
fynxt:
  flow:
    enabled: true  # Defaults to true, can be disabled
```

## Use It

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

