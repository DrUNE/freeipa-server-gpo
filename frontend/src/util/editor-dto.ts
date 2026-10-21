/** Pure helpers for preserving libadmix discriminated values in browser forms. */

import { validate } from '@gpui/util/collection-value';

/** A libadmix discriminated value: `kind` names the type, `value` carries it (see tests/contracts). */
export interface TypedValue {
    kind: string;
    value?: any;
}

/** A form field of a preference item or of a targeting filter, as the server describes it. */
export interface FieldDescriptor {
    id: string;
    label?: string;
    value: TypedValue;
    editable?: boolean;
    required?: boolean;
    control?: string;
    choices?: { key: string; label: string }[];
}

/** The value a user edited, keyed by the field it belongs to. */
export interface FieldEdit {
    id: string;
    value: TypedValue;
}

export interface Collection {
    mode?: string;
    unique_keys?: boolean;
    key_case_sensitive?: boolean;
    allow_empty_values?: boolean;
    min_items?: number;
}

export interface PolicyParameter {
    id: string;
    kind?: string;
    value: TypedValue | null;
    default_value?: TypedValue | null;
    editable?: boolean;
    required?: boolean;
    collection?: Collection | null;
    choices?: { value: TypedValue }[];
}

export interface StateAction {
    available?: boolean;
    mode?: string | null;
    requires_parameters?: boolean;
}

export interface Policy {
    state: string;
    comment?: { text: string; source?: string; locale?: string } | null;
    capabilities?: Record<string, boolean>;
    state_actions?: Record<string, StateAction | null>;
    parameters?: PolicyParameter[];
}

export interface PolicyDraft {
    state: string;
    comment: string;
    parameters?: { parameter_id: string; value: TypedValue | null }[];
}

export type FilterOperation =
    | { op: 'insert'; collection_path: number[]; index: number; filter_kind: string; fields: FieldEdit[] }
    | { op: 'edit'; path: number[]; fields: FieldEdit[] }
    | { op: 'replace'; path: number[]; filter_kind: string; fields: FieldEdit[] }
    | { op: 'remove'; path: number[] };

export interface ParentCandidate {
    identity: unknown[] | null;
}

export interface PreferenceRequestOptions {
    descriptors?: FieldDescriptor[];
    fields?: FieldEdit[];
    validationExemptions?: Set<string> | string[];
    creating?: boolean;
    name?: string | null;
    originalName?: string | null;
    identity?: unknown[];
    parent?: unknown[];
    filters?: FilterOperation[];
}

export interface PreferenceRequest {
    identity?: unknown[];
    fields?: FieldEdit[];
    parent?: unknown[];
    name?: string;
    filters?: FilterOperation[];
}

/** A validation error of a form: a field (`id`) or, for a targeting filter, its position (`path`). */
export interface RequestError {
    id: string;
    code: string;
    path?: number[];
}

function clone<T>(value: T): T {
    if (value === undefined) return undefined as T;
    return JSON.parse(JSON.stringify(value)) as T;
}

