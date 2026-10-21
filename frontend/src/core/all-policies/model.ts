import { getLanguage, t } from '@gpui/locales/translations';
import { collectionElement, buildSecurityModel } from '@gpui/core/security/model';
import * as securityModel from '@gpui/core/security/model';
import { families } from '@gpui/core/advanced-audit/model';
import { scriptEvent, preference } from '@gpui/core/editor-icons';
import type { SecurityResponse, SecurityPolicy, CatalogCategory, CategoryRef } from '@gpui/core/security/types';
import type { AdvancedAuditResponse, AuditRow } from '@gpui/core/advanced-audit/types';
import type {
    PolicyIndexInput,
    PolicyRow,
    PolicyRowKind,
    PolicyRowTarget,
    PolicyScope,
    PreferenceDocumentInput
} from '@gpui/core/all-policies/types';

function text(key: string, fallback: string): string {
    const value = t(key);
    return value && value !== key ? value : fallback;
}

function language(): string {
    return getLanguage();
}

function pathLabels(path: unknown): string[] {
    return Array.isArray(path)
        ? path.map(function (label) {
              return String(label);
          })
        : [];
}

function identity(kind: string, scope: string, parts: unknown[]): string {
    return kind + ':' + JSON.stringify(([scope] as unknown[]).concat(parts));
}

function row(
    kind: PolicyRowKind,
    scope: PolicyScope,
    parts: unknown[],
    title: unknown,
    path: unknown,
    properties?: Partial<PolicyRowTarget>
): PolicyRow {
    let categoryPath = [text(scope === 'computer' ? 'policies.machine' : 'policies.user', scope)];
    if (kind !== 'preferences') categoryPath.push(text('policies.title', 'Policies'));
    if (kind === 'security' || kind === 'advanced_audit')
        categoryPath.push(text('policies.windowsSettings', 'System Settings'));
    categoryPath = categoryPath.concat(pathLabels(path));
    if (kind === 'preferences') categoryPath.push(String(title));
    return {
        id: identity(kind, scope, parts),
        title: String(title),
        path: pathLabels(path),
        target: Object.assign(
            {
                title: String(title),
                type: 'file',
                icon: 'ico-file',
                showInTree: false,
                template: kind,
                scope: scope,
                categoryPath: categoryPath
            },
            properties || {}
        )
    };
}

function admxRows(result: PolicyIndexInput | null | undefined, scope: PolicyScope): PolicyRow[] {
    if (!result || !Array.isArray(result.policies)) {
        throw new TypeError(text('policySearch.invalidIndex', 'Invalid policy index'));
    }
    const policies = result.policies;
    return policies.map(function (policy) {
        return row(
            'admx',
            scope,
            [policy.id],
            policy.label || policy.id,
            [text('policies.adminTemplates', 'Administrative Templates')].concat(pathLabels(policy.path)),
            { policyId: policy.id }
        );
    });
}

function reference(value: CategoryRef | string[] | null | undefined): CategoryRef | null | undefined {
    return Array.isArray(value) ? { namespace: value[0], id: value[1] } : value;
}

function securityRows(input: unknown, scope: PolicyScope): PolicyRow[] {
    if (scope !== 'computer') return [];
    // The answer is open JSON: the shape is checked below, then read as the model's own view of it.
    const response = input as SecurityResponse | null | undefined;
    if (
        !response ||
        !response.security_catalog ||
        !Array.isArray(response.security_catalog.categories) ||
        !Array.isArray(response.security_catalog.policies)
    ) {
        throw new TypeError(text('policySearch.invalidIndex', 'Invalid policy index'));
    }
    const model = buildSecurityModel(response);
    const categories = new Map<string, CatalogCategory>();
    const catalog = (response && response.security_catalog) || {};
    (catalog.categories || []).forEach(function (category) {
        categories.set(securityModel.identity(category.namespace, category.id), category);
    });
    function categoryPath(policy: SecurityPolicy): string[] {
        const path: string[] = [];
        let current = reference(policy.definition.category);
        const visited = new Set<string>();
        while (current) {
            const key = securityModel.identity(current.namespace, current.id);
            if (visited.has(key)) break;
            visited.add(key);
            const category = categories.get(key);
            if (!category) break;
            path.unshift(category.display_name || category.id);
            current = reference(category.parent);
        }
        return [text('security.title', 'Security Settings')].concat(path);
    }
    return Array.from(model.policies.values()).map(function (policy) {
        const collection = collectionElement(policy);
        const properties: Partial<PolicyRowTarget> = {
            securityPolicy: { namespace: policy.namespace, policy_id: policy.policyId },
            openPolicyDialog: !collection
        };
        if (collection) properties.securityCollection = collection.id;
        return row(
            'security',
            scope,
            [policy.namespace, policy.policyId],
            policy.definition.display_name || policy.policyId,
            categoryPath(policy),
            properties
        );
    });
}

function auditIdentity(value: Partial<AuditRow> | null | undefined): string {
    // The row is open JSON: read it through the widest view, every field optional.
    const item: AuditItem = value || {};
    if (item.kind === 'subcategory') {
        const target = item.target || { kind: 'system' };
        return JSON.stringify([
            item.kind,
            String(item.guid || '')
                .replace(/[{}]/g, '')
                .toLowerCase(),
            target.kind,
            target.sid || ''
        ]);
    }
    if (item.kind === 'option') return JSON.stringify([item.kind, item.option]);
    if (item.kind === 'global_sacl') return JSON.stringify([item.kind, item.object_kind]);
    return JSON.stringify([item.kind, item.fields || [], item.raw || '', item.reason || '']);
}

