import { tr } from '@gpui/components/CollectionEditor/translate';

const DRAG_CLASSES = ['gpo-collection-row--dragging', 'gpo-collection-row--before', 'gpo-collection-row--after'];

/**
 * Reordering: drag-and-drop of rows by their handle (with auto-scroll) and Ctrl+Arrow moves.
 * Attaches `clearDrag`, `focusHandle`, `moveByKeyboard` and `startDrag` to the context.
 * @param {any} ctx
 */
export function installReorder(ctx) {
    const { state, els } = ctx;
    function indexOf(id) {
        return state.rows.findIndex(function (row) {
            return row.id === id;
        });
    }
    ctx.clearDrag = function () {
        if (ctx.scrollFrame !== null) {
            cancelAnimationFrame(ctx.scrollFrame);
            ctx.scrollFrame = null;
        }
        ctx.drag = null;
        Array.from(els.body.querySelectorAll('tr')).forEach(function (row) {
            row.classList.remove(...DRAG_CLASSES);
        });
    };
    ctx.focusHandle = function (id) {
        ctx.activeCell.id = id;
        ctx.updateSelection();
        const row = els.body.querySelector('[data-collection-row="' + id + '"]');
        const handle = row && row.querySelector('.gpo-collection-table__handle');
        if (handle) ctx.focusCell(id, ctx.activeCell.field);
    };
    function autoScroll() {
        if (!ctx.drag) {
            ctx.scrollFrame = null;
            return;
        }
        const rect = els.scroll.getBoundingClientRect();
        if (ctx.drag.y >= rect.top && ctx.drag.y <= rect.bottom) {
            if (ctx.drag.y < rect.top + 28) els.scroll.scrollTop -= 8;
            else if (ctx.drag.y > rect.bottom - 28) els.scroll.scrollTop += 8;
        }
        ctx.scrollFrame = requestAnimationFrame(autoScroll);
    }
    /** Starts dragging `row` (a state row) whose `<tr>` is `record`. */
    ctx.startDrag = function (event, row, record) {
        if (els.search.value) {
            event.preventDefault();
            return;
        }
        ctx.finishEdit(true);
        state.select(row.id);
        ctx.activeCell.id = row.id;
        ctx.updateSelection();
        ctx.drag = { id: row.id, targetId: row.id, after: false, y: event.clientY };
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', row.id);
        record.classList.add('gpo-collection-row--dragging');
        ctx.scrollFrame = requestAnimationFrame(autoScroll);
    };
    /** Ctrl+Arrow on a row handle. */
    ctx.moveByKeyboard = function (event, row) {
        if (
            !ctx.busy() &&
            !els.search.value &&
            event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            (event.key === 'ArrowUp' || event.key === 'ArrowDown')
        ) {
            event.preventDefault();
            event.stopPropagation();
            ctx.finishEdit(true);
            state.move(row.id, state.rows.indexOf(row) + (event.key === 'ArrowUp' ? -1 : 1));
            ctx.render();
            ctx.focusHandle(row.id);
            ctx.announce(tr('moved', { index: state.rows.indexOf(row) }));
        }
    };
    els.scroll.addEventListener('dragover', function (event) {
        if (!ctx.drag) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        ctx.drag.y = event.clientY;
        let target = event.target.closest('[data-collection-row]');
        Array.from(els.body.querySelectorAll('tr')).forEach(function (row) {
            row.classList.remove('gpo-collection-row--before', 'gpo-collection-row--after');
        });
        if (!target) target = els.body.lastElementChild;
        if (!target || !target.hasAttribute('data-collection-row')) return;
        ctx.drag.targetId = target.getAttribute('data-collection-row');
        const rect = target.getBoundingClientRect();
        ctx.drag.after = event.clientY > rect.top + rect.height / 2;
        if (ctx.drag.targetId !== ctx.drag.id)
            target.classList.add(ctx.drag.after ? 'gpo-collection-row--after' : 'gpo-collection-row--before');
    });
    els.scroll.addEventListener('drop', function (event) {
        const drag = ctx.drag;
        if (!drag) return;
        event.preventDefault();
        event.stopPropagation();
        const from = indexOf(drag.id);
        let to = indexOf(drag.targetId) + (drag.after ? 1 : 0);
        if (from < to) to -= 1;
        const id = drag.id;
        state.move(id, to);
        ctx.clearDrag();
        ctx.render();
        ctx.focusHandle(id);
        ctx.announce(tr('moved', { index: indexOf(id) }));
    });
}
