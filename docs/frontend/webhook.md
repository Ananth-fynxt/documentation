# Webhook Component

Plug-and-play React component to manage webhook endpoints for transaction status notifications using Nexxus APIs.

---

## Installation

```bash
npm install @nexxus/webhook-component
```

---

## Basic Usage

```tsx
import WebhookComponent from "@nexxus/webhook-component";

<WebhookComponent
  baseURL="https://api.example.com/nexxus/v1"
  brand="your-brand-id"
  environment="your-env-id"
/>
```

---

## Component Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `client` | `QueryClient` | No | Custom TanStack Query client. Uses internal client if omitted. |
| `domain` | `string` | No | Base API domain. Takes precedence over `baseURL`. |
| `baseURL` | `string` | No | API base URL (e.g., `https://api.example.com/nexxus/v1`). |
| `secretToken` | `string` | No | API authentication token. Sent as `X-SECRET-TOKEN` header. |
| `header` | `Record<string, string>` | No | Custom headers (take precedence over derived ones). |
| `brand` | `string` | No | Brand identifier. Alias for `brandId`. |
| `brandId` | `string` | No | Brand ID for API scoping. |
| `environment` | `string` | No | Environment identifier. Alias for `environmentId`. |
| `environmentId` | `string` | No | Environment ID for API scoping. |

> Headers sent automatically: `X-BRAND-ID` (from `brand`/`brandId`), `X-ENV-ID` (from `environment`/`environmentId`), and `X-SECRET-TOKEN` (from `secretToken`). Custom `header` entries win over these.

---

## Full Example

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";
import WebhookComponent from "@nexxus/webhook-component";

export default function WebhookPage() {
  return (
    <NexxusProvider theme={nexxusThemeSystem}>
      <WebhookComponent
        baseURL="https://api.example.com/nexxus/v1"
        brand="your-brand-id"
        environment="your-env-id"
      />
    </NexxusProvider>
  );
}
```

---

## Sub-Components

| Component | Description |
| --- | --- |
| `WebhookList` | Table view of webhooks with create/edit/delete and enable/disable |
| `WebhookForm` | Form for creating or editing a webhook |
| `WebhookModal` | Modal wrapper around `WebhookForm` |

---

## Form Fields

| Field | Type | Component | Validation |
| --- | --- | --- | --- |
| `statusType` | `'SUCCESS' \| 'FAILURE' \| 'NOTIFICATION'` | Select | Required |
| `url` | `string` | Input | Required. Valid URL. |
| `retry` | `number` (1–3) | Select / NumberInput | Required. Retry attempts on failure. |
| `status` | `'ENABLED' \| 'DISABLED'` | Switch | Defaults to `ENABLED` |

### Status Types

| Value | Description |
| --- | --- |
| `SUCCESS` | Fires when a transaction completes successfully |
| `FAILURE` | Fires when a transaction fails |
| `NOTIFICATION` | Fires for general status notifications |

---

## API Integration (handled internally)

| Method | Endpoint | Description |
| --- | --- | --- |
| `getWebhooks` | `GET /webhooks` | List all webhooks for the current brand/environment |
| `getWebhookById` | `GET /webhooks/{id}` | Get a webhook by ID (for edit) |
| `createWebhook` | `POST /webhooks` | Create a new webhook |
| `updateWebhook` | `PUT /webhooks/{id}` | Update an existing webhook |
| `deleteWebhook` | `DELETE /webhooks/{id}` | Delete a webhook |

### Example API Payloads

**Create Webhook:**

```json
{
  "statusType": "SUCCESS",
  "url": "https://merchant.example.com/hooks/nexxus",
  "retry": "3",
  "status": "ENABLED"
}
```

> `brandId` and `environmentId` are added automatically via request headers, not the payload body.

**Webhook Response:**

```json
{
  "data": {
    "id": "wh_001",
    "statusType": "SUCCESS",
    "url": "https://merchant.example.com/hooks/nexxus",
    "retry": 3,
    "brandId": "brand-123",
    "environmentId": "env-456",
    "status": "ENABLED",
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00",
    "createdBy": "user_001",
    "updatedBy": "user_001"
  }
}
```

---

## Webhook Object

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier |
| `statusType` | `'SUCCESS' \| 'FAILURE' \| 'NOTIFICATION'` | Event that triggers the webhook |
| `url` | `string` | Endpoint the notification is POSTed to |
| `retry` | `number` | Retry attempts on failure (1–3) |
| `brandId` | `string` | Brand ID |
| `environmentId` | `string` | Environment ID |
| `status` | `'ENABLED' \| 'DISABLED'` | Webhook status |
| `createdAt` | `string` | Creation timestamp |
| `updatedAt` | `string` | Last update timestamp |
| `createdBy` | `string` | Creator user ID |
| `updatedBy` | `string` | Last editor user ID |

---

## i18n

The webhook component registers translations under the `webhooks` namespace. Supported languages: `en`, `es`, `ar`.

Key sections: `webhooks.list.*`, `webhooks.form.*`, `webhooks.modals.*`, `webhooks.validation.*`.