function equal(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function valuePayload(value: any): any {
    if (!value || typeof value !== 'object') return value;
    if (value.kind === 'registry') return value.value ? value.value.value : null;
    if (value.kind === 'unsupported') return null;
    return value.value;
}

function typedValueFromInput(
    original: TypedValue | null | undefined,
    kind: string,
    raw: unknown,
    checked?: boolean
): TypedValue {
    if (original && original.kind === 'unsupported') return clone(original);
    if (kind === 'boolean') return { kind: 'boolean', value: Boolean(checked) };
    if (kind === 'decimal') {
        return { kind: 'integer', value: raw === '' ? null : Number(raw) };
    }
    if (kind === 'list') {
        return {
            kind: 'text_list',
            value: String(raw || '')
                .split(/\r?\n/)
                .filter(function (item) {
                    return item !== '';
                })
        };
    }
    return {
        kind: 'text',
        value: String(raw === undefined || raw === null ? '' : raw)
    };
}

function preferenceValueFromInput(
    original: TypedValue | null | undefined,
    raw: unknown,
    checked?: boolean
): TypedValue {
    const value = clone(original || { kind: 'text', value: '' });
    switch (value.kind) {
        case 'boolean':
            value.value = Boolean(checked);
            break;
        case 'optional_boolean':
            value.value = raw === '' ? null : raw === 'true';
            break;
        case 'integer':
        case 'unsigned_byte':
            value.value = raw === '' ? null : Number(raw);
            break;
        case 'optional_unsigned_byte':
            value.value = raw === '' ? null : Number(raw);
            break;
        case 'text_list':
            value.value = String(raw || '')
                .split(/\r?\n/)
                .filter(function (item) {
                    return item !== '';
                });
            break;
        case 'optional_text':
            value.value = raw === '' ? null : String(raw);
            break;
        default:
            value.value = String(raw === undefined || raw === null ? '' : raw);
    }
    return value;
}

function buildPolicyUpdate(
    policy: Policy,
    draft: PolicyDraft,
    baselineDraft?: PolicyDraft | null
): Record<string, any> {
    const request: Record<string, any> = {};
    const originalState = baselineDraft ? baselineDraft.state : policy.state;
    if (draft.state !== originalState) request.state = draft.state;

    const baseline = new Map(
        baselineDraft
            ? (baselineDraft.parameters || []).map(function (parameter) {
                  return [parameter.parameter_id, parameter.value];
              })
            : (policy.parameters || []).map(function (parameter) {
                  return [parameter.id, parameter.value];
              })
    );
    const sets: { parameter_id: string; value: TypedValue }[] = [];
    const clears: string[] = [];
    if (draft.state === 'enabled') {
        (draft.parameters || []).forEach(function (parameter) {
            const oldValue = baseline.get(parameter.parameter_id);
            if (equal(oldValue, parameter.value)) return;
            if (parameter.value === null) clears.push(parameter.parameter_id);
            else sets.push({ parameter_id: parameter.parameter_id, value: clone(parameter.value) });
        });

        const enableAction = policyStateAction(policy, 'enabled');
        if (draft.state !== originalState && enableAction.requires_parameters) {
            const alreadyEdited = new Set(
                sets.map(function (item) {
                    return item.parameter_id;
                })
            );
            clears.forEach(function (parameterId) {
                alreadyEdited.add(parameterId);
            });
            const draftById = new Map(
                (draft.parameters || []).map(function (parameter) {
                    return [parameter.parameter_id, parameter.value];
                })
            );
            (policy.parameters || []).forEach(function (parameter) {
                if (parameter.editable === false) return;
                if (parameter.value !== null && parameter.value !== undefined) return;
                if (parameter.default_value === null || parameter.default_value === undefined) return;
                if (parameter.default_value.kind === 'unsupported') return;
                if (alreadyEdited.has(parameter.id)) return;
                const value = draftById.get(parameter.id);
                if (value === null || value === undefined) return;
                if (value.kind === 'unsupported') return;
                sets.push({ parameter_id: parameter.id, value: clone(value) });
                alreadyEdited.add(parameter.id);
            });
        }
    }
    if (sets.length) request.set_parameters = sets;
    if (clears.length) request.clear_parameters = clears;

    const oldComment = baselineDraft ? baselineDraft.comment : policy.comment ? policy.comment.text : '';
    if (draft.comment !== oldComment) {
        const source = policy.comment && policy.comment.source;
        const target =
            source === 'locale' ? { kind: 'locale', locale: policy.comment && policy.comment.locale } : 'embedded';
        request.comment =
            draft.comment === ''
                ? { action: 'clear', target: target }
                : { action: 'set', target: target, text: draft.comment };
    }
    return request;
}

function hasOperations(request: object | null | undefined): boolean {
    return Boolean(request) && Object.keys(request as object).length > 0;
}

function policyChoiceValue(
    choices: { value: TypedValue }[] | undefined,
    selectedIndex: string | number
): TypedValue | null {
    const index = Number(selectedIndex);
    return selectedIndex === '' || !Array.isArray(choices) || !choices[index] ? null : clone(choices[index].value);
}

function legacyStateCapability(policy: Policy | null | undefined, state: string): boolean {
    const capability = state === 'not_configured' ? 'clear' : state === 'enabled' ? 'enable' : 'disable';
    return Boolean(policy && policy.capabilities && policy.capabilities[capability]);
}

function policyStateAction(
    policy: Policy | null | undefined,
    state: string
): { available: boolean; mode: string | null; requires_parameters: boolean } {
    const hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, 'state_actions'));
    const action = policy && hasStateActions && policy.state_actions ? policy.state_actions[state] : null;
    if (action && typeof action === 'object') {
        return {
            available: Boolean(action.available),
            mode: action.mode || null,
            requires_parameters: Boolean(action.requires_parameters)
        };
    }
    if (hasStateActions) {
        return { available: false, mode: null, requires_parameters: false };
    }
    return {
        available: legacyStateCapability(policy, state),
        mode: null,
        requires_parameters: false
    };
}

