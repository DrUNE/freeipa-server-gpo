// Rows of the Advanced Audit answer. The server sends them as open JSON, so every field but
// `kind` is optional here and the code that reads them stays tolerant.

export interface AuditSetting {
    kind?: string;
    value?: string;
    none?: boolean;
    include_success?: boolean;
    exclude_success?: boolean;
    include_failure?: boolean;
    exclude_failure?: boolean;
}

export interface SubcategoryRow {
    kind: 'subcategory';
    guid: string;
    option?: undefined;
    object_kind?: undefined;
    machine_name?: string;
    display_name?: string;
    target?: { kind?: string; sid?: string };
    setting?: AuditSetting;
    configured?: boolean;
    editable?: boolean;
}

export interface OptionRow {
    kind: 'option';
    option: string;
    guid?: undefined;
    object_kind?: undefined;
    machine_name?: string;
    display_name?: string;
    enabled?: boolean;
    configured?: boolean;
    editable?: boolean;
}

export interface GlobalSaclRow {
    kind: 'global_sacl';
    object_kind: string;
    guid?: undefined;
    option?: undefined;
    sddl?: string;
    semantic_acl_editor?: boolean;
    configured?: boolean;
    editable?: boolean;
}

export interface PreservedRow {
    kind: 'preserved';
    guid?: undefined;
    option?: undefined;
    object_kind?: undefined;
    configured?: boolean;
}

export type AuditRow = SubcategoryRow | OptionRow | GlobalSaclRow | PreservedRow;

export interface SubcategoryCatalogEntry {
    guid: string;
    machine_name?: string;
    display_name?: string;
}

export interface AdvancedAuditState {
    rows?: unknown;
    subcategory_catalog?: SubcategoryCatalogEntry[];
    suggested_machine_name?: string;
}

/** The part of an answer this module reads: `advanced_audit` (or nothing). */
export type AdvancedAuditResponse = { advanced_audit?: AdvancedAuditState | null } | null | undefined;

export interface AuditFamily {
    id: string;
    label: string;
    rows: AuditRow[];
}

export interface UpdateRequest {
    set_subcategories: unknown[];
    clear_subcategories: unknown[];
    set_options: unknown[];
    clear_options: unknown[];
    set_global_sacls: unknown[];
    clear_global_sacls: unknown[];
}
