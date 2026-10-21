import { cx, h } from '@gpui/lib/dom';

/*
 * A table of records with a selection: the script entries, the files of an event, the preference items.
 *
 * It builds the markup and the selection marks; what a click, a double click or a key does stays with the screen (keyboard
 * movement is `list-navigation.js`, which works on the rows this component marks). Public hooks:
 *   [data-table]            the table (named by `label`; `data-table-multiple` when several rows may be selected: `aria-multiselectable`
 *                           is not allowed on a plain table)
 *   [data-table-row]        a body row; `data-row-id` is its id; `aria-selected` and the class `active` mark a selected one
 *   [data-table-empty]      the row that says there is nothing to show
 * The look is still the editor's global sheets: pass their classes in `className` until the table has its own styles.
 */

/**
 * @typedef {{ id: string, label: string }} Column
 * @typedef {{
 *   id: string,
 *   cells: (Node | string | null)[],
 *   selected?: boolean,
 *   attrs?: Record<string, string>,
 *   onClick?: (event: MouseEvent) => void,
 *   onDoubleClick?: (event: MouseEvent) => void
 * }} Row
 */

/**
 * @param {{
 *   label: string,
 *   columns: Column[],
 *   rows: Row[],
 *   emptyText: string,
 *   multiple?: boolean,
 *   className?: string,
 *   emptyClassName?: string
 * }} options
 * @returns {HTMLTableElement}
 */
export function createDataTable({ label, columns, rows, emptyText, multiple = false, className, emptyClassName }) {
    const head = h('tr', {}, ...columns.map(column => h('th', { scope: 'col' }, column.label)));
    const body = h(
        'tbody',
        {},
        ...(rows.length ? rows.map(row => createRow(row)) : [createEmptyRow(columns.length, emptyText, emptyClassName)])
    );
    return h(
        'table',
        { class: className, 'aria-label': label, 'data-table-multiple': multiple ? true : null, 'data-table': true },
        h('thead', {}, head),
        body
    );
}

/** @param {Row} row */
function createRow({ id, cells, selected = false, attrs = {}, onClick, onDoubleClick }) {
    const tr = h(
        'tr',
        {
            ...attrs,
            class: cx(selected && 'active'),
            tabindex: '-1',
            'aria-selected': String(selected),
            'data-table-row': true,
            'data-row-id': id
        },
        ...cells.map(cell => h('td', {}, cell))
    );
    if (onClick) tr.addEventListener('click', onClick);
    if (onDoubleClick) tr.addEventListener('dblclick', onDoubleClick);
    return tr;
}

function createEmptyRow(span, text, className) {
    return h('tr', { class: className, 'data-table-empty': true }, h('td', { colspan: String(span) }, text));
}

/** The body rows (not the empty-state row). @param {HTMLElement} table @returns {HTMLTableRowElement[]} */
export function tableRows(table) {
    return Array.from(table.querySelectorAll('tbody tr[data-table-row]'));
}

/** The id of a row. @param {Element} row */
export function rowId(row) {
    return row.getAttribute('data-row-id');
}

/**
 * Marks exactly the given rows as selected.
 * @param {HTMLElement} table
 * @param {Iterable<string>} ids
 */
export function setSelectedRows(table, ids) {
    const selected = new Set(ids);
    for (const row of tableRows(table)) {
        const on = selected.has(rowId(row));
        row.classList.toggle('active', on);
        row.setAttribute('aria-selected', String(on));
    }
}
