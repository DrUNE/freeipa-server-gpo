const basic = [
    { field: 'properties.element' },
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.path' },
    { field: 'properties.location' },
    { line: true },
    { field: 'properties.default' },
    { field: 'properties.deleteAll' }
];
const general = [
    { field: 'properties.comment', textarea: true },
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'properties.disabled' },
    { field: 'metadata.desc', textarea: true }
];
const filters = 'general';
const columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.path', labelKey: 'columnPath' },
    { source: 'field', field: 'properties.location', labelKey: 'columnLocation' }
];

export { basic, general, filters, columns };
