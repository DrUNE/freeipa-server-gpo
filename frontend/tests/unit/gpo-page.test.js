import assert from 'node:assert/strict';
import { afterEach, beforeEach, test, vi } from 'vitest';
import { t } from '@gpui/locales/translations';
import { loadPlugin } from './helpers/load-plugin.js';

let gpo;
let ipa;
let navigation;

beforeEach(() => {
    navigation = { show_entity: vi.fn() };
    const loaded = loadPlugin('gpo.js', { 'freeipa/navigation': navigation });
    gpo = loaded.exports;
    ipa = loaded.doubles['freeipa/ipa'];
});
afterEach(() => vi.unstubAllGlobals());

test('the entity and its actions are registered in the registration phase', () => {
    const { doubles } = loadPlugin('gpo.js');
    assert.equal(doubles['freeipa/phases'].on.mock.calls[0][0], 'registration');
    const [, register] = doubles['freeipa/phases'].on.mock.calls[0];
    register();
    assert.deepEqual(
        doubles['freeipa/reg'].action.register.mock.calls.map(call => call[0]),
        ['gpo_save', 'gpui']
    );
    assert.equal(doubles['freeipa/reg'].entity.register.mock.calls[0][0].type, 'gpo');
});

test('order_control_buttons sorts the listed buttons first and keeps the others last in their order', () => {
    const names = ['x', 'save', 'y', 'refresh'].map(name => ({ name }));
    const spec = gpo.order_control_buttons(['refresh', 'save'])({ control_buttons: names });
    assert.deepEqual(
        spec.control_buttons.map(button => button.name),
        ['refresh', 'save', 'x', 'y']
    );
});

test('pattern_error_policy replaces the server message of the listed fields that have a pattern', () => {
    const patterned = { metadata: { pattern: '^a', pattern_errmsg: 'server text' } };
    const plain = { metadata: { pattern_errmsg: 'kept' } };
    const policy = gpo.pattern_error_policy({ fields: ['one', 'two', 'missing'], message: 'localized' });
    policy.container = { fields: { get_field: name => ({ one: patterned, two: plain })[name] } };
    policy.post_create();
    assert.equal(patterned.metadata.pattern_errmsg, 'localized');
    assert.equal(plain.metadata.pattern_errmsg, 'kept');
    // A facet that is not created yet is ignored.
    policy.container = null;
    policy.post_load();
});

function detailsFacet({ dirty, editable = true, values = ['New'], pkey = 'Old', valid = true } = {}) {
    const command = { set_option: vi.fn(), execute: vi.fn() };
    const facet = {
        entity: { name: 'gpo' },
        name: 'details',
        validate: () => valid,
        show_validation_error: vi.fn(),
        get_field: () => ({ dirty, is_editable: () => editable, get_widget_values: () => values }),
        get_pkey: () => pkey,
        create_update_command: vi.fn(() => command),
        set_pkeys: vi.fn(),
        load: vi.fn(),
        on_update: { notify: vi.fn() },
        update: vi.fn()
    };
    return { facet, command };
}

test('save_action stops at validation errors', () => {
    const { facet } = detailsFacet({ valid: false });
    gpo.save_action().execute_action(facet);
    assert.equal(facet.show_validation_error.mock.calls.length, 1);
    assert.equal(facet.update.mock.calls.length, 0);
    assert.equal(facet.create_update_command.mock.calls.length, 0);
});

test('save_action renames through the update command and moves the page to the new key', () => {
    const { facet, command } = detailsFacet({ dirty: true, values: ['  New name '] });
    const onSuccess = vi.fn();
    gpo.save_action().execute_action(facet, onSuccess);
    assert.deepEqual(command.set_option.mock.calls[0], ['rename', 'New name']);
    assert.equal(command.execute.mock.calls.length, 1);
    command.on_success({ result: 1 });
    assert.deepEqual(facet.set_pkeys.mock.calls[0], [['New name']]);
    assert.deepEqual(facet.load.mock.calls[0], [{ result: 1 }]);
    assert.deepEqual(ipa.notify_success.mock.calls[0], [
        t('gpo.renamedSuccessfully').replace('%s', 'Old').replace('%s', 'New name')
    ]);
    assert.deepEqual(navigation.show_entity.mock.calls[0], ['gpo', 'details', ['New name']]);
    assert.deepEqual(onSuccess.mock.calls[0], [{ result: 1 }]);
    command.on_error({}, 'error', { message: 'exists' });
    assert.deepEqual(ipa.notify.mock.calls[0], [t('gpo.updateFailed') + ': exists', 'error']);
});

for (const [title, options] of [
    ['the name is unchanged', { dirty: true, values: ['Old'] }],
    ['the name is empty', { dirty: true, values: ['  '] }],
    ['the name field is not dirty', { dirty: false }],
    ['the name field is read-only', { dirty: true, editable: false }]
]) {
    test(`save_action does a regular update when ${title}`, () => {
        const { facet } = detailsFacet(options);
        const onSuccess = vi.fn();
        const onError = vi.fn();
        gpo.save_action().execute_action(facet, onSuccess, onError);
        assert.deepEqual(facet.update.mock.calls[0], [onSuccess, onError]);
        assert.equal(facet.create_update_command.mock.calls.length, 0);
    });
}
