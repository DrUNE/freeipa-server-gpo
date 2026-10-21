import { preferenceValueFromInput, clone } from '@gpui/core/editor-dto';
import { createElement } from '@gpui/util/element-creator';
import { ElementCreator } from '@gpui/util/element-creator';
import { pt } from '@gpui/core/preference-view-common';
import { createField, setFieldError } from '@gpui/components/Field/Field';

function hiddenFieldControl(field) {
    return {
        id: field.id,
        field: field,
        read: function () {
            return clone(field.value);
        },
        setError: function () {},
        setDynamicDisabled: function () {
            return false;
        },
        focus: function () {}
    };
}

function buildControlInput(field, forceReadonly, materializeOptionalDefault, textarea) {
    const value = clone(field.value || { kind: 'text', value: '' });
    const disabled = Boolean(forceReadonly || field.editable === false);
    const controlKind = field.control || '';
    let input;
    let inputElement = null;
    let optionalBooleanTouched = false;
    let checkboxValueKind = null;
    let checkboxControlId = null;
    function checkboxControl(checked) {
        const controlId = nextControlId();
        checkboxControlId = controlId;
        const checkbox = createElement('input', {
            attrs: {
                id: controlId,
                type: 'checkbox',
                disabled: disabled ? 'disabled' : null
            }
        });
        checkbox.getElement().checked = Boolean(checked);
        checkbox.on('change', function () {
            optionalBooleanTouched = true;
        });
        inputElement = checkbox.getElement();
        return createElement('span', {
            className: 'gpo-editor-boolean',
            children: [
                checkbox,
                // The drawn box of the checkbox (styles: `.gpo-editor-boolean input + label`). The name of the control is
                // the label of the field, so this one stays empty and has no name of its own.
                createElement('label', { attrs: { for: controlId } })
            ]
        });
    }
    if (controlKind.indexOf('generated_') === 0) {
        input = createElement('div', {
            className: 'gpo-editor-field__generated',
            text: value.value === null || value.value === undefined ? '' : String(value.value)
        });
    } else if (value.kind === 'boolean') {
        input = checkboxControl(value.value);
    } else if (value.kind === 'optional_boolean') {
        checkboxValueKind = 'optional_boolean';
        input = checkboxControl(value.value === true);
    } else if (controlKind === 'optional_boolean_u8') {
        checkboxValueKind = 'optional_boolean_u8';
        input = checkboxControl(value.value === 1);
    } else if (value.kind === 'action') {
        input = createElement('select', {
            attrs: { disabled: disabled ? 'disabled' : null },
            children: ['create', 'replace', 'update', 'delete'].map(function (action) {
                return createElement('option', { attrs: { value: action }, text: action });
            })
        });
        input.getElement().value = value.value;
    } else if (value.kind === 'filter_combine') {
        input = createElement('select', {
            attrs: { disabled: disabled ? 'disabled' : null },
            children: ['and', 'or'].map(function (combine) {
                return createElement('option', { attrs: { value: combine }, text: combine.toUpperCase() });
            })
        });
        input.getElement().value = value.value;
    } else if (controlKind === 'choice') {
        input = createElement('select', {
            attrs: { disabled: disabled ? 'disabled' : null },
            children: (Array.isArray(field.choices) ? field.choices : []).map(function (choice) {
                return createElement('option', {
                    attrs: { value: choice.key },
                    text: choice.label
                });
            })
        });
        input.getElement().value = value.value;
    } else if (value.kind === 'text_list' || textarea) {
        input = createElement('textarea', {
            attrs: { disabled: disabled ? 'disabled' : null },
            text: Array.isArray(value.value)
                ? value.value.join('\n')
                : value.value === null || value.value === undefined
                  ? ''
                  : String(value.value)
        });
    } else if (value.kind === 'optional_text') {
        input = createElement('input', {
            attrs: {
                type: 'text',
                disabled: disabled ? 'disabled' : null,
                value: value.value === null ? '' : value.value
            }
        });
    } else {
        const numeric =
            value.kind === 'integer' || value.kind === 'unsigned_byte' || value.kind === 'optional_unsigned_byte';
        input = createElement('input', {
            attrs: {
                type: numeric ? 'number' : 'text',
                min: value.kind.indexOf('unsigned') !== -1 ? 0 : null,
                max: value.kind.indexOf('unsigned_byte') !== -1 ? 255 : null,
                required: field.required ? 'required' : null,
                disabled: disabled ? 'disabled' : null,
                value: value.value === null || value.value === undefined ? '' : value.value
            }
        });
    }
    if (!inputElement) inputElement = input.getElement();
    let dynamicDisabled = false;
    function applyBaselineToInput() {
        if (checkboxValueKind === 'optional_boolean_u8') {
            inputElement.checked = value.value === 1;
        } else if (checkboxValueKind === 'optional_boolean') {
            inputElement.checked = value.value === true;
        } else if (value.kind === 'boolean') {
            inputElement.checked = Boolean(value.value);
        } else if (Array.isArray(value.value)) {
            inputElement.value = value.value.join('\n');
        } else {
            inputElement.value = value.value === null || value.value === undefined ? '' : value.value;
        }
        optionalBooleanTouched = false;
    }
    return {
        value: value,
        disabled: disabled,
        controlKind: controlKind,
        input: input,
        inputElement: inputElement,
        checkboxControlId: checkboxControlId,
        read: function () {
            if (disabled || dynamicDisabled || controlKind.indexOf('generated_') === 0) return clone(value);
            if (checkboxValueKind && value.value === null && !materializeOptionalDefault && !optionalBooleanTouched) {
                return clone(value);
            }
            if (checkboxValueKind === 'optional_boolean_u8') {
                return { kind: value.kind, value: inputElement.checked ? 1 : 0 };
            }
            if (checkboxValueKind === 'optional_boolean') {
                return { kind: value.kind, value: Boolean(inputElement.checked) };
            }
            return preferenceValueFromInput(value, inputElement.value, inputElement.checked);
        },
        setInputError: function (message) {
            if (inputElement && typeof inputElement.setAttribute === 'function') {
                if (message) inputElement.setAttribute('aria-invalid', 'true');
                else inputElement.removeAttribute('aria-invalid');
            }
        },
        setDynamicDisabled: function (nextDisabled) {
            if (controlKind.indexOf('generated_') === 0) return false;
            const next = Boolean(nextDisabled);
            if (next === dynamicDisabled) return false;
            dynamicDisabled = next;
            inputElement.disabled = Boolean(disabled || dynamicDisabled);
            if (dynamicDisabled) applyBaselineToInput();
            return true;
        },
        focus: function () {
            if (inputElement && typeof inputElement.focus === 'function') inputElement.focus();
        }
    };
}

