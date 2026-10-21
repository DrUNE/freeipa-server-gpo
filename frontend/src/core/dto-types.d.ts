// Types of the data the server and the forms exchange (see tests/contracts and types/rpc.d.ts). Type-only: nothing of
// this file exists at run time, so modules import it with `import type`.

/** A libadmix discriminated value: `kind` names the type, `value` carries it (see tests/contracts). */
export interface TypedValue {
    kind: string;
    value?: any;
}

/** A form field of a preference item or of a targeting filter, as the server describes it. */
export interface FieldDescriptor {
    id: string;
    label?: string;
    value: TypedValue;
    editable?: boolean;
    required?: boolean;
    control?: string;
    choices?: { key: string; label: string }[];
}

/** The value a user edited, keyed by the field it belongs to. */
export interface FieldEdit {
    id: string;
    value: TypedValue;
}

export interface Collection {
    mode?: string;
    unique_keys?: boolean;
    key_case_sensitive?: boolean;
    key_comparison?: string;
    allow_empty_values?: boolean;
    min_items?: number;
    max_key_length?: number | null;
    max_value_length?: number | null;
    length_unit?: string;
}

export interface PolicyParameter {
    id: string;
    kind?: string;
    value: TypedValue | null;
    default_value?: TypedValue | null;
    editable?: boolean;
    required?: boolean;
    collection?: Collection | null;
    max_length?: number | null;
    choices?: { value: TypedValue }[];
}

export interface StateAction {
    available?: boolean;
    mode?: string | null;
    requires_parameters?: boolean;
}

export interface Policy {
    state: string;
    comment?: { text: string; source?: string; locale?: string } | null;
    capabilities?: Record<string, boolean>;
    state_actions?: Record<string, StateAction | null>;
    parameters?: PolicyParameter[];
}

export interface PolicyDraft {
    state: string;
    comment: string;
    parameters?: { parameter_id: string; value: TypedValue | null }[];
}

export type FilterOperation =
    | { op: 'insert'; collection_path: number[]; index: number; filter_kind: string; fields: FieldEdit[] }
    | { op: 'edit'; path: number[]; fields: FieldEdit[] }
    | { op: 'replace'; path: number[]; filter_kind: string; fields: FieldEdit[] }
    | { op: 'move'; source_path: number[]; collection_path: number[]; index: number }
    | { op: 'remove'; path: number[] };

export interface ParentCandidate {
    identity: unknown[] | null;
}

export interface PreferenceRequestOptions {
    descriptors?: FieldDescriptor[];
    fields?: FieldEdit[];
    validationExemptions?: Set<string> | string[];
    creating?: boolean;
    name?: string | null;
    originalName?: string | null;
    identity?: unknown[];
    parent?: unknown[];
    filters?: FilterOperation[];
}

export interface PreferenceRequest {
    identity?: unknown[];
    fields?: FieldEdit[];
    parent?: unknown[];
    name?: string;
    filters?: FilterOperation[];
}

/** A validation error of a form: a field (`id`) or, for a targeting filter, its position (`path`). */
export interface RequestError {
    id: string;
    code: string;
    path?: number[];
}

/** The update of a policy form: only what changed against the baseline. */
export interface PolicyUpdateRequest {
    state?: string;
    set_parameters?: { parameter_id: string; value: TypedValue }[];
    clear_parameters?: string[];
    comment?:
        | { action: 'clear'; target: 'embedded' | { kind: string; locale?: string | null } }
        | { action: 'set'; target: 'embedded' | { kind: string; locale?: string | null }; text: string };
}
