/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.path' },
                { field: 'properties.thisDrive' },
                { field: 'properties.allDrives' },
                { line: true },
                { field: 'properties.userName' },
                { field: 'properties.label' },
                { line: true },
                { field: 'properties.persistent' },
                { field: 'properties.useLetter' },
                { field: 'properties.letter' }
            ];
    const __export_general = [
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
                { source: 'field', field: 'properties.letter', labelKey: 'columnLetter' },
                { source: 'field', field: 'properties.path',   labelKey: 'columnPath' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
