import { pt } from '@gpui/components/templates/preference/view/common';

// Helpers of the preference form that work on its state object (modalState in preferences-view-template.js):
// which controls the busy state locks, and the error marks on the name and the fields.

function formInteractiveElements(state) {
    const elements = [];
    const roots = [state.formElement];
    if (state.formElement.closest('[data-dialog-host]')) {
        const targettingModal = state.formElement
            .closest('[data-dialog-host]')
            .parentNode.querySelector('.targetting__modal');
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
        Boolean(element.hasAttribute && element.hasAttribute('data-editor-status-action'))
    );
}

function syncFormBusy(state) {
    if (!state) return;
    const busy = Boolean(state.saving || state.reconciling);
    const elements = formInteractiveElements(state);
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
    const refreshLocked = Boolean(state.requiresRefresh);
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
    const field = String(error.field);
    const message = error.message || pt('validationFixErrors');
    if (field === 'name' || field.indexOf('name') !== -1) setNameError(state, message);
    state.controlsById.forEach(function (controls, id) {
        if (field === id || field.indexOf(id) !== -1) {
            controls.forEach(function (control) {
                control.setError(message);
            });
        }
    });
}

export { syncFormBusy, setNameError, clearFormErrors, markServerFieldError };
