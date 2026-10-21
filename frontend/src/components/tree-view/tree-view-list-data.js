import { t, getLanguage } from '@gpui/locales/translations';
import * as API from '@gpui/util/API';
import { navigationNodes } from '@gpui/core/security/model';
import { navigationNode } from '@gpui/core/advanced-audit/model';
import { preferencesRoot, preference, scripts, preferenceCategory } from '@gpui/components/editor-icons';

function payloadList(result, key) {
    if (Array.isArray(result)) return result;
    return result && Array.isArray(result[key]) ? result[key] : [];
}

function policyChildren(scope, result) {
    const language = typeof getLanguage === 'function' ? getLanguage() : undefined;
    return payloadList(result, 'children')
        .map(function (node) {
            return policyNode(scope, node);
        })
        .sort(function (left, right) {
            if (left.type !== right.type) return left.type === 'folder' ? -1 : 1;
            return left.title.localeCompare(right.title, language);
        });
}

function policyNode(scope, node) {
    if (node.kind === 'category') {
        return {
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
                return API.children(scope, node.id).then(function (result) {
                    return policyChildren(scope, result);
                });
            }
        };
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

function administrativeTemplates(scope) {
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
            return API.children(scope, null).then(function (result) {
                return policyChildren(scope, result);
            });
        }
    };
}

function preferenceNode(document) {
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

function scriptsNode(scope) {
    const isComputer = scope === 'computer';
    return {
        title: t(isComputer ? 'policies.scriptsComputer' : 'policies.scriptsUser'),
        type: 'file',
        icon: scripts(),
        template: 'scripts',
        scope: scope
    };
}

function windowsPolicySettingsNode(scope) {
    /** @type {any[]} */
    const children = [scriptsNode(scope)];
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

function securityNode() {
    return {
        title: t('security.title'),
        type: 'folder',
        opened: false,
        icon: 'ico-folder',
        lazy: true,
        children: [],
        loadChildren: function () {
            return Promise.all([
                API.securityDefinitionsShow(),
                API.advancedAuditShow().then(
                    function (value) {
                        return { value: value };
                    },
                    function (error) {
                        return { error: error };
                    }
                )
            ]).then(function (/** @type {any[]} */ responses) {
                const nodes = navigationNodes(responses[0]);
                if (responses[1].value) nodes.push(navigationNode(responses[1].value));
                else
                    nodes.push({
                        title: t('security.auditUnavailable'),
                        type: 'file',
                        icon: 'ico-file',
                        showInTree: false,
                        template: 'advanced_audit',
                        advancedAuditError: responses[1].error
                    });
                return nodes.sort(function (left, right) {
                    return left.title.localeCompare(right.title);
                });
            });
        }
    };
}

function preferenceCategoryTitle(category) {
    if (category.id === 'system_settings') return t('preferences.windowsSettings');
    if (category.id === 'control_panel_settings') return t('preferences.controlPanelSettings');
    if (category.id === 'other_settings') return t('preferences.otherSettings');
    return category.label || category.id;
}

function preferenceOrder(value) {
    return value === undefined || value === null || value === '' || !Number.isFinite(Number(value))
        ? 999
        : Number(value);
}

function preferenceCategories(scope, documents) {
    const categories = new Map();
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

function scopeNode(scope, documents) {
    const isComputer = scope === 'computer';
    const preferenceChildren = preferenceCategories(scope, documents);
    /** @type {any[]} */
    const children = [
        {
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
        },
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

function buildTreeViewList(openResult) {
    const result = openResult || {};
    const documents = payloadList(result, 'preference_documents');
    const gpo = result.gpo || {};
    return [
        {
            title: gpo.displayname || API.getDisplayName() || t('policies.localGroupPolicy'),
            type: 'folder',
            opened: true,
            help: t('policies.localGroupPolicies'),
            children: [scopeNode('computer', documents), scopeNode('user', documents)]
        }
    ];
}

function loadTreeViewList() {
    return API.open().then(buildTreeViewList);
}

export { buildTreeViewList, loadTreeViewList, policyNode, preferenceCategories };
