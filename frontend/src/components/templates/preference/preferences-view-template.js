import * as elementCreator from '../../../util/element-creator';
import * as API from '../../../util/API';
import * as dto from '../../../util/editor-dto';
import * as editorStatus from '../../editor-status';
import * as confirmationDialog from '../../confirmation-dialog';
import * as editorDialog from '../../editor-dialog';
import * as listNavigation from '../../list-navigation';
import * as translations from '../../../locales/translations';
import * as preferenceLayouts from './layouts/index';
import * as targetingEditor from './targeting-editor';
import * as commonModule from './view/common';
import * as fieldControlModule from './view/field-control';
import * as fieldTabsModule from './view/field-tabs';
import * as fieldDependenciesModule from './view/field-dependencies';

('use strict');

var createElement = elementCreator.createElement;
var t = translations.t;
var nextHeaderOwnerId = 1;

var PREFERENCE_LAYOUTS = preferenceLayouts;
var pt = commonModule.pt;
var tableColumns = commonModule.tableColumns;
var actionLabel = commonModule.actionLabel;
var itemFieldValue = commonModule.itemFieldValue;
var scopeField = commonModule.scopeField;
var listFrom = commonModule.listFrom;
var validationMessage = commonModule.validationMessage;
var parentCandidateLabel = commonModule.parentCandidateLabel;
var filterKey = commonModule.filterKey;
var editableFields = commonModule.editableFields;
var fieldControl = fieldControlModule.fieldControl;
var mockupFieldControl = fieldControlModule.mockupFieldControl;
var buildFieldTabs = fieldTabsModule.buildFieldTabs;
var orderedTabEntries = fieldTabsModule.orderedTabEntries;
var isMetadataField = fieldTabsModule.isMetadataField;
var dependencyRulesFor = fieldDependenciesModule.dependencyRulesFor;
var attachFieldDependencies = fieldDependenciesModule.attachFieldDependencies;

