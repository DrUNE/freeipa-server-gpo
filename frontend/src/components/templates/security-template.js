import { renderControl } from '@gpui/components/templates/security/controls';
import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { renderError, renderDiagnostics } from '@gpui/components/editor-status';
import { buildSecurityModel, writableElement } from '@gpui/components/templates/security/model';
import * as securityModel from '@gpui/components/templates/security/model';
import { defaultTyped, clone, newRow, same } from '@gpui/components/templates/security/value-editor';
import * as dependencies from '@gpui/components/templates/security/dependency-plan';
import { openPolicyDialog, render } from '@gpui/components/templates/security/workbench';
import { tabs } from '@gpui/components/templates/security/dialog';
import { open } from '@gpui/components/confirmation-dialog';
import {
    tr,
    initialDraft,
    controlLabel,
    rangeText,
    updateRequest,
    validateDraft,
    renderPreserved
} from '@gpui/components/templates/security/policy-draft';

async function renderPolicyEditor(options) {
    const config = options || {};
    const item = config.item || {};
    let model = item.securityModel;
    if (!model) {
        model = buildSecurityModel(await API.securityDefinitionsShow());
        if (typeof config.isCurrent === 'function' && !config.isCurrent()) return null;
        item.securityModel = model;
    }
    if (item.securityPreserved) return renderPreserved(model);

    let policy = securityModel.policy(model, item.securityPolicy);
    if (!policy) {
        return createElement('div', {
            className: 'gpo-editor-preferences__error',
            text: tr('security.missingPolicy', 'The security definition is no longer available.')
        });
    }

    const root = createElement('div', {
        className: 'gpo-security-policy-editor',
        attrs: {
            'data-security-policy': policy.policyId,
            'data-security-namespace': policy.namespace
        }
    });
    let baseline = initialDraft(policy);
    let draft = clone(baseline);
    const rowElement = config.collectionElement;
    const rowWritable = !rowElement || (Boolean(rowElement.unique_by) && writableElement(policy, rowElement.id));
    let editedRow = null;
    if (rowElement) {
        const rowState = draft.elements[rowElement.id];
        const rowValues = rowState && rowState.state === 'set' ? rowState.value.value : [];
        draft.defined = true;
        draft.elements[rowElement.id] = { state: 'set', value: { kind: 'collection', value: rowValues } };
        if (config.rowIndex !== undefined && config.rowIndex !== null) editedRow = rowValues[config.rowIndex];
        else {
            editedRow = clone(config.initialRow || newRow(rowElement));
            rowValues.push(editedRow);
        }
        (rowElement.fields || []).forEach(function (field) {
            if (
                rowWritable &&
                writableElement(policy, field.id) &&
                field.required &&
                (!editedRow[field.id] || editedRow[field.id].state !== 'set')
            ) {
                editedRow[field.id] = {
                    state: 'set',
                    value:
                        field.element.value_type === 'enum' && !field.element.initial
                            ? { kind: 'enum', value: '' }
                            : defaultTyped(field.element)
                };
            }
        });
    }
    let saving = false;
    let pendingConfirmation = null;
    let errorSlot;
    let rootBindings = new Map();

    function isDirty() {
        return !same(baseline, draft);
    }

    function proposedUnit(policyId) {
        if (
            /^account\.password\.(minimum|maximum)_password_age$/.test(policyId) ||
            /^account\.kerberos\.max_renew_age$/.test(policyId) ||
            /^event_log\.(security|application|system)_log_retention_days$/.test(policyId)
        ) {
            return tr('security.dependency.days', 'day(s)');
        }
        if (/^account\.kerberos\.max_ticket_age$/.test(policyId)) {
            return tr('security.dependency.hours', 'hour(s)');
        }
        if (
            /^account\.kerberos\.max_service_age$/.test(policyId) ||
            /^account\.lockout\.(reset_lockout_count|lockout_duration)$/.test(policyId)
        ) {
            return tr('security.dependency.minutes', 'minute(s)');
        }
        if (/^account\.lockout\.lockout_bad_count$/.test(policyId)) {
            return tr('security.dependency.attempts', 'attempt(s)');
        }
        return '';
    }

    function proposedValue(change) {
        if (!change.draft.defined) return tr('security.dependency.notConfigured', 'Not configured');
        const parts = (change.policy.definition.elements || [])
            .filter(function (element) {
                return change.draft.elements[element.id] && change.draft.elements[element.id].state === 'set';
            })
            .map(function (element) {
                const typed = change.draft.elements[element.id].value;
                if (typed.kind === 'boolean')
                    return typed.value ? tr('security.enabled', 'Enabled') : tr('security.disabled', 'Disabled');
                if (typed.kind === 'enum') {
                    const option = (element.options || []).find(function (item) {
                        return item.id === typed.value;
                    });
                    return option ? option.display_name || option.id : typed.value;
                }
                if (typed.kind === 'integer') {
                    const unit = proposedUnit(change.policy.policyId);
                    return String(typed.value) + (unit ? ' ' + unit : '');
                }
                return String(typed.value);
            });
        return parts.join('; ') || '—';
    }

    function confirmDependencies(changes) {
        return new Promise(function (resolve) {
            const host = root.getElement().closest('.gpo-security-dialog-host');
            if (!host) {
                resolve(false);
                return;
            }
            const modal = /** @type {HTMLElement | null} */ (root.getElement().closest('.gpo-security-dialog'));
            const table = createElement('table', {
                className: ['preference__table', 'gpo-security-table'],
                children: [
                    createElement('thead', {
                        children: [
                            createElement('tr', {
                                children: [
                                    createElement('th', { text: tr('security.dependency.policy', 'Policy') }),
                                    createElement('th', { text: tr('security.dependency.value', 'Value') })
                                ]
                            })
                        ]
                    }),
                    createElement('tbody', {
                        children: changes.map(function (change) {
                            return createElement('tr', {
                                children: [
                                    createElement('td', {
                                        text: change.policy.definition.display_name || change.policy.policyId
                                    }),
                                    createElement('td', { text: proposedValue(change) })
                                ]
                            });
                        })
                    })
                ]
            });
            const content = createElement('div', {
                children: [
                    createElement('p', {
                        text: tr(
                            'security.dependency.intro',
                            'To save this policy, apply the following related settings as well.'
                        )
                    }),
                    table
                ]
            });
            function finish(confirmed) {
                if (modal) {
                    modal.inert = false;
                    modal.classList.remove('gpo-security-dialog--confirming');
                }
                pendingConfirmation = null;
                resolve(confirmed);
            }
            pendingConfirmation = {
                dialog: open(host, {
                    title: tr('security.dependency.title', 'Related policy settings'),
                    content: content,
                    confirmLabel: tr('security.dependency.apply', 'Apply changes'),
                    cancelLabel: tr('security.dependency.cancel', 'Cancel'),
                    onConfirm: function () {
                        finish(true);
                    },
                    onCancel: function () {
                        finish(false);
                    }
                }),
                cancel: function () {
                    this.dialog.close();
                    finish(false);
                }
            };
            if (modal) {
                modal.inert = true;
                modal.classList.add('gpo-security-dialog--confirming');
            }
        });
    }

    async function save() {
        if (saving || !isDirty()) return true;
        const error = validateDraft(policy, draft);
        if (error) {
            errorSlot.getElement().textContent = error;
            errorSlot.getElement().focus();
            return false;
        }
        saving = true;
        try {
            const plan = dependencies.plan(model, policy, draft);
            const changes = (plan && plan.changes) || [];
            for (const change of changes) {
                const dependentError = validateDraft(change.policy, change.draft);
                if (dependentError) {
                    errorSlot.getElement().textContent = dependentError;
                    errorSlot.getElement().focus();
                    return false;
                }
            }
            if (changes.length && !(await confirmDependencies(changes))) return false;
            const request = updateRequest(model, policy, baseline, draft);
            changes.forEach(function (change) {
                const previous = initialDraft(change.policy);
                request.policies.push(updateRequest(model, change.policy, previous, change.draft).policies[0]);
            });
            const response = await API.securityDefinitionsUpdate(request);
            const refreshed = buildSecurityModel(response);
            Object.keys(refreshed).forEach(function (key) {
                model[key] = refreshed[key];
            });
            policy = securityModel.policy(model, item.securityPolicy);
            baseline = initialDraft(policy);
            draft = clone(baseline);
            if (config.onSaved) config.onSaved(response);
            return true;
        } catch (failure) {
            errorSlot.getElement().innerHTML = '';
            errorSlot.append(renderError(failure));
            const diagnostics =
                failure && failure.details && Array.isArray(failure.details.diagnostics)
                    ? failure.details.diagnostics
                    : [];
            if (diagnostics.length) errorSlot.append(renderDiagnostics(diagnostics));
            return false;
        } finally {
            saving = false;
        }
    }

    function renderContent() {
        root.getElement().innerHTML = '';
        rootBindings = new Map();
        errorSlot = createElement('div', {
            className: 'gpo-editor-preferences__error',
            attrs: { role: 'alert', tabindex: '-1' }
        });
        (policy.definition.notices || []).forEach(function (notice) {
            root.append(
                createElement('div', {
                    className: ['gpo-editor-preference-notice', 'gpo-editor-preference-notice--warning'],
                    text: notice
                })
            );
        });
        if (policy.diagnostics.length) root.append(renderDiagnostics(policy.diagnostics));
        root.append(errorSlot);
        const defined = createElement('input', { attrs: { type: 'checkbox', 'data-security-define': '' } });
        defined.getElement().checked = draft.defined;
        defined.on('change', function () {
            draft.defined = defined.getElement().checked;
            if (draft.defined)
                (policy.definition.elements || []).forEach(function (element) {
                    if (
                        element.required &&
                        writableElement(policy, element.id) &&
                        draft.elements[element.id].state !== 'set'
                    ) {
                        draft.elements[element.id] = { state: 'set', value: defaultTyped(element) };
                    }
                });
            renderContent();
            const currentDefine = root.getElement().querySelector('[data-security-define]');
            if (currentDefine) currentDefine.focus();
        });
        if (!rowElement)
            root.append(
                createElement('label', {
                    className: ['field', 'field__checkbox', 'gpo-security-policy-editor__define'],
                    children: [
                        defined,
                        createElement('span', {
                            text: tr('security.definePolicy', 'Define this policy')
                        })
                    ]
                })
            );
        let displayedControls = policy.controls;
        let displayedElements = policy.definition.elements;
        if (rowElement) {
            let collectionControlDefinition;
            function findCollection(controls) {
                (controls || []).forEach(function (control) {
                    if (control.element_id === rowElement.id) collectionControlDefinition = control;
                    findCollection(control.children);
                });
            }
            findCollection(policy.controls);
            displayedControls = (collectionControlDefinition && collectionControlDefinition.children) || [];
            displayedElements = rowElement.fields.map(function (field) {
                return Object.assign({}, field.element, { id: field.id, required: field.required });
            });
            if (!displayedControls.length)
                displayedControls = rowElement.fields.map(function (field) {
                    return { element_id: field.id, label: field.display_name || field.id };
                });
        }
        const controls = createElement('div', {
            className: 'gpo-editor-security-controls',
            children: displayedControls.map(function (control) {
                return renderControl(control, displayedElements, {
                    writable: draft.defined && rowWritable,
                    bindings: rootBindings,
                    getState: function (id) {
                        return (editedRow || draft.elements)[id] || { state: 'unset' };
                    },
                    setState: function (id, next) {
                        (editedRow || draft.elements)[id] = next;
                    }
                });
            })
        });
        root.append(controls);
        const explanation = [
            policy.definition.explain_text,
            policy.definition.allowed_values,
            policy.definition.default_text
        ].filter(Boolean);
        const settingsPanel = createElement('div');
        while (root.getElement().firstChild) settingsPanel.getElement().appendChild(root.getElement().firstChild);
        const explanationPanel = createElement('div', {
            className: 'gpo-security-explanation',
            children: [createElement('h3', { text: policy.definition.display_name || policy.policyId })].concat(
                (explanation.length
                    ? explanation
                    : [tr('security.noExplanation', 'No explanation is available for this setting.')]
                ).map(function (text) {
                    return createElement('p', { text: text });
                })
            )
        });
        root.append(tabs(settingsPanel, explanationPanel));
    }

    renderContent();
    root.hasUnsavedChanges = isDirty;
    root.readOnly = Boolean(rowElement && !rowWritable);
    root.applyChanges = save;
    root.cancelChanges = function () {
        draft = clone(baseline);
        renderContent();
        return true;
    };
    root.cleanup = function () {
        if (pendingConfirmation) pendingConfirmation.cancel();
    };
    return root;
}

const renderSecurityTemplate = function (options) {
    return render(options, renderPolicyEditor);
};
const openSecurityDialog = function (host, options) {
    return openPolicyDialog(host, options, renderPolicyEditor);
};
const _test = {
    initialDraft: initialDraft,
    updateRequest: updateRequest,
    validateDraft: validateDraft,
    controlLabel: controlLabel,
    rangeText: rangeText
};

export { renderSecurityTemplate, openSecurityDialog, _test };
