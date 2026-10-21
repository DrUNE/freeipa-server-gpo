import { h } from '@gpui/lib/dom';
import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Static markup of the editor: toolbar, validation line, table skeleton, counters. Public hooks:
 * `[data-collection-add]`, `[data-collection-remove]`, `[data-collection-mode]`, `[data-collection-row]`,
 * `[data-collection-field]`, `[data-collection-input]`.
 * @param {any} ctx
 */
export function buildView(ctx) {
    const { options, state, readOnly, prefix } = ctx;
    const keyValue = state.mode === 'key_value';
    const add = h('button', { class: 'button', type: 'button', 'data-collection-add': true }, tr('add'));
    const remove = h('button', { class: 'button', type: 'button', 'data-collection-remove': true }, tr('remove'));
    const search = h('input', { type: 'search', placeholder: tr('search'), 'aria-label': tr('search') });
    [add, remove].forEach(function (button) {
        button.addEventListener('mousedown', function (event) {
            if (event.button === 0) event.preventDefault();
        });
    });
    const toolbar = h(
        'div',
        { class: 'gpo-collection-editor__toolbar' },
        !readOnly && add,
        !readOnly && remove,
        search
    );
    const errors = h('div', { class: 'gpo-collection-editor__validation', role: 'alert' });
    const count = h('div', { class: 'gpo-collection-editor__count' });
    const live = h('div', {
        class: 'gpo-collection-editor__live',
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': 'true'
    });
    const body = h('tbody');
    const table = h(
        'table',
        {
            class: 'preference__table gpo-collection-table',
            'aria-label': options.parameter.label || options.parameter.id,
            tabindex: '0',
            'data-collection-mode': state.mode
        },
        h(
            'colgroup',
            {},
            !readOnly && h('col', { class: 'gpo-collection-table__handle-column' }),
            h('col', { class: keyValue ? 'gpo-collection-table__key-column' : 'gpo-collection-table__index-column' }),
            h('col')
        ),
        h(
            'thead',
            {},
            h(
                'tr',
                {},
                !readOnly &&
                    h('th', { scope: 'col' }, h('span', { class: 'gpo-editor-visually-hidden' }, tr('reorder'))),
                h('th', { scope: 'col' }, keyValue ? tr('key') : tr('index')),
                h('th', { scope: 'col' }, tr('value'))
            )
        ),
        body
    );
    const scroll = h('div', { class: 'gpo-collection-editor__table-scroll' }, table);
    const content = h(
        'div',
        { class: 'gpo-collection-editor' },
        toolbar,
        errors,
        scroll,
        count,
        live,
        h('span', { id: prefix + '-reorder-help', class: 'gpo-collection-editor__live' }, tr('reorderHelp'))
    );
    Object.assign(ctx.els, { add, remove, search, errors, count, live, body, table, scroll, content });
}
