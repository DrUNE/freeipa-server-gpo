import { t } from '@gpui/locales/translations';

// Labels and summaries of the Advanced Audit rows, and the empty update request.
function tr(key, fallback) {
    const value = t(key);
    return value && value !== key ? value : fallback;
}

function configured(row) {
    return row.configured !== false && row.kind !== 'preserved';
}

function label(row) {
    if (row.kind === 'subcategory') return row.display_name || row.guid;
    if (row.kind === 'option') return row.display_name || row.machine_name || row.option;
    if (row.kind === 'global_sacl')
        return row.object_kind === 'registry'
            ? tr('security.advancedAudit.registrySacl', 'Registry global SACL')
            : tr('security.advancedAudit.fileSacl', 'File global SACL');
    return tr('security.advancedAudit.preserved', 'Preserved source row');
}

function summary(row) {
    if (!configured(row)) return tr('security.notConfigured', 'Not configured');
    if (row.kind === 'subcategory') {
        const setting = row.setting || {};
        if (setting.kind === 'system') return systemSettingLabel(setting.value);
        const enabled = [];
        if (setting.none) enabled.push(tr('security.advancedAudit.none', 'No auditing'));
        if (setting.include_success) enabled.push(tr('security.advancedAudit.includeSuccess', 'Include success'));
        if (setting.exclude_success) enabled.push(tr('security.advancedAudit.excludeSuccess', 'Exclude success'));
        if (setting.include_failure) enabled.push(tr('security.advancedAudit.includeFailure', 'Include failure'));
        if (setting.exclude_failure) enabled.push(tr('security.advancedAudit.excludeFailure', 'Exclude failure'));
        return enabled.join(', ');
    }
    if (row.kind === 'option')
        return row.enabled ? tr('security.enabled', 'Enabled') : tr('security.disabled', 'Disabled');
    if (row.kind === 'global_sacl')
        return row.sddl
            ? tr('security.permissionsDefined', 'Permissions defined')
            : tr('security.notConfigured', 'Not configured');
    return tr('security.advancedAudit.unknownPreserved', 'Unknown row preserved');
}

function systemSettingLabel(value) {
    const labels = {
        unchanged: tr('security.advancedAudit.unchanged', 'Leave unchanged'),
        success: tr('security.advancedAudit.success', 'Success'),
        failure: tr('security.advancedAudit.failure', 'Failure'),
        success_and_failure: tr('security.advancedAudit.successAndFailure', 'Success and failure'),
        none: tr('security.advancedAudit.none', 'No auditing')
    };
    return labels[value] || String(value || '');
}

function emptyRequest() {
    return {
        set_subcategories: [],
        clear_subcategories: [],
        set_options: [],
        clear_options: [],
        set_global_sacls: [],
        clear_global_sacls: []
    };
}

export { configured, label, summary, systemSettingLabel, emptyRequest, tr };
