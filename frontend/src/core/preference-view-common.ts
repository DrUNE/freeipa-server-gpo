import { equal, valuePayload, clone } from '@gpui/core/editor-dto';
import { t } from '@gpui/locales/translations';
import * as preferenceLayouts from '@gpui/core/preference-layouts/index';
import type { LayoutColumn } from '@gpui/core/preference-layouts/types';
import type { FieldDescriptor, TypedValue } from '@gpui/core/dto-types';

/** A control of the item form: reads the value the user entered. */
export interface FormControl {
    read(): TypedValue;
}

/** A list item: its fields, or its flat properties (a typed value or a plain scalar). */
export interface ItemLike {
    fields?: { id?: string; value: TypedValue }[];
    properties?: Record<string, unknown>;
}

// The layouts are looked up by the kind the server sends, so the module namespace is indexed by a string.
const PREFERENCE_LAYOUTS: Record<string, { columns?: LayoutColumn[] } | undefined> =
    preferenceLayouts as unknown as Record<string, { columns?: LayoutColumn[] } | undefined>;

function pt(key: string): string {
    return t('preferences.editor.' + key);
}

function validationMessage(code: unknown): string {
    if (code === 'required') return pt('validationRequired');
    if (code === 'invalid_number') return pt('validationInvalidNumber');
    if (code === 'unsigned_byte_range') return pt('validationUnsignedByteRange');
    const targetingCodes: Record<string, string> = {
        invalid_date: 'validationDate',
        invalid_time: 'validationTime',
        invalid_ip: 'validationIp',
        invalid_ipv6: 'validationIpv6',
        invalid_mac: 'validationMac',
        invalid_version: 'validationVersion',
        invalid_guid: 'validationGuid',
        invalid_range: 'validationRange',
        invalid_value: 'validationValue'
    };
    if (typeof code === 'string' && targetingCodes[code]) return pt(targetingCodes[code]);
    return pt('validationFixErrors');
}

function listFrom(result: unknown, key: string): unknown[] {
    if (Array.isArray(result)) return result;
    const list = result ? (result as Record<string, unknown>)[key] : undefined;
    return Array.isArray(list) ? list : [];
}

function parentCandidateLabel(candidate: { depth?: unknown; label?: unknown } | null | undefined): string {
    const depth = Math.max(0, Math.floor(Number(candidate && candidate.depth) || 0));
    let prefix = '';
    for (let index = 0; index < depth; index += 1) prefix += '\u00a0\u00a0';
    return prefix + String((candidate && candidate.label) || '');
}

/** Only id, label, hidden and editable are read, so any descriptor-like object is accepted (the value is not looked at). */
type ScopedField = Pick<FieldDescriptor, 'id' | 'label' | 'hidden' | 'editable'>;

function scopeField<T extends ScopedField>(field: T | null | undefined, scope: string): T | null | undefined {
    const result = clone(field);
    if (!result || result.id !== 'metadata.userContext') return result;
    if (scope === 'user') {
        result.label = pt('userContext');
    } else {
        result.hidden = true;
        result.editable = false;
    }
    return result;
}

function actionLabel(value: unknown): string {
    const key = (
        { create: 'actionCreate', replace: 'actionReplace', update: 'actionUpdate', delete: 'actionDelete' } as Record<
            string,
            string
        >
    )[value as string];
    return key ? pt(key) : value === null || value === undefined ? '' : String(value);
}

function itemFieldValue(item: ItemLike | null | undefined, fieldId: string | null | undefined): any {
    if (!item || !fieldId) return '';
    if (Array.isArray(item.fields)) {
        for (let index = 0; index < item.fields.length; index++) {
            if (item.fields[index] && item.fields[index].id === fieldId) {
                return valuePayload(item.fields[index].value);
            }
        }
    }
    if (item.properties && typeof item.properties === 'object') {
        const key =
            String(fieldId).indexOf('properties.') === 0
                ? String(fieldId).slice('properties.'.length)
                : String(fieldId);
        if (Object.prototype.hasOwnProperty.call(item.properties, key)) {
            const raw = item.properties[key];
            if (raw && typeof raw === 'object' && 'kind' in raw) return valuePayload(raw as TypedValue);
            return raw === null || raw === undefined ? '' : String(raw);
        }
    }
    return '';
}

function tableColumns(kind: string): LayoutColumn[] | null {
    const layout = PREFERENCE_LAYOUTS[kind];
    if (layout && Array.isArray(layout.columns) && layout.columns.length) {
        return layout.columns;
    }
    return null;
}

function editableFields(
    controls: Map<string, FormControl>,
    baseline: Map<string, FieldDescriptor>,
    changedOnly?: boolean
): { id: string; value: TypedValue }[] {
    const result: { id: string; value: TypedValue }[] = [];
    controls.forEach(function (control, id) {
        const field = baseline.get(id);
        if (!field || !field.editable) return;
        const value = control.read();
        if (!changedOnly || !equal(value, field.value)) result.push({ id: id, value: value });
    });
    return result;
}

function filterKey(path?: unknown[] | null): string {
    return JSON.stringify(path || []);
}

export {
    pt,
    validationMessage,
    listFrom,
    parentCandidateLabel,
    scopeField,
    actionLabel,
    itemFieldValue,
    tableColumns,
    editableFields,
    filterKey
};
