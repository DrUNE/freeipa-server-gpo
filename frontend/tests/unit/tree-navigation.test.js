import assert from 'node:assert/strict';
import { test } from 'vitest';
import { loadModule } from './helpers/load-module.js';
import * as editorIcons from '@gpui/components/editor-icons';
import * as enLocale from '@gpui/locales/en';
import * as ruLocale from '@gpui/locales/ru';

/*
 * Navigation tree built by components/tree-view/tree-view-list-data.js (buildTreeViewList): the
 * Computer/User branches, Policies (Windows Settings, Administrative Templates), Preferences
 * categories, Scripts and Security nodes.
 *
 * treeModule() loads the module with mocks: translations (t returns the key, optional
 * getLanguage), API (display name, children() for ADMX categories, security/audit loaders),
 * security and audit models, and the real editor-icons. preference() makes a preference
 * document DTO; childByTitle/scopeByName/policyBranch/windowsSettings/administrativeTemplates
 * walk the tree by node title and fail with a readable message when a branch is missing.
 */
function locale(language) {
    return language === 'ru' ? ruLocale : enLocale;
}

// Loads the tree module with the dependencies mocked; options override the API, models, and language.
async function treeModule(options = {}) {
    // vitest rejects reads of exports a mock does not define, so "no getter" is an explicit undefined.
    const translations = options.translations || { t: key => key, getLanguage: undefined };
    if (options.language) translations.getLanguage = () => options.language;
    return loadModule('components/tree-view/tree-view-list-data.js', {
        '@gpui/locales/translations': translations,
        '@gpui/util/API': { getDisplayName: () => 'Example GPO', ...options.api },
        '@gpui/components/templates/security/model': options.securityModel || {},
        '@gpui/components/templates/advanced-audit/model': options.auditModel || {},
        '@gpui/components/editor-icons': editorIcons
    });
}

// Builds a preference document DTO as the server returns it (control_panel is read-only).
function preference(scope, kind, categoryId, categoryOrder, displayOrder, label) {
    return {
        scope,
        kind,
        label,
        editable: kind !== 'control_panel',
        category_id: categoryId,
        category_label: categoryId,
        category_order: categoryOrder,
        display_order: displayOrder
    };
}

// Tree-walk helpers: assert that the branch exists so a missing node fails with its name.
function childByTitle(parent, title) {
    const child = (parent.children || []).find(node => node.title === title);
    assert.ok(child, `Missing navigation branch: ${title}`);
    return child;
}

function scopeByName(root, scope) {
    return childByTitle(root, scope === 'computer' ? 'policies.machine' : 'policies.user');
}

function policyBranch(scopeRoot) {
    return childByTitle(scopeRoot, 'policies.title');
}

function windowsSettings(scopeRoot) {
    return childByTitle(policyBranch(scopeRoot), 'policies.windowsSettings');
}

function administrativeTemplates(scopeRoot) {
    return childByTitle(policyBranch(scopeRoot), 'policies.adminTemplates');
}

// Scope and category names in the locale files are the source of tree headings; the Preferences Windows Settings name must equal the Policies one.
test('tree headings keep the requested scope and neutral category names in both languages', async () => {
    for (const [language, expected] of Object.entries({
        en: ['Computer', 'User', 'System Settings', 'Component Settings'],
        ru: ['Компьютер', 'Пользователь', 'Конфигурация системы', 'Параметры компонентов']
    })) {
        const messages = locale(language);
        assert.deepEqual(
            [
                messages.policies.machine,
                messages.policies.user,
                messages.policies.windowsSettings,
                messages.preferences.controlPanelSettings
            ],
            expected
        );
        assert.equal(messages.preferences.windowsSettings, messages.policies.windowsSettings);
    }
});

