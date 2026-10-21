import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createTreeData } from '@gpui/core/tree/tree-data';
import { t } from '@gpui/locales/translations';

/*
 * core/tree/tree-data.ts with fake server calls: no RPC, no DOM, no mocked modules. Checks that the lazy
 * loaders use the injected api, that ADMX children are sorted (folders first) and that a failing
 * advanced-audit call leaves the "unavailable" placeholder instead of failing the security branch.
 */
function fakeApi(overrides = {}) {
    const calls = [];
    const api = {
        calls,
        getDisplayName: () => 'Selected GPO',
        children: async (scope, categoryId) => {
            calls.push(['children', scope, categoryId]);
            return {
                children: [
                    { kind: 'policy', id: 'b', label: 'Beta' },
                    { kind: 'category', id: 'cat', label: 'Zeta' },
                    { kind: 'policy', id: 'a', label: 'Alpha' }
                ]
            };
        },
        securityDefinitionsShow: async () => ({}),
        advancedAuditShow: async () => {
            throw new Error('offline');
        },
        ...overrides
    };
    return api;
}

function find(node, title) {
    const child = (node.children || []).find(item => item.title === title);
    assert.ok(child, `missing ${title}`);
    return child;
}

test('the root takes its title from the open answer, then from the api', () => {
    const { buildTreeViewList } = createTreeData(fakeApi());
    assert.equal(buildTreeViewList({ gpo: { displayname: 'From server' } })[0].title, 'From server');
    assert.equal(buildTreeViewList({})[0].title, 'Selected GPO');
    assert.equal(buildTreeViewList(null)[0].children.length, 2);
});

test('Administrative Templates loads its children through the injected api, folders first', async () => {
    const api = fakeApi();
    const root = createTreeData(api).buildTreeViewList({})[0];
    const computer = root.children[0];
    const templates = find(find(computer, t('policies.title')), t('policies.adminTemplates'));
    assert.equal(templates.lazy, true);
    assert.deepEqual(api.calls, []);
    const children = await templates.loadChildren();
    assert.deepEqual(api.calls, [['children', 'computer', null]]);
    assert.deepEqual(
        children.map(node => [node.type, node.title]),
        [
            ['folder', 'Zeta'],
            ['file', 'Alpha'],
            ['file', 'Beta']
        ]
    );
    await children[0].loadChildren();
    assert.deepEqual(api.calls[1], ['children', 'computer', 'cat']);
});

test('Security loads the security nodes and keeps a placeholder when the audit call fails', async () => {
    const api = fakeApi();
    const computer = createTreeData(api).buildTreeViewList({})[0].children[0];
    const windows = find(find(computer, t('policies.title')), t('policies.windowsSettings'));
    const nodes = await find(windows, t('security.title')).loadChildren();
    const placeholder = nodes.find(node => node.template === 'advanced_audit');
    assert.equal(placeholder.showInTree, false);
    assert.equal(placeholder.advancedAuditError.message, 'offline');
    assert.deepEqual(
        nodes.map(node => node.title),
        [...nodes.map(node => node.title)].sort((a, b) => a.localeCompare(b))
    );
});

test('preference categories keep documents of the scope, ordered by category and display order', () => {
    const { preferenceCategories } = createTreeData(fakeApi());
    const documents = [
        { scope: 'user', kind: 'drive_maps', label: 'Drives', editable: true, category_id: 'x', category_order: 2 },
        { scope: 'user', kind: 'files', label: 'Files', editable: true, category_id: 'y', category_order: 1 },
        {
            scope: 'user',
            kind: 'folders',
            label: 'A',
            editable: false,
            category_id: 'y',
            category_order: 1,
            display_order: 0
        },
        { scope: 'computer', kind: 'ini', label: 'Ini', editable: true, category_id: 'y' }
    ];
    const categories = preferenceCategories('user', documents);
    assert.deepEqual(
        categories.map(category => category.preferenceCategoryId),
        ['y', 'x']
    );
    assert.deepEqual(
        categories[0].children.map(node => [node.preferenceKind, node.readOnly]),
        [
            ['folders', true],
            ['files', false]
        ]
    );
});
