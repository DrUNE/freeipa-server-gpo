/*
 * The ES-module build of the editor for freeipa-webui (`npm run build:esm`, mode `esm` of vite.config.mjs). A real build into
 * a temporary directory: the output must be an ES module that exports `init` and keeps `freeipa/ipa` and `freeipa/rpc` as bare
 * imports (the host maps them to its own adapters), with no UMD wrapper, and must carry its styles next to it.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import { test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');

test('the esm build is an ES module exporting init, with the FreeIPA modules left to the host', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpui-esm-'));
    try {
        await build({
            root,
            configFile: path.join(root, 'vite.config.mjs'),
            mode: 'esm',
            logLevel: 'silent',
            build: { outDir, emptyOutDir: true }
        });
        const script = fs.readFileSync(path.join(outDir, 'gpui.js'), 'utf8');
        assert.match(script, /^import \w+ from "freeipa\/ipa";/m);
        assert.match(script, /^import \w+ from "freeipa\/rpc";/m);
        assert.match(script, /^export \{[^}]*\binit\b[^}]*\};/m);
        assert.doesNotMatch(script, /\bdefine\.amd\b|\bmodule\.exports\b/);
        assert.ok(fs.statSync(path.join(outDir, 'gpui.css')).size > 1000);
        assert.deepEqual(fs.readdirSync(outDir).sort(), ['gpui.css', 'gpui.js']);
    } finally {
        fs.rmSync(outDir, { recursive: true, force: true });
    }
}, 60000);
