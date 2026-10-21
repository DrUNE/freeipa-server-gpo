import * as API from '@gpui/util/API';
import { createTreeData } from '@gpui/core/tree/tree-data';

// The tree data is built in core/tree; here the real RPC client is plugged into it.
const { buildTreeViewList, policyNode, preferenceCategories } = createTreeData(API);

function loadTreeViewList() {
    return API.open().then(buildTreeViewList);
}

export { buildTreeViewList, loadTreeViewList, policyNode, preferenceCategories };
