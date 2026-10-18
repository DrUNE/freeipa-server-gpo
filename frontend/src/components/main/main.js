import * as __dep0 from '../../util/element-creator';
import * as __dep1 from '../tree-view/tree-view';
import * as __dep2 from '../divider/divider';
import * as __dep3 from '../workspace/workspace';


var { createElement } = __dep0;
var { renderTreeView } = __dep1;
var { renderDivider } = __dep2;
var { renderWorkspace } = __dep3;


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
