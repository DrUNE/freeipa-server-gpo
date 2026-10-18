# Proposal: GPO management in freeipa-webui

**English** | [Русский](./WEBUI-MIGRATION.ru.md)

**Status:** a proposal, not a description of the current system. Replaces `INTEGRATION-PLAN.md` and `GPO-EDITOR-ANALYSIS.md`
(they remain in git history). The tooling this needs (stages 1-4 of [FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md)) is already in place.
Facts were checked against this repository and against `freeipa-webui` on 2026-10-18.

## 1. What exists now

| Layer | State |
|---|---|
| Server commands | `gpo_*`, `chain_*` (including `enable`/`disable`, `moveup_gpc`/`movedown_gpc`), `gpmaster_show`/`gpmaster_mod` (`add_chain`, `remove_chain`, `moveup_chain`, `movedown_chain`), about 30 `gpo_editor_*` commands |
| Pages in the stock Web UI | `chain.js` (1193 lines) and `gpo.js` (395), FreeIPA jQuery facets |
| GPUI editor | vanilla JS + AMD, about 20 thousand lines, 22 preferences layouts, a targeting editor (~1650 lines, drag-and-drop with a keyboard alternative), EN/RU locales, about 280 tests in 40 files |
| Boundary with libadmix | Server side only. The browser sees the typed `gpo_editor_*` RPC (`util/API.js`, ~29 methods) and knows nothing about SYSVOL |

Hierarchy: GPMaster → Chain (ordered) → GPO. On a conflict the policy with the higher priority wins (higher in the list; `moveup_gpc` and `moveup_chain` raise the priority).

## 2. What is proposed

Three pages in `freeipa-webui` (React + PatternFly + RTK Query): a GPO list/details, chains with priorities and
enable/disable, and the GPMaster (chain order, PDC Emulator). The GPUI editor is embedded as is. The server side does not change.

Ways to coexist with the current UI: a temporary dual UI, then replacement (recommended); an iframe proxy was rejected as too complex.

## 3. Check against the freeipa-webui code

Checked against `../freeipa-webui` (branch `main`, commit `5dbf1030`).

**Confirmed:** React 18, PatternFly 6, Redux Toolkit/RTK Query, calls through `api.injectEndpoints` in `src/services/rpc*.ts`,
one folder per entity in `src/pages`, navigation in `navigation/NavRoutes.ts` and routes in `AppRoutes.tsx`, vitest tests
(41 files) and Cypress with cucumber scenarios.

**Size benchmark.** The simplest entity, the HBAC service, takes: pages 987 lines (list, table, tabs, settings),
add and delete modals 495, `rpcHBACServices.ts` 177, a data hook 117, utilities 39, about 260 lines of Cypress
(features and steps) and edits to shared files (`rpc.ts`, `globalDataTypes.ts`, `utils.tsx`, `NavRoutes.ts`, `AppRoutes.tsx`).
That is ≈2 thousand lines per entity without nested relations. For host groups the Cypress tests alone take ≈1000 lines.

**What the original plan lacked:**

| Finding | Consequence |
|---|---|
| webui has no ordering UI at all (a search for `moveup`, `reorder`, `draggable`, `onDrag` in `src` finds nothing) | The order of chains in the GPMaster and of GPOs in a chain (up/down buttons) has to be designed from scratch |
| Translations: typed keys are generated from the server RPC `i18n_messages` (`npm run i18n:generate`) | The GPO strings are currently in the plugin's `js/locales/{en,ru}.js`, not in server messages. It has to be decided where they live |
| Menu items depend on `ConfigurationSettings` | If the `freeipa-server-gpo` plugin is not installed, the "Group Policy" section must be hidden (detected by the available commands), otherwise the pages answer with an error |
| The plugin infrastructure exists only in the unmerged branch `basic-plugin-infrastructure` (one commit, one extension point `dashboardContent`, plugins are built together with the core) | It does not allow adding pages and menu items, so PRs to the webui core are needed. A separate plugin repository is not yet possible |
| `ARCHITECTURE_SUMMARY.md` in webui asks the server for "REST API endpoints" | That is wrong: the existing JSON-RPC commands are enough for the pages and the server side need not change. The line in webui should be corrected |
| Linter with `--max-warnings 820`, `knip` (unused exports), prettier, signed commits | Leave room for review iterations |

## 4. Size and estimate

Working days, one developer. The estimate is calibrated on the benchmark above; the previous one (34-39 days) understated chains and tests.