// Full shape of both scopes: All Policies, Policies (Scripts, Security only for computer), Preferences categories ordered by category_order and kinds by display_order, control panel read-only, unknown categories kept.
test('Policies and Preferences keep their editors under the correct scope and category', async () => {
    const future = preference('computer', 'future_kind', 'future_category', 15, 1, 'Future');
    future.category_label = 'Future settings';
    const tree = (await treeModule()).buildTreeViewList({
        preference_documents: [
            preference('computer', 'registry', 'system_settings', 10, 60, 'Registry'),
            preference('computer', 'control_panel', 'control_panel_settings', 20, 0, 'Control Panel'),
            preference('computer', 'files', 'system_settings', 10, 30, 'Files'),
            future,
            preference('user', 'files', 'system_settings', 10, 30, 'Files')
        ]
    })[0];

    const computer = scopeByName(tree, 'computer');
    const user = scopeByName(tree, 'user');
    assert.deepEqual(
        [...computer.children.map(node => node.title)],
        ['policies.allPolicies', 'policies.title', 'preferences.title']
    );
    assert.deepEqual(
        [...user.children.map(node => node.title)],
        ['policies.allPolicies', 'policies.title', 'preferences.title']
    );
    for (const [scope, branch] of [
        ['computer', computer],
        ['user', user]
    ]) {
        const all = childByTitle(branch, 'policies.allPolicies');
        assert.equal(all.template, 'all_policies');
        assert.equal(all.scope, scope);
        assert.equal(all.type, 'folder');
        assert.deepEqual([...all.children], []);
        assert.equal(all.includePreferences, true);
        assert.ok(all.preferenceDocuments.every(document => document.scope === scope));
    }

    const computerPolicies = policyBranch(computer);
    assert.deepEqual(
        [...computerPolicies.children.map(node => node.title)],
        ['policies.windowsSettings', 'policies.adminTemplates']
    );
    assert.deepEqual(
        [...windowsSettings(computer).children.map(node => node.title)],
        ['policies.scriptsComputer', 'security.title']
    );
    const computerScripts = windowsSettings(computer).children.find(node => node.template === 'scripts');
    assert.equal(computerScripts.type, 'file');
    assert.equal(computerScripts.icon, editorIcons.scripts());
    assert.equal(computerScripts.template, 'scripts');
    assert.equal(computerScripts.scope, 'computer');
    assert.equal(computerScripts.children, undefined);
    assert.deepEqual([...windowsSettings(user).children.map(node => node.title)], ['policies.scriptsUser']);
    const userScripts = windowsSettings(user).children.find(node => node.template === 'scripts');
    assert.equal(userScripts.type, 'file');
    assert.equal(userScripts.icon, editorIcons.scripts());
    assert.equal(userScripts.template, 'scripts');
    assert.equal(userScripts.scope, 'user');
    assert.equal(userScripts.children, undefined);

    const categories = childByTitle(computer, 'preferences.title').children;
    assert.deepEqual(
        [...categories.map(node => node.title)],
        ['preferences.windowsSettings', 'Future settings', 'preferences.controlPanelSettings']
    );
    assert.deepEqual([...categories[0].children.map(node => node.preferenceKind)], ['files', 'registry']);
    assert.equal(categories[0].children[0].template, 'preferences');
    assert.equal(categories[2].children[0].preferenceKind, 'control_panel');
    assert.equal(categories[2].children[0].readOnly, true);
    assert.deepEqual(
        [...childByTitle(user, 'preferences.title').children[0].children.map(node => node.preferenceKind)],
        ['files']
    );
});

// Documents from an older server without category metadata land in an Other category instead of disappearing.
test('legacy preference documents without category metadata stay visible', async () => {
    const root = (await treeModule()).buildTreeViewList({
        preference_documents: [{ scope: 'computer', kind: 'files', label: 'Files', editable: true }]
    })[0];
    const computer = scopeByName(root, 'computer');
    const category = childByTitle(computer, 'preferences.title').children[0];
    assert.equal(category.title, 'preferences.otherSettings');
    assert.equal(category.children[0].preferenceKind, 'files');
});

// Without preference documents the Preferences branch is omitted, so users do not see an empty editor.
test('empty unsupported branches are not presented as available editors', async () => {
    const root = (await treeModule()).buildTreeViewList({})[0];
    assert.deepEqual(
        [...scopeByName(root, 'computer').children.map(node => node.title)],
        ['policies.allPolicies', 'policies.title']
    );
    assert.deepEqual(
        [...scopeByName(root, 'user').children.map(node => node.title)],
        ['policies.allPolicies', 'policies.title']
    );
    assert.equal(
        policyBranch(scopeByName(root, 'computer')).children.some(node => node.title === 'policies.softwareSettings'),
        false
    );
});

// ADMX tree is lazy and loaded from API.children(); both documented response shapes (array or {children}) are accepted at either depth, categories sort before policies in a locale-aware way, and policy nodes are hidden from the tree but kept for the list.
for (const language of ['en', 'ru']) {
    for (const scope of ['computer', 'user']) {
        test(`Administrative Templates retains hidden policies and sorts root and nested lists in ${language} for ${scope}`, async () => {
            const labels =
                language === 'en' ? ['alpha', 'Éclair', 'Zulu', 'Яблоко'] : ['Альфа', 'Ёж', 'Яблоко', 'Apple'];
            function children(parent) {
                return [2, 0, 3, 1].flatMap(index => [
                    { kind: 'policy', id: `${scope}:${parent}:policy-${index}`, label: labels[index] + ' policy' },
                    { kind: 'category', id: `${scope}:${parent}:category-${index}`, label: labels[index] + ' category' }
                ]);
            }
            const rootDtos = children('root');
            const nestedDtos = children('nested');
            const calls = [];
            const tree = await treeModule({
                language,
                api: {
                    children: async (requestedScope, categoryId) => {
                        calls.push([requestedScope, categoryId]);
                        const result = categoryId === null ? rootDtos : nestedDtos;
                        // Both documented response shapes work at either depth.
                        return (scope === 'computer') === (categoryId === null) ? result : { children: result };
                    }
                }
            });
            const scopeRoot = scopeByName(tree.buildTreeViewList({})[0], scope);
            const templates = administrativeTemplates(scopeRoot);
            const rootChildren = await templates.loadChildren();
            const category = rootChildren.find(node => node.categoryId === `${scope}:root:category-0`);
            const nestedChildren = await category.loadChildren();

            assert.deepEqual(calls, [
                [scope, null],
                [scope, category.categoryId]
            ]);
            for (const [parent, dtos, nodes] of [
                ['root', rootDtos, rootChildren],
                ['nested', nestedDtos, nestedChildren]
            ]) {
                assert.equal(nodes.length, dtos.length);
                assert.deepEqual(
                    [...nodes.map(node => node.title)],
                    [...labels.map(label => label + ' category'), ...labels.map(label => label + ' policy')]
                );
                assert.deepEqual(
                    [...nodes.map(node => node.categoryId || node.policyId)].sort(),
                    dtos.map(node => node.id).sort()
                );
                for (const node of nodes) {
                    assert.equal(node.scope, scope);
                    if (node.type === 'folder') {
                        assert.notEqual(node.showInTree, false);
                        assert.equal(node.lazy, true);
                        assert.ok(node.categoryId.startsWith(`${scope}:${parent}:category-`));
                    } else {
                        assert.equal(node.type, 'file');
                        assert.equal(node.template, 'admx');
                        assert.equal(node.icon, 'ico-file');
                        assert.equal(node.showInTree, false);
                        assert.ok(node.policyId.startsWith(`${scope}:${parent}:policy-`));
                    }
                }
            }
            assert.deepEqual(
                rootDtos.map(node => node.id),
                children('root').map(node => node.id)
            );
            assert.deepEqual(
                nestedDtos.map(node => node.id),
                children('nested').map(node => node.id)
            );
        });
    }
}

