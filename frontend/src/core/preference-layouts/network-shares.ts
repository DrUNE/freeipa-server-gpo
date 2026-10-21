import type { LayoutColumn, LayoutDependency, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.name' },
    { field: 'properties.path' },
    { line: true },
    { field: 'properties.allRegular' },
    { field: 'properties.allHidden' },
    { field: 'properties.allAdminDrive' },
    { line: true },
    { field: 'properties.limitUsers' },
    { field: 'properties.userLimit' },
    { field: 'properties.abe' }
];
const general: LayoutEntry[] = [
    { field: 'properties.comment', textarea: true },
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'properties.disabled' },
    { field: 'metadata.desc', textarea: true }
];
const filters: LayoutFilters = 'general';
const dependencies: LayoutDependency[] = [
    { field: 'properties.path', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.comment', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.allRegular', enabledWhen: [{ source: 'properties.action', in: ['update', 'delete'] }] },
    { field: 'properties.allHidden', enabledWhen: [{ source: 'properties.action', in: ['update', 'delete'] }] },
    { field: 'properties.allAdminDrive', enabledWhen: [{ source: 'properties.action', in: ['update', 'delete'] }] },
    { field: 'properties.limitUsers', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    {
        field: 'properties.userLimit',
        enabledWhen: [
            { source: 'properties.action', notEquals: 'delete' },
            { source: 'properties.limitUsers', equals: true }
        ]
    },
    { field: 'properties.abe', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] }
];
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.path', labelKey: 'columnPath' },
    { source: 'field', field: 'properties.userLimit', labelKey: 'columnUserLimit' },
    { source: 'field', field: 'properties.abe', labelKey: 'columnAbe' }
];

export { basic, general, filters, dependencies, columns };
