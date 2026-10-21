import { h } from '@gpui/lib/dom';
import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Cell selection, focus and in-place editing. Attaches `cellFor`, `updateSelection`, `showCell`, `finishEdit`,
 * `focusCell`, `editCell`, `selectCell` to the context.
 * @param {any} ctx
 */
export function installCells(ctx) {
    const { state, readOnly, fields, rules, els } = ctx;
    ctx.cellFor = function (id, field) {
        return els.body.querySelector('[data-collection-row="' + id + '"] [data-collection-field="' + field + '"]');
    };
    ctx.updateSelection = function () {
        const activeCell = ctx.activeCell;
        Array.from(els.body.querySelectorAll('[data-collection-row]')).forEach(function (row) {
            const id = row.getAttribute('data-collection-row');
            row.classList.toggle('active', state.selectedId === id);
            row.setAttribute('aria-selected', String(state.selectedId === id));
            const handle = row.querySelector('.gpo-collection-table__handle');
            if (handle) handle.tabIndex = -1;
            /** @type {HTMLElement[]} */ (Array.from(row.querySelectorAll('[data-collection-field]'))).forEach(
                function (cell) {
                    cell.tabIndex =
                        id === activeCell.id && cell.getAttribute('data-collection-field') === activeCell.field
                            ? 0
                            : -1;
                }
            );
        });
        els.table.tabIndex = els.body.querySelector('[data-collection-row]') ? -1 : 0;
        els.remove.disabled = readOnly || ctx.busy() || !state.selectedId;
    };
    ctx.showCell = function (cell, row, field) {
        cell.classList.remove('gpo-collection-cell--editing');
        cell.replaceChildren(h('span', { class: 'gpo-collection-cell__text' }, row[field] || '\u00a0'));
    };
    ctx.finishEdit = function (commit) {
        if (!ctx.editing) return;
        const current = ctx.editing;
        ctx.editing = null;
        if (commit) state.edit(current.id, current.field, current.input.value);
        const row = state.find(current.id);
        if (row) ctx.showCell(current.cell, row, current.field);
        ctx.updateValidation();
    };
    ctx.focusCell = function (id, field) {
        ctx.activeCell = { id: id, field: field };
        ctx.updateSelection();
        const cell = ctx.cellFor(id, field);
        if (cell) {
            cell.focus({ preventScroll: true });
            cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    };
    ctx.selectCell = function (id, field) {
        if (ctx.busy()) return;
        ctx.finishEdit(true);
        state.select(id);
        ctx.focusCell(id, field);
    };
    ctx.editCell = function (id, field) {
        if (readOnly || ctx.drag || ctx.busy()) return;
        ctx.finishEdit(true);
        const cell = ctx.cellFor(id, field);
        const row = state.find(id);
        if (!cell || !row) return;
        ctx.activeCell = { id: id, field: field };
        ctx.updateSelection();
        // In supported bindings, unique list entries without explicit keys
        // are registry names too. Only data cells may contain line breaks.
        const singleLine = field === 'key' || (state.mode === 'list' && rules.unique_keys);
        const attrs = {
            spellcheck: 'false',
            'aria-label': tr('cellLabel', { column: tr(field), index: state.rows.indexOf(row) }),
            'data-collection-input': field
        };
        /** @type {HTMLInputElement} */
        const input = /** @type {any} */ (
            singleLine ? h('input', { type: 'text', ...attrs }) : h('textarea', { rows: '1', ...attrs })
        );
        input.value = row[field];
        cell.replaceChildren(input);
        cell.classList.add('gpo-collection-cell--editing');
        ctx.editing = { id: id, field: field, input: input, cell: cell };
        input.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        input.addEventListener('dblclick', function (event) {
            event.stopPropagation();
        });
        function resizeEditor() {
            if (singleLine) return;
            input.style.height = 'auto';
            input.style.height = Math.min(128, Math.max(28, input.scrollHeight)) + 'px';
        }
        input.addEventListener('input', function () {
            resizeEditor();
            ctx.updateValidation();
        });
        input.addEventListener('blur', function () {
            if (ctx.editing && ctx.editing.input === input) ctx.finishEdit(true);
        });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                ctx.finishEdit(false);
                ctx.focusCell(id, field);
            } else if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                ctx.finishEdit(true);
                ctx.focusCell(id, field);
            } else if (event.key === 'Tab') {
                const visible = state.visible(els.search.value);
                const position =
                    visible.findIndex(function (item) {
                        return item.id === id;
                    }) *
                        fields.length +
                    fields.indexOf(field) +
                    (event.shiftKey ? -1 : 1);
                ctx.finishEdit(true);
                event.preventDefault();
                event.stopPropagation();
                if (position >= 0 && position < visible.length * fields.length) {
                    ctx.editCell(visible[Math.floor(position / fields.length)].id, fields[position % fields.length]);
                } else {
                    const target = event.shiftKey
                        ? !els.search.hidden
                            ? els.search
                            : els.add
                        : ctx.dialog.root.getElement().querySelector('.btn-cancel');
                    target.focus();
                }
            }
        });
        input.focus();
        input.setSelectionRange(0, input.value.length);
        resizeEditor();
        cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        ctx.updateValidation();
    };
}