/** What `fieldControl` and `mockupFieldControl` share: the error of the field and the dynamic read-only state. */
function fieldHandle(field, builder, fieldElement, readonlyClass) {
    let lastError = '';
    function applyError(message) {
        lastError = message || '';
        fieldElement.classList.toggle('gpo-editor-field--error', Boolean(message));
        setFieldError(fieldElement, message);
        builder.setInputError(message);
    }
    if (!builder.disabled) {
        builder.inputElement.addEventListener('input', function () {
            if (lastError) applyError('');
        });
    }
    return {
        id: field.id,
        field: field,
        element: ElementCreator.wrap(fieldElement),
        read: builder.read,
        setError: applyError,
        setDynamicDisabled: function (nextDisabled) {
            if (!builder.setDynamicDisabled(nextDisabled)) return false;
            fieldElement.classList.toggle(readonlyClass, Boolean(nextDisabled));
            if (nextDisabled) applyError('');
            return true;
        },
        focus: builder.focus
    };
}

function fieldControl(field, forceReadonly, materializeOptionalDefault, options) {
    const opts = options || {};
    const builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, false);
    const isInput = builder.checkboxControlId === null && builder.inputElement.tagName === 'INPUT';
    const inputType = isInput ? String(builder.inputElement.getAttribute('type') || '').toLowerCase() : '';
    /** @type {import('@gpui/components/Field/Field').FieldLayout} */
    let layout = 'plain';
    if (opts.wrapCheckbox && builder.checkboxControlId !== null) layout = 'checkbox';
    else if (isInput && (inputType === 'number' || (opts.wrapText && inputType === 'text'))) layout = 'text';
    else if (opts.wrapSelect && valueKindIsSelect(builder)) layout = 'select';
    const { element } = createField({
        id: field.id,
        label: field.label || field.id,
        required: Boolean(field.required),
        readonly: builder.disabled,
        readonlyText: pt('readonly'),
        layout: layout,
        control: builder.input.getElement(),
        focusTarget: builder.inputElement,
        rootClass: builder.disabled ? ['gpo-editor-field--readonly'] : []
    });
    return fieldHandle(field, builder, element, 'gpo-editor-field--readonly');
}

function mockupFieldControl(field, forceReadonly, materializeOptionalDefault, options) {
    const opts = options || {};
    const builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, Boolean(opts.textarea));
    const checkboxLike =
        builder.value.kind === 'boolean' ||
        builder.value.kind === 'optional_boolean' ||
        builder.controlKind === 'optional_boolean_u8';
    const rootClass = [];
    // Only a read-only check box is marked at once (a text field is greyed by its `:disabled` state); a dynamic
    // disable marks any of them (see `fieldHandle`).
    if (checkboxLike && builder.disabled) rootClass.push('field--readonly');
    if (!checkboxLike) {
        if (opts.textarea) rootClass.push('field__description', 'h-auto');
        else if (builder.controlKind === 'directory_path' || builder.controlKind === 'file_path')
            rootClass.push('field__input--path');
        else if (valueKindIsSelect(builder)) rootClass.push('select');
    }
    const { element } = createField({
        id: field.id,
        label: field.label || field.id,
        required: Boolean(field.required),
        layout: checkboxLike ? 'mockup-checkbox' : 'mockup',
        control: builder.input.getElement(),
        focusTarget: builder.inputElement,
        rootClass: rootClass
    });
    return fieldHandle(field, builder, element, 'field--readonly');
}

function valueKindIsSelect(builder) {
    return (
        builder.value.kind === 'action' || builder.value.kind === 'filter_combine' || builder.controlKind === 'choice'
    );
}

let nextFieldControlId = 1;

function nextControlId() {
    return 'gpo-preference-field-' + nextFieldControlId++;
}

export { hiddenFieldControl, buildControlInput, fieldControl, mockupFieldControl, valueKindIsSelect, nextControlId };
