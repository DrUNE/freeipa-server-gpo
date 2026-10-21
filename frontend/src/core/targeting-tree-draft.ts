/** Local, path-independent targeting draft. Persistence belongs to the parent form. */

import { preferenceFieldEdits, clone, preferenceFieldIds, validatePreferenceField, equal } from '@gpui/core/editor-dto';
import type { FieldDescriptor, FieldEdit, FilterOperation } from '@gpui/core/dto-types';

/** A filter of the form as the server lists it (`filters` of a preference answer). */
interface ServerFilter {
    path?: number[];
    kind?: string | null;
    element_name?: string;
    label?: string;
    detail?: string;
    combine?: string;
    negate?: boolean;
    hidden?: boolean;
    supports_children?: boolean;
    fields?: FieldDescriptor[];
}

interface FilterKind {
    kind: string;
    label?: string;
    element_name?: string;
    supports_children?: boolean;
    fields?: FieldDescriptor[];
}

/** The answer of `gpo_editor_preference_show`, as far as the draft reads it. */
export interface ShowResult {
    filters?: ServerFilter[];
    filter_fields?:
        { path: number[]; fields?: FieldDescriptor[]; available?: boolean }[] | Record<string, FieldDescriptor[]>;
    filter_kinds?: FilterKind[];
    new_filter_fields?: Record<string, FieldDescriptor[]> | { kind: string; fields?: FieldDescriptor[] }[];
}

/** One condition or collection of the draft; `id` is stable while the paths change. */
export interface DraftNode {
    id: string;
    originalPath: number[] | null;
    kind: string | null;
    element_name: string;
    label: string;
    detail: string;
    combine?: string;
    negate?: boolean;
    hidden?: boolean;
    supports_children: boolean;
    available: boolean;
    fields: FieldDescriptor[];
    children: DraftNode[];
}

interface Located {
    node: DraftNode;
    siblings: DraftNode[];
    index: number;
    parent: DraftNode | null;
    path: number[];
}

export interface CompileError {
    id: string;
    fieldId: string | null;
    code: string;
}

interface Restored {
    roots: DraftNode[];
    original: DraftNode[];
    nextId: number;
}

const MAX_DEPTH = 64;

function copy<T>(value: T): T {
    return clone(value);
}
function pathKey(path: number[] | undefined): string {
    return JSON.stringify(path);
}

function comparePaths(left: number[], right: number[]): number {
    for (let index = 0; index < Math.min(left.length, right.length); index++) {
        if (left[index] !== right[index]) return left[index] - right[index];
    }
    return left.length - right.length;
}

function validIndex(index: unknown, length: number): index is number {
    return Number.isInteger(index) && (index as number) >= 0 && (index as number) <= length;
}

function flattenRoots(roots: DraftNode[]): { node: DraftNode; path: number[]; depth: number }[] {
    const result: { node: DraftNode; path: number[]; depth: number }[] = [];
    function visit(nodes: DraftNode[], parentPath: number[]): void {
        nodes.forEach(function (node, index) {
            const path = parentPath.concat(index);
            result.push({ node: node, path: path, depth: path.length - 1 });
            visit(node.children, path);
        });
    }
    visit(roots, []);
    return result;
}

function locate(roots: DraftNode[], id: string): Located | null {
    let result: Located | null = null;
    function visit(nodes: DraftNode[], parent: DraftNode | null, parentPath: number[]): void {
        for (let index = 0; index < nodes.length && !result; index++) {
            const path = parentPath.concat(index);
            const node = nodes[index];
            if (node.id === id) {
                result = {
                    node: node,
                    siblings: nodes,
                    index: index,
                    parent: parent,
                    path: path
                };
            } else {
                visit(node.children, node, path);
            }
        }
    }
    visit(roots, null, []);
    return result;
}

function subtreeCollectionHeight(node: DraftNode): number {
    return (
        (node.supports_children ? 1 : 0) +
        node.children.reduce(function (height, child) {
            return Math.max(height, subtreeCollectionHeight(child));
        }, 0)
    );
}

function collectionDepth(roots: DraftNode[], path: number[]): number {
    let nodes = roots;
    let depth = 0;
    path.forEach(function (index) {
        const node = nodes[index];
        if (node.supports_children) depth++;
        nodes = node.children;
    });
    return depth;
}

