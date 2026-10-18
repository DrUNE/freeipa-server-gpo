/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.serviceName' },
                { field: 'properties.startupType' },
                { field: 'properties.serviceAction' },
                { line: true },
                { field: 'properties.timeout' },
                { field: 'properties.accountName' },
                { field: 'properties.interact' },
                { line: true },
                { field: 'properties.firstFailure' },
                { field: 'properties.secondFailure' },
                { field: 'properties.thirdFailure' },
                { line: true },
                { field: 'properties.resetFailCountDelay' },
                { field: 'properties.restartServiceDelay' },
                { field: 'properties.restartComputerDelay' },
                { field: 'properties.restartComputerMessage' },
                { line: true },
                { field: 'properties.program' },
                { field: 'properties.args' },
                { field: 'properties.append' }
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
                { source: 'field', field: 'properties.startupType',   labelKey: 'columnStartupType' },
                { source: 'field', field: 'properties.serviceAction', labelKey: 'columnServiceAction' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
