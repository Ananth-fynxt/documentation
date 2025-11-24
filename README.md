# Fynxt Libraries Documentation

[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://github.com/yourusername/documentation)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/documentation/pages.yml)](https://github.com/yourusername/documentation/actions)

This repository contains comprehensive documentation for Fynxt Libraries - a collection of Spring Boot auto-configurable libraries. The documentation is built from AsciiDoc source files and automatically published to GitHub Pages.

## 📚 Documentation Overview

This repository provides documentation for three main libraries:

- **DenoVM** - Execute JavaScript code in a secure Deno runtime from your Spring Boot application
- **Flow** - Spring Boot starter for Fynxt Lowcode Flow management with auto-configuration
- **JWT** - JWT token generation and validation library for Java/Spring with configurable signing keys

## 📁 Repository Structure

```
documentation/
├── docs/                      # AsciiDoc source files
│   ├── index.adoc            # Main documentation index
│   ├── denovm/                # DenoVM library documentation
│   │   ├── index.adoc
│   │   ├── architecture.adoc
│   │   └── images/            # Documentation images
│   ├── flow/                  # Flow library documentation
│   │   ├── index.adoc
│   │   ├── architecture.adoc
│   │   └── images/
│   └── jwt/                   # JWT library documentation
│       ├── index.adoc
│       ├── architecture.adoc
│       └── images/
├── build.gradle.kts           # Gradle build configuration
├── settings.gradle.kts        # Gradle settings
├── .github/
│   └── workflows/
│       └── pages.yml          # GitHub Actions workflow for GitHub Pages
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **JDK 21** or higher
- **Gradle 8.7+** (or use the included Gradle Wrapper)

### Building Documentation Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/documentation.git
   cd documentation
   ```

2. **Build all documentation:**
   ```bash
   ./gradlew buildDocs
   ```

3. **View the documentation:**
   ```bash
   # macOS
   open build/docs/index.html
   
   # Linux
   xdg-open build/docs/index.html
   
   # Windows
   start build/docs/index.html
   ```

### Building Specific Modules

You can build individual documentation modules:

```bash
# Build DenoVM documentation only
./gradlew asciidoctorDenovm

# Build Flow documentation only
./gradlew asciidoctorFlow

# Build JWT documentation only
./gradlew asciidoctorJwt

# Build main index page only
./gradlew asciidoctorIndex
```

## 📖 Viewing Generated Documentation

After building, the generated HTML documentation is available at:

- **Main Index:** `build/docs/index.html`
- **DenoVM Docs:** `build/docs/denovm/index.html`
- **Flow Docs:** `build/docs/flow/index.html`
- **JWT Docs:** `build/docs/jwt/index.html`

## 🌐 GitHub Pages

The documentation is automatically built and deployed to GitHub Pages on every push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the changes

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Update documentation"
   git push origin main
   ```

3. **Access your documentation:**
   - The documentation will be available at:
     `https://<username>.github.io/<repository-name>/`
   - The first deployment may take a few minutes

### Manual Deployment

You can also trigger the workflow manually:
- Go to **Actions** tab in your repository
- Select **Build and Deploy Documentation** workflow
- Click **Run workflow**

## ✏️ Editing Documentation

### Adding New Content

1. **Edit AsciiDoc files** in the `docs/` directory
2. **Test locally:**
   ```bash
   ./gradlew buildDocs && open build/docs/index.html
   ```
3. **Commit and push:**
   ```bash
   git add docs/
   git commit -m "Update documentation"
   git push origin main
   ```

### Adding Images

1. Place images in the appropriate `docs/<module>/images/` directory
2. Reference them in your AsciiDoc files:
   ```asciidoc
   image::image-name.png[Alt Text, 800, align="center"]
   ```

### AsciiDoc Syntax

This project uses AsciiDoc with the following features:
- **Syntax highlighting:** CodeRay
- **Table of Contents:** Left sidebar with 3 levels
- **Section anchors:** Enabled for deep linking
- **Icons:** Font-based icons

## 🛠️ Development

### Gradle Tasks

| Task | Description |
|------|-------------|
| `buildDocs` | Build all documentation modules |
| `asciidoctorIndex` | Build main index page |
| `asciidoctorDenovm` | Build DenoVM documentation |
| `asciidoctorFlow` | Build Flow documentation |
| `asciidoctorJwt` | Build JWT documentation |
| `clean` | Clean build directory |
| `build` | Build all documentation (same as `buildDocs`) |

### Build Configuration

The build is configured in `build.gradle.kts`:
- Uses Asciidoctor Gradle Plugin 4.0.2
- Supports diagram generation (PlantUML, etc.)
- Configures source highlighting, TOC, and styling

## 📋 Documentation Modules

### DenoVM Library

Execute JavaScript code in a secure Deno runtime from your Spring Boot application.

**Key Features:**
- Single-run and worker pool execution modes
- Configurable timeouts and resource limits
- Automatic temp file cleanup
- SDK with HTTP client, logger, and encoding utilities

**Documentation:** `docs/denovm/index.html`

### Flow Library

Spring Boot starter for Fynxt Lowcode Flow management.

**Key Features:**
- Auto-configuration of all Flow components
- JPA integration with Spring Data
- JSON schema validation
- Type-safe entities and DTOs

**Documentation:** `docs/flow/index.html`

### JWT Library

JWT token generation and validation library for Java/Spring.

**Key Features:**
- Access and refresh token support
- HMAC-SHA256 signing
- Configurable expiration times
- Per-request configuration overrides

**Documentation:** `docs/jwt/index.html`

## 🔧 Troubleshooting

### Build Issues

**Problem:** Build fails with "Unresolved reference" errors
- **Solution:** Ensure you're using JDK 21 and Gradle 8.7+

**Problem:** FilenoUtil warnings during build
- **Solution:** These are harmless warnings and don't affect the build output

**Problem:** Images not displaying
- **Solution:** Ensure images are in the correct `images/` directory and referenced correctly in AsciiDoc

### GitHub Pages Issues

**Problem:** Documentation not updating on GitHub Pages
- **Solution:** 
  1. Check the Actions tab for workflow failures
  2. Verify GitHub Pages is enabled and set to "GitHub Actions"
  3. Ensure the workflow file is in `.github/workflows/`

**Problem:** 404 errors on GitHub Pages
- **Solution:** 
  1. Verify the build output is in `build/docs/`
  2. Check that `index.html` exists in the root of the output
  3. Wait a few minutes for GitHub Pages to update

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-docs`)
3. Make your changes to AsciiDoc files
4. Test locally with `./gradlew buildDocs`
5. Commit your changes (`git commit -m 'Add amazing documentation'`)
6. Push to the branch (`git push origin feature/amazing-docs`)
7. Open a Pull Request

## 📝 License

This documentation is part of the Fynxt Libraries project.

## 🔗 Links

- [AsciiDoc Syntax Guide](https://asciidoctor.org/docs/asciidoc-syntax-quick-reference/)
- [Asciidoctor Gradle Plugin](https://asciidoctor.org/docs/asciidoctor-gradle-plugin/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Note:** Replace `yourusername` and `documentation` in URLs with your actual GitHub username and repository name.
