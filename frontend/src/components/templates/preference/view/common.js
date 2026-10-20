import * as dto from '../../../../util/editor-dto';
import * as translations from '../../../../locales/translations';
import * as preferenceLayouts from '../layouts/index';

var t = translations.t;
var PREFERENCE_LAYOUTS = preferenceLayouts;

function pt(key) {
    return t('preferences.editor.' + key);
}

function validationMessage(code) {
    if (code === 'required') return pt('validationRequired');
    if (code === 'invalid_number') return pt('validationInvalidNumber');
    if (code === 'unsigned_byte_range') return pt('validationUnsignedByteRange');
    var targetingCodes = {
        invalid_date: 'validationDate',
        invalid_time: 'validationTime',
        invalid_ip: 'validationIp',
        invalid_ipv6: 'validationIpv6',
        invalid_mac: 'validationMac',
        invalid_version: 'validationVersion',
        invalid_guid: 'validationGuid',
        invalid_range: 'validationRange',
        invalid_value: 'validationValue'
    };
    if (targetingCodes[code]) return pt(targetingCodes[code]);
    return pt('validationFixErrors');
}

function listFrom(result, key) {
    if (Array.isArray(result)) return result;
    return result && Array.isArray(result[key]) ? result[key] : [];
}

function parentCandidateLabel(candidate) {
    var depth = Math.max(0, Math.floor(Number(candidate && candidate.depth) || 0));
    var prefix = '';
    for (var index = 0; index < depth; index += 1) prefix += '\u00a0\u00a0';
    return prefix + String((candidate && candidate.label) || '');
}

function scopeField(field, scope) {
    var result = dto.clone(field);
    if (!result || result.id !== 'metadata.userContext') return result;
    if (scope === 'user') {
        result.label = pt('userContext');
    } else {
        result.hidden = true;
        result.editable = false;
    }
    return result;
}

function actionLabel(value) {
    var key = { create: 'actionCreate', replace: 'actionReplace', update: 'actionUpdate', delete: 'actionDelete' }[
        value
    ];
    return key ? pt(key) : value === null || value === undefined ? '' : String(value);
}

function itemFieldValue(item, fieldId) {
    if (!item || !fieldId) return '';
    if (Array.isArray(item.fields)) {
        for (var index = 0; index < item.fields.length; index++) {
            if (item.fields[index] && item.fields[index].id === fieldId) {
                return dto.valuePayload(item.fields[index].value);
            }
        }
    }
    if (item.properties && typeof item.properties === 'object') {
        var key =
            String(fieldId).indexOf('properties.') === 0
                ? String(fieldId).slice('properties.'.length)
                : String(fieldId);
        if (Object.prototype.hasOwnProperty.call(item.properties, key)) {
            var raw = item.properties[key];
            if (raw && typeof raw === 'object' && 'kind' in raw) return dto.valuePayload(raw);
            return raw === null || raw === undefined ? '' : String(raw);
        }
    }
    return '';
}

function tableColumns(kind) {
    var layout = PREFERENCE_LAYOUTS[kind];
    if (layout && Array.isArray(layout.columns) && layout.columns.length) {
        return layout.columns;
    }
    return null;
}

function editableFields(controls, baseline, changedOnly) {
    var result = [];
    controls.forEach(function (control, id) {
        var field = baseline.get(id);
        if (!field || !field.editable) return;
        var value = control.read();
        if (!changedOnly || !dto.equal(value, field.value)) result.push({ id: id, value: value });
    });
    return result;
}

function filterKey(path) {
    return JSON.stringify(path || []);
}

export {
    pt,
    validationMessage,
    listFrom,
    parentCandidateLabel,
    scopeField,
    actionLabel,
    itemFieldValue,
    tableColumns,
    editableFields,
    filterKey
};
