/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define([], function () { 'use strict';
    var exports = {};

    "use strict";

    const __export_basic = [
                { field: 'properties.element' },
                { field: 'properties.action' },
                { line: true },
                { field: 'properties.userName' },
                { field: 'properties.newName' },
                { field: 'properties.fullName' },
                { field: 'properties.description' },
                { line: true },
                { field: 'properties.changeLogon' },
                { field: 'properties.noChange' },
                { field: 'properties.neverExpires' },
                { field: 'properties.acctDisabled' },
                { field: 'properties.expires' }
            ];
    const __export_general = [
                { field: 'metadata.bypassErrors' },
                { field: 'metadata.userContext' },
                { field: 'metadata.removePolicy' },
                { field: 'metadata.desc', textarea: true }
            ];
    const __export_filters = 'general';
    const __export_dependencies = [
                { field: 'properties.newName', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.fullName', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.description', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.changeLogon', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.noChange', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.neverExpires', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.acctDisabled', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] }
                ] },
                { field: 'properties.expires', enabledWhen: [
                    { anyOf: [
                        { source: 'properties.element', notEquals: 'Group' },
                        { source: 'properties.action', notEquals: 'delete' }
                    ] },
                    { source: 'properties.neverExpires', notEquals: true }
                ] }
            ];
    const __export_columns = [
                { source: 'name',  labelKey: 'columnName' },
                { source: 'order', labelKey: 'columnOrder' },
                { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
                { source: 'field', field: 'properties.userName', labelKey: 'columnUserName' }
            ];

    exports.basic = __export_basic;
    exports.columns = __export_columns;
    exports.dependencies = __export_dependencies;
    exports.filters = __export_filters;
    exports.general = __export_general;


    return Object.freeze(exports);
});
