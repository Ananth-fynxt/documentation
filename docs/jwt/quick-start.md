---
title: JWT Quick Start
description: Get started with JWT library quickly
---

# Quick Start

## Repository Configuration

The JWT library is published to Azure Artifacts. Configure your repository first.

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
    <artifactId>jwt</artifactId>
    <version>VERSION</version>
  </dependency>
</dependencies>
```

Replace `VERSION` with the actual version number (e.g., `1.0.0`, `1.2.3-SNAPSHOT`).

### Gradle

**Kotlin DSL (`build.gradle.kts`):**
```kotlin
dependencies {
    implementation("com.fynxt:jwt:VERSION")
}
```

**Groovy DSL (`build.gradle`):**
```gradle
dependencies {
    implementation("com.fynxt:jwt:VERSION")
}
```

Replace `VERSION` with the actual version number (e.g., `1.0.0`, `1.2.3-SNAPSHOT`).

## Enable & Configure

```yaml
fynxt:
  jwt:
    enabled: true  # Defaults to true
    issuer: "my-app"
    audience: "my-api"
    signing-key-id: "keyid-abc123"
    refresh-signing-key-id: "refreshid-xyz789"
    access-token-expiration: "PT1H"  # 1 hour (ISO-8601 format)
    refresh-token-expiration: "P7D"  # 7 days (ISO-8601 format)
```

## Use It

The library auto-configures all components. Just inject the JWT executor:

```java
@Autowired
private JwtExecutor jwtExecutor;

// Generate token
JwtTokenRequest request = JwtTokenRequest.builder()
    .subject("user123")
    .claims(Map.of("role", "admin"))
    .build();

JwtTokenResponse response = jwtExecutor.generateToken(request);
String token = response.getToken();

// Validate token
JwtValidationRequest validationRequest = JwtValidationRequest.builder()
    .token(token)
    .build();

JwtValidationResponse validation = jwtExecutor.validateToken(validationRequest);
if (validation.isValid()) {
    String subject = validation.getSubject();
    Map<String, Object> claims = validation.getClaims();
}
```

