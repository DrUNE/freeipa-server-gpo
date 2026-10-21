/*
 * Data of the policy navigation tree: nodes built from the `gpo_editor_open` answer, with lazy loaders for ADMX
 * categories and the security branch. The server calls come in as `api` (see TreeApi), so nothing here touches
 * RPC or the DOM; the tree component wires the real `util/API` in (components/tree-view/tree-view-list-data).
 */
import { t, getLanguage } from '@gpui/locales/translations';
import { navigationNodes } from '@gpui/core/security/model';
import { navigationNode } from '@gpui/core/advanced-audit/model';
import { preferencesRoot, preference, scripts, preferenceCategory } from '@gpui/core/editor-icons';
import type {
    AllPoliciesNode,
    AuditUnavailableNode,
    ChildInput,
    ChildrenResultInput,
    FolderNode,
    LazyNode,
    OpenResultInput,
    PolicyFolderNode,
    PolicyNode,
    PreferenceCategoryNode,
    PreferenceDocumentInput,
    PreferenceNode,
    ScriptsNode,
    SecurityFolderNode,
    TreeApi,
    TreeNode
} from '@gpui/core/tree/types';

function payloadList<T>(result: unknown, key: string): T[] {
    if (Array.isArray(result)) return result as T[];
    const list = result ? (result as Record<string, unknown>)[key] : undefined;
    return Array.isArray(list) ? (list as T[]) : [];
}

interface PreferenceCategoryGroup {
    id: string;
    label: unknown;
    order: number;
    documents: PreferenceDocumentInput[];
}

function preferenceOrder(value: unknown): number {
    return value === undefined || value === null || value === '' || !Number.isFinite(Number(value))
        ? 999
        : Number(value);
}

function preferenceCategoryTitle(category: PreferenceCategoryGroup): string {
    if (category.id === 'system_settings') return t('preferences.windowsSettings');
    if (category.id === 'control_panel_settings') return t('preferences.controlPanelSettings');
    if (category.id === 'other_settings') return t('preferences.otherSettings');
    return (category.label as string) || category.id;
}

function preferenceNode(document: PreferenceDocumentInput): PreferenceNode {
    return {
        title: document.label || document.kind,
        type: 'file',
        icon: preference(document.kind),
        template: 'preferences',
        scope: document.scope,
        preferenceKind: document.kind,
        document: document,
        readOnly: !document.editable || document.applicable === false
    };
}

function preferenceCategories(scope: string, documents: PreferenceDocumentInput[]): PreferenceCategoryNode[] {
    const categories = new Map<string, PreferenceCategoryGroup>();
    documents
        .filter(function (document) {
            return document.scope === scope;
        })
        .forEach(function (document) {
            const id = document.category_id || 'other_settings';
            let category = categories.get(id);
            if (!category) {
                category = {
                    id: id,
                    label: document.category_label,
                    order: preferenceOrder(document.category_order),
                    documents: []
                };
                categories.set(id, category);
            }
            category.documents.push(document);
        });
    return Array.from(categories.values())
        .sort(function (left, right) {
            return (
                left.order - right.order || preferenceCategoryTitle(left).localeCompare(preferenceCategoryTitle(right))
            );
        })
        .map(function (category) {
            category.documents.sort(function (left, right) {
                const leftOrder = preferenceOrder(left.display_order);
                const rightOrder = preferenceOrder(right.display_order);
                return leftOrder - rightOrder || (left.label || left.kind).localeCompare(right.label || right.kind);
            });
            return {
                title: preferenceCategoryTitle(category),
                type: 'folder',
                opened: false,
                icon: preferenceCategory(category.id),
                scope: scope,
                preferenceCategoryId: category.id,
                children: category.documents.map(preferenceNode)
            };
        });
}

function scriptsNode(scope: string): ScriptsNode {
    const isComputer = scope === 'computer';
    return {
        title: t(isComputer ? 'policies.scriptsComputer' : 'policies.scriptsUser'),
        type: 'file',
        icon: scripts(),
        template: 'scripts',
        scope: scope
    };
}

