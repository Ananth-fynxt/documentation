---
title: DenoVM Limitations
description: Known limitations of the DenoVM library
---

# Limitations

* Scripts must complete within `timeout-seconds` (default 15s)
* Memory limited by `v8-max-old-space-mb` (default 32MB)
* No state persistence between executions
* Requires Deno executable on host
* JavaScript/TypeScript only (no Python/WASM)

