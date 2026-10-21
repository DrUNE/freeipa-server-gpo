/** Pure helpers for preserving libadmix discriminated values in browser forms. */

import { validate } from '@gpui/util/collection-value';

function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
}

function equal(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function valuePayload(value) {
    if (!value || typeof value !== 'object') return value;
    if (value.kind === 'registry') return value.value ? value.value.value : null;
    if (value.kind === 'unsupported') return null;
    return value.value;
}

function typedValueFromInput(original, kind, raw, checked) {
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

function preferenceValueFromInput(original, raw, checked) {
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

function buildPolicyUpdate(policy, draft, baselineDraft) {
    const request = {};
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
    const sets = [];
    const clears = [];
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
        const target = source === 'locale' ? { kind: 'locale', locale: policy.comment.locale } : 'embedded';
        request.comment =
            draft.comment === ''
                ? { action: 'clear', target: target }
                : { action: 'set', target: target, text: draft.comment };
    }
    return request;
}

function hasOperations(request) {
    return request && Object.keys(request).length > 0;
}

function policyChoiceValue(choices, selectedIndex) {
    const index = Number(selectedIndex);
    return selectedIndex === '' || !Array.isArray(choices) || !choices[index] ? null : clone(choices[index].value);
}

function legacyStateCapability(policy, state) {
    const capability = state === 'not_configured' ? 'clear' : state === 'enabled' ? 'enable' : 'disable';
    return Boolean(policy && policy.capabilities && policy.capabilities[capability]);
}

function policyStateAction(policy, state) {
    const hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, 'state_actions'));
    const action = hasStateActions && policy.state_actions ? policy.state_actions[state] : null;
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

function canSelectPolicyState(policy, state) {
    return Boolean(policy && policy.state !== 'unknown_raw_values' && policyStateAction(policy, state).available);
}

function canEditPolicyParameters(policy, draftState) {
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

function validatePolicyDraft(policy, draft) {
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

function insertFilterOperation(collectionPath, index, filterKind, fields) {
    return {
        op: 'insert',
        collection_path: clone(collectionPath || []),
        index: Number(index),
        filter_kind: filterKind,
        fields: clone(fields || [])
    };
}

function editFilterOperation(path, fields) {
    return { op: 'edit', path: clone(path), fields: clone(fields || []) };
}

function replaceFilterOperation(path, filterKind, fields) {
    return {
        op: 'replace',
        path: clone(path),
        filter_kind: filterKind,
        fields: clone(fields || [])
    };
}

function removeFilterOperation(path) {
    return { op: 'remove', path: clone(path) };
}

function optionalTextValue(present, text) {
    return { kind: 'optional_text', value: present ? String(text) : null };
}

function preferenceFieldIds(fields) {
    const seen = new Set();
    const duplicates = new Set();
    (fields || []).forEach(function (field) {
        if (!field || typeof field.id !== 'string') return;
        if (seen.has(field.id)) duplicates.add(field.id);
        seen.add(field.id);
    });
    return { seen: seen, duplicates: Array.from(duplicates) };
}

function preferenceValueIsEmpty(value) {
    if (!value || typeof value !== 'object') return true;
    if (value.value === null || value.value === undefined) return true;
    if (typeof value.value === 'string') return value.value.trim() === '';
    if (Array.isArray(value.value)) return value.value.length === 0;
    return false;
}

function validatePreferenceField(field, value) {
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

function preferenceFieldEdits(descriptors, draftFields, changedOnly) {
    const draft = new Map(
        (draftFields || []).map(function (field) {
            return [field.id, field.value];
        })
    );
    const result = [];
    (descriptors || []).forEach(function (field) {
        if (!field || !field.editable) return;
        const value = draft.has(field.id) ? draft.get(field.id) : field.value;
        if (!changedOnly || !equal(value, field.value)) {
            result.push({ id: field.id, value: clone(value) });
        }
    });
    return result;
}

function preferenceParentIdentity(candidates, selectedIndex) {
    const index = Number(selectedIndex);
    if (!Number.isInteger(index) || index < 0) return null;
    const candidate = (candidates || [])[index];
    if (!candidate || candidate.identity === null) return null;
    return Array.isArray(candidate.identity) && candidate.identity.length ? clone(candidate.identity) : null;
}

function buildPreferenceRequest(options) {
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

    const request = creating ? {} : { identity: clone(config.identity) };
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

function pathWithin(path, ancestor) {
    const candidate = Array.isArray(path) ? path : [];
    const parent = Array.isArray(ancestor) ? ancestor : [];
    if (candidate.length < parent.length) return false;
    return parent.every(function (value, index) {
        return candidate[index] === value;
    });
}

function buildPreferenceFilterOperations(fieldEdits, structuralOperation) {
    const structural = structuralOperation ? clone(structuralOperation) : null;
    const result = [];
    (fieldEdits || []).forEach(function (edit) {
        if (!edit || !Array.isArray(edit.path) || !Array.isArray(edit.fields) || edit.fields.length === 0) return;
        if (structural && structural.op === 'remove' && pathWithin(edit.path, structural.path)) return;
        if (structural && structural.op === 'replace' && pathWithin(edit.path, structural.path)) return;
        result.push(editFilterOperation(edit.path, edit.fields));
    });
    if (structural) result.push(structural);
    return result;
}

function submitPreservingDraft(draft, submit) {
    const preservedDraft = clone(draft);
    return Promise.resolve()
        .then(submit)
        .then(function (response) {
            return { ok: true, response: response, draft: preservedDraft };
        })
        .catch(function (error) {
            return { ok: false, error: error, draft: preservedDraft };
        });
}

function errorCategory(error) {
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
