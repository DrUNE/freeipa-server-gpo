import { neighbor } from '@gpui/components/list-navigation';
import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Toolbar actions: add, remove the selected row, search. Attaches `removeSelected` to the context.
 * @param {any} ctx
 */
export function installToolbar(ctx) {
    const { state, readOnly, fields, els } = ctx;
    els.add.addEventListener('click', function () {
        if (readOnly || ctx.busy()) return;
        ctx.finishEdit(true);
        els.search.value = '';
        const id = state.add();
        ctx.activeCell = { id: id, field: fields[0] };
        ctx.render();
        ctx.editCell(id, fields[0]);
        ctx.announce(tr('added'));
    });
    ctx.removeSelected = function () {
        if (readOnly || ctx.busy() || !state.selectedId) return;
        ctx.finishEdit(true);
        const before = Array.from(els.body.querySelectorAll('[data-collection-row]')).map(function (row) {
            return row.getAttribute('data-collection-row');
        });
        const removedId = state.selectedId;
        if (!state.removeSelected()) return;
        const after = state.visible(els.search.value).map(function (row) {
            return row.id;
        });
        const nextId = neighbor(before, [removedId], after);
        state.select(nextId);
        ctx.activeCell.id = nextId;
        ctx.render();
        if (nextId) ctx.focusCell(nextId, ctx.activeCell.field);
        else els.table.focus({ preventScroll: true });
        ctx.announce(tr('removed'));
    };
    els.remove.addEventListener('click', ctx.removeSelected);
    els.search.addEventListener('input', function () {
        ctx.finishEdit(true);
        state.select(null);
        ctx.render();
    });
}
