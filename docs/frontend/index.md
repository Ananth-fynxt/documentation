# Frontend Library Overview

Welcome to the Fynxt Frontend documentation. Nexxus provides plug-and-play React components for managing PSPs, fees, risk rules, routing, transaction limits, and webhooks.

## Available Frontend Components

<div class="library-cards">
  <div class="library-card">
    <h2>PSP Components</h2>
    <p class="library-description">
      List, configure, and manage Payment Service Providers with built-in API integration.
    </p>
    <div class="library-features">
      <ul>
        <li>PSP listing with configured / available sections</li>
        <li>PSP configuration and credentials modals</li>
        <li>PSP detail pages with tabs (Fees, Limits, Risk, Security)</li>
        <li>Themeable via NexxusProvider</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/nexxus" class="library-link">View Documentation</a>
    </div>
  </div>

  <div class="library-card">
    <h2>Fee Component</h2>
    <p class="library-description">
      Create and manage fee rules with fixed and percentage components per PSP.
    </p>
    <div class="library-features">
      <ul>
        <li>Fee list with search and table view</li>
        <li>Create / edit fee modals with validation</li>
        <li>INCLUSIVE and EXCLUSIVE charge types</li>
        <li>Multi-PSP and multi-country support</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/fee-rule" class="library-link">View Documentation</a>
    </div>
  </div>

  <div class="library-card">
    <h2>Risk Rule Component</h2>
    <p class="library-description">
      Define risk rules with criteria-based blocking and alerting per PSP.
    </p>
    <div class="library-features">
      <ul>
        <li>DEFAULT and CUSTOMER rule types</li>
        <li>BLOCK and ALERT actions</li>
        <li>Customer tag and account-type criteria</li>
        <li>Duration-based thresholds</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/risk-rule" class="library-link">View Documentation</a>
    </div>
  </div>

  <div class="library-card">
    <h2>Routing Rule Component</h2>
    <p class="library-description">
      Configure payment routing with priority or weightage-based PSP selection.
    </p>
    <div class="library-features">
      <ul>
        <li>Priority and Weightage routing methods</li>
        <li>Query builder for currency/country conditions</li>
        <li>Drag-and-drop PSP ordering</li>
        <li>Count, Amount, and Percentage rule types</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/routing-rule" class="library-link">View Documentation</a>
    </div>
  </div>

  <div class="library-card">
    <h2>Transaction Limits Component</h2>
    <p class="library-description">
      Set min/max transaction limits per flow action, currency, country, and customer tag.
    </p>
    <div class="library-features">
      <ul>
        <li>Per-action deposit/withdrawal limits</li>
        <li>Multi-country and customer tag filtering</li>
        <li>Dynamic form based on flow actions</li>
        <li>Table view with search</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/transaction-rule" class="library-link">View Documentation</a>
    </div>
  </div>

  <div class="library-card">
    <h2>Webhook Component</h2>
    <p class="library-description">
      Manage webhook endpoints for transaction status notifications.
    </p>
    <div class="library-features">
      <ul>
        <li>SUCCESS, FAILURE, and NOTIFICATION status types</li>
        <li>Configurable retry count (1-3)</li>
        <li>Enable / disable per webhook</li>
        <li>Create, edit, and delete modals</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/webhook" class="library-link">View Documentation</a>
    </div>
  </div>
</div>

## Quick Start

1. Install packages:

```bash
npm install @nexxus/react @nexxus/psp
```

2. Wrap your app with `NexxusProvider`:

```tsx
import { NexxusProvider, nexxusThemeSystem } from "@nexxus/react";

function App() {
  return (
    <NexxusProvider value={nexxusThemeSystem}>
      {/* your app */}
    </NexxusProvider>
  );
}
```

3. Render any component:

```tsx
import { PSPComponent } from "@nexxus/psp";

<PSPComponent
  baseURL="https://api.example.com/nexxus/v1"
  brand="your-brand-id"
  environment="your-env-id"
  flowTypeId="ftp_001"
/>
```

## Package List

| Package | npm | Description |
| --- | --- | --- |
| Theme & Provider | `@nexxus/react` | NexxusProvider, theme system, i18n |
| PSP | `@nexxus/psp` | PSP listing, configuration, and details |
| Fees | `@nexxus/fees-component` | Fee rule management |
| Risk Rules | `@nexxus/risk-component` | Risk rule management |
| Routing Rules | `@nexxus/routing-component` | Payment routing rules |
| Transaction Limits | `@nexxus/transaction-component` | Transaction limit management |
| Webhooks | `@nexxus/webhook-component` | Webhook management |
| API Services | `@nexxus/api-services` | Shared API client and service layer |
| Common Components | `@nexxus/common-component` | Shared UI primitives (Input, Select, etc.) |
| Table | `@nexxus/table-component` | Shared table component |

<style>
.library-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  margin: 3rem 0;
}

.library-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 2rem;
  background: var(--vp-c-bg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.library-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--vp-c-brand), var(--vp-c-brand-light));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.library-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--vp-c-brand-light);
}

.library-card:hover::before {
  transform: scaleX(1);
}

.library-card h2 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.library-description {
  color: var(--vp-c-text-2);
  margin: 0 0 1.5rem 0;
  line-height: 1.7;
  font-size: 0.95rem;
}

.library-features {
  margin: 1.5rem 0;
}

.library-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.library-features li {
  padding: 0.75rem 0;
  padding-left: 2rem;
  position: relative;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  line-height: 1.5;
}

.library-features li::before {
  content: "\2713";
  position: absolute;
  left: 0;
  top: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-light);
  color: var(--vp-c-brand);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
}

.library-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.library-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  padding: 0.5rem 0;
}

.library-link:hover {
  color: var(--vp-c-brand-dark);
  gap: 0.75rem;
}
</style>
