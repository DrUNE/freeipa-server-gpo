import assert from 'node:assert/strict';
import { beforeEach, test } from 'vitest';
import * as backend from '../../dev/backend.mjs';

/*
 * Covers the scenario switch of the dev stand mock server (dev/backend.mjs), which also feeds Storybook.
 * The backend is used in-process: `call` builds a JSON-RPC request and runs it through backend.dispatch with an
 * optional scenario; the state is reset before each test so the tests do not leak mutations into one another.
 */
beforeEach(() => backend.reset());

// Default params open the "Dev GPO" computer policy; tests pass their own params when the method needs a category.
const call = (method, params, scenario) =>
    backend.dispatch({ method, params: params || [['Dev GPO', 'computer'], {}], id: 1 }, scenario);

// Baseline: without a scenario the mock serves non-empty fixture data, so the other scenarios have something to differ from.
test('the normal scenario answers from the fixtures', () => {
    const reply = call('gpo_editor_open', [['Dev GPO'], {}]);
    assert.equal(reply.error, null);
    assert.ok(reply.result.result.preference_documents.length > 0);
});

// The stories rely on `error` to show the unavailable-server state for any command, not only for the ones the mock implements.
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

// `empty` must only blank the lists (items, documents, script assets); the surrounding answer stays valid for the UI.
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

// Guards against the empty scenario emptying the shared fixture in place, which would break every later `normal` call.
test('the scenario never changes the fixtures themselves', () => {
    call('gpo_editor_preference_items', [['Dev GPO', 'computer', 'files'], {}], 'empty');
    const again = call('gpo_editor_preference_items', [['Dev GPO', 'computer', 'files'], {}]);
    assert.ok(again.result.result.items.length > 0);
});

// The Scenario toolbar switch and the stand read this list; a renamed or dropped scenario must be a conscious change.
test('the scenario list names what the stand offers', () => {
    assert.deepEqual(backend.SCENARIOS, ['normal', 'error', 'slow', 'empty']);
});
