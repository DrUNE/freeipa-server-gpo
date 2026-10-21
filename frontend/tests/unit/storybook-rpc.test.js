import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import rpc, { useScenario } from '../../.storybook/shims/rpc.js';

afterEach(() => {
    useScenario('normal');
    vi.useRealTimers();
});

/** Runs one command of the fake `freeipa/rpc` and returns how it ended. */
function run(method, args = [], options = {}) {
    return new Promise(resolve => {
        rpc.command({
            entity: 'gpo',
            method,
            args,
            options,
            on_success: (data, status) => resolve({ ok: true, data, status }),
            on_error: (xhr, status, error) => resolve({ ok: false, error, status, xhr })
        }).execute();
    });
}

test('a command is answered by the mock server of the dev stand, in the shape of a FreeIPA answer', async () => {
    const answer = await run('editor_open', ['Dev GPO']);
    assert.equal(answer.ok, true);
    assert.equal(answer.data.error, null);
    assert.equal(answer.data.result.result.gpo.displayname, 'Dev GPO');
});

test('the error scenario fails the editor calls like an unavailable server', async () => {
    useScenario('error');
    const answer = await run('editor_open', ['Dev GPO']);
    assert.equal(answer.ok, false);
    assert.equal(answer.error.name, 'ServerUnavailable');
    assert.equal(answer.xhr.responseJSON.error.name, 'ServerUnavailable');
});

test('the empty scenario empties the lists', async () => {
    useScenario('empty');
    const answer = await run('editor_preference_documents', ['Dev GPO']);
    assert.deepEqual(answer.data.result.result.documents, []);
});

test('the slow scenario delays the answer; the normal one does not', async () => {
    vi.useFakeTimers();
    useScenario('slow');
    let done = false;
    run('editor_open', ['Dev GPO']).then(() => (done = true));
    await vi.advanceTimersByTimeAsync(100);
    assert.equal(done, false);
    await vi.advanceTimersByTimeAsync(400);
    assert.equal(done, true);
});

test('choosing a scenario starts from fresh fixtures', async () => {
    await run('editor_preference_delete', ['Dev GPO', 'computer', 'files'], {
        request: { identity: ['files', 'opaque-0'] }
    });
    const afterDelete = await run('editor_preference_items', ['Dev GPO', 'computer', 'files']);
    assert.equal(afterDelete.data.result.result.items.length, 1);
    useScenario('normal');
    const fresh = await run('editor_preference_items', ['Dev GPO', 'computer', 'files']);
    assert.equal(fresh.data.result.result.items.length, 2);
});

test('an unknown scenario is refused', () => {
    assert.throws(() => useScenario('fast'), /Unknown RPC scenario/);
});
