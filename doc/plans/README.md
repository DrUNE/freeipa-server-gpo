# Frontend: architecture, current workflow, plans

**English** | [Русский](./README.ru.md)

Summary as of 2026-10-18. Details and estimates are in the plans:
[FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md) (developer experience improvements) and
[WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (GPO management in `freeipa-webui`).
Server side: [../ARCHITECTURE.md](../ARCHITECTURE.md) ([Russian](../ARCHITECTURE.ru.md)).
What changed in the `dev-setup` branch and how to work now: [../DEV-SETUP.md](../DEV-SETUP.md).

## 1. Frontend architecture

The `plugin/ui/grouppolicy/` directory is installed into `/usr/share/ipa/ui/js/plugins/chain` and has two layers.

| Layer | Files | Technology |
|---|---|---|
| Pages in the FreeIPA Web UI | `chain.js` (1194 lines), `gpo.js` (396) | AMD, jQuery facets `IPA.facet`, `reg`, `phases`; depend on `freeipa/*` modules |
| GPUI editor | sources in `frontend/src/` (about 20 thousand lines), built into `js/app.js`, `css/` (about 2.4 thousand lines) | Vanilla JS, ES modules, one UMD/AMD bundle (Vite), a home-grown `ElementCreator`, EN/RU locales |

The editor is opened from `gpo.js` in a modal window and is split into header, tree-view, workspace, footer and templates:
ADMX, Preferences (22 layouts, targeting editor), Scripts, Security, Advanced Audit, All Policies.
It talks to the server only through the typed JSON-RPC `gpo_editor_*` calls in `util/API.js` (~28 methods);
`libadmix` runs on the server, and SYSVOL paths are never passed to the browser.

**Conclusions:**
- The structure is acceptable: components are spread over files, and some templates (`security/`, `all-policies/`) are already split into model, dialog and view.
- Weak spots: large files (`preferences-view-template.js` 1501 lines, `script-template.js` 2113, `chain.js` 1194, `main.css` 2430; Prettier made lines wrap, which is why the sizes differ from the pre-formatting ones);
  imperative rendering with manual race protection (`renderRequestId`, `currentViewCleanup`); state kept in closures.
- The boundary with the backend is clean, but the response format is not described by any schema: it was inferred by hand (`editor-dto.js`).
- The editor sources are now ES modules in `frontend/src/`; `plugin/ui/grouppolicy/js/` holds one built bundle, `app.js` (committed).

## 2. How development works now

| What | How |
|---|---|
| Running the editor without FreeIPA | `make ui-dev-install`, then `make ui-dev`: Vite stand (`frontend/dev`: mock backend, ES shims for `freeipa/*`), reload on save |
| Checking on a live FreeIPA | `.devcontainer/` (podman), plugin reload with `ipa-dev-reload`, e2e tests in `frontend/tests/e2e/` |
| UI tests | `make test-ui` (`frontend/tests/unit` and `integration`, mocks) and `make test-ui-ipa` (`frontend/tests/e2e`, live FreeIPA in the container); without Chromium the browser tests are skipped |
| Backend tests | `make test-python`, `make test-coverage` (threshold 93.90%), `make test-integration` |
| Linter, formatter, types for JS | ESLint (`make ui-lint`), Prettier (`make ui-format-check`), `tsc --noEmit` over JSDoc (`npm run typecheck`), unit-test coverage with a threshold (`npm test -- --coverage`) |
| CI | `python-backend.yml`: RPM build, pytest, integration into FreeIPA, publication. `frontend` job: lint, formatting, types, bundle check, tests with coverage, no skipped tests |
| Stand limitation | `chain.js` and `gpo.js` do not work in `frontend/dev` (they need FreeIPA modules) and are checked only on a live server |

Stand details: [../../frontend/dev/README.md](../../frontend/dev/README.md), CI: [../CI.md](../CI.md).

## 3. Plans

**Developer experience improvements** ([FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md)), 16-26 working days for stages 1-6; status:
1. ✅ hygiene: the `frontend/` project with `package.json`, ESLint, Prettier (`.editorconfig` not added);
2. ✅ UI tests in CI (the `frontend` job; not yet run on the Forgejo server);
3. ✅ partly: types via JSDoc and `tsc --noEmit`; shared JSON examples of RPC responses for pytest and JS are not done;
4. ✅ ESM sources, Vite build into one bundle (committed), `make ui-build-check` check;
5. ✅ partly: Vite stand; shims for `chain.js` and `gpo.js` are not done;
6. ✅ partly: module-level functions were extracted from the two largest files; the giant functions themselves, CSS variables and screenshot tests are not done;
7. pilot to choose a framework based on measurements — not started.

**UI migration to freeipa-webui** ([WEBUI-MIGRATION.md](WEBUI-MIGRATION.md)): three pages (GPO, Chain, GPMaster) on React + PatternFly,
the GPUI editor is embedded as is. Estimate: 36-50 days for the MVP; rewriting the editor itself in React takes another 3-5 months and
is decided only after a pilot.

## 4. Order and dependencies

1. Stages 1-2 of the DX plan are done; the remaining stages can be done independently.
2. Stage 4 (the ESM build, done) is needed both for development and for embedding the editor into webui.
3. A prototype of the GPO page in `freeipa-webui` will refine the remaining migration estimates.
4. The decision to rewrite the editor is postponed until stage 7 of the DX plan.
