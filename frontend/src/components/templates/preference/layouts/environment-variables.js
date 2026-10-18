'use strict';

const __export_basic = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.name' },
    { field: 'properties.value' },
    { line: true },
    { field: 'properties.user' },
    { field: 'properties.partial' }
];
const __export_general = [
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'properties.disabled' },
    { field: 'metadata.desc', textarea: true }
];
const __export_filters = 'general';
const __export_dependencies = [
    { field: 'properties.value', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.partial', enabledWhen: [{ source: 'properties.user', equals: false }] }
];
const __export_columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.value', labelKey: 'columnValue' }
];

export {
    __export_basic as basic,
    __export_general as general,
    __export_filters as filters,
    __export_dependencies as dependencies,
    __export_columns as columns
};
