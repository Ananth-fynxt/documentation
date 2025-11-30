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
    dashboard:
      enabled: true  # Dashboard enabled by default
      # Optional: customize path and port
      # path: /fynxt-flow-dashboard  # Default path
      # port: null  # null = same port, or specify custom port
```

## Access Dashboard

Once your application starts, access the dashboard at:
- **Default**: `http://localhost:{your-port}/fynxt-flow-dashboard`
- **Custom path**: `http://localhost:{your-port}/{your-custom-path}`

The dashboard is automatically configured with:
- ✅ CORS support (works with ngrok and custom domains)
- ✅ No authentication required
- ✅ All assets properly served

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

