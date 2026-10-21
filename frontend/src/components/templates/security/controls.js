import { createElement } from '@gpui/util/element-creator';
import { defaultTyped, clone, newRow, inputFor } from '@gpui/components/templates/security/value-editor';
import {
    tr,
    canCreateRow,
    registerBinding,
    syncBindings,
    controlLabel,
    rangeText
} from '@gpui/components/templates/security/policy-draft';

// The controls of one element of a security policy: scalar values and collections (lists, keyed rows).
function renderControl(control, elements, context) {
    if (control.kind === 'text') {
        return createElement('p', { text: control.text || control.label || '' });
    }
    if (control.kind === 'group') {
        const childContext = Object.assign({}, context, {
            writable: context.writable && !control.read_only
        });
        return createElement('fieldset', {
            className: 'gpo-editor-security-group',
            children: [
                control.label
                    ? createElement('legend', {
                          text: control.label
                      })
                    : null
            ].concat(
                (control.children || []).map(function (child) {
                    return renderControl(child, elements, childContext);
                })
            )
        });
    }
    const element = (elements || []).find(function (item) {
        return item.id === control.element_id;
    });
    if (!element)
        return createElement('div', {
            className: ['gpo-editor-preference-notice', 'gpo-editor-preference-notice--warning'],
            text:
                tr('security.unresolvedElement', 'This setting cannot be displayed:') + ' ' + (control.element_id || '')
        });
    return element.value_type === 'collection'
        ? collectionControl(control, element, context)
        : scalarControl(control, element, context);
}

function scalarControl(control, element, context) {
    const state = context.getState(element.id);
    const writable = context.writable && !control.read_only;
    const required = element.required === true;
    const configured = createElement('input', { attrs: { type: 'checkbox' } });
    const labelText = createElement('span', {
        text: controlLabel(control, element, state)
    });
    configured.getElement().checked = state.state === 'set' || required;
    configured.getElement().disabled = !writable;
    const editor = inputFor(
        element,
        control,
        state.state === 'set' ? state.value : defaultTyped(element),
        !writable || (!required && state.state !== 'set')
    );
    editor.root.getElement().setAttribute('aria-label', controlLabel(control, element, state));
    const binding = {
        update: function (next, source) {
            configured.getElement().checked = next.state === 'set' || required;
            configured.getElement().disabled = !writable;
            labelText.getElement().textContent = controlLabel(control, element, next);
            if (!source) editor.write(next.state === 'set' ? next.value : defaultTyped(element));
            editor.setDisabled(!writable || (!required && next.state !== 'set'));
        }
    };
    registerBinding(context.bindings, element.id, binding);
    function changed() {
        const next = configured.getElement().checked ? { state: 'set', value: editor.read() } : { state: 'unset' };
        context.setState(element.id, next);
        syncBindings(context.bindings, element.id, binding, next);
    }
    configured.on('change', changed);
    editor.root.getElement().addEventListener('input', changed);
    editor.root.getElement().addEventListener('change', changed);
    return createElement('div', {
        className: ['gpo-editor-field', !writable ? 'gpo-editor-field--readonly' : null],
        attrs: { 'data-security-element': element.id },
        children: [
            createElement('label', {
                className: ['field', 'field__checkbox'],
                children: [required ? null : configured, labelText]
            }),
            createElement('div', {
                className: 'field__element',
                children: [editor.root]
            }),
            control.integer_suffix
                ? createElement('span', {
                      className: 'gpo-editor-security-suffix',
                      text: control.integer_suffix
                  })
                : null,
            rangeText(control, element)
                ? createElement('span', {
                      className: 'gpo-editor-security-range',
                      text: rangeText(control, element)
                  })
                : null
        ]
    });
}

function collectionControl(control, element, context) {
    const container = createElement('div', {
        className: 'gpo-editor-security-collection',
        attrs: { 'data-security-element': element.id }
    });
    const writable = context.writable && !control.read_only && Boolean(element.unique_by);
    const state = context.getState(element.id);
    const configured = createElement('input', { attrs: { type: 'checkbox' } });
    configured.getElement().checked = state.state === 'set';
    configured.getElement().disabled = !writable;
    let rows = state.state === 'set' ? clone(state.value.value || []) : [];
    const rowsHost = createElement('div', { className: 'gpo-editor-security-collection__rows' });
    const add = createElement('button', {
        className: 'button',
        attrs: { type: 'button' },
        text: tr('security.addRow', 'Add row')
    });
    const binding = {
        update: function (next, source) {
            configured.getElement().checked = next.state === 'set';
            if (!source) {
                rows = next.state === 'set' ? clone(next.value.value || []) : [];
                renderRows();
            }
            add.getElement().disabled =
                !writable || !configured.getElement().checked || !canCreateRow(element, control.children);
        }
    };
    registerBinding(context.bindings, element.id, binding);

    function sync() {
        const next = configured.getElement().checked
            ? { state: 'set', value: { kind: 'collection', value: clone(rows) } }
            : { state: 'unset' };
        context.setState(element.id, next);
        syncBindings(context.bindings, element.id, binding, next);
    }

    function renderRows() {
        rowsHost.getElement().innerHTML = '';
        rows.forEach(function (row, rowIndex) {
            const rowRoot = createElement('div', {
                className: 'gpo-editor-security-collection__row'
            });
            const fields = (element.fields || []).map(function (field) {
                return Object.assign({}, field.element, { id: field.id });
            });
            const rowContext = {
                writable: writable && configured.getElement().checked,
                bindings: new Map(),
                getState: function (id) {
                    return row[id] || { state: 'unset' };
                },
                setState: function (id, next) {
                    row[id] = next;
                    sync();
                }
            };
            (control.children || []).forEach(function (child) {
                rowRoot.append(renderControl(child, fields, rowContext));
            });
            rowRoot.append(
                createElement('button', {
                    className: 'button',
                    attrs: { type: 'button', disabled: rowContext.writable ? null : 'disabled' },
                    text: tr('security.removeRow', 'Remove row'),
                    events: {
                        click: function () {
                            rows.splice(rowIndex, 1);
                            sync();
                            renderRows();
                        }
                    }
                })
            );
            rowsHost.append(rowRoot);
        });
    }

    configured.on('change', function () {
        if (configured.getElement().checked && !rows.length) rows = [];
        sync();
        renderRows();
    });
    add.getElement().disabled =
        !writable || !configured.getElement().checked || !canCreateRow(element, control.children);
    add.on('click', function () {
        if (add.getElement().disabled) return;
        rows.push(newRow(element));
        sync();
        renderRows();
    });
    container.append(
        createElement('label', {
            className: ['field', 'field__checkbox'],
            children: [
                configured,
                createElement('span', {
                    text: control.label || element.id
                })
            ]
        })
    );
    if (!element.unique_by)
        container.append(
            createElement('div', {
                className: ['gpo-editor-preference-notice', 'gpo-editor-preference-notice--warning'],
                text: tr('security.readOnlyCollection', 'This collection has no stable row key and is read-only.')
            })
        );
    container.append(rowsHost);
    container.append(add);
    renderRows();
    return container;
}

export { renderControl };
