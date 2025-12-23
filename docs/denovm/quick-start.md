---
title: DenoVM Quick Start
description: Get started with DenoVM library quickly
---

# Quick Start

## Repository Configuration

The DenoVM library is published to Azure Artifacts. Configure your repository first.

### Maven

Add the repository to your `pom.xml`:

```xml
<repositories>
  <repository>
    <id>fynxt-libs</id>
    <name>Fynxt Libraries</name>
    <url>https://tech4jc.visualstudio.com/Nexxus/_packaging/fynxt-libs/maven/v1</url>
    <releases>
      <enabled>true</enabled>
    </releases>
    <snapshots>
      <enabled>true</enabled>
    </snapshots>
  </repository>
</repositories>
```

**Authentication:** You'll need to authenticate with Azure Artifacts. Create a Personal Access Token (PAT) with "Packaging (read)" permissions and configure it:

```xml
<servers>
  <server>
    <id>fynxt-libs</id>
    <username>YOUR_AZURE_DEVOPS_USERNAME</username>
    <password>YOUR_PERSONAL_ACCESS_TOKEN</password>
  </server>
</servers>
```

Or use Maven settings (`~/.m2/settings.xml`):

```xml
<settings>
  <servers>
    <server>
      <id>fynxt-libs</id>
      <username>YOUR_AZURE_DEVOPS_USERNAME</username>
      <password>YOUR_PERSONAL_ACCESS_TOKEN</password>
    </server>
  </servers>
</settings>
```

### Gradle

Add the repository to your `build.gradle` or `build.gradle.kts`:

**Kotlin DSL (`build.gradle.kts`):**
```kotlin
repositories {
    maven {
        name = "fynxt-libs"
        url = uri("https://tech4jc.visualstudio.com/Nexxus/_packaging/fynxt-libs/maven/v1")
        credentials {
            username = project.findProperty("azureDevopsUsername") as String? ?: ""
            password = project.findProperty("azureDevopsToken") as String? ?: ""
        }
    }
}
```

**Groovy DSL (`build.gradle`):**
```gradle
repositories {
    maven {
        name = "fynxt-libs"
        url = "https://tech4jc.visualstudio.com/Nexxus/_packaging/fynxt-libs/maven/v1"
        credentials {
            username = project.findProperty("azureDevopsUsername") ?: ""
            password = project.findProperty("azureDevopsToken") ?: ""
        }
    }
}
```

**Authentication:** Add credentials to `gradle.properties`:

```properties
azureDevopsUsername=YOUR_AZURE_DEVOPS_USERNAME
azureDevopsToken=YOUR_PERSONAL_ACCESS_TOKEN
```

## Add Dependency

> **Finding the Version:** Check available versions in the [Azure Artifacts feed](https://tech4jc.visualstudio.com/Nexxus/_artifacts/feed/fynxt-libs) or use the latest version from the repository.

### Maven

Add the dependency to your `pom.xml`:

```xml
<dependencies>
  <dependency>
    <groupId>com.fynxt</groupId>
    <artifactId>denovm</artifactId>
    <version>VERSION</version>
  </dependency>
</dependencies>
```

Replace `VERSION` with the actual version number (e.g., `1.0.0`, `1.2.3-SNAPSHOT`).

### Gradle

**Kotlin DSL (`build.gradle.kts`):**
```kotlin
dependencies {
    implementation("com.fynxt:denovm:VERSION")
}
```

**Groovy DSL (`build.gradle`):**
```gradle
dependencies {
    implementation("com.fynxt:denovm:VERSION")
}
```

Replace `VERSION` with the actual version number (e.g., `1.0.0`, `1.2.3-SNAPSHOT`).

## Enable & Configure

```yaml
deno.vm:
  enabled: true
  pool-enabled: true    # false for single-run mode
  pool-size: 2
  worker-concurrency: 4
  timeout-seconds: 30
```

## Use It

```java
@Autowired
private DenoVMService denoVMService;

    DenoVMRequest request = DenoVMRequest.builder()
    .id("script-001")
    .code("return { message: 'Hello from Deno!' };")
    .data(Map.of("userId", "123"))
        .build();
    
    DenoVMResult result = denoVMService.executeCode(request);
    
    if (result.isSuccess()) {
    System.out.println(result.getData());
    } else {
    System.err.println(result.getError());
}
```

