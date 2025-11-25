---
title: DenoVM Architecture
description: Architecture and system components of the DenoVM library
---

# Architecture

## Execution Flow

![DenoVM Execution Flow](../assets/denovm-execution-sequence.png)

## Detailed Flow

![DenoVM Complete Execution Flow](../assets/denovm-detailed-flow.png)

## System Components

| Component | Purpose |
|-----------|---------|
| `DenoVMService` | Main entry point - accepts requests and returns results |
| `ExecutionStrategyFactory` | Selects single-run or pool mode based on configuration |
| `SingleExecutionStrategy` | Creates new Deno process per request |
| `PoolExecutionStrategy` | Uses persistent worker pool for requests |
| `DenoWorkerPool` | Manages pool of Deno workers |
| `DenoWorker` | Individual persistent Deno process |

## Worker Lifecycle

Workers transition: **Creating** → **Idle** → **Busy** → **Recycling/Failed** → **Terminated**

Auto-recycle after `pool-max-tasks-per-worker` tasks or when idle for `pool-idle-kill-seconds`.

## Error Handling

| Error Type | Behavior | Solution |
|------------|----------|----------|
| Script error | `DenoVMResult.success=false` | Check error message, validate script |
| Timeout | `DenoVMResult.error="VM execution timeout"` | Increase `timeout-seconds` |
| Worker failure | `DenoWorkerException` thrown | Worker auto-replaced; retry |
| Pool failure | `DenoWorkerPoolException` thrown | Check Deno installation |

## Security

* Isolated Deno processes per worker
* Automatic temp file cleanup
* Network/file permissions via Deno flags
* No JVM memory access from JavaScript

