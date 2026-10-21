import assert from 'node:assert/strict';
import { afterEach, beforeEach, test, vi } from 'vitest';
import { t } from '@gpui/locales/translations';
import { createRpcDouble, loadPlugin } from './helpers/load-plugin.js';

let rpc;
let chain;
let ipa;
let phases;
let reg;
let menu;

beforeEach(() => {
    rpc = createRpcDouble();
    const loaded = loadPlugin('chain.js', { 'freeipa/rpc': rpc });
    chain = loaded.exports;
    ipa = loaded.doubles['freeipa/ipa'];
    phases = loaded.doubles['freeipa/phases'];
    reg = loaded.doubles['freeipa/reg'];
    menu = loaded.doubles['freeipa/menu'];
});
afterEach(() => vi.unstubAllGlobals());

const facet = selected => ({ get_selected_values: () => selected, refresh: vi.fn() });

test('the page registers its actions, formatter and entity in the registration phase and its menu in the profile phase', () => {
    assert.deepEqual(
        phases.on.mock.calls.map(call => [call[0], call[2]]),
        [
            ['registration', undefined],
            ['profile', 20]
        ]
    );
    chain.register();
    assert.deepEqual(
        reg.action.register.mock.calls.map(call => call[0]),
        ['enable', 'disable', 'move_up', 'move_down', 'move_gpc_up', 'move_gpc_down']
    );
    assert.equal(reg.formatter.register.mock.calls[0][0], 'boolean_status_formatter');
    assert.equal(reg.entity.register.mock.calls[0][0].type, 'chain');
});

test('the menu entry is added only under an existing Policy menu', () => {
    menu.query.mockReturnValue([]);
    chain.add_menu_items();
    assert.equal(menu.add_item.mock.calls.length, 0);
    menu.query.mockReturnValue([{}]);
    chain.add_menu_items();
    assert.deepEqual(menu.add_item.mock.calls[0], [chain.grouppolicy_menu_spec, 'policy']);
    assert.deepEqual(
        chain.grouppolicy_menu_spec.children.map(child => child.entity),
        ['chain', 'gpo']
    );
});

for (const [name, method, selectMessage, done, failed] of [
    ['enable_action', 'enable', 'chain.selectOneChainEnable', 'chain.enabledSuccessfully', 'chain.enableFailed'],
    ['disable_action', 'disable', 'chain.selectOneChainDisable', 'chain.disabledSuccessfully', 'chain.disableFailed']
]) {
    test(`${name} needs exactly one selected chain`, () => {
        const action = chain[name]();
        action.execute_action(facet([]));
        action.execute_action(facet(['a', 'b']));
        assert.equal(rpc.executed.length, 0);
        assert.deepEqual(ipa.notify.mock.calls, [
            [t(selectMessage), 'error'],
            [t(selectMessage), 'error']
        ]);
    });

    test(`${name} sends one ${method} command and reports the result`, () => {
        const action = chain[name]();
        const target = facet(['web']);
        const onSuccess = vi.fn();
        const onError = vi.fn();
        action.execute_action(target, onSuccess, onError);
        const [command] = rpc.executed;
        assert.equal(command.entity, 'chain');
        assert.equal(command.method, method);
        assert.deepEqual(command.args, ['web']);
        assert.equal(command.options.version, ipa.api_version);

        command.on_success({ ok: true });
        assert.equal(target.refresh.mock.calls.length, 1);
        assert.deepEqual(ipa.notify_success.mock.calls[0], [t(done).replace('%s', 'web')]);
        assert.deepEqual(onSuccess.mock.calls[0], [{ ok: true }]);

        command.on_error({}, 'error', { message: 'denied' });
        assert.deepEqual(ipa.notify.mock.calls.at(-1), [t(failed) + ': denied', 'error']);
        assert.equal(onError.mock.calls.length, 1);
        // The row is not refreshed after a failure.
        assert.equal(target.refresh.mock.calls.length, 1);
    });
}

for (const [name, option, done] of [
    ['move_up_action', 'moveup_chain', 'chain.movedUpSuccessfully'],
    ['move_down_action', 'movedown_chain', 'chain.movedDownSuccessfully']
]) {
    test(`${name} sends the move of the selected chain through the master object`, () => {
        const action = chain[name]();
        const target = facet(['web']);
        action.execute_action(target);
        const [command] = rpc.executed;
        assert.equal(command.entity, 'gpmaster');
        assert.equal(command.method, 'mod');
        assert.equal(command.options[option], 'web');
        command.on_success({});
        assert.deepEqual(ipa.notify_success.mock.calls[0], [t(done)]);
        assert.equal(target.refresh.mock.calls.length, 1);
    });
}

for (const [name, option, done, notFound] of [
    ['move_gpc_up_action', 'moveup_gpc', 'chain.gpcMovedUp', 'chain.unableToDetermineChainUp'],
    ['move_gpc_down_action', 'movedown_gpc', 'chain.gpcMovedDown', 'chain.unableToDetermineChainDown']
]) {
    test(`${name} takes the chain from the page address`, () => {
        vi.stubGlobal('window', { location: { hash: '#/e/chain/gpo/web' } });
        chain[name]().execute_action(facet(['policy-1']));
        const [command] = rpc.executed;
        assert.equal(command.entity, 'chain');
        assert.equal(command.method, 'mod');
        assert.deepEqual(command.args, ['web']);
        assert.deepEqual(command.options[option], ['policy-1']);
        command.on_success({});
        assert.deepEqual(ipa.notify_success.mock.calls[0], [t(done).replace('%s', 'policy-1')]);
    });

    test(`${name} refuses to act when the page address names no chain`, () => {
        vi.stubGlobal('window', { location: { hash: '#/e/gpo/search' } });
        chain[name]().execute_action(facet(['policy-1']));
        assert.equal(rpc.executed.length, 0);
        assert.deepEqual(ipa.notify.mock.calls[0], [t(notFound), 'error']);
    });
}

test('the status formatter maps booleans, flag strings and lists to the localized status', () => {
    const { format } = chain.boolean_status_formatter();
    assert.equal(format(true), t('chain.statusActive'));
    assert.equal(format(false), t('chain.statusInactive'));
    assert.equal(format('TRUE'), t('chain.statusActive'));
    assert.equal(format('no'), t('chain.statusInactive'));
    assert.equal(format(['1']), t('chain.statusActive'));
    for (const unknown of [null, undefined, 'maybe', [], 3]) assert.equal(format(unknown), t('chain.statusUnknown'));
});
