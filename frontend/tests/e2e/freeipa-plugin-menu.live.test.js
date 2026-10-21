import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import https from 'node:https';
import { afterAll, beforeAll, describe, test } from 'vitest';

let chromium;
try {
    chromium = (await import('playwright')).chromium;
} catch {
    /* Optional browser dependency in unit-only environments. */
}

// Live check against a real FreeIPA server with the plugin installed, such as
// the dev container (.devcontainer/). Everything under tests/unit and tests/integration mocks FreeIPA;
// this is the only test that proves the plugin is actually wired into the
// application: modules served, menu entries registered, facets rendered.
// REQUIRE_IPA=1 (set by `npm run test:ipa`) turns an unreachable server into a failure instead of a skip.
const requireIpa = process.env.REQUIRE_IPA === '1';
const base = (process.env.IPA_URL || 'https://server.ipa.test').replace(/\/$/, '');
const username = process.env.IPA_ADMIN_USER || 'admin';
// Development-only password of the throwaway ipa.test realm.
const password = process.env.IPA_ADMIN_PASSWORD || 'DevAdmin-Password-1!';

// "Group Policy" is a click-to-open dropdown under the Policy tab.
async function openGroupPolicyMenu(page) {
    await page.click('li[data-name="policy"] > a');
    await page.click(`${MENU.group} > a`);
}

const MENU = {
    group: 'li[data-name="policy/grouppolicy"]',
    chains: 'li[data-name="policy/grouppolicy/chain"]',
    gpos: 'li[data-name="policy/grouppolicy/gpo"]'
};

const container = process.env.IPA_CONTAINER || 'freeipa-gpo-dev';
// Fixture access goes through the container's ipa CLI (the same admin account).
function ipa(...args) {
    const script = 'printf "%s\\n" "$P" | kinit admin >/dev/null && ipa "$@"';
    return execFileSync('podman', ['exec', '-e', `P=${password}`, container, 'bash', '-c', script, 'ipa', ...args], {
        encoding: 'utf8'
    });
}

function reachable() {
    return new Promise(resolve => {
        const request = https.get(`${base}/ipa/ui/`, { rejectUnauthorized: false, timeout: 5000 }, response => {
            response.resume();
            resolve(response.statusCode === 200);
        });
        request.on('timeout', () => {
            request.destroy();
            resolve(false);
        });
        request.on('error', () => resolve(false));
    });
}

async function login(page) {
    await page.goto(`${base}/ipa/ui/`);
    await page.fill('#username1', username);
    await page.fill('#password2', password);
    await page.click('button[name=login]');
    // The plugin adds its menu entries on the 'profile' phase, after login.
    try {
        await page.waitForSelector(MENU.group, { state: 'attached', timeout: 30000 });
    } catch (error) {
        const loggedIn = await page.isVisible('.navbar');
        throw new Error(
            loggedIn
                ? 'Logged in, but the Group Policy menu was not added under Policy: check that chain.js loads and ' +
                      'that "policy" exists in the menu (frontend/public/chain.js add_menu_items).'
                : `Could not log in to ${base} as ${username}: check IPA_ADMIN_USER and IPA_ADMIN_PASSWORD.`,
            { cause: error }
        );
    }
}