async function renderPreferencesTemplate(options) {
    var config = options || {};
    var item = config.item || {};
    var documentDto = item.document || {};
    var root = createElement('div', {
        className: ['gp__preference', 'gpo-editor-preferences']
    });
    var rootElement = root.getElement();
    var headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
    var headerControls = headerElement ? headerElement.querySelector('.gp__control') : null;
    var headerActions = headerElement ? headerElement.querySelector('.gp__control-actions') : null;
    var admxActions = headerElement ? headerElement.querySelector('.gp__control-admx') : null;
    var helpSeparator = headerElement ? headerElement.querySelector('.gp__control-separator') : null;
    var createButton = headerControls ? headerControls.querySelector('.preferences__btn-create') : null;
    var editButton = headerControls ? headerControls.querySelector('.preferences__btn-edit') : null;
    var deleteButton = headerControls ? headerControls.querySelector('.preferences__btn-delete') : null;
    var headerOwner = 'preferences-' + nextHeaderOwnerId++;
    var items = [];
    var selectedIdentity = null;
    var modalState = null;
    var opening = false;
    var pendingDiscard = null;
    var discardModal = null;
    var cleanups = [];
    var formRequestId = 0;
    var itemsRequestId = 0;
    var infoRequestId = 0;
    var itemFieldsCache = new Map();
    var fieldsRequestId = 0;
    var tableRefreshScheduled = false;
    var deleting = false;
    var disposed = false;
    var tableNavigation;

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
        var editable = Boolean(documentDto.editable);
        var available = editable && !modalState && !opening && !deleting;
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
        var recovery = response && response.recovery;
        if (!recovery || recovery.kind !== 'conflict') return null;
        var error = /** @type {Error & { category?: string, details?: any }} */ (
            new Error('Preference publication reconciliation is still conflicted.')
        );
        error.category = 'publication_conflict';
        error.details = recovery.conflict || null;
        return error;
    }

    async function reconcilePage(event) {
        if (event && event.currentTarget) event.currentTarget.disabled = true;
        try {
            var response = await API.reconcile();
            var conflict = recoveryConflict(response);
            if (conflict) throw conflict;
            await loadItems();
        } catch (error) {
            showPageError(error);
        } finally {
            if (event && event.currentTarget) event.currentTarget.disabled = false;
        }
    }

    function showPageError(error) {
        var slot = rootElement.querySelector('.gpo-editor-preferences__error');
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
        var tableSlot = rootElement.querySelector('.gpo-editor-preferences__table');
        if (!tableSlot) return;
        var heldFocus = tableSlot.contains(document.activeElement);
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
        var columns = tableColumns(item.preferenceKind);
        var useTemplate = Boolean(columns);
        var headerCells = useTemplate
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
                var text = '';
                if (column.source === 'name') {
                    text = preferenceItem.label;
                } else if (column.source === 'order') {
                    text = String(index + 1);
                } else if (column.source === 'field') {
                    var value = cachedFieldValue(preferenceItem.identity, column.field);
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

        var bodyRows = items.map(function (preferenceItem, index) {
            var selected = selectedIdentity !== null && dto.equal(selectedIdentity, preferenceItem.identity);
            var cells = buildDataCells(preferenceItem, index);
            if (!useTemplate) cells.push(buildActionsCell(preferenceItem));
            var row = createElement('tr', {
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

        var table = createElement('table', {
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
        selectedIdentity = dto.clone(identity);
        Array.prototype.forEach.call(rootElement.querySelectorAll('[data-preference-identity]'), function (row) {
            var selected = dto.equal(row.__preferenceIdentity, selectedIdentity);
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
        var fields = itemFieldsCache.get(cacheKey(identity));
        if (!fields) return '';
        return itemFieldValue({ fields: fields }, fieldId);
    }

    function scheduleTableRefresh() {
        if (tableRefreshScheduled) return;
        tableRefreshScheduled = true;
        var run = function () {
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
        var key = cacheKey(identity);
        if (itemFieldsCache.has(key)) {
            return Promise.resolve(itemFieldsCache.get(key));
        }
        var startedGeneration = fieldsRequestId;
        return API.preferenceShow(item.scope, item.preferenceKind, dto.clone(identity)).then(function (response) {
            if (startedGeneration !== fieldsRequestId) return null;
            var fields = dto.clone(response.fields || response.new_item_fields || []).map(function (field) {
                return scopeField(field, item.scope);
            });
            itemFieldsCache.set(key, fields);
            return fields;
        });
    }

    function prefetchTableFields() {
        var generation = ++fieldsRequestId;
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
        var requestId = ++itemsRequestId;
        try {
            var response = await API.preferenceItems(item.scope, item.preferenceKind);
            if (requestId !== itemsRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            items = listFrom(response, 'items');
            if (
                selectedIdentity !== null &&
                !items.some(function (entry) {
                    return dto.equal(entry.identity, selectedIdentity);
                })
            )
                selectedIdentity = null;
            var errorSlot = rootElement.querySelector('.gpo-editor-preferences__error');
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
        var info = createElement('div', {
            className: ['preference__info', config.isHelpOpen ? 'is-open' : null]
        });
        var settings = createElement('div', { className: 'preference__settings' });
        settings.append(
            createElement('div', {
                className: 'preference__settings-title',
                text: pt('settingsTitle')
            })
        );
        settings.append(createElement('div', { className: 'preference__settings-data' }));
        info.append(settings);
        var description = createElement('div', { className: 'preference__description' });
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
        var v = field && field.value;
        var raw = v && typeof v === 'object' ? v.value : v;
        if (raw === null || raw === undefined) return null;
        if (raw === true || raw === 1) return true;
        if (raw === false || raw === 0) return false;
        return Boolean(raw);
    }

    function fieldText(field) {
        var v = field && field.value;
        var raw = v && typeof v === 'object' ? v.value : v;
        if (Array.isArray(raw)) return raw.join('\n');
        return raw === null || raw === undefined ? '' : String(raw);
    }

    function renderInfoPanel(fields) {
        var dataSlot = rootElement.querySelector('.preference__settings-data');
        var descSlot = rootElement.querySelector('.preference__description-data');
        if (!dataSlot || !descSlot) return;
        var byId = new Map();
        (Array.isArray(fields) ? fields : []).forEach(function (field) {
            if (field && field.id !== undefined && !byId.has(field.id)) byId.set(field.id, field);
        });
        dataSlot.innerHTML = '';
        settingsItems().forEach(function (spec) {
            var field = byId.get(spec.id);
            var label = (field && field.label) || spec.label;
            var value = fieldCheckedState(field);
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
        var descField = byId.get('metadata.desc');
        var descText = fieldText(descField);
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
        var requestId = ++infoRequestId;
        try {
            var fields = await ensureItemFields(identity);
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
        var dataTable = createElement('div', { className: 'preference__data-table' });
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
        return targetingEditor.render({
            showResult: showResult,
            formState: formState,
            readonly: readonly,
            scope: item.scope,
            language: translations.getLanguage(),
            pt: pt,
            fieldControl: fieldControl,
            validationMessage: validationMessage
        });
    }

    async function openForm(identity) {
        var creating = identity === null || identity === undefined;
        if (creating && !documentDto.editable) return;
        if (opening) return false;
        if (modalState && !closeForm(false, 'close')) return;
        var host = config.modalHost || rootElement.querySelector('.gpo-editor-preferences__modal-host');
        if (!host) return;
        var requestId = ++formRequestId;
        setOpening(true);
        try {
            var response = await API.preferenceShow(item.scope, item.preferenceKind, identity);
            if (requestId !== formRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            var readonly = !documentDto.editable;
            var fields = dto
                .clone(creating ? response.new_item_fields || response.fields || [] : response.fields || [])
                .map(function (field) {
                    return scopeField(field, item.scope);
                });
            if (!creating) {
                infoRequestId += 1;
                renderInfoPanel(fields);
            }
            var parentCandidates =
                creating && Array.isArray(response.parent_candidates) ? dto.clone(response.parent_candidates) : [];
            var controls = [];
            var controlsById = new Map();
            var fieldTabs = buildFieldTabs(fields, {
                controls: controls,
                controlsById: controlsById,
                readonly: readonly,
                creating: creating,
                layout: PREFERENCE_LAYOUTS[item.preferenceKind] || null
            });
            var formState = {
                dirty: false,
                busy: false,
                readFilterResult: function () {
                    return { operations: [], errors: [] };
                }
            };
            var errorSlot = createElement('div', { className: 'gpo-editor-preference-form__error' });
            var validationSlot = createElement('div', {
                className: 'gpo-editor-preference-form__validation',
                attrs: { role: 'alert' }
            });
            var originalName = response.item && response.item.label !== undefined ? String(response.item.label) : '';
            var nameInput = null;
            var nameField = null;
            var nameError = null;
            var parentSelect = null;
            var parentField = null;
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
                var rootParentIndex = parentCandidates.findIndex(function (candidate) {
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
            var saveButton = readonly
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
            var closeAction = function () {
                closeForm(false, 'close');
            };
            var cancelAction = function () {
                closeForm(false, 'cancel');
            };
            var filterSection = createElement('div', { className: 'preference__modal-filters' });
            filterSection.append(buildFilterEditor(response, formState, readonly));
            var targettingModalElement = null;
            var closeTargettingModal = function (accept) {
                if (accept && !readonly && !formState.acceptFilterDraft()) return;
                if (!accept) formState.cancelFilterDraft();
                if (targettingModalElement) {
                    targettingModalElement.classList.remove('active');
                    targettingModalElement.inert = true;
                }
                form.getElement().classList.remove('dimmed');
                form.getElement().inert = false;
                if (targettingButton) targettingButton.getElement().focus();
            };
            var buildTargettingModal = function () {
                if (targettingModalElement) return targettingModalElement;
                targettingModalElement = createElement('div', {
                    className: [
                        'targetting__modal',
                        'preference__modal',
                        readonly ? 'preference__modal--readonly' : null
                    ],
                    attrs: {
                        role: 'dialog',
                        'aria-modal': 'true',
                        'aria-label': pt('targettingTitle'),
                        tabindex: '-1'
                    },
                    children: [
                        createElement('div', {
                            className: 'preference__modal-wrapper',
                            children: [
                                createElement('div', {
                                    className: 'preference__modal-header',
                                    children: [
                                        createElement('div', {
                                            className: 'title',
                                            text: pt('targettingTitle')
                                        }),
                                        createElement('button', {
                                            className: 'close',
                                            attrs: { type: 'button', 'aria-label': pt('close') },
                                            events: {
                                                click: function () {
                                                    closeTargettingModal(false);
                                                }
                                            }
                                        })
                                    ]
                                }),
                                createElement('div', {
                                    className: 'preference__modal-content',
                                    children: [filterSection]
                                }),
                                createElement('div', {
                                    className: 'preference__modal-footer',
                                    children: readonly
                                        ? [
                                              createElement('button', {
                                                  className: ['button', 'btn-cancel'],
                                                  attrs: { type: 'button' },
                                                  text: pt('close'),
                                                  events: {
                                                      click: function () {
                                                          closeTargettingModal(false);
                                                      }
                                                  }
                                              })
                                          ]
                                        : [
                                              createElement('button', {
                                                  className: ['button', 'btn-cancel'],
                                                  attrs: { type: 'button' },
                                                  text: pt('cancel'),
                                                  events: {
                                                      click: function () {
                                                          closeTargettingModal(false);
                                                      }
                                                  }
                                              }),
                                              createElement('button', {
                                                  className: ['button', 'btn-ok'],
                                                  attrs: { type: 'button' },
                                                  text: pt('targetingOk'),
                                                  events: {
                                                      click: function () {
                                                          closeTargettingModal(true);
                                                      }
                                                  }
                                              })
                                          ]
                                })
                            ]
                        })
                    ]
                }).getElement();
                targettingModalElement.addEventListener('keydown', function (event) {
                    if (
                        event.defaultPrevented ||
                        event.target.closest('[role="dialog"], [role="alertdialog"]') !== targettingModalElement
                    )
                        return;
                    if (event.key === 'Escape' && !event.defaultPrevented) {
                        event.preventDefault();
                        closeTargettingModal(false);
                    }
                    editorDialog.trapTab(event, targettingModalElement);
                });
                targettingModalElement.inert = true;
                return targettingModalElement;
            };
            var buildModalContent = function () {
                var content = createElement('div', { className: 'preference__modal-content' });
                content.append(validationSlot);
                content.append(errorSlot);
                content.append(createElement('div', { className: 'gpo-editor-fields' }));
                if (fieldTabs) content.append(fieldTabs);
                return content;
            };
            var form = createElement('div', {
                className: [
                    'preference__modal',
                    'gpo-editor-preference-form',
                    readonly ? 'preference__modal--readonly' : null
                ],
                attrs: {
                    role: 'dialog',
                    'aria-modal': 'true',
                    tabindex: '-1',
                    'aria-label': creating ? pt('createTitle') : readonly ? pt('viewTitle') : pt('editTitle')
                },
                events: {
                    keydown: function (event) {
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
                        editorDialog.trapTab(event, form.getElement());
                    }
                },
                children: [
                    createElement('div', {
                        className: 'preference__modal-wrapper',
                        children: [
                            createElement('div', {
                                className: 'preference__modal-header',
                                children: [
                                    createElement('div', {
                                        className: 'title',
                                        text: creating
                                            ? pt('createTitle')
                                            : readonly
                                              ? pt('viewTitle')
                                              : pt('editTitle')
                                    }),
                                    createElement('button', {
                                        className: 'close',
                                        attrs: { type: 'button', 'aria-label': pt('close') },
                                        events: { click: closeAction }
                                    })
                                ]
                            }),
                            buildModalContent(),
                            createElement('div', {
                                className: 'preference__modal-footer',
                                children: readonly
                                    ? [
                                          createElement('button', {
                                              className: ['button', 'btn-cancel'],
                                              attrs: { type: 'button' },
                                              text: pt('close'),
                                              events: { click: closeAction }
                                          })
                                      ]
                                    : [
                                          createElement('button', {
                                              className: ['button', 'btn-cancel'],
                                              attrs: { type: 'button' },
                                              text: pt('cancel'),
                                              events: { click: cancelAction }
                                          }),
                                          saveButton
                                      ]
                            })
                        ]
                    })
                ]
            });
            var fieldSlot = form.getElement().querySelector('.gpo-editor-fields');
            if (nameField) {
                var basicTab = form.getElement().querySelector('#tab-basic');
                var targetTypeField = basicTab && basicTab.querySelector('[data-field-id="properties.targetType"]');
                if (targetTypeField && targetTypeField.parentNode) {
                    targetTypeField.parentNode.insertBefore(nameField.getElement(), targetTypeField);
                } else if (basicTab) {
                    basicTab.insertBefore(nameField.getElement(), basicTab.firstChild);
                } else if (fieldSlot) {
                    fieldSlot.appendChild(nameField.getElement());
                }
            }
            if (parentField && fieldSlot) fieldSlot.appendChild(parentField.getElement());
            var targettingButton = createElement('button', {
                className: ['button', 'preference__tab-targetting-btn'],
                attrs: { type: 'button' },
                text: pt('targettingButton'),
                events: {
                    click: function () {
                        if (formState.busy) return;
                        formState.beginFilterDraft();
                        var modal = buildTargettingModal();
                        if (!modal.parentNode) host.appendChild(modal);
                        void modal.offsetHeight;
                        modal.inert = false;
                        modal.classList.add('active');
                        form.getElement().classList.add('dimmed');
                        form.getElement().inert = true;
                        var first = modal.querySelector(
                            '.gpo-editor-filter-add:not(:disabled), [role="treeitem"], .btn-cancel'
                        );
                        if (first) first.focus();
                        else modal.focus();
                    }
                }
            });
            var generalTabElement = form.getElement().querySelector('#tab-general');
            var descriptionField =
                generalTabElement && generalTabElement.querySelector('[data-field-id="metadata.desc"]');
            if (generalTabElement && descriptionField && descriptionField.parentNode) {
                descriptionField.parentNode.insertBefore(targettingButton.getElement(), descriptionField);
            } else if (generalTabElement) {
                generalTabElement.appendChild(targettingButton.getElement());
            } else {
                var formContentSlot = form.getElement().querySelector('.preference__modal-content');
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
            host.appendChild(form.getElement());
            host.classList.add('active');
            void form.getElement().offsetHeight;
            form.getElement().classList.add('active');
            modalState = {
                creating: creating,
                readonly: readonly,
                identity: dto.clone(identity),
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
            var duplicates = dto.preferenceFieldIds(fields).duplicates;
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
            var dependencyRules = dependencyRulesFor(item.preferenceKind);
            if (dependencyRules.length && !readonly) {
                var dependencies = attachFieldDependencies(modalState.formElement, controlsById, dependencyRules);
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
            if (modalState.formElement.parentNode) {
                var targettingModal = modalState.formElement.parentNode.querySelector('.targetting__modal');
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
        var confirmingForms = (config.modalHost || rootElement).querySelectorAll(
            '.gpo-editor-preference-form--confirming'
        );
        Array.prototype.forEach.call(confirmingForms, function (formElement) {
            formElement.classList.remove('gpo-editor-preference-form--confirming');
        });
    }

    function handleDiscardModalChoice(confirmed) {
        var pending = pendingDiscard;
        pendingDiscard = null;
        hideDiscardModal();
        if (!confirmed || !pending) return;
        closeForm(true, pending.action);
    }

    function closeHostModals(host) {
        host.classList.remove('active');
        var modals = Array.prototype.slice.call(host.children);
        modals.forEach(function (element) {
            element.classList.remove('active');
        });
        setTimeout(function () {
            modals.forEach(function (element) {
                if (!element.classList.contains('active') && element.parentNode === host) {
                    host.removeChild(element);
                }
            });
        }, 500);
    }

    function closeForm(force, action) {
        var state = modalState;
        if (state && (state.saving || state.reconciling) && action !== 'saved' && action !== 'cleanup') return false;
        if (!force && state && state.formState.dirty) {
            if (pendingDiscard) return false;
            showDiscardModal(action);
            return false;
        }
        pendingDiscard = null;
        hideDiscardModal();
        formRequestId += 1;
        var host = config.modalHost || rootElement.querySelector('.gpo-editor-preferences__modal-host');
        if (host) closeHostModals(host);
        modalState = null;
        setHeaderState();
        if (action !== 'cleanup' && action !== 'navigation') focusTable();
        return true;
    }

    function formInteractiveElements(state) {
        var elements = [];
        var roots = [state.formElement];
        if (state.formElement.parentNode) {
            var targettingModal = state.formElement.parentNode.querySelector('.targetting__modal');
            if (targettingModal) roots.push(targettingModal);
        }
        roots.forEach(function (root) {
            ['input', 'select', 'textarea', 'button'].forEach(function (selector) {
                Array.prototype.forEach.call(root.querySelectorAll(selector), function (element) {
                    if (elements.indexOf(element) === -1) elements.push(element);
                });
            });
        });
        return elements;
    }

    function isRefreshSafeAction(state, element) {
        return (
            state.closeButtons.indexOf(element) !== -1 ||
            Boolean(element.classList && element.classList.contains('gpo-editor-status__action'))
        );
    }

    function syncFormBusy(state) {
        if (!state) return;
        var busy = Boolean(state.saving || state.reconciling);
        var elements = formInteractiveElements(state);
        if (busy) {
            elements.forEach(function (element) {
                if (!state.busyDisabledStates.has(element)) {
                    state.busyDisabledStates.set(element, Boolean(element.disabled));
                }
                element.disabled = true;
            });
        } else {
            state.busyDisabledStates.forEach(function (disabled, element) {
                element.disabled = disabled;
            });
            state.busyDisabledStates.clear();
        }
        var refreshLocked = Boolean(state.requiresRefresh);
        state.formState.busy = busy || refreshLocked;
        state.formElement.classList.toggle('gpo-editor-preference-form--busy', busy);
        state.formElement.classList.toggle('gpo-editor-preference-form--refresh-required', refreshLocked);
        if (busy) state.formElement.setAttribute('aria-busy', 'true');
        else state.formElement.removeAttribute('aria-busy');
        if (!busy && refreshLocked) {
            formInteractiveElements(state).forEach(function (element) {
                element.disabled = !isRefreshSafeAction(state, element);
            });
        }
        (state.closeButtons || []).forEach(function (button) {
            button.disabled = busy;
        });
        if (state.saveButton) {
            state.saveButton.disabled = Boolean(busy || state.requiresRefresh || state.blockedDescriptors);
        }
    }

    function setNameError(state, message) {
        if (!state.nameField || !state.nameError || !state.nameInput) return;
        state.nameField.classList.toggle('gpo-editor-field--error', Boolean(message));
        state.nameError.textContent = message || '';
        if (message) state.nameInput.setAttribute('aria-invalid', 'true');
        else state.nameInput.removeAttribute('aria-invalid');
    }

    function clearFormErrors(state) {
        state.controls.forEach(function (control) {
            control.setError('');
        });
        setNameError(state, '');
        state.formElement.classList.remove('gpo-editor-preference-form--invalid');
        state.validationSlot.textContent = '';
        state.errorSlot.innerHTML = '';
    }

    function markServerFieldError(state, error) {
        if (!error || !error.field) return;
        var field = String(error.field);
        var message = error.message || pt('validationFixErrors');
        if (field === 'name' || field.indexOf('name') !== -1) setNameError(state, message);
        state.controlsById.forEach(function (controls, id) {
            if (field === id || field.indexOf(id) !== -1) {
                controls.forEach(function (control) {
                    control.setError(message);
                });
            }
        });
    }

    function renderFormError(state, error) {
        if (modalState !== state) return;
        state.errorSlot.innerHTML = '';
        var category = dto.errorCategory(error).replace(/-/g, '_');
        var actions = {
            onReconcile: async function (event) {
                if (state.reconciling || state.saving) return;
                var button = event && event.currentTarget;
                if (button) button.disabled = true;
                state.reconciling = true;
                syncFormBusy(state);
                try {
                    var response = await API.reconcile();
                    var conflict = recoveryConflict(response);
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
        state.errorSlot.appendChild(editorStatus.renderError(error, actions).getElement());
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
                        className: ['button', 'gpo-editor-status__action'],
                        attrs: { type: 'button' },
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
        var state = modalState;
        if (state.saving || state.reconciling || state.requiresRefresh || state.blockedDescriptors) return false;
        clearFormErrors(state);
        var draftFields = state.controls.map(function (control) {
            return { id: control.id, value: control.read() };
        });
        var filterResult = state.formState.readFilterResult();
        var result = dto.buildPreferenceRequest({
            creating: state.creating,
            identity: state.identity,
            descriptors: state.descriptors,
            fields: draftFields,
            name: state.nameInput ? state.nameInput.value : null,
            originalName: state.originalName,
            parent: state.parentSelect
                ? dto.preferenceParentIdentity(state.parentCandidates, state.parentSelect.value)
                : null,
            filters: filterResult.operations,
            validationExemptions: state.dependencyDisabledIds || []
        });
        var errors = result.errors.concat(filterResult.errors || []);
        if (errors.length) {
            state.formElement.classList.add('gpo-editor-preference-form--invalid');
            state.validationSlot.textContent = pt('validationFixErrors');
            var firstControl = null;
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
            var response = state.creating
                ? await API.preferenceCreate(item.scope, item.preferenceKind, result.request)
                : await API.preferenceUpdate(item.scope, item.preferenceKind, result.request);
            var conflict = recoveryConflict(response);
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
        var identity = dto.clone(selectedIdentity);
        var before = items.map(function (entry) {
            return cacheKey(entry.identity);
        });
        var removed = false;
        deleting = true;
        setHeaderState();
        if (deleteButton) deleteButton.disabled = true;
        try {
            var response = await API.preferenceDelete(item.scope, item.preferenceKind, identity);
            invalidateCachedFields(identity);
            await loadItems();
            if (disposed || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            var next = listNavigation.neighbor(
                before,
                [cacheKey(identity)],
                items.map(function (entry) {
                    return cacheKey(entry.identity);
                })
            );
            var survivor = items.find(function (entry) {
                return cacheKey(entry.identity) === next;
            });
            selectedIdentity = survivor ? dto.clone(survivor.identity) : null;
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
    var tableSlot = rootElement.querySelector('.gpo-editor-preferences__table');
    tableNavigation = listNavigation.bind(tableSlot, {
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
            void openForm(dto.clone(row.__preferenceIdentity));
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
    var config = options || {};
    var item = config.item || {};
    var closed = false;
    var editor = null;
    var nestedHost = createElement('div', {
        className: ['gp__preference', 'gpo-editor-preferences__modal-host']
    });
    var controls = createElement('div', {
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
    var content = createElement('div', {
        className: 'gpo-preferences-family-dialog__content',
        children: [controls, createElement('div', { className: 'gpo-editor-empty', text: t('policySearch.loading') })]
    });
    // The existing controller can own a local toolbar without touching the
    // All Policies header. Keep its controls in the visible dialog content.
    var dialog = editorDialog.open(host, {
        title: item.title || (item.document && item.document.label) || item.preferenceKind,
        className: ['gpo-preferences-family-dialog'],
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
    var localDocument = Object.assign({}, item.document || {});
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

const __export__test = {
    fieldControl: fieldControl,
    mockupFieldControl: mockupFieldControl,
    buildFieldTabs: buildFieldTabs,
    orderedTabEntries: orderedTabEntries,
    isMetadataField: isMetadataField,
    filterKey: filterKey,
    editableFields: editableFields
};

export { renderPreferencesTemplate, openPreferencesDialog, __export__test as _test };
