# Developer experience: what changed in the `dev-setup` branch

**English** | [Русский](./DEV-SETUP.ru.md)

This document describes the state of the project at the point where the branch started, what changed in it, why, and how to work with the project now — as a backend or a frontend developer, in VS Code or in vim.
State as of 2026-10-18. The branch point is commit `dfc4816` (merge of PR #17 into `master`, 2026-10-09); the branch has 18 commits (all by Andrey Litvinov, 15–19 October).

## 1. Summary

The main change is not the frontend tools themselves but that the project now has a **reproducible development environment with a real FreeIPA** (a podman dev container). It helps everyone:

| Role | Before | After |
|---|---|---|
| Backend developer (Python plugins, installer) | Python tests on mocks; a plugin could be tried live only on a FreeIPA you set up yourself; the full pytest suite did not run locally (it needs `ipalib` and other FreeIPA packages) | a container with a real FreeIPA (ALT Sisyphus, as in CI); Python plugin edits are picked up with `ipa-dev-reload`; all 877 Python tests pass in the container |
| Frontend developer (GPUI editor) | 69 AMD modules edited directly in `plugin/ui/grouppolicy/js/` (before the move to `frontend/`); checking was possible only on an installed FreeIPA | ES modules in `frontend/src/`, a stand without FreeIPA (`make ui-dev`), linter, formatter, types, 375 tests, a build into one bundle |
| Tester, reviewer | JS tests without a Makefile target, without CI, with a manual `NODE_PATH` | `make test-ui` and `make test-ui-ipa`; the CI job `frontend` |
| New contributor | set up the environment yourself | run `host-setup.sh` once and "Reopen in Container" (or `podman` commands for vim); credentials and addresses are defined |
| CI | RPM build, integration into FreeIPA, publication | the same + the `frontend` job (lint, format, typecheck, bundle check, tests with coverage, no skips allowed) |

## 2. State at the start of the branch

- **The GPO editor (GPUI)** — vanilla JS, about 17.2 thousand lines (71 files together with `chain.js` and `gpo.js`), AMD for FreeIPA's RequireJS. There were no ES sources: the `define([...])` wrappers and dependency lists were maintained by hand.
- **The Chains and GPO pages** (`chain.js`, `gpo.js`) — FreeIPA jQuery facets, also AMD.
- **JS tests:** 38 files in `tests/ui/` (unit tests through `vm` with a stubbed `define`, and browser tests on Playwright). There was no `make test-ui` target, they did not run in CI, a `NODE_PATH` pointing at `playwright` and `requirejs` was needed; without Chromium the browser tests were silently skipped.
- **The repository had no environment with a real FreeIPA.** The integration tests (`tests/integration`) ran in CI in a minimal domain (`doc/CI.md`); locally you had to set up a server yourself.
- **There was no standalone stand for the editor.**
- **There was no linter, formatter or type checking for JS.** For Python — `ruff`, `pylint`, pytest with a coverage threshold (unchanged).
- **CI** (`python-backend.yml`): RPM build, integration into FreeIPA, publication; nothing about JS.

## 3. What happened in the branch

| Date (2026) | Commit | Content |
|---|---|---|
| 10-15 | `5569b1c` | a mock dev server for the editor (`tools/ui-dev`) |
| 10-16 | `66367f8`, `78fcd3f` | the **podman dev container** with a live FreeIPA, the VS Code config |
| 10-16 | `6942226` | a live test: the plugin is wired into FreeIPA |
| 10-17 | `9d9a1ec` | analysis of the editor and a plan for integration into freeipa-webui |
| 10-18 | `bf2c061`, `d4c0f5b`, `eec3c8a`, `4f4afef` | documentation reorganized; the plans split into `FRONTEND-DX-PLAN` and `WEBUI-MIGRATION`; a root index of the plans |
| 10-18 | `9e0516a` | a separate `frontend/` project: ESM sources, a build into one bundle, a Vite stand |
| 10-18 | `04f20e1` | ESLint, the CI job (the message mentions Prettier; the commit itself did not contain it, it was added later) |
| 10-18 | `423a18a` | all JS tests moved into `frontend/tests/`, split into unit / integration / e2e |
| 10-18 | `e3f626f` | tests moved to Vitest, unit tests onto real `import`s, coverage |
| 10-18 | `647eb28` | all tests pass in the dev container (Chromium, `admix` 0.3.x) |
| 10-18 | `ba9f2e0` | the first part of splitting the large files (functions without closures extracted) |
| 10-18 | `4124b62` | Prettier: `frontend/` reformatted, the installer manifest `UI_PLUGIN_FILES` fixed, and accompanying edits |
| 10-18 | `5b117e1` | documentation update |

The analysis documents (`ARCHITECTURE.md`, `INTEGRATION-PLAN.md`, `GPO-EDITOR-ANALYSIS.md`) contained errors (file sizes in bytes instead of lines, an invented link with `admix`, a wrong `admix` version in the README and man pages, inaccurate estimates). They were fixed, the root `ARCHITECTURE.md` was removed as a duplicate of `doc/ARCHITECTURE*.md`, and the two plans were merged into `doc/plans/WEBUI-MIGRATION.md`.

## 4. The dev container

The container `freeipa-gpo-dev` (`.devcontainer/`): ALT Sisyphus with systemd as PID 1 and a **real FreeIPA** — 389-DS, KDC, Apache, oddjob, Samba for SYSVOL — the domain `ipa.test`, the server `server.ipa.test`. The repository sources are mounted over the installed copies, so the plugin runs straight from your working copy.

### What is good about it

- **A real environment instead of mocks.** The plugins, the LDAP schema, the oddjob handlers and the Web UI run as they do in production; integration errors show up immediately rather than in CI.
- **Live sources.** `frontend/dist/` (the built plugin directory), the three Python plugins (`gpo.py`, `chain.py`, `gpmaster.py`) and the `ipa_gpo_install` package are mounted over the installed ones (`dev-mounts.sh`). There is no need to rebuild the RPM and reinstall. The Apache UI cache is switched off for the plugin: an edit is visible after a page reload.
- **Fast Python reload.** `ipa-dev-reload` clears `__pycache__`, drops the `ipa` command schema cache and restarts Apache (about 4 seconds).
- **Ready to work at once.** The administrator gets a Kerberos ticket at start, the `ipa` CLI works (`ipa gpo-add …`), passwords and addresses are fixed (`devcontainer.json`), and the CA certificate is exported to `.devcontainer/.state/ipa-ca.crt` for the browser.
- **The same test set as CI.** The image has everything for the Python tests (`ipalib`, pytest, coverage, `ldap`, `dbus`), for the frontend tests (Node, Chromium, a font, `libadmix`, the SDMX catalog, FreeIPA's jQuery) and for e2e. All 877 Python tests (about 6 seconds) and all 375 frontend tests run in the container without skips.
- **Disposable and isolated.** FreeIPA lives inside the container and does not pollute the host; a broken state means `podman rm` and starting over.
- **Idempotent start.** On the first run `setup-ipa.sh` installs FreeIPA (about 10 minutes); afterwards each start only re-attaches the sources and refreshes the ticket.
- **Stable names and network:** a dedicated network `ipa-gpo-dev` (10.89.77.0/24, the server at 10.89.77.10), the Web UI at `https://server.ipa.test/` through host port 443.

### Cost and limitations

- A one-time host preparation with sudo is needed (`.devcontainer/host-setup.sh`): subuid/subgid ranges for rootless podman, ports from 443 without root, a `server.ipa.test` entry in `/etc/hosts`.
- The container is privileged and needs podman with systemd; the first start takes about 10 minutes.
- The image is built from the package repository as it was at build time and can go stale: for instance, the image turned out to have `admix` 0.1.1 while 0.3.x is required. `frontend/scripts/ipa-native.sh` checks the version and suggests an update command; the `Containerfile` now installs `chromium` and a font, and `devcontainer.json` sets `--shm-size=2g` and `--pids-limit=-1` (Chromium crashes without them).
- For the editor inside the container, `devcontainer.json` lists the Python, ruff, shellcheck, YAML, gettext, ESLint and Prettier extensions.

### How to bring it up

Once per machine:

```bash
sudo .devcontainer/host-setup.sh
```

**VS Code.** Install "Dev Containers" (it is in the recommendations of `.vscode/extensions.json`) and run "Dev Containers: Reopen in Container". The first start installs FreeIPA; later the container starts in minutes, and `postStartCommand` (`setup-ipa.sh`) brings it into working order.

**vim (and any editor without Dev Containers).** Edit files on the host — the working copy is mounted into the container (`/workspaces/freeipa-server-gpo`), so edits are visible inside at once. Start the container with a script:

```bash
bash frontend/scripts/ipa-up.sh        # starts the container, attaches the sources, restarts Apache
podman exec -it freeipa-gpo-dev bash   # a shell inside (only vi is there; use vim on the host)
```

The container can be created for the first time without VS Code through the Dev Containers CLI (`npx @devcontainers/cli up --workspace-folder . --docker-path podman`; not verified) or by repeating the `devcontainer.json` parameters by hand with `podman build`/`podman run` (name `freeipa-gpo-dev`, network `ipa-gpo-dev`, IP 10.89.77.10, `--privileged --systemd=always`, `--hosts-file=image`, `--shm-size=2g --pids-limit=-1`, port `127.0.0.1:443:443`, the repository mounted at `/workspaces/freeipa-server-gpo`).

Browser: `https://server.ipa.test/ipa/ui/`, login `admin`, the password from `devcontainer.json` (`IPA_ADMIN_PASSWORD`); to trust the certificate import `.devcontainer/.state/ipa-ca.crt`.

## 5. How to work

Node comes through fnm (`eval "$(fnm env)"` or `fnm use`), version ≥ 20 (`frontend/.node-version`: 24).

### Backend developer (Python)

In **VS Code** inside the container the interpreter is the system `/usr/bin/python3` with `ipalib` and `ipaserver`, so completion and go-to-definition work for FreeIPA packages; pytest, ruff, formatting and import organization are configured in `.vscode/settings.json` and `devcontainer.json`.

In **vim** edit on the host and run through `podman exec`. The loop:

```bash
# edit plugin/ipaserver/plugins/*.py or ipa_gpo_install/*.py on the host
podman exec freeipa-gpo-dev ipa-dev-reload                      # pick up the Python plugins
podman exec freeipa-gpo-dev bash -c 'kinit admin <<< "$IPA_ADMIN_PASSWORD"; ipa gpo-find'   # check with the ipa command
podman exec freeipa-gpo-dev bash -c 'cd /workspaces/freeipa-server-gpo && python3 -m pytest --ignore=tests/integration'
podman exec freeipa-gpo-dev bash -c 'cd /workspaces/freeipa-server-gpo && make test-coverage'
```

The same commands work from the VS Code terminal inside the container, without `podman exec`. `make test-coverage` passes in the container (94.5% against a 93.9% threshold). The `make test-integration` target (tests with 389-DS) exists but has not been verified.

### Frontend developer (the GPUI editor)

Two options, which can be combined.

1. **On the host, without FreeIPA** (fastest): edit `frontend/src/` → `make ui-dev` (`http://127.0.0.1:8765/ipa/ui/`, `?gpo=Name&lang=ru`, reload on save, mock backend) → `make test-ui`.
2. **On a real FreeIPA:** edit → `make ui-build` (rebuilds `frontend/dist/`) → reload `https://server.ipa.test/ipa/ui/` (the bundle is mounted into the container). For `chain.js` and `gpo.js` this is the only way to check: they do not work in the stand.

The Vite stand inside the container is not reachable from the host (ports are not forwarded); to work in VS Code inside the container, forward port 8765 by hand ("Forward a Port") or run the stand on the host. `node_modules` is shared between the host and the container (the same directory): both are ALT with the same glibc version, so there are no conflicts.

The daily loop (from the repository root):

1. Edit `frontend/src/` (do not edit `frontend/dist/` by hand — that is the generated plugin directory).
2. `make ui-dev` — the stand; `make test-ui` — unit and integration on mocks (`npm test -- --coverage` from `frontend/` adds coverage).
3. `make ui-lint`, `make ui-format-check` (or `make ui-format` to fix), `npm run typecheck` in `frontend/`. In VS Code Prettier formats `.js` in `frontend/` on save (`prettier.requireConfig` leaves files outside `frontend/` alone); in vim use `make ui-format`.
4. `make ui-build`, then `make ui-build-check` (the bundle is up to date).
5. Commit `frontend/src/` together with the rebuilt `js/app.js`.

First time: `make ui-dev-install`; `npx --prefix frontend playwright install chromium`.

### Checking everything together

- `make test-ui-ipa` (`npm run test:ipa`): brings up the container, runs e2e in the real Web UI (menus, lists, opening the editor on a real GPO) and the whole unit + integration set inside the container without skips.
- **CI** (`.forgejo/workflows/python-backend.yml`, the `frontend` job): dependencies and Chromium, lint, `format:check`, typecheck, `build:check`, `npm test -- --coverage`, no skipped tests allowed. The coverage threshold is at the current value (about 17% on a plain machine, about 19% in CI): it keeps coverage from dropping but is not a goal, because only unit tests count toward coverage while the UI is checked by integration tests.

### Typical tasks

- *A new module:* create a file in `frontend/src/` with `import`/`export`, connect it to `app.js` or a template, add a test next to it following the existing examples.
- *A new server command `gpo_editor_*`:* Python in `plugin/ipaserver/plugins/gpo.py`, a method in `frontend/dev/backend.mjs` for the stand, a call in `frontend/src/util/API.js`.
- *A new `freeipa/<module>` dependency:* an ES shim in `frontend/dev/shims/` and an alias in `vite.config.mjs`; a type stub in `frontend/types/freeipa/`.
- *Replacing dependencies in a test:* `vi.mock` for the whole file or `loadModule(...)` from `tests/unit/helpers/load-module.js`.
- *A new or removed UI file* (css, img, `chain.js`): update the `UI_PLUGIN_FILES` manifest in `ipa_gpo_install/actions.py` (a test checks it).

## 6. Frontend structure

```
frontend/
  src/                ES modules of the editor (import/export)      <- edit here
  dev/                the stand: mock backend, ES shims for freeipa/*, index.html
  tests/unit/         unit tests (read src/, dependencies replaced)
  tests/integration/  Chromium + a real DOM, RPC mocked
  tests/e2e/          a live FreeIPA in the dev container
  scripts/            test root build, bundle check, running in the container
  types/              type stubs for freeipa/* and open editor types
frontend/public/    chain.js, gpo.js (FreeIPA pages, AMD, written by hand) and img/ — copied into dist as they are
frontend/src/styles/  the global sheets main.css, other.css, icons.css (go into js/app.css)
frontend/dist/      GENERATED (Vite), committed, installed by the RPM: chain.js, gpo.js, img/, js/app.js, js/app.css
```

All files in `frontend/` are ES modules (`import`/`export`); CommonJS and `.cjs` are not used. The bundle is UMD: under FreeIPA's RequireJS it registers as an AMD module and depends on `freeipa/ipa` and `freeipa/rpc`; `gpo.js` and `chain.js` take `translations` and `editorDialog` from `js/app`.

## 7. Why it is done this way

- **A container with a real FreeIPA.** The plugins are tightly bound to FreeIPA (the LDAP schema, oddjob, SYSVOL), and mocks do not prove that they work. The container gives everyone the same environment and mirrors the CI environment.
- **Live sources instead of reinstalling.** The "edit → check" loop takes seconds, not the minutes of building and installing an RPM.
- **ESM instead of hand-written AMD.** The hand-written wrappers blocked IDE navigation, refactoring and npm packages. The automatic conversion of 69 files did not change behavior.
- **One committed bundle.** The RPM is built in hasher without a network and without Node, so the build result lives in git and `build:check` in CI verifies it is up to date.
- **Vite.** One tool for the stand, the build and the tests (Vitest uses the same config).
- **Tests inside `frontend/`, two scenarios:** `npm test` (on mocks, without FreeIPA) and `npm run test:ipa` (with a live server).
- **Tests in the container without skips.** 20 tests compare the UI with real server-side components (`libadmix`, the SDMX catalog, FreeIPA's jQuery) and were skipped on a plain machine. They now run in the container, and the CI job fails on any skip.
- **Type checking without changing the language:** JSDoc and `tsc --noEmit` catch annotation mismatches without requiring the code to be rewritten in TypeScript.
- **Plans.** The analysis is needed to decide whether to rewrite the editor in React/PatternFly when moving to freeipa-webui; the decision is postponed until a pilot (`doc/plans/`).

## 8. Findings along the way and limitations

**A regression that was found and fixed.** The `ipa-gpo-install` installer checks that every UI file is present against the `UI_PLUGIN_FILES` list in `ipa_gpo_install/actions.py`; it still held 69 paths of the former `js/…` modules, which no longer exist after the move to one bundle. The installer would have reported missing UI files, and the test `test_ui_plugin_manifest_matches_all_runtime_source_assets` would have failed in the `%check` of the RPM build. This went unnoticed because the Python tests did not run on the host (no `ipalib`); in the dev container they exposed the problem at once. The manifest is fixed (`js/app.js` instead of 69 paths), the icon test now requires `js/app.js`; all 877 Python tests pass in the container.

**Blame.** The Prettier formatting went into commit `4124b62`; its hash is listed in `.git-blame-ignore-revs` (enable once with `git config blame.ignoreRevsFile .git-blame-ignore-revs`), so `git blame` with that setting skips it.

**Limitations:**

- ESLint reports 73 warnings (mostly unused variables in tests); typing is non-strict (`strict: false`), dynamic members are described by open types in `types/globals.d.ts`.
- The large functions `renderPreferencesTemplate` (about 1360 lines) and `renderScriptEventEditor` (about 1570, after Prettier formatting) are not split — a separate refactoring that will probably lose its point after a move to freeipa-webui (`doc/plans/WEBUI-MIGRATION.md`).
- `chain.js` and `gpo.js` have no ES sources and are outside the stand, and are checked only on a live server; `chain.js` and `gpo.js` are not formatted by Prettier.
- The `frontend` CI job has never been run on the Forgejo server: its steps were run locally in the same image. The image installs packages and a browser from the network every time — an open problem described in `doc/plans/FRONTEND-DX-PLAN.md`.
- One test (`integration/targeting-editor`, the live descriptors check) is skipped on a plain machine: it needs `libadmix` in the host's Python; it runs in the container and in CI.
- Outside the frontend, `Makefile`, the dev container and CI, the README and man pages (the `admix` version), `doc/ARCHITECTURE*.md` (file sizes) and the installer manifest were also changed.

## 9. Links

Documentation:

- [README.md](../README.md) — project overview, installation, commands (the Russian version: [README.ru.md](../README.ru.md)).
- [doc/README.md](./README.md) — the index of all documents.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — the server architecture; [CI.md](./CI.md) — the CI pipeline.
- [frontend/README.md](../frontend/README.md) — frontend commands, tests, CI; [frontend/dev/README.md](../frontend/dev/README.md) — the stand without FreeIPA.
- [plans/README.md](./plans/README.md) — frontend architecture and current workflow; [plans/FRONTEND-DX-PLAN.md](./plans/FRONTEND-DX-PLAN.md) — the improvement plan and open problems; [plans/WEBUI-MIGRATION.md](./plans/WEBUI-MIGRATION.md) — the migration to freeipa-webui.

Dev container files (`.devcontainer/`):

- [devcontainer.json](../.devcontainer/devcontainer.json) — container parameters, VS Code extensions, mounts.
- [Containerfile](../.devcontainer/Containerfile) — the image (FreeIPA, Node, Chromium, fonts).
- [host-setup.sh](../.devcontainer/host-setup.sh) — one-time host preparation (needs sudo).
- [scripts/setup-ipa.sh](../.devcontainer/scripts/setup-ipa.sh) — installs FreeIPA on the first start and brings the container to working order.
- [scripts/dev-mounts.sh](../.devcontainer/scripts/dev-mounts.sh) — mounts the working copy over the installed plugins and disables the UI cache.
- [scripts/ipa-dev-reload](../.devcontainer/scripts/ipa-dev-reload) — reloads the Python plugins.
- [frontend/scripts/ipa-up.sh](../frontend/scripts/ipa-up.sh) and [frontend/scripts/ipa-native.sh](../frontend/scripts/ipa-native.sh) — start the container and run the tests inside it.
- [.vscode/settings.json](../.vscode/settings.json) and [.vscode/extensions.json](../.vscode/extensions.json) — editor settings and recommended extensions.

The Russian version of this document: [DEV-SETUP.ru.md](./DEV-SETUP.ru.md).