| # | Block | Days |
|---|---|---|
| 1 | RPC services (gpo, chain, gpmaster) and types | 3-4 |
| 2 | The GPO entity: list, tabs, add/rename/delete | 5-7 |
| 3 | The Chain entity: list, tabs, two groups (typeahead), a GPO list with ordering, enable/disable | 7-9 |
| 4 | GPMaster: chain order, PDC Emulator (like the Configuration page) | 3-4 |
| 5 | Navigation, routes, hiding the section without the plugin, the translations decision | 2-3 |
| 6 | Connecting the existing editor | 5-8 |
| 7 | Tests: vitest and Cypress for the three entities | 8-10 |
| | Reserve for review and linters (≈10%) | 3-5 |
| | **Total without rewriting the editor** | **36-50 (≈8-10 weeks)** |
| 8 | Rewriting the editor in React/PatternFly (optional) | 60-100 (3-5 months) |

Assumptions:
- Block 6 takes 5-8 days only if a standalone build of the editor exists (stage 4 of the DX plan, which is done). Without it, +1 week for
  AMD shims.
- The estimate for block 8 comes from the amount of code and tests that would have to be ported: ≈20 thousand lines of JS and about 280 frontend tests.
- The webui Cypress tests run against a live FreeIPA, so block 7 needs a stand with the plugin installed (the dev container
  of this repository fits).

## 5. Decisions

1. **Do not rewrite the GPUI editor in the MVP.** It works, is covered by tests and is isolated by the RPC contract. Decide on a rewrite
   after a pilot (one screen, for example the script list) and measurements: code size, build time, passing of the
   ported tests, keyboard accessibility. The previously claimed "50-70% less code" is not backed by anything.
2. **Do not rewrite the targeting editor** and do not extract it into a library until there is a second consumer. The module is small,
   self-contained, and its drag-and-drop is duplicated by a keyboard scenario that is easy to lose.
3. **Do not touch the backend.** The needed RPC commands already exist; the contract should be pinned with shared JSON response examples
   (stage 3 of the DX plan) so that pytest and the frontend tests check one format.
4. **Settle the translations and section-hiding questions in advance** (see section 3): they affect both repositories.
5. **Translations (recommendation):** for the MVP keep the strings of the new pages in a local EN/RU dictionary inside webui; move them to the server `i18n_messages` as a separate step once the plugin registers messages. Confirm the decision with a prototype.
6. **Hiding the section (recommendation):** make the first PR to webui add detection of the availability of the GPO commands and a menu item under that condition, so that the section does not appear on servers without the plugin.
7. **Working in two repositories** (`freeipa-server-gpo` and `freeipa-webui`) is unavoidable: the RPC version (`API_VERSION`) and
   the list of commands have to be coordinated at every release.

## 6. Risks

- The webui plugin infrastructure is not merged, so changes go through shared core files (`NavRoutes.ts`, `AppRoutes.tsx`, `rpc.ts`) and may conflict with other PRs.
- Duplicated UI for a transition period and diverging behavior of the two interfaces.
- An editor in an iframe or a modal window of `freeipa-webui` will need FreeIPA session authentication and a shared CSP policy.
- Bundle format: it is currently UMD/AMD for FreeIPA's RequireJS, while `freeipa-webui` is built by Vite without RequireJS; embedding will probably need one more build output (ESM or IIFE) that calls `init`. To be checked in the pilot.
- Global styles: `css/main.css` uses generic class names (for example `.button`) that may clash with PatternFly styles on the same page; they may have to be scoped to the editor. To be checked in the pilot.
- Rewriting the editor would freeze GPUI development for months or lead to two parallel versions.

## 7. Readiness criteria

MVP: CRUD for GPO, Chain and GPMaster; priorities; enable/disable of chains; an accessible editor; basic tests.
Production: unit-test coverage no lower than the agreed threshold, e2e for the key scenarios, an accessibility check.

## 8. First steps

1. Stages 1-2 of the DX plan (linter, UI tests in CI) are done.
   Remaining: fix the line about "REST API endpoints" in `ARCHITECTURE_SUMMARY.md` in `freeipa-webui`.
2. A prototype of blocks 1-2 (the GPO page) in `freeipa-webui` on a real server from the dev container; use it to refine the remaining estimates.
3. A prototype of connecting the editor (the `js/app.js` bundle is already built).

Links: [FreeIPA API](https://freeipa.readthedocs.io/), [PatternFly React](https://www.patternfly.org/components),
[RTK Query](https://redux-toolkit.js.org/rtk-query/). The `gpo-integration-guide.md` and
`gpo-editor-patternfly.md` mentioned earlier do not exist in the repository.
