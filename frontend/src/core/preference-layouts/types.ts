// The shape of a preference layout module: which fields the item form shows, which of them are
// enabled depending on others, and which columns the list shows.

/** A form row: a field by path, or a separator line. */
export type LayoutEntry = { field: string; textarea?: boolean } | { line: true };

/** A condition on the value of another field. */
export interface DependencyCondition {
    source: string;
    equals?: unknown;
    notEquals?: unknown;
    in?: unknown[];
    notIn?: unknown[];
    nonEmpty?: boolean;
    suffix?: string;
}

/** A group of conditions of which at least one must hold. */
export interface DependencyAnyOf {
    anyOf: DependencyCondition[];
}

export type EnabledWhen = DependencyCondition | DependencyAnyOf;

export interface LayoutDependency {
    field: string;
    enabledWhen: EnabledWhen[];
}

export type LayoutColumn =
    | { source: 'name' | 'order'; labelKey: string }
    | { source: 'field'; field: string; labelKey: string; format?: 'action' };

/** Which filter set the item form uses. */
export type LayoutFilters = 'general' | 'basic';
