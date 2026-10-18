/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.element' },
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.name' }
            ];
    const __export_general = [];
    const __export_filters = 'basic';
    const __export_columns = [
                { source: 'name',  labelKey: 'columnName' },
                { source: 'order', labelKey: 'columnOrder' },
                { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
