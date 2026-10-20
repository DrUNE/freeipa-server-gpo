'use strict';

const __export_basic = [
    { field: 'properties.element' },
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.name' }
];
const __export_general = [];
const __export_filters = 'basic';
const __export_columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' }
];

export {
    __export_basic as basic,
    __export_general as general,
    __export_filters as filters,
    __export_columns as columns
};
