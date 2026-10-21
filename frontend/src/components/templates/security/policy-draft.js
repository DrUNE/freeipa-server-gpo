import { createElement } from '@gpui/util/element-creator';
import { t } from '@gpui/locales/translations';
import { renderDiagnostics } from '@gpui/components/editor-status';
import { clone, rowKey, rowActions, validationError, same } from '@gpui/components/templates/security/value-editor';

// Pure helpers of the security policy editor: the draft of a policy, its bindings, labels, the update request and validation.
function tr(key, fallback) {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
}

function stateFor(policy, element) {
    if (policy.state.state === 'defined') {
        return policy.state.elements && policy.state.elements[element.id]
            ? clone(policy.state.elements[element.id])
            : { state: 'unset' };
    }
    return element.initial ? { state: 'set', value: clone(element.initial) } : { state: 'unset' };
}

function initialDraft(policy) {
    const elements = {};
    (policy.definition.elements || []).forEach(function (element) {
        elements[element.id] = stateFor(policy, element);
    });
    return {
        defined: policy.state.state === 'defined',
        elements: elements
    };
}

function canCreateRow(collection, controls) {
    const writable = new Set();
    function visit(items, parentReadOnly) {
        (items || []).forEach(function (control) {
            const readOnly = parentReadOnly || control.read_only;
            if (control.element_id && !readOnly) writable.add(control.element_id);
            visit(control.children, readOnly);
        });
    }
    visit(controls, false);
    return (collection.fields || []).every(function (field) {
        return !field.required || field.element.initial || writable.has(field.id);
    });
}

function registerBinding(bindings, id, binding) {
    if (!bindings.has(id)) bindings.set(id, []);
    bindings.get(id).push(binding);
}

function syncBindings(bindings, id, source, state) {
    (bindings.get(id) || []).forEach(function (binding) {
        binding.update(state, binding === source);
    });
}

function controlLabel(control, element, state) {
    let label = control.label || element.id;
    if (label === 'value') label = tr('security.value', 'Value');
    if (!state || state.state !== 'set' || element.value_type !== 'integer') {
        return label;
    }
    const match = (control.labels_when || []).find(function (item) {
        return Number(item[0]) === state.value.value;
    });
    return match ? match[1] : label;
}

function rangeText(control, element) {
    if (element.value_type !== 'integer' || control.show_range !== true) return null;
    const ranges = element.input_ranges && element.input_ranges.length ? element.input_ranges : element.ranges || [];
    return (
        ranges
            .map(function (range) {
                return range.min === range.max ? String(range.min) : String(range.min) + '–' + String(range.max);
            })
            .join(', ') || null
    );
}

function elementAction(element, before, after) {
    if (same(before, after)) return null;
    if (after.state === 'unset') {
        return { element_id: element.id, action: 'unset' };
    }
    if (element.value_type === 'collection' && before.state === 'set') {
        const rows = rowActions(element, before.value.value || [], after.value.value || []);
        return rows.length ? { element_id: element.id, action: 'rows', rows: rows } : null;
    }
    return {
        element_id: element.id,
        action: 'set',
        value: clone(after.value)
    };
}

function updateRequest(model, policy, baseline, draft) {
    const update = {
        namespace: policy.namespace,
        policy_id: policy.policyId,
        elements: []
    };
    if (baseline.defined !== draft.defined) {
        update.transition = draft.defined ? 'define' : 'undefine';
    }
    if (!draft.defined) {
        return {
            expected_semantic_revision: model.catalog.semantic_revision,
            policies: [update]
        };
    }
    (policy.definition.elements || []).forEach(function (element) {
        const action = elementAction(
            element,
            baseline.elements[element.id] || { state: 'unset' },
            draft.elements[element.id] || { state: 'unset' }
        );
        if (action) update.elements.push(action);
    });
    return {
        expected_semantic_revision: model.catalog.semantic_revision,
        policies: [update]
    };
}

function validateDraft(policy, draft) {
    if (!draft.defined) return null;
    function validateState(element, state, label, required) {
        if (state.state !== 'set')
            return required ? label + ': ' + tr('security.validationRequired', 'A value is required.') : null;
        const typeError = validationError(element, state.value);
        if (typeError) return label + ': ' + typeError;
        if (element.value_type !== 'collection') return null;
        if (!Array.isArray(state.value.value)) {
            return label + ': ' + tr('security.validationRows', 'Enter valid collection rows.');
        }
        if (!state.value.value.length)
            return tr('security.validationRows', 'Add at least one item, or leave this policy not configured.');
        const seen = new Set();
        for (const row of state.value.value) {
            if (
                element.unique_by === 'group' &&
                (element.fields || []).some(function (field) {
                    return field.id === 'members';
                }) &&
                (!row.members || row.members.state !== 'set') &&
                (!row.member_of || row.member_of.state !== 'set')
            ) {
                return tr(
                    'security.validationGroupRelationship',
                    'Define Members or Member of. An explicitly empty list is allowed.'
                );
            }
            if (element.unique_by) {
                const key = rowKey(element, row);
                if (!key) return label + ': ' + tr('security.validationKey', 'Every row requires its unique key.');
                const encoded = JSON.stringify(key);
                if (seen.has(encoded))
                    return (
                        element.duplicate_message ||
                        tr('security.validationDuplicate', 'Collection row keys must be unique.')
                    );
                seen.add(encoded);
            }
            for (const field of element.fields || []) {
                const fieldError = validateState(
                    field.element,
                    (row && row[field.id]) || { state: 'unset' },
                    field.display_name || field.id,
                    field.required
                );
                if (fieldError) return fieldError;
            }
        }
        return null;
    }
    for (const element of policy.definition.elements || []) {
        const error = validateState(
            element,
            draft.elements[element.id] || { state: 'unset' },
            element.id,
            element.required
        );
        if (error) return error;
    }
    return null;
}

function renderPreserved(model) {
    const root = createElement('div', {
        className: ['gp__preference', 'gpo-editor-preferences'],
        attrs: { 'data-security-preserved': '' }
    });
    root.append(
        createElement('h2', {
            text: tr('security.preservedTitle', 'Preserved and diagnostic records')
        })
    );
    if ((model.diagnostics || []).length) root.append(renderDiagnostics(model.diagnostics));
    const list = createElement('dl', { className: 'gpo-editor-security-preserved' });
    (model.preserved || []).forEach(function (record) {
        list.append(
            createElement('dt', {
                text: record.section + ' — ' + record.identity
            })
        );
        list.append(
            createElement('dd', {
                children: [
                    createElement('p', {
                        text: record.damaged
                            ? tr('security.damaged', 'Damaged record')
                            : tr('security.preservedReadOnly', 'This setting is preserved and is read-only.')
                    }),
                    renderDiagnostics([{ message: record.reason }])
                ]
            })
        );
    });
    root.append(list);
    return root;
}

export {
    tr,
    stateFor,
    initialDraft,
    canCreateRow,
    registerBinding,
    syncBindings,
    controlLabel,
    rangeText,
    elementAction,
    updateRequest,
    validateDraft,
    renderPreserved
};
