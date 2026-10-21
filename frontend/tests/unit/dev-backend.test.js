import assert from 'node:assert/strict';
import { beforeEach, test } from 'vitest';
import * as backend from '../../dev/backend.mjs';

beforeEach(() => backend.reset());

const call = (method, params, scenario) =>
    backend.dispatch({ method, params: params || [['Dev GPO', 'computer'], {}], id: 1 }, scenario);

test('the normal scenario answers from the fixtures', () => {
    const reply = call('gpo_editor_open', [['Dev GPO'], {}]);
    assert.equal(reply.error, null);
    assert.ok(reply.result.result.preference_documents.length > 0);
});

test('the error scenario fails every editor call, known or not, as an unavailable server', () => {
    for (const method of [
        'gpo_editor_open',
        'gpo_editor_children',
        'gpo_editor_preference_items',
        'gpo_editor_reconcile'
    ]) {
        const reply = call(method, [['Dev GPO', 'computer', 'files'], {}], 'error');
        assert.equal(reply.result, null, method);
        assert.equal(reply.error.name, 'ServerUnavailable', method);
        assert.equal(reply.error.data.category, 'unavailable', method);
    }
});

test('the empty scenario empties the lists and leaves the rest of the answer', () => {
    const normal = call('gpo_editor_preference_items', [['Dev GPO', 'computer', 'files'], {}]);
    assert.ok(normal.result.result.items.length > 0);
    const empty = call('gpo_editor_preference_items', [['Dev GPO', 'computer', 'files'], {}], 'empty');
    assert.deepEqual(empty.result.result.items, []);
    assert.equal(empty.result.result.gpo.displayname, 'Dev GPO');

    const documents = call('gpo_editor_open', [['Dev GPO'], {}], 'empty');
    assert.deepEqual(documents.result.result.preference_documents, []);
    const files = call('gpo_editor_script_files', [['Dev GPO', 'computer', 'startup'], {}], 'empty');
    assert.deepEqual(files.result.result.scripts.assets, []);
});

test('the scenario never changes the fixtures themselves', () => {
    call('gpo_editor_preference_items', [['Dev GPO', 'computer', 'files'], {}], 'empty');
    const again = call('gpo_editor_preference_items', [['Dev GPO', 'computer', 'files'], {}]);
    assert.ok(again.result.result.items.length > 0);
});

test('the scenario list names what the stand offers', () => {
    assert.deepEqual(backend.SCENARIOS, ['normal', 'error', 'slow', 'empty']);
});
