/*
 * Shapes of the navigation tree: what the server answers feed in and the nodes the tree component renders.
 * The nodes are plain data; lazy ones carry a `loadChildren` function that returns their children.
 */
import type { SecurityNavNode, SecurityResponseInput } from '@gpui/core/security/types';
import type { AdvancedAuditResponse } from '@gpui/core/advanced-audit/types';

/** A preference document of the `gpo_editor_open` answer. */
export interface PreferenceDocumentInput {
    scope: string;
    kind: string;
    label?: string | null;
    editable?: boolean;
    applicable?: boolean;
    category_id?: string;
    category_label?: unknown;
    category_order?: unknown;
    display_order?: unknown;
}

/** A child of an ADMX category in the `gpo_editor_children` answer. */
export interface ChildInput {
    kind: string;
    id: string;
    label?: string | null;
    explain_text?: string | null;
}

/** The answer of `gpo_editor_open`, as far as the tree reads it. */
export interface OpenResultInput {
    gpo?: { displayname?: string | null } | null;
    preference_documents?: PreferenceDocumentInput[] | null;
}

/** The answer of `gpo_editor_children`: a bare list or an object with `children`. */
export type ChildrenResultInput = ChildInput[] | { children?: ChildInput[] | null } | null | undefined;

/** The server calls the tree needs; the real implementation is `util/API`, tests pass fakes. */
export interface TreeApi {
    children(scope: string, categoryId: string | null): Promise<ChildrenResultInput | object>;
    securityDefinitionsShow(): Promise<SecurityResponseInput>;
    advancedAuditShow(): Promise<AdvancedAuditResponse>;
    getDisplayName(): string | null | undefined;
}

/** What every node has. */
export interface TreeNodeBase {
    title: string;
    type: 'folder' | 'file';
    icon?: string;
    opened?: boolean;
    showInTree?: boolean;
    help?: string;
    scope?: string;
    template?: string;
}

/** A folder whose children load on first open. */
export interface LazyNode extends TreeNodeBase {
    type: 'folder';
    lazy: true;
    children: TreeNode[];
    loadChildren: () => Promise<TreeNode[]>;
}

/** An ADMX category folder (lazy). */
export interface PolicyFolderNode extends LazyNode {
    categoryId?: string;
}

/** An ADMX policy (not shown in the tree, opened by the list). */
export interface PolicyFileNode extends TreeNodeBase {
    type: 'file';
    template: 'admx';
    policyId: string;
}

export type PolicyNode = PolicyFolderNode | PolicyFileNode;

/** A preference document of one kind. */
export interface PreferenceNode extends TreeNodeBase {
    type: 'file';
    template: 'preferences';
    preferenceKind: string;
    document: PreferenceDocumentInput;
    readOnly: boolean;
}

/** A preference category folder. */
export interface PreferenceCategoryNode extends TreeNodeBase {
    type: 'folder';
    preferenceCategoryId: string;
    children: PreferenceNode[];
}

/** The scripts node of a scope. */
export interface ScriptsNode extends TreeNodeBase {
    type: 'file';
    template: 'scripts';
}

/** The "All policies" search folder of a scope. */
export interface AllPoliciesNode extends TreeNodeBase {
    type: 'folder';
    template: 'all_policies';
    children: TreeNode[];
    preferenceDocuments: PreferenceDocumentInput[];
    includePreferences: boolean;
}

/** The "Security settings" folder: lazy, its children are security categories and the audit node. */
export type SecurityFolderNode = LazyNode;

/** The placeholder shown when advanced audit could not be loaded. */
export interface AuditUnavailableNode extends TreeNodeBase {
    type: 'file';
    template: 'advanced_audit';
    advancedAuditError: unknown;
}

/** A plain folder with ready children (a scope, Windows settings, the root). */
export interface FolderNode extends TreeNodeBase {
    type: 'folder';
    children: TreeNode[];
}

/** Any node of the tree. `SecurityNavNode` covers the nodes the security and audit models build. */
export type TreeNode =
    | FolderNode
    | LazyNode
    | PolicyNode
    | PreferenceNode
    | PreferenceCategoryNode
    | ScriptsNode
    | AllPoliciesNode
    | AuditUnavailableNode
    | SecurityNavNode;
