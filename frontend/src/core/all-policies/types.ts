// Types of the All Policies list: one searchable row per policy of every kind (ADMX, security, audit, scripts, preferences).

export type PolicyScope = 'computer' | 'user' | string;

export type PolicyRowKind = 'admx' | 'security' | 'advanced_audit' | 'scripts' | 'preferences';

/** What a row carries to open the policy: the common fields plus the properties of its kind. */
export interface PolicyRowTarget {
    title: string;
    type: 'file';
    icon: string;
    showInTree: boolean;
    template: PolicyRowKind;
    scope: PolicyScope;
    categoryPath: string[];
    policyId?: string;
    securityPolicy?: { namespace: string; policy_id: string };
    securityCollection?: string;
    openPolicyDialog?: boolean;
    advancedAuditFamilyId?: string;
    advancedAuditTarget?: string;
    advancedAuditOccurrence?: number;
    readOnly?: boolean;
    scriptEvent?: string;
    preferenceKind?: string;
    // The preference document is copied as is; its shape is the server's (see types/rpc.d.ts, preference_documents).
    document?: any;
}

export interface PolicyRow {
    id: string;
    title: string;
    path: string[];
    target: PolicyRowTarget;
}

/** The part of the ADMX policy index answer the rows are built from. */
export interface PolicyIndexInput {
    policies?: { id: string; label?: string; path?: unknown }[];
}

/** An entry of `preference_documents` of the editor answer, as far as the rows read it. */
export interface PreferenceDocumentInput {
    scope?: string;
    kind: string;
    label?: string;
    editable?: boolean;
    applicable?: boolean;
    category_id?: string;
    category_label?: unknown;
    [key: string]: unknown;
}
