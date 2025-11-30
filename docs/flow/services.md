---
title: Flow Services
description: Available services in the Flow library
---

# Services

## FlowTypeService

Manages flow types.

* `create(FlowTypeDto)` - Create a new flow type
* `read(String id)` - Read a flow type by ID
* `update(String id, FlowTypeDto)` - Update a flow type
* `delete(String id)` - Delete a flow type
* `list()` - List all flow types

## FlowActionService

Manages flow actions with schema validation.

* `create(FlowActionDto)` - Create a new flow action
* `read(String id)` - Read a flow action by ID
* `readAll(String flowTypeId)` - Read all flow actions for a flow type
* `update(String flowTypeId, String id, FlowActionDto)` - Update a flow action
* `delete(String id)` - Delete a flow action

## FlowTargetService

Manages flow targets.

* `create(FlowTargetDto)` - Create a new flow target
* `read(String id)` - Read a flow target by ID
* `readAll(String flowTypeId)` - Read all flow targets for a flow type
* `readWithAssociations(String id)` - Read flow target with associated flow definitions
* `update(String flowTypeId, String id, FlowTargetDto)` - Update a flow target
* `delete(String id)` - Delete a flow target
* `validateCredentialsForFlowTarget(String flowTargetId, String credentials)` - Validate credentials against schema

## FlowDefinitionService

Manages flow definitions with code and configuration.

* `create(FlowDefinitionDto)` - Create a new flow definition
* `read(String id)` - Read a flow definition by ID
* `update(String id, FlowDefinitionDto)` - Update a flow definition
* `delete(String id)` - Delete a flow definition
* `list()` - List all flow definitions

## Dashboard Action Controller

The dashboard uses `/dashboard-action` endpoint to interact with Flow services.

**Note:** This endpoint is automatically configured with:
- CORS support (all origins allowed)
- Security bypass (no authentication required)
- Only accessible from dashboard server when using separate port

Access the dashboard at: `http://localhost:{port}/fynxt-flow-dashboard`

See [Dashboard Guide](./dashboard.md) for more information.

