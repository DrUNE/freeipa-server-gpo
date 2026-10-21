import { preferenceValueFromInput, clone } from '@gpui/util/editor-dto';
import { createElement } from '@gpui/util/element-creator';
import { pt } from '@gpui/components/templates/preference/view/common';

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
                createElement('label', {
                    attrs: { for: controlId, 'aria-label': field.label || field.id }
                })
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
    const errorElement = createElement('span', { className: 'gpo-editor-field__error' });
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
        errorElement: errorElement,
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
            errorElement.setText(message || '');
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

function fieldControl(field, forceReadonly, materializeOptionalDefault, options) {
    const opts = options || {};
    const builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, false);
    const wrapSelect = Boolean(opts.wrapSelect) && valueKindIsSelect(builder);
    const wrapCheckbox = Boolean(opts.wrapCheckbox) && builder.checkboxControlId !== null;
    const builderIsInput = builder.checkboxControlId === null && builder.inputElement.tagName === 'INPUT';
    const builderInputType = builderIsInput
        ? String(builder.inputElement.getAttribute('type') || '').toLowerCase()
        : '';
    const wrapText =
        builderIsInput && (builderInputType === 'number' || (Boolean(opts.wrapText) && builderInputType === 'text'));
    let element;
    if (wrapCheckbox) {
        element = createElement('div', {
            className: [
                'field',
                'field__checkbox',
                'gpo-editor-field',
                builder.disabled ? 'gpo-editor-field--readonly' : null
            ],
            attrs: { 'data-field-id': field.id },
            children: [
                createElement('div', {
                    className: 'field__label',
                    children: [
                        createElement('label', {
                            className: 'gpo-editor-field__label',
                            attrs: { for: builder.checkboxControlId },
                            children: [
                                createElement('span', { text: field.label || field.id }),
                                field.required
                                    ? createElement('span', {
                                          className: 'gpo-editor-field__required',
                                          text: '*'
                                      })
                                    : null
                            ]
                        })
                    ]
                }),
                createElement('div', {
                    className: 'field__element',
                    children: [builder.input]
                }),
                builder.disabled
                    ? createElement('span', {
                          className: 'gpo-editor-field__hint',
                          text: pt('readonly')
                      })
                    : null,
                builder.errorElement
            ]
        });
    } else if (wrapText) {
        element = createElement('div', {
            className: [
                'field',
                'field__input',
                'gpo-editor-field',
                builder.disabled ? 'gpo-editor-field--readonly' : null
            ],
            attrs: { 'data-field-id': field.id },
            children: [
                createElement('div', {
                    className: 'field__label',
                    children: [
                        createElement('span', {
                            className: 'gpo-editor-field__label',
                            children: [
                                createElement('span', { text: field.label || field.id }),
                                field.required
                                    ? createElement('span', {
                                          className: 'gpo-editor-field__required',
                                          text: '*'
                                      })
                                    : null
                            ]
                        })
                    ]
                }),
                createElement('div', {
                    className: 'field__element',
                    children: [builder.input, builder.errorElement]
                }),
                builder.disabled
                    ? createElement('span', {
                          className: 'gpo-editor-field__hint',
                          text: pt('readonly')
                      })
                    : null
            ]
        });
    } else {
        element = createElement('div', {
            className: [
                'gpo-editor-field',
                wrapSelect ? 'field' : null,
                builder.disabled ? 'gpo-editor-field--readonly' : null
            ],
            attrs: { 'data-field-id': field.id },
            children: wrapSelect
                ? [
                      createElement('div', {
                          className: 'field__label',
                          children: [
                              createElement('span', {
                                  className: 'gpo-editor-field__label',
                                  children: [
                                      createElement('span', { text: field.label || field.id }),
                                      field.required
                                          ? createElement('span', {
                                                className: 'gpo-editor-field__required',
                                                text: '*'
                                            })
                                          : null
                                  ]
                              })
                          ]
                      }),
                      createElement('div', {
                          className: 'field__element',
                          children: [builder.input]
                      }),
                      builder.disabled
                          ? createElement('span', {
                                className: 'gpo-editor-field__hint',
                                text: pt('readonly')
                            })
                          : null,
                      builder.errorElement
                  ]
                : [
                      createElement('span', {
                          className: 'gpo-editor-field__label',
                          children: [
                              createElement('span', { text: field.label || field.id }),
                              field.required
                                  ? createElement('span', {
                                        className: 'gpo-editor-field__required',
                                        text: '*'
                                    })
                                  : null
                          ]
                      }),
                      builder.input,
                      builder.disabled
                          ? createElement('span', {
                                className: 'gpo-editor-field__hint',
                                text: pt('readonly')
                            })
                          : null,
                      builder.errorElement
                  ]
        });
    }
    let lastError = '';
    function applyError(message) {
        lastError = message || '';
        element.getElement().classList.toggle('gpo-editor-field--error', Boolean(message));
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
        element: element,
        read: builder.read,
        setError: applyError,
        setDynamicDisabled: function (nextDisabled) {
            if (!builder.setDynamicDisabled(nextDisabled)) return false;
            element.getElement().classList.toggle('gpo-editor-field--readonly', Boolean(nextDisabled));
            if (nextDisabled) {
                lastError = '';
                element.getElement().classList.remove('gpo-editor-field--error');
                builder.setInputError('');
            }
            return true;
        },
        focus: builder.focus
    };
}

