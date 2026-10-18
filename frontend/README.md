# Frontend sources

ESM sources for the GPUI editor (AMD artifact lives in `../plugin/ui/grouppolicy/js/`).

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

Writes the AMD artifact into `../plugin/ui/grouppolicy/js/`. The committed artifact must match the sources; CI checks this with `npm run build:check`.

## Node (fnm)

Node is managed with fnm. Run `eval "$(fnm env)"` (or `fnm use`) first; Node >= 20.

## Check

```bash
make ui-build-check   # fails if the committed artifact differs from a fresh build
make test-ui
```

## Dev

Not yet integrated. For now use the existing `make ui-dev` from the repository root; it loads the AMD artifact directly.

## Structure

- `src/` — ESM sources, converted from the original AMD by a one-time codemod (not in the repository).
- `scripts/check-artifact.mjs` — CI check that the committed artifact matches the sources.
- `rollup.config.mjs` — build config. Every source file is its own AMD module entry to preserve on-demand loading and test isolation.