function contains(node: DraftNode, id: string): boolean {
    return (
        node.id === id ||
        node.children.some(function (child) {
            return contains(child, id);
        })
    );
}

function inventory(showResult: ShowResult): Map<string, { fields: FieldDescriptor[]; available: boolean }> {
    const result = new Map<string, { fields: FieldDescriptor[]; available: boolean }>();
    const raw = showResult.filter_fields || [];
    if (Array.isArray(raw)) {
        raw.forEach(function (entry) {
            if (entry && Array.isArray(entry.path))
                result.set(pathKey(entry.path), {
                    fields: entry.fields || [],
                    available: entry.available !== false
                });
        });
    } else if (raw && typeof raw === 'object') {
        Object.keys(raw).forEach(function (key) {
            result.set(key, { fields: raw[key] || [], available: true });
        });
    }
    return result;
}

function defaults(showResult: ShowResult, kind: string): FieldDescriptor[] {
    const raw = showResult.new_filter_fields || {};
    if (Array.isArray(raw)) {
        const entry = raw.find(function (candidate) {
            return candidate.kind === kind;
        });
        if (entry) return entry.fields || [];
    } else if (raw[kind]) {
        return raw[kind];
    }
    const descriptor = (showResult.filter_kinds || []).find(function (candidate) {
        return candidate.kind === kind;
    });
    return descriptor ? descriptor.fields || [] : [];
}

class Draft {
    roots: DraftNode[];
    _showResult: ShowResult;
    _kinds: Map<string, FilterKind>;
    _original: DraftNode[];
    _nextId: number;

    constructor(showResult: ShowResult | null | undefined, restored?: Restored) {
        this._showResult = copy(showResult || {});
        this._kinds = new Map(
            (this._showResult.filter_kinds || []).map(function (kind) {
                return [kind.kind, kind];
            })
        );
        if (restored) {
            this.roots = copy(restored.roots);
            this._original = copy(restored.original);
            this._nextId = restored.nextId;
            return;
        }

        this.roots = [];
        this._nextId = 1;
        const fieldsByPath = inventory(this._showResult);
        const nodesByPath = new Map();
        const self = this;
        copy(this._showResult.filters || [])
            .sort(function (left, right) {
                return comparePaths(left.path || [], right.path || []);
            })
            .forEach(function (filter) {
                const path = filter.path;
                if (
                    !Array.isArray(path) ||
                    !path.length ||
                    !path.every(function (index) {
                        return Number.isInteger(index) && index >= 0;
                    }) ||
                    nodesByPath.has(pathKey(path))
                ) {
                    throw new Error('Invalid targeting filter snapshot');
                }
                const descriptor = fieldsByPath.get(pathKey(path)) || {
                    fields: filter.fields || [],
                    available: Boolean(filter.kind)
                };
                const node = {
                    id: 'filter-' + self._nextId++,
                    originalPath: copy(path),
                    kind: filter.kind || null,
                    element_name: filter.element_name || '',
                    label: filter.label || filter.kind || filter.element_name || '',
                    detail: filter.detail || '',
                    combine: filter.combine,
                    negate: filter.negate,
                    hidden: filter.hidden,
                    supports_children: Boolean(filter.supports_children),
                    available: descriptor.available !== false && Boolean(filter.kind),
                    fields: copy(descriptor.fields || []),
                    children: []
                };
                const parent = path.length > 1 ? nodesByPath.get(pathKey(path.slice(0, -1))) : null;
                const siblings = parent ? parent.children : self.roots;
                if ((path.length > 1 && !parent) || path[path.length - 1] !== siblings.length) {
                    throw new Error('Invalid targeting filter snapshot');
                }
                siblings.push(node);
                nodesByPath.set(pathKey(path), node);
            });
        this._original = copy(this.roots);
    }

    find(id: string): DraftNode | null {
        const found = locate(this.roots, id);
        return found ? found.node : null;
    }

    clone(): Draft {
        return new Draft(this._showResult, {
            roots: this.roots,
            original: this._original,
            nextId: this._nextId
        });
    }

    flatten(): { node: DraftNode; path: number[]; depth: number }[] {
        return flattenRoots(this.roots);
    }

