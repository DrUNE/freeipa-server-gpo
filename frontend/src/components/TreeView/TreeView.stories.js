import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
    ensureLazyChildren,
    hasVisibleChildren,
    renderTreeViewList,
    setFolderOpenedState,
    setTreeItemActive
} from '@gpui/components/TreeView/TreeView';

/** The part of the editor's tree state the tree needs: selection, opening and lazy loading. */
function createState(onSelect) {
    const lists = new Map();
    const state = {
        selectedItem: null,
        pendingNavigation: false,
        setWorkspace() {},
        setTreeData() {},
        registerTreeNode(item, options) {
            if (options.listItemElement) lists.set(item, options.listItemElement);
        },
        toggleFolder(item) {
            if (!hasVisibleChildren(item)) return item.opened;
            const opened = setFolderOpenedState(lists.get(item), item, !item.opened);
            if (opened && item.lazy && !item.loaded) {
                return ensureLazyChildren(item, lists.get(item), state).catch(() => {});
            }
            return opened;
        },
        navigateToNode(item, { treeItemElement }) {
            setTreeItemActive(treeItemElement);
            state.selectedItem = { item };
            onSelect(item);
            return Promise.resolve(true);
        }
    };
    return state;
}

function folder(title, children, extra = {}) {
    return { title, type: 'folder', opened: false, icon: 'ico-folder', children, ...extra };
}
const file = title => ({ title, type: 'file', icon: 'ico-file' });

function data({ failLazy = false } = {}) {
    return [
        folder('Computer configuration', [
            folder('Administrative templates', [file('Windows components'), file('System')]),
            file('Scripts')
        ]),
        folder('User configuration', [file('Desktop')], { opened: true }),
        folder('Remote section', [], {
            lazy: true,
            loadChildren: () =>
                failLazy ? Promise.reject(new Error('offline')) : Promise.resolve([file('Loaded policy')])
        })
    ];
}

function render({ failLazy, onSelect }) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    const pane = document.createElement('div');
    pane.className = 'tree-view';
    pane.style.cssText = 'width: 320px; height: 320px; overflow: auto';
    const tree = renderTreeViewList(data({ failLazy }), {}, createState(onSelect));
    // What the editor does once the tree is shown: the first row is the tab stop.
    setTreeItemActive(tree.querySelector('.tree-item'));
    pane.append(tree);
    host.append(pane);
    return host;
}

export default { title: 'Primitives/TreeView', args: { onSelect: fn() }, render };

export const Default = {
    play: async ({ canvasElement }) => {
        const tree = within(canvasElement).getByRole('tree', { name: 'Policy navigation' });
        const computer = within(tree).getByRole('treeitem', { name: 'Computer configuration' });
        await expect(computer).toHaveAttribute('aria-expanded', 'false');
        await expect(computer).toHaveAttribute('aria-selected', 'true');
        // The opened folder shows its child, the closed one does not.
        await expect(within(tree).getByRole('treeitem', { name: 'Desktop' })).toBeVisible();
        await expect(within(tree).queryByRole('treeitem', { name: 'Scripts', hidden: false })).toBeNull();
        // One tab stop in the whole tree.
        await expect(
            within(tree)
                .getAllByRole('treeitem')
                .filter(row => row.tabIndex === 0)
        ).toHaveLength(1);
    }
};

export const SelectAndExpand = {
    play: async ({ canvasElement, args }) => {
        const tree = within(canvasElement).getByRole('tree');
        const computer = within(tree).getByRole('treeitem', { name: 'Computer configuration' });
        await userEvent.click(computer);
        await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ title: 'Computer configuration' }));
        await expect(computer).toHaveAttribute('aria-selected', 'true');
        // A second click on the selected folder opens it.
        await userEvent.click(computer);
        await expect(computer).toHaveAttribute('aria-expanded', 'true');
        await expect(within(tree).getByRole('treeitem', { name: 'Scripts' })).toBeVisible();
    }
};

export const Keyboard = {
    play: async ({ canvasElement }) => {
        const tree = within(canvasElement).getByRole('tree');
        const item = name => within(tree).getByRole('treeitem', { name });
        const computer = item('Computer configuration');
        computer.focus();
        await userEvent.keyboard('{ArrowRight}');
        await expect(computer).toHaveAttribute('aria-expanded', 'true');
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() => expect(item('Administrative templates')).toHaveFocus());
        await userEvent.keyboard('{ArrowDown}');
        await waitFor(() => expect(item('Scripts')).toHaveFocus());
        await userEvent.keyboard('{ArrowLeft}');
        await waitFor(() => expect(computer).toHaveFocus());
        await userEvent.keyboard('{ArrowLeft}');
        await expect(computer).toHaveAttribute('aria-expanded', 'false');
        await userEvent.keyboard('{End}');
        await waitFor(() => expect(item('Remote section')).toHaveFocus());
        await userEvent.keyboard('{Home}');
        await waitFor(() => expect(computer).toHaveFocus());
    }
};

export const LazyChildren = {
    play: async ({ canvasElement }) => {
        const tree = within(canvasElement).getByRole('tree');
        const remote = within(tree).getByRole('treeitem', { name: 'Remote section' });
        await userEvent.click(remote);
        await userEvent.click(remote);
        await expect(await within(tree).findByRole('treeitem', { name: 'Loaded policy' })).toBeVisible();
        await expect(remote).toHaveAttribute('aria-expanded', 'true');
    }
};

export const LazyChildrenFail = {
    args: { failLazy: true },
    play: async ({ canvasElement }) => {
        const tree = within(canvasElement).getByRole('tree');
        const remote = within(tree).getByRole('treeitem', { name: 'Remote section' });
        await userEvent.click(remote);
        await userEvent.click(remote);
        await expect(await within(tree).findByText('Unable to load the section.')).toBeVisible();
    }
};
