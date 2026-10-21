# GPUI dev harness

**English** | [Русский](./README.ru.md)

A standalone stand for developing the group policy web editor
(`frontend/src`) without a FreeIPA server.

The stand runs on Vite: it serves the `frontend/src` sources directly (the page reloads on save), replaces
`freeipa/ipa` and `freeipa/rpc` with ES shims from `shims/`, and answers the JSON-RPC `POST /ipa/session/json` from the
mock backend `backend.mjs` (in-memory fixtures) through a plugin in `../vite.config.mjs`. The real `util/API.js` is unchanged.

## Running

```bash
make ui-dev-install   # once: npm install in frontend (requirejs, playwright)
make ui-dev           # http://127.0.0.1:8765/ipa/ui/
```

Port and host: `npx --prefix frontend vite --port 9000 --host 0.0.0.0` (from the repository root: `cd frontend && npx vite ...`).

URL parameters: `?gpo=Name&lang=ru`. The **Reset fixtures** button resets the
state of the mock backend. No build is needed: edit the files in `frontend/src/`.

## UI tests

Described in `../README.md` (section Tests): `npm test` (unit and integration tests on mocks) and
`npm run test:ipa` (e2e against a real FreeIPA in the dev container).

## What the stand covers

- the whole GPUI editor: tree, ADMX policies, preferences, scripts,
  security settings, advanced audit;
- the real `API.js`, error normalization, locales;
- server errors: an unknown method returns `CommandError`, an unknown
  policy `NotFound`, so that error states in the UI can be checked.

It does not cover `chain.js` and `gpo.js` (the chain and GPO lists, the editor
launch modal): they depend on the FreeIPA Web UI framework and are checked only on a
live server.

## How to extend

- A new `gpo_editor_*` method: add a function to `methods` in `backend.mjs`.
  Signature: `(displayname, ...args, options)`, where `options` is the second
  element of the request `params` (`request`, `locales`, `category_id`, etc.).
  The response is wrapped in `{result: {result: ...}}`, as FreeIPA does.
- A new `freeipa/<module>` dependency: add an ES shim `shims/<module>.js` and an alias in `../vite.config.mjs`.
- An error for the UI: `throw new RpcError('message', {category: 'validation', field: 'id'})`.
