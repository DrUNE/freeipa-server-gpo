import type { LayoutColumn, LayoutDependency, LayoutEntry, LayoutFilters } from '@gpui/core/preference-layouts/types';

const basic: LayoutEntry[] = [
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
const general: LayoutEntry[] = [];
const filters: LayoutFilters = 'basic';
const dependencies: LayoutDependency[] = [
    { field: 'properties.idleMinutes', enabledWhen: [{ source: 'properties.startOnlyIfIdle', equals: true }] },
    { field: 'properties.deadlineMinutes', enabledWhen: [{ source: 'properties.startOnlyIfIdle', equals: true }] }
];
const columns: LayoutColumn[] = [
    { source: 'name', labelKey: 'columnName' },
    { source: 'order', labelKey: 'columnOrder' },
    { source: 'field', field: 'properties.action', labelKey: 'columnAction', format: 'action' },
    { source: 'field', field: 'properties.appName', labelKey: 'columnApplication' }
];

export { basic, general, filters, dependencies, columns };
