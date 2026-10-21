import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { buildPreferenceRequest, preferenceParentIdentity, errorCategory, clone } from '@gpui/core/editor-dto';
import { renderError } from '@gpui/components/editor-status';
import * as editorStatus from '@gpui/components/editor-status';
import { neighbor } from '@gpui/components/list-navigation';
import {
    syncFormBusy,
    setNameError,
    clearFormErrors,
    markServerFieldError
} from '@gpui/components/templates/preference/view/form-state';
import { pt, validationMessage } from '@gpui/components/templates/preference/view/common';

/**
 * The page's actions that talk to the server and report the outcome: saving the form, deleting the selected item,
 * the recovery (reconcile) path and the error panels of the page and of the form.
 * @param {any} context the page's state and operations (see renderPreferencesTemplate)
 */
function createPageActions({
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
}) {
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

    function renderFormError(state, error) {
        if (view.modalState !== state) return;
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
                    if (view.modalState === state) {
                        state.requiresRefresh = true;
                        renderReconcileSuccess(state);
                        await loadItems();
                    }
                } catch (reconcileError) {
                    renderFormError(state, reconcileError);
                } finally {
                    state.reconciling = false;
                    syncFormBusy(state);
                    if (button && view.modalState === state) button.disabled = false;
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
        if (view.modalState !== state) return;
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
        if (!view.modalState || view.modalState.readonly) return true;
        const state = view.modalState;
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
            if (view.modalState === state) {
                state.saveButton.textContent = pt('save');
                syncFormBusy(state);
            }
        }
    }

    async function deleteSelected() {
        if (
            !documentDto.editable ||
            view.selectedIdentity === null ||
            view.modalState ||
            view.opening ||
            view.deleting ||
            view.disposed
        )
            return;
        if (!window.confirm(pt('confirmDelete'))) return;
        const identity = clone(view.selectedIdentity);
        const before = view.items.map(function (entry) {
            return cacheKey(entry.identity);
        });
        let removed = false;
        view.deleting = true;
        setHeaderState();
        if (deleteButton) deleteButton.disabled = true;
        try {
            const response = await API.preferenceDelete(item.scope, item.preferenceKind, identity);
            invalidateCachedFields(identity);
            await loadItems();
            if (view.disposed || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            const next = neighbor(
                before,
                [cacheKey(identity)],
                view.items.map(function (entry) {
                    return cacheKey(entry.identity);
                })
            );
            const survivor = view.items.find(function (entry) {
                return cacheKey(entry.identity) === next;
            });
            view.selectedIdentity = survivor ? clone(survivor.identity) : null;
            renderTable();
            setHeaderState();
            removed = true;
            if (typeof config.onSaved === 'function') config.onSaved(response);
        } catch (error) {
            showPageError(error);
        } finally {
            view.deleting = false;
            setHeaderState();
            if (deleteButton && ownsHeader()) deleteButton.disabled = false;
            if (removed && !view.disposed && (typeof config.isCurrent !== 'function' || config.isCurrent()))
                focusTable();
        }
    }

    return {
        recoveryConflict,
        reconcilePage,
        showPageError,
        renderFormError,
        renderReconcileSuccess,
        saveForm,
        deleteSelected
    };
}

export { createPageActions };
