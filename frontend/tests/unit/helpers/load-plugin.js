// Loads one of the hand-written FreeIPA plugin pages (public/chain.js, public/gpo.js: AMD modules that depend on
// FreeIPA's own `freeipa/*` modules) with the dependencies replaced by doubles, and returns what the module exports.
//
// Globals it stubs are removed by `vi.unstubAllGlobals()` (call it in afterEach).
//
//   const chain = loadPlugin('chain.js', { 'freeipa/rpc': { command } });   // missing ids get an inert default
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vi } from 'vitest';
import * as translations from '@gpui/locales/translations';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public');

/** FreeIPA's UI classes reduced to what the pages use: they return the spec as the object to extend. */
export function createIpaDouble() {
    return {
        api_version: '2.254',
        action: vi.fn(spec => ({ ...spec })),
        facet_policy: vi.fn(spec => ({ ...spec })),
        formatter: vi.fn(spec => ({ ...spec })),
        notify: vi.fn(),
        notify_success: vi.fn()
    };
}

/** An rpc double that records every command; `executed` holds the specs passed to `execute()`. */
export function createRpcDouble() {
    const executed = [];
    return {
        executed,
        command: vi.fn(spec => ({
            execute() {
                executed.push(spec);
            }
        }))
    };
}

export function loadPlugin(file, stubs = {}) {
    // gpo.js links its stylesheet and reads the browser language when it is loaded.
    if (typeof document === 'undefined')
        vi.stubGlobal('document', { createElement: () => ({}), head: { appendChild() {} } });
    if (typeof navigator === 'undefined') vi.stubGlobal('navigator', { language: 'en-US' });
    const ipa = stubs['freeipa/ipa'] || createIpaDouble();
    const defaults = {
        require: () => {},
        'freeipa/ipa': ipa,
        'freeipa/phases': { on: vi.fn() },
        'freeipa/reg': {
            entity: { register: vi.fn() },
            action: { register: vi.fn() },
            formatter: { register: vi.fn() }
        },
        'freeipa/navigation': {},
        'freeipa/menu': { query: vi.fn(() => []), add_item: vi.fn() },
        'freeipa/rpc': createRpcDouble(),
        'freeipa/jquery': {},
        'freeipa/text': {},
        // chain.js builds on gpo.js (its order_control_buttons); gpo.js itself needs nothing from chain.js.
        './gpo': file === 'gpo.js' ? {} : loadPlugin('gpo.js', { 'freeipa/ipa': ipa }).exports,
        './js/app': { translations, editorDialog: { open: vi.fn() }, init: vi.fn() }
    };
    const doubles = { ...defaults, ...stubs, 'freeipa/ipa': ipa };
    let exported;
    const define = (deps, factory) => {
        exported = factory(
            ...deps.map(id => {
                if (!(id in doubles)) throw new Error('no double for the dependency ' + id);
                return doubles[id];
            })
        );
    };
    new Function('define', fs.readFileSync(path.join(publicDir, file), 'utf8'))(define);
    return { exports: exported, doubles };
}
