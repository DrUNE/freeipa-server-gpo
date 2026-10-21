import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import {
    canEditPolicyParameters,
    errorCategory,
    submitPreservingDraft,
    buildPolicyUpdate,
    canSelectPolicyState,
    validatePolicyDraft,
    hasOperations,
    equal
} from '@gpui/util/editor-dto';
import { renderError } from '@gpui/components/editor-status';
import { t } from '@gpui/locales/translations';
import * as editorDialog from '@gpui/components/editor-dialog';
import { setConfirming } from '@gpui/components/Dialog/Dialog';
import * as confirmationDialog from '@gpui/components/confirmation-dialog';
import { createParameterControl, renderPolicyContents } from '@gpui/components/templates/admx/policy-contents';

async function renderAdmxTemplate(options) {
    const config = options || {};
    const item = config.item || {};
    const root = createElement('div', { className: 'gpo-editor-policy' });
    const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
    const actions = headerElement ? headerElement.querySelector('.gp__control-actions') : null;
    const preferenceActions = headerElement ? headerElement.querySelector('.gp__control') : null;
    const applyButton = headerElement ? headerElement.querySelector('.admx__btn-apply') : null;
    const cancelButton = headerElement ? headerElement.querySelector('.admx__btn-cancel') : null;
    let policy;
    let view;
    let baseline;
    let saving = false;

    if (actions) actions.style.display = 'flex';
    if (preferenceActions) preferenceActions.style.display = 'none';

    try {
        const response = await API.policyShow(item.scope, item.policyId);
        policy = response.policy || response;
    } catch (error) {
        root.append(
            renderError(error, {
                onRefresh:
                    config.onLoadRefresh ||
                    function () {
                        window.location.reload();
                    },
                onReconcile: function () {
                    API.reconcile();
                }
            })
        );
        root.cleanup = function () {
            if (actions) actions.style.display = 'none';
        };
        return root;
    }

    if (typeof config.isCurrent === 'function' && !config.isCurrent()) {
        if (actions) actions.style.display = 'none';
        return root;
    }

    function render() {
        if (view) view.destroy();
        view = renderPolicyContents(root.getElement(), policy, {
            isHelpOpen: config.isHelpOpen,
            categoryPath: config.categoryPath,
            modalLayout: config.modalLayout
        });
        baseline = view.readDraft();
        refreshButtons();
        if (config.onRendered) config.onRendered(policy);
    }

    function hasUnsavedPolicyChanges() {
        return Boolean(view) && !equal(view.readDraft(), baseline);
    }

    function hasUnsavedChanges() {
        return hasUnsavedPolicyChanges() || Boolean(view && view.hasUnsavedDialogChanges());
    }

    function refreshButtons() {
        const active = !saving && hasUnsavedPolicyChanges();
        if (applyButton) applyButton.classList.toggle('active', active);
        if (cancelButton) cancelButton.classList.toggle('active', active);
    }

    function showError(error) {
        if (!view || !view.errorSlot) return;
        view.errorSlot.innerHTML = '';
        const category = errorCategory(error);
        const errorActions = {
            onReconcile: async function (event) {
                event.currentTarget.disabled = true;
                try {
                    await API.reconcile();
                } catch (reconcileError) {
                    showError(reconcileError);
                } finally {
                    event.currentTarget.disabled = false;
                }
            }
        };
        if (category === 'storage_conflict' || category === 'publication_conflict' || category === 'not_found') {
            errorActions.onRefresh = async function () {
                const confirmed = config.confirmRefresh
                    ? await config.confirmRefresh()
                    : window.confirm(t('collections.discardQuestion'));
                if (!confirmed) return;
                try {
                    const response = await API.policyShow(item.scope, item.policyId);
                    policy = response.policy || response;
                    render();
                } catch (refreshError) {
                    showError(refreshError);
                }
            };
        }
        view.errorSlot.appendChild(renderError(error, errorActions).getElement());
        if (error && error.field) {
            view.controls.forEach(function (control, id) {
                if (error.field === id || String(error.field).indexOf(id) !== -1) {
                    control.element.getElement().classList.add('gpo-editor-field--error');
                }
            });
        }
    }

    async function applyChanges() {
        if (saving) return false;
        // Finish the collection dialog first, even if it is still clean:
        // otherwise new edits during an in-flight save would be lost when
        // its response replaces the form. OK/Cancel still belongs to it.
        if (view.hasOpenDialog()) return false;
        const draft = view.readDraft();
        const validationError = validatePolicyDraft(policy, draft);
        if (validationError) {
            showError(validationError);
            return false;
        }
        const request = buildPolicyUpdate(policy, draft, baseline);
        if (!hasOperations(request)) return true;
        saving = true;
        root.getElement().inert = true;
        refreshButtons();
        try {
            /** @type {{ ok: boolean, response?: any, error?: any, draft?: any }} */
            const outcome = await submitPreservingDraft(draft, function () {
                return API.policyUpdate(item.scope, item.policyId, request);
            });
            if (!outcome.ok) {
                showError(outcome.error);
                return false;
            }
            policy = outcome.response.policy || outcome.response;
            render();
            if (config.onSaved) config.onSaved(outcome.response);
            return true;
        } finally {
            saving = false;
            root.getElement().inert = false;
            refreshButtons();
        }
    }

    function cancelChanges() {
        render();
    }

    function handleChange() {
        if (view && typeof view.syncPolicyState === 'function') view.syncPolicyState();
        refreshButtons();
        if (config.onDraftChange) config.onDraftChange();
    }
    function handleApply() {
        if (applyButton && applyButton.classList.contains('active')) void applyChanges();
    }
    function handleCancel() {
        if (cancelButton && cancelButton.classList.contains('active')) cancelChanges();
    }
    root.getElement().addEventListener('input', handleChange);
    root.getElement().addEventListener('change', handleChange);
    if (applyButton) applyButton.addEventListener('click', handleApply);
    if (cancelButton) cancelButton.addEventListener('click', handleCancel);

    root.hasUnsavedChanges = hasUnsavedChanges;
    root.applyChanges = applyChanges;
    root.cancelChanges = cancelChanges;
    root.canApply = function () {
        return Boolean(
            policy &&
            policy.state !== 'unknown_raw_values' &&
            ((policy.capabilities && policy.capabilities.edit_comments) ||
                ['enabled', 'disabled', 'not_configured'].some(function (state) {
                    return canSelectPolicyState(policy, state);
                }) ||
                canEditPolicyParameters(policy))
        );
    };
    root.cleanup = function () {
        if (view) view.destroy();
        root.getElement().removeEventListener('input', handleChange);
        root.getElement().removeEventListener('change', handleChange);
        if (applyButton) applyButton.removeEventListener('click', handleApply);
        if (cancelButton) cancelButton.removeEventListener('click', handleCancel);
        if (actions) actions.style.display = 'none';
        if (applyButton) applyButton.classList.remove('active');
        if (cancelButton) cancelButton.classList.remove('active');
    };
    render();
    return root;
}

