# Proposal: GPO management in freeipa-webui

**English** | [Русский](./WEBUI-MIGRATION.ru.md)

**Status:** a proposal, not a description of the current system. The tooling it needs (the ESM sources, the tests in CI, the RPC
contract with generated types — stages 1-5 of [FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md)) is in place. The component work that
prepares the editor for the move is planned in [COMPONENTS-PLAN.md](COMPONENTS-PLAN.md).
Facts were checked against this repository and against `freeipa-webui` on 2026-10-21.

## 1. What exists now

| Layer | State |
|---|---|
| Server commands | `gpo_*`, `chain_*` (including `enable`/`disable`, `moveup_gpc`/`movedown_gpc`), `gpmaster_show`/`gpmaster_mod` (`add_chain`, `remove_chain`, `moveup_chain`, `movedown_chain`), 28 `gpo_editor_*` commands (plus two compatibility aliases) |
| Pages in the stock Web UI | `frontend/public/chain.js` (1194 lines) and `gpo.js` (394), FreeIPA jQuery facets; their actions are covered by unit tests with doubles of `freeipa/*` |
| GPUI editor | ES modules in `frontend/src/` (≈19.9 thousand lines without the locales, 4 modules in TypeScript), one UMD/AMD bundle `frontend/dist/js/app.js`, 22 preferences layouts, a targeting editor (≈3.1 thousand lines in 6 files, drag-and-drop with a keyboard alternative), EN/RU, 408 frontend tests in 49 files |
| Code without DOM | ≈5.3 thousand lines (≈27%): `core/{editor-dto,collection-value,targeting-tree-draft}.ts` and `util/API.ts`, the targeting operand model and presentations (`core/targeting/`), the security and audit models (`core/security/`, `core/advanced-audit/`), the dependency plan, the preferences layouts (`core/preference-layouts/`); the all-policies model (`core/all-policies/`), the icon catalog and the preference view helpers (`core/editor-icons.ts`, `core/preference-view-common.ts`) |
| Boundary with libadmix | Server side only. The browser sees the typed `gpo_editor_*` RPC and knows nothing about SYSVOL |
| RPC contract | `tests/contracts/gpo_editor/*.json`: a reference answer for every command, checked against the real commands (pytest) and against the dev stand and `API.ts` (vitest); `frontend/types/rpc.d.ts` is generated from them |
| Entry point of the editor | `init({ containerId, policyName })` returns `{ container, cleanup }`; `cleanup()` releases everything the editor put outside its container |
| Styles | Global sheets `frontend/src/styles/*.css` with `--gpui-*` tokens and CSS Modules; of 711 selectors only 25 are not scoped to the editor, mostly the drag-and-drop of `chain.js` and the `.modal-gpui` window of `gpo.js` |

Hierarchy: GPMaster → Chain (ordered) → GPO. On a conflict the policy with the higher priority wins (higher in the list; `moveup_gpc` and `moveup_chain` raise the priority).

## 2. Strategy: three layers

The editor is moved layer by layer, each in its own way:

| Layer | Size | At the move |
|---|---|---|
| RPC contract: reference answers, `rpc.d.ts`, `API.ts` | done | moves as is; in webui it becomes `rpcGpoEditor.ts` over the same types |
| Logic without DOM | ≈5.3 thousand lines | extracted into a framework-free TypeScript package (`gpui-core`) and used from React unchanged |
| Rendering (`ElementCreator`, `h()`) | ≈14 thousand lines | replaced by PatternFly screen by screen; until then the whole editor runs inside webui as an "island" |

A consequence for the work in this repository: put effort into component boundaries, `data-*`/ARIA hooks, extracting logic and
stories as behaviour specifications ([COMPONENTS-PLAN.md](COMPONENTS-PLAN.md)), not into the look of the vanilla rendering.

Coexistence with the current UI: a temporary dual UI, then replacement (recommended). An iframe proxy is not needed: webui is
served from `/ipa/modern-ui`, the same origin as `/ipa/ui`, so the editor bundle can be loaded directly with the same session.

