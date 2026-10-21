import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { t } from '@gpui/locales/translations';
import { renderError } from '@gpui/components/editor-status';
import { familyById, state } from '@gpui/core/advanced-audit/model';
import { tabs, open } from '@gpui/components/templates/security/dialog';
import { bind } from '@gpui/components/templates/security/header-actions';
import { auditIdentity } from '@gpui/components/templates/all-policies/model';
import * as listNavigation from '@gpui/components/list-navigation';
import {
    configured,
    label,
    summary,
    systemSettingLabel,
    emptyRequest,
    tr
} from '@gpui/core/advanced-audit/presentation';

async function renderAdvancedAuditTemplate(options) {
    const config = options || {};
    const item = config.item || {};
    if (item.advancedAuditError)
        return createElement('div', {
            className: 'gpo-security-error',
            text: tr(
                'security.auditUnavailable',
                'Advanced Audit is temporarily unavailable. Other security settings remain available.'
            )
        });
    let response = item.advancedAuditResponse || (await API.advancedAuditShow());
    if (typeof config.isCurrent === 'function' && !config.isCurrent()) return null;
    let family = familyById(response, item.advancedAuditFamilyId);
    const externalHost = config.dialogHost;
    let disposed = false;
    const root = externalHost ? {} : createElement('div', { className: ['gp__preference', 'gpo-security-workbench'] });
    let activeDialog = null;
    let dirty = function () {
        return false;
    };
    let applyCurrent = null;
    let selection = null;
    let selectedId = null,
        navigation;
    const modalHost = externalHost || createElement('div');
    let errorSlot, body, search, actions, listState;
    if (!externalHost) {
        const data = createElement('div', {
            className: 'gpo-security-workbench__panel',
            attrs: { 'data-advanced-audit-view': item.advancedAuditFamilyId || '' }
        });
        errorSlot = createElement('div', { className: 'gpo-editor-preferences__error' });
        body = createElement('tbody');
        const table = createElement('table', {
            className: ['preference__table', 'gpo-catalog-table', 'gpo-security-table'],
            children: [
                createElement('thead', {
                    children: [
                        createElement('tr', {
                            children: [
                                createElement('th', { text: tr('security.policy', 'Policy') }),
                                createElement('th', { text: tr('security.policySetting', 'Policy setting') })
                            ]
                        })
                    ]
                }),
                body
            ]
        });
        listState = item.auditListState || (item.auditListState = { query: '' });
        search = createElement('input', {
            attrs: {
                type: 'search',
                value: listState.query || '',
                placeholder: t('policySearch.categoryPlaceholder'),
                'aria-label': t('policySearch.categoryPlaceholder'),
                'data-policy-filter': ''
            }
        });
        const toolbar = createElement('div', {
            className: 'gpo-security-workbench__toolbar',
            children: [
                config.hideHeading
                    ? null
                    : createElement('h2', {
                          text:
                              config.categoryPath ||
                              (family && family.label) ||
                              tr('security.advancedAudit.title', 'Advanced Audit Policy Configuration'),
                          attrs: { 'data-category-path': '' }
                      }),
                search
            ]
        });
        actions = bind(config.header, toolbar, {
            edit: function () {
                if (selection) edit(selection.row);
            }
        });
        data.append(toolbar);
        data.append(errorSlot);
        data.append(table);
        data.append(modalHost);
        root.append(data);
        navigation = listNavigation.bind(table.getElement(), {
            rows: function () {
                return Array.from(body.getElement().querySelectorAll('[data-advanced-audit-kind]'));
            },
            selected: function () {
                return selection && selection.element;
            },
            select: function (row) {
                row.__select();
            },
            activate: function (row) {
                edit(row.__auditRow);
            },
            busy: function () {
                return disposed || Boolean(activeDialog);
            }
        });
    }
    function syncActions() {
        if (actions) actions.update(selection && { edit: true }, Boolean(activeDialog));
    }
    function onClose() {
        activeDialog = null;
        applyCurrent = null;
        dirty = function () {
            return false;
        };
        syncActions();
        if (config.onClose) config.onClose();
    }

    function close() {
        if (activeDialog) activeDialog.close();
    }

    function edit(row) {
        if (activeDialog || disposed || (typeof config.isCurrent === 'function' && !config.isCurrent())) return null;
        if (!row.editable || row.kind === 'preserved') {
            activeDialog = open(modalHost, {
                title: label(row),
                readOnly: true,
                content: createElement('div', {
                    children: [
                        createElement('p', {
                            text: tr('security.preservedReadOnly', 'This setting is preserved and is read-only.')
                        }),
                        createElement('pre', {
                            className: 'gpo-security-preserved-value',
                            text:
                                row.sddl ||
                                row.raw ||
                                (row.fields && row.fields.join('\n')) ||
                                row.reason ||
                                summary(row)
                        })
                    ]
                }),
                restoreFocus:
                    config.restoreFocus ||
                    function () {
                        return (selection && selection.element) || (search && search.getElement());
                    },
                onClose: onClose
            });
            syncActions();
            return activeDialog;
        }
        const isConfigured = configured(row);
        const define = createElement('input', {
            attrs: { type: 'checkbox', checked: isConfigured ? 'checked' : null }
        });
        const fields = createElement('div', { className: 'gpo-editor-advanced-audit__fields' });
        const machineName = createElement('input', {
            attrs: {
                type: 'text',
                value: row.machine_name || state(response).suggested_machine_name || '',
                'data-advanced-audit-machine': ''
            }
        });
        const controls = [machineName.getElement()];
        // Machine name is source-file metadata, not a policy target. Keep
        // an existing value; the native API allows it to be empty for new rows.
        let requestForRow, descriptor;
        if (row.kind === 'subcategory') {
            const setting = row.setting || { kind: 'system', value: 'unchanged' };
            const system = setting.kind !== 'user';
            fields.append(
                createElement('div', {
                    className: 'gpo-editor-security-record-identity',
                    children: [
                        createElement('dt', { text: 'GUID' }),
                        createElement('dd', { text: row.guid || '' }),
                        createElement('dt', { text: tr('security.advancedAudit.target', 'Target') }),
                        createElement('dd', {
                            text: system
                                ? tr('security.advancedAudit.system', 'System')
                                : tr('security.advancedAudit.user', 'User SID') + ': ' + row.target.sid
                        })
                    ]
                })
            );
            if (system) {
                const mode = createElement('select', {
                    attrs: { 'data-advanced-audit-setting': '' },
                    children: ['unchanged', 'success', 'failure', 'success_and_failure', 'none'].map(function (value) {
                        return createElement('option', {
                            attrs: { value: value },
                            text: systemSettingLabel(value)
                        });
                    })
                });
                mode.getElement().value = setting.value || 'unchanged';
                fields.append(
                    createElement('label', {
                        className: 'gpo-editor-security-record__field',
                        children: [
                            createElement('span', { text: tr('security.advancedAudit.auditSetting', 'Audit setting') }),
                            createElement('span', { className: 'field__element', children: [mode] })
                        ]
                    })
                );
                controls.push(mode.getElement());
                requestForRow = function () {
                    return { kind: 'system', value: mode.getElement().value };
                };
            } else {
                const flags = ['include_success', 'exclude_success', 'include_failure', 'exclude_failure', 'none'];
                const flagInputs = {};
                flags.forEach(function (flag) {
                    const input = createElement('input', {
                        attrs: {
                            type: 'checkbox',
                            checked: setting[flag] ? 'checked' : null,
                            'data-advanced-audit-flag': flag
                        }
                    });
                    flagInputs[flag] = input.getElement();
                    controls.push(input.getElement());
                    fields.append(
                        createElement('label', {
                            className: ['field', 'field__checkbox'],
                            children: [
                                input,
                                createElement('span', {
                                    text: tr('security.advancedAudit.' + flag, flag.replace(/_/g, ' '))
                                })
                            ]
                        })
                    );
                });
                requestForRow = function () {
                    const result = { kind: 'user' };
                    flags.forEach(function (flag) {
                        result[flag] = flagInputs[flag].checked;
                    });
                    return result;
                };
            }
        } else if (row.kind === 'global_sacl') {
            descriptor = createElement('textarea', {
                attrs: {
                    rows: '5',
                    spellcheck: 'false',
                    'data-advanced-audit-sddl': '',
                    'aria-label': tr('security.securityDescriptor', 'Security descriptor (SDDL)')
                }
            });
            descriptor.getElement().value = row.sddl || '';
            controls.push(descriptor.getElement());
            fields.append(
                createElement('label', {
                    className: 'gpo-editor-security-record__field',
                    children: [
                        createElement('span', {
                            text: tr('security.securityDescriptor', 'Security descriptor (SDDL)')
                        }),
                        createElement('span', { className: 'field__element', children: [descriptor] })
                    ]
                })
            );
            fields.append(
                createElement('p', {
                    text: tr(
                        'security.saclHelp',
                        'Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.'
                    )
                })
            );
            requestForRow = function () {
                return descriptor.getElement().value;
            };
        } else {
            const enabled = createElement('input', {
                attrs: { type: 'checkbox', checked: row.enabled ? 'checked' : null, 'data-advanced-audit-enabled': '' }
            });
            controls.push(enabled.getElement());
            fields.append(
                createElement('label', {
                    className: ['field', 'field__checkbox'],
                    children: [
                        enabled,
                        createElement('span', {
                            text: tr('security.advancedAudit.enableOption', 'Enable this audit option')
                        })
                    ]
                })
            );
            requestForRow = function () {
                return enabled.getElement().checked;
            };
        }
        function sync() {
            controls.forEach(function (control) {
                control.disabled = !define.getElement().checked;
            });
        }
        define.on('change', sync);
        sync();
        const validation = createElement('div', { className: 'gpo-security-error', attrs: { role: 'alert' } });
        function draftValue() {
            return JSON.stringify([define.getElement().checked, machineName.getElement().value, requestForRow()]);
        }
        const baseline = draftValue();
        dirty = function () {
            return baseline !== draftValue();
        };
        applyCurrent = async function () {
            const request = emptyRequest();
            if (!define.getElement().checked) {
                if (row.kind === 'subcategory')
                    request.clear_subcategories.push({
                        target: row.target,
                        guid: row.guid
                    });
                else if (row.kind === 'global_sacl') request.clear_global_sacls.push(row.object_kind);
                else request.clear_options.push(row.option);
            } else if (row.kind === 'subcategory') {
                request.set_subcategories.push({
                    machine_name: machineName.getElement().value.trim(),
                    target: row.target,
                    guid: row.guid,
                    setting: requestForRow()
                });
            } else if (row.kind === 'global_sacl') {
                const sddl = requestForRow();
                if (!sddl.trim() || /[\r\n\0]/.test(sddl)) {
                    validation.getElement().textContent = tr(
                        'security.validationDescriptor',
                        'Enter one security descriptor without line breaks.'
                    );
                    descriptor.getElement().focus();
                    return false;
                }
                request.set_global_sacls.push({
                    machine_name: machineName.getElement().value,
                    object_kind: row.object_kind,
                    sddl: sddl
                });
            } else {
                request.set_options.push({
                    machine_name: machineName.getElement().value.trim(),
                    option: row.option,
                    enabled: requestForRow()
                });
            }
            try {
                response = await API.advancedAuditUpdate(request);
                if (!item.searchReturnTo) item.advancedAuditResponse = response;
                family = familyById(response, item.advancedAuditFamilyId);
                renderRows();
                if (config.onSaved) config.onSaved(response);
                return true;
            } catch (error) {
                validation.getElement().innerHTML = '';
                validation.append(renderError(error));
                return false;
            }
        };
        const settingsPanel = createElement('div', {
            children: [
                createElement('label', {
                    className: ['field', 'field__checkbox', 'gpo-security-policy-editor__define'],
                    children: [
                        define,
                        createElement('span', { text: tr('security.defineSetting', 'Define this policy setting') })
                    ]
                }),
                fields,
                validation
            ]
        });
        const explanation =
            row.explain_text ||
            row.description ||
            (row.kind === 'global_sacl'
                ? tr(
                      'security.saclHelp',
                      'Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.'
                  )
                : tr('security.noExplanation', 'No explanation is available for this setting.'));
        const explanationPanel = createElement('div', {
            className: 'gpo-security-explanation',
            children: [createElement('h3', { text: label(row) }), createElement('p', { text: explanation })]
        });
        activeDialog = open(modalHost, {
            title: label(row),
            content: createElement('div', {
                className: 'gpo-security-policy-editor',
                attrs: { 'data-advanced-audit-form': '' },
                children: [tabs(settingsPanel, explanationPanel)]
            }),
            isDirty: dirty,
            onApply: applyCurrent,
            restoreFocus:
                config.restoreFocus ||
                function () {
                    return (selection && selection.element) || (search && search.getElement());
                },
            onClose: onClose
        });
        syncActions();
        return activeDialog;
    }

    function renderRows() {
        if (externalHost || disposed) return;
        const heldFocus = body.getElement().contains(document.activeElement);
        selection = null;
        syncActions();
        body.getElement().innerHTML = '';
        ((family && family.rows) || [])
            .filter(function (row) {
                return label(row).toLocaleLowerCase().includes(listState.query.trim().toLocaleLowerCase());
            })
            .slice()
            .sort(function (a, b) {
                return label(a).localeCompare(label(b));
            })
            .forEach(function (row, index) {
                const id = auditIdentity(row) + ':' + index;
                const tableRow = createElement('tr', {
                    attrs: {
                        tabindex: '-1',
                        'aria-selected': 'false',
                        'data-advanced-audit-kind': row.kind,
                        'data-advanced-audit-id': row.guid || row.option || row.object_kind || ''
                    },
                    children: [
                        createElement('td', { attrs: { title: label(row) }, text: label(row) }),
                        createElement('td', { attrs: { title: summary(row) }, text: summary(row) })
                    ]
                });
                function select() {
                    if (selection) {
                        selection.element.classList.remove('active');
                        selection.element.setAttribute('aria-selected', 'false');
                    }
                    selection = { row: row, element: tableRow.getElement() };
                    selectedId = id;
                    tableRow.getElement().classList.add('active');
                    tableRow.getElement().setAttribute('aria-selected', 'true');
                    syncActions();
                    navigation.sync();
                }
                tableRow.getElement().__select = select;
                tableRow.getElement().__auditRow = row;
                tableRow.on('click', function () {
                    select();
                    navigation.focusSelected();
                });
                tableRow.on('dblclick', function () {
                    if (!activeDialog && !disposed) {
                        select();
                        edit(row);
                    }
                });
                body.append(tableRow);
                if (selectedId === id) select();
            });
        if (!selection) selectedId = null;
        navigation.sync();
        if (heldFocus) navigation.focusSelected();
    }

    if (search) {
        search.on('input', function () {
            listState.query = search.getElement().value;
            renderRows();
        });
        search.on('keydown', function (event) {
            if (event.key === 'Escape') {
                search.getElement().value = '';
                listState.query = '';
                renderRows();
            }
        });
    }
    renderRows();
    root.hasUnsavedChanges = function () {
        return dirty();
    };
    root.applyChanges = async function () {
        if (!applyCurrent) return true;
        const saved = await applyCurrent();
        if (saved) close();
        return saved;
    };
    root.cancelChanges = function () {
        close();
        return true;
    };
    root.openPolicyDialog = function () {
        if (!item.advancedAuditTarget) return null;
        const matches = ((family && family.rows) || []).filter(function (row) {
            return auditIdentity(row) === item.advancedAuditTarget;
        });
        const row = matches[item.advancedAuditOccurrence || 0];
        if (row) return edit(row);
        const error = new Error(t('policySearch.targetUnavailable'));
        if (errorSlot) errorSlot.append(renderError(error));
        else throw error;
        return null;
    };
    root.onMounted = function () {
        if (item.openPolicyDialog) root.openPolicyDialog();
    };
    root.cleanup = function () {
        disposed = true;
        if (navigation) navigation.cleanup();
        close();
        if (actions) actions.cleanup();
    };
    return root;
}

async function openAdvancedAuditDialog(host, options) {
    const editor = await renderAdvancedAuditTemplate(Object.assign({}, options, { dialogHost: host }));
    if (!editor) return null;
    const dialog = editor.openPolicyDialog();
    if (!dialog) {
        editor.cleanup();
        return null;
    }
    return { editor: editor, dialog: dialog };
}

export { renderAdvancedAuditTemplate, openAdvancedAuditDialog };
