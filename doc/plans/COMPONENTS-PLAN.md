# Plan: components and Storybook

**English** | [Русский](./COMPONENTS-PLAN.ru.md)

**Status:** a plan; two components (`Dialog`, `EditorStatus`) are done as the pattern. Written on 2026-10-21 together with the
migration strategy in [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md); continues stage 6 of [FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md).

## 1. Principles

1. **The boundaries follow PatternFly.** Each component is the counterpart of a PatternFly component or of a webui layout, so that the
   move to React replaces the rendering and keeps the structure, the props and the tests.
2. **The public surface is roles, labels and `data-*`.** Code and tests outside a component do not select it by class. Then the
   same tests run against the React version.
3. **Logic stays out of components.** What does not need the DOM goes to `frontend/src/core/` (stage 0 of the migration) and is
   tested there; a component only renders state and reports events.
4. **Stories are the behaviour specification.** States, arguments and `play` tests are written so that they move to
   `@storybook/react-vite` unchanged; only `render` is replaced.
5. **No polish of the vanilla look.** The look is taken over by PatternFly; the screenshots guard against accidental changes, not
   for design work.

The format of a component is unchanged (see `frontend/README.md`): a folder `src/components/<Name>/` with `<Name>.js` (`createX()`
returns a DOM element, built with `h()`), `<Name>.module.css`, `<Name>.stories.js`; old callers use `ElementCreator.wrap()`.

## 2. State now

- Components in the new format: `Dialog` (window chrome, used by all modals of the editor) and `EditorStatus` (errors, pending
  publication, diagnostics). Behaviour on top of `Dialog`: `editor-dialog.js` (focus, keyboard, busy state, discard question).
- `ElementCreator` is used in 49 files; the largest renderers are `field-control.js` (471 lines), `collection-dialog.js` (665),
  `policy-contents.js` (448), `advanced-audit-template.js` (547), the tables of preferences and scripts, the tree.
- Storybook 10 (`@storybook/html-vite`, `@storybook/addon-vitest`): 4 story files, 29 stories, all run as tests (`npm test`,
  project `stories`). No accessibility addon; stories of screens with data do not exist.
- Screenshot baselines exist for the preference form and targeting (`dialogs-visual.browser.test.js`).

## 3. Components

In the order of use: the first ones appear in the most screens and give the most stories.

| # | Component | Taken from | PatternFly / webui counterpart | Days |
|---|---|---|---|---|
| 1 | `Toolbar` (buttons with an active state, separators, overflow) | `header/header.js`, the toolbars of scripts, targeting, preferences, security | `Toolbar` | 1-2 |
| 2 | `DataTable` (columns, single and multiple selection, roving focus from `list-navigation.js`, empty and loading states) | `preference/view/items-table.js`, `script/assets-panel.js`, `script/entries-panel.js`, the catalog tables | `Table`, webui `TableLayout` | 3-4 |
| 3 | `Field` + `FieldControl` by kind (`text`, `optional_text`, `integer`, `select`, `boolean`, `text_list`, read-only, error, hint) | `preference/view/field-control.js`, `admx/policy-contents.js` | `FormGroup`, `TextInput`, `FormSelect`, `Checkbox`, `HelperText` | 3-4 |
| 4 | `Tabs` | `preference/view/field-tabs.js` | `Tabs`, webui `TabLayout` | 1 |
| 5 | `TreeView` (expand, select, keyboard, lazy children) | `tree-view/*` | `TreeView` | 2-3 |
| 6 | `Breadcrumb` | `category-path.js` | `Breadcrumb` | 0.5 |
| 7 | `CollectionEditor` (list and key/value list, inline editing, validation per row) | `collection-dialog.js`, `collection-control.js`; logic in `util/collection-value.ts` | a table with inline editing | 2-3 |
| 8 | `ConfirmationDialog` on `Dialog` and `h()` | `confirmation-dialog.js` | webui `ConfirmationModal.tsx` | 0.5 |
| 9 | `OrderableList` (up/down buttons, drag-and-drop with a keyboard alternative) | the order of scripts; later targeting and, in webui, chains | none in webui | 2 |

**Total: 15-20 days**, one component at a time, each with its stories, the existing tests and the screenshots. `ElementCreator`
goes away as the callers move; removing it is not a separate task.

**Done when** for each component: its old code is gone or is an adapter; callers and tests use only roles, labels and `data-*`;
the stories cover the states of section 5; the stories pass and fail on a mutation of the component.

## 4. Screens

