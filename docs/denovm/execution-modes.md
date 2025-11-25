---
title: DenoVM Execution Modes
description: Understanding single-run and worker pool execution modes
---

# Execution Modes

## Single Run Mode

Each request starts a new Deno process. Lower memory, higher latency.

```yaml
deno.vm:
  enabled: true
  pool-enabled: false
```

*Best for:* Development, low-volume scenarios

## Worker Pool Mode

Persistent workers handle multiple requests. Lower latency, higher memory.

```yaml
deno.vm:
  enabled: true
  pool-enabled: true
  pool-size: 2
  worker-concurrency: 4
```

*Best for:* Production workloads, consistent latency

