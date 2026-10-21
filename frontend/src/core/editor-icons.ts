/** Semantic, presentation-only icons shared by the tree and editor catalogs. */

const preferenceIcons = Object.freeze({
    applications: 'applications',
    control_panel: 'components',
    data_sources: 'database',
    devices: 'device',
    drives: 'drive',
    environment_variables: 'environment',
    files: 'files',
    folder_options: 'folder-settings',
    folders: 'folder',
    ini_files: 'ini',
    internet_settings: 'browser',
    local_users_and_groups: 'users',
    network_options: 'network',
    network_shares: 'shared-folder',
    power_options: 'power',
    printers: 'printer',
    regional_options: 'globe',
    registry: 'registry',
    scheduled_tasks: 'scheduled-task',
    services: 'services',
    shortcuts: 'shortcut',
    start_menu: 'start-menu'
});
const targetingIcons = Object.freeze({
    battery: 'battery',
    computer: 'computer',
    cpu: 'cpu',
    date: 'calendar',
    disk: 'drive',
    domain: 'domain',
    dun: 'connection',
    file: 'file-match',
    ip_range: 'ip-range',
    language: 'language',
    ldap: 'directory-query',
    mac_range: 'network-card',
    msi: 'package-query',
    org_unit: 'org-unit',
    pcmcia: 'expansion-card',
    portable: 'laptop',
    proc_mode: 'processing',
    ram: 'memory',
    run_once: 'run-once',
    site: 'site',
    terminal: 'terminal',
    time: 'clock',
    user: 'user',
    variable: 'environment',
    os: 'system',
    registry: 'registry',
    wmi: 'system-query',
    group: 'security-group',
    collection: 'collection'
});
const categories = Object.freeze({
    system_settings: 'system-settings',
    control_panel_settings: 'components',
    other_settings: 'other-settings'
});
const scriptEvents = Object.freeze({
    startup: 'script-start',
    shutdown: 'script-stop',
    logon: 'script-logon',
    logoff: 'script-logoff'
});

function icon(name: string): string {
    return 'gpo-icon gpo-icon-' + name;
}
function mapped(table: Readonly<Record<string, string>>, key: unknown, fallback: string): string {
    return icon(Object.prototype.hasOwnProperty.call(table, key as string) ? table[key as string] : fallback);
}

const preferenceKinds: readonly string[] = Object.freeze(Object.keys(preferenceIcons));
const targetingKinds: readonly string[] = Object.freeze(Object.keys(targetingIcons));
const preference = function (kind: unknown): string {
    return mapped(preferenceIcons, kind, 'preferences');
};
const preferenceCategory = function (category: unknown): string {
    return mapped(categories, category, 'other-settings');
};
const preferencesRoot = function (): string {
    return icon('preferences');
};
const targeting = function (kind: unknown): string {
    return mapped(targetingIcons, kind, 'filter-unknown');
};
const scripts = function (): string {
    return icon('script');
};
const scriptEvent = function (event: unknown): string {
    return mapped(scriptEvents, event, 'script');
};
const scriptFile = function (group: unknown): string {
    return icon(group === 'powershell' ? 'powershell' : 'script');
};

export {
    preferenceKinds,
    targetingKinds,
    preference,
    preferenceCategory,
    preferencesRoot,
    targeting,
    scripts,
    scriptEvent,
    scriptFile
};
