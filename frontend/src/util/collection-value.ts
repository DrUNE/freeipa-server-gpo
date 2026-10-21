/** Typed collection values and isolated editor sessions; no DOM or persistence. */

import type { Collection, TypedValue } from '@gpui/util/dto-types';

/** The part of a parameter that describes a list (or key/value list) value. */
export interface CollectionParameter {
    collection?: Collection | null;
    max_length?: number | null;
}

export interface CollectionError {
    index: number | null;
    field: string | null;
    code: string;
}

/** One row of the editing session; `key` exists only in key/value mode. */
export interface CollectionRow {
    id: string;
    key?: string;
    value: string;
    fresh: boolean;
}

/** The edit in progress in a cell: not yet in the row, but part of what is read and validated. */
export interface PendingEdit {
    id: string;
    field: 'key' | 'value';
    value: string;
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}
function mode(parameter: CollectionParameter, value?: TypedValue | null): 'key_value' | 'list' | string {
    if (parameter.collection && parameter.collection.mode) return parameter.collection.mode;
    return value && value.kind === 'key_value_list' ? 'key_value' : 'list';
}
function constraints(parameter: CollectionParameter, value?: TypedValue | null) {
    const declared: Collection = parameter.collection || {};
    return {
        mode: mode(parameter, value),
        unique_keys: declared.unique_keys === true || mode(parameter, value) === 'key_value',
        key_case_sensitive: declared.key_case_sensitive === true,
        key_comparison: declared.key_comparison,
        allow_empty_values: declared.allow_empty_values !== false,
        min_items: Number(declared.min_items || 0),
        max_length: parameter.max_length,
        max_key_length: declared.max_key_length,
        max_value_length: declared.max_value_length,
        length_unit: declared.length_unit
    };
}
function folded(key: string, rules: ReturnType<typeof constraints>): string {
    if (rules.key_case_sensitive) return key;
    return rules.key_comparison === 'unicode_uppercase'
        ? key.toUpperCase()
        : key.replace(/[A-Z]/g, function (letter) {
              return letter.toLowerCase();
          });
}
function validate(parameter: CollectionParameter, value?: TypedValue | null): CollectionError[] {
    const rules = constraints(parameter, value);
    const errors: CollectionError[] = [];
    const entries = value && value.value;
    if (
        !value ||
        !Array.isArray(entries) ||
        value.kind !== (rules.mode === 'key_value' ? 'key_value_list' : 'text_list')
    ) {
        return [{ index: null, field: null, code: 'invalidValue' }];
    }
    if (entries.length < rules.min_items) errors.push({ index: null, field: null, code: 'minItems' });
    const seen = new Map<string, number>();
    entries.forEach(function (entry, index) {
        const key = rules.mode === 'key_value' ? entry && entry.key : entry;
        const text = rules.mode === 'key_value' ? entry && entry.value : entry;
        const keyField = rules.mode === 'key_value' ? 'key' : 'value';
        if (typeof text !== 'string' || (rules.mode === 'key_value' && typeof key !== 'string')) {
            errors.push({ index: index, field: typeof text !== 'string' ? 'value' : keyField, code: 'invalidValue' });
            return;
        }
        if (text.indexOf('\0') !== -1) errors.push({ index: index, field: 'value', code: 'invalidText' });
        if (!rules.allow_empty_values && !text.trim())
            errors.push({ index: index, field: 'value', code: 'requiredValue' });
        if (rules.max_length !== null && rules.max_length !== undefined && Array.from(text).length > rules.max_length) {
            errors.push({ index: index, field: 'value', code: 'tooLong' });
        }
        const valueLength = rules.length_unit === 'utf16' ? text.length : Array.from(text).length;
        if (
            rules.max_value_length !== null &&
            rules.max_value_length !== undefined &&
            valueLength > rules.max_value_length
        ) {
            errors.push({ index: index, field: 'value', code: 'tooLong' });
        }
        if (!rules.unique_keys) return;
        if (!key.trim())
            errors.push({
                index: index,
                field: keyField,
                code: rules.mode === 'key_value' ? 'requiredKey' : 'requiredValue'
            });
        if (/[\0\r\n]/.test(key) || key.indexOf('**') === 0)
            errors.push({ index: index, field: keyField, code: 'invalidKey' });
        const keyLength = rules.length_unit === 'utf16' ? key.length : Array.from(key).length;
        if (rules.max_key_length !== null && rules.max_key_length !== undefined && keyLength > rules.max_key_length) {
            errors.push({ index: index, field: keyField, code: 'keyTooLong' });
        }
        const name = folded(key, rules);
        if (seen.has(name)) {
            errors.push({ index: index, field: keyField, code: 'duplicateKey' });
            const previous = seen.get(name) as number;
            if (
                !errors.some(function (error) {
                    return error.index === previous && error.code === 'duplicateKey';
                })
            ) {
                errors.push({ index: previous, field: keyField, code: 'duplicateKey' });
            }
        } else seen.set(name, index);
    });
    return errors;
}
function empty(parameter: CollectionParameter, value?: TypedValue | null): TypedValue {
    return { kind: mode(parameter, value) === 'key_value' ? 'key_value_list' : 'text_list', value: [] };
}
function summary(parameter: CollectionParameter, value?: TypedValue | null) {
    const entries = value && Array.isArray(value.value) ? value.value : [];
    return {
        mode: mode(parameter, value),
        count: entries.length,
        preview: entries.slice(0, 3).map(function (entry) {
            const text = mode(parameter, value) === 'key_value' ? entry.key : entry;
            return String(text).replace(/[\r\n\t]+/g, ' ');
        }),
        more: entries.length > 3
    };
}
function session(parameter: CollectionParameter, value?: TypedValue | null) {
    const initial = value && Array.isArray(value.value) ? clone(value) : empty(parameter, value);
    const rules = constraints(parameter, initial);
    let sequence = 0;
    const rows: CollectionRow[] = initial.value.map(function (entry: any): CollectionRow {
        return rules.mode === 'key_value'
            ? { id: 'row-' + ++sequence, key: entry.key, value: entry.value, fresh: false }
            : { id: 'row-' + ++sequence, value: entry, fresh: false };
    });
    function effectiveRows(pending?: PendingEdit | null): CollectionRow[] {
        return rows
            .map(function (row: CollectionRow) {
                if (!pending || pending.id !== row.id) return row;
                const copy: CollectionRow = Object.assign({}, row);
                copy[pending.field] = pending.value;
                return copy;
            })
            .filter(function (row: CollectionRow) {
                return !row.fresh || row.value !== '' || (rules.mode === 'key_value' && row.key !== '');
            });
    }
    function read(pending?: PendingEdit | null): TypedValue {
        return {
            kind: rules.mode === 'key_value' ? 'key_value_list' : 'text_list',
            value: effectiveRows(pending).map(function (row: CollectionRow) {
                return rules.mode === 'key_value' ? { key: row.key, value: row.value } : row.value;
            })
        };
    }
    const state = {
        rows: rows,
        mode: rules.mode,
        selectedId: null as string | null,
        read: read,
        isDirty: function (pending?: PendingEdit | null) {
            return JSON.stringify(read(pending)) !== JSON.stringify(initial);
        },
        find: function (id: string) {
            return rows.find(function (row: CollectionRow) {
                return row.id === id;
            });
        },
        select: function (id: string) {
            state.selectedId = state.find(id) ? id : null;
        },
        add: function () {
            const row: CollectionRow = { id: 'row-' + ++sequence, value: '', fresh: true };
            if (rules.mode === 'key_value') row.key = '';
            rows.push(row);
            state.selectedId = null;
            return row.id;
        },
        removeSelected: function () {
            const index = rows.findIndex(function (row: CollectionRow) {
                return row.id === state.selectedId;
            });
            if (index < 0) return false;
            rows.splice(index, 1);
            state.selectedId = null;
            return true;
        },
        edit: function (id: string, field: string, text: unknown) {
            const row = state.find(id);
            if (!row || (field !== 'value' && !(rules.mode === 'key_value' && field === 'key'))) return false;
            row[field as 'key' | 'value'] = String(text);
            return true;
        },
        move: function (id: string, index: number) {
            const from = rows.findIndex(function (row: CollectionRow) {
                return row.id === id;
            });
            if (from < 0 || !Number.isInteger(index)) return false;
            const to = Math.max(0, Math.min(rows.length - 1, index));
            if (to === from) return false;
            const row = rows.splice(from, 1)[0];
            rows.splice(to, 0, row);
            return true;
        },
        visible: function (query?: unknown) {
            const needle = String(query || '').toLocaleLowerCase();
            return rows.filter(function (row: CollectionRow) {
                return !needle || ((row.key || '') + '\n' + row.value).toLocaleLowerCase().indexOf(needle) !== -1;
            });
        },
        errors: function (pending?: PendingEdit | null) {
            const effective = effectiveRows(pending);
            return validate(parameter, read(pending)).map(function (error) {
                return Object.assign({}, error, { id: error.index === null ? null : effective[error.index].id });
            });
        }
    };
    return state;
}

export { mode, constraints, validate, empty, summary, session };
