---
title: Flow Dashboard
description: Built-in dashboard for managing flows
---

# Dashboard

The Fynxt Flow library includes a built-in React-based dashboard for managing flows through a web interface.

## Overview

The dashboard provides a complete UI for:
- Creating and managing Flow Types
- Defining Flow Actions with input/output schemas
- Configuring Flow Targets with credential schemas
- Building Flow Definitions with execution code

## Default Configuration

The dashboard is **enabled by default** with the following settings:

```yaml
fynxt:
  flow:
    dashboard:
      enabled: true              # Enabled by default
      path: /fynxt-flow-dashboard # Default path
      port: null                  # Same port as application (default)
```

### Default Access

Once your application starts, access the dashboard at:
- **URL**: `http://localhost:{application-port}/fynxt-flow-dashboard`
- **Example**: If your app runs on port 8001, access at `http://localhost:8001/fynxt-flow-dashboard`

## Configuration Options

### Custom Path

Change the dashboard path:

```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      path: /my-dashboard  # Custom path
```

Access at: `http://localhost:{port}/my-dashboard`

### Separate Port

Run dashboard on a different port:

```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      port: 9000  # Custom port
```

Dashboard runs on: `http://localhost:9000/fynxt-flow-dashboard`

Application runs on: `http://localhost:{application-port}`

### Disable Dashboard

Disable the dashboard completely:

```yaml
fynxt:
  flow:
    dashboard:
      enabled: false
```

## Security & CORS

The dashboard is automatically configured for public access:

### Automatic CORS Configuration

✅ **All origins allowed** - Works with:
- Localhost
- Ngrok tunnels
- Custom domains
- Any cross-origin request

**Headers automatically set:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH`
- `Access-Control-Allow-Headers: *`

### Automatic Security Bypass

✅ **No authentication required** - Dashboard paths automatically bypass Spring Security:
- `{dashboard.path}/**` - All dashboard resources
- `/dashboard-action/**` - Dashboard API endpoints
- `/favicon.ico` - Favicon requests

### Access from Ngrok or Custom Domains

The dashboard works seamlessly with:
- **Ngrok**: `https://your-ngrok-url.ngrok-free.dev/fynxt-flow-dashboard`
- **Custom Domains**: `https://yourdomain.com/fynxt-flow-dashboard`
- **Localhost**: `http://localhost:8001/fynxt-flow-dashboard`

All assets (JS, CSS, images) are automatically served with proper CORS headers.

## Dashboard API

The dashboard uses the `/dashboard-action` endpoint for API calls:

- **Endpoint**: `/dashboard-action`
- **Methods**: GET, POST, PUT, DELETE
- **CORS**: Automatically configured
- **Security**: Automatically bypassed

This endpoint is only accessible from the dashboard server when running on a separate port.

## Architecture

### Same Port Deployment (Default)

```
┌─────────────────────────────────────┐
│  Main Application (Port 8001)       │
│                                     │
│  ├── Your APIs                      │
│  ├── Dashboard UI (/fynxt-flow-...) │
│  └── Dashboard API (/dashboard...)  │
└─────────────────────────────────────┘
```

**Benefits:**
- Single port to manage
- Same domain for all requests
- Easier deployment
- No CORS issues between dashboard and API

### Separate Port Deployment

```
┌─────────────────────────────────────┐
│  Main Application (Port 8001)       │
│  ├── Your APIs                      │
│  └── Dashboard API (/dashboard...)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Dashboard Server (Port 9000)       │
│  └── Dashboard UI (/fynxt-flow-...) │
└─────────────────────────────────────┘
```

**Benefits:**
- Isolation of dashboard from main application
- Can be deployed separately
- Useful for development/testing

## Troubleshooting

### Dashboard Not Accessible

1. **Check if enabled:**
   ```yaml
   fynxt:
     flow:
       dashboard:
         enabled: true  # Must be true
   ```

2. **Check logs** for dashboard startup message:
   ```
   Dashboard configured to serve from main application at path /fynxt-flow-dashboard
   ```

3. **Verify path** matches your configuration

### CORS Issues with Ngrok/Domains

The dashboard automatically configures CORS, but if you see CORS errors:

1. **Check logs** for CORS filter registration:
   ```
   DashboardCorsFilter registered with order -2147483648
   ```

2. **Verify Spring Security** is not blocking requests:
   ```
   Dashboard SecurityFilterChain created with @Order(1)
   ```

3. **Clear browser cache** - Cached CORS headers might cause issues

### Assets Not Loading (404/403)

1. **Check Content-Type** - Assets should have proper MIME types:
   - JS files: `text/javascript`
   - CSS files: `text/css`

2. **Verify CORS headers** in browser DevTools Network tab:
   - Should see `Access-Control-Allow-Origin: *`

3. **Check security configuration** - Dashboard paths should be ignored:
   ```
   WebSecurity configured to ignore dashboard paths: /fynxt-flow-dashboard/**
   ```

## Best Practices

1. **Same Port for Production**: Use default same-port configuration for simplicity
2. **Custom Path**: Use custom path if `/fynxt-flow-dashboard` conflicts with your routes
3. **Separate Port for Development**: Useful when you want to run dashboard independently
4. **Disable in Production**: If you don't need the dashboard, disable it:
   ```yaml
   fynxt:
     flow:
       dashboard:
         enabled: false
   ```

## Examples

### Basic Setup (Default)

```yaml
fynxt:
  flow:
    enabled: true
    dashboard:
      enabled: true  # Default
      # path: /fynxt-flow-dashboard  # Default
      # port: null  # Default - same port
```

Access: `http://localhost:8001/fynxt-flow-dashboard`

### Custom Path, Same Port

```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      path: /flows
      port: null
```

Access: `http://localhost:8001/flows`

### Separate Port

```yaml
fynxt:
  flow:
    dashboard:
      enabled: true
      path: /fynxt-flow-dashboard
      port: 9000
```

Access: `http://localhost:9000/fynxt-flow-dashboard`

### Disabled

```yaml
fynxt:
  flow:
    dashboard:
      enabled: false
```

Dashboard not available.

