import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, createServer } from 'vite';
import { test } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const configFile = path.join(root, 'vite.config.mjs');

test('the dev server gives scripts (types stripped) and styles source maps', async () => {
    const server = await createServer({
        root: path.join(root, 'dev'),
        configFile,
        logLevel: 'silent',
        server: { port: 0, host: '127.0.0.1' }
    });
    try {
        const script = await server.transformRequest('/@fs' + path.join(root, 'src/util/editor-dto.ts'));
        assert.ok(script && script.map && script.map.sources.length > 0);
        for (const style of ['src/components/Dialog/Dialog.module.css', 'src/styles/main.css']) {
            const result = await server.transformRequest('/@fs' + path.join(root, style));
            assert.match(result.code, /sourceMappingURL=data:application\/json/, style);
        }
    } finally {
        await server.close();
    }
});

async function bundle(mode) {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpui-sourcemaps-'));
    try {
        await build({ root, configFile, mode, logLevel: 'silent', build: { outDir, emptyOutDir: true } });
        const script = fs.readFileSync(path.join(outDir, 'js/app.js'), 'utf8');
        const styles = fs.readFileSync(path.join(outDir, 'js/app.css'), 'utf8');
        return { script, styles, maps: fs.readdirSync(path.join(outDir, 'js')).filter(name => name.endsWith('.map')) };
    } finally {
        fs.rmSync(outDir, { recursive: true, force: true });
    }
}

test('the development build has a script source map and the data-source marks; the committed (production) build has neither', async () => {
    const development = await bundle('development');
    assert.deepEqual(development.maps, ['app.js.map']);
    assert.match(development.script, /sourceMappingURL=app\.js\.map/);
    assert.match(development.script, /data-source/);
    // Styles have no map there, so every source file of the sheet is named in a comment.
    assert.match(development.styles, /\/\* src\/styles\/shell\.css \*\//);
    assert.match(development.styles, /\/\* src\/components\/Dialog\/Dialog\.module\.css \*\//);

    const production = await bundle('production');
    assert.deepEqual(production.maps, []);
    assert.doesNotMatch(production.script, /sourceMappingURL|callerSource/);
    assert.doesNotMatch(production.styles, /\/\* src\//);
}, 60000);
