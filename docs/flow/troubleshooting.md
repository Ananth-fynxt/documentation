---
title: Flow Troubleshooting
description: Common issues and solutions for Flow library
---

# Troubleshooting

## Entity Not Managed Error

If you see "Not a managed type" errors, ensure Flow entity packages are included in your EntityManagerFactory's `setPackagesToScan()`.

## Auto-Configuration Not Working

* Check that `fynxt.flow.enabled` is not set to `false`
* Verify the library is on the classpath
* Check Spring Boot auto-configuration logs

## Dashboard Issues

### Dashboard Not Accessible

1. **Check configuration:**
   ```yaml
   fynxt:
     flow:
       dashboard:
         enabled: true  # Must be enabled
   ```

2. **Check logs** for dashboard startup message:
   ```
   Dashboard configured to serve from main application at path /fynxt-flow-dashboard
   ```

3. **Verify path** matches your configuration

### CORS Errors with Ngrok/Custom Domains

Dashboard automatically configures CORS. If you see CORS errors:

1. Check logs for CORS filter: `DashboardCorsFilter registered`
2. Verify Spring Security configuration: `Dashboard SecurityFilterChain created`
3. Clear browser cache
4. Check Network tab in browser DevTools for CORS headers

### Assets Not Loading (403/404)

1. Verify dashboard is enabled
2. Check security logs - dashboard paths should be ignored
3. Verify CORS headers in browser DevTools
4. Check Content-Type headers (should be `text/javascript` for JS)

See [Dashboard Guide](./dashboard.md) for detailed troubleshooting.

