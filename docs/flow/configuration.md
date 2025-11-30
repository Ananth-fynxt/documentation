---
title: Flow Configuration
description: Configuration options for Flow library
---

# Configuration

## Basic Configuration

```yaml
fynxt:
  flow:
    enabled: true  # Enable/disable the Flow module
    dashboard:
      enabled: true  # Enable/disable the dashboard (default: true)
      path: /fynxt-flow-dashboard  # Dashboard path (default: /fynxt-flow-dashboard)
      port: null  # Dashboard port - null = same port as application, or specify custom port
```

### Dashboard Configuration

The dashboard is **enabled by default** and runs on the **same port** as your application.

#### Default Behavior

- **Path**: `/fynxt-flow-dashboard` (default)
- **Port**: Same as application (no separate port)
- **CORS**: Automatically configured for all origins (localhost, ngrok, custom domains)
- **Security**: Automatically bypassed (no authentication required)

#### Custom Configuration Examples

**Same port, custom path:**
```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      path: /my-custom-dashboard
      port: null  # Uses application port
```

**Separate port (custom port):**
```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      path: /fynxt-flow-dashboard  # Default path
      port: 9000  # Custom port
```

**Disable dashboard:**
```yaml
fynxt:
  flow:
    dashboard:
      enabled: false
```

#### Security & CORS

The dashboard automatically:
- ✅ Configures CORS headers for all origins (`Access-Control-Allow-Origin: *`)
- ✅ Bypasses Spring Security for dashboard paths and `/dashboard-action`
- ✅ Works with ngrok, custom domains, and localhost
- ✅ Handles asset requests (JS, CSS) with proper CORS headers

**Protected Paths:**
- `{dashboard.path}/**` - All dashboard resources (HTML, JS, CSS, assets)
- `/dashboard-action/**` - Dashboard API endpoints
- `/favicon.ico` - Favicon request

No additional security configuration needed!

## Entity Manager Configuration

IMPORTANT: You must include Flow entity packages in your EntityManagerFactory configuration:

```java
@Bean
public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
    LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
    em.setPackagesToScan(
        "your.entities",
        "fynxt.flowtype",
        "fynxt.flowaction",
        "fynxt.flowtarget",
        "fynxt.flowdefinition"
    );
    // ... other configuration
    return em;
}
```

