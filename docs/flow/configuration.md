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
```

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

