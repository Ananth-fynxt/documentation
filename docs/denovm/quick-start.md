---
title: DenoVM Quick Start
description: Get started with DenoVM library quickly
---

# Quick Start

## Add Dependency

```gradle
implementation("com.fynxt:denovm:<version>")
```

## Enable & Configure

```yaml
deno.vm:
  enabled: true
  pool-enabled: true    # false for single-run mode
  pool-size: 2
  worker-concurrency: 4
  timeout-seconds: 30
```

## Use It

```java
@Autowired
private DenoVMService denoVMService;

    DenoVMRequest request = DenoVMRequest.builder()
    .id("script-001")
    .code("return { message: 'Hello from Deno!' };")
    .data(Map.of("userId", "123"))
        .build();
    
    DenoVMResult result = denoVMService.executeCode(request);
    
    if (result.isSuccess()) {
    System.out.println(result.getData());
    } else {
    System.err.println(result.getError());
}
```

