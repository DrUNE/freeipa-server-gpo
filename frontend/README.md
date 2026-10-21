# Frontend (GPUI editor)

**English** | [Русский](./README.ru.md)

ES-module sources in `src/`, built with **Vite** into one committed bundle:
`../plugin/ui/grouppolicy/js/app.js` (UMD; registers as an AMD module under FreeIPA's RequireJS and
depends on its `freeipa/ipa` and `freeipa/rpc`). The RPM installs the committed bundle, so Node is
not needed to build the package. `chain.js`, `gpo.js`, `css/` and `img/` live in `../plugin/ui/grouppolicy/` as before;
`gpo.js` and `chain.js` take `translations` and `editorDialog` from the bundle (`js/app`).

All code in `frontend/` uses `import`/`export` (no CommonJS, no `.cjs`). Node is managed with fnm: `eval "$(fnm env)"` (or `fnm use`), Node >= 20.

## Commands (from the repository root)

| Command | Purpose |
|---|---|
| `make ui-dev-install` | `npm install` in `frontend/` |
| `make ui-dev` | Vite dev stand at http://127.0.0.1:8765/ipa/ui/ (`?gpo=Name&lang=ru`), no FreeIPA needed |
| `make ui-build` | Rebuild the committed bundle (`npm run build`) |
| `make ui-build-check` | Fail if the committed bundle differs from a fresh build |
| `make ui-storybook` | Storybook at http://localhost:6006: components rendered in isolation, with a language switch (EN/RU) and the editor's real CSS |
| `make ui-lint` | ESLint (`eslint.config.mjs`) |
| `make ui-format` / `make ui-format-check` | Prettier (`.prettierrc.json`: 4 spaces, single quotes, width 120) writes / checks `src`, `dev`, `scripts`, `tests` and the config files; `*.md`, `*.html`, the lock file and the generated bundle are not touched |
| `npm run typecheck` (in `frontend/`) | `tsc --noEmit` over all of `src/` (JSDoc, `checkJs`, non-strict). `types/globals.d.ts` models the editor's ad-hoc members as open records; the former `@ts-expect-error` placeholders have been replaced by precise annotations |

Workflow: edit `src/`, check in the dev stand (reloads on save), run `make test-ui`, run `make ui-build`,
commit `src/` together with the rebuilt `js/app.js`.

## Storybook: developing components in isolation

Components are developed and tested one at a time in Storybook (`.storybook/`, stories next to the component as `*.stories.js`).
A story is both documentation and a test: in `npm test` every story is opened in a real Chromium (Vitest project `stories`) and
its `play` function (user interactions + assertions with `storybook/test`) must pass.

Workflow for a component:

1. `make ui-storybook`, create `src/components/<name>.stories.js` next to `<name>.js`.
2. Render the component in a `render` function: it returns a DOM element (host), the component is mounted into it. Cover the states
   that matter: default, empty, error, busy, long text, and the other language (the toolbar switches EN/RU).
3. Describe behavior in `play`: click, type, keyboard (`userEvent`), then assert (`expect`, `fn()` spies from `args`).
4. `npm test` runs the stories together with the unit and integration tests; `npm run build-storybook` builds a static site.

Example: `src/components/confirmation-dialog.stories.js`. Stories use the same `freeipa/*` shims as the dev stand
(`.storybook/shared.mjs`) and the plugin's `css/main.css`. Story files are not part of the bundle and are excluded from coverage.
Components that need the real editor context (the whole tree, RPC) still belong in the integration tests; use stories first for
self-contained pieces (dialogs, controls, tree, header, footer).

## Component style

New and migrated components follow one pattern (the model is `src/components/EditorStatus/`):

```
src/components/<Name>/
  <Name>.js            createX(options) -> DOM element, built with h() from src/lib/dom.js
  <Name>.module.css    private styles (CSS Modules, camelCase class names)
  <Name>.stories.js    states + play tests
```

- A component is a function that returns a plain DOM element. `h(tag, attrs, ...children)` builds it: strings become text nodes, never
  HTML (no `innerHTML`); `null`/`false` children are skipped, so `cond && h(...)` works. `cx()` joins class names.
