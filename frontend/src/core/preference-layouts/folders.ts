import type { LayoutColumn, LayoutDependency, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.path' },
    { line: true },
    { field: 'properties.readOnly' },
    { field: 'properties.archive' },
    { field: 'properties.hidden' },
    { line: true },
    { field: 'properties.deleteReadOnly' },
    { field: 'properties.deleteAll' },
    { field: 'properties.deleteSubFolders' }
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
    { field: 'properties.readOnly', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.archive', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.hidden', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.deleteReadOnly', enabledWhen: [{ source: 'properties.action', in: ['replace', 'delete'] }] },
    { field: 'properties.deleteAll', enabledWhen: [{ source: 'properties.action', in: ['replace', 'delete'] }] },
    { field: 'properties.deleteSubFolders', enabledWhen: [{ source: 'properties.action', in: ['replace', 'delete'] }] }
];
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.path', labelKey: 'columnPath' }
];

export { basic, general, filters, dependencies, columns };