function canSelectPolicyState(policy: Policy | null | undefined, state: string): boolean {
    return Boolean(policy && policy.state !== 'unknown_raw_values' && policyStateAction(policy, state).available);
}

function canEditPolicyParameters(policy: Policy | null | undefined, draftState?: string): boolean {
    const selectedState = draftState === undefined ? policy && policy.state : draftState;
    const hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, 'state_actions'));
    return Boolean(
        policy &&
        policy.state !== 'unknown_raw_values' &&
        selectedState === 'enabled' &&
        (!hasStateActions || policyStateAction(policy, 'enabled').available) &&
        policy.capabilities &&
        policy.capabilities.edit_parameters
    );
}

function validatePolicyDraft(
    policy: Policy,
    draft: PolicyDraft | null | undefined
): { category: string; field: string; message: string } | null {
    if (!draft || !canEditPolicyParameters(policy, draft.state)) return null;
    const values = new Map(
        (draft.parameters || []).map(function (parameter) {
            return [parameter.parameter_id, parameter.value];
        })
    );
    const lists = (policy.parameters || []).filter(function (parameter) {
        return parameter.kind === 'list';
    });
    for (let index = 0; index < lists.length; index++) {
        let list = lists[index];
        if (!list.collection && policyStateAction(policy, 'enabled').mode === 'dynamic_list_values') {
            list = Object.assign({}, list, {
                collection: {
                    mode: 'list',
                    unique_keys: true,
                    key_case_sensitive: false,
                    allow_empty_values: false,
                    min_items: 1
                }
            });
        }
        const value = values.get(list.id);
        if (list.editable === false || (value && value.kind === 'unsupported')) continue;
        if (value === null && !list.required && !(list.collection && list.collection.min_items)) continue;
        const problems = validate(list, value);
        if (problems.length)
            return {
                category: 'validation',
                field: list.id,
                message: problems.some(function (problem) {
                    return problem.code === 'minItems' || problem.code === 'requiredValue';
                })
                    ? 'At least one non-empty list entry is required'
                    : 'Invalid collection entries'
            };
    }
    return null;
}

function insertFilterOperation(
    collectionPath: number[] | null | undefined,
    index: number | string,
    filterKind: string,
    fields?: FieldEdit[] | null
): FilterOperation {
    return {
        op: 'insert',
        collection_path: clone(collectionPath || []),
        index: Number(index),
        filter_kind: filterKind,
        fields: clone(fields || [])
    };
}

function editFilterOperation(path: number[], fields?: FieldEdit[] | null): FilterOperation {
    return { op: 'edit', path: clone(path), fields: clone(fields || []) };
}

function replaceFilterOperation(path: number[], filterKind: string, fields?: FieldEdit[] | null): FilterOperation {
    return {
        op: 'replace',
        path: clone(path),
        filter_kind: filterKind,
        fields: clone(fields || [])
    };
}

function removeFilterOperation(path: number[]): FilterOperation {
    return { op: 'remove', path: clone(path) };
}

function optionalTextValue(present: boolean, text: unknown): TypedValue {
    return { kind: 'optional_text', value: present ? String(text) : null };
}

