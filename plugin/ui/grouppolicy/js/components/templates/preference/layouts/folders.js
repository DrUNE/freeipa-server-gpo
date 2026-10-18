/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.path' },
                { line: true },
                { field: 'properties.readOnly' },
                { field: 'properties.archive' },
                { field: 'properties.hidden' },
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
                { field: 'properties.readOnly', enabledWhen: [
                    { source: 'properties.action', notEquals: 'delete' }
                ] },
                { field: 'properties.archive', enabledWhen: [
                    { source: 'properties.action', notEquals: 'delete' }
                ] },
                { field: 'properties.hidden', enabledWhen: [
                    { source: 'properties.action', notEquals: 'delete' }
                ] },
                { field: 'properties.deleteReadOnly', enabledWhen: [
                    { source: 'properties.action', in: ['replace', 'delete'] }
                ] },
                { field: 'properties.deleteAll', enabledWhen: [
                    { source: 'properties.action', in: ['replace', 'delete'] }
                ] },
                { field: 'properties.deleteSubFolders', enabledWhen: [
                    { source: 'properties.action', in: ['replace', 'delete'] }
                ] }
            ];
    const __export_columns = [
                { source: 'name',  labelKey: 'columnName' },
                { source: 'order', labelKey: 'columnOrder' },
                { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
                { source: 'field', field: 'properties.path',   labelKey: 'columnPath' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.dependencies = __export_dependencies;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
