const basic = [
    { field: 'properties.element' },
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.name' }
];
const general = [];
const filters = 'basic';
const columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' }
];

export { basic, general, filters, columns };