    add(kind: string, parentId?: string | null, index?: number | null): DraftNode | null {
        const descriptor = this._kinds.get(kind);
        const parent = parentId === null || parentId === undefined ? null : locate(this.roots, parentId);
        if (
            !descriptor ||
            (parentId !== null && parentId !== undefined && !parent) ||
            (parent && !parent.node.supports_children)
        )
            return null;
        const siblings = parent ? parent.node.children : this.roots;
        const position = index === undefined || index === null ? siblings.length : index;
        if (
            !validIndex(position, siblings.length) ||
            (parent ? collectionDepth(this.roots, parent.path) : 0) + (descriptor.supports_children ? 1 : 0) > MAX_DEPTH
        )
            return null;
        const node = {
            id: 'filter-' + this._nextId++,
            originalPath: null,
            kind: kind,
            element_name: descriptor.element_name || '',
            label: descriptor.label || kind,
            detail: '',
            supports_children: Boolean(descriptor.supports_children),
            available: true,
            fields: copy(defaults(this._showResult, kind)),
            children: []
        };
        siblings.splice(position, 0, node);
        return node;
    }

    remove(id: string): boolean {
        const found = locate(this.roots, id);
        if (!found) return false;
        found.siblings.splice(found.index, 1);
        return true;
    }

    /** Both identities are stable; index addresses destination siblings after source removal. */
    move(id: string, parentId?: string | null, index?: number | null): boolean {
        const source = locate(this.roots, id);
        const parent = parentId === null || parentId === undefined ? null : locate(this.roots, parentId);
        if (
            !source ||
            (parentId !== null && parentId !== undefined && !parent) ||
            (parent && (!parent.node.supports_children || contains(source.node, parentId as string)))
        )
            return false;
        const siblings = parent ? parent.node.children : this.roots;
        const length = siblings.length - (siblings === source.siblings ? 1 : 0);
        const position = index === undefined || index === null ? length : index;
        if (
            !validIndex(position, length) ||
            (parent ? collectionDepth(this.roots, parent.path) : 0) + subtreeCollectionHeight(source.node) > MAX_DEPTH
        )
            return false;
        if (siblings === source.siblings && position === source.index) return false;
        source.siblings.splice(source.index, 1);
        siblings.splice(position, 0, source.node);
        return true;
    }

    updateFields(id: string, fields: FieldEdit[]): boolean {
        const node = this.find(id);
        if (!node || !node.available || !Array.isArray(fields)) return false;
        const values = new Map(
            fields.map(function (field) {
                return [field.id, field.value];
            })
        );
        let changed = false;
        node.fields = node.fields.map(function (field) {
            if (!field.editable || !values.has(field.id) || equal(field.value, values.get(field.id))) return field;
            changed = true;
            return Object.assign({}, field, { value: copy(values.get(field.id)) });
        });
        return changed;
    }

    /** Replacing a kind is an intentional new node; its former descendants are discarded. */
    replace(id: string, kind: string): DraftNode | null {
        const source = locate(this.roots, id);
        if (!source || !this._kinds.has(kind)) return null;
        const node = this.add(kind, source.parent ? source.parent.id : null, source.index);
        if (!node) return null;
        this.remove(id);
        return node;
    }

