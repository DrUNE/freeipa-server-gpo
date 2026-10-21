import { createElement } from '@gpui/util/element-creator';
import { empty } from '@gpui/util/collection-value';
import * as collections from '@gpui/util/collection-value';
import { t } from '@gpui/locales/translations';
import { open } from '@gpui/components/collection-dialog';

function tr(key, values) {
    let text = t('collections.' + key);
    Object.keys(values || {}).forEach(function (name) {
        text = text.replace('{' + name + '}', values[name]);
    });
    return text;
}
function createControl(parameter, initial, editable) {
    let value = initial ? JSON.parse(JSON.stringify(initial)) : empty(parameter, initial);
    let canEdit = Boolean(editable);
    let modal = null;
    const button = createElement('button', {
        className: ['button', 'gpo-collection-control__button'],
        attrs: { type: 'button' }
    });
    const count = createElement('span', { className: 'gpo-collection-control__count' });
    const preview = createElement('span', {
        className: 'gpo-collection-control__preview',
        attrs: { 'aria-hidden': 'true' }
    });
    const host = createElement('div', { className: 'gpo-collection-control__dialog-host' });
    const root = createElement('div', {
        className: 'gpo-collection-control',
        children: [
            createElement('div', { className: 'gpo-collection-control__summary', children: [count, preview] }),
            button,
            host
        ]
    });
    function refresh() {
        const summary = collections.summary(parameter, value);
        button.getElement().textContent = tr('edit');
        button.getElement().setAttribute('aria-label', tr('editLabel', { label: parameter.label || parameter.id }));
        button.getElement().disabled = !canEdit;
        count.getElement().textContent = summary.count
            ? tr(summary.mode === 'key_value' ? 'pairsCount' : 'itemsCount', { count: summary.count })
            : tr('empty');
        preview.getElement().textContent =
            summary.preview
                .map(function (text) {
                    return text || tr('emptyValue');
                })
                .join(', ') + (summary.more ? ', …' : '');
    }
    button.on('click', function () {
        if (modal || !canEdit) return;
        modal = open(host, {
            parameter: parameter,
            value: value,
            readOnly: false,
            onAccept: function (next) {
                value = JSON.parse(JSON.stringify(next));
                refresh();
                root.getElement().dispatchEvent(new Event('change', { bubbles: true }));
            },
            onClose: function () {
                modal = null;
            }
        });
    });
    refresh();
    return {
        element: root,
        button: button.getElement(),
        read: function () {
            return JSON.parse(JSON.stringify(value));
        },
        hasOpenDialog: function () {
            return Boolean(modal);
        },
        hasUnsavedChanges: function () {
            return Boolean(modal && modal.isDirty());
        },
        setEditable: function (enabled) {
            canEdit = Boolean(enabled);
            refresh();
        },
        destroy: function () {
            if (modal) modal.close();
        }
    };
}

export { createControl };