function mockupFieldControl(field, forceReadonly, materializeOptionalDefault, options) {
    const opts = options || {};
    const builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, Boolean(opts.textarea));
    const checkboxLike =
        builder.value.kind === 'boolean' ||
        builder.value.kind === 'optional_boolean' ||
        builder.controlKind === 'optional_boolean_u8';
    let element;
    if (checkboxLike) {
        element = createElement('div', {
            className: ['field', 'field__checkbox', builder.disabled ? 'field--readonly' : null],
            attrs: { 'data-field-id': field.id },
            children: [
                createElement('label', {
                    children: [
                        builder.input,
                        createElement('span', {
                            className: 'field__label-checkbox',
                            text: field.label || field.id
                        })
                    ]
                }),
                builder.errorElement
            ]
        });
    } else {
        const fieldClasses = ['field', 'field__input'];
        if (opts.textarea) {
            fieldClasses.push('field__description', 'h-auto');
        } else if (builder.controlKind === 'directory_path' || builder.controlKind === 'file_path') {
            fieldClasses.push('field__input--path');
        } else if (valueKindIsSelect(builder)) {
            fieldClasses.push('select');
        }
        element = createElement('div', {
            className: fieldClasses,
            attrs: { 'data-field-id': field.id },
            children: [
                createElement('div', {
                    className: 'field__label',
                    children: [
                        createElement('span', { text: field.label || field.id }),
                        field.required
                            ? createElement('span', {
                                  className: 'gpo-editor-field__required',
                                  text: '*'
                              })
                            : null
                    ]
                }),
                createElement('div', {
                    className: 'field__element',
                    children: [builder.input, builder.errorElement]
                })
            ]
        });
    }
    let lastError = '';
    function applyError(message) {
        lastError = message || '';
        element.getElement().classList.toggle('gpo-editor-field--error', Boolean(message));
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
        element: element,
        read: builder.read,
        setError: applyError,
        setDynamicDisabled: function (nextDisabled) {
            if (!builder.setDynamicDisabled(nextDisabled)) return false;
            element.getElement().classList.toggle('field--readonly', Boolean(nextDisabled));
            if (nextDisabled) {
                lastError = '';
                element.getElement().classList.remove('gpo-editor-field--error');
                builder.setInputError('');
            }
            return true;
        },
        focus: builder.focus
    };
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
