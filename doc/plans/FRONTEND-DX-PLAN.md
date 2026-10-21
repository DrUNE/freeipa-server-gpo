# Frontend developer experience improvement plan

**English** | [Русский](./FRONTEND-DX-PLAN.ru.md)

**Date:** 2026-10-18
**Scope:** `plugin/ui/grouppolicy/` (≈20 thousand lines of JS, 2.4 thousand lines of CSS), `frontend/`.
**Status:** stages 1-5 are done, stage 6 is partly done and continues in [COMPONENTS-PLAN.md](COMPONENTS-PLAN.md), stage 7 is decided as the strategy of [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (each stage starts with its status).
**Principle:** improve the tooling around the existing code without rewriting the editor. The decision to change the framework is made after stage 6, based on measurements.

## 1. Starting point (checked against the repository)

| Area | Fact |
|---|---|
| Modularity | All `js/**` files are AMD `define([...], function(__dep0){ var {x} = __dep0; ... return {x}; })`. There are no ESM sources; the wrappers are maintained by hand. |
| Language | ES2015+ inside AMD (`const`, `class`, arrow functions), mixed with `var` and the jQuery style in `chain.js`/`gpo.js`. |
| Linting, formatting, types | None. There is no root `package.json`. Python has `ruff` and `pylint`. |
| Tests | 40 files in `tests/ui/`: `node:test` and Playwright (`*.browser.test.js`). Without Chromium the browser tests are silently skipped. |
| CI and RPM build | `python-backend.yml` and the `.spec` run only pytest and Python coverage. `make test-ui` is never called. |
| Dev stand | `tools/ui-dev`: mock backend and `requirejs` without a build, refresh with F5. It does not cover `chain.js`/`gpo.js` (they depend on `freeipa/*`). |
| Sizes | Large files: `preferences-view-template.js` 2111, `script-template.js` 1449, `chain.js` 1193, `app.js` 876, `main.css` 2430. The rest of the code is split reasonably well. |
| RPC contract | `util/API.js` (437 lines) and `editor-dto.js` are kept in line with `gpo.py` by hand; there is no schema. |

Deployment constraint: the RPM is built in hasher without a network, and what is needed in the end is static files in `/usr/share/ipa/ui/js/plugins/chain`.

## 2. Stages

Estimates are for one developer, in working days.

### Stage 1. Hygiene (1-2 days) — done first

**Status: ✅ done.**

- A separate `frontend/` project with its own `package.json` and the commands `build`, `lint`, `format`, `typecheck`, `test`, `dev`. The `Makefile` stays a thin wrapper (`make ui-*`, `make test-ui*`).
- Linter and formatter: **ESLint flat config + Prettier** (the same set as in `freeipa-webui`: `eslint.config.mjs`, `prettier`, `vitest`, `knip`; shared rules make moving code easier). Biome stays as a fallback if speed becomes a problem. The first run was `--fix` only, without manual rewrites; the formatting went in a separate commit, listed in `.git-blame-ignore-revs`.
- `.vscode/extensions.json` and `settings.json`: the ESLint and Prettier extensions, format-on-save for `.js` in `frontend/` (`prettier.requireConfig`, so files outside `frontend/` are untouched).
- `.editorconfig` (4 spaces, LF, UTF-8; 2 spaces in JSON/YAML and the hand-formatted sheets; tabs in the Makefile) and the duplicate `img/arrow.svg` / `img/close.svg` are removed (the same files remain under `img/svg/`; the installer manifest follows).

**Done when:** `npm run lint` is clean on `frontend/` (reached: 0 errors).

### Stage 2. UI tests in CI (1-2 days)

**Status: ✅ done** (the job has not yet run on the Forgejo server).

- The `frontend` job in `python-backend.yml` runs in an ALT image and installs the prerequisites (`python3-module-admix`, `sdmx-*`, `admx-basealt`, `freeipa-server-common`, Chromium, a TTF font), then runs lint, `format:check`, typecheck, `build:check`, `npm test -- --coverage` and `scripts/assert-no-skips.mjs`.
- `assert-no-skips.mjs` makes a skipped test a failure: in CI a missing Chromium, `libadmix` or catalog is an error, not a skip.
- JS coverage comes from Vitest (V8) with a threshold at the current value (like `COVERAGE_THRESHOLD` for Python); track it, do not lower it.
- `frontend/tests/e2e` (the live FreeIPA) runs locally through `npm run test:ipa` and is not run in CI.

**Done when:** a PR that breaks a UI test turns red in CI.

### Stage 3. Types without changing the language (3-5 days)

**Status: ✅ done** (one criterion of "Done when" remains).

- `tsc --noEmit` (`allowJs`, `checkJs`, non-strict) checks all of `src/`; type stubs for `freeipa/*` and open types for the editor's dynamic members live in `frontend/types/`. New files get JSDoc annotations right away.
- Keep the RPC response types reusable in `freeipa-webui` where possible (`utils/datatypes/globalDataTypes.ts`), see [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md).
- **Done: the contract with the backend.** `tests/contracts/gpo_editor/*.json` hold a reference answer for every `gpo_editor_*` command (28; the two compatibility aliases `security_show`/`security_update` share the answers of `security_definitions_*`). A Python test fails when a new command has no reference answer. `tests/test_gpo_editor_contract.py` checks that the real commands answer with the same shape (the same keys and JSON types; `null` in the reference means any value); `tests/unit/gpo-editor-contract.test.js` checks the dev stand's mock server and that `util/API.js` hands the answer over intact. The first run found real drift in the mock server: `snapshot` had other keys, `preference_documents` answered under `preference_documents` instead of `documents`, `script_files` with `assets` instead of `scripts`, the script groups lacked `diagnostics` and `upload_limit_bytes`. The second batch found more: the preference create/update answered without the item detail (`fields`, `filters`, `filter_fields`...), delete without `deleted_identity`, the parent candidates lacked `parent_identity`, the policy lacked `representability`. The reference answers carry what the editor reads from the binding (labels, `editable`, `required` of the field descriptors), and the Python tests feed it to the fake workspace, so the envelope must pass it through intact. A rename on either side fails a test. The third batch (policy update, the script writes, security, advanced audit) found the same kind of drift: the security answers lacked `security_service_catalog` and `publication`, the audit update `publication`, the policy update the fields of the policy view.
- **Done: types of the answers.** `types/rpc.d.ts` is generated from the reference answers (`npm run types:rpc`, `scripts/generate-rpc-types.mjs`; a unit test fails when the file is out of date) and `util/API.js` declares them as the return types of its functions. This already showed two places that relied on fields the server does not send (`result.result` in the reconcile callback) or on an item that is null in the new-item form.

**Done when:** `npm run typecheck` runs in CI (reached); `util/` and `editor-dto.js` have no `any` (remaining: `editor-dto.ts` is strict but still has explicit `any` for the open values of the discriminated fields).

### Stage 4. ESM as the source of truth (4-6 days) — the main gain

**Status: ✅ done.**

Problem: the hand-written AMD wrappers block IDE navigation, automatic refactoring, tree-shaking and npm dependencies.

- Sources in `frontend/src/**` as ES modules (converted from the AMD files by a one-off codemod; the built bundle passes the existing tests unchanged).
- A Vite build into **one UMD bundle**, `plugin/ui/grouppolicy/js/app.js`: under FreeIPA's RequireJS it registers as an AMD module that depends on `freeipa/ipa` and `freeipa/rpc`. `chain.js` and `gpo.js` stay external AMD entries and take `translations` and `editorDialog` from the bundle.
- The build is committed: hasher has no network, so the built `js/` lives in git and **CI checks that `npm run build` does not change the tree** (`make ui-build-check`). The alternative (BuildRequires on node + a vendored `node_modules`) is heavier for ALT.
- Source maps are not enabled; if they are added they must not ship in the RPM.

**Done when:** the build is deterministic and all tests are green (reached).

### Stage 5. Dev loop (2-3 days)

**Status: ✅ done** (the pages `chain.js` and `gpo.js` are covered by unit tests with doubles, not rendered in the stand).

- A stand on **Vite** replaces the hand-written server: it serves `frontend/src` directly, `freeipa/*` resolve to ES shims, and `/ipa/session/json` is answered by the mock backend `dev/backend.mjs` (or the stand can be pointed at a live FreeIPA from the dev container). The page reloads on save.
- **Partly done:** `chain.js` and `gpo.js` are now covered by unit tests with doubles of `freeipa/*` (`tests/unit/helpers/load-plugin.js`; 22 tests: the actions and their RPC commands, registration, the menu, the status formatter, saving with rename). Mutations of the pages break them. Rendering the pages in the stand is a different task: it needs a reimplementation of FreeIPA's facet and widget framework (`IPA.facet`, search facets, tables, jQuery widgets), so it is not planned.
- **Done:** the `?scenario=normal|error|slow|empty` mode of the mock backend (a selector in the stand's top bar; `tests/unit/dev-backend.test.js`) for checking the error, loading and empty states.
- **Done:** HMR instead of a full reload: a change under `src/` re-imports `app.js` and restarts the editor in the same page (`dev/index.html`, `tests/integration/dev-stand-hmr.browser.test.js`); styles are applied without a restart. `init()` now returns `{ container, cleanup }`; `cleanup()` releases what the editor puts outside its container (the listeners of the divider on `document`, the current view); the stand calls it before a restart and `gpo.js` when the window closes (this also fixed a leak in production: each opening of the editor left two `document` listeners behind).

**Done when:** `make ui-dev` shows the editor without FreeIPA with the states `error`, `slow` and `empty`, saving a file updates the page without a reload, and `chain.js`/`gpo.js` have tests that need no FreeIPA.

### Stage 6. Code structure and styles (5-8 days, iteratively)

**Status (the first part is done).** Module-level functions that do not depend on closures were extracted: from `preferences-view-template.js` into `preference/view/{common,field-control,field-dependencies,field-tabs}.js` and from `script-template.js` into `script/helpers.js`. This was a mechanical move by AST without changing the logic; the tests (309 of 309 in the container) and the bundle confirm it. Sizes in this stage are given after Prettier formatting (long lines wrap, so files are longer than before formatting: now `preferences-view-template.js` 1501 lines and `script-template.js` 2113).
**Second part (done).** `script-template.js` is split into `script-template.js` (512 lines), `script/event-editor.js` (1197), `script/picker.js` (174) and `script/entry-form.js` (253): the pickers and the form are factories over a shared context. From `preferences-view-template.js` (now 1274 lines) the targeting modal moved to `preference/view/targeting-modal.js` and the form-state helpers to `preference/view/form-state.js`. CSS: design tokens are in `src/styles/tokens.css` (`--gpui-*`), `main.css` is split into 11 files by area (the order of rules is unchanged), the dead `scripts__modal*` rules are removed. Baseline screenshots of the preference form and targeting exist (`dialogs-visual.browser.test.js`).
**Third part (done).** `script/event-editor.js` is down to 802 lines (`script/assets-panel.js`, `script/entries-panel.js` are factories over the shared context). `preferences-view-template.js` is down to 349 lines: its mutable page state is now one `view` object, and `preference/view/{info-panel,items-table,form-lifecycle,page-actions,item-form}.js` take the info panel, the items table, closing with the discard question, the save/delete/reconcile actions and the item form. Each is a factory over the shared context.
**Fourth part (done).** Module-level code moved out without any context: `preference/targeting-operand-model.js` (field catalogs and validation; `targeting-operand-editor.js` 740 lines), `admx/policy-contents.js` (`admx-template.js` 368), `security/policy-draft.js` (`security-template.js` 619). In `preference/targeting-editor.js` the mutable state is one `ui` object and the condition tree is `preference/targeting-tree.js` (the editor is 674 lines). `script/event-editor.js` is down to 660 lines (`script/order-panel.js`, `script/asset-actions.js`).
**Fifth part (done).** `security-template.js` 399 lines (the controls moved to `security/controls.js`), `advanced-audit-template.js` 547 (`advanced-audit/presentation.js`), `script/event-editor.js` 536 (`script/event-loader.js`). TypeScript now covers `util/{editor-dto,collection-value,targeting-tree-draft,API}.ts`; `EditorError` became a class and the draft a class with typed nodes, operations and errors.
**Not split, deliberately:** `targeting-editor.js` (674) and the `render` of `targeting-operand-editor.js` (740): their functions call one another in cycles (`select` ↔ `renderFields` ↔ `capture` ↔ `renderTree`), so a split needs late-bound wrappers for every cross call and a test per seam, for a gain of a few dozen lines. `chain.js` (1194) is hand-written AMD over FreeIPA's framework.
**Remaining:** the large functions themselves — `renderPreferencesTemplate` (1364 lines, 74 shared variables; `openForm` 435 lines, `renderTable` 120), `renderScriptEventEditor` (1566 lines, 58 variables, state mostly in one `state` object; `renderAssets` 267, `openForm` 231, `renderEntries` 156, `openPicker` 155, `renderBody` 105) and `renderScriptsTemplate` (437). Splitting them needs a shared context (`ctx`) and separate modules by area (table, form, panel, discard dialog), which is refactoring, not a move.

- Split the largest files on the model of `security/` (model + dialog + view): `preferences-view-template.js`, `script-template.js`, `chain.js`. Criterion: a file over 600 lines needs a justification. Every step is accompanied by the existing tests.
- **After the large files are split:** evaluate JSX without React (the `h()` factory from `src/lib/dom.js` through `esbuild.jsxFactory` or `jsxImportSource`, with `JSX.IntrinsicElements`/`JSX.Element = HTMLElement` types). The gain is expected in markup-heavy files (dialogs, forms, tables), where nested `createElement({ attrs, children })` hides the DOM structure; in logic and models it is small. Start with a pilot on one component (`EditorStatus` or `Dialog`): set up the runtime and types, teach `scripts/read-amd.mjs` and `build-test-root.mjs` to run files through `esbuild.transform`, add a JSX parser to ESLint. Continue only if the component's diff became noticeably shorter and clearer; no mass auto-conversion, convert as files are edited. JSX adds no reactivity: updates stay imperative (see `createStore` below).
- CSS: move tokens (colors, spacing, radii, shadows) into custom properties; split `main.css` by component (`header`, `tree`, `dialogs`, `preferences`...). Include through `@import` at build time.
- Visual regressions: Playwright `toHaveScreenshot` for 6-8 key screens (tree, ADMX, preferences, scripts, security, targeting); capture the snapshots **before** stage 6.
- A shared reactivity primitive (a minimal `createStore`/signals) instead of the manual `renderRequestId`/`cleanup` flags in `app.js`, starting with one screen.

### Stage 7. Framework decision (1-2 days of evaluation + 5-10 days of pilot)

**Status: decided (2026-10-21).** The target is React + PatternFly in `freeipa-webui`, because the GPO pages have to live there anyway; the editor is first embedded as is and then replaced screen by screen, the first one being the pilot of [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (stage 4). The comparison below is kept for the record.

After stages 1-6 the editor is typed, built from ESM and covered by snapshots. Only now does it make sense to compare the options on one screen (the script list is the most isolated):

| Option | Size | When to choose |
|---|---|---|
| Stay on vanilla + `createStore` | 0 | if stages 1-6 removed the main pain points |
| Preact/Lit + htm, gradually | 2-3 months | declarative rendering is needed, but not the freeipa-webui stack |
| React + PatternFly (`WEBUI-MIGRATION.md`, block 8) | 3-5 months | a single UI with `freeipa-webui` is needed and this project has an owner. webui has no ordering UI and no merged plugin infrastructure: some components would have to be created |

Pilot criteria: line count against the vanilla version, build time, passing of the ported tests, keyboard accessibility. Code size should be measured, not assumed.

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
- **Regressions when splitting files** → snapshots and the existing 437 tests before refactoring starts.
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
5. A fully standalone variant: an image built from `.devcontainer/Containerfile` without the FreeIPA part, plus `chromium` and the Playwright browser; confirm that it reproduces the result of the dev container (309 tests, no skips).

**Done when:** the `frontend` job passes on a runner without internet access (check: run with the network disabled), `assert-no-skips.mjs` is green (437 tests, zero skips), and the job takes no longer than now.

## 5. Relation to the freeipa-webui migration

Stages 1-4 of this plan are a prerequisite of the block "Connecting the existing editor" in [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md): without a standalone ESM build the editor cannot be embedded into webui without AMD shims (+1 week).

## 6. Next steps

1. Run the `frontend` job on the Forgejo server and fix whatever the real runner shows (the open problem above describes its dependency on the network); the screenshot baselines may have to be taken there.
2. ~~Stage 3: shared golden JSON examples of RPC responses.~~ Done: the reference answers of every command and the generated types.
3. ~~Stage 5: shims for `chain.js` and `gpo.js`, scenario modes.~~ Done as unit tests with doubles and the `?scenario=` modes.
4. ~~Baseline Playwright snapshots before stage 6.~~ Done for the preference form and targeting; the other screens follow [COMPONENTS-PLAN.md](COMPONENTS-PLAN.md).
5. Stage 0 of [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (logic without DOM into `frontend/src/core/`, an ES module output) and steps 1-3 of [COMPONENTS-PLAN.md](COMPONENTS-PLAN.md).
