'use strict';

const assert = require('node:assert/strict');
const https = require('node:https');
const test = require('node:test');

let chromium;
try {
    chromium = require('playwright').chromium;
} catch (_) { /* Optional browser dependency in unit-only environments. */ }

// Live check against a real FreeIPA server with the plugin installed, such as
// the dev container (.devcontainer/). Everything else in tests/ui mocks FreeIPA;
// this is the only test that proves the plugin is actually wired into the
// application: modules served, menu entries registered, facets rendered.
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

function reachable() {
    return new Promise(resolve => {
        const request = https.get(`${base}/ipa/ui/`, { rejectUnauthorized: false, timeout: 5000 },
            response => { response.resume(); resolve(response.statusCode === 200); });
        request.on('timeout', () => { request.destroy(); resolve(false); });
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
        throw new Error(loggedIn
            ? 'Logged in, but the Group Policy menu was not added under Policy: check that chain.js loads and '
                + 'that "policy" exists in the menu (plugin/ui/grouppolicy/chain.js add_menu_items).'
            : `Could not log in to ${base} as ${username}: check IPA_ADMIN_USER and IPA_ADMIN_PASSWORD.`,
        { cause: error });
    }
}

test('GPO plugin is wired into the live FreeIPA Web UI', async t => {
    if (!chromium) return t.skip('Set NODE_PATH to a playwright installation for live checks.');
    if (!await reachable()) return t.skip(`FreeIPA at ${base} is not reachable; start the dev container or set IPA_URL.`);

    const browser = await chromium.launch();
    t.after(() => browser.close());
    // Fixed locale: labels differ per language, so assertions use data-name.
    const context = await browser.newContext({ ignoreHTTPSErrors: true, locale: 'en-US', viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();
    const pluginResponses = [];
    const pageErrors = [];
    page.on('response', response => {
        if (response.url().includes('/ipa/ui/js/plugins/chain/')) {
            pluginResponses.push({ url: response.url().split('?')[0], status: response.status() });
        }
    });
    page.on('pageerror', error => pageErrors.push(String(error)));

    await login(page);

    await t.test('plugin modules are served without errors', () => {
        const served = url => pluginResponses.filter(r => r.url.endsWith(url) && r.status === 200);
        assert.equal(served('/plugins/chain/chain.js').length > 0, true, 'chain.js was not loaded');
        assert.equal(served('/plugins/chain/gpo.js').length > 0, true, 'gpo.js was not loaded');
        assert.deepEqual(pluginResponses.filter(r => r.status >= 400), []);
        assert.deepEqual(pageErrors, []);
    });

    await t.test('Policy menu lists Group Policy with Chains and Group Policy Objects', async () => {
        await page.click('li[data-name="policy"] > a');
        assert.equal(await page.isVisible(MENU.group), true, 'Group Policy submenu is not visible under Policy');
        await page.click(`${MENU.group} > a`);
        assert.equal(await page.isVisible(MENU.chains), true, 'Chains entry is not visible');
        assert.equal(await page.isVisible(MENU.gpos), true, 'Group Policy Objects entry is not visible');
        assert.match(await page.getAttribute(`${MENU.chains} a`, 'href'), /#\/e\/chain\/search$/);
        assert.match(await page.getAttribute(`${MENU.gpos} a`, 'href'), /#\/e\/gpo\/search$/);
    });

    await t.test('Group Policy Objects entry opens the GPO search facet with the editor action', async () => {
        await page.click(`${MENU.gpos} a`);
        await page.waitForSelector('.facet-content table', { state: 'visible', timeout: 15000 });
        assert.match(page.url(), /#\/e\/gpo\/search$/);
        // The toolbar renders after the table; "gpui" opens the GPUI editor
        // and its order is set by gpo.js.
        for (const name of ['refresh', 'add', 'gpui', 'remove']) {
            await page.waitForSelector(`.facet-controls button[name="${name}"]`,
                { state: 'visible', timeout: 15000 });
        }
    });

    await t.test('Chains entry opens the chain search facet', async () => {
        await openGroupPolicyMenu(page);
        await page.click(`${MENU.chains} a`);
        await page.waitForSelector('.facet-content table', { state: 'visible', timeout: 15000 });
        assert.match(page.url(), /#\/e\/chain\/search$/);
    });

    await t.test('navigation raised no page errors', () => {
        assert.deepEqual(pageErrors, []);
    });
});