function preferenceFieldIds(fields?: { id?: unknown }[] | null): { seen: Set<string>; duplicates: string[] } {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    (fields || []).forEach(function (field) {
        if (!field || typeof field.id !== 'string') return;
        if (seen.has(field.id)) duplicates.add(field.id);
        seen.add(field.id);
    });
    return { seen: seen, duplicates: Array.from(duplicates) };
}

function preferenceValueIsEmpty(value: any): boolean {
    if (!value || typeof value !== 'object') return true;
    if (value.value === null || value.value === undefined) return true;
    if (typeof value.value === 'string') return value.value.trim() === '';
    if (Array.isArray(value.value)) return value.value.length === 0;
    return false;
}

function validatePreferenceField(field: FieldDescriptor | null | undefined, value: any): string | null {
    if (!field || !value || typeof value !== 'object' || typeof value.kind !== 'string') {
        return 'invalid_value';
    }
    if (field.control === 'choice') {
        if (
            !Array.isArray(field.choices) ||
            !field.choices.every(function (choice) {
                return (
                    choice && typeof choice.key === 'string' && choice.key !== '' && typeof choice.label === 'string'
                );
            }) ||
            value.kind !== 'text' ||
            !field.choices.some(function (choice) {
                return choice.key === value.value;
            })
        ) {
            return 'invalid_value';
        }
    }
    if (field.required && preferenceValueIsEmpty(value)) return 'required';
    if (value.kind === 'integer' || value.kind === 'unsigned_byte' || value.kind === 'optional_unsigned_byte') {
        if (value.value === null && value.kind === 'optional_unsigned_byte') return null;
        if (!Number.isFinite(value.value) || !Number.isInteger(value.value)) {
            return 'invalid_number';
        }
        if (
            (value.kind === 'unsigned_byte' || value.kind === 'optional_unsigned_byte') &&
            (value.value < 0 || value.value > 255)
        ) {
            return 'unsigned_byte_range';
        }
    }
    if (value.kind === 'action' && ['create', 'replace', 'update', 'delete'].indexOf(value.value) === -1) {
        return 'invalid_value';
    }
    if (value.kind === 'filter_combine' && ['and', 'or'].indexOf(value.value) === -1) {
        return 'invalid_value';
    }
    return null;
}

function preferenceFieldEdits(
    descriptors: FieldDescriptor[] | null | undefined,
    draftFields: FieldEdit[] | null | undefined,
    changedOnly?: boolean
): FieldEdit[] {
    const draft = new Map(
        (draftFields || []).map(function (field) {
            return [field.id, field.value];
        })
    );
    const result: FieldEdit[] = [];
    (descriptors || []).forEach(function (field) {
        if (!field || !field.editable) return;
        const value = (draft.has(field.id) ? draft.get(field.id) : field.value) as TypedValue;
        if (!changedOnly || !equal(value, field.value)) {
            result.push({ id: field.id, value: clone(value) });
        }
    });
    return result;
}

function preferenceParentIdentity(
    candidates: ParentCandidate[] | null | undefined,
    selectedIndex: string | number
): unknown[] | null {
    const index = Number(selectedIndex);
    if (!Number.isInteger(index) || index < 0) return null;
    const candidate = (candidates || [])[index];
    if (!candidate || candidate.identity === null) return null;
    return Array.isArray(candidate.identity) && candidate.identity.length ? clone(candidate.identity) : null;
}

