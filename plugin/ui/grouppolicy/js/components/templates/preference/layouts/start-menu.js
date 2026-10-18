/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
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
    const __export_general = [
                { field: 'metadata.bypassErrors' },
                { field: 'metadata.userContext' },
                { field: 'metadata.removePolicy' },
                { field: 'metadata.desc', textarea: true }
            ];
    const __export_filters = 'general';
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
