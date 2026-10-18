# Frontend developer experience improvement plan

**English** | [Русский](./FRONTEND-DX-PLAN.ru.md)

**Date:** 2026-10-18
**Scope:** `plugin/ui/grouppolicy/` (≈20 thousand lines of JS, 2.4 thousand lines of CSS), `frontend/`.
**Status:** stages 1-5 are done in full or in part, stage 6 is partly done, stage 7 has not started (each stage starts with its status). The stage text is kept as the plan; deviations from the plan are noted in the statuses.
**Principle:** improve the tooling around the existing code without rewriting the editor. The decision to change the framework is made after stage 6, based on measurements.

## 1. Starting point when the plan was written (checked against the repository)

| Area | Fact |
|---|---|
| Modularity | All `js/**` files are AMD `define([...], function(__dep0){ var {x} = __dep0; ... return {x}; })`. There are no ESM sources; the wrappers are maintained by hand. |
| Language | ES2015+ inside AMD (`const`, `class`, arrow functions), mixed with `var` and the jQuery style in `chain.js`/`gpo.js`. |
| Linting, formatting, types | None. There is no root `package.json`. Python has `ruff` and `pylint`. |
| Tests | 40 files in `tests/ui/`: `node:test` and Playwright (`*.browser.test.js`). Without Chromium the browser tests are silently skipped. |
| CI and RPM build | `python-backend.yml` and the `.spec` run only pytest and Python coverage. `make test-ui` is never called. |
| Dev stand | `tools/ui-dev`: mock backend and `requirejs` without a build, refresh with F5. It does not cover `chain.js`/`gpo.js` (they depend on `freeipa/*`). |
| Sizes | Large files: `preferences-view-template.js` 2111, `script-template.js` 1449, `chain.js` 1193, `app.js` 876, `main.css` 2430. The rest of the code is split reasonably well. |
| RPC contract | `util/API.js` (373 lines) and `editor-dto.js` are kept in line with `gpo.py` by hand; there is no schema. |

Deployment constraint: the RPM is built in hasher without a network, and what is needed in the end is static files in `/usr/share/ipa/ui/js/plugins/chain`.

## 2. Stages

Estimates are for one developer, in working days.

### Stage 1. Hygiene (1-2 days) — do first

**Status: ✅ done in a different form.** Instead of a root `package.json` there is a `frontend/` project with the commands `build`, `lint`, `format`, `typecheck`, `test`, `dev`; ESLint and Prettier are set up, `.vscode` is updated. Not done: `.editorconfig` and removing the duplicate SVG.

- Root `package.json`: `npm run lint | format | test | test:ui | dev`. The stand's dependencies (already moved to `frontend/package.json`) move into it (`npm ci` instead of `--prefix`). The `Makefile` stays a thin wrapper.
- Linter and formatter: **ESLint flat config + Prettier** (the same set as in `freeipa-webui`: `eslint.config.mjs`, `prettier`, `vitest`, `knip`; shared rules make moving code easier). Biome stays as a fallback if speed becomes a problem. Rules for AMD code: `no-undef`, `no-unused-vars`, `eqeqeq`. The first run is `--fix` only, without manual rewrites. Formatting goes in a separate commit, added to `.git-blame-ignore-revs`.
- `.vscode/extensions.json` and `settings.json`: the linter extension, format-on-save for JS/CSS.
- `.editorconfig`.
- Remove the duplicate `img/arrow.svg` ↔ `img/svg/arrow.svg` and `close.svg`, checking the references in CSS and `tests/test_editor_icon_assets.py`.

**Done when:** `npm run lint` is clean on all of `plugin/ui` and `frontend/tests`.

### Stage 2. UI tests in CI (1-2 days)

**Status: ✅ done in a different form.** The `frontend` job runs in an ALT image and installs packages and Chromium instead of `--with-deps`; instead of `REQUIRE_BROWSER`, skips are forbidden by `scripts/assert-no-skips.mjs`; instead of `c8` there is Vitest (v8) coverage with a threshold. The job has not yet been run on the Forgejo server.

