import { createElement } from '@gpui/util/element-creator';
import { t } from '@gpui/locales/translations';

let nextId = 0;

function open(host, options) {
    const config = options || {};
    const container = host && host.getElement ? host.getElement() : host;
    if (!container || typeof container.appendChild !== 'function') {
        throw new TypeError('A confirmation dialog host is required.');
    }

    const previous = /** @type {HTMLElement | null} */ (document.activeElement);
    const id = 'gpo-confirmation-' + ++nextId;
    let closed = false;
    const no = createElement('button', {
        className: ['btn', 'btn-no'],
        attrs: { type: 'button' },
        text: config.cancelLabel || t('policyChangedModal.no')
    });
    const yes = createElement('button', {
        className: ['btn', 'btn-yes'],
        attrs: { type: 'button' },
        text: config.confirmLabel || t('policyChangedModal.yes')
    });
    const content = createElement('div', {
        id: id + '-message',
        className: 'policy-changed__modal-content',
        text: config.message || ''
    });
    if (config.content) {
        content.getElement().appendChild(config.content.getElement ? config.content.getElement() : config.content);
    }
    const modal = createElement('div', {
        className: ['policy-changed__modal', 'policy-changed__modal--discard'],
        attrs: {
            role: 'alertdialog',
            'aria-modal': 'true',
            'aria-labelledby': id + '-title',
            'aria-describedby': id + '-message'
        },
        children: [
            createElement('div', {
                className: 'policy-changed__modal-wrapper',
                children: [
                    createElement('div', {
                        className: 'policy-changed__modal-header',
                        children: [
                            createElement('div', {
                                id: id + '-title',
                                className: 'title',
                                text: config.title || t('confirmModal.title')
                            })
                        ]
                    }),
                    content,
                    createElement('div', {
                        className: 'policy-changed__modal-footer',
                        children: [no, yes]
                    })
                ]
            })
        ]
    });

    function close() {
        if (closed) return;
        closed = true;
        modal.getElement().remove();
        if (previous && previous.isConnected && previous.focus) previous.focus();
    }

    function choose(confirmed) {
        if (closed) return;
        close();
        const callback = confirmed ? config.onConfirm : config.onCancel;
        if (typeof callback === 'function') callback();
    }

    no.on('click', function () {
        choose(false);
    });
    yes.on('click', function () {
        choose(true);
    });
    modal.on('keydown', function (event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            choose(false);
        } else if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === no.getElement()) {
                event.preventDefault();
                yes.getElement().focus();
            } else if (!event.shiftKey && document.activeElement === yes.getElement()) {
                event.preventDefault();
                no.getElement().focus();
            }
        }
    });

    container.appendChild(modal.getElement());
    void modal.getElement().offsetHeight;
    modal.getElement().classList.add('active');
    no.getElement().focus();
    return { close: close, root: modal.getElement() };
}

export { open };
