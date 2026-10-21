import { constraints, session } from '@gpui/util/collection-value';

let sequence = 0;

/**
 * Shared state of one open editor. The behaviour modules (`view`, `validation`, `cells`, `reorder`, `table`,
 * `toolbar`, `keyboard`) read it and attach their functions to it, so none of them imports another one.
 * @param {{ parameter: any, value: any, readOnly?: boolean }} options
 */
export function createContext(options) {
    const state = session(options.parameter, options.value);
    const fields = state.mode === 'key_value' ? ['key', 'value'] : ['value'];
    return /** @type {any} */ ({
        options,
        state,
        readOnly: Boolean(options.readOnly),
        fields,
        rules: constraints(options.parameter, options.value),
        prefix: 'collection-' + ++sequence,
        activeCell: { id: state.rows[0] && state.rows[0].id, field: fields[0] },
        editing: null,
        drag: null,
        scrollFrame: null,
        dialog: undefined,
        els: {}
    });
}
