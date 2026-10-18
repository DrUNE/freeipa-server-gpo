    "use strict";

const __export_basic = [
            { field: 'properties.action' },
            { line: true },
            { field: 'properties.hive' },
            { field: 'properties.key' },
            { line: true },
            { field: 'properties.name' },
            { field: 'properties.type' },
            { field: 'properties.value' },
            { line: true },
            { field: 'properties.default' },
            { field: 'properties.displayDecimal' },
            { field: 'properties.defaultValue' },
            { field: 'properties.bitfield' }
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
            { field: 'properties.name', enabledWhen: [
                { source: 'properties.default', notEquals: true }
            ] },
            { field: 'properties.type', enabledWhen: [
                { source: 'properties.action', notEquals: 'delete' }
            ] },
            { field: 'properties.value', enabledWhen: [
                { source: 'properties.action', notEquals: 'delete' }
            ] },
            { field: 'properties.displayDecimal', enabledWhen: [
                { source: 'properties.action', notEquals: 'delete' }
            ] },
            { field: 'properties.defaultValue', enabledWhen: [
                { source: 'properties.action', notEquals: 'delete' }
            ] },
            { field: 'properties.bitfield', enabledWhen: [
                { source: 'properties.action', notEquals: 'delete' }
            ] }
        ];
const __export_columns = [
            { source: 'name',  labelKey: 'columnName' },
            { source: 'order', labelKey: 'columnOrder' },
            { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
            { source: 'field', field: 'properties.hive', labelKey: 'columnHive' },
            { source: 'field', field: 'properties.key',  labelKey: 'columnKey' }
        ];

export { __export_basic as basic, __export_general as general, __export_filters as filters, __export_dependencies as dependencies, __export_columns as columns };
