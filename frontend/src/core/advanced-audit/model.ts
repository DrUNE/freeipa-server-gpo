import { t } from '@gpui/locales/translations';
import type {
    AdvancedAuditResponse,
    AdvancedAuditState,
    AuditFamily,
    AuditRow,
    GlobalSaclRow,
    OptionRow,
    PreservedRow,
    SubcategoryRow
} from '@gpui/core/advanced-audit/types';

const OPTION_LABELS: Record<string, string> = {
    crash_on_audit_fail: 'Audit: Shut down system immediately if unable to log security audits',
    full_privilege_auditing: 'Audit: Audit the use of Backup and Restore privilege',
    audit_base_objects: 'Audit: Audit the access of global system objects',
    audit_base_directories: 'Audit: Audit the access of global directory service objects'
};
function tr(key: string, fallback: string): string {
    const value = t('security.advancedAudit.' + key);
    return value && value !== 'security.advancedAudit.' + key ? value : fallback;
}

function state(response: AdvancedAuditResponse): AdvancedAuditState {
    return (response && response.advanced_audit) || { rows: [], subcategory_catalog: [] };
}

// The rows are open server JSON; the kind of each row is checked by the callers' filters.
function configuredRows(response: AdvancedAuditResponse): AuditRow[] {
    const rows = state(response).rows;
    return Array.isArray(rows) ? (rows as AuditRow[]) : [];
}

function normalizedGuid(guid: unknown): string {
    return String(guid || '')
        .replace(/^\{|\}$/g, '')
        .toLowerCase();
}

function localizedSubcategory(row: SubcategoryRow): SubcategoryRow {
    return Object.assign({}, row, {
        display_name: tr('subcategories.' + normalizedGuid(row.guid), row.display_name || row.guid)
    });
}

function subcategories(response: AdvancedAuditResponse): SubcategoryRow[] {
    const rows = configuredRows(response)
        .filter(function (row): row is SubcategoryRow {
            return row.kind === 'subcategory';
        })
        .map(localizedSubcategory);
    const systemGuids = new Set(
        rows
            .filter(function (row) {
                return row.target && row.target.kind === 'system';
            })
            .map(function (row) {
                return normalizedGuid(row.guid);
            })
    );
    (state(response).subcategory_catalog || []).forEach(function (entry) {
        if (systemGuids.has(normalizedGuid(entry.guid))) return;
        rows.push(
            localizedSubcategory({
                kind: 'subcategory',
                guid: entry.guid,
                machine_name: entry.machine_name,
                display_name: entry.display_name,
                target: { kind: 'system' },
                setting: { kind: 'system', value: 'unchanged' },
                configured: false,
                editable: true
            })
        );
    });
    return rows;
}

function options(response: AdvancedAuditResponse): OptionRow[] {
    const rows = configuredRows(response)
        .filter(function (row): row is OptionRow {
            return row.kind === 'option';
        })
        .map(function (row) {
            return Object.assign({}, row, {
                display_name: Object.prototype.hasOwnProperty.call(OPTION_LABELS, row.option)
                    ? tr(row.option, OPTION_LABELS[row.option])
                    : row.display_name || row.machine_name || row.option
            });
        });
    const byOption = new Set(
        rows.map(function (row) {
            return row.option;
        })
    );
    Object.keys(OPTION_LABELS).forEach(function (option) {
        if (!byOption.has(option))
            rows.push({
                kind: 'option',
                option: option,
                machine_name: state(response).suggested_machine_name || '',
                display_name: tr(option, OPTION_LABELS[option]),
                enabled: false,
                configured: false,
                editable: true
            });
    });
    return rows;
}

function globalSacls(response: AdvancedAuditResponse): GlobalSaclRow[] {
    const rows = configuredRows(response).filter(function (row): row is GlobalSaclRow {
        return row.kind === 'global_sacl';
    });
    const kinds = new Set(
        rows.map(function (row) {
            return row.object_kind;
        })
    );
    ['file', 'registry'].forEach(function (kind) {
        if (!kinds.has(kind))
            rows.push({
                kind: 'global_sacl',
                object_kind: kind,
                sddl: '',
                semantic_acl_editor: false,
                configured: false,
                editable: true
            });
    });
    return rows;
}

function preserved(response: AdvancedAuditResponse): PreservedRow[] {
    return configuredRows(response).filter(function (row): row is PreservedRow {
        return row.kind === 'preserved';
    });
}

function families(response: AdvancedAuditResponse): AuditFamily[] {
    return [
        {
            id: 'system_audit_policies',
            label: tr('systemPolicies', 'System Audit Policies'),
            rows: subcategories(response)
        },
        {
            id: 'global_object_access_auditing',
            label: tr('globalAccess', 'Global Object Access Auditing'),
            rows: globalSacls(response)
        },
        {
            id: 'audit_options',
            label: tr('options', 'Audit Options'),
            rows: options(response)
        },
        {
            id: 'preserved_advanced_audit',
            label: tr('preservedSettings', 'Preserved Settings'),
            rows: preserved(response)
        }
    ].filter(function (family) {
        return family.rows.length > 0;
    });
}

function navigationNode(response: AdvancedAuditResponse) {
    return {
        title: tr('title', 'Advanced Audit Policy Configuration'),
        type: 'folder',
        opened: false,
        icon: 'ico-folder',
        children: families(response)
            .map(function (family) {
                return {
                    title: family.label,
                    type: 'file',
                    icon: 'ico-folder',
                    showInTree: true,
                    template: 'advanced_audit',
                    advancedAuditFamilyId: family.id,
                    advancedAuditResponse: response
                };
            })
            .sort(function (a, b) {
                return a.title.localeCompare(b.title);
            })
    };
}

function familyById(response: AdvancedAuditResponse, id: string): AuditFamily | null {
    return (
        families(response).find(function (family) {
            return family.id === id;
        }) || null
    );
}

export { state, families, navigationNode, familyById };
