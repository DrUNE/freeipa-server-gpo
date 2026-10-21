const basic = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.systemLocale' },
    { field: 'properties.userLocale' },
    { line: true },
    { field: 'properties.inputLocale' },
    { field: 'properties.userInputLocale' }
];
const general = [
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'metadata.desc', textarea: true }
];
const filters = 'general';
const columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.systemLocale', labelKey: 'columnSystemLocale' }
];

export { basic, general, filters, columns };
