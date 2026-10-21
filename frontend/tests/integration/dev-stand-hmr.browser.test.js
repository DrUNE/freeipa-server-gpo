import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'vitest';

let chromium;
let createServer;
try {
    chromium = (await import('playwright')).chromium;
    ({ createServer } = await import('vite'));
} catch {
    /* Optional browser dependencies. */
}

const root = path.resolve(import.meta.dirname, '../..');
const skip =
    !chromium || !createServer ? 'Install playwright and vite (npm install in frontend/) for browser checks.' : false;

test(
    'a change in src/ restarts the editor in the same page of the dev stand instead of reloading it',
    { skip },
    async () => {
        const server = await createServer({
            root: path.join(root, 'dev'),
            configFile: path.join(root, 'vite.config.mjs'),
            logLevel: 'silent',
            server: { port: 0, host: '127.0.0.1' }
        });
        await server.listen();
        const address = server.httpServer.address();
        const url = `http://127.0.0.1:${address.port}/ipa/ui/`;
        let browser;
        try {
            browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();
            page.setDefaultTimeout(10000);
            const opened = [];
            page.on('request', request => {
                if (request.url().includes('/ipa/session/json') && /gpo_editor_open/.test(request.postData() || ''))
                    opened.push(request.url());
            });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.goto(url);
            await page.waitForSelector('#gp__container .gp__header');
            assert.equal(opened.length, 1);
            await page.evaluate(() => {
                window.__marker = 'same page';
                window.__first = window.gpui;
            });

            // The file watcher reports a change; the stand re-imports app.js and calls init again.
            server.watcher.emit('change', path.join(root, 'src/util/API.ts'));
            await page.waitForFunction(() => window.gpui !== window.__first);
            await page.waitForSelector('#gp__container .gp__header');
            assert.equal(await page.evaluate(() => window.__marker), 'same page');
            assert.equal(opened.length, 2);

            // A change in a stylesheet does not restart the editor at all.
            server.watcher.emit('change', path.join(root, 'src/styles/other.css'));
            await page.waitForTimeout(500);
            assert.equal(opened.length, 2);
            assert.equal(await page.evaluate(() => window.__marker), 'same page');
            assert.deepEqual(errors, []);
        } finally {
            if (browser) await browser.close();
            await server.close();
        }
    }
);

test('in the dev stand elements built with h() name the file and line that created them', { skip }, async () => {
    const server = await createServer({
        root: path.join(root, 'dev'),
        configFile: path.join(root, 'vite.config.mjs'),
        logLevel: 'silent',
        server: { port: 0, host: '127.0.0.1' }
    });
    await server.listen();
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        page.setDefaultTimeout(10000);
        // The failed open is shown by the EditorStatus component, which is built with h().
        await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/ipa/ui/?scenario=error`);
        const sources = await page
            .locator('[data-editor-status] [data-source]')
            .evaluateAll(nodes => nodes.map(node => node.getAttribute('data-source')));
        assert.ok(sources.length > 0);
        for (const source of sources) assert.match(source, /^src\/components\/EditorStatus\/EditorStatus\.js:\d+$/);
    } finally {
        if (browser) await browser.close();
        await server.close();
    }
});

test('restarting the editor leaves no listeners of the previous one on the document', { skip }, async () => {
    const server = await createServer({
        root: path.join(root, 'dev'),
        configFile: path.join(root, 'vite.config.mjs'),
        logLevel: 'silent',
        server: { port: 0, host: '127.0.0.1' }
    });
    await server.listen();
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        page.setDefaultTimeout(10000);
        // The divider of the editor is resized with listeners on the document; count what stays registered.
        await page.addInitScript(() => {
            window.__listeners = 0;
            const add = document.addEventListener.bind(document);
            const remove = document.removeEventListener.bind(document);
            document.addEventListener = (type, ...rest) => {
                if (type === 'mousemove') window.__listeners += 1;
                return add(type, ...rest);
            };
            document.removeEventListener = (type, ...rest) => {
                if (type === 'mousemove') window.__listeners -= 1;
                return remove(type, ...rest);
            };
        });
        await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/ipa/ui/`);
        await page.waitForSelector('#gp__container .gp__header');
        await page.waitForFunction(() => window.__listeners === 1);
        await page.evaluate(() => {
            window.__first = window.gpui;
        });

        server.watcher.emit('change', path.join(root, 'src/util/API.ts'));
        await page.waitForFunction(() => window.gpui !== window.__first);
        await page.waitForSelector('#gp__container .gp__header');
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(() => window.__listeners), 1);

        // Closing the editor (the owner calls cleanup) releases the rest.
        await page.evaluate(() => window.__editor.cleanup());
        assert.equal(await page.evaluate(() => window.__listeners), 0);
    } finally {
        if (browser) await browser.close();
        await server.close();
    }
});
