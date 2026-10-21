import type { LayoutColumn, LayoutDependency, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
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
const general: LayoutEntry[] = [
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'properties.disabled' },
    { field: 'metadata.desc', textarea: true }
];
const filters: LayoutFilters = 'general';
const dependencies: LayoutDependency[] = [
    { field: 'properties.name', enabledWhen: [{ source: 'properties.default', notEquals: true }] },
    { field: 'properties.type', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.value', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.displayDecimal', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.defaultValue', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.bitfield', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] }
];
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.hive', labelKey: 'columnHive' },
    { source: 'field', field: 'properties.key', labelKey: 'columnKey' }
];

export { basic, general, filters, dependencies, columns };
