import type {
    GpoEditorSecurityDefinitionsShowResult,
    GpoEditorSecurityDefinitionsUpdateResult
} from '../../../types/rpc';
// Types of the security (SDMX) catalog and snapshot the editor works with. The generated types/rpc.d.ts describes only
// the fields of the contract sample, so the fuller shape the code reads is written down here.

/** A catalog value with its kind, e.g. `{ kind: 'integer', value: 7 }`. The value depends on the kind. */
export interface SecurityTypedValue {
    kind: string;
    // The payload depends on `kind` (a number, a text, a list of rows, ...); the screens read it by its kind.
    value: any;
}

export interface SecurityRange {
    min: number;
    max: number;
}

export interface SecurityOption {
    id: string;
    [key: string]: unknown;
}

/** An element (value slot) of a policy definition. */
export interface SecurityElement {
    id: string;
    value_type: string;
    required?: boolean;
    initial?: SecurityTypedValue | null;
    ranges?: SecurityRange[];
    input_ranges?: SecurityRange[];
    options?: SecurityOption[];
    unique_by?: string;
    /** The columns of a collection element (field ids, labels, kinds; read by the collection screens). */
    fields?: any[];
    [key: string]: unknown;
}

/** A form control bound to an element; controls nest. */
export interface SecurityControl {
    kind: string;
    element_id: string;
    label?: string;
    read_only?: boolean;
    children?: SecurityControl[];
    [key: string]: unknown;
}

/** A reference to a catalog category: the server sends a `[namespace, id]` pair or an object. */
export interface CategoryRef {
    namespace: string;
    id: string;
}

export interface CatalogCategory {
    namespace: string;
    id: string;
    display_name?: string;
    parent?: CategoryRef | string[] | null;
}

export interface PolicyDefinition {
    namespace: string;
    policy_id: string;
    display_name?: string;
    explain_text?: string;
    category?: CategoryRef | string[];
    elements?: SecurityElement[];
    controls?: SecurityControl[];
    /** Warning texts the screen shows above the policy. */
    notices?: string[];
    [key: string]: unknown;
}

export interface SecurityCatalog {
    semantic_revision?: string;
    categories?: CatalogCategory[];
    policies?: PolicyDefinition[];
}

/** State of one element in a defined policy. */
export interface ElementState {
    state: string;
    value?: SecurityTypedValue;
}

export interface PolicyState {
    namespace: string;
    policy_id: string;
    state: string;
    elements?: Record<string, ElementState>;
}

export interface SecurityDiagnostic {
    policy_id?: string;
    [key: string]: unknown;
}

export interface SecuritySnapshot {
    policies?: PolicyState[];
    diagnostics?: SecurityDiagnostic[];
    preserved?: unknown[];
}

/** The part of a `gpo_editor_security_definitions_*` answer the model reads. */
export interface SecurityResponse {
    security_catalog?: SecurityCatalog;
    security_snapshot?: SecuritySnapshot;
    /** Service names for the service-permission rows (opaque to the model). */
    security_service_catalog?: any[];
    [key: string]: unknown;
}

/**
 * What the entry points accept: the model's own view of an answer, or the generated RPC result, whose lists are `unknown[]`
 * (the server's JSON is validated at run time, not by the generated type).
 */
export type SecurityResponseInput =
    SecurityResponse | GpoEditorSecurityDefinitionsShowResult | GpoEditorSecurityDefinitionsUpdateResult;

export interface SecurityCategory {
    namespace: string;
    id: string;
    label: string;
    parent: CategoryRef | null;
    categories: SecurityCategory[];
    policies: SecurityPolicy[];
}

export interface SecurityPolicy {
    namespace: string;
    policyId: string;
    definition: PolicyDefinition;
    state: PolicyState;
    controls: SecurityControl[];
    diagnostics: SecurityDiagnostic[];
}

export interface SecurityModel {
    response: SecurityResponse;
    catalog: SecurityCatalog;
    snapshot: SecuritySnapshot;
    categories: SecurityCategory[];
    policies: Map<string, SecurityPolicy>;
    preserved: unknown[];
    diagnostics: SecurityDiagnostic[];
}

/** A navigation tree node built from the model. */
export interface SecurityNavNode {
    title: string;
    type: string;
    icon: string;
    template?: string;
    opened?: boolean;
    showInTree?: boolean;
    children?: SecurityNavNode[];
    securityCollection?: string;
    securityCategory?: boolean;
    securityModel?: SecurityModel;
    advancedAuditError?: unknown;
    securityPolicy?: { namespace: string; policy_id: string };
    securityPreserved?: boolean;
    readOnly?: boolean;
    help?: string;
}

/** The draft of one policy in the editor: whether it is defined and the state of each element. */
export interface SecurityDraft {
    defined: boolean;
    elements: Record<string, ElementState>;
}

/** The policies a change to one policy drags along, each with the draft it should get. */
export interface DependencyPlan {
    changes: { policy: SecurityPolicy; draft: SecurityDraft }[];
}
