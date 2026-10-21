import { createElement, ElementCreator } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import {
    buildPreferenceRequest,
    preferenceParentIdentity,
    errorCategory,
    preferenceFieldIds,
    equal,
    clone
} from '@gpui/util/editor-dto';
import * as dto from '@gpui/util/editor-dto';
import { renderError } from '@gpui/components/editor-status';
import * as editorStatus from '@gpui/components/editor-status';
import * as confirmationDialog from '@gpui/components/confirmation-dialog';
import { trapTab } from '@gpui/components/editor-dialog';
import * as editorDialog from '@gpui/components/editor-dialog';
import {
    createBody,
    createButton as createDialogButton,
    createCloseButton,
    createDialogShell
} from '@gpui/components/Dialog/Dialog';
import { neighbor, bind } from '@gpui/components/list-navigation';
import { t, getLanguage } from '@gpui/locales/translations';
import * as preferenceLayouts from '@gpui/components/templates/preference/layouts/index';
import { render } from '@gpui/components/templates/preference/targeting-editor';
import {
    syncFormBusy,
    setNameError,
    clearFormErrors,
    markServerFieldError
} from '@gpui/components/templates/preference/view/form-state';
import { createTargetingModal } from '@gpui/components/templates/preference/view/targeting-modal';
import {
    pt,
    tableColumns,
    actionLabel,
    itemFieldValue,
    scopeField,
    listFrom,
    validationMessage,
    parentCandidateLabel,
    filterKey,
    editableFields
} from '@gpui/components/templates/preference/view/common';
import { fieldControl, mockupFieldControl } from '@gpui/components/templates/preference/view/field-control';
import {
    buildFieldTabs,
    orderedTabEntries,
    isMetadataField
} from '@gpui/components/templates/preference/view/field-tabs';
import {
    dependencyRulesFor,
    attachFieldDependencies
} from '@gpui/components/templates/preference/view/field-dependencies';

let nextHeaderOwnerId = 1;

const PREFERENCE_LAYOUTS = preferenceLayouts;

