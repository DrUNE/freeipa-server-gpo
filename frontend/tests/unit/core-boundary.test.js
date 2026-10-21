/*
 * The boundary of src/core: the code that moves to freeipa-webui unchanged (stage 0 of the migration, see
 * doc/plans/WEBUI-MIGRATION.md). It must not touch the DOM and must not import rendering code, so React can use it as is.
 * ESLint checks the .js files of the folder; this test also covers the .ts files, which ESLint skips.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'vitest';

const core = path.resolve(import.meta.dirname, '../../src/core');

function files(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(directory, entry.name);
        return entry.isDirectory() ? files(full) : /\.(js|ts)$/.test(entry.name) ? [full] : [];
    });
}

// Imports allowed in core: itself, the locales (plain data and a translate function) and relative neighbours.
const allowed = /^(@gpui\/(core|locales)\/|\.{1,2}\/)/;

test('src/core imports only core and locales, and has the code that was moved there', () => {
    const list = files(core);
    assert.ok(list.length >= 30, 'src/core is expected to hold the modules moved out of components/ and util/');
    for (const file of list) {
        const source = fs.readFileSync(file, 'utf8');
        const relative = path.relative(core, file);
        for (const match of source.matchAll(/(?:^|\n)\s*(?:import|export)\b[^;]*?from\s+['"]([^'"]+)['"]/g)) {
            assert.match(match[1], allowed, `${relative} imports ${match[1]}, which is outside the core boundary`);
        }
    }
});

test('src/core is TypeScript only (checked strictly by tsconfig.strict.json)', () => {
    const scripts = files(core).filter(file => file.endsWith('.js'));
    assert.deepEqual(
        scripts.map(file => path.relative(core, file)),
        []
    );
});

test('src/core does not use the DOM or other browser globals', () => {
    const forbidden =
        /\b(document|window|navigator|localStorage|sessionStorage|HTMLElement|Element|Node|Event|CustomEvent)\b\s*[.([]/;
    for (const file of files(core)) {
        // Comments may name them; strip them before looking.
        const source = fs
            .readFileSync(file, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/(^|[^:])\/\/.*$/gm, '$1');
        assert.doesNotMatch(source, forbidden, `${path.relative(core, file)} uses a browser global`);
    }
});