## 3. Check against the freeipa-webui code

Checked against `../freeipa-webui` (branch `feature/contrib`, commit `b53ecb15`; `main` at `5dbf1030`).

**Confirmed:** React 18, PatternFly 6, Redux Toolkit/RTK Query, calls through `api.injectEndpoints` in `src/services/rpc*.ts`,
one folder per entity in `src/pages`, navigation in `navigation/NavRoutes.ts` and routes in `AppRoutes.tsx`, vitest tests
(41 files), Cypress with cucumber scenarios (65 features), the Vite base `/ipa/modern-ui`.

**Size benchmark.** The simplest entity, the HBAC service, takes: pages 987 lines (list, table, tabs, settings),
add and delete modals 495, `rpcHBACServices.ts` 177, a data hook 117, utilities 39, about 260 lines of Cypress
(features and steps) and edits to shared files (`rpc.ts`, `globalDataTypes.ts`, `utils.tsx`, `NavRoutes.ts`, `AppRoutes.tsx`).
That is ≈2 thousand lines per entity without nested relations. For host groups the Cypress tests alone take ≈1000 lines.

**What the webui code adds to the picture:**

| Finding | Consequence |
|---|---|
| webui has no ordering UI at all (a search for `moveup`, `reorder`, `draggable`, `onDrag` in `src` finds nothing) and no `@patternfly/react-drag-drop` | The order of chains in the GPMaster and of GPOs in a chain needs a new `OrderableList` component (up/down buttons, drag-and-drop with a keyboard alternative); the targeting editor needs the same |
| webui has no Storybook | The stories of this repository are the only component specification; bringing Storybook into webui is a natural first PR (see stage 4) |
| Translations: typed keys are generated from the server RPC `i18n_messages` (`npm run i18n:generate`) | The GPO strings are in `frontend/src/locales/{en,ru}.js`, not in server messages. It has to be decided where they live |
| Menu items depend on `ConfigurationSettings` | If the `freeipa-server-gpo` plugin is not installed, the "Group Policy" section must be hidden (detected by the available commands), otherwise the pages answer with an error |
| The plugin infrastructure exists only in the unmerged branch `basic-plugin-infrastructure` (one commit, one extension point `dashboardContent`, plugins are built together with the core) | It does not allow adding pages and menu items, so PRs to the webui core are needed. A separate plugin repository is not yet possible |
| `ARCHITECTURE_SUMMARY.md` in webui asks the server for "REST API endpoints" | That is wrong: the existing JSON-RPC commands are enough for the pages and the server side need not change. The line in webui should be corrected |
| Linter with `--max-warnings 820`, `knip` (unused exports), prettier, signed commits | Leave room for review iterations |

## 4. Stages and estimate

Working days, one developer. The estimate is calibrated on the benchmark above.

| # | Where | Stage | Days |
|---|---|---|---|
| 0 | here | ✅ Extract the logic without DOM into `frontend/src/core/` (TypeScript, strict, no imports from the rendering); a second build output: an ES module with `init` next to the UMD bundle | 4-6 |
| 1 | webui | ◐ RPC services `rpcGpo.ts`, `rpcChain.ts`, `rpcGpmaster.ts`, `rpcGpoEditor.ts` (types from `rpc.d.ts`); the section is shown only when the GPO commands are available; the translations decision | 4-5 |
| 2 | webui | Pages GPO, Chain, GPMaster: lists, tabs, add/rename/delete, two groups of a chain (typeahead), enable/disable, PDC Emulator, `OrderableList` | 15-20 |
| 3 | webui | The editor as an island: a `<GpuiEditor policyName />` component that imports the ES module, calls `init()` in `useEffect` and returns `cleanup`; `chain.js` and `gpo.js` are no longer needed there | 3-5 |
| | webui | Tests: vitest and Cypress for stages 1-3; reserve for review and linters (≈10%) | 10-14 |
| | | **Total for the MVP (stages 0-3)** | **36-50 (≈8-10 weeks)** |
| 4 | webui | Pilot: one screen rewritten in React + PatternFly, "Advanced Audit" (the most isolated: 547 lines and a ready model); Storybook in webui with the stories of the components it uses. Measure: code size, accessibility, time, ported tests; decide on stage 5 | 5-8 |
| 5 | webui | The remaining screens, from the least to the most connected: Scripts → Security → ADMX → preference item forms → tree and catalog → **targeting last** | 40-70 |
| 6 | both | Remove the vanilla editor, `chain.js`/`gpo.js` and the AMD test tree | 3-5 |

