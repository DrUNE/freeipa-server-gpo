import { createElement } from '@gpui/util/element-creator';
import {
    policyChoiceValue,
    typedValueFromInput,
    canEditPolicyParameters,
    policyStateAction,
    valuePayload,
    canSelectPolicyState,
    equal,
    clone
} from '@gpui/util/editor-dto';
import { renderUnsupported } from '@gpui/components/editor-status';
import { t } from '@gpui/locales/translations';
import { createControl } from '@gpui/components/collection-control';
import * as policyTabs from '@gpui/components/templates/security/dialog';

let nextParameterControlId = 1;

// The parameter controls and the contents of one policy (text, parameters, supported-on) for the ADMX editor.
function appendLines(container, text) {
    String(text || '')
        .split(/\r?\n/)
        .forEach(function (line, index) {
            if (index) container.appendChild(document.createElement('br'));
            container.appendChild(document.createTextNode(line));
        });
}

function inputValue(value) {
    const payload = valuePayload(value);
    return Array.isArray(payload) ? payload.join('\n') : payload === null || payload === undefined ? '' : payload;
}

function createParameterControl(parameter, editable) {
    const knownKinds = ['boolean', 'decimal', 'enum', 'text', 'list'];
    const unsupportedValue = parameter.value && parameter.value.kind === 'unsupported';
    const unsupportedDefault =
        (parameter.value === null || parameter.value === undefined) &&
        parameter.default_value &&
        parameter.default_value.kind === 'unsupported';
    const unsupported = unsupportedValue || knownKinds.indexOf(parameter.kind) === -1;
    const disabled = !editable || parameter.editable === false || unsupported;
    let input;
    let inputElement = null;
    let collectionControl = null;
    const renderedValue =
        parameter.value === null || parameter.value === undefined
            ? unsupportedDefault
                ? null
                : parameter.default_value
            : parameter.value;
    const choices = parameter.choices || [];

    if (unsupported) {
        input = createElement('pre', {
            className: ['gpo-editor-unsupported', 'field__element'],
            text: JSON.stringify(
                renderedValue && renderedValue.value !== undefined
                    ? renderedValue.value
                    : { kind: parameter.kind, value: renderedValue },
                null,
                2
            )
        });
    } else if (parameter.kind === 'boolean') {
        const checkboxId = 'gpo-editor-parameter-' + nextParameterControlId++;
        const checkbox = createElement('input', {
            attrs: {
                id: checkboxId,
                type: 'checkbox',
                disabled: disabled ? 'disabled' : null
            }
        });
        inputElement = checkbox.getElement();
        inputElement.checked = Boolean(inputValue(renderedValue));
        input = createElement('span', {
            className: 'gpo-editor-boolean',
            children: [
                checkbox,
                createElement('label', {
                    attrs: { for: checkboxId }
                })
            ]
        });
    } else if (parameter.kind === 'enum') {
        input = createElement('select', {
            attrs: { disabled: disabled ? 'disabled' : null },
            children: [
                !parameter.required ? createElement('option', { attrs: { value: '' }, text: '—' }) : null
            ].concat(
                choices.map(function (choice, index) {
                    return createElement('option', {
                        attrs: {
                            value: String(index),
                            disabled: choice.value && choice.value.kind === 'unsupported' ? 'disabled' : null
                        },
                        text: choice.label || String(valuePayload(choice.value))
                    });
                })
            )
        });
        const selectedIndex = choices.findIndex(function (choice) {
            return equal(choice.value, renderedValue);
        });
        input.getElement().value = selectedIndex < 0 ? '' : String(selectedIndex);
    } else if (parameter.kind === 'list') {
        collectionControl = createControl(parameter, renderedValue, !disabled);
        input = collectionControl.element;
        inputElement = collectionControl.button;
    } else {
        input = createElement('input', {
            attrs: {
                type: parameter.kind === 'decimal' ? 'number' : 'text',
                min: parameter.min_value,
                max: parameter.max_value,
                maxlength: parameter.max_length,
                required: parameter.required ? 'required' : null,
                disabled: disabled ? 'disabled' : null,
                value: inputValue(renderedValue)
            }
        });
    }

    if (!inputElement) inputElement = input.getElement();
    if (!unsupported && !collectionControl) inputElement.setAttribute('aria-label', parameter.label || parameter.id);
    let stateDisabled = false;

    function syncControlState() {
        const unavailable = disabled || unsupported || stateDisabled;
        if (collectionControl) collectionControl.setEditable(!unavailable);
        else inputElement.disabled = unavailable;
    }
    syncControlState();

    function read() {
        if (unsupported) return clone(parameter.value);
        if (collectionControl) return collectionControl.read();
        if (parameter.kind === 'enum') {
            return policyChoiceValue(choices, inputElement.value);
        }
        return typedValueFromInput(parameter.value, parameter.kind, inputElement.value, inputElement.checked);
    }

    return {
        element: createElement('div', {
            className: [
                'gp__admx-options',
                collectionControl ? 'gp__admx-options--collection' : null,
                unsupported ? 'gpo-editor-field--unsupported' : null,
                unsupportedDefault ? 'gpo-editor-field--unsupported-default' : null
            ],
            attrs: { 'data-field-id': parameter.id },
            children: [
                input,
                unsupportedDefault
                    ? createElement('span', {
                          className: 'gpo-editor-field__diagnostic',
                          text: t('policies.unsupportedDefault')
                      })
                    : null
            ]
        }),
        read: read,
        input: inputElement,
        destroy: function () {
            if (collectionControl) collectionControl.destroy();
        },
        hasOpenDialog: function () {
            return Boolean(collectionControl && collectionControl.hasOpenDialog());
        },
        hasUnsavedDialogChanges: function () {
            return Boolean(collectionControl && collectionControl.hasUnsavedChanges());
        },
        setDisabled: function (shouldDisable) {
            stateDisabled = Boolean(shouldDisable);
            syncControlState();
        }
    };
}

