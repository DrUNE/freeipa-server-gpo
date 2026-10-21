import type { LayoutColumn, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.path' },
    { field: 'properties.thisDrive' },
    { field: 'properties.allDrives' },
    { line: true },
    { field: 'properties.userName' },
    { field: 'properties.label' },
    { line: true },
    { field: 'properties.persistent' },
    { field: 'properties.useLetter' },
    { field: 'properties.letter' }
];
const general: LayoutEntry[] = [
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
    { source: 'field', field: 'properties.letter', labelKey: 'columnLetter' },
    { source: 'field', field: 'properties.path', labelKey: 'columnPath' }
];

export { basic, general, filters, columns };
