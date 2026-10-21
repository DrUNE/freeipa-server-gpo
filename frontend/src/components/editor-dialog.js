import { ElementCreator } from '@gpui/util/element-creator';
import { t } from '@gpui/locales/translations';
import * as confirmationDialog from '@gpui/components/confirmation-dialog';
import { renderError } from '@gpui/components/editor-status';
import {
    createBody,
    createButton,
    createCloseButton,
    createDialogShell,
    createErrorRegion,
    setConfirming
} from '@gpui/components/Dialog/Dialog';

let sequence = 0;

function trapTab(event, modal) {
    if (
        event.key !== 'Tab' ||
        event.defaultPrevented ||
        event.target.closest('[role="dialog"], [role="alertdialog"]') !== modal
    )
        return;
    const focusable = Array.from(
        modal.querySelectorAll(
            'button, input, select, textarea, summary, a[href], [contenteditable="true"], [tabindex]'
        )
    ).filter(function (element) {
        const style = element.ownerDocument.defaultView.getComputedStyle(element);
        return (
            element.tabIndex >= 0 &&
            !element.disabled &&
            !element.hidden &&
            element.getClientRects().length &&
            !element.closest('[hidden], [inert]') &&
            style.visibility !== 'hidden' &&
            style.visibility !== 'collapse' &&
            element.closest('[role="dialog"], [role="alertdialog"]') === modal
        );
    });
    if (!focusable.length) {
        event.preventDefault();
        modal.focus();
        return;
    }
    const first = focusable[0],
        last = focusable[focusable.length - 1];
    if (focusable.indexOf(document.activeElement) === -1) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function open(host, options) {
    const previous = document.activeElement;
    const titleId = 'editor-dialog-' + ++sequence;
    let busy = false;
    let closed = false;
    let applyDisabled = Boolean(options.applyDisabled);
    let confirmation = null;
    const wrap = ElementCreator.wrap;
    const classes = function (value) {
        return [].concat(value || []).join(' ');
    };
    const body = wrap(createBody(null, classes(options.bodyClassName)));
    body.append(options.content);
    const failure = wrap(createErrorRegion(classes(options.errorClassName)));
    body.getElement().prepend(failure.getElement());
    const cancel = wrap(createButton('cancel', options.cancelLabel || t('collections.cancel')));
    const apply = wrap(
        createButton('apply', options.applyLabel || t('collections.ok'), classes(options.applyClassName))
    );
    apply.getElement().disabled = applyDisabled;
    const closeButton = wrap(
        createCloseButton(options.closeLabel || t('collections.close'), classes(options.closeClassName))
    );
    const shell = createDialogShell({
        titleId: titleId,
        title: options.title,
        body: body.getElement(),
        closeButton: closeButton.getElement(),
        buttons: options.readOnly ? [cancel.getElement()] : [cancel.getElement(), apply.getElement()],
        width: options.width,
        fill: options.fill,
        className: classes(options.className),
        hostClassName: classes(options.hostClassName)
    });
    const modal = wrap(shell.dialog);
    const backdrop = wrap(shell.host);
    function close() {
        if (closed) return;
        closed = true;
        if (confirmation) {
            confirmation.close();
            confirmation = null;
        }
        backdrop.getElement().remove();
        if (options.onClose) options.onClose();
        const restored = previous && previous.isConnected ? previous : options.restoreFocus && options.restoreFocus();
        if (restored && restored.isConnected && restored.focus) restored.focus({ preventScroll: true });
    }
    function requestClose() {
        if (busy || confirmation) return false;
        if (options.canClose && options.canClose() === false) return false;
        if (!options.isDirty || !options.isDirty()) {
            close();
            return true;
        }
        modal.getElement().inert = true;
        setConfirming(modal.getElement(), true);
        confirmation = confirmationDialog.open(backdrop, {
            message: options.discardMessage || t('collections.discardQuestion'),
            onConfirm: close,
            onCancel: function () {
                confirmation = null;
                modal.getElement().inert = false;
                setConfirming(modal.getElement(), false);
                cancel.getElement().focus();
            }
        });
        return false;
    }
    // Keep a growing inline editor from moving the button between
    // mousedown (blur) and click. The action itself owns draft completion.
    [cancel, apply, closeButton].forEach(function (button) {
        button.on('mousedown', function (event) {
            if (event.button === 0) event.preventDefault();
        });
    });
    cancel.on('click', requestClose);
    closeButton.on('click', requestClose);
    apply.on('click', async function () {
        if (busy || applyDisabled || options.readOnly) return;
        busy = true;
        apply.getElement().disabled = true;
        cancel.getElement().disabled = true;
        closeButton.getElement().disabled = true;
        body.getElement().inert = true;
        modal.getElement().setAttribute('aria-busy', 'true');
        try {
            if (!options.onApply || (await options.onApply()) !== false) close();
        } catch (error) {
            failure.getElement().replaceChildren();
            failure.append(renderError(error));
        } finally {
            busy = false;
            apply.getElement().disabled = applyDisabled;
            cancel.getElement().disabled = false;
            closeButton.getElement().disabled = false;
            body.getElement().inert = false;
            modal.getElement().setAttribute('aria-busy', 'false');
            if (!closed && (!document.activeElement || document.activeElement === document.body))
                apply.getElement().focus();
        }
    });
    modal.on('keydown', function (event) {
        if (event.defaultPrevented) return;
        // A collection workbench can open its existing row dialog above us.
        // Only the uppermost editor owns its keyboard events and focus trap.
        if (event.target.closest('[role="dialog"], [role="alertdialog"]') !== modal.getElement()) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            requestClose();
        }
        trapTab(event, modal.getElement());
    });
    host.append(backdrop);
    Promise.resolve().then(function () {
        if (closed) return;
        const initial = options.initialFocus && options.initialFocus();
        (initial || modal.getElement()).focus();
    });
    return {
        close: close,
        requestClose: requestClose,
        root: modal,
        isBusy: function () {
            return busy;
        },
        setApplyDisabled: function (disabled) {
            applyDisabled = Boolean(disabled);
            apply.getElement().disabled = busy || applyDisabled;
        }
    };
}

export { open, trapTab };
