import { ElementCreator } from '@gpui/util/element-creator';
import { trapTab } from '@gpui/components/editor-dialog';
import { createBody, createButton, createCloseButton, createDialogShell } from '@gpui/components/Dialog/Dialog';
import { pt } from '@gpui/components/templates/preference/view/common';

/**
 * The targeting modal of the preference form: a second dialog over the form (which is dimmed and inert while it
 * is open) that hosts the filter editor. OK keeps the filter draft, Cancel and Close drop it; read-only forms only close.
 * @param {{ host: HTMLElement, filterSection: any, readonly: boolean, formState: any,
 *   getForm: () => HTMLElement, getOpener: () => HTMLElement }} options
 *   `host` is the container the form's own dialog lives in; the modal is added to it on first use.
 */
function createTargetingModal({ host, filterSection, readonly, formState, getForm, getOpener }) {
    let dialog = null;
    let backdrop = null;
    const wrap = ElementCreator.wrap;

    function close(accept) {
        if (accept && !readonly && !formState.acceptFilterDraft()) return;
        if (!accept) formState.cancelFilterDraft();
        if (dialog) {
            dialog.classList.remove('active');
            dialog.inert = true;
            backdrop.style.display = 'none';
        }
        getForm().classList.remove('gpo-editor-preference-form--dimmed');
        getForm().inert = false;
        getOpener().focus();
    }

    function build() {
        const closeX = wrap(createCloseButton(pt('close')));
        closeX.on('click', function () {
            close(false);
        });
        const cancelButton = wrap(createButton('cancel', readonly ? pt('close') : pt('cancel')));
        cancelButton.on('click', function () {
            close(false);
        });
        const buttons = [cancelButton.getElement()];
        if (!readonly) {
            const okButton = wrap(createButton('apply', pt('targetingOk')));
            okButton.on('click', function () {
                close(true);
            });
            buttons.push(okButton.getElement());
        }
        const body = createBody(null);
        body.append(filterSection.getElement());
        const shell = createDialogShell({
            titleId: 'gpo-editor-targeting-title',
            title: pt('targettingTitle'),
            body: body,
            closeButton: closeX.getElement(),
            buttons: buttons,
            width: 'min(700px, calc(100vw - 40px))',
            fill: true,
            className: ['targetting__modal', readonly ? 'gpo-editor-dialog--readonly' : null].filter(Boolean).join(' '),
            hostClassName: 'gpo-editor-targeting-host'
        });
        backdrop = shell.host;
        dialog = shell.dialog;
        dialog.addEventListener('keydown', function (event) {
            if (event.defaultPrevented || event.target.closest('[role="dialog"], [role="alertdialog"]') !== dialog)
                return;
            if (event.key === 'Escape') {
                event.preventDefault();
                close(false);
            }
            trapTab(event, dialog);
        });
        dialog.inert = true;
        backdrop.style.display = 'none';
        host.appendChild(backdrop);
    }

    function open() {
        if (!dialog) build();
        else if (!backdrop.parentNode) host.appendChild(backdrop);
        backdrop.style.display = '';
        dialog.inert = false;
        dialog.classList.add('active');
        getForm().classList.add('gpo-editor-preference-form--dimmed');
        getForm().inert = true;
        const first = dialog.querySelector('.gpo-editor-filter-add:not(:disabled), [role="treeitem"], .btn-cancel');
        if (first) first.focus();
        else dialog.focus();
    }

    return { open, close };
}

export { createTargetingModal };
