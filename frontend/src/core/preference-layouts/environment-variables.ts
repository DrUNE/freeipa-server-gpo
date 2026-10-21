import type { LayoutColumn, LayoutDependency, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.name' },
    { field: 'properties.value' },
    { line: true },
    { field: 'properties.user' },
    { field: 'properties.partial' }
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
    { field: 'properties.value', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.partial', enabledWhen: [{ source: 'properties.user', equals: false }] }
];
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.value', labelKey: 'columnValue' }
];

export { basic, general, filters, dependencies, columns };
