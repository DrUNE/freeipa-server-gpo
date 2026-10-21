import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { test } from 'vitest';
import * as backend from '../../dev/backend.mjs';

let chromium;
let build;
try {
    chromium = (await import('playwright')).chromium;
    ({ build } = await import('vite'));
} catch {
    /* Optional browser dependencies. */
}

const root = path.resolve(import.meta.dirname, '../..');
const skip = !chromium || !build ? 'Install playwright and vite (npm install in frontend/) for browser checks.' : false;

/*
 * The editor as an "island" in a foreign page (stage 3 of doc/plans/WEBUI-MIGRATION.md): the ES-module build (`mode: esm`)
 * is loaded by a plain page that is NOT the dev stand and has none of FreeIPA's own scripts. The page maps the two bare
 * imports of the module, `freeipa/ipa` and `freeipa/rpc`, with an import map to the dev shims (the "host adapters"), and the
 * test server answers the JSON-RPC calls from the mock backend of the dev stand. Nothing is served from Vite: the bundle
 * is built into a temporary directory first.
 */
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/gpui.css">
<script type="importmap">{"imports":{"freeipa/ipa":"/shims/ipa.js","freeipa/rpc":"/shims/rpc.js"}}</script>
<style>body{margin:0;font:12px Arial,sans-serif}#island{height:700px}</style></head>
<body><div id="island"></div>
<script type="module">
import { init } from '/gpui.js';
window.start = () => (window.handle = init({ container: document.getElementById('island'), policyName: 'Dev GPO' }));
window.start();
window.ready = true;
</script></body></html>`;

// Serves the page, the built bundle, the host shims, the images and the mock JSON-RPC; returns the stop function and the port.
async function serve(dist) {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        if (request.method === 'POST' && url.pathname === '/ipa/session/json') {
            const chunks = [];
            request.on('data', chunk => chunks.push(chunk));
            request.on('end', () => {
                response.setHeader('Content-Type', 'application/json');
                response.end(
                    JSON.stringify(backend.dispatch(JSON.parse(Buffer.concat(chunks).toString('utf8')), 'normal'))
                );
            });
            return;
        }
        const files = {
            '/gpui.js': [path.join(dist, 'gpui.js'), 'text/javascript'],
            '/gpui.css': [path.join(dist, 'gpui.css'), 'text/css'],
            '/shims/ipa.js': [path.join(root, 'dev/shims/ipa.js'), 'text/javascript'],
            '/shims/rpc.js': [path.join(root, 'dev/shims/rpc.js'), 'text/javascript']
        };
        if (url.pathname === '/') {
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            return response.end(html);
        }
        const entry = files[url.pathname];
        const file = entry
            ? entry[0]
            : url.pathname.startsWith('/img/')
              ? path.join(root, 'public', url.pathname)
              : null;
        if (!file || !fs.existsSync(file)) {
            response.statusCode = 404;
            return response.end('Missing');
        }
        response.setHeader('Content-Type', entry ? entry[1] : 'image/svg+xml');
        response.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    return { port: server.address().port, stop: () => new Promise(resolve => server.close(resolve)) };
}

// The bundle renders the navigation tree and the workspace into the container of a foreign page, `cleanup()` leaves the page
// without errors, and starting again in the same container replaces the editor instead of stacking a second one.
test(
    'the ES-module build runs as an island in a plain page with host-mapped freeipa modules',
    { skip },
    async () => {
        const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'gpui-island-'));
        await build({
            root,
            configFile: path.join(root, 'vite.config.mjs'),
            mode: 'esm',
            logLevel: 'silent',
            build: { outDir: dist, emptyOutDir: true }
        });
        const { port, stop } = await serve(dist);
        const browser = await chromium.launch({ headless: true });
        try {
            const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
            page.setDefaultTimeout(10000);
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(`http://127.0.0.1:${port}/`);
            await page.waitForFunction(() => window.ready);
            await page.getByRole('tree').waitFor();
            assert.ok((await page.getByRole('treeitem').count()) > 0);
            assert.equal(await page.locator('#island').count(), 1);

            await page.evaluate(() => window.handle.cleanup());
            await page.evaluate(() => window.start());
            await page.getByRole('tree').waitFor();
            assert.equal(await page.getByRole('tree').count(), 1);
            assert.deepEqual(errors, []);
        } finally {
            await browser.close();
            await stop();
            fs.rmSync(dist, { recursive: true, force: true });
        }
    },
    60000
);
