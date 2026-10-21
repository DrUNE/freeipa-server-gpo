# The editor as an island: what a host has to provide

**English** | [Русский](./WEBUI-ISLAND.ru.md)

Part of [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (stages 0 and 3). The editor is built as an ES module that any page can import:
`npm run build:esm` in `frontend/` writes `dist-esm/` (not committed): `gpui.js`, `gpui.css`, `gpui.d.ts` and `gpui-host.d.ts`.
`tests/integration/esm-island.browser.test.js` proves it works: a plain page, no FreeIPA scripts, the two host modules mapped
with an import map, the JSON-RPC answered by the mock server of the dev stand.

## 1. What the host imports

```js
import { init } from './gpui.js'; // and <link rel="stylesheet" href="./gpui.css">
const handle = init({ container, policyName: 'Default Domain Policy' });
// ... when the container is removed:
handle?.cleanup();
```

- `init({ container | containerId, policyName })` renders the whole editor (header, tree, workspace) into the element and returns
  `{ container, cleanup }`, or `null` when there is no container. A second call for the same container stops the first editor.
- `cleanup()` releases what the editor put outside its container (listeners on `document`, the open view's own cleanup).
  A React host calls it from the effect's cleanup.
- The types are in `gpui.d.ts`.

## 2. What the host provides

The bundle keeps two bare imports; the host maps them (an import map in a page, an alias in a bundler). Their types are in
`gpui-host.d.ts`.

| Module | Used as | What the editor needs |
|---|---|---|
| `freeipa/ipa` | default export | `api_version` (sent as `version` with every command), `notify(message, type)`, `notify_success(message)` |
| `freeipa/rpc` | default export | `command({ entity: 'gpo', method, args, options, retry, on_success, on_error }).execute()` |

`command` sends the JSON-RPC command `<entity>_<method>` with `[args, options]` through the host's session. Every call is a
`gpo_editor_*` command (see `tests/contracts/gpo_editor/`); `on_success(data)` gets the `result` of the answer,
`on_error(xhr, textStatus, thrown)` the failure. The editor sets `retry: false` for the commands whose errors it shows itself.
In freeipa-webui this is a small adapter over its RTK Query client (stage 1); the dev stand has the reference one in
`frontend/dev/shims/`.

## 3. Other things to know

- **Images.** The styles refer to `/img/...` (the icons in `frontend/public/img/`). The host serves that folder at `/img/`, or
  the paths are rewritten at its build.
- **Styles.** `gpui.css` has the CSS Modules and the editor's own sheets, scoped to the editor's container classes; the base
  styles of the host (fonts, `box-sizing`, form elements) still apply inside the island. Check this on the first integration.
- **Language.** The editor takes the language from the browser (`navigator.language`, `en` or `ru`).
- **Version.** The module and the server plugin go together: the contract is `API_VERSION` and the reference answers in
  `tests/contracts/gpo_editor/`.
