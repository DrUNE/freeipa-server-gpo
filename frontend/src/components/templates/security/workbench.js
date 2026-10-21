import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { t } from '@gpui/locales/translations';
import { writableElement, collectionElement, elementState, buildSecurityModel } from '@gpui/core/security/model';
import * as modelTools from '@gpui/core/security/model';
import { rowKey, newRow } from '@gpui/components/templates/security/value-editor';
import { open } from '@gpui/components/templates/security/dialog';
import { bind } from '@gpui/components/templates/security/header-actions';
import { renderError } from '@gpui/components/editor-status';
import * as listNavigation from '@gpui/components/list-navigation';

function tr(key, fallback) {
    const text = t('security.' + key);
    return text && text !== 'security.' + key ? text : fallback;
}
function typedSummary(definition, state) {
    if (!state || state.state !== 'set') return tr('notConfigured', 'Not configured');
    const value = state.value.value;
    if (state.value.kind === 'boolean') return value ? tr('enabled', 'Enabled') : tr('disabled', 'Disabled');
    if (state.value.kind === 'enum' || state.value.kind === 'flags') {
        const selected = Array.isArray(value) ? value : [value];
        return selected
            .map(function (id) {
                const option = (definition.options || []).find(function (option) {
                    return option.id === id;
                });
                return option ? option.display_name || id : id;
            })
            .join(', ');
    }
    if (state.value.kind === 'sddl') return tr('permissionsDefined', 'Permissions defined');
    if (Array.isArray(value)) return value.length ? value.join(', ') : tr('emptyValue', 'Empty list');
    return String(value);
}
function policySummary(policy) {
    if (policy.state.state !== 'defined') return tr('notConfigured', 'Not configured');
    return (
        (policy.definition.elements || [])
            .filter(function (definition) {
                const state = policy.state.elements && policy.state.elements[definition.id];
                return state && state.state === 'set';
            })
            .map(function (definition) {
                return typedSummary(definition, policy.state.elements[definition.id]);
            })
            .join('; ') || '—'
    );
}
function configuredRows(policy, definition) {
    const state = elementState(policy, definition.id);
    return state.state === 'set' ? state.value.value || [] : [];
}
async function openPolicyDialog(host, options, renderEditor) {
    const config = options || {},
        item = config.item || {};
    const model = item.securityModel || buildSecurityModel(await API.securityDefinitionsShow());
    if (config.isCurrent && !config.isCurrent()) return null;
    const policy = modelTools.policy(model, item.securityPolicy);
    if (!policy) throw new Error(tr('missingPolicy', 'The security definition is no longer available.'));
    const definition = item.securityCollection && collectionElement(policy);
    let title = policy.definition.display_name || policy.policyId;
    let editor;
    if (config.browseCollection && definition) {
        editor = await render(
            {
                item: Object.assign({}, item, { securityModel: model }),
                embedded: true,
                isCurrent: config.isCurrent,
                onSaved: config.onSaved
            },
            renderEditor
        );
    } else {
        editor = await renderEditor({
            item: Object.assign({}, item, { securityModel: model }),
            collectionElement: definition,
            rowIndex: config.rowIndex,
            initialRow: config.initialRow,
            isCurrent: config.isCurrent,
            onSaved: config.onSaved
        });
        if (definition) {
            const row =
                config.rowIndex === undefined ? config.initialRow : configuredRows(policy, definition)[config.rowIndex];
            const key = row && rowKey(definition, row);
            title = key ? String(key.value) : tr('addItem', 'Add item') + ' — ' + title;
        }
    }
    if (!editor) return null;
    if (config.isCurrent && !config.isCurrent()) {
        if (editor.cleanup) editor.cleanup();
        return null;
    }
    const readOnly = Boolean(config.browseCollection && definition) || editor.readOnly;
    const dialog = open(host, {
        title: title,
        content: editor,
        readOnly: readOnly,
        cancelLabel: readOnly ? tr('close', 'Close') : undefined,
        restoreFocus: config.restoreFocus,
        isDirty: editor.hasUnsavedChanges,
        onApply: editor.applyChanges,
        onClose: function () {
            if (editor.cleanup) editor.cleanup();
            if (config.onClose) config.onClose();
        }
    });
    return { editor: editor, dialog: dialog };
}
async function render(options, renderEditor) {
    const config = options || {},
        item = config.item || {};
    const model =
        (!item.searchReturnTo && item.securityModel) || buildSecurityModel(await API.securityDefinitionsShow());
    if (config.isCurrent && !config.isCurrent()) return null;
    if (!item.searchReturnTo) item.securityModel = model;
    if (item.securityPreserved) return renderEditor(config);
    const root = createElement('div', {
        className: [
            'gp__preference',
            'gpo-security-workbench',
            config.embedded ? 'gpo-security-workbench--embedded' : null
        ]
    });
    const panel = createElement('div', { className: 'gpo-security-workbench__panel' });
    const toolbar = createElement('div', { className: 'gpo-security-workbench__toolbar' });
    const table = createElement('table', {
        className: ['preference__table', 'gpo-catalog-table', 'gpo-security-table']
    });
    const body = createElement('tbody');
    const error = createElement('div', { className: 'gpo-security-error', attrs: { role: 'alert' } });
    const modalHost = createElement('div');
    let activeDialog = null,
        activeEditor = null,
        disposed = false,
        opening = false;
    let selection = null;
    let selectedId = null,
        pendingNeighbor = null;
    const search = createElement('input', {
        attrs: {
            type: 'search',
            'data-policy-filter': '',
            placeholder: tr('filter', 'Filter settings'),
            'aria-label': tr('filter', 'Filter settings')
        }
    });
    if (!config.embedded && !config.hideHeading)
        toolbar.append(
            createElement('h2', {
                text: config.categoryPath || item.title || tr('title', 'Security Settings'),
                attrs: { 'data-category-path': '' }
            })
        );
    toolbar.append(search);
    panel.append(toolbar);
    panel.append(error);
    panel.append(table);
    root.append(panel);
    root.append(modalHost);
    function selectedPolicy() {
        return modelTools.policy(model, item.securityPolicy);
    }
    const collection = item.securityCollection && collectionElement(selectedPolicy());
    const collectionWritable = collection && collection.unique_by && writableElement(selectedPolicy(), collection.id);
    const actions = bind(config.header, toolbar, {
        create: collectionWritable
            ? function () {
                  void edit(item);
              }
            : null,
        edit: function () {
            if (selection) selection.open();
        },
        delete: collectionWritable
            ? function () {
                  if (selection && selection.remove) selection.remove();
              }
            : null
    });
    function syncActions() {
        actions.update(
            selection && { edit: true, delete: Boolean(selection.remove) },
            opening || Boolean(activeDialog)
        );
    }
    const policies = item.securityCategory
        ? (item.children || []).filter(function (child) {
              return child.securityPolicy && !child.securityCollection;
          })
        : collection
          ? []
          : [item];
    function updateModel(response) {
        const next = buildSecurityModel(response);
        Object.keys(next).forEach(function (key) {
            model[key] = next[key];
        });
    }
    async function edit(node, rowIndex, initialRow) {
        if (activeDialog || opening || disposed) return;
        const returnLabel = selection && selection.element.getAttribute('data-security-row');
        opening = true;
        syncActions();
        try {
            const opened = await openPolicyDialog(
                modalHost,
                {
                    item: Object.assign({}, node, { securityModel: model }),
                    rowIndex: rowIndex,
                    initialRow: initialRow,
                    isCurrent: function () {
                        return !disposed;
                    },
                    restoreFocus: function () {
                        const rows = Array.from(body.getElement().querySelectorAll('[data-security-row]'));
                        return (
                            rows.find(function (row) {
                                return row.getAttribute('data-security-row') === returnLabel;
                            }) ||
                            rows[Math.min(rowIndex || 0, rows.length - 1)] ||
                            search.getElement()
                        );
                    },
                    onSaved: function (response) {
                        renderRows();
                        if (config.onSaved) config.onSaved(response);
                    },
                    onClose: function () {
                        activeEditor = null;
                        activeDialog = null;
                        syncActions();
                        navigation.sync();
                    }
                },
                renderEditor
            );
            if (opened) {
                activeEditor = opened.editor;
                activeDialog = opened.dialog;
            }
        } catch (problem) {
            if (!disposed) {
                error.getElement().replaceChildren();
                error.append(renderError(problem));
            }
        } finally {
            opening = false;
            syncActions();
        }
    }
    function removeRow(index) {
        if (activeDialog || opening || disposed || !collectionWritable) return;
        const policy = selectedPolicy();
        const key = rowKey(collection, configuredRows(policy, collection)[index]);
        const content = createElement('div', {
            children: [
                createElement('p', { text: tr('removeQuestion', 'Remove this item from the policy?') }),
                createElement('p', { text: String(key.value) })
            ]
        });
        const failure = createElement('div', { className: 'gpo-security-error', attrs: { role: 'alert' } });
        content.append(failure);
        const beforeIds = Array.from(body.getElement().querySelectorAll('[data-list-id]')).map(function (row) {
            return row.getAttribute('data-list-id');
        });
        const removedId = selectedId;
        activeDialog = open(modalHost, {
            title: tr('removeItem', 'Remove item'),
            content: content,
            applyLabel: tr('remove', 'Remove'),
            onApply: async function () {
                try {
                    const response = await API.securityDefinitionsUpdate({
                        expected_semantic_revision: model.catalog.semantic_revision,
                        policies: [
                            {
                                namespace: policy.namespace,
                                policy_id: policy.policyId,
                                elements: [
                                    {
                                        element_id: collection.id,
                                        action: 'rows',
                                        rows: [{ action: 'delete', key: key }]
                                    }
                                ]
                            }
                        ]
                    });
                    if (disposed || (config.isCurrent && !config.isCurrent())) return false;
                    updateModel(response);
                    if (config.onSaved) config.onSaved(response);
                    pendingNeighbor = { before: beforeIds, removed: [removedId] };
                    renderRows();
                    return true;
                } catch (problem) {
                    failure.getElement().replaceChildren();
                    failure.append(renderError(problem));
                    return false;
                }
            },
            restoreFocus: function () {
                return (selection && selection.element) || table.getElement();
            },
            onClose: function () {
                activeDialog = null;
                syncActions();
                navigation.sync();
            }
        });
        syncActions();
    }
    function addRow(label, setting, onOpen, onRemove, id) {
        if (
            search.getElement().value &&
            (label + ' ' + setting).toLocaleLowerCase().indexOf(search.getElement().value.toLocaleLowerCase()) === -1
        )
            return;
        const row = createElement('tr', {
            attrs: {
                tabindex: '-1',
                'data-security-row': label,
                'data-list-id': id || label,
                'aria-selected': 'false'
            },
            children: [
                createElement('td', { attrs: { title: label }, text: label }),
                createElement('td', { attrs: { title: setting }, text: setting })
            ]
        });
        function select() {
            if (selection) {
                selection.element.classList.remove('active');
                selection.element.setAttribute('aria-selected', 'false');
            }
            selection = { element: row.getElement(), open: onOpen, remove: onRemove };
            selectedId = row.getElement().getAttribute('data-list-id');
            row.getElement().classList.add('active');
            row.getElement().setAttribute('aria-selected', 'true');
            syncActions();
            navigation.sync();
        }
        row.getElement().__select = select;
        row.getElement().__open = onOpen;
        row.getElement().__remove = onRemove;
        row.on('click', function () {
            select();
            navigation.focusSelected();
        });
        row.on('dblclick', function () {
            if (!activeDialog && !opening && !disposed) {
                select();
                onOpen();
            }
        });
        body.append(row);
        if (selectedId === row.getElement().getAttribute('data-list-id')) select();
    }
    function serviceCatalog() {
        return Array.isArray(model.response.security_service_catalog) ? model.response.security_service_catalog : [];
    }
    function renderRows() {
        selection = null;
        syncActions();
        const heldFocus = table.getElement().contains(document.activeElement);
        body.getElement().innerHTML = '';
        if (collection) {
            const policy = selectedPolicy();
            const rows = configuredRows(policy, collection);
            const names = new Set();
            rows.map(function (row, index) {
                return { row: row, index: index };
            })
                .sort(function (a, b) {
                    return String(rowKey(collection, a.row).value).localeCompare(
                        String(rowKey(collection, b.row).value)
                    );
                })
                .forEach(function (entry) {
                    const key = rowKey(collection, entry.row);
                    names.add(String(key.value).toLowerCase());
                    const summaries = collection.fields
                        .filter(function (field) {
                            return field.id !== collection.unique_by;
                        })
                        .map(function (field) {
                            return typedSummary(field.element, entry.row[field.id]);
                        });
                    addRow(
                        String(key.value),
                        summaries.join('; '),
                        function () {
                            void edit(item, entry.index);
                        },
                        collectionWritable
                            ? function () {
                                  removeRow(entry.index);
                              }
                            : null,
                        'row:' + String(key.value)
                    );
                });
            if (collection.unique_by === 'service_name')
                serviceCatalog()
                    .slice()
                    .sort(function (a, b) {
                        return (a.display_name || a.name).localeCompare(b.display_name || b.name);
                    })
                    .forEach(function (service) {
                        if (names.has(service.name.toLowerCase())) return;
                        const row = newRow(collection);
                        row.service_name = { state: 'set', value: { kind: 'service_name', value: service.name } };
                        if (service.startup_mode)
                            row.startup_mode = { state: 'set', value: { kind: 'enum', value: service.startup_mode } };
                        if (service.sddl) row.sddl = { state: 'set', value: { kind: 'sddl', value: service.sddl } };
                        addRow(
                            service.display_name ? service.display_name + ' (' + service.name + ')' : service.name,
                            tr('notConfigured', 'Not configured'),
                            function () {
                                void edit(item, undefined, row);
                            },
                            null,
                            'service:' + service.name
                        );
                    });
        } else {
            (item.children || [])
                .filter(function (child) {
                    return child.type === 'folder';
                })
                .forEach(function (child) {
                    addRow(
                        child.title,
                        tr('folder', 'Folder'),
                        function () {
                            if (config.onNavigate) config.onNavigate(child);
                        },
                        null,
                        'folder:' + (child.id || child.title)
                    );
                });
            policies.forEach(function (node) {
                const policy = modelTools.policy(model, node.securityPolicy);
                if (policy)
                    addRow(
                        policy.definition.display_name || policy.policyId,
                        policySummary(policy),
                        function () {
                            void edit(node);
                        },
                        null,
                        'policy:' + policy.namespace + ':' + policy.policyId
                    );
            });
        }
        if (pendingNeighbor) {
            const all = Array.from(body.getElement().querySelectorAll('[data-list-id]'));
            selectedId = listNavigation.neighbor(
                pendingNeighbor.before,
                pendingNeighbor.removed,
                all.map(function (row) {
                    return row.getAttribute('data-list-id');
                })
            );
            if (selection) {
                selection.element.classList.remove('active');
                selection.element.setAttribute('aria-selected', 'false');
            }
            selection = null;
            const neighbor = all.find(function (row) {
                return row.getAttribute('data-list-id') === selectedId;
            });
            if (neighbor) /** @type {any} */ (neighbor).__select();
            pendingNeighbor = null;
        }
        if (!selection) selectedId = null;
        if (!body.getElement().children.length)
            body.append(
                createElement('tr', {
                    children: [
                        createElement('td', {
                            attrs: { colspan: '2' },
                            className: 'gpo-security-table__empty',
                            text: search.getElement().value
                                ? tr('noMatches', 'No matching settings.')
                                : tr('noItems', 'No items are configured.')
                        })
                    ]
                })
            );
        navigation.sync();
        if (heldFocus) navigation.focusSelected();
    }
    if (collection) {
        if (collection.unique_by === 'service_name' && !serviceCatalog().length)
            panel.append(
                createElement('p', {
                    className: 'gpo-security-workbench__notice',
                    text: tr(
                        'serviceCatalogMissing',
                        'The service catalog has not been supplied. Configured services are shown below; additional services can be added by name.'
                    )
                })
            );
    }
    table.append(
        createElement('thead', {
            children: [
                createElement('tr', {
                    children: [
                        createElement('th', { text: collection ? tr('item', 'Item') : tr('policy', 'Policy') }),
                        createElement('th', { text: tr('policySetting', 'Policy setting') })
                    ]
                })
            ]
        })
    );
    table.append(body);
    const navigation = listNavigation.bind(table.getElement(), {
        rows: function () {
            return Array.from(body.getElement().querySelectorAll('[data-list-id]'));
        },
        selected: function () {
            return selection && selection.element;
        },
        select: function (row) {
            row.__select();
        },
        activate: function (row) {
            row.__open();
        },
        remove: function (row) {
            if (row.__remove) row.__remove();
        },
        canRemove: function (row) {
            return Boolean(row.__remove);
        },
        busy: function () {
            return disposed || opening || Boolean(activeDialog);
        }
    });
    search.on('input', renderRows);
    renderRows();
    root.hasUnsavedChanges = function () {
        return Boolean(activeEditor && activeEditor.hasUnsavedChanges());
    };
    root.applyChanges = async function () {
        if (!activeEditor) return true;
        const saved = await activeEditor.applyChanges();
        if (saved && activeDialog) activeDialog.close();
        return saved;
    };
    root.cancelChanges = function () {
        if (activeDialog) activeDialog.close();
        return true;
    };
    root.onMounted = function () {
        if (item.openPolicyDialog && item.securityPolicy && !collection && !disposed) {
            void edit(item);
        }
    };
    root.cleanup = function () {
        disposed = true;
        navigation.cleanup();
        if (activeDialog) activeDialog.close();
        actions.cleanup();
    };
    return root;
}

export { render, openPolicyDialog, policySummary };