A screen is a composition of the components above with real data. Each gets stories (section 5) before it is touched:

| Screen | Made of | Notes |
|---|---|---|
| Advanced Audit | `Toolbar`, `DataTable`, `Dialog`, `Field` | the pilot of migration stage 4; model in `advanced-audit/model.js` |
| Scripts (event, picker, entry form) | `Toolbar`, `DataTable`, `Dialog`, `Field`, `OrderableList` | split into modules already (`script/*`) |
| Security | `Toolbar`, `DataTable`, `Field`, `CollectionEditor`, `Dialog` | controls in `security/controls.js`, dependency plan in `security/dependency-plan.js` |
| ADMX policy | `Field`, `CollectionEditor`, `EditorStatus` | parameters in `admx/policy-contents.js` |
| Preference item form | `Dialog`, `Tabs`, `Field`, targeting modal | 22 layouts are data, not components |
| Tree and catalog | `TreeView`, `Breadcrumb`, `DataTable` | `tree-view-list-data.js` is the model |
| Targeting | `OrderableList`, `Field` | last: cycles between its functions (see the DX plan) |

## 5. Storybook

**Structure.**
- `Foundations/Tokens`: the `--gpui-*` palette and radii, rendered from `src/styles/tokens.css`.
- `Primitives/*`: the components of section 3.
- `Screens/*`: the screens of section 4 with a fake server.

**States of every story** (the arguments that have to exist): normal, empty, loading, error, read-only, long text and many
rows, EN/RU (the toolbar switch exists), a narrow viewport.

**Data from the contract.** A screen story gets its server answers from `tests/contracts/gpo_editor/*.json`, the reference answers
that pytest checks against the real commands; so a story cannot show data the server does not send. A decorator replaces
`freeipa/rpc` (the alias exists in `.storybook/shared.mjs`) with a fake that answers from those files and understands the
scenarios of the dev stand (`error`, `slow`, `empty`, see `dev/backend.mjs`). No msw: the transport is already a module.

**Tests in stories.** `play` functions use `storybook/test` queries by role and label (`getByRole('button', { name })`,
`getByLabelText`), `userEvent` and `expect`; never our class names. Each story test is checked by a mutation of the component
(`CLAUDE.md`). Such `play` functions run unchanged against the React version.

**Accessibility.** Add `@storybook/addon-a11y` (needs network access to install) and run its checks in the `stories` test
project, so every story is also an accessibility check.

**Screenshots.** Extend the baselines of `dialogs-visual.browser.test.js` to one story per screen (taken in the container, as now);
the screen stories give stable states for that.

**In webui (migration stage 4).** Bring Storybook in with `@storybook/react-vite` and the stories of the components the pilot
uses, with the same arguments and `play` functions; webui has no Storybook today, so this is a self-contained first PR.

## 6. Order and estimate

| Step | What | Days |
|---|---|---|
| 1 | ✅ Storybook infrastructure: the fake RPC (the mock server of the stand, whose answers are checked against the reference answers), the scenarios, `Foundations/Tokens`, the accessibility addon | 2-3 |
| 2 | Components 1-2 (`Toolbar`, `DataTable`) with stories | 4-6 |
| 3 | Screen stories for Advanced Audit and Scripts (the next migration pilots) | 2 |
| 4 | Components 3-8 with stories | 9-12 |
| 5 | Screen stories for Security, ADMX, the preference form, the tree | 3-4 |
| 6 | Component 9 (`OrderableList`) when the targeting or the webui chains need it | 2 |
| | **Total** | **22-29** |

Steps 1-3 can go in parallel with migration stage 0 (`frontend/src/core/`).

**Step 1 is done.** `.storybook/shims/rpc.js` calls `dev/backend.mjs` in the page (so stories and the stand share the fixtures and the
scenarios); `Foundations/Tokens` and `Infrastructure/Fake RPC` (`src/util/API.stories.js`) are the examples; `@storybook/addon-a11y`
runs in every story test with `a11y.test: 'error'`. Its first run found a real defect: the action buttons of `EditorStatus`
(Refresh, Reconcile) were rendered in the editor's disabled grey (contrast 1.4:1) because the global `.button` is grey until it
is `.active`; they now have their own look.

## 7. What not to do

- Do not convert the whole code to JSX or to TypeScript as a mass change; move a file when it is reworked anyway.
- Do not split the targeting editor before its turn in the migration (see the DX plan, stage 6).
- Do not add stories that only render without a `play` check or without states; a story is kept for what it specifies.