Assumptions:
- Stages 0-3 give a complete result on their own: webui with the full editor. Stages 4-6 are optional and can be spread over time.
- Stage 5 is cheaper than a rewrite from scratch (60-100 days estimated before) because the logic without DOM and the contract
  are reused, and the stories and integration tests describe the behaviour to keep; it is still the largest item.
- The webui Cypress tests run against a live FreeIPA, so the tests need a stand with the plugin installed (the dev container of
  this repository fits).

**Stage 0 status (done, with remarks).** `frontend/src/core/` exists (42 TypeScript files and `dto-types.d.ts`, ≈5.8 thousand lines, all checked by `tsc -p tsconfig.strict.json`): the pure modules were moved there, and the boundary is checked (ESLint `no-restricted-imports` for the `.js` files and `tests/unit/core-boundary.test.js` for all files: only `@gpui/core` and `@gpui/locales` imports, no browser globals). `npm run build:esm` builds the editor as an ES module (`dist-esm/gpui.js` with `gpui.css`, not committed; `freeipa/ipa` and `freeipa/rpc` stay bare imports for the host to map; `/img/...` in the styles is resolved by the host), checked by `tests/unit/esm-build.test.js`; `tests/integration/esm-island.browser.test.js` runs it as an island in a plain page (what a host has to provide: [WEBUI-ISLAND.md](WEBUI-ISLAND.md)). Types are real but not complete: about 22 spots keep `any` (the shapes of the operand forms' editing state, the targeting presentation tables, the typed-value payloads of security), each with a comment; the generated `rpc.d.ts` types the security and audit lists as `unknown[]`, so their row shapes are written by hand in `core/security/types.ts` and `core/advanced-audit/types.ts` and should move to the server contract. Also in `core`: the policy tree data (`tree/tree-data.ts`: nodes and lazy loaders built over an injected `api`, wired to the real one by `components/tree-view/tree-view-list-data.js`), the icon catalog (`editor-icons.ts`), the All Policies row model (`all-policies/model.ts`) and the preference view helpers (`preference-view-common.ts`). Not done: `util/API.ts` stays in `util/` as the transport (the host replaces it with `rpcGpoEditor.ts`).

**Stage 1 status (started, in `../freeipa-webui`, branch `feature/gpo-rpc`, not committed).** Written there: `src/services/gpoCommands.ts` (the request shapes of `gpo_*`, `chain_*` and `gpmaster_*` as pure functions, with the move-by-N-steps batches), the endpoints `rpcGpo.ts`, `rpcChain.ts`, `rpcGpmaster.ts` and `rpcGpoEditor.ts` (28 typed editor commands over a copy of the generated `rpc.d.ts`), the data types and normalisers (`gpoDataTypes.ts`, `gpoUtils.ts`: the server sends single values as one-item lists or scalars), and `useGpoPluginAvailable` (the section is shown only when `json_metadata` has `gpo_find`, `chain_find` and `gpmaster_show`), with 22 vitest tests of the request shapes and the normalisers. The files are listed in `knip.json` `ignore` until the pages of stage 2 use them (remove those lines then). Findings from reading the server code that the pages must respect: the order is `ipagpolink` / `ipagpochainlist` (first = highest priority) and can be moved only one step per call (so N steps are N commands in a batch) or replaced as a whole list in one call; `chain.active` is computed from the GPMaster list and is a one-item list; enabling an enabled chain is a validation error; `chain_mod` with a move option cannot carry other changes; a cleared group is `remove_usergroup` / `remove_computergroup`; `gpo_mod` renames with `rename` (the GUID stays, the key changes); `gpo_find` returns an empty list instead of an error when the schema is missing, while `chain_find` raises a database error. Not done in stage 1: the translations (decision 5 below is still open), hiding the menu entries (the hook exists, `NavRoutes.ts` is stage 2), the pages. In that repository 10 tests in `src/components/Form/` (IpaCertificates, IpaSshPublicKeys, IpaCertificateMappingData) already fail without these changes.

## 5. Decisions

1. **Embed the editor as is in the MVP.** It works, is covered by tests and is isolated by the RPC contract. Replace it screen by
   screen only after the pilot (stage 4) and its measurements. Measure the code size rather than assume a reduction.
2. **Targeting last.** Its functions call one another in cycles and its drag-and-drop is duplicated by a keyboard scenario that is
   easy to lose. Do not extract it into a library until there is a second consumer; `OrderableList` is the shared part.
3. **Do not touch the backend.** The needed RPC commands exist; the contract is pinned by the reference answers, and a new command
   without a reference answer fails a Python test.
4. **Where `gpui-core` lives** (to decide): in this repository, published as a package or copied into webui at build time, or moved
   into webui. Until webui consumes it, it stays here under `frontend/src/core/`.
5. **Translations (recommendation):** for the MVP keep the strings of the new pages in a local EN/RU dictionary inside webui; move
   them to the server `i18n_messages` as a separate step once the plugin registers messages. Confirm with a prototype.
6. **Hiding the section (recommendation):** the first PR to webui adds detection of the GPO commands and a menu item under that
   condition, so that the section does not appear on servers without the plugin.
7. **Working in two repositories** (`freeipa-server-gpo` and `freeipa-webui`) is unavoidable: the RPC version (`API_VERSION`) and
   the list of commands are coordinated at every release; the reference answers are the shared definition.

## 6. Risks

- The webui plugin infrastructure is not merged, so changes go through shared core files (`NavRoutes.ts`, `AppRoutes.tsx`, `rpc.ts`) and may conflict with other PRs.
- Duplicated UI for a transition period and diverging behaviour of the two interfaces.
- Bundle format: the bundle is UMD/AMD for FreeIPA's RequireJS; webui needs an ES module output (stage 0). The `freeipa/ipa` and
  `freeipa/rpc` dependencies have to be supplied by webui: a small adapter over its RPC client.
- Styles in both directions: the editor sheets are scoped (25 unscoped selectors, which belong to the pages that webui replaces),
  but the PatternFly base styles (fonts, `box-sizing`, form controls) also apply inside the editor. To be checked on the island in
  stage 3; the CSS Modules components are the least exposed.
- Rewriting screens freezes their development for the duration of each screen; doing it screen by screen keeps the freeze short.
- The CI of this repository has not yet run on the Forgejo server; the baseline screenshots may need to be taken again there.

## 7. Readiness criteria

MVP: CRUD for GPO, Chain and GPMaster; priorities; enable/disable of chains; the editor available from webui; vitest and Cypress tests for the new pages.
Production: unit-test coverage no lower than the agreed threshold, e2e for the key scenarios, an accessibility check.
Each replaced screen (stage 5): its stories pass with the same `play` tests as before, the contract tests pass, the screenshots are reviewed.

## 8. First steps

1. Fix the line about "REST API endpoints" in `ARCHITECTURE_SUMMARY.md` in `freeipa-webui`.
2. Stage 0 here: `frontend/src/core/` and the ES module output.
3. A prototype of stage 1-2 (the GPO page) and of the island (stage 3) in `freeipa-webui` on a real server from the dev container;
   use it to refine the remaining estimates.
4. In parallel, the component work of [COMPONENTS-PLAN.md](COMPONENTS-PLAN.md).

Links: [FreeIPA API](https://freeipa.readthedocs.io/), [PatternFly React](https://www.patternfly.org/components),
[RTK Query](https://redux-toolkit.js.org/rtk-query/).
