---
title: DenoVM Configuration
description: Configuration options for DenoVM library
---

# Configuration

> **Note:** If you haven't set up the repository and dependency yet, please refer to the [Quick Start Guide](./quick-start.md) for Maven and Gradle setup instructions.

## Configuration Properties

| Property | Default | Description |
|----------|---------|-------------|
| `deno.vm.enabled` | `false` | Enable DenoVM service (required) |
| `deno.vm.pool-enabled` | `true` | Worker pool mode (false = single-run per request) |
| `deno.vm.pool-size` | `1` | Number of persistent workers |
| `deno.vm.worker-concurrency` | `2` | Max concurrent tasks per worker |
| `deno.vm.timeout-seconds` | `15` | Execution timeout per request (seconds) |
| `deno.vm.pool-max-tasks-per-worker` | `1000` | Auto-recycle worker after N tasks (0 = disabled) |
| `deno.vm.pool-idle-kill-seconds` | `0` | Kill idle workers after N seconds (0 = disabled) |
| `deno.vm.pool-janitor-enabled` | `true` | Enable automatic cleanup of stale temp files |
| `deno.vm.pool-janitor-interval-seconds` | `60` | Janitor cleanup interval (seconds) |
| `deno.vm.pool-janitor-file-ttl-seconds` | `300` | Delete temp files older than N seconds |
| `deno.vm.v8-max-old-space-mb` | `32` | V8 heap size limit in MB |
| `deno.vm.executable` | `null` | Explicit path to Deno executable (auto-detected if not set) |

*Key properties:*
- `worker-concurrency`: Limits concurrent tasks per worker (prevents overload)
- `pool-max-tasks-per-worker`: Auto-recycles workers to prevent memory leaks
- `pool-idle-kill-seconds`: Terminates idle workers to save resources (set to 300+ for cost savings)