describe('GPO plugin is wired into the live FreeIPA Web UI', () => {
    let browser;
    let page;
    let ready = false;
    const pluginResponses = [];
    const pageErrors = [];

    beforeAll(async () => {
        if (!chromium) return;
        const up = await reachable();
        if (!up && requireIpa) throw new Error(`FreeIPA at ${base} is not reachable.`);
        if (!up) return;
        browser = await chromium.launch();
        // Fixed locale: labels differ per language, so assertions use data-name.
        const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            locale: 'en-US',
            viewport: { width: 1400, height: 900 }
        });
        page = await context.newPage();
        page.on('response', response => {
            if (response.url().includes('/ipa/ui/js/plugins/chain/')) {
                pluginResponses.push({ url: response.url().split('?')[0], status: response.status() });
            }
        });
        page.on('pageerror', error => pageErrors.push(String(error)));
        await login(page);
        ready = true;
    }, 90000);

    afterAll(async () => {
        if (browser) await browser.close();
    });

    // Without a reachable server (and REQUIRE_IPA) the tests are reported as skipped.

    test('plugin modules are served without errors', async ctx => {
        if (!ready) return ctx.skip();
        const served = url => pluginResponses.filter(r => r.url.endsWith(url) && r.status === 200);
        assert.equal(served('/plugins/chain/chain.js').length > 0, true, 'chain.js was not loaded');
        assert.equal(served('/plugins/chain/gpo.js').length > 0, true, 'gpo.js was not loaded');
        assert.deepEqual(
            pluginResponses.filter(r => r.status >= 400),
            []
        );
        assert.deepEqual(pageErrors, []);
    });

    test('Policy menu lists Group Policy with Chains and Group Policy Objects', async ctx => {
        if (!ready) return ctx.skip();
        await page.click('li[data-name="policy"] > a');
        assert.equal(await page.isVisible(MENU.group), true, 'Group Policy submenu is not visible under Policy');
        await page.click(`${MENU.group} > a`);
        assert.equal(await page.isVisible(MENU.chains), true, 'Chains entry is not visible');
        assert.equal(await page.isVisible(MENU.gpos), true, 'Group Policy Objects entry is not visible');
        assert.match(await page.getAttribute(`${MENU.chains} a`, 'href'), /#\/e\/chain\/search$/);
        assert.match(await page.getAttribute(`${MENU.gpos} a`, 'href'), /#\/e\/gpo\/search$/);
    });

    test('Group Policy Objects entry opens the GPO search facet with the editor action', async ctx => {
        if (!ready) return ctx.skip();
        await page.click(`${MENU.gpos} a`);
        await page.waitForSelector('.facet-content table', { state: 'visible', timeout: 15000 });
        assert.match(page.url(), /#\/e\/gpo\/search$/);
        // The toolbar renders after the table; "gpui" opens the GPUI editor
        // and its order is set by gpo.js.
        for (const name of ['refresh', 'add', 'gpui', 'remove']) {
            await page.waitForSelector(`.facet-controls button[name="${name}"]`, { state: 'visible', timeout: 15000 });
        }
    });

    test('Chains entry opens the chain search facet', async ctx => {
        if (!ready) return ctx.skip();
        await openGroupPolicyMenu(page);
        await page.click(`${MENU.chains} a`);
        await page.waitForSelector('.facet-content table', { state: 'visible', timeout: 15000 });
        assert.match(page.url(), /#\/e\/chain\/search$/);
    });

    test('the GPUI editor opens from the GPO page and renders the policy tree', async ctx => {
        if (!ready) return ctx.skip();
        const name = 'e2e-editor-' + Date.now();
        ipa('gpo-add', name);
        try {
            await page.goto(`${base}/ipa/ui/#/e/gpo/search`);
            // The fixture was created after the facet loaded its list.
            await page.click('.facet-controls button[name="refresh"]');
            const row = page.locator('.facet-content table tbody tr', { hasText: name });
            await row.waitFor({ timeout: 20000 });
            await row.locator('input[type=checkbox]').check();
            await page.click('.facet-controls button[name="gpui"]');
            await page.waitForSelector('.modal-gpui .gp__container', { timeout: 20000 });
            await page.waitForSelector('.modal-gpui [role=treeitem]', { timeout: 30000 });
            assert.ok((await page.locator('.modal-gpui [role=treeitem]').count()) > 0);
            assert.match(await page.locator('.modal-gpui').innerText(), /Computer/);
            assert.ok(
                pluginResponses.some(r => r.url.endsWith('/plugins/chain/js/app.js') && r.status === 200),
                'bundle js/app.js was not served'
            );
        } finally {
            ipa('gpo-del', name);
        }
    });

    test('navigation raised no page errors', async ctx => {
        if (!ready) return ctx.skip();
        assert.deepEqual(pageErrors, []);
    });
});
