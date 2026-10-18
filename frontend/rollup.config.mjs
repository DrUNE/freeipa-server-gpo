import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(root, 'src');
export const outDir = path.resolve(root, '..', 'plugin', 'ui', 'grouppolicy', 'js');

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(path.join(dir, entry.name))
        : entry.name.endsWith('.js') ? [path.join(dir, entry.name)] : []);

// Every source file is its own entry: the editor loads modules on demand and
// the tests require individual modules, so the output keeps a 1:1 AMD module
// per source file (same relative ids as the sources) instead of one bundle.

// Rollup emits AMD modules that fill an injected `exports` object. The editor's
// runtime and its tests (which stub `define` and use the factory's return
// value) expect the classic contract instead: `define([deps], function(deps) {
// ...; return api; })`. This rewrites the chunk wrapper accordingly.
function returningAmd() {
    const head = /^define\(\['exports'(?:, )?([^\]]*)\], \(function \(exports(?:, )?([^)]*)\) \{ 'use strict';\n/m;
    return {
        name: 'returning-amd',
        renderChunk(code) {
            const match = head.exec(code);
            if (!match || !code.trimEnd().endsWith('}));')) throw new Error('unexpected AMD wrapper');
            const tail = code.trimEnd().slice(0, -'}));'.length).replace(/\n\s*Object\.defineProperty\(exports, '__esModule', \{ value: true \}\);\n/, '\n').replace(/\n\s*Object\.defineProperty\(exports, Symbol\.toStringTag, \{ value: 'Module' \}\);\n/, '\n');
            const rewritten = code.slice(0, match.index)
                + `define([${match[1]}], function (${match[2]}) { 'use strict';\n    var exports = {};\n`
                + tail.slice(match.index + match[0].length)
                + '\n    return Object.freeze(exports);\n});\n';
            return { code: rewritten, map: null };
        }
    };
}

export default {
    plugins: [returningAmd()],
    input: walk(srcDir).sort(),
    preserveEntrySignatures: 'strict',
    output: {
        dir: outDir,
        format: 'amd',
        preserveModules: true,
        preserveModulesRoot: srcDir,
        entryFileNames: '[name].js',
        exports: 'named',
        interop: 'default',
        namespaceToStringTag: false,
        generatedCode: 'es2015',
        sourcemap: false,
        banner: '/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */'
    },
    // FreeIPA's own AMD modules, provided by the Web UI at runtime.
    external: [/^freeipa\//],
    treeshake: false
};
