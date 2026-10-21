import type { LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [];
const general: LayoutEntry[] = [
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'properties.disabled' },
    { field: 'metadata.desc', textarea: true }
];
const filters: LayoutFilters = 'general';

export { basic, general, filters };
