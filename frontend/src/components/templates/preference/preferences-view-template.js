import { createElement } from '@gpui/util/element-creator';
import { clone } from '@gpui/core/editor-dto';
import * as editorDialog from '@gpui/components/editor-dialog';
import { bind } from '@gpui/components/list-navigation';
import { t } from '@gpui/locales/translations';
import { createItemsTable } from '@gpui/components/templates/preference/view/items-table';
import { createFormLifecycle } from '@gpui/components/templates/preference/view/form-lifecycle';
import { createPageActions } from '@gpui/components/templates/preference/view/page-actions';
import { createItemForm } from '@gpui/components/templates/preference/view/item-form';
import { createInfoPanel } from '@gpui/components/templates/preference/view/info-panel';
import { pt, filterKey, editableFields } from '@gpui/core/preference-view-common';
import { fieldControl, mockupFieldControl } from '@gpui/components/templates/preference/view/field-control';
import {
    buildFieldTabs,
    orderedTabEntries,
    isMetadataField
} from '@gpui/components/templates/preference/view/field-tabs';

let nextHeaderOwnerId = 1;

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
    const cleanups = [];
    const itemFieldsCache = new Map();

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

    // The page's mutable state in one object, so that the parts moved into modules share it with the closure.
    const view = {
        items: [],
        selectedIdentity: null,
        modalState: null,
        opening: false,
        pendingDiscard: null,
        discardModal: null,
        formRequestId: 0,
        itemsRequestId: 0,
        fieldsRequestId: 0,
        tableRefreshScheduled: false,
        deleting: false,
        disposed: false,
        tableNavigation: undefined
    };

    function ownsHeader() {
        return Boolean(headerControls && headerControls.getAttribute('data-preference-owner') === headerOwner);
    }

    function setHeaderState() {
        if (typeof config.onFormStateChange === 'function') config.onFormStateChange(Boolean(view.modalState));
        if (!ownsHeader()) return;
        const editable = Boolean(documentDto.editable);
        const available = editable && !view.modalState && !view.opening && !view.deleting;
        if (createButton) createButton.classList.toggle('active', available);
        if (editButton) editButton.classList.toggle('active', available && view.selectedIdentity !== null);
        if (deleteButton) deleteButton.classList.toggle('active', available && view.selectedIdentity !== null);
    }

    function addListener(target, name, handler) {
        if (!target) return;
        target.addEventListener(name, handler);
        cleanups.push(function () {
            target.removeEventListener(name, handler);
        });
    }

    const infoPanel = createInfoPanel({
        config,
        rootElement,
        ensureItemFields: identity => table.ensureItemFields(identity)
    });
    const table = createItemsTable({
        config,
        documentDto,
        infoPanel,
        item,
        itemFieldsCache,
        openForm: identity => openForm(identity),
        rootElement,
        setHeaderState,
        showPageError: error => actions.showPageError(error),
        view
    });
    const { renderTable, selectItem, focusTable, cacheKey, invalidateCachedFields, loadItems } = table;

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
        rootElement.appendChild(infoPanel.build().getElement());
        infoPanel.reset();
    }

    const { closeForm } = createFormLifecycle({ config, rootElement, view, focusTable, setHeaderState });
    const actions = createPageActions({
        cacheKey,
        closeForm,
        config,
        deleteButton,
        documentDto,
        focusTable,
        invalidateCachedFields,
        item,
        loadItems,
        ownsHeader,
        renderTable,
        rootElement,
        setHeaderState,
        view
    });
    const { showPageError, saveForm, deleteSelected } = actions;
    const { openForm } = createItemForm({
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
    });

    renderShell();
    const tableSlot = rootElement.querySelector('.gpo-editor-preferences__table');
    view.tableNavigation = bind(tableSlot, {
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
            return view.disposed || view.opening || view.deleting || Boolean(view.modalState);
        }
    });
    setHeaderState();
    addListener(createButton, 'click', function () {
        if (createButton.classList.contains('active')) void openForm(null);
    });
    addListener(editButton, 'click', function () {
        if (editButton.classList.contains('active')) void openForm(view.selectedIdentity);
    });
    addListener(deleteButton, 'click', function () {
        if (deleteButton.classList.contains('active')) void deleteSelected();
    });
    await loadItems();

    root.hasUnsavedChanges = function () {
        return Boolean(
            view.modalState &&
            (view.modalState.formState.dirty ||
                view.modalState.saving ||
                view.modalState.reconciling ||
                view.modalState.requiresRefresh)
        );
    };
    root.applyChanges = saveForm;
    root.isBusy = function () {
        return Boolean(view.modalState && (view.modalState.saving || view.modalState.reconciling));
    };
    root.cancelChanges = function () {
        return closeForm(true, 'navigation');
    };
    root.cleanup = function () {
        view.disposed = true;
        view.tableNavigation.cleanup();
        view.itemsRequestId += 1;
        view.formRequestId += 1;
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
