'use strict';

// Loads the committed production bundle (plugin/ui/grouppolicy/js/app.js)
// through RequireJS the way FreeIPA's Web UI does, with stub freeipa/* modules.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');

let chromium;
let requireJs;
try {
    chromium = require('playwright').chromium;
    requireJs = require.resolve('requirejs/require.js');
} catch (_) { /* Browser dependencies are optional for unit-only environments. */ }

const root = path.resolve(__dirname, '../../../plugin/ui/grouppolicy');
const html = `<!doctype html><html><body><div id="gp__container"></div>
<script src="/require.js"></script><script>
define('freeipa/ipa', [], () => ({ api_version: '2.0', notify() {}, notify_success() {} }));
define('freeipa/rpc', [], () => ({ command() { return { execute() {} }; } }));
require.config({ baseUrl: '/js' });
require(['app'], app => { window.bundle = app; window.ready = true; }, error => { window.failure = String(error); });
</script></body></html>`;

test('the committed bundle registers as an AMD module with the entry points FreeIPA uses', {
    skip: !chromium || !requireJs ? 'Set NODE_PATH for Playwright and RequireJS browser checks.' : false
}, async () => {
    const server = http.createServer((request, response) => {
        const url = new URL(request.url, 'http://localhost');
        if (url.pathname === '/') { response.setHeader('Content-Type', 'text/html'); return response.end(html); }
        const file = url.pathname === '/require.js' ? requireJs : path.join(root, url.pathname);
        if ((!file.startsWith(root) && file !== requireJs) || !fs.existsSync(file)) { response.statusCode = 404; return response.end(); }
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
});
