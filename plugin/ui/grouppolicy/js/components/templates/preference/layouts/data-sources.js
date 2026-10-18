/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.dsn' },
                { field: 'properties.driver' },
                { field: 'properties.description' },
                { field: 'properties.server' },
                { field: 'properties.database' },
                { line: true },
                { field: 'properties.lastUser' },
                { field: 'properties.username' }
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
                { field: 'properties.dsn', enabledWhen: [
                    { source: 'properties.action', notEquals: 'delete' }
                ] },
                { field: 'properties.username', enabledWhen: [
                    { source: 'properties.action', notEquals: 'delete' }
                ] }
            ];
    const __export_columns = [
                { source: 'name',  labelKey: 'columnName' },
                { source: 'order', labelKey: 'columnOrder' },
                { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
                { source: 'field', field: 'properties.driver',   labelKey: 'columnDriver' },
                { source: 'field', field: 'properties.server',   labelKey: 'columnServer' },
                { source: 'field', field: 'properties.database', labelKey: 'columnDatabase' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.dependencies = __export_dependencies;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