// Nodes without a label use their id as title, and a translations mock without getLanguage must not break sorting.
test('Administrative Templates falls back to IDs and supports translation mocks without a language getter', async () => {
    const tree = await treeModule({
        api: {
            children: async () => ({
                children: [
                    { kind: 'policy', id: 'Zulu policy' },
                    { kind: 'category', id: 'Zulu category' },
                    { kind: 'policy', id: 'Alpha policy', label: '' },
                    { kind: 'category', id: 'Alpha category', label: '' }
                ]
            })
        }
    });
    const templates = administrativeTemplates(scopeByName(tree.buildTreeViewList({})[0], 'computer'));
    const nodes = await templates.loadChildren();
    assert.deepEqual(
        [...nodes.map(node => node.title)],
        ['Alpha category', 'Zulu category', 'Alpha policy', 'Zulu policy']
    );
    assert.ok(nodes.filter(node => node.type === 'file').every(node => node.showInTree === false));
});

// ADMX sorting and visibility rules must not leak into Preferences, Scripts or Security: those keep their own ordering and stay visible; Security keeps node identity.
test('Administrative Templates ordering and visibility do not change Preferences, Scripts, or Security navigation rules', async () => {
    const securityPolicy = { title: 'Scalar policy', type: 'file', template: 'security', showInTree: false };
    const collection = { title: 'Alpha collection', type: 'file', template: 'security', securityCollection: 'entries' };
    const category = { title: 'Zulu category', type: 'folder', template: 'security', children: [securityPolicy] };
    const tree = (
        await treeModule({
            language: 'ru',
            api: { securityDefinitionsShow: async () => ({}), advancedAuditShow: async () => ({}) },
            securityModel: { navigationNodes: () => [category, collection] },
            auditModel: {
                navigationNode: () => ({ title: 'Middle audit', type: 'folder', template: 'advanced_audit' })
            }
        })
    ).buildTreeViewList({
        preference_documents: [
            preference('computer', 'registry', 'earlier', 1, 20, 'Alpha registry'),
            preference('computer', 'files', 'earlier', 1, 10, 'Zulu files'),
            preference('computer', 'services', 'later', 2, 1, 'Alpha services')
        ].map(document => ({
            ...document,
            category_label: document.category_id === 'earlier' ? 'Zulu settings' : 'Alpha settings'
        }))
    })[0];
    const computer = scopeByName(tree, 'computer');
    const categories = childByTitle(computer, 'preferences.title').children;
    assert.deepEqual([...categories.map(node => node.title)], ['Zulu settings', 'Alpha settings']);
    assert.deepEqual([...categories[0].children.map(node => node.title)], ['Zulu files', 'Alpha registry']);
    assert.ok(categories.flatMap(node => node.children).every(node => node.showInTree !== false));
    for (const scopeRoot of tree.children) {
        const scripts = windowsSettings(scopeRoot).children.find(node => node.template === 'scripts');
        assert.equal(scripts.type, 'file');
        assert.equal(scripts.template, 'scripts');
        assert.notEqual(scripts.showInTree, false);
    }
    const security = childByTitle(windowsSettings(computer), 'security.title');
    const securityNodes = await security.loadChildren();
    assert.deepEqual([...securityNodes.map(node => node.title)], ['Alpha collection', 'Middle audit', 'Zulu category']);
    assert.strictEqual(securityNodes[0], collection);
    assert.notEqual(collection.showInTree, false);
    assert.strictEqual(securityNodes[2].children[0], securityPolicy);
});
