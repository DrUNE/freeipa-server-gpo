# Frontend: architecture, current workflow, plans

**English** | [Русский](./README.ru.md)

Summary as of 2026-10-21. Details and estimates are in the plans:
[FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md) (developer experience improvements),
[WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (GPO management in `freeipa-webui`) and
[COMPONENTS-PLAN.md](COMPONENTS-PLAN.md) (components and Storybook); what a host provides for the editor island: [WEBUI-ISLAND.md](WEBUI-ISLAND.md).
Server side: [../ARCHITECTURE.md](../ARCHITECTURE.md) ([Russian](../ARCHITECTURE.ru.md)).
What changed in the `dev-setup` branch and how to work now: [../DEV-SETUP.md](../DEV-SETUP.md).

## 1. Frontend architecture

The `frontend/dist/` directory (the committed build of `frontend/`) is installed into `/usr/share/ipa/ui/js/plugins/chain` and has two layers.

| Layer | Files | Technology |
|---|---|---|
| Pages in the FreeIPA Web UI | `frontend/public/chain.js` (1194 lines), `gpo.js` (394) | AMD, jQuery facets `IPA.facet`, `reg`, `phases`; depend on `freeipa/*` modules; actions covered by unit tests with doubles |
| GPUI editor | sources in `frontend/src/` (≈19.9 thousand lines without the locales), built into `js/app.js`; styles `frontend/src/styles/` and CSS Modules, built into `js/app.css` | ES modules (4 in TypeScript), one UMD/AMD bundle (Vite), `h()` from `src/lib/dom.js` for new components and the older `ElementCreator`, EN/RU locales |

The editor is opened from `gpo.js` in a modal window and is split into header, tree-view, workspace, footer and templates:
ADMX, Preferences (22 layouts, targeting editor), Scripts, Security, Advanced Audit, All Policies.
It talks to the server only through the typed JSON-RPC `gpo_editor_*` calls in `util/API.ts` (28 commands);
`libadmix` runs on the server, and SYSVOL paths are never passed to the browser.

**Conclusions:**
- The large templates are split into modules by area (`preference/view/*`, `script/*`, `security/*`, `admx/*`, `advanced-audit/*`);
  the editor state of the big screens is one object (`view`, `ui`). Still above 600 lines: `targeting-operand-editor.js` 740 and
  `targeting-editor.js` 674 (cycles between their functions, see the DX plan) and `chain.js` 1194.
- The boundary with the backend is pinned: a reference answer for every command (`tests/contracts/gpo_editor/`), checked on both
  sides, and the types `frontend/types/rpc.d.ts` generated from them.
- ≈5.3 thousand lines (≈27%) do not touch the DOM; they are the part that moves to `freeipa-webui` unchanged.
- Two components are in the target format (`Dialog`, `EditorStatus`); `ElementCreator` is used in 49 files.

## 2. How development works now

| What | How |
|---|---|
| Running the editor without FreeIPA | `make ui-dev-install`, then `make ui-dev`: Vite stand (`frontend/dev`: mock backend with the `?scenario=error\|slow\|empty` modes, ES shims for `freeipa/*`), hot update without reloading the page |
| Components in isolation | `make ui-storybook` (Storybook 10, every story is a test) |
| Checking on a live FreeIPA | `.devcontainer/` (podman), plugin reload with `ipa-dev-reload`, e2e tests in `frontend/tests/e2e/`, `npm run watch` for a development build with source maps |
| UI tests | `make test-ui` (unit, integration, stories, mocks) and `make test-ui-ipa` (also e2e and everything without skips, in the container) |
| Backend tests | `make test-python`, `make test-coverage` (threshold 93.90%), `make test-integration` |
| Linter, formatter, types for JS | ESLint (`make ui-lint`), Prettier (`make ui-format-check`), `npm run typecheck` (JSDoc check of the JS and strict check of the TypeScript), unit-test coverage with a threshold |
| CI | `python-backend.yml`: RPM build, pytest, integration into FreeIPA, publication. `frontend` job: lint, formatting, types, bundle check, tests with coverage, no skipped tests (not yet run on the Forgejo server) |

Stand details: [../../frontend/dev/README.md](../../frontend/dev/README.md), CI: [../CI.md](../CI.md).

## 3. Plans

**Developer experience improvements** ([FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md)); status:
1. ✅ hygiene: the `frontend/` project, ESLint, Prettier, `.editorconfig`;
2. ✅ UI tests in CI (the `frontend` job; not yet run on the Forgejo server);
3. ✅ types and the contract: reference answers of every command, generated RPC types, TypeScript for `util/`;
4. ✅ ESM sources, Vite build (committed), `make ui-build-check`;
5. ✅ the dev loop: stand with scenarios, hot update, tests for `chain.js`/`gpo.js`;
6. ✅ partly: large files split, CSS tokens and per-area sheets, two components, screenshots of the preference form and targeting;
   continued in [COMPONENTS-PLAN.md](COMPONENTS-PLAN.md);
7. the framework decision — taken as the strategy of [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md): React + PatternFly in `freeipa-webui`,
   the editor first embedded as is, then replaced screen by screen after a pilot.

**UI migration to freeipa-webui** ([WEBUI-MIGRATION.md](WEBUI-MIGRATION.md)): stage 0 here (logic without DOM into
`frontend/src/core/`, an ES module output), then three pages (GPO, Chain, GPMaster) and the editor as an island in webui.
36-50 days for the MVP; replacing the editor screens is optional, 40-70 days more, decided after a pilot screen.

**Components and Storybook** ([COMPONENTS-PLAN.md](COMPONENTS-PLAN.md)): nine components that mirror PatternFly, stories with
data from the reference answers and `play` tests by roles that move to React unchanged. 22-29 days.

## 4. Order and dependencies

1. Stages 1-5 of the DX plan are done; stage 6 continues as the components plan.
2. Migration stage 0 and steps 1-3 of the components plan can go in parallel and do not need webui.
3. A prototype of the GPO page and of the editor island in `freeipa-webui` will refine the migration estimates.
4. The decision to replace editor screens is taken after the pilot screen (Advanced Audit), migration stage 4.
