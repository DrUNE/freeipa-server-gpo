// Loads a fresh instance of a module from src/ with its dependencies replaced,
// for tests that need a different set of doubles (or globals) per test.
//
//   const api = await loadModule('util/API.js', {
//       'freeipa/ipa': { default: IPA },        // bare ids are mocked as given
//       '@gpui/locales/translations': { getLanguage: () => 'en' }   // src-relative alias (relative ids work too)
//   }, { navigator: { language: 'en-US' } });  // globals, removed after each test
//
// Modules whose doubles are the same for the whole file should use vi.mock instead.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, vi } from 'vitest';

const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../src');
let mocked = [];

// FreeIPA's own modules do not exist outside the Web UI; unless a test supplies its own, they are inert.
const inertFreeipa = {
    'freeipa/ipa': { default: { api_version: '2.0', notify() {}, notify_success() {} } },
    'freeipa/rpc': {
        default: {
            command() {
                return { execute() {} };
            }
        }
    }
};

afterEach(() => {
    vi.unstubAllGlobals();
    for (const id of mocked) vi.doUnmock(id);
    mocked = [];
});

export async function loadModule(file, mocks = {}, globals = {}) {
    const absolute = path.join(srcRoot, file);
    vi.resetModules();
    for (const [id, implementation] of Object.entries({ ...inertFreeipa, ...mocks })) {
        const target = id.startsWith('@gpui/')
            ? path.join(srcRoot, id.slice('@gpui/'.length)) + '.js'
            : id.startsWith('.')
              ? path.resolve(path.dirname(absolute), id) + '.js'
              : id;
        vi.doMock(target, () => implementation);
        mocked.push(target);
    }
    for (const [name, value] of Object.entries(globals)) vi.stubGlobal(name, value);
    return import(/* @vite-ignore */ absolute);
}
