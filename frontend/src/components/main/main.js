import { createElement } from '@gpui/util/element-creator';
import { renderTreeView } from '@gpui/components/tree-view/tree-view';
import { renderDivider } from '@gpui/components/divider/divider';
import { renderWorkspace } from '@gpui/components/workspace/workspace';

function renderMain(container, treeViewState) {
    const workspace = renderWorkspace();
    const treeView = renderTreeView(workspace, treeViewState);
    const divider = renderDivider();

    const main = createElement('div', {
        className: 'gp__main',
        children: [treeView, divider, workspace]
    });

    container.appendChild(main.getElement());
    return { main, treeView, divider, workspace };
}

export { renderMain };