function renderPolicyContents(root, policy, handlers) {
    const capabilities = policy.capabilities || {};
    const unknown = policy.state === 'unknown_raw_values';
    const controls = new Map();
    const stateNames = {
        not_configured: t('policies.notConfigured'),
        enabled: t('policies.enabled'),
        disabled: t('policies.disabled')
    };

    const stateControls = Object.keys(stateNames).map(function (state) {
        const allowed = canSelectPolicyState(policy, state);
        const radio = createElement('input', {
            attrs: {
                type: 'radio',
                name: 'admx-state',
                value: state,
                checked: policy.state === state ? 'checked' : null,
                disabled: allowed ? null : 'disabled'
            }
        });
        return createElement('label', {
            className: ['gp__admx-radio', allowed ? null : 'gpo-editor-control--disabled'],
            children: [radio, createElement('span', { text: stateNames[state] })]
        });
    });

    const parameterRows = (capabilities.inspect_parameters ? policy.parameters || [] : []).map(function (parameter) {
        // Compatibility with installed bindings that predate list metadata.
        if (
            parameter.kind === 'list' &&
            !parameter.collection &&
            policyStateAction(policy, 'enabled').mode === 'dynamic_list_values'
        ) {
            parameter = Object.assign({}, parameter, {
                collection: {
                    mode: parameter.value && parameter.value.kind === 'key_value_list' ? 'key_value' : 'list',
                    unique_keys: true,
                    key_case_sensitive: false,
                    allow_empty_values: false,
                    min_items: 1
                }
            });
        }
        const control = createParameterControl(parameter, Boolean(capabilities.edit_parameters) && !unknown);
        if (handlers.modalLayout) control.element.addClass('field__element');
        controls.set(parameter.id, control);
        return createElement('div', {
            className: 'gp__admx-item',
            children: [
                createElement('div', {
                    className: 'gp__admx-description',
                    text: parameter.label || parameter.id
                }),
                control.element
            ]
        });
    });

    const comment = createElement('textarea', {
        attrs: {
            name: 'comment',
            'aria-label': handlers.modalLayout ? null : t('common.comment'),
            disabled: capabilities.edit_comments && !unknown ? null : 'disabled'
        },
        text: policy.comment ? policy.comment.text : ''
    });
    const errorSlot = createElement('div', { className: 'gpo-editor-form__error' });
    const wrapper = createElement('div', {
        className: 'gp__admx-wrapper',
        children: [
            handlers.categoryPath
                ? createElement('div', {
                      className: 'gpo-security-workbench__toolbar',
                      children: [
                          createElement('h2', { text: handlers.categoryPath, attrs: { 'data-category-path': '' } })
                      ]
                  })
                : null,
            errorSlot,
            unknown ? renderUnsupported(t('policies.unsupportedSource')) : null,
            createElement('div', {
                className: [
                    'gp__admx',
                    (policy.parameters || []).some(function (parameter) {
                        return parameter.kind === 'list';
                    })
                        ? 'gp__admx--collections'
                        : null
                ],
                children: [
                    createElement('div', {
                        className: 'gp__admx-settings',
                        children: [
                            createElement('div', {
                                className: 'title',
                                children: [
                                    t('policies.policy') + ' ',
                                    createElement('span', {
                                        className: 'title__name',
                                        text: policy.label || policy.policy_id
                                    })
                                ]
                            }),
                            createElement('div', {
                                className: 'gp__admx-state-policy-title',
                                text: t('policies.policyState')
                            }),
                            createElement('div', {
                                className: 'gp__admx-state-policy',
                                children: stateControls
                            }),
                            createElement('div', { className: 'field__line' })
                        ]
                    }),
                    createElement('div', {
                        className: 'gp__admx-info',
                        children: parameterRows.length
                            ? [
                                  createElement('div', {
                                      className: 'gp__admx-item',
                                      children: [
                                          createElement('div', {
                                              className: 'gp__admx-description',
                                              text: t('common.description')
                                          }),
                                          createElement('div', {
                                              className: 'gp__admx-options',
                                              text: t('common.options')
                                          })
                                      ]
                                  })
                              ].concat(parameterRows)
                            : []
                    })
                ]
            }),
            createElement('div', {
                className: ['gp__admx-help', handlers.isHelpOpen ? 'is-open' : null],
                children: [
                    createElement('div', {
                        className: 'gp__admx-supported',
                        children: [
                            createElement('div', { className: 'title', text: t('policies.supportedOn') }),
                            createElement('div', { className: 'gp__admx-content', text: policy.supported_on || '' })
                        ]
                    }),
                    createElement('div', {
                        className: 'gp__admx-comment',
                        children: [createElement('div', { className: 'title', text: t('common.comment') }), comment]
                    }),
                    createElement('div', {
                        className: 'gp__admx-text-help',
                        children: [
                            createElement('div', { className: 'title', text: t('common.help') }),
                            createElement('div', { className: 'gp__admx-content' })
                        ]
                    })
                ]
            })
        ]
    });
    root.innerHTML = '';
    if (handlers.modalLayout) {
        const settings = createElement('div', {
            className: 'gpo-admx-dialog__settings',
            children: [
                errorSlot,
                unknown ? renderUnsupported(t('policies.unsupportedSource')) : null,
                createElement('div', {
                    className: 'gp__admx-settings',
                    children: [
                        createElement('div', {
                            className: 'gp__admx-state-policy-title',
                            text: t('policies.policyState')
                        }),
                        createElement('div', { className: 'gp__admx-state-policy', children: stateControls })
                    ]
                })
            ].concat(parameterRows, [
                createElement('div', {
                    className: 'gpo-admx-dialog__comment',
                    children: [
                        createElement('label', {
                            text: t('common.comment'),
                            attrs: { for: 'admx-comment-' + nextParameterControlId }
                        }),
                        createElement('div', { className: 'field__element', children: [comment] })
                    ]
                })
            ])
        });
        comment.getElement().id = 'admx-comment-' + nextParameterControlId++;
        const supported = createElement('p');
        appendLines(supported.getElement(), policy.supported_on || '—');
        const help = createElement('p');
        appendLines(help.getElement(), policy.explain_text || t('security.noExplanation'));
        const explanation = createElement('div', {
            className: 'gpo-admx-dialog__explanation',
            children: [
                createElement('h3', { text: t('policies.supportedOn') }),
                supported,
                createElement('h3', { text: t('security.explanationTab') }),
                help
            ]
        });
        const tabs = policyTabs.tabs(settings, explanation);
        tabs.getElement().querySelector('[role="tab"]').textContent = t('policies.parametersTab');
        root.appendChild(tabs.getElement());
    } else {
        root.appendChild(wrapper.getElement());
        appendLines(root.querySelector('.gp__admx-text-help .gp__admx-content'), policy.explain_text || '');
    }

    function selectedState() {
        const selected = root.querySelector('input[name="admx-state"]:checked');
        return selected ? selected.value : policy.state;
    }

    function syncPolicyState() {
        const editable = canEditPolicyParameters(policy, selectedState());
        controls.forEach(function (control) {
            control.setDisabled(!editable);
        });
        return editable;
    }

    syncPolicyState();

    function readDraft() {
        return {
            state: selectedState(),
            parameters: (policy.parameters || []).map(function (parameter) {
                return {
                    parameter_id: parameter.id,
                    value: controls.has(parameter.id) ? controls.get(parameter.id).read() : clone(parameter.value)
                };
            }),
            comment: comment.getElement().value
        };
    }

    return {
        readDraft: readDraft,
        syncPolicyState: syncPolicyState,
        errorSlot: errorSlot.getElement(),
        controls: controls,
        hasOpenDialog: function () {
            return Array.from(controls.values()).some(function (control) {
                return control.hasOpenDialog();
            });
        },
        hasUnsavedDialogChanges: function () {
            return Array.from(controls.values()).some(function (control) {
                return control.hasUnsavedDialogChanges();
            });
        },
        destroy: function () {
            controls.forEach(function (control) {
                control.destroy();
            });
        }
    };
}

export { appendLines, inputValue, createParameterControl, renderPolicyContents };