    compile(options?: {
        validateNode?: (node: DraftNode) => { fieldId: string | null; code: string }[] | null | void;
    }): { operations: FilterOperation[]; errors: CompileError[] } {
        const opts = options || {};
        const desired = this.flatten();
        const desiredById = new Map(
            desired.map(function (entry) {
                return [entry.node.id, entry.node];
            })
        );
        const wanted = new Set(
            desired.map(function (entry) {
                return entry.node.id;
            })
        );
        const wantedParents = new Map();
        function rememberParents(nodes: DraftNode[], parentId: string | null): void {
            nodes.forEach(function (node) {
                wantedParents.set(node.id, parentId);
                rememberParents(node.children, node.id);
            });
        }
        rememberParents(this.roots, null);
        const errors: CompileError[] = [];
        const roots = this.roots;
        desired.forEach(function (entry) {
            const node = entry.node;
            if (collectionDepth(roots, entry.path) > MAX_DEPTH) {
                errors.push({ id: node.id, fieldId: null, code: 'max_depth' });
            }
            if (!node.available) return;
            const duplicates = preferenceFieldIds(node.fields).duplicates;
            duplicates.forEach(function (id) {
                errors.push({ id: node.id, fieldId: id, code: 'duplicate_descriptor' });
            });
            const specificErrors = typeof opts.validateNode === 'function' ? opts.validateNode(node) : null;
            if (Array.isArray(specificErrors)) {
                specificErrors.forEach(function (error) {
                    errors.push({ id: node.id, fieldId: error.fieldId, code: error.code });
                });
                return;
            }
            node.fields.forEach(function (field) {
                if (!field.editable || duplicates.indexOf(field.id) !== -1) return;
                const code = validatePreferenceField(field, field.value);
                if (code) errors.push({ id: node.id, fieldId: field.id, code: code });
            });
        });
        if (errors.length) return { operations: [], errors: errors };

        const working = copy(this._original);
        const originalById = new Map(
            flattenRoots(this._original).map(function (entry) {
                return [entry.node.id, entry.node];
            })
        );
        const operations: FilterOperation[] = [];

        function removeAt(found: Located): void {
            operations.push({ op: 'remove', path: copy(found.path) });
            found.siblings.splice(found.index, 1);
        }

        function moveAt(found: Located, parentId: string | null, index: number): void {
            const parent = parentId === null ? null : locate(working, parentId);
            const destination = parent ? parent.node.children : working;
            operations.push({
                op: 'move',
                source_path: copy(found.path),
                collection_path: parent ? copy(parent.path) : [],
                index: index
            });
            found.siblings.splice(found.index, 1);
            destination.splice(index, 0, found.node);
        }

        // Prune only completely discarded branches. A discarded ancestor may still
        // own a surviving descendant, which must first be moved out losslessly.
        function hasWanted(node: DraftNode): boolean {
            return wanted.has(node.id) || node.children.some(hasWanted);
        }
        function prune(nodes: DraftNode[]): void {
            nodes.slice().forEach(function (node) {
                if (!hasWanted(node)) removeAt(locate(working, node.id) as Located);
                else prune(node.children);
            });
        }
        prune(working);

        function detachDepartingDescendants(source: Located): void {
            flattenRoots(source.node.children)
                .reverse()
                .forEach(function (entry) {
                    if (!wanted.has(entry.node.id)) return;
                    const found = locate(working, entry.node.id) as Located;
                    if (found.parent && wantedParents.get(found.node.id) !== found.parent.id) {
                        moveAt(found, null, working.length);
                    }
                });
        }

        function reconcile(nodes: DraftNode[], parentId: string | null): void {
            nodes.forEach(function (node: DraftNode, index: number) {
                let found = locate(working, node.id);
                const parent = parentId === null ? null : locate(working, parentId);
                const siblings = parent ? parent.node.children : working;
                if (!found) {
                    operations.push({
                        op: 'insert',
                        collection_path: parent ? copy(parent.path) : [],
                        index: index,
                        filter_kind: node.kind as string,
                        fields: preferenceFieldEdits(node.fields, node.fields, false)
                    });
                    const inserted = copy(node);
                    inserted.children = [];
                    siblings.splice(index, 0, inserted);
                } else if (found.siblings !== siblings || found.index !== index) {
                    // A node may temporarily still own descendants whose final
                    // parent is elsewhere. Stage those at root only if carrying
                    // them into a deep destination would exceed native limits.
                    if (
                        (parent ? collectionDepth(working, parent.path) : 0) + subtreeCollectionHeight(found.node) >
                        MAX_DEPTH
                    ) {
                        detachDepartingDescendants(found);
                        found = locate(working, node.id);
                    }
                    moveAt(found as Located, parentId, index);
                }
                reconcile(node.children, node.id);
            });
        }
        reconcile(this.roots, null);
        prune(working);

        // Apply field edits only after every structural edit, at the final paths.
        flattenRoots(working).forEach(function (entry) {
            const original = originalById.get(entry.node.id);
            const node = desiredById.get(entry.node.id);
            if (!original || !node || !node.available) return;
            const fields = preferenceFieldEdits(original.fields, node.fields, true);
            if (fields.length) operations.push({ op: 'edit', path: copy(entry.path), fields: fields });
        });
        return { operations: operations, errors: [] };
    }
}

const create = function (showResult?: ShowResult | null): Draft {
    return new Draft(showResult);
};

export { create, MAX_DEPTH as maxDepth };
export type { Draft };
