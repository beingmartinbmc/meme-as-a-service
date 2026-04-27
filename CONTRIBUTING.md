# Contributing

Thanks for taking the time to contribute!

## Quickstart

```bash
nvm use            # picks up .nvmrc (Node 20)
npm ci
npm run setup-real # downloads template images into ./templates
npm test
```

## Scripts

| Script              | Purpose                                |
| ------------------- | -------------------------------------- |
| `npm run build`     | Compile TypeScript → `dist/`           |
| `npm run dev`       | TypeScript watch mode                  |
| `npm run typecheck` | Run `tsc --noEmit`                     |
| `npm run lint`      | ESLint over `src/**/*.ts`              |
| `npm run lint:fix`  | ESLint with `--fix`                    |
| `npm run format`    | Prettier write                         |
| `npm test`          | Jest                                   |
| `npm run api`       | Boot the REST API from compiled output |

## Pull request checklist

1. `npm run lint && npm run typecheck && npm test` are all green.
2. New behavior is covered by a test.
3. User-facing changes are noted in `CHANGELOG.md` under `Unreleased`.
4. Public API additions update the OpenAPI spec in `src/api/openapi.ts`.

## Releasing (maintainers)

1. Bump the version in `package.json` and update `CHANGELOG.md`.
2. Commit and tag: `git tag vX.Y.Z && git push --tags`.
3. The `Release` workflow publishes to npm with provenance and creates a
   GitHub release.
