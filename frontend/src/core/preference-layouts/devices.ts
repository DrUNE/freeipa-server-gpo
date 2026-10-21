import type { LayoutColumn, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.deviceName' },
    { field: 'properties.deviceAction' },
    { line: true },
    { field: 'properties.deviceId' },
    { field: 'properties.deviceClass' },
    { field: 'properties.classGuid' }
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
    { source: 'field', field: 'properties.deviceClass', labelKey: 'columnDeviceClass' },
    { source: 'field', field: 'properties.deviceId', labelKey: 'columnDeviceId' }
];

export { basic, general, filters, columns };
