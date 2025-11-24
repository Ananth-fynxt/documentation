---
title: Backend Library Overview
description: Comprehensive overview of Fynxt backend libraries - DenoVM, Flow, and JWT
---

# Backend Library Overview

Welcome to the Fynxt Backend Library documentation. Our libraries provide powerful, production-ready solutions for Spring Boot applications, designed to simplify complex integrations and enhance your development workflow.

## Available Backend Libraries

<div class="library-cards">
  <div class="library-card">
    <h2>DenoVM</h2>
    <p class="library-description">
      Execute JavaScript code in a secure Deno runtime from your Spring Boot application. 
      Supports worker pools, SDK utilities, and isolated execution environments.
    </p>
    <div class="library-features">
      <ul>
        <li>Secure JavaScript execution in Deno runtime</li>
        <li>Worker pool mode for high performance</li>
        <li>Built-in SDK with HTTP client, logger, and encoding utilities</li>
        <li>Auto-configuration with Spring Boot</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/denovm/" class="library-link">View Documentation →</a>
    </div>
  </div>

  <div class="library-card">
    <h2>Flow</h2>
    <p class="library-description">
      Spring Boot starter for Fynxt Lowcode Flow management. Auto-configures all Flow components 
      with JPA integration, schema validation, and type-safe entities.
    </p>
    <div class="library-features">
      <ul>
        <li>Lowcode flow management system</li>
        <li>Auto-configuration of all components</li>
        <li>JSON schema validation support</li>
        <li>Type-safe entities with MapStruct mappers</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/flow/" class="library-link">View Documentation →</a>
    </div>
  </div>

  <div class="library-card">
    <h2>JWT</h2>
    <p class="library-description">
      JWT token generation and validation library for Java/Spring. Provides configurable signing keys, 
      dual token support (access & refresh), and HMAC-SHA256 signing.
    </p>
    <div class="library-features">
      <ul>
        <li>Token generation and validation</li>
        <li>Dual token support (access & refresh)</li>
        <li>HMAC-SHA256 signing</li>
        <li>Flexible configuration with per-request overrides</li>
      </ul>
    </div>
    <div class="library-actions">
      <a href="/jwt/" class="library-link">View Documentation →</a>
    </div>
  </div>
</div>

## Quick Start

All Fynxt libraries follow the Spring Boot starter pattern, making integration simple and straightforward:

1. **Add Dependency** - Include the library in your `build.gradle` or `pom.xml`
2. **Enable & Configure** - Add configuration to your `application.yml`
3. **Use It** - Inject the service and start using the library

Each library provides comprehensive documentation with examples, API references, and best practices.

## Library Details

### DenoVM

Execute JavaScript code securely in a Deno runtime environment. Perfect for dynamic script execution, custom business logic, and workflow automation.

**Key Capabilities:**
- Secure isolated execution environments
- Worker pool mode for optimal performance
- Built-in SDK with HTTP, logging, and encoding utilities
- Support for async JavaScript functions

[Get Started with DenoVM →](/denovm/)

### Flow

Complete lowcode flow management system for Spring Boot applications. Manage flow types, actions, targets, and definitions with ease.

**Key Capabilities:**
- Auto-configuration of all Flow components
- JPA integration with Spring Data
- JSON schema validation
- Type-safe DTOs and entities

[Get Started with Flow →](/flow/)

### JWT

Enterprise-grade JWT token management with support for access and refresh tokens. Secure, configurable, and production-ready.

**Key Capabilities:**
- Token generation and validation
- Separate configuration for access and refresh tokens
- HMAC-SHA256 signing with configurable keys
- Per-request configuration overrides

[Get Started with JWT →](/jwt/)


