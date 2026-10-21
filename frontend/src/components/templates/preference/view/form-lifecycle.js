import * as confirmationDialog from '@gpui/components/confirmation-dialog';
import { pt } from '@gpui/components/templates/preference/view/common';

/**
 * Closing the preference form: the discard question for unsaved changes and the removal of the form's dialogs from
 * the shared host. `closeForm(force, action)` returns false when the form stays open (busy or waiting for the answer).
 * @param {any} context the page's state and operations (see renderPreferencesTemplate)
 */
function createFormLifecycle({ config, rootElement, view, focusTable, setHeaderState }) {
    function showDiscardModal(action) {
        if (view.discardModal) return;
        view.pendingDiscard = { action: action };
        if (view.modalState && view.modalState.formElement) {
            view.modalState.formElement.classList.add('gpo-editor-preference-form--confirming');
            if (view.modalState.formElement.closest('[data-dialog-host]')) {
                const targettingModal = view.modalState.formElement
                    .closest('[data-dialog-host]')
                    .parentNode.querySelector('.targetting__modal');
                if (targettingModal) {
                    targettingModal.classList.add('gpo-editor-preference-form--confirming');
                }
            }
        }
        view.discardModal = confirmationDialog.open(config.modalHost || rootElement, {
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
        if (view.discardModal) {
            view.discardModal.close();
            view.discardModal = null;
        }
        const confirmingForms = (config.modalHost || rootElement).querySelectorAll(
            '.gpo-editor-preference-form--confirming'
        );
        Array.prototype.forEach.call(confirmingForms, function (formElement) {
            formElement.classList.remove('gpo-editor-preference-form--confirming');
        });
    }

    function handleDiscardModalChoice(confirmed) {
        const pending = view.pendingDiscard;
        view.pendingDiscard = null;
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
        const state = view.modalState;
        if (state && (state.saving || state.reconciling) && action !== 'saved' && action !== 'cleanup') return false;
        if (!force && state && state.formState.dirty) {
            if (view.pendingDiscard) return false;
            showDiscardModal(action);
            return false;
        }
        view.pendingDiscard = null;
        hideDiscardModal();
        view.formRequestId += 1;
        const host = config.modalHost || rootElement.querySelector('.gpo-editor-preferences__modal-host');
        if (host) closeHostModals(host);
        view.modalState = null;
        setHeaderState();
        if (action !== 'cleanup' && action !== 'navigation') focusTable();
        return true;
    }

    return { closeForm };
}

export { createFormLifecycle };