/** An audit row read tolerantly: any of the kinds, every field optional (the server's JSON is not validated). */
type AuditItem = {
    kind?: string;
    guid?: string;
    display_name?: string;
    machine_name?: string;
    option?: string;
    object_kind?: string;
    target?: { kind?: string; sid?: string };
    fields?: unknown;
    raw?: string;
    reason?: string;
    editable?: boolean;
};

function auditTitle(item: AuditRow): string | undefined {
    if (item.kind === 'subcategory') return item.display_name || item.guid;
    if (item.kind === 'option') return item.display_name || item.machine_name || item.option;
    if (item.kind === 'global_sacl')
        return item.object_kind === 'registry'
            ? text('security.advancedAudit.registrySacl', 'Registry global SACL')
            : text('security.advancedAudit.fileSacl', 'File global SACL');
    return text('security.advancedAudit.preserved', 'Preserved source row');
}

function auditRows(input: unknown, scope: PolicyScope): PolicyRow[] {
    if (scope !== 'computer') return [];
    const response = input as AdvancedAuditResponse;
    if (
        !response ||
        !response.advanced_audit ||
        !Array.isArray(response.advanced_audit.rows) ||
        !Array.isArray(response.advanced_audit.subcategory_catalog)
    ) {
        throw new TypeError(text('policySearch.invalidIndex', 'Invalid policy index'));
    }
    const rows: PolicyRow[] = [];
    const duplicates = new Map<string, number>();
    families(response).forEach(function (family) {
        family.rows.forEach(function (item) {
            const key = auditIdentity(item);
            const parts: unknown[] = [family.id, key];
            const occurrenceKey = JSON.stringify(parts);
            const occurrence = duplicates.get(occurrenceKey) || 0;
            duplicates.set(occurrenceKey, occurrence + 1);
            if (occurrence) parts.push(occurrence);
            const path = [
                text('security.title', 'Security Settings'),
                text('security.advancedAudit.title', 'Advanced Audit Policy Configuration'),
                family.label
            ];
            if (item.kind === 'subcategory' && item.target && item.target.kind === 'user') {
                path.push(item.target.sid || item.target.kind);
            }
            rows.push(
                row('advanced_audit', scope, parts, auditTitle(item), path, {
                    advancedAuditFamilyId: family.id,
                    advancedAuditTarget: key,
                    advancedAuditOccurrence: occurrence,
                    openPolicyDialog: true,
                    readOnly: item.kind === 'preserved' || item.editable === false
                })
            );
        });
    });
    return rows;
}

function scriptRows(scope: PolicyScope): PolicyRow[] {
    const events = scope === 'computer' ? ['startup', 'shutdown'] : scope === 'user' ? ['logon', 'logoff'] : [];
    const labels: Record<string, string> = {
        startup: 'startupScripts',
        shutdown: 'shutdownScripts',
        logon: 'logonScript',
        logoff: 'logoffScript'
    };
    return events.map(function (event) {
        return row(
            'scripts',
            scope,
            [event],
            text('systemSettings.' + labels[event], event),
            [
                text('policies.windowsSettings', 'System Settings'),
                text(scope === 'computer' ? 'policies.scriptsComputer' : 'policies.scriptsUser', 'Scripts')
            ],
            { scriptEvent: event, icon: scriptEvent(event), openPolicyDialog: true }
        );
    });
}

function preferenceCategory(document: PreferenceDocumentInput): string {
    const id = document.category_id || 'other_settings';
    if (id === 'system_settings') return text('preferences.windowsSettings', 'System Settings');
    if (id === 'control_panel_settings') return text('preferences.controlPanelSettings', 'Component Settings');
    if (id === 'other_settings') return text('preferences.otherSettings', 'Other settings');
    return (document.category_label as string) || id;
}

function preferenceRows(documents: unknown, scope: PolicyScope): PolicyRow[] {
    return (Array.isArray(documents) ? (documents as PreferenceDocumentInput[]) : [])
        .filter(function (document) {
            return document.scope === scope;
        })
        .map(function (document) {
            return row(
                'preferences',
                scope,
                [document.kind],
                document.label || document.kind,
                [text('preferences.title', 'Preferences'), preferenceCategory(document)],
                {
                    preferenceKind: document.kind,
                    icon: preference(document.kind),
                    document: JSON.parse(JSON.stringify(document)),
                    readOnly: !document.editable || document.applicable === false
                }
            );
        });
}

function normalized(value: unknown): string {
    return String(value === undefined || value === null ? '' : value)
        .normalize('NFC')
        .toLocaleLowerCase(language())
        .replace(/\s+/g, ' ')
        .trim();
}

function matches(item: { title?: unknown; path?: unknown } | null | undefined, query: unknown): boolean {
    const needle = normalized(query);
    if (!needle) return true;
    return (
        normalized([(item && item.title) || ''].concat(pathLabels(item && item.path)).join(' ')).indexOf(needle) !== -1
    );
}

function sortRows(rows: PolicyRow[] | null | undefined): PolicyRow[] {
    const locale = language();
    return (Array.isArray(rows) ? rows : []).slice().sort(function (left, right) {
        return (
            String(left.title).localeCompare(String(right.title), locale) ||
            pathLabels(left.path).join(' / ').localeCompare(pathLabels(right.path).join(' / '), locale) ||
            String(left.id).localeCompare(String(right.id), locale)
        );
    });
}

export { admxRows, securityRows, auditRows, auditIdentity, scriptRows, preferenceRows, matches, sortRows };
