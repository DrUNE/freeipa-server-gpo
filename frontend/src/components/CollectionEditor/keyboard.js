import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Keyboard navigation of the table (arrows, Home/End, PageUp/PageDown, Space, Enter/F2, Delete, Ctrl+Arrow,
 * Escape during a drag) and focus tracking.
 * @param {any} ctx
 */
export function installKeyboard(ctx) {
    const { state, readOnly, els } = ctx;
    function rowIndex(id) {
        return state.rows.findIndex(function (row) {
            return row.id === id;
        });
    }
    els.table.addEventListener('focusin', function (event) {
        if (
            ctx.busy() ||
            event.target.closest('input,select,textarea,button,a,[contenteditable]:not([contenteditable="false"])')
        )
            return;
        const cell = event.target.closest('[data-collection-field]');
        if (!cell) return;
        ctx.activeCell = {
            id: cell.parentElement.getAttribute('data-collection-row'),
            field: cell.getAttribute('data-collection-field')
        };
        state.select(ctx.activeCell.id);
        ctx.updateSelection();
    });
    function moveActiveRow(event) {
        event.preventDefault();
        event.stopPropagation();
        ctx.finishEdit(true);
        state.select(ctx.activeCell.id);
        state.move(ctx.activeCell.id, rowIndex(ctx.activeCell.id) + (event.key === 'ArrowUp' ? -1 : 1));
        ctx.render();
        ctx.focusCell(ctx.activeCell.id, ctx.activeCell.field);
        ctx.announce(tr('moved', { index: rowIndex(ctx.activeCell.id) }));
    }
    function moveActiveCell(event, visible, index) {
        event.preventDefault();
        const row = els.body.querySelector('[data-collection-row="' + ctx.activeCell.id + '"]');
        const pageSize = Math.max(
            1,
            Math.floor(els.scroll.clientHeight / Math.max(1, row.getBoundingClientRect().height)) - 1
        );
        let position = index;
        if (event.key === 'Home') position = 0;
        else if (event.key === 'End') position = visible.length - 1;
        else
            position +=
                (event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1) *
                (event.key === 'PageUp' || event.key === 'PageDown' ? pageSize : 1);
        const next = visible[Math.max(0, Math.min(visible.length - 1, position))];
        ctx.selectCell(next.id, ctx.activeCell.field);
    }
    els.content.addEventListener('keydown', function (event) {
        if (
            event.defaultPrevented ||
            ctx.busy() ||
            !els.table.contains(event.target) ||
            event.target.closest(
                'input,select,textarea,button,a,summary,[contenteditable]:not([contenteditable="false"])'
            )
        )
            return;
        if (ctx.drag && event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            ctx.clearDrag();
            return;
        }
        if (
            event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            !readOnly &&
            !els.search.value &&
            (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
            ctx.activeCell.id
        ) {
            moveActiveRow(event);
            return;
        }
        if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
        if (event.key === 'Delete' && !readOnly) {
            event.preventDefault();
            ctx.removeSelected();
            return;
        }
        if (
            (event.key === 'Enter' || event.key === 'F2') &&
            ctx.activeCell.id &&
            !readOnly &&
            !event.target.matches('button')
        ) {
            event.preventDefault();
            ctx.editCell(ctx.activeCell.id, ctx.activeCell.field);
            return;
        }
        const visible = state.visible(els.search.value);
        const index = visible.findIndex(function (row) {
            return row.id === ctx.activeCell.id;
        });
        if (index < 0) return;
        if (event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            ctx.selectCell(ctx.activeCell.id, ctx.activeCell.field);
        } else if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].indexOf(event.key) !== -1) {
            moveActiveCell(event, visible, index);
        } else if (state.mode === 'key_value' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            ctx.selectCell(ctx.activeCell.id, event.key === 'ArrowLeft' ? 'key' : 'value');
        }
    });
}
