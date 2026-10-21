import type { LayoutColumn, LayoutDependency, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.dsn' },
    { field: 'properties.driver' },
    { field: 'properties.description' },
    { field: 'properties.server' },
    { field: 'properties.database' },
    { line: true },
    { field: 'properties.lastUser' },
    { field: 'properties.username' }
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
    { field: 'properties.dsn', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.username', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] }
];
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.driver', labelKey: 'columnDriver' },
    { source: 'field', field: 'properties.server', labelKey: 'columnServer' },
    { source: 'field', field: 'properties.database', labelKey: 'columnDatabase' }
];

export { basic, general, filters, dependencies, columns };
