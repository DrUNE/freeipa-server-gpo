/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.element' },
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.path' },
                { field: 'properties.location' },
                { line: true },
                { field: 'properties.default' },
                { field: 'properties.deleteAll' }
            ];
    const __export_general = [
                { field: 'properties.comment', textarea: true },
                { field: 'metadata.bypassErrors' },
                { field: 'metadata.userContext' },
                { field: 'metadata.removePolicy' },
                { field: 'properties.disabled' },
                { field: 'metadata.desc', textarea: true }
            ];
    const __export_filters = 'general';
    const __export_columns = [
                { source: 'name',  labelKey: 'columnName' },
                { source: 'order', labelKey: 'columnOrder' },
                { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
                { source: 'field', field: 'properties.path',     labelKey: 'columnPath' },
                { source: 'field', field: 'properties.location', labelKey: 'columnLocation' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
