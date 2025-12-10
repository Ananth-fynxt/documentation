# Frontend Library Overview

Welcome to the Fynxt Frontend documentation. Start here for Nexxus React components that provide plug-and-play PSP listing, selection, and configuration.

## Available Frontend Components

<div class="library-cards">
  <div class="library-card">
    <h2>Nexxus PSP Components</h2>
    <p class="library-description">
      Plug-and-play React components to list, select, and configure Payment Service Providers with Nexxus APIs.
    </p>
    <div class="library-features">
      <ul>
        <li>Ready-to-use PSP listing UI</li>
        <li>Built-in API integration</li>
        <li>Themeable via Nexxus provider</li>
        <li>Callback hooks for selection</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/frontend/nexxus" class="library-link">View Documentation →</a>
    </div>
  </div>
</div>

## Quick Start

1. Install the packages: `npm install @nexxus/react @nexxus/psp @nexxus/psp-details`
2. Wrap your app with `NexxusProvider` using `nexxusThemeSystem`
3. Render the `PSP` component and handle `onPspCardClick`

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
  content: "✓";
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

.library-link::after {
  content: "→";
  transition: transform 0.2s ease;
}

.library-link:hover::after {
  transform: translateX(4px);
}
</style>