- A `ui-tests` job in `python-backend.yml`: `npm ci`, `npx playwright install --with-deps chromium`, `npm run test:ui`.
- A `REQUIRE_BROWSER=1` variable: in CI a missing Chromium is an error, not a skip.
- `c8` for JS coverage and a threshold at the current value (like `COVERAGE_THRESHOLD` for Python); track it, do not lower it.
- `frontend/tests/e2e/freeipa-plugin-menu.live.test.js` runs locally through `npm run test:ipa` and is not run in CI.

**Done when:** a PR that breaks a UI test turns red in CI.

### Stage 3. Types without changing the language (3-5 days)

**Status: ✅ partly.** `tsc --noEmit` checks all of `src/` (`checkJs`, non-strict, types in `frontend/types/`). Not done: `types/rpc.d.ts` per `API.js` method and shared golden JSON files for pytest and the frontend.

- `// @ts-check` + `tsc --noEmit` (`allowJs`, `checkJs`, `noEmit`). Order: `util/` → `editor-dto.js` → `locales/` → components. New files get JSDoc annotations right away.
- Keep the RPC response types reusable in `freeipa-webui` where possible (`utils/datatypes/globalDataTypes.ts`), see [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md).
- Describe the RPC responses in `types/rpc.d.ts` (`@typedef`), one per `API.js` method.
- Fix the contract with the backend: golden JSON files (`gpo_editor_*` responses) read by both pytest (`tests/test_gpo_editor_backend.py`) and `node:test`. A format mismatch is caught in CI before a live server.

**Done when:** `npm run typecheck` runs in CI; `util/` and `editor-dto.js` have no `any`.

### Stage 4. ESM as the source of truth (4-6 days) — the main gain

**Status: ✅ done a different way.** The sources live in `frontend/src/` (not in `plugin/ui/grouppolicy/src/`); the build is Vite, one UMD bundle `js/app.js` instead of separate AMD modules; the codemod conversion was one-off; `make ui-build-check` verifies that the committed bundle is up to date. Source maps are not enabled.

Problem: the hand-written AMD wrappers block IDE navigation, automatic refactoring, tree-shaking and npm dependencies.

- Sources in `plugin/ui/grouppolicy/src/**` as ES modules.
- An esbuild or Rollup build (`format: 'amd'` / `iife`) into `plugin/ui/grouppolicy/js/`. `chain.js` and `gpo.js` stay external AMD entries and pull in the build through `require`.
- First an automatic conversion of the existing `define(...)` → `import/export` with a codemod (jscodeshift; the wrapper pattern is regular). Then a check: the built output passes all 40 tests without changes to the tests.
- Choice between "commit the build" and "build in the RPM": hasher has no network → **commit the built `js/` and check in CI that `npm run build` does not change the tree** (`git diff --exit-code`). The alternative (BuildRequires on node + a vendored `node_modules`) is heavier for ALT.
- Enable source maps; do not ship them in the RPM.

**Risk:** the remaining `require(['./js/app'])` in `gpo.js` and dynamic loads — check by hand. **Done when:** the build is deterministic, all tests are green, and an edit in `src/` shows up in devtools with the original names.

### Stage 5. Dev loop (2-3 days)

**Status: ✅ partly.** A stand on Vite with RPC proxied to the mock backend (the page reloads on save, no HMR). Not done: shims for `chain.js`/`gpo.js` and the `?scenario=…` modes.

- Replace `server.js` + `requirejs` with Vite (or esbuild `--serve`): ESM directly, HMR/live reload, a proxy of `/ipa/session/json` to the `backend.js` mock or to a live FreeIPA from the devcontainer (`IPA_URL`).
- Extend the `freeipa/*` shims (`menu`, `phases`, `reg`, `text`, `jquery`) so that `chain.js` and `gpo.js` work in the stand. This closes the weakest spot: today these pages are checked only on a live server.
- A `?scenario=error|slow|empty` mode in the mock backend to check error and loading states.

