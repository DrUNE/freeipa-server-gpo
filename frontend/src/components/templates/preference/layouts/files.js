'use strict';

const __export_basic = [
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.fromPath' },
    { field: 'properties.targetPath' },
    { line: true },
    { field: 'properties.readOnly' },
    { field: 'properties.archive' },
    { field: 'properties.hidden' },
    { field: 'properties.suppress' },
    { line: true },
    { field: 'properties.deleteReadOnly' },
    { field: 'properties.deleteAll' },
    { field: 'properties.deleteSubFolders' }
];
const __export_general = [
    { field: 'metadata.bypassErrors' },
    { field: 'metadata.userContext' },
    { field: 'metadata.removePolicy' },
    { field: 'properties.disabled' },
    { field: 'metadata.desc', textarea: true }
];
const __export_filters = 'general';
const __export_dependencies = [
    { field: 'properties.fromPath', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.readOnly', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.archive', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.hidden', enabledWhen: [{ source: 'properties.action', notEquals: 'delete' }] },
    { field: 'properties.suppress', enabledWhen: [{ source: 'properties.action', notEquals: 'create' }] },
    { field: 'properties.deleteReadOnly', enabledWhen: [{ source: 'properties.action', in: ['replace', 'delete'] }] },
    { field: 'properties.deleteAll', enabledWhen: [{ source: 'properties.action', in: ['replace', 'delete'] }] },
    { field: 'properties.deleteSubFolders', enabledWhen: [{ source: 'properties.action', in: ['replace', 'delete'] }] }
];
const __export_columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.fromPath', labelKey: 'columnSourcePath' },
    { source: 'field', field: 'properties.targetPath', labelKey: 'columnTargetPath' }
];

export {
    __export_basic as basic,
    __export_general as general,
    __export_filters as filters,
    __export_dependencies as dependencies,
    __export_columns as columns
};