async function renderPreferencesTemplate(options) {
    const config = options || {};
    const item = config.item || {};
    const documentDto = item.document || {};
    const root = createElement('div', {
        className: ['gp__preference', 'gpo-editor-preferences']
    });
    const rootElement = root.getElement();
    const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
    const headerControls = headerElement ? headerElement.querySelector('.gp__control') : null;
    const headerActions = headerElement ? headerElement.querySelector('.gp__control-actions') : null;
    const admxActions = headerElement ? headerElement.querySelector('.gp__control-admx') : null;
    const helpSeparator = headerElement ? headerElement.querySelector('.gp__control-separator') : null;
    const createButton = headerControls ? headerControls.querySelector('.preferences__btn-create') : null;
    const editButton = headerControls ? headerControls.querySelector('.preferences__btn-edit') : null;
    const deleteButton = headerControls ? headerControls.querySelector('.preferences__btn-delete') : null;
    const headerOwner = 'preferences-' + nextHeaderOwnerId++;
    let items = [];
    let selectedIdentity = null;
    let modalState = null;
    let opening = false;
    let pendingDiscard = null;
    let discardModal = null;
    const cleanups = [];
    let formRequestId = 0;
    let itemsRequestId = 0;
    let infoRequestId = 0;
    const itemFieldsCache = new Map();
    let fieldsRequestId = 0;
    let tableRefreshScheduled = false;
    let deleting = false;
    let disposed = false;
    let tableNavigation;

    if (headerControls) {
        headerControls.setAttribute('data-preference-owner', headerOwner);
        headerControls.style.display = documentDto.editable ? 'flex' : 'none';
    }
    if (headerActions) {
        headerActions.setAttribute('data-preference-owner', headerOwner);
        headerActions.style.display = 'flex';
    }
    if (admxActions) admxActions.style.display = 'none';
    if (helpSeparator) helpSeparator.style.display = 'none';

    function ownsHeader() {
        return Boolean(headerControls && headerControls.getAttribute('data-preference-owner') === headerOwner);
    }

    function setHeaderState() {
        if (typeof config.onFormStateChange === 'function') config.onFormStateChange(Boolean(modalState));
        if (!ownsHeader()) return;
        const editable = Boolean(documentDto.editable);
        const available = editable && !modalState && !opening && !deleting;
        if (createButton) createButton.classList.toggle('active', available);
        if (editButton) editButton.classList.toggle('active', available && selectedIdentity !== null);
        if (deleteButton) deleteButton.classList.toggle('active', available && selectedIdentity !== null);
    }

    function setOpening(value) {
        opening = Boolean(value);
        rootElement.classList.toggle('gpo-editor-preferences--opening', opening);
        if (opening) rootElement.setAttribute('aria-busy', 'true');
        else rootElement.removeAttribute('aria-busy');
        Array.prototype.forEach.call(
            rootElement.querySelectorAll('.gpo-editor-preference-table__actions button'),
            function (button) {
                button.disabled = opening;
            }
        );
        setHeaderState();
    }

    function addListener(target, name, handler) {
        if (!target) return;
        target.addEventListener(name, handler);
        cleanups.push(function () {
            target.removeEventListener(name, handler);
        });
    }

    function recoveryConflict(response) {
        const recovery = response && response.recovery;
        if (!recovery || recovery.kind !== 'conflict') return null;
        const error = /** @type {Error & { category?: string, details?: any }} */ (
            new Error('Preference publication reconciliation is still conflicted.')
        );
        error.category = 'publication_conflict';
        error.details = recovery.conflict || null;
        return error;
    }

    async function reconcilePage(event) {
        if (event && event.currentTarget) event.currentTarget.disabled = true;
        try {
            const response = await API.reconcile();
            const conflict = recoveryConflict(response);
            if (conflict) throw conflict;
            await loadItems();
        } catch (error) {
            showPageError(error);
        } finally {
            if (event && event.currentTarget) event.currentTarget.disabled = false;
        }
    }

    function showPageError(error) {
        const slot = rootElement.querySelector('.gpo-editor-preferences__error');
        if (!slot) return;
        slot.innerHTML = '';
        slot.appendChild(
            editorStatus
                .renderError(error, {
                    onRefresh: loadItems,
                    onReconcile: reconcilePage
                })
                .getElement()
        );
    }

    function renderTable() {
        const tableSlot = rootElement.querySelector('.gpo-editor-preferences__table');
        if (!tableSlot) return;
        const heldFocus = tableSlot.contains(document.activeElement);
        tableSlot.innerHTML = '';
        if (!items.length) {
            tableSlot.appendChild(
                createElement('div', {
                    className: 'gpo-editor-empty',
                    text: pt('emptyItems')
                }).getElement()
            );
            if (tableNavigation) {
                tableNavigation.sync();
                if (heldFocus) tableNavigation.focusSelected();
            }
            return;
        }
        const columns = tableColumns(item.preferenceKind);
        const useTemplate = Boolean(columns);
        const headerCells = useTemplate
            ? columns.map(function (column) {
                  return createElement('th', { text: pt(column.labelKey) });
              })
            : [
                  createElement('th', { text: pt('itemColumn') }),
                  createElement('th', { text: pt('filtersColumn') }),
                  createElement('th', { text: pt('actionsColumn') })
              ];

        function buildDataCells(preferenceItem, index) {
            if (!useTemplate) {
                return [
                    createElement('td', { text: preferenceItem.label }),
                    createElement('td', { text: preferenceItem.has_filters ? pt('yes') : pt('no') })
                ];
            }
            return columns.map(function (column) {
                let text = '';
                if (column.source === 'name') {
                    text = preferenceItem.label;
                } else if (column.source === 'order') {
                    text = String(index + 1);
                } else if (column.source === 'field') {
                    const value = cachedFieldValue(preferenceItem.identity, column.field);
                    text =
                        column.format === 'action'
                            ? actionLabel(value)
                            : value === null || value === undefined
                              ? ''
                              : String(value);
                }
                return createElement('td', { text: text });
            });
        }

        function buildActionsCell(preferenceItem) {
            return createElement('td', {
                className: 'gpo-editor-preference-table__actions',
                children: [
                    createElement('button', {
                        className: 'button',
                        attrs: {
                            type: 'button',
                            disabled: opening ? 'disabled' : null
                        },
                        text: documentDto.editable ? t('header.edit') : pt('viewTitle'),
                        events: {
                            click: function (event) {
                                event.stopPropagation();
                                selectItem(preferenceItem.identity);
                                void openForm(selectedIdentity);
                            }
                        }
                    })
                ]
            });
        }

        const bodyRows = items.map(function (preferenceItem, index) {
            const selected = selectedIdentity !== null && equal(selectedIdentity, preferenceItem.identity);
            const cells = buildDataCells(preferenceItem, index);
            if (!useTemplate) cells.push(buildActionsCell(preferenceItem));
            const row = createElement('tr', {
                className: selected ? 'active' : null,
                attrs: {
                    tabindex: '-1',
                    'data-preference-identity': cacheKey(preferenceItem.identity),
                    'aria-selected': selected ? 'true' : 'false'
                },
                children: cells,
                events: {
                    click: function () {
                        selectItem(preferenceItem.identity);
                        if (tableNavigation) tableNavigation.focusSelected();
                    },
                    dblclick: function () {
                        if (modalState || opening || deleting) return;
                        selectItem(preferenceItem.identity);
                        void openForm(selectedIdentity);
                    }
                }
            });
            row.getElement().__preferenceIdentity = preferenceItem.identity;
            return row;
        });

        const table = createElement('table', {
            className: ['preference__table', 'gpo-catalog-table'],
            children: [
                createElement('thead', { children: [createElement('tr', { children: headerCells })] }),
                createElement('tbody', { children: bodyRows })
            ]
        });
        tableSlot.appendChild(table.getElement());
        if (tableNavigation) {
            tableNavigation.sync();
            if (heldFocus) tableNavigation.focusSelected();
        }
    }

    function selectItem(identity) {
        selectedIdentity = clone(identity);
        Array.prototype.forEach.call(rootElement.querySelectorAll('[data-preference-identity]'), function (row) {
            const selected = equal(row.__preferenceIdentity, selectedIdentity);
            row.classList.toggle('active', selected);
            row.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        if (tableNavigation) tableNavigation.sync();
        setHeaderState();
        void requestInfoPanel(selectedIdentity);
    }

    function focusTable() {
        if (!disposed && (typeof config.isCurrent !== 'function' || config.isCurrent()) && tableNavigation) {
            tableNavigation.focusSelected();
        }
    }

    function cacheKey(identity) {
        return JSON.stringify(identity);
    }

    function cachedFieldValue(identity, fieldId) {
        const fields = itemFieldsCache.get(cacheKey(identity));
        if (!fields) return '';
        return itemFieldValue({ fields: fields }, fieldId);
    }

    function scheduleTableRefresh() {
        if (tableRefreshScheduled) return;
        tableRefreshScheduled = true;
        const run = function () {
            tableRefreshScheduled = false;
            if (typeof config.isCurrent === 'function' && !config.isCurrent()) return;
            renderTable();
        };
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(run);
        } else {
            setTimeout(run, 16);
        }
    }

    function ensureItemFields(identity) {
        const key = cacheKey(identity);
        if (itemFieldsCache.has(key)) {
            return Promise.resolve(itemFieldsCache.get(key));
        }
        const startedGeneration = fieldsRequestId;
        return API.preferenceShow(item.scope, item.preferenceKind, clone(identity)).then(function (response) {
            if (startedGeneration !== fieldsRequestId) return null;
            const fields = clone(response.fields || response.new_item_fields || []).map(function (field) {
                return scopeField(field, item.scope);
            });
            itemFieldsCache.set(key, fields);
            return fields;
        });
    }

    function prefetchTableFields() {
        const generation = ++fieldsRequestId;
        items.forEach(function (preferenceItem) {
            if (preferenceItem.identity === null || preferenceItem.identity === undefined) return;
            if (itemFieldsCache.has(cacheKey(preferenceItem.identity))) return;
            void ensureItemFields(preferenceItem.identity).then(function (fields) {
                if (!fields) return;
                if (generation !== fieldsRequestId) return;
                if (typeof config.isCurrent === 'function' && !config.isCurrent()) return;
                scheduleTableRefresh();
            });
        });
    }

    function invalidateCachedFields(identity) {
        itemFieldsCache.delete(cacheKey(identity));
        fieldsRequestId += 1;
    }

    async function loadItems() {
        const requestId = ++itemsRequestId;
        try {
            const response = await API.preferenceItems(item.scope, item.preferenceKind);
            if (requestId !== itemsRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            items = listFrom(response, 'items');
            if (
                selectedIdentity !== null &&
                !items.some(function (entry) {
                    return equal(entry.identity, selectedIdentity);
                })
            )
                selectedIdentity = null;
            const errorSlot = rootElement.querySelector('.gpo-editor-preferences__error');
            if (errorSlot) errorSlot.innerHTML = '';
            renderTable();
            setHeaderState();
            void prefetchTableFields();
            if (selectedIdentity !== null) {
                void requestInfoPanel(selectedIdentity);
            } else {
                resetInfoPanel();
            }
        } catch (error) {
            if (requestId !== itemsRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            showPageError(error);
        }
    }

    function buildInfoPanel() {
        const info = createElement('div', {
            className: ['preference__info', config.isHelpOpen ? 'is-open' : null]
        });
        const settings = createElement('div', { className: 'preference__settings' });
        settings.append(
            createElement('div', {
                className: 'preference__settings-title',
                text: pt('settingsTitle')
            })
        );
        settings.append(createElement('div', { className: 'preference__settings-data' }));
        info.append(settings);
        const description = createElement('div', { className: 'preference__description' });
        description.append(
            createElement('div', {
                className: 'preference__description-title',
                text: pt('descriptionTitle')
            })
        );
        description.append(
            createElement('div', {
                className: ['preference__description-data', 'empty'],
                text: pt('noDescription')
            })
        );
        info.append(description);
        return info;
    }

    function settingsItems() {
        return [
            { id: 'metadata.bypassErrors', label: pt('settingBypassErrors') },
            { id: 'metadata.removePolicy', label: pt('settingRemovePolicy') },
            { id: 'properties.disabled', label: pt('settingDisabled') }
        ];
    }

    function fieldCheckedState(field) {
        const v = field && field.value;
        const raw = v && typeof v === 'object' ? v.value : v;
        if (raw === null || raw === undefined) return null;
        if (raw === true || raw === 1) return true;
        if (raw === false || raw === 0) return false;
        return Boolean(raw);
    }

    function fieldText(field) {
        const v = field && field.value;
        const raw = v && typeof v === 'object' ? v.value : v;
        if (Array.isArray(raw)) return raw.join('\n');
        return raw === null || raw === undefined ? '' : String(raw);
    }

    function renderInfoPanel(fields) {
        const dataSlot = rootElement.querySelector('.preference__settings-data');
        const descSlot = rootElement.querySelector('.preference__description-data');
        if (!dataSlot || !descSlot) return;
        const byId = new Map();
        (Array.isArray(fields) ? fields : []).forEach(function (field) {
            if (field && field.id !== undefined && !byId.has(field.id)) byId.set(field.id, field);
        });
        dataSlot.innerHTML = '';
        settingsItems().forEach(function (spec) {
            const field = byId.get(spec.id);
            const label = (field && field.label) || spec.label;
            const value = fieldCheckedState(field);
            dataSlot.appendChild(
                createElement('div', {
                    className: 'preference__settings-item',
                    children: [
                        createElement('div', { className: 'preference__settings-name', text: label + ':' }),
                        createElement('div', {
                            className: 'preference__settings-value',
                            text: value === null ? '' : value ? pt('yes') : pt('no')
                        })
                    ]
                }).getElement()
            );
        });
        const descField = byId.get('metadata.desc');
        const descText = fieldText(descField);
        descSlot.innerHTML = '';
        if (descText) {
            descSlot.classList.remove('empty');
            descSlot.textContent = descText;
        } else {
            descSlot.classList.add('empty');
            descSlot.textContent = pt('noDescription');
        }
    }

    function resetInfoPanel() {
        renderInfoPanel([]);
    }

    async function requestInfoPanel(identity) {
        const requestId = ++infoRequestId;
        try {
            const fields = await ensureItemFields(identity);
            if (requestId !== infoRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            if (fields) renderInfoPanel(fields);
            else resetInfoPanel();
        } catch (error) {
            if (requestId !== infoRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            resetInfoPanel();
        }
    }

    function renderShell() {
        rootElement.innerHTML = '';
        const dataTable = createElement('div', { className: 'preference__data-table' });
        dataTable.append(
            createElement('div', {
                className: 'gpo-editor-preferences__header',
                children: [
                    config.hideHeading
                        ? null
                        : createElement('h2', {
                              text: config.categoryPath || documentDto.label || item.preferenceKind,
                              attrs: { 'data-category-path': '' }
                          }),
                    createElement('div', {
                        className: [
                            'gpo-editor-document-state',
                            documentDto.editable ? null : 'gpo-editor-document-state--readonly'
                        ],
                        text: documentDto.editable ? pt('documentEditable') : pt('documentReadOnly')
                    })
                ]
            })
        );
        dataTable.append(createElement('div', { className: 'gpo-editor-preferences__error' }));
        dataTable.append(createElement('div', { className: 'gpo-editor-preferences__table' }));
        if (!config.modalHost)
            dataTable.append(createElement('div', { className: 'gpo-editor-preferences__modal-host' }));
        rootElement.appendChild(dataTable.getElement());
        rootElement.appendChild(buildInfoPanel().getElement());
        resetInfoPanel();
    }

    function buildFilterEditor(showResult, formState, readonly) {
        return render({
            showResult: showResult,
            formState: formState,
            readonly: readonly,
            scope: item.scope,
            language: getLanguage(),
            pt: pt,
            fieldControl: fieldControl,
            validationMessage: validationMessage
        });
    }

    async function openForm(identity) {
        const creating = identity === null || identity === undefined;
        if (creating && !documentDto.editable) return;
        if (opening) return false;
        if (modalState && !closeForm(false, 'close')) return;
        const host = config.modalHost || rootElement.querySelector('.gpo-editor-preferences__modal-host');
        if (!host) return;
        const requestId = ++formRequestId;
        setOpening(true);
        try {
            const response = await API.preferenceShow(item.scope, item.preferenceKind, identity);
            if (requestId !== formRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            const readonly = !documentDto.editable;
            const fields = dto
                .clone(creating ? response.new_item_fields || response.fields || [] : response.fields || [])
                .map(function (field) {
                    return scopeField(field, item.scope);
                });
            if (!creating) {
                infoRequestId += 1;
                renderInfoPanel(fields);
            }
            const parentCandidates =
                creating && Array.isArray(response.parent_candidates) ? clone(response.parent_candidates) : [];
            const controls = [];
            const controlsById = new Map();
            const fieldTabs = buildFieldTabs(fields, {
                controls: controls,
                controlsById: controlsById,
                readonly: readonly,
                creating: creating,
                layout: PREFERENCE_LAYOUTS[item.preferenceKind] || null
            });
            const formState = {
                dirty: false,
                busy: false,
                readFilterResult: function () {
                    return { operations: [], errors: [] };
                }
            };
            const errorSlot = createElement('div', { className: 'gpo-editor-preference-form__error' });
            const validationSlot = createElement('div', {
                className: 'gpo-editor-preference-form__validation',
                attrs: { role: 'alert' }
            });
            const originalName = response.item && response.item.label !== undefined ? String(response.item.label) : '';
            let nameInput = null;
            let nameField = null;
            let nameError = null;
            let parentSelect = null;
            let parentField = null;
            if (!creating) {
                nameInput = createElement('input', {
                    attrs: {
                        type: 'text',
                        value: originalName,
                        required: 'required',
                        disabled: readonly ? 'disabled' : null
                    }
                });
                nameError = createElement('span', { className: 'gpo-editor-field__error' });
                nameField = createElement('div', {
                    className: ['field', 'field__input', readonly ? 'field--readonly' : null],
                    attrs: { 'data-field-id': 'name' },
                    children: [
                        createElement('div', {
                            className: 'field__label',
                            children: [
                                createElement('span', { text: pt('rename') }),
                                createElement('span', { className: 'gpo-editor-field__required', text: '*' })
                            ]
                        }),
                        createElement('div', {
                            className: 'field__element',
                            children: [nameInput, nameError]
                        })
                    ]
                });
            }
            if (creating && parentCandidates.length > 1) {
                parentSelect = createElement('select', {
                    attrs: { 'aria-label': pt('parent') },
                    children: parentCandidates.map(function (candidate, index) {
                        return createElement('option', {
                            attrs: { value: String(index) },
                            text: parentCandidateLabel(candidate)
                        });
                    })
                });
                const rootParentIndex = parentCandidates.findIndex(function (candidate) {
                    return candidate && candidate.identity === null;
                });
                parentSelect.getElement().value = String(rootParentIndex < 0 ? 0 : rootParentIndex);
                parentField = createElement('label', {
                    className: ['gpo-editor-field', 'gpo-editor-preference-parent'],
                    attrs: { 'data-field-id': 'parent' },
                    children: [
                        createElement('span', {
                            className: 'gpo-editor-field__label',
                            text: pt('parent')
                        }),
                        parentSelect
                    ]
                });
            }
            const saveButton = readonly
                ? null
                : createElement('button', {
                      className: ['button', 'btn-ok'],
                      attrs: { type: 'button' },
                      text: pt('save'),
                      events: {
                          click: function () {
                              void saveForm();
                          }
                      }
                  });
            const closeAction = function () {
                closeForm(false, 'close');
            };
            const cancelAction = function () {
                closeForm(false, 'cancel');
            };
            const filterSection = createElement('div', { className: 'preference__modal-filters' });
            filterSection.append(buildFilterEditor(response, formState, readonly));
            const targeting = createTargetingModal({
                host,
                filterSection,
                readonly,
                formState,
                getForm: () => form.getElement(),
                getOpener: () => targettingButton.getElement()
            });
            const wrapElement = ElementCreator.wrap;
            const formBody = createBody(null);
            formBody.append(validationSlot.getElement());
            formBody.append(errorSlot.getElement());
            formBody.append(createElement('div', { className: 'gpo-editor-fields' }).getElement());
            if (fieldTabs) formBody.append(fieldTabs.getElement());
            const formClose = wrapElement(createCloseButton(pt('close')));
            formClose.on('click', closeAction);
            const formCancel = wrapElement(createDialogButton('cancel', readonly ? pt('close') : pt('cancel')));
            formCancel.on('click', readonly ? closeAction : cancelAction);
            const formShell = createDialogShell({
                titleId: 'gpo-editor-preference-form-title',
                title: creating ? pt('createTitle') : readonly ? pt('viewTitle') : pt('editTitle'),
                body: formBody,
                closeButton: formClose.getElement(),
                buttons: readonly ? [formCancel.getElement()] : [formCancel.getElement(), saveButton.getElement()],
                width: '408px',
                className: ['gpo-editor-preference-form', readonly ? 'gpo-editor-dialog--readonly' : null]
                    .filter(Boolean)
                    .join(' '),
                hostClassName: 'gpo-editor-preference-host'
            });
            const form = wrapElement(formShell.dialog);
            form.on('keydown', function (event) {
                if (
                    event.defaultPrevented ||
                    event.target.closest('[role="dialog"], [role="alertdialog"]') !== form.getElement()
                )
                    return;
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    closeAction();
                }
                trapTab(event, form.getElement());
            });
            const fieldSlot = form.getElement().querySelector('.gpo-editor-fields');
            if (nameField) {
                const basicTab = form.getElement().querySelector('#tab-basic');
                const targetTypeField = basicTab && basicTab.querySelector('[data-field-id="properties.targetType"]');
                if (targetTypeField && targetTypeField.parentNode) {
                    targetTypeField.parentNode.insertBefore(nameField.getElement(), targetTypeField);
                } else if (basicTab) {
                    basicTab.insertBefore(nameField.getElement(), basicTab.firstChild);
                } else if (fieldSlot) {
                    fieldSlot.appendChild(nameField.getElement());
                }
            }
            if (parentField && fieldSlot) fieldSlot.appendChild(parentField.getElement());
            const targettingButton = createElement('button', {
                className: ['button', 'preference__tab-targetting-btn'],
                attrs: { type: 'button' },
                text: pt('targettingButton'),
                events: {
                    click: function () {
                        if (formState.busy) return;
                        formState.beginFilterDraft();
                        targeting.open();
                    }
                }
            });
            const generalTabElement = form.getElement().querySelector('#tab-general');
            const descriptionField =
                generalTabElement && generalTabElement.querySelector('[data-field-id="metadata.desc"]');
            if (generalTabElement && descriptionField && descriptionField.parentNode) {
                descriptionField.parentNode.insertBefore(targettingButton.getElement(), descriptionField);
            } else if (generalTabElement) {
                generalTabElement.appendChild(targettingButton.getElement());
            } else {
                const formContentSlot = form.getElement().querySelector('[data-dialog-part="body"]');
                if (formContentSlot) formContentSlot.appendChild(targettingButton.getElement());
            }
            if (!readonly) {
                form.getElement().addEventListener('input', function () {
                    if (!formState.busy) formState.dirty = true;
                });
                form.getElement().addEventListener('change', function () {
                    if (!formState.busy) formState.dirty = true;
                });
            }
            host.innerHTML = '';
            host.appendChild(formShell.host);
            host.classList.add('active');
            form.getElement().classList.add('active');
            modalState = {
                creating: creating,
                readonly: readonly,
                identity: clone(identity),
                descriptors: fields,
                controls: controls,
                controlsById: controlsById,
                originalName: originalName,
                nameInput: nameInput && nameInput.getElement(),
                nameField: nameField && nameField.getElement(),
                nameError: nameError && nameError.getElement(),
                parentCandidates: parentCandidates,
                parentSelect: parentSelect && parentSelect.getElement(),
                formState: formState,
                formElement: form.getElement(),
                validationSlot: validationSlot.getElement(),
                errorSlot: errorSlot.getElement(),
                saveButton: saveButton && saveButton.getElement(),
                closeButtons: [
                    form.getElement().querySelector('.close'),
                    form.getElement().querySelector('.btn-cancel')
                ].filter(Boolean),
                busyDisabledStates: new Map(),
                saving: false,
                reconciling: false,
                requiresRefresh: false,
                blockedDescriptors: false
            };
            if (modalState.nameInput && !readonly) {
                modalState.nameInput.addEventListener('input', function () {
                    if (modalState.nameError.textContent) setNameError(modalState, '');
                });
            }
            const duplicates = preferenceFieldIds(fields).duplicates;
            if (!readonly && duplicates.length) {
                modalState.blockedDescriptors = true;
                modalState.formElement.classList.add('gpo-editor-preference-form--invalid');
                modalState.validationSlot.textContent = pt('validationFixErrors');
                duplicates.forEach(function (id) {
                    (controlsById.get(id) || []).forEach(function (control) {
                        control.setError(pt('validationFixErrors'));
                    });
                });
            }
            const dependencyRules = dependencyRulesFor(item.preferenceKind);
            if (dependencyRules.length && !readonly) {
                const dependencies = attachFieldDependencies(modalState.formElement, controlsById, dependencyRules);
                modalState.dependencyDisabledIds = dependencies.disabledIds;
                dependencies.sync();
            }
            syncFormBusy(modalState);
            setHeaderState();
        } catch (error) {
            if (requestId === formRequestId) showPageError(error);
        } finally {
            if (requestId === formRequestId) setOpening(false);
        }
    }

    function showDiscardModal(action) {
        if (discardModal) return;
        pendingDiscard = { action: action };
        if (modalState && modalState.formElement) {
            modalState.formElement.classList.add('gpo-editor-preference-form--confirming');
            if (modalState.formElement.closest('[data-dialog-host]')) {
                const targettingModal = modalState.formElement
                    .closest('[data-dialog-host]')
                    .parentNode.querySelector('.targetting__modal');
                if (targettingModal) {
                    targettingModal.classList.add('gpo-editor-preference-form--confirming');
                }
            }
        }
        discardModal = confirmationDialog.open(config.modalHost || rootElement, {
            message: pt(action === 'cancel' ? 'confirmCancelDiscard' : 'confirmCloseDiscard'),
            onCancel: function () {
                handleDiscardModalChoice(false);
            },
            onConfirm: function () {
                handleDiscardModalChoice(true);
            }
        });
    }

    function hideDiscardModal() {
        if (discardModal) {
            discardModal.close();
            discardModal = null;
        }
        const confirmingForms = (config.modalHost || rootElement).querySelectorAll(
            '.gpo-editor-preference-form--confirming'
        );
        Array.prototype.forEach.call(confirmingForms, function (formElement) {
            formElement.classList.remove('gpo-editor-preference-form--confirming');
        });
    }

    function handleDiscardModalChoice(confirmed) {
        const pending = pendingDiscard;
        pendingDiscard = null;
        hideDiscardModal();
        if (!confirmed || !pending) return;
        closeForm(true, pending.action);
    }

    function closeHostModals(host) {
        host.classList.remove('active');
        const modals = Array.prototype.slice.call(host.children);
        modals.forEach(function (element) {
            Array.prototype.forEach.call(element.querySelectorAll('[data-dialog].active'), function (dialog) {
                dialog.classList.remove('active');
            });
        });
        setTimeout(function () {
            modals.forEach(function (element) {
                if (!element.querySelector('[data-dialog].active') && element.parentNode === host) {
                    host.removeChild(element);
                }
            });
        }, 500);
    }

    function closeForm(force, action) {
        const state = modalState;
        if (state && (state.saving || state.reconciling) && action !== 'saved' && action !== 'cleanup') return false;
        if (!force && state && state.formState.dirty) {
            if (pendingDiscard) return false;
            showDiscardModal(action);
            return false;
        }
        pendingDiscard = null;
        hideDiscardModal();
        formRequestId += 1;
        const host = config.modalHost || rootElement.querySelector('.gpo-editor-preferences__modal-host');
        if (host) closeHostModals(host);
        modalState = null;
        setHeaderState();
        if (action !== 'cleanup' && action !== 'navigation') focusTable();
        return true;
    }

    function renderFormError(state, error) {
        if (modalState !== state) return;
        state.errorSlot.innerHTML = '';
        const category = errorCategory(error).replace(/-/g, '_');
        const actions = {
            onReconcile: async function (event) {
                if (state.reconciling || state.saving) return;
                const button = event && event.currentTarget;
                if (button) button.disabled = true;
                state.reconciling = true;
                syncFormBusy(state);
                try {
                    const response = await API.reconcile();
                    const conflict = recoveryConflict(response);
                    if (conflict) throw conflict;
                    if (modalState === state) {
                        state.requiresRefresh = true;
                        renderReconcileSuccess(state);
                        await loadItems();
                    }
                } catch (reconcileError) {
                    renderFormError(state, reconcileError);
                } finally {
                    state.reconciling = false;
                    syncFormBusy(state);
                    if (button && modalState === state) button.disabled = false;
                }
            }
        };
        if (category === 'storage_conflict' || category === 'publication_conflict' || category === 'not_found') {
            actions.onRefresh = function () {
                if (!window.confirm(pt('confirmRefreshDiscard'))) return;
                closeForm(true);
                void loadItems();
            };
        }
        state.errorSlot.appendChild(renderError(error, actions).getElement());
        markServerFieldError(state, error);
        syncFormBusy(state);
    }

    function renderReconcileSuccess(state) {
        if (modalState !== state) return;
        state.errorSlot.innerHTML = '';
        state.errorSlot.appendChild(
            createElement('div', {
                className: ['gpo-editor-preference-notice', 'gpo-editor-preference-notice--info'],
                attrs: { role: 'status' },
                children: [
                    createElement('span', { text: pt('reconcileSucceededRefresh') }),
                    createElement('button', {
                        className: 'button',
                        attrs: { type: 'button', 'data-editor-status-action': '' },
                        text: pt('refresh'),
                        events: {
                            click: function () {
                                if (!window.confirm(pt('confirmRefreshDiscard'))) return;
                                closeForm(true, 'refresh');
                                void loadItems();
                            }
                        }
                    })
                ]
            }).getElement()
        );
        syncFormBusy(state);
    }

    async function saveForm() {
        if (!modalState || modalState.readonly) return true;
        const state = modalState;
        if (state.saving || state.reconciling || state.requiresRefresh || state.blockedDescriptors) return false;
        clearFormErrors(state);
        const draftFields = state.controls.map(function (control) {
            return { id: control.id, value: control.read() };
        });
        const filterResult = state.formState.readFilterResult();
        const result = buildPreferenceRequest({
            creating: state.creating,
            identity: state.identity,
            descriptors: state.descriptors,
            fields: draftFields,
            name: state.nameInput ? state.nameInput.value : null,
            originalName: state.originalName,
            parent: state.parentSelect
                ? preferenceParentIdentity(state.parentCandidates, state.parentSelect.value)
                : null,
            filters: filterResult.operations,
            validationExemptions: state.dependencyDisabledIds || []
        });
        const errors = result.errors.concat(filterResult.errors || []);
        if (errors.length) {
            state.formElement.classList.add('gpo-editor-preference-form--invalid');
            state.validationSlot.textContent = pt('validationFixErrors');
            let firstControl = null;
            errors.forEach(function (error) {
                if (error.path) return;
                if (error.id === 'name') {
                    setNameError(state, validationMessage(error.code));
                    if (!firstControl && state.nameInput) firstControl = state.nameInput;
                    return;
                }
                (state.controlsById.get(error.id) || []).forEach(function (control) {
                    control.setError(validationMessage(error.code));
                    if (!firstControl) firstControl = control;
                });
            });
            if (firstControl && typeof firstControl.focus === 'function') firstControl.focus();
            return false;
        }
        if (!result.request) {
            closeForm(true, 'saved');
            return true;
        }
        state.saving = true;
        syncFormBusy(state);
        state.saveButton.textContent = pt('saving');
        try {
            const response = state.creating
                ? await API.preferenceCreate(item.scope, item.preferenceKind, result.request)
                : await API.preferenceUpdate(item.scope, item.preferenceKind, result.request);
            const conflict = recoveryConflict(response);
            if (conflict) throw conflict;
            if (!state.creating) invalidateCachedFields(state.identity);
            closeForm(true, 'saved');
            await loadItems();
            if (typeof config.onSaved === 'function') config.onSaved(response);
            return true;
        } catch (error) {
            renderFormError(state, error);
            return false;
        } finally {
            state.saving = false;
            if (modalState === state) {
                state.saveButton.textContent = pt('save');
                syncFormBusy(state);
            }
        }
    }

    async function deleteSelected() {
        if (!documentDto.editable || selectedIdentity === null || modalState || opening || deleting || disposed) return;
        if (!window.confirm(pt('confirmDelete'))) return;
        const identity = clone(selectedIdentity);
        const before = items.map(function (entry) {
            return cacheKey(entry.identity);
        });
        let removed = false;
        deleting = true;
        setHeaderState();
        if (deleteButton) deleteButton.disabled = true;
        try {
            const response = await API.preferenceDelete(item.scope, item.preferenceKind, identity);
            invalidateCachedFields(identity);
            await loadItems();
            if (disposed || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            const next = neighbor(
                before,
                [cacheKey(identity)],
                items.map(function (entry) {
                    return cacheKey(entry.identity);
                })
            );
            const survivor = items.find(function (entry) {
                return cacheKey(entry.identity) === next;
            });
            selectedIdentity = survivor ? clone(survivor.identity) : null;
            renderTable();
            setHeaderState();
            removed = true;
            if (typeof config.onSaved === 'function') config.onSaved(response);
        } catch (error) {
            showPageError(error);
        } finally {
            deleting = false;
            setHeaderState();
            if (deleteButton && ownsHeader()) deleteButton.disabled = false;
            if (removed && !disposed && (typeof config.isCurrent !== 'function' || config.isCurrent())) focusTable();
        }
    }

    renderShell();
    const tableSlot = rootElement.querySelector('.gpo-editor-preferences__table');
    tableNavigation = bind(tableSlot, {
        rows: function () {
            return Array.from(tableSlot.querySelectorAll('[data-preference-identity]'));
        },
        selected: function () {
            return tableSlot.querySelector('tr.active');
        },
        select: function (row) {
            selectItem(row.__preferenceIdentity);
        },
        activate: function (row) {
            void openForm(clone(row.__preferenceIdentity));
        },
        remove: function () {
            void deleteSelected();
        },
        canRemove: function () {
            return Boolean(documentDto.editable);
        },
        busy: function () {
            return disposed || opening || deleting || Boolean(modalState);
        }
    });
    setHeaderState();
    addListener(createButton, 'click', function () {
        if (createButton.classList.contains('active')) void openForm(null);
    });
    addListener(editButton, 'click', function () {
        if (editButton.classList.contains('active')) void openForm(selectedIdentity);
    });
    addListener(deleteButton, 'click', function () {
        if (deleteButton.classList.contains('active')) void deleteSelected();
    });
    await loadItems();

    root.hasUnsavedChanges = function () {
        return Boolean(
            modalState &&
            (modalState.formState.dirty || modalState.saving || modalState.reconciling || modalState.requiresRefresh)
        );
    };
    root.applyChanges = saveForm;
    root.isBusy = function () {
        return Boolean(modalState && (modalState.saving || modalState.reconciling));
    };
    root.cancelChanges = function () {
        return closeForm(true, 'navigation');
    };
    root.cleanup = function () {
        disposed = true;
        tableNavigation.cleanup();
        itemsRequestId += 1;
        formRequestId += 1;
        cleanups.splice(0).forEach(function (cleanup) {
            cleanup();
        });
        closeForm(true, 'cleanup');
        if (ownsHeader()) {
            headerControls.style.display = 'none';
            headerControls.removeAttribute('data-preference-owner');
            [createButton, editButton, deleteButton].forEach(function (button) {
                if (button) button.classList.remove('active');
            });
        }
        if (headerActions && headerActions.getAttribute('data-preference-owner') === headerOwner) {
            headerActions.style.display = '';
            headerActions.removeAttribute('data-preference-owner');
            if (admxActions) admxActions.style.display = '';
            if (helpSeparator) helpSeparator.style.display = '';
        }
    };
    return root;
}

async function openPreferencesDialog(host, options) {
    const config = options || {};
    const item = config.item || {};
    let closed = false;
    let editor = null;
    const nestedHost = createElement('div', {
        className: ['gp__preference', 'gpo-editor-preferences__modal-host']
    });
    const controls = createElement('div', {
        className: ['gp__control', 'gpo-security-workbench__toolbar'],
        children: [
            createElement('button', {
                className: ['button', 'preferences__btn-create'],
                attrs: { type: 'button' },
                text: t('header.create')
            }),
            createElement('button', {
                className: ['button', 'preferences__btn-edit'],
                attrs: { type: 'button' },
                text: t('header.edit')
            }),
            createElement('button', {
                className: ['button', 'preferences__btn-delete'],
                attrs: { type: 'button' },
                text: t('header.delete')
            })
        ]
    });
    const content = createElement('div', {
        className: 'gpo-preferences-family-dialog__content',
        children: [controls, createElement('div', { className: 'gpo-editor-empty', text: t('policySearch.loading') })]
    });
    // The existing controller can own a local toolbar without touching the
    // All Policies header. Keep its controls in the visible dialog content.
    const dialog = editorDialog.open(host, {
        title: item.title || (item.document && item.document.label) || item.preferenceKind,
        className: ['gpo-preferences-family-dialog'],
        width: 'min(680px, calc(100vw - 32px))',
        content: content,
        readOnly: true,
        cancelLabel: pt('close'),
        canClose: function () {
            return !editor || !editor.isBusy();
        },
        isDirty: function () {
            return Boolean(editor && editor.hasUnsavedChanges());
        },
        onClose: function () {
            closed = true;
            if (editor) editor.cleanup();
            nestedHost.getElement().remove();
            if (config.onClose) config.onClose();
        },
        restoreFocus: config.restoreFocus
    });
    // Place item dialogs beside the family modal within its backdrop:
    // transformed modal bounds must not clip their existing fixed layout.
    dialog.root.getElement().parentElement.appendChild(nestedHost.getElement());
    const localDocument = Object.assign({}, item.document || {});
    if (item.readOnly) localDocument.editable = false;
    editor = await renderPreferencesTemplate({
        item: Object.assign({}, item, { document: localDocument }),
        hideHeading: true,
        header: {
            getElement: function () {
                return content.getElement();
            }
        },
        modalHost: nestedHost.getElement(),
        onFormStateChange: function (opened) {
            dialog.root.getElement().inert = opened;
        },
        onSaved: config.onSaved,
        isCurrent: function () {
            return !closed && (typeof config.isCurrent !== 'function' || config.isCurrent());
        }
    });
    if (closed || (typeof config.isCurrent === 'function' && !config.isCurrent())) {
        editor.cleanup();
        dialog.close();
        return null;
    }
    content.getElement().replaceChildren(controls.getElement(), editor.getElement());
    return { editor: editor, dialog: dialog };
}

const _test = {
    fieldControl: fieldControl,
    mockupFieldControl: mockupFieldControl,
    buildFieldTabs: buildFieldTabs,
    orderedTabEntries: orderedTabEntries,
    isMetadataField: isMetadataField,
    filterKey: filterKey,
    editableFields: editableFields
};

export { renderPreferencesTemplate, openPreferencesDialog, _test };