**Done when:** `npm run dev` shows the editor and the Chains/GPO pages without FreeIPA; saving a file updates the page without F5.

### Stage 6. Code structure and styles (5-8 days, iteratively)

**Status (the first part is done).** Module-level functions that do not depend on closures were extracted: from `preferences-view-template.js` (2108 → 1385 lines) into `preference/view/{common,field-control,field-dependencies,field-tabs}.js`, from `script-template.js` (1455 → 1411) into `script/helpers.js`. This is a mechanical move by AST without changing the logic; the tests (280 of 280 in the container) and the bundle confirm it.
**Remaining:** the large functions themselves — `renderPreferencesTemplate` (1222 lines, 74 shared variables, 39 nested functions; `openForm` 378 lines), `renderScriptEventEditor` (1002 lines, 58 variables, 30 nested functions, state mostly in one `state` object; `openForm` 148, `renderAssets` 145, `openPicker` 87) and `renderScriptsTemplate` (285). Splitting them needs a shared context (`ctx`) and separate modules by area (table, form, panel, discard dialog), which is refactoring, not a move.

- Split the largest files on the model of `security/` (model + dialog + view): `preferences-view-template.js`, `script-template.js`, `chain.js`. Criterion: a file over 600 lines needs a justification. Every step is accompanied by the existing tests.
- CSS: move tokens (colors, spacing, radii, shadows) into custom properties; split `main.css` by component (`header`, `tree`, `dialogs`, `preferences`...). Include through `@import` at build time.
- Visual regressions: Playwright `toHaveScreenshot` for 6-8 key screens (tree, ADMX, preferences, scripts, security, targeting); capture the snapshots **before** stage 6.
- A shared reactivity primitive (a minimal `createStore`/signals) instead of the manual `renderRequestId`/`cleanup` flags in `app.js`, starting with one screen.

### Stage 7. Framework decision (1-2 days of evaluation + 5-10 days of pilot)

**Status: not started.**

After stages 1-6 the editor is typed, built from ESM and covered by snapshots. Only now does it make sense to compare the options on one screen (the script list is the most isolated):

| Option | Size | When to choose |
|---|---|---|
| Stay on vanilla + `createStore` | 0 | if stages 1-6 removed the main pain points |
| Preact/Lit + htm, gradually | 2-3 months | declarative rendering is needed, but not the freeipa-webui stack |
| React + PatternFly (`WEBUI-MIGRATION.md`, block 8) | 3-5 months | a single UI with `freeipa-webui` is needed and this project has an owner. webui has no ordering UI and no merged plugin infrastructure: some components would have to be created |

Pilot criteria: line count against the vanilla version, build time, passing of the ported tests, keyboard accessibility. The claim "50-70% less code" should be measured, not accepted.

## 3. Total estimate and order

| Stage | Days | Depends on |
|---|---|---|
| 1. Hygiene | 1-2 | — |
| 2. UI tests in CI | 1-2 | 1 |
| 3. Types and contract | 3-5 | 1 |
| 4. ESM + build | 4-6 | 1, 2 |
| 5. Dev loop | 2-3 | 4 |
| 6. Structure and styles | 5-8 | 2, 4 |
| 7. Framework pilot | 6-12 | 1-6 |

Stages 1-5: **11-18 days**, 1-6: 16-26 days. Stages 1 and 2 are safe and pay off immediately; 3 can run in parallel with 4.

## 4. Risks

- **Build in the RPM.** No network in hasher → commit the result and check that it is up to date in CI (stage 4).
- **The built and source code diverge** in review → `git diff --exit-code` after the build.
- **Regressions when splitting files** → snapshots and the 40 existing tests before refactoring starts.
- **Formatting clutters the history** → a separate commit + `.git-blame-ignore-revs`.
- **Compatibility with the FreeIPA UI:** `chain.js`/`gpo.js` depend on the version of `freeipa/*`; the stand's shims must be checked against the real modules (the live menu test already exists).

