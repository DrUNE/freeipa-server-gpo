import {
    createBody,
    createButton as createDialogButton,
    createCloseButton,
    createDialogShell
} from '@gpui/components/Dialog/Dialog';
import { createElement, ElementCreator } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { preferenceFieldIds, clone } from '@gpui/util/editor-dto';
import * as dto from '@gpui/util/editor-dto';
import { trapTab } from '@gpui/components/editor-dialog';
import { getLanguage } from '@gpui/locales/translations';
import * as preferenceLayouts from '@gpui/components/templates/preference/layouts/index';
import { render } from '@gpui/components/templates/preference/targeting-editor';
import { syncFormBusy, setNameError } from '@gpui/components/templates/preference/view/form-state';
import { createTargetingModal } from '@gpui/components/templates/preference/view/targeting-modal';
import {
    pt,
    scopeField,
    validationMessage,
    parentCandidateLabel
} from '@gpui/components/templates/preference/view/common';
import { fieldControl } from '@gpui/components/templates/preference/view/field-control';
import { buildFieldTabs } from '@gpui/components/templates/preference/view/field-tabs';
import {
    dependencyRulesFor,
    attachFieldDependencies
} from '@gpui/components/templates/preference/view/field-dependencies';

const PREFERENCE_LAYOUTS = preferenceLayouts;

/**
 * The create/edit/view dialog of one preference item: loads the item, builds the fields, tabs and the targeting
 * modal, tracks the dirty state. Saving and closing are the page's (`saveForm`, `closeForm`).
 * @param {any} context the page's state and operations (see renderPreferencesTemplate)
 */
function createItemForm({
    closeForm,
    config,
    documentDto,
    infoPanel,
    item,
    rootElement,
    saveForm,
    setHeaderState,
    showPageError,
    view
}) {
    function setOpening(value) {
        view.opening = Boolean(value);
        rootElement.classList.toggle('gpo-editor-preferences--opening', view.opening);
        if (view.opening) rootElement.setAttribute('aria-busy', 'true');
        else rootElement.removeAttribute('aria-busy');
        Array.prototype.forEach.call(
            rootElement.querySelectorAll('.gpo-editor-preference-table__actions button'),
            function (button) {
                button.disabled = view.opening;
            }
        );
        setHeaderState();
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
        if (view.opening) return false;
        if (view.modalState && !closeForm(false, 'close')) return;
        const host = config.modalHost || rootElement.querySelector('.gpo-editor-preferences__modal-host');
        if (!host) return;
        const requestId = ++view.formRequestId;
        setOpening(true);
        try {
            const response = await API.preferenceShow(item.scope, item.preferenceKind, identity);
            if (requestId !== view.formRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent()))
                return;
            const readonly = !documentDto.editable;
            const fields = dto
                .clone(creating ? response.new_item_fields || response.fields || [] : response.fields || [])
                .map(function (field) {
                    return scopeField(field, item.scope);
                });
            if (!creating) {
                infoPanel.invalidate();
                infoPanel.render(fields);
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
            // The item of a new-item form is null, so its type in the contract is open.
            const shownItem = /** @type {{ label?: unknown } | null} */ (response.item);
            const originalName = shownItem && shownItem.label !== undefined ? String(shownItem.label) : '';
            let nameInput = null;
            let nameField = null;
            let nameError = null;
            let parentSelect = null;
            let parentField = null;
            if (!creating) {
                nameInput = createElement('input', {
                    attrs: {
                        type: 'text',
                        'aria-label': pt('rename'),
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
            view.modalState = {
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
            if (view.modalState.nameInput && !readonly) {
                view.modalState.nameInput.addEventListener('input', function () {
                    if (view.modalState.nameError.textContent) setNameError(view.modalState, '');
                });
            }
            const duplicates = preferenceFieldIds(fields).duplicates;
            if (!readonly && duplicates.length) {
                view.modalState.blockedDescriptors = true;
                view.modalState.formElement.classList.add('gpo-editor-preference-form--invalid');
                view.modalState.validationSlot.textContent = pt('validationFixErrors');
                duplicates.forEach(function (id) {
                    (controlsById.get(id) || []).forEach(function (control) {
                        control.setError(pt('validationFixErrors'));
                    });
                });
            }
            const dependencyRules = dependencyRulesFor(item.preferenceKind);
            if (dependencyRules.length && !readonly) {
                const dependencies = attachFieldDependencies(
                    view.modalState.formElement,
                    controlsById,
                    dependencyRules
                );
                view.modalState.dependencyDisabledIds = dependencies.disabledIds;
                dependencies.sync();
            }
            syncFormBusy(view.modalState);
            setHeaderState();
        } catch (error) {
            if (requestId === view.formRequestId) showPageError(error);
        } finally {
            if (requestId === view.formRequestId) setOpening(false);
        }
    }

    return { openForm };
}

export { createItemForm };
