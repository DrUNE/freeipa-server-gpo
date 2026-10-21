import { createElement } from '@gpui/util/element-creator';
import { t } from '@gpui/locales/translations';
import * as editorDialog from '@gpui/components/editor-dialog';

let sequence = 0;
function tr(key, fallback) {
    const value = t('security.' + key);
    return value && value !== 'security.' + key ? value : fallback;
}
function tabs(settings, explanation) {
    const id = 'security-tabs-' + ++sequence;
    const panels = [settings, explanation];
    const buttons = [];
    function select(index, focus) {
        panels.forEach(function (panel, position) {
            const active = position === index;
            panel.getElement().hidden = !active;
            panel.getElement().classList.toggle('active', active);
            buttons[position].getElement().classList.toggle('active', active);
            buttons[position].getElement().setAttribute('aria-selected', String(active));
            buttons[position].getElement().tabIndex = active ? 0 : -1;
        });
        if (focus) buttons[index].getElement().focus();
    }
    const bar = createElement('div', {
        className: 'tab-buttons',
        attrs: { role: 'tablist', 'aria-label': tr('properties', 'Properties') }
    });
    [tr('settingTab', 'Security Policy Setting'), tr('explanationTab', 'Explanation')].forEach(function (label, index) {
        const button = createElement('button', {
            id: id + '-tab-' + index,
            className: 'preference__tab-button',
            attrs: { type: 'button', role: 'tab', 'aria-controls': id + '-panel-' + index },
            text: label
        });
        button.on('click', function () {
            select(index);
        });
        button.on('keydown', function (event) {
            let next;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = 1 - index;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = 1;
            if (next !== undefined) {
                event.preventDefault();
                select(next, true);
            }
        });
        buttons.push(button);
        bar.append(button);
        const panel = panels[index].getElement();
        panel.id = id + '-panel-' + index;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', id + '-tab-' + index);
        panel.setAttribute('tabindex', '0');
        panel.classList.add('tab-content');
    });
    select(0);
    return createElement('div', {
        className: ['preference__modal-tabs', 'gpo-security-tabs'],
        children: [bar, settings, explanation]
    });
}
function open(host, options) {
    return editorDialog.open(
        host,
        Object.assign({}, options, {
            className: ['gpo-security-dialog'],
            hostClassName: ['gpo-security-dialog-host'],
            bodyClassName: 'gpo-security-dialog__body',
            errorClassName: 'gpo-security-error',
            applyClassName: 'gpo-security-dialog__apply',
            closeClassName: 'gpo-security-dialog__close',
            cancelLabel: options.cancelLabel || tr('cancel', 'Cancel'),
            closeLabel: tr('close', 'Close'),
            applyLabel: options.applyLabel || tr('apply', 'Apply'),
            discardMessage: tr('discardQuestion', 'Discard unsaved changes?')
        })
    );
}

export { open, tabs };
