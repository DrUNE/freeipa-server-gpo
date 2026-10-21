const basic = [
    { field: 'properties.element' },
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.pinCCPN' },
    { field: 'properties.pinHelp' },
    { field: 'properties.pinNetwork' },
    { field: 'properties.pinSystem' },
    { field: 'properties.pinDefault' },
    { field: 'properties.largeMSC' }
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
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' }
];

export { basic, general, filters, columns };