function buildPreferenceRequest(options?: PreferenceRequestOptions | null): {
    request: PreferenceRequest | null;
    errors: RequestError[];
    changed: boolean;
} {
    const config = options || {};
    const descriptors = config.descriptors || [];
    const ids = preferenceFieldIds(descriptors);
    const draftFields = config.fields || [];
    const draft = new Map(
        draftFields.map(function (field) {
            return [field.id, field.value];
        })
    );
    const exemptions =
        config.validationExemptions instanceof Set
            ? config.validationExemptions
            : new Set(Array.isArray(config.validationExemptions) ? config.validationExemptions : []);
    const errors = ids.duplicates.map(function (id) {
        return { id: id, code: 'duplicate_descriptor' };
    });

    descriptors.forEach(function (field) {
        if (!field || !field.editable || ids.duplicates.indexOf(field.id) !== -1) return;
        if (exemptions.has(field.id)) return;
        const value = draft.has(field.id) ? draft.get(field.id) : field.value;
        const code = validatePreferenceField(field, value);
        if (code) errors.push({ id: field.id, code: code });
    });

    const creating = Boolean(config.creating);
    const nextName = config.name === undefined || config.name === null ? null : String(config.name);
    const originalName =
        config.originalName === undefined || config.originalName === null ? null : String(config.originalName);
    if (!creating && nextName !== null && nextName !== originalName && nextName.trim() === '') {
        errors.push({ id: 'name', code: 'required' });
    }
    if (errors.length) return { request: null, errors: errors, changed: false };

    const request: PreferenceRequest = creating ? {} : { identity: clone(config.identity) };
    const edits = preferenceFieldEdits(descriptors, draftFields, !creating);
    if (creating || edits.length) request.fields = edits;
    if (creating && Array.isArray(config.parent) && config.parent.length) {
        request.parent = clone(config.parent);
    }
    if (!creating && nextName !== null && nextName !== originalName) request.name = nextName;
    const filters = clone(config.filters || []);
    if (filters.length) request.filters = filters;

    const changed =
        creating ||
        Object.keys(request).some(function (key) {
            return key !== 'identity';
        });
    return { request: changed ? request : null, errors: [], changed: changed };
}

function pathWithin(path: unknown, ancestor: unknown): boolean {
    const candidate = Array.isArray(path) ? path : [];
    const parent = Array.isArray(ancestor) ? ancestor : [];
    if (candidate.length < parent.length) return false;
    return parent.every(function (value, index) {
        return candidate[index] === value;
    });
}

function buildPreferenceFilterOperations(
    fieldEdits: { path?: number[]; fields?: FieldEdit[] }[] | null | undefined,
    structuralOperation?: FilterOperation | null
): FilterOperation[] {
    const structural = structuralOperation ? clone(structuralOperation) : null;
    const result: FilterOperation[] = [];
    (fieldEdits || []).forEach(function (edit) {
        if (!edit || !Array.isArray(edit.path) || !Array.isArray(edit.fields) || edit.fields.length === 0) return;
        if (structural && structural.op === 'remove' && pathWithin(edit.path, structural.path)) return;
        if (structural && structural.op === 'replace' && pathWithin(edit.path, structural.path)) return;
        result.push(editFilterOperation(edit.path, edit.fields));
    });
    if (structural) result.push(structural);
    return result;
}

function submitPreservingDraft<D, R>(
    draft: D,
    submit: () => R | Promise<R>
): Promise<{ ok: true; response: R; draft: D } | { ok: false; error: unknown; draft: D }> {
    const preservedDraft = clone(draft);
    return Promise.resolve()
        .then(submit)
        .then(function (response) {
            return { ok: true as const, response: response, draft: preservedDraft };
        })
        .catch(function (error) {
            return { ok: false as const, error: error as unknown, draft: preservedDraft };
        });
}

function errorCategory(error: any): string {
    return String((error && (error.category || error.code)) || 'operational').toLowerCase();
}

export {
    clone,
    equal,
    valuePayload,
    typedValueFromInput,
    preferenceValueFromInput,
    buildPolicyUpdate,
    hasOperations,
    policyChoiceValue,
    policyStateAction,
    canSelectPolicyState,
    canEditPolicyParameters,
    validatePolicyDraft,
    insertFilterOperation,
    editFilterOperation,
    replaceFilterOperation,
    removeFilterOperation,
    optionalTextValue,
    preferenceFieldIds,
    validatePreferenceField,
    preferenceFieldEdits,
    preferenceParentIdentity,
    buildPreferenceRequest,
    pathWithin,
    buildPreferenceFilterOperations,
    submitPreservingDraft,
    errorCategory
};