- Styles are private. Nobody outside selects the component by its class: public hooks are `data-*` attributes, listed in the file's
  header comment (`[data-editor-status]`, `[data-editor-status-action]`, ...). A parent that needs layout control uses an attribute
  selector in its own CSS (`.gp__admx-wrapper > [data-editor-status]`). Context from the editor shell is referenced as
  `:global(.gp__container)` in the module.
- Colors, spacing and other values stay as they were in `css/main.css`; a story pins them with `getComputedStyle` so a migration
  cannot change the look unnoticed.
- Old code builds UI with `ElementCreator`. To keep it working while it migrates, the old module path stays as an adapter that
  wraps the new elements with `ElementCreator.wrap(element)` (see `components/editor-status.js`); callers move to the new API as they
  are migrated.

How the styles reach the page: `npm run build` emits the CSS Modules as `plugin/ui/grouppolicy/js/app.css` next to `app.js`; `gpo.js`
loads it after `css/main.css` and `css/other.css`, and the installer manifest (`UI_PLUGIN_FILES`) lists it. Storybook and the dev stand
get the same styles from Vite. For the browser tests `npm test` builds each `*.module.css` into an AMD module with `postcss-modules`
(`scripts/build-test-root.mjs`); `scripts/read-amd.mjs` understands `import x from`, named imports and inline `export function`
but not `export default`.

Status: `EditorStatus` and the chrome of the editor's dialogs (`Dialog`, used by `editor-dialog.js`) are migrated. A dialog takes
`width` and `fill` options instead of consumers overriding its classes, and exposes `[data-dialog]` and `[data-dialog-part="..."]`
hooks (header, title, close, body, error, footer, cancel, apply) for the content layout of its five consumers. Not yet migrated: the
hand-built modals in `script-template.js` (3) and `preferences-view-template.js` (2), which still use the global `.preference__modal*`
rules; those rules stay in `css/main.css` until the modals move onto `Dialog`.

Moving shared chrome is risky because many places depend on the same class names. A temporary regression harness helped: a Vitest setup
file patched `chromium.launch` so that every dialog opened by the integration tests was recorded (size and computed style of the window,
header, title, close button, body, footer and the buttons and fields inside) by structure rather than by class, before and after the
change; 72 snapshots had to stay identical. The harness is not in the repository.

## Dev stand (`dev/`)

