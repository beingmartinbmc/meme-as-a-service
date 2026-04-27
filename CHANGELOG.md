# Changelog

All notable changes to this project will be documented in this file. The
format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] – Unreleased

### Breaking changes

- **Node.js >= 18** is now required (was Node 16).
- Old API endpoint `POST /templates` for uploads is preserved as a redirect, but
  `POST /templates/upload` is now the canonical path.
- `addCustomTemplate(...)` from the library now invalidates the in-process
  template cache; consumers no longer need to restart between uploads.

### Added

- **WebP / JPEG / AVIF output** in addition to PNG, via the new
  `format` and `quality` options (CLI: `--format`, `--quality`; API: `?format=`).
- **OpenAPI 3 spec** at `/openapi.json` and Swagger UI at `/docs`.
- **ZIP batch output**: `POST /meme/batch` with `outputFormat: "zip"`
  returns a streamed `application/zip` archive of all rendered memes.
- **Helmet, CORS, compression, morgan logging, rate limiting, payload limits,
  graceful shutdown** for the REST API.
- **Zod** validation on every API endpoint with structured 400 responses.
- **Custom templates** are now actually usable at runtime (built-in +
  custom templates are merged via a new template registry).
- **Multi-language / emoji support** in meme text — `sanitizeText` now only
  strips control characters, no longer Unicode.
- **Better text rendering**: bold weight, paint-order stroke, expanded font
  stack (Impact → Anton → Oswald → Helvetica fallback) for nicer output on
  Linux/CI where Impact isn't installed.
- **Multi-line text wrapping** is now used in the SVG overlay.
- **Dockerfile** with multi-stage build, libvips, healthcheck, dumb-init.
- **GitHub Actions**: CI matrix (Node 18/20/22), Docker build, npm publish on
  `v*` tags with provenance.
- **Dependabot** weekly npm + monthly GitHub Actions updates.
- **ESLint + Prettier + EditorConfig + .nvmrc** configuration.
- **`@types/supertest`** + supertest-based API tests.

### Changed

- CLI `--version` now reads from `package.json` (was hardcoded `1.0.0`).
- `MemeGenerator.getAvailableTemplates()` now returns built-ins + custom
  templates instead of a hardcoded list.
- Multer uploads now go to the OS temp dir with a 10 MB limit and a
  MIME-type filter; uploaded files are always cleaned up, even on error.
- API server now binds to `0.0.0.0` by default (configurable via `HOST`).

### Fixed

- `Math.random().substr(...)` → cryptographically random filename suffixes.
- `fontFamily` and `quality` options are now actually honored.
- Removed the dead `program.command('<template>')` quick-meme command.
- Custom templates added via CLI/API can now be generated immediately.

### Removed

- Roadmap "ZIP output not yet implemented" – it is now implemented.

## [1.0.6] – 2024

- Polished README with badges & features section.

## Earlier

See git history for versions before 1.0.6.
