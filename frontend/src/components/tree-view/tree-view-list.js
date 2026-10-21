import { ElementCreator } from '@gpui/util/element-creator';
import {
    setTreeItemActive,
    setFolderOpenedState,
    renderTreeViewList as createTreeViewList,
    ensureLazyChildren,
    hasVisibleChildren
} from '@gpui/components/TreeView/TreeView';

// Adapter: the tree lives in `components/TreeView/`; callers and tests keep this module id and the `ElementCreator` result.
function renderTreeViewList(data, workspace, treeViewState) {
    return ElementCreator.wrap(createTreeViewList(data, workspace, treeViewState));
}

export { setTreeItemActive, setFolderOpenedState, renderTreeViewList, ensureLazyChildren, hasVisibleChildren };
