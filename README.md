# Fynxt Libraries Documentation

Documentation repository for Fynxt Libraries built with AsciiDoc and published to GitHub Pages.

## Quick Start

### Build Locally

```bash
./gradlew buildDocs
open build/docs/index.html
```

### View Documentation

- Main Index: `build/docs/index.html`
- DenoVM: `build/docs/denovm/index.html`
- Flow: `build/docs/flow/index.html`
- JWT: `build/docs/jwt/index.html`

## GitHub Pages

Documentation is automatically built and deployed on push to `main` branch.

**Setup:**
1. Go to Settings → Pages
2. Select "GitHub Actions" as source
3. Push to `main` branch

Documentation will be available at: `https://<username>.github.io/<repository-name>/`

## Structure

```
docs/
├── index.adoc          # Main index
├── denovm/             # DenoVM documentation
├── flow/               # Flow documentation
└── jwt/                # JWT documentation
```

## Requirements

- JDK 21
- Gradle 8.7+ (or use included wrapper)