function openAdmxDialog(host, options) {
    const config = options || {};
    const item = config.item || {};
    const content = createElement('div', {
        className: 'gpo-admx-dialog__content',
        children: [
            createElement('div', {
                className: 'gpo-admx-dialog__loading',
                attrs: { role: 'status' },
                text: t('treeView.loadingPolicies')
            })
        ]
    });
    let currentEditor = null;
    let closed = false;
    let refreshConfirmation = null;
    let finishRefreshConfirmation = null;
    let loadSequence = 0;
    function isCurrent() {
        return !closed && (!config.isCurrent || config.isCurrent());
    }
    function cleanupEditor() {
        if (closed) return;
        closed = true;
        if (refreshConfirmation) refreshConfirmation.close();
        if (finishRefreshConfirmation) finishRefreshConfirmation(false);
        if (currentEditor && currentEditor.cleanup) currentEditor.cleanup();
        currentEditor = null;
        if (config.onClose) config.onClose();
    }
    const editor = {
        getElement: function () {
            return content.getElement();
        },
        hasUnsavedChanges: function () {
            return Boolean(
                !closed && currentEditor && currentEditor.hasUnsavedChanges && currentEditor.hasUnsavedChanges()
            );
        },
        applyChanges: function () {
            return isCurrent() && currentEditor && currentEditor.applyChanges
                ? currentEditor.applyChanges()
                : Promise.resolve(false);
        },
        cancelChanges: function () {
            if (currentEditor && currentEditor.cancelChanges) currentEditor.cancelChanges();
        },
        isReady: function () {
            return Boolean(currentEditor && currentEditor.applyChanges);
        },
        cleanup: function () {
            dialog.close();
        }
    };
    const dialog = editorDialog.open(host, {
        title: item.title || item.label || item.policyId,
        className: ['gpo-admx-dialog'],
        width: '640px',
        fill: true,
        content: content,
        applyLabel: t('security.apply'),
        cancelLabel: t('security.cancel'),
        applyDisabled: true,
        restoreFocus: config.restoreFocus,
        isDirty: editor.hasUnsavedChanges,
        onApply: editor.applyChanges,
        onClose: cleanupEditor
    });
    function confirmRefresh() {
        if (!isCurrent() || refreshConfirmation) return Promise.resolve(false);
        return new Promise(function (resolve) {
            const modal = dialog.root.getElement();
            const previousFocus = /** @type {HTMLElement | null} */ (document.activeElement);
            modal.inert = true;
            setConfirming(modal, true);
            finishRefreshConfirmation = function (confirmed) {
                refreshConfirmation = null;
                finishRefreshConfirmation = null;
                modal.inert = false;
                setConfirming(modal, false);
                if (!closed && previousFocus && previousFocus.isConnected) previousFocus.focus();
                resolve(confirmed);
            };
            refreshConfirmation = confirmationDialog.open(modal.parentElement, {
                message: t('collections.discardQuestion'),
                onConfirm: function () {
                    finishRefreshConfirmation(true);
                },
                onCancel: function () {
                    finishRefreshConfirmation(false);
                }
            });
        });
    }
    function load() {
        const sequence = ++loadSequence;
        function ownsLoad() {
            return isCurrent() && sequence === loadSequence;
        }
        return renderAdmxTemplate({
            item: item,
            modalLayout: true,
            isCurrent: ownsLoad,
            confirmRefresh: confirmRefresh,
            onSaved: function (response) {
                if (ownsLoad() && config.onSaved) config.onSaved(response);
            },
            onLoadRefresh: function () {
                if (!ownsLoad()) return;
                if (currentEditor && currentEditor.cleanup) currentEditor.cleanup();
                currentEditor = null;
                dialog.setApplyDisabled(true);
                content.getElement().replaceChildren(
                    createElement('div', {
                        className: 'gpo-admx-dialog__loading',
                        attrs: { role: 'status' },
                        text: t('treeView.loadingPolicies')
                    }).getElement()
                );
                editor.ready = load();
            },
            onRendered: function (policy) {
                if (!ownsLoad()) return;
                const title = dialog.root.getElement().querySelector('[data-dialog-part="title"]');
                title.textContent = policy.label || item.title || policy.policy_id;
            }
        })
            .then(function (loaded) {
                if (!ownsLoad()) {
                    if (loaded.cleanup) loaded.cleanup();
                    if (!closed && !isCurrent()) dialog.close();
                    return false;
                }
                currentEditor = loaded;
                content.getElement().replaceChildren(loaded.getElement());
                dialog.setApplyDisabled(!loaded.canApply || !loaded.canApply());
                return Boolean(loaded.applyChanges);
            })
            .catch(function (error) {
                if (ownsLoad()) content.getElement().replaceChildren(renderError(error).getElement());
                else if (!closed && !isCurrent()) dialog.close();
                return false;
            });
    }
    editor.ready = load();
    return { editor: editor, dialog: dialog };
}

const _test = { createParameterControl: createParameterControl };

export { renderAdmxTemplate, openAdmxDialog, _test };
