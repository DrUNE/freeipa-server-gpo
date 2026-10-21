import { cx, h } from '@gpui/lib/dom';
import { t } from '@gpui/locales/translations';

/*
 * ConfirmationDialog: a yes/no question shown over `host` (an alertdialog; focus goes to "no", Escape answers "no",
 * Tab cycles between the two buttons, focus returns to where it was).
 *
 * Public hooks (the look is still the editor's global sheet, `policy-changed__modal*`):
 *   [role="alertdialog"]   the window, named by its title and described by the message
 * Returns `{ close, root }`; the callbacks run after the window is closed.
 */

let nextId = 0;

/**
 * @param {{ getElement?: () => HTMLElement, appendChild?: Function } | HTMLElement} host
 * @param {{ title?: string, message?: string, content?: any, confirmLabel?: string, cancelLabel?: string,
 *   onConfirm?: () => void, onCancel?: () => void }} [options]
 */
export function open(host, options) {
    const config = options || {};
    const container = /** @type {any} */ (host && 'getElement' in host && host.getElement ? host.getElement() : host);
    if (!container || typeof container.appendChild !== 'function') {
        throw new TypeError('A confirmation dialog host is required.');
    }

    const previous = /** @type {HTMLElement | null} */ (document.activeElement);
    const id = 'gpo-confirmation-' + ++nextId;
    let closed = false;
    const no = h('button', { class: 'btn btn-no', type: 'button' }, config.cancelLabel || t('policyChangedModal.no'));
    const yes = h(
        'button',
        { class: 'btn btn-yes', type: 'button' },
        config.confirmLabel || t('policyChangedModal.yes')
    );
    const content = h('div', { id: id + '-message', class: 'policy-changed__modal-content' }, config.message || '');
    if (config.content) content.appendChild(config.content.getElement ? config.content.getElement() : config.content);
    const modal = h(
        'div',
        {
            class: cx('policy-changed__modal', 'policy-changed__modal--discard'),
            role: 'alertdialog',
            'aria-modal': 'true',
            'aria-labelledby': id + '-title',
            'aria-describedby': id + '-message'
        },
        h(
            'div',
            { class: 'policy-changed__modal-wrapper' },
            h(
                'div',
                { class: 'policy-changed__modal-header' },
                h('div', { id: id + '-title', class: 'title' }, config.title || t('confirmModal.title'))
            ),
            content,
            h('div', { class: 'policy-changed__modal-footer' }, no, yes)
        )
    );

    function close() {
        if (closed) return;
        closed = true;
        modal.remove();
        if (previous && previous.isConnected && previous.focus) previous.focus();
    }

    function choose(confirmed) {
        if (closed) return;
        close();
        const callback = confirmed ? config.onConfirm : config.onCancel;
        if (typeof callback === 'function') callback();
    }

    no.addEventListener('click', () => choose(false));
    yes.addEventListener('click', () => choose(true));
    modal.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            choose(false);
        } else if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === no) {
                event.preventDefault();
                yes.focus();
            } else if (!event.shiftKey && document.activeElement === yes) {
                event.preventDefault();
                no.focus();
            }
        }
    });

    container.appendChild(modal);
    void modal.offsetHeight;
    modal.classList.add('active');
    no.focus();
    return { close, root: modal };
}
