import { h, cx } from '@gpui/lib/dom';
import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Renders the visible rows into the table body. Attaches `render` to the context.
 * Public hooks: `[data-collection-row]`, `[data-collection-field]`.
 * @param {any} ctx
 */
export function installTable(ctx) {
    const { state, readOnly, fields, prefix, els } = ctx;

    function createHandle(row, record) {
        const searching = Boolean(els.search.value);
        const handle = h(
            'button',
            {
                class: 'gpo-collection-table__handle',
                type: 'button',
                draggable: searching ? 'false' : 'true',
                'aria-label': tr('reorderRow', { index: state.rows.indexOf(row) }),
                'aria-describedby': prefix + '-reorder-help',
                tabindex: '-1',
                title: tr(searching ? 'clearSearchToReorder' : 'reorderHelp')
            },
            '⋮'
        );
        handle.disabled = searching;
        handle.addEventListener('click', function () {
            ctx.finishEdit(true);
            state.select(row.id);
            ctx.activeCell.id = row.id;
            ctx.updateSelection();
        });
        handle.addEventListener('dragstart', function (event) {
            ctx.startDrag(event, row, record);
        });
        handle.addEventListener('dragend', ctx.clearDrag);
        handle.addEventListener('keydown', function (event) {
            ctx.moveByKeyboard(event, row);
        });
        return handle;
    }

    function createCell(row, field) {
        const cell = h('td', {
            class: cx('gpo-collection-cell', 'field__element'),
            'data-collection-field': field,
            tabindex: '-1'
        });
        ctx.showCell(cell, row, field);
        cell.addEventListener('click', function () {
            ctx.selectCell(row.id, field);
        });
        cell.addEventListener('dblclick', function (event) {
            event.preventDefault();
            ctx.editCell(row.id, field);
        });
        return cell;
    }

    function createRecord(row) {
        const index = state.rows.indexOf(row);
        const record = h('tr', { 'data-collection-row': row.id });
        if (!readOnly)
            record.append(h('td', { class: 'gpo-collection-table__handle-cell' }, createHandle(row, record)));
        if (state.mode === 'list') record.append(h('td', { class: 'gpo-collection-table__index' }, String(index)));
        fields.forEach(function (field) {
            record.append(createCell(row, field));
        });
        record.addEventListener('click', function (event) {
            if (!(/** @type {Element} */ (event.target).closest('[data-collection-field], button, input, textarea')))
                ctx.selectCell(row.id, fields[0]);
        });
        return record;
    }

    ctx.render = function () {
        ctx.finishEdit(true);
        els.body.replaceChildren();
        const visible = state.visible(els.search.value);
        if (
            !visible.some(function (row) {
                return row.id === ctx.activeCell.id;
            })
        )
            ctx.activeCell.id = visible[0] && visible[0].id;
        els.search.hidden = state.rows.length < 20 && !els.search.value;
        if (!visible.length) {
            els.body.append(
                h(
                    'tr',
                    { class: 'gpo-collection-table__empty' },
                    h('td', { colspan: String(readOnly ? 2 : 3) }, tr(state.rows.length ? 'noMatches' : 'empty'))
                )
            );
        }
        visible.forEach(function (row) {
            els.body.append(createRecord(row));
        });
        ctx.updateSelection();
        ctx.updateValidation();
    };
}
