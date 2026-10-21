import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { st, button } from '@gpui/components/templates/script/helpers';

/**
 * The order block of the event page: the draft order of the entries and its save.
 * @param {any} context the editor's state and operations
 */
function createOrderPanel({ mutate, scope, state }) {
    function renderOrder() {
        const select = createElement('select', {
            children: [
                createElement('option', { attrs: { value: 'unspecified' }, text: st('orderUnspecified') }),
                createElement('option', { attrs: { value: 'classic_first' }, text: st('orderClassicFirst') }),
                createElement('option', { attrs: { value: 'powershell_first' }, text: st('orderPowershellFirst') })
            ]
        });
        select.getElement().value = state.orderDraft || state.view.execution_order || 'unspecified';
        const canApply =
            !state.busy && Boolean(state.view.powershell.editable) && state.orderDraft !== state.view.execution_order;
        const apply = button(
            st('applyOrder'),
            function () {
                void saveOrderDraft();
            },
            !canApply
        );
        select.on('change', function () {
            state.orderDraft = select.getElement().value;
            const available =
                !state.busy && state.view.powershell.editable && state.orderDraft !== state.view.execution_order;
            apply.getElement().disabled = !available;
            apply.getElement().classList.toggle('active', available);
        });
        select.getElement().disabled = state.busy || !state.view.powershell.editable;
        return createElement('div', {
            className: 'gpo-editor-scripts__order',
            children: [createElement('label', { text: st('psOrderLabel') }), select, apply]
        });
    }

    function saveOrderDraft() {
        if (
            !state.view ||
            state.busy ||
            !state.view.powershell.editable ||
            state.orderDraft === state.view.execution_order
        )
            return Promise.resolve(true);
        const snapshot = state.view.powershell.snapshot;
        const order = state.orderDraft;
        return mutate(function () {
            return API.scriptOrderUpdate(scope, state.event, {
                snapshot: snapshot,
                execution_order: order
            });
        });
    }

    return { renderOrder, saveOrderDraft };
}

export { createOrderPanel };
