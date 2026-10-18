/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define(['../../util/element-creator', '../tree-view/tree-view', '../divider/divider', '../workspace/workspace'], function (elementCreator, treeView, divider, workspace) { 'use strict';
    var exports = {};

    var { createElement } = elementCreator;
    var { renderTreeView } = treeView;
    var { renderDivider } = divider;
    var { renderWorkspace } = workspace;


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

    exports.renderMain = renderMain;


    return Object.freeze(exports);
});
