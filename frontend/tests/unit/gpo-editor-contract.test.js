import assert from 'node:assert/strict';
import { beforeEach, test } from 'vitest';
import * as backend from '../../dev/backend.mjs';
import { contracts, differences } from './helpers/contract.js';
import { loadModule } from './helpers/load-module.js';

test('the shape comparison reports missing, extra and mistyped fields (the same cases as in the Python test)', () => {
    const reference = { a: 1, b: { c: 'x' }, d: [{ e: true }], any: null };
    assert.deepEqual(differences({ a: 2, b: { c: 'y' }, d: [{ e: false }, 5], any: [1] }, reference), []);
    assert.deepEqual(differences({ a: '1', b: {}, d: [{ e: 1 }], any: 0, z: 1 }, reference), [
        '$.a: string instead of number',
        '$.b.c: missing',
        '$.d[0].e: number instead of boolean',
        '$.z: not in the contract'
    ]);
    assert.deepEqual(differences({ a: 1, b: { c: '' }, d: [], any: null }, reference), []);
});

test('the contract covers the read methods and the recovery call', () => {
    assert.deepEqual(
        contracts().map(contract => contract.name),
        ['open', 'preference_documents', 'preference_items', 'reconcile', 'script_files', 'scripts_show']
    );
});

beforeEach(() => backend.reset());

for (const contract of contracts()) {
    test(`the mock server of the dev stand answers ${contract.method} with the contract shape`, () => {
        const reply = backend.dispatch({ method: contract.method, params: [contract.args, contract.options], id: 1 });
        assert.equal(reply.error, null);
        assert.deepEqual(differences(reply.result.result, contract.result), []);
    });
}

// The API function that sends each method, with the arguments after the policy name.
const CALLS = {
    open: api => api.open({ refresh: true }),
    preference_documents: api => api.preferenceDocuments(),
    preference_items: api => api.preferenceItems('computer', 'files'),
    reconcile: api => api.reconcile(),
    script_files: api => api.scriptFiles('computer', 'startup'),
    scripts_show: api => api.scriptsShow('computer', 'startup')
};

for (const contract of contracts()) {
    test(`util/API.js hands the ${contract.method} answer to the editor intact`, async () => {
        const sent = [];
        // Opening the editor comes first (it selects the policy); every other call gets the answer under test.
        const opened = contracts().find(other => other.name === 'open');
        const rpc = {
            command(spec) {
                sent.push(spec);
                const answer =
                    spec.method === 'editor_open' && contract.name !== 'open' ? opened.result : contract.result;
                return { execute: () => spec.on_success({ result: { result: answer } }) };
            }
        };
        const api = await loadModule(
            'util/API.js',
            { 'freeipa/ipa': { default: { api_version: '2.0' } }, 'freeipa/rpc': { default: rpc } },
            { navigator: { language: 'en-US', languages: ['en-US'] } }
        );
        await api.initialize('Test GPO');
        sent.length = 0;
        const answer = await CALLS[contract.name](api);
        assert.equal(sent[0].method, contract.method.replace(/^gpo_editor_/, 'editor_'));
        assert.deepEqual(answer, contract.result);
    });
}