### Open problem: a CI image that needs neither a Chromium install nor internet access

**State.** The `frontend` job (`.forgejo/workflows/python-backend.yml`) runs in the image `altlinux.space/actions/runner/containers:sisyphus`
and downloads everything it needs from the network on every run:

| What | From | Size |
|---|---|---|
| `python3-module-admix`, `sdmx-*`, `admx-basealt`, `freeipa-server-common`, `fonts-ttf-open-sans` | `apt-get` (Sisyphus) | tens of packages |
| `chromium` (needed for its system libraries) | `apt-get` | about 140 packages |
| the Playwright browser | the Playwright CDN (`playwright install chromium`) | about 120 MB |
| npm dependencies | `npm ci` (npm registry) | 174 packages in `package-lock.json` |

Cost: the job depends on three external sources being available, takes longer, and breaks when the network is unavailable or versions in Sisyphus change (the image does not work without `apt-get update`, and the versions of `admix` and `chromium` float). There is no network at all in hasher, so the same scheme does not fit the package build.

**Requirements for the solution:**
- the image already contains everything the tests need: Node (≥ 20), `python3-module-admix` 0.3.x, `sdmx-basealt`, `sdmx-schemas`, `admx-basealt`, FreeIPA's jQuery (`/usr/share/ipa/ui/js/libs/jquery.js`), Chromium together with a TTF font and the fontconfig rule that rejects Type 1 fonts;
- the job has no `apt-get` and no `playwright install`; `npm ci` works from a cache or from a committed/vendored set of dependencies;
- the Chromium version is pinned and matches the one the Playwright version from `package-lock.json` was released for, otherwise it breaks silently;
- the image is built and published reproducibly (from the repository, for example from `.devcontainer/Containerfile` or a separate `ci/Containerfile`) and updated deliberately, not on every run.

**What to investigate and choose:**
1. Is there a ready image in `altlinux.space/actions/runner/*` (or in `registry.altlinux.org`) with Node and Chromium; only `containers:sisyphus` was checked — it has no Chromium, and `apt` needs `apt-get update`.
2. How to attach Chromium without `playwright install`: the system `chromium` through `executablePath` / a `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`-like mechanism (there are 23 `chromium.launch` calls in the tests, so a shared wrapper is needed), or an image with a pre-downloaded `PLAYWRIGHT_BROWSERS_PATH`. It must be checked that Playwright works with the system ALT Chromium of the version in Sisyphus (currently 155 against Playwright's 156).
3. How to provide npm dependencies without a network: a cache in the image (`npm ci --offline`), `node_modules` in the image checked against `package-lock.json`, or an internal npm proxy.
4. Where to store and how to update the image (the Forgejo registry; a rebuild trigger on changes to `package-lock.json`, the `Containerfile` or the `admix` version in the spec).
5. A fully standalone variant: an image built from `.devcontainer/Containerfile` without the FreeIPA part, plus `chromium` and the Playwright browser; confirm that it reproduces the result of the dev container (280 tests, no skips).

**Done when:** the `frontend` job passes on a runner without internet access (check: run with the network disabled), `assert-no-skips.mjs` is green (280 tests, zero skips), and the job takes no longer than now.

## 5. Relation to the freeipa-webui migration

Stages 1-4 of this plan are a prerequisite of the block "Connecting the existing editor" in [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md): without a standalone ESM build the editor cannot be embedded into webui without AMD shims (+1 week).

## 6. First steps (stages 1-2 are done; items 2-3 remain)

1. Stages 1 and 2 in one PR: `package.json`, linter, a CI job.
2. Capture baseline Playwright snapshots and a JS coverage threshold.
3. A codemod prototype for stage 4 on `util/` and `components/header/`, checking that the tests pass without edits.
