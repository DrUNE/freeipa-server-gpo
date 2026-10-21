import { clone } from '@gpui/util/editor-dto';
import { createElement, ElementCreator } from '@gpui/util/element-creator';
import { createTabs } from '@gpui/components/Tabs/Tabs';
import { pt } from '@gpui/components/templates/preference/view/common';
import {
    nextControlId,
    hiddenFieldControl,
    mockupFieldControl,
    fieldControl
} from '@gpui/components/templates/preference/view/field-control';

function buildPlaceholderCheckbox(entry) {
    const label = (entry && entry.label) || (entry && entry.labelKey ? pt(entry.labelKey) : '');
    const controlId = nextControlId();
    const checkbox = createElement('input', {
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
    const layout = Array.isArray(layoutEntries) ? layoutEntries : [];
    const belongs =
        typeof predicate === 'function'
            ? predicate
            : function () {
                  return true;
              };
    const result = [];
    const placed = {};
    layout.forEach(function (entry) {
        const item = clone(entry || {});
        if (!item.field) {
            if (item.line) result.push({ line: true });
            if (item.placeholder) result.push(item);
            return;
        }
        const field = fields.find(function (candidate) {
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
    const opts = options || {};
    const layout = opts.layout || null;
    const fieldsById = new Map();
    fields.forEach(function (field) {
        fieldsById.set(field.id, field);
    });
    const basicEntries = orderedTabEntries(fields, layout ? layout.basic : null, isBasicTabField);
    const generalEntries = orderedTabEntries(fields, layout ? layout.general : null, isGeneralTabField);
    const fieldOptions = {};
    basicEntries.concat(generalEntries).forEach(function (entry) {
        if (entry && entry.field && !fieldOptions[entry.field]) fieldOptions[entry.field] = entry;
    });

    fields.forEach(function (field) {
        let control;
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
            const field = fieldsById.get(entry.field);
            return Boolean(field && !field.hidden);
        });
    }

    const basicHasFields = renderable(basicEntries);
    const generalHasFields = renderable(generalEntries);
    if (!basicHasFields && !generalHasFields) return null;

    function fillPanel(panel, entries) {
        entries.forEach(function (entry) {
            if (entry.line) {
                panel.append(createElement('div', { className: 'field__line' }).getElement());
                return;
            }
            if (entry.placeholder) {
                panel.append(buildPlaceholderCheckbox(entry).getElement());
                return;
            }
            if (!entry.field) return;
            (opts.controlsById.get(entry.field) || []).forEach(function (control) {
                if (control.element) panel.append(control.element.getElement());
            });
        });
    }

    const activeTab = basicHasFields ? 'tab-basic' : 'tab-general';
    const shown = [
        { id: 'tab-basic', enabled: basicHasFields, label: pt('tabBasic'), entries: basicEntries },
        { id: 'tab-general', enabled: generalHasFields, label: pt('tabGeneral'), entries: generalEntries }
    ];
    // Both panels exist, the way the form's code finds them by id; only the tabs of non-empty panels get a button.
    const component = createTabs({
        label: pt('tabsLabel'),
        active: activeTab,
        tabs: shown.map(function (spec) {
            return { id: spec.id, label: spec.label, hidden: !spec.enabled };
        })
    });
    shown.forEach(function (spec) {
        fillPanel(component.panel(spec.id), spec.entries);
    });
    const tabs = /** @type {any} */ (ElementCreator.wrap(component.element));
    const basicContent = ElementCreator.wrap(component.panel('tab-basic'));
    const generalContent = ElementCreator.wrap(component.panel('tab-general'));

    const filtersTab = opts.layout
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
