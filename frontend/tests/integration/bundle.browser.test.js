// Loads the committed production bundle (dist/js/app.js)
// through RequireJS the way FreeIPA's Web UI does, with stub freeipa/* modules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { test } from 'vitest';
import { fileURLToPath } from 'node:url';

let chromium;
let requireJs;
try {
    chromium = (await import('playwright')).chromium;
    requireJs = fileURLToPath(import.meta.resolve('requirejs/require.js'));
} catch (_) {
    /* Browser dependencies are optional for unit-only environments. */
}

const root = path.resolve(import.meta.dirname, '../../dist');
const html = `<!doctype html><html><body><div id="gp__container"></div>
<script src="/require.js"></script><script>
define('freeipa/ipa', [], () => ({ api_version: '2.0', notify() {}, notify_success() {} }));
define('freeipa/rpc', [], () => ({ command() { return { execute() {} }; } }));
require.config({ baseUrl: '/js' });
require(['app'], app => { window.bundle = app; window.ready = true; }, error => { window.failure = String(error); });
</script></body></html>`;

test(
    'the committed bundle registers as an AMD module with the entry points FreeIPA uses',
    {
        skip:
            !chromium || !requireJs
                ? 'Install playwright and requirejs (npm install in frontend/) for browser checks.'
                : false
    },
    async () => {
        const server = http.createServer((request, response) => {
            const url = new URL(request.url, 'http://localhost');
            if (url.pathname === '/') {
                response.setHeader('Content-Type', 'text/html');
                return response.end(html);
            }
            const file = url.pathname === '/require.js' ? requireJs : path.join(root, url.pathname);
            if ((!file.startsWith(root) && file !== requireJs) || !fs.existsSync(file)) {
                response.statusCode = 404;
                return response.end();
            }
            response.setHeader('Content-Type', 'application/javascript');
            response.end(fs.readFileSync(file));
        });
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const browser = await chromium.launch();
        try {
            const page = await browser.newPage();
            await page.goto('http://127.0.0.1:' + server.address().port);
            await page.waitForFunction(() => window.ready || window.failure);
            assert.equal(await page.evaluate(() => window.failure || null), null);
            const shape = await page.evaluate(() => ({
                init: typeof window.bundle.init,
                t: typeof window.bundle.translations.t,
                setLanguage: typeof window.bundle.translations.setLanguage,
                trapTab: typeof window.bundle.editorDialog.trapTab
            }));
            assert.deepEqual(shape, { init: 'function', t: 'function', setLanguage: 'function', trapTab: 'function' });
        } finally {
            await browser.close();
            await new Promise(resolve => server.close(resolve));
        }
    }
);
