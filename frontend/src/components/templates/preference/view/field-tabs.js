import * as dto from '../../../../util/editor-dto';
import * as elementCreator from '../../../../util/element-creator';
import * as commonModule from './common';
import * as fieldControlModule from './field-control';

var createElement = elementCreator.createElement;
var pt = commonModule.pt;
var nextControlId = fieldControlModule.nextControlId;
var hiddenFieldControl = fieldControlModule.hiddenFieldControl;
var mockupFieldControl = fieldControlModule.mockupFieldControl;
var fieldControl = fieldControlModule.fieldControl;

function buildPlaceholderCheckbox(entry) {
    var label = (entry && entry.label) || (entry && entry.labelKey ? pt(entry.labelKey) : '');
    var controlId = nextControlId();
    var checkbox = createElement('input', {
        attrs: {
            id: controlId,
            type: 'checkbox',
            disabled: 'disabled'
        }
    });
    return createElement('div', {
        className: ['field', 'field__checkbox', 'field--readonly'],
        children: [
            createElement('label', {
                children: [
                    createElement('span', {
                        className: 'gpo-editor-boolean',
                        children: [
                            checkbox,
                            createElement('label', {
                                attrs: { for: controlId, 'aria-label': label }
                            })
                        ]
                    }),
                    createElement('span', {
                        className: 'field__label-checkbox',
                        text: label
                    })
                ]
            })
        ]
    });
}

function isMetadataField(field) {
    return String((field && field.id) || '').indexOf('metadata.') === 0;
}

function isGeneralTabField(field) {
    return isMetadataField(field) || (Boolean(field) && field.id === 'properties.disabled');
}

function isBasicTabField(field) {
    return !isGeneralTabField(field);
}

function orderedTabEntries(fields, layoutEntries, predicate) {
    var layout = Array.isArray(layoutEntries) ? layoutEntries : [];
    var belongs =
        typeof predicate === 'function'
            ? predicate
            : function () {
                  return true;
              };
    var result = [];
    var placed = {};
    layout.forEach(function (entry) {
        var item = dto.clone(entry || {});
        if (!item.field) {
            if (item.line) result.push({ line: true });
            if (item.placeholder) result.push(item);
            return;
        }
        var field = fields.find(function (candidate) {
            return candidate.id === item.field;
        });
        if (!field || !belongs(field)) return;
        placed[item.field] = true;
        result.push(item);
    });
    fields.forEach(function (field) {
        if (placed[field.id] || !belongs(field)) return;
        result.push({ field: field.id });
    });
    return result;
}

function buildFieldTabs(fields, options) {
    var opts = options || {};
    var layout = opts.layout || null;
    var fieldsById = new Map();
    fields.forEach(function (field) {
        fieldsById.set(field.id, field);
    });
    var basicEntries = orderedTabEntries(fields, layout ? layout.basic : null, isBasicTabField);
    var generalEntries = orderedTabEntries(fields, layout ? layout.general : null, isGeneralTabField);
    var fieldOptions = {};
    basicEntries.concat(generalEntries).forEach(function (entry) {
        if (entry && entry.field && !fieldOptions[entry.field]) fieldOptions[entry.field] = entry;
    });

    fields.forEach(function (field) {
        var control;
        if (field.hidden) {
            control = hiddenFieldControl(field);
        } else if (layout) {
            control = mockupFieldControl(field, opts.readonly, opts.creating, fieldOptions[field.id] || {});
        } else {
            control = fieldControl(field, opts.readonly, opts.creating);
        }
        opts.controls.push(control);
        if (!opts.controlsById.has(field.id)) opts.controlsById.set(field.id, []);
        opts.controlsById.get(field.id).push(control);
    });

    function renderable(entries) {
        return entries.some(function (entry) {
            if (entry.placeholder) return true;
            if (!entry.field) return false;
            var field = fieldsById.get(entry.field);
            return Boolean(field && !field.hidden);
        });
    }

    var basicHasFields = renderable(basicEntries);
    var generalHasFields = renderable(generalEntries);
    if (!basicHasFields && !generalHasFields) return null;

    function buildContent(entries) {
        var content = createElement('div', { className: 'tab-content' });
        entries.forEach(function (entry) {
            if (entry.line) {
                content.append(createElement('div', { className: 'field__line' }));
                return;
            }
            if (entry.placeholder) {
                content.append(buildPlaceholderCheckbox(entry));
                return;
            }
            if (!entry.field) return;
            (opts.controlsById.get(entry.field) || []).forEach(function (control) {
                if (control.element) content.append(control.element);
            });
        });
        return content;
    }

    var basicContent = buildContent(basicEntries);
    var generalContent = buildContent(generalEntries);
    basicContent.getElement().id = 'tab-basic';
    generalContent.getElement().id = 'tab-general';
    var activeTab = basicHasFields ? 'tab-basic' : 'tab-general';
    if (activeTab === 'tab-basic') basicContent.getElement().classList.add('active');
    else generalContent.getElement().classList.add('active');

    var tabs = createElement('div', { className: 'preference__modal-tabs' });
    var buttons = createElement('div', { className: 'tab-buttons' });
    [
        { id: 'tab-basic', enabled: basicHasFields, label: pt('tabBasic') },
        { id: 'tab-general', enabled: generalHasFields, label: pt('tabGeneral') }
    ].forEach(function (spec) {
        if (!spec.enabled) return;
        buttons.append(
            createElement('div', {
                className: ['preference__tab-button', activeTab === spec.id ? 'active' : null],
                attrs: { 'data-tab': spec.id },
                text: spec.label,
                events: {
                    click: function () {
                        activateTab(spec.id);
                    }
                }
            })
        );
    });
    tabs.append(buttons);
    tabs.append(basicContent);
    tabs.append(generalContent);

    var filtersTab = opts.layout
        ? opts.layout.filters === 'basic'
            ? 'tab-basic'
            : opts.layout.filters === 'general'
              ? 'tab-general'
              : null
        : null;
    tabs.filtersSlot =
        filtersTab === 'tab-basic' && basicHasFields
            ? basicContent
            : filtersTab === 'tab-general' && generalHasFields
              ? generalContent
              : null;

    function activateTab(id) {
        Array.prototype.forEach.call(tabs.getElement().querySelectorAll('.preference__tab-button'), function (button) {
            button.classList.toggle('active', button.getAttribute('data-tab') === id);
        });
        Array.prototype.forEach.call(tabs.getElement().querySelectorAll('.tab-content'), function (content) {
            content.classList.toggle('active', content.id === id);
        });
    }

    return tabs;
}

export {
    buildPlaceholderCheckbox,
    isMetadataField,
    isGeneralTabField,
    isBasicTabField,
    orderedTabEntries,
    buildFieldTabs
};