/** Builds the tree nodes; `api` supplies the server calls the lazy nodes and the root title need. */
function createTreeData(api: TreeApi) {
    function policyChildren(scope: string, result: ChildrenResultInput | object): PolicyNode[] {
        const language = typeof getLanguage === 'function' ? getLanguage() : undefined;
        return payloadList<ChildInput>(result, 'children')
            .map(function (node) {
                return policyNode(scope, node);
            })
            .sort(function (left, right) {
                if (left.type !== right.type) return left.type === 'folder' ? -1 : 1;
                return left.title.localeCompare(right.title, language);
            });
    }

    function policyNode(scope: string, node: ChildInput): PolicyNode {
        if (node.kind === 'category') {
            const folder: PolicyFolderNode = {
                title: node.label || node.id,
                type: 'folder',
                opened: false,
                icon: 'ico-folder',
                scope: scope,
                categoryId: node.id,
                lazy: true,
                help: node.explain_text || undefined,
                children: [],
                loadChildren: function () {
                    return api.children(scope, node.id).then(function (result) {
                        return policyChildren(scope, result);
                    });
                }
            };
            return folder;
        }

        return {
            title: node.label || node.id,
            type: 'file',
            showInTree: false,
            icon: 'ico-file',
            template: 'admx',
            scope: scope,
            policyId: node.id
        };
    }

    function administrativeTemplates(scope: string): LazyNode {
        return {
            title: t('policies.adminTemplates'),
            type: 'folder',
            opened: false,
            icon: 'ico-folder',
            scope: scope,
            lazy: true,
            help: t(scope === 'computer' ? 'policies.machineAdminTemplates' : 'policies.userAdminTemplates'),
            children: [],
            loadChildren: function () {
                return api.children(scope, null).then(function (result) {
                    return policyChildren(scope, result);
                });
            }
        };
    }

    function securityNode(): SecurityFolderNode {
        return {
            title: t('security.title'),
            type: 'folder',
            opened: false,
            icon: 'ico-folder',
            lazy: true,
            children: [],
            loadChildren: function () {
                return Promise.all([
                    api.securityDefinitionsShow(),
                    api.advancedAuditShow().then(
                        function (value) {
                            return { value: value, error: undefined };
                        },
                        function (error: unknown) {
                            return { value: undefined, error: error };
                        }
                    )
                ]).then(function (responses) {
                    const nodes: TreeNode[] = navigationNodes(responses[0]);
                    const audit = responses[1];
                    if (audit.value) nodes.push(navigationNode(audit.value));
                    else {
                        const unavailable: AuditUnavailableNode = {
                            title: t('security.auditUnavailable'),
                            type: 'file',
                            icon: 'ico-file',
                            showInTree: false,
                            template: 'advanced_audit',
                            advancedAuditError: audit.error
                        };
                        nodes.push(unavailable);
                    }
                    return nodes.sort(function (left, right) {
                        return left.title.localeCompare(right.title);
                    });
                });
            }
        };
    }

    function windowsPolicySettingsNode(scope: string): FolderNode {
        const children: TreeNode[] = [scriptsNode(scope)];
        if (scope === 'computer') children.push(securityNode());
        return {
            title: t('policies.windowsSettings'),
            type: 'folder',
            opened: false,
            icon: 'ico-folder',
            scope: scope,
            children: children
        };
    }

    function scopeNode(scope: string, documents: PreferenceDocumentInput[]): FolderNode {
        const isComputer = scope === 'computer';
        const preferenceChildren = preferenceCategories(scope, documents);
        const allPolicies: AllPoliciesNode = {
            title: t('policies.allPolicies'),
            type: 'folder',
            opened: false,
            icon: 'ico-folder',
            template: 'all_policies',
            scope: scope,
            children: [],
            preferenceDocuments: documents.filter(function (document) {
                return document.scope === scope;
            }),
            includePreferences: true,
            help: t('policySearch.description')
        };
        const children: TreeNode[] = [
            allPolicies,
            {
                title: t('policies.title'),
                type: 'folder',
                opened: false,
                icon: 'ico-folder',
                scope: scope,
                children: [windowsPolicySettingsNode(scope), administrativeTemplates(scope)]
            }
        ];
        if (preferenceChildren.length)
            children.push({
                title: t('preferences.title'),
                type: 'folder',
                opened: false,
                icon: preferencesRoot(),
                scope: scope,
                children: preferenceChildren,
                help: t('preferences.description')
            });

        return {
            title: isComputer ? t('policies.machine') : t('policies.user'),
            type: 'folder',
            opened: false,
            icon: isComputer ? 'ico-computer' : 'ico-user',
            help: isComputer ? t('policies.machineLevelPolicies') : t('policies.userLevelPolicies'),
            children: children
        };
    }

    function buildTreeViewList(openResult?: OpenResultInput | null): FolderNode[] {
        const result: OpenResultInput = openResult || {};
        const documents = payloadList<PreferenceDocumentInput>(result, 'preference_documents');
        const gpo = result.gpo || {};
        return [
            {
                title: gpo.displayname || api.getDisplayName() || t('policies.localGroupPolicy'),
                type: 'folder',
                opened: true,
                help: t('policies.localGroupPolicies'),
                children: [scopeNode('computer', documents), scopeNode('user', documents)]
            }
        ];
    }

    return { buildTreeViewList, policyNode, preferenceCategories };
}

export { createTreeData, preferenceCategories };
