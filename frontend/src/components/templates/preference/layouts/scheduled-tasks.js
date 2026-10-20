'use strict';

const __export_basic = [
    { field: 'properties.element' },
    { field: 'properties.action' },
    { line: true },
    { field: 'properties.name' },
    { field: 'properties.appName' },
    { field: 'properties.args' },
    { field: 'properties.startIn' },
    { field: 'properties.comment' },
    { line: true },
    { field: 'properties.runAs' },
    { field: 'properties.enabled' },
    { field: 'properties.deleteWhenDone' },
    { line: true },
    { field: 'properties.startOnlyIfIdle' },
    { field: 'properties.stopOnIdleEnd' },
    { field: 'properties.noStartIfOnBatteries' },
    { field: 'properties.stopIfGoingOnBatteries' },
    { field: 'properties.systemRequired' },
    { field: 'properties.maxRunTime' },
    { field: 'properties.idleMinutes' },
    { field: 'properties.deadlineMinutes' }
];
const __export_general = [];
const __export_filters = 'basic';
const __export_dependencies = [
    { field: 'properties.idleMinutes', enabledWhen: [{ source: 'properties.startOnlyIfIdle', equals: true }] },
    { field: 'properties.deadlineMinutes', enabledWhen: [{ source: 'properties.startOnlyIfIdle', equals: true }] }
];
const __export_columns = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.appName', labelKey: 'columnApplication' }
];

export {
    __export_basic as basic,
    __export_general as general,
    __export_filters as filters,
    __export_dependencies as dependencies,
    __export_columns as columns
};