Vite serves `src/` directly. `freeipa/ipa` and `freeipa/rpc` resolve to ES shims in `dev/shims/`;
`vite.config.mjs` answers `POST /ipa/session/json` from the mock backend `dev/backend.mjs` and serves the plugin's
`css/` and `img/` under `/ipa/ui/js/plugins/chain/`. See `dev/README.md` ([Russian](./dev/README.ru.md)). `chain.js` and `gpo.js` do not run in the stand
(they need FreeIPA's own modules); check them on a live server (`.devcontainer/`).

## Tests

The runner is **Vitest** (`vitest.config.mjs`, three projects: `unit`, `integration`, `e2e`). Two npm tasks (both available as make targets):

| Task | Make | What it runs |
|---|---|---|
| `npm test` | `make test-ui` | `tests/unit`, `tests/integration` and the Storybook stories (project `stories`) against mocks; no FreeIPA needed |
| `npm run test:watch` | | unit tests in watch mode |
| `npm test -- --coverage` | | adds V8 coverage of `src/` (report in `coverage/`); CI uses it |
| `npm run test:ipa` | `make test-ui-ipa` | `tests/e2e` against a real FreeIPA server in the podman dev container, plus the tests that need FreeIPA-side software (see below) |

Layout of `tests/` (everything in `frontend/` is ES modules with `import`; Node's `require` is not used. The `require(...)` calls that remain in the browser tests are RequireJS running inside the page under test; Playwright drives the browser tests):

- `unit/` — import modules from `src/` directly. Dependencies that are the same for a whole file are replaced with
  `vi.mock`; tests that need fresh doubles (or globals such as `document`, `navigator`) per test use
  `helpers/load-module.js`: `await loadModule('util/API.js', { 'freeipa/rpc': {...} }, { navigator })` loads a new
  instance with those mocks, and by default stubs `freeipa/ipa` and `freeipa/rpc`. Vitest throws when code reads an export a
  mock does not define, so give such exports explicitly (`getLanguage: undefined`).
- `integration/` (`*.browser.test.js`) — real Chromium and DOM, RPC mocked. They run against
  `frontend/.test-root/` (git-ignored, regenerated by `npm test`): each `src` module as its own AMD
  module plus symlinks to `css/`, `img/`, `chain.js`, `gpo.js`. `bundle.browser.test.js` loads the
  committed production bundle through RequireJS instead.
- `scripts/read-amd.mjs` is now used only by `scripts/build-test-root.mjs` to generate the per-module AMD tree for the browser tests.
- `e2e/` — logs in to the real Web UI, checks menus and facets, creates a GPO through the container's
  `ipa` CLI, opens the editor from the GPO page and removes the GPO again.

`npm run test:ipa` runs three steps:

1. `scripts/ipa-up.sh` starts the container `freeipa-gpo-dev` if stopped and re-runs `.devcontainer/scripts/setup-ipa.sh`
   (binds the workspace sources, restarts httpd). It needs `.devcontainer/host-setup.sh` run once and the container created
   once from VS Code.
2. `tests/e2e` on the host against the live Web UI. With `REQUIRE_IPA=1` (set by the task) an unreachable server fails
   instead of skipping. Settings: `IPA_URL`, `IPA_ADMIN_USER`, `IPA_ADMIN_PASSWORD`, `IPA_CONTAINER`.
3. `scripts/ipa-native.sh` runs the whole mock-based suite (unit + integration) **inside the container**, which has what a
   plain host lacks: the real libadmix, the SDMX catalog, the policy definitions, FreeIPA's own jQuery and Chromium. Nothing is
   skipped there; `scripts/assert-no-skips.mjs` fails the run if anything is. The workspace is bind-mounted, so the container
   uses the host's `node_modules`; Playwright's browser is installed into the container on first use.

The container image must provide `python3-module-admix` 0.3.x (as `ipa-gpo-install.spec` requires), `chromium` and a TTF font
(`fonts-ttf-open-sans`); `.devcontainer/Containerfile` installs them. The script checks admix and chromium and prints the fix.
An older image can be updated in place, for example
`podman exec freeipa-gpo-dev bash -c 'mkdir -p /var/lib/apt/lists/partial && apt-get update && apt-get install -y python3-module-admix chromium'`.
Chromium also needs a real `/dev/shm` and a high pid limit: `devcontainer.json` sets `--shm-size=2g --pids-limit=-1`
(the script remounts `/dev/shm` for containers created earlier). Integration tests run with 2 workers for the same reason.

On a plain host `npm test` skips the tests that need that software (20 tests: native contract, SDMX catalog, audit GUIDs,
FreeIPA's jQuery, live filter descriptors).

Coverage counts unit tests only (integration tests run the code inside Chromium, which Node's V8 coverage cannot see), so the
floor in `vitest.config.mjs` is a ratchet, not a target: raise it when unit coverage grows. It is set for a plain host
(about 17% statements); CI, where the native-contract tests run, reaches about 19%.

Install the browser once: `npx playwright install chromium` (in `frontend/`).

## CI

Job `frontend` in `.forgejo/workflows/python-backend.yml` runs in `altlinux.space/actions/runner/containers:sisyphus` (the image
the integration job uses). It installs `python3-module-admix sdmx-basealt sdmx-schemas admx-basealt freeipa-server-common chromium
fonts-ttf-open-sans`, configures fontconfig, then runs lint, `format:check`, typecheck, `build:check`, `npm test -- --coverage` (one retry for
timing-sensitive browser tests) and `scripts/assert-no-skips.mjs`: **all 309 tests run and none may be skipped**.

fontconfig is told to ignore `/usr/share/fonts/type1`: otherwise it maps Arial to the Type 1 URW fonts, which Chromium cannot render
(text width 0), and the layout assertions fail. The job's steps were verified by executing its `run:` scripts in that image.
