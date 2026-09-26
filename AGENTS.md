# AGENTS.md

## Layout

- Vue 3.5 + Vite 8 + TS ~6.0 + Pinia + vue-router. pnpm only. Node `^22.18.0 || >=24.12.0`.
- `index.html` -> `src/main.ts` (installs Pinia + router) -> `src/App.vue`.
  Routes live in `src/router/index.ts` (`routes: []`, still empty); stores in `src/stores/`.
- `@/` -> `src/` is declared twice (`vite.config.ts` alias + `tsconfig.app.json` paths) — change both together.
- Single-tenant app with local persistence and no backend: don't add API clients or infra.
- This repo is spec-driven and follows the OpenSpec approach; the `/opsx-*` commands and
  `openspec/config.yaml` define the process. Don't hand-create files under `openspec/`.
- `README.md` is still the untouched create-vue template — not project docs.

## Commands

- `pnpm dev` / `pnpm preview` (5173 / 4173). There is no `test` or `typecheck` script: it's
  `pnpm test:unit` and `pnpm type-check`.
- `pnpm test:unit` is bare `vitest`, so it runs in watch mode. One-shot: `pnpm test:unit --run`.
  Single file: `pnpm test:unit --run src/__tests__/App.spec.ts`.
- `pnpm lint` runs oxlint `--fix` then eslint `--fix --cache` — it rewrites your files.
- `pnpm format` covers `src/` only (not `e2e/` or root config files).
- `pnpm test:e2e` needs `npx playwright install` once; it auto-starts the dev server.
  `--project=chromium` for a fast pass.
- No CI and no git hooks, so nothing runs automatically: before reporting done run
  `pnpm lint` -> `pnpm type-check` -> `pnpm test:unit --run`.
- Use `vue-tsc`, not `tsc` — `tsconfig.json` is a references-only stub with `files: []`.

## Lint & format

- Prettier + EditorConfig: no semicolons, single quotes, 100 cols, 2-space indent, LF.
- Two linters share one config: `eslint.config.ts` loads `.oxlintrc.json` through
  `eslint-plugin-oxlint`, so editing `.oxlintrc.json` changes both — don't duplicate rules.
- ESLint covers all `**/*.{vue,ts,mts,tsx}` including root config files, but the vitest
  plugin only applies under `src/**/__tests__/*` and the playwright plugin only under
  `e2e/**/*.{test,spec}.ts`.
- `.eslintcache` is gitignored; `eslint --cache` writes it.

## TypeScript

- `noUncheckedIndexedAccess: true` — indexing yields `T | undefined`. That's expected;
  don't reach for `!`.
- Unit tests must live in `src/**/__tests__/*.spec.ts`: `tsconfig.app.json` excludes that
  path and `tsconfig.vitest.json` includes only it, so tests elsewhere are neither
  type-checked nor covered by the vitest lint rules.
- `e2e/tsconfig.json` isn't in the root references, so `pnpm type-check` never covers
  `e2e/` — it is only linted.

## Conventions

Inferred from the three existing source files; correct me if any is wrong.

- `<script setup lang="ts">` only, Composition API.
- Setup-style Pinia stores: `src/stores/<name>.ts` exporting `use<Name>Store`.
- No `any`; use `@/` imports inside `src/`.
- Commit to `main` only when explicitly asked. No message convention.
