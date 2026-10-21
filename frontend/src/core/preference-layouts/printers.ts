import type { LayoutColumn, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.element' },
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.path' },
    { field: 'properties.location' },
    { line: true },
    { field: 'properties.default' },
    { field: 'properties.deleteAll' }
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
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.path', labelKey: 'columnPath' },
    { source: 'field', field: 'properties.location', labelKey: 'columnLocation' }
];

export { basic, general, filters, columns };
