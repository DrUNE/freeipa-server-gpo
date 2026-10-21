/** Local, path-independent targeting draft. Persistence belongs to the parent form. */

import { preferenceFieldEdits, clone, preferenceFieldIds, validatePreferenceField, equal } from '@gpui/util/editor-dto';

const MAX_DEPTH = 64;

function copy(value) {
    return clone(value);
}
function pathKey(path) {
    return JSON.stringify(path);
}

function comparePaths(left, right) {
    for (let index = 0; index < Math.min(left.length, right.length); index++) {
        if (left[index] !== right[index]) return left[index] - right[index];
    }
    return left.length - right.length;
}

function validIndex(index, length) {
    return Number.isInteger(index) && index >= 0 && index <= length;
}

function flattenRoots(roots) {
    const result = [];
    function visit(nodes, parentPath) {
        nodes.forEach(function (node, index) {
            const path = parentPath.concat(index);
            result.push({ node: node, path: path, depth: path.length - 1 });
            visit(node.children, path);
        });
    }
    visit(roots, []);
    return result;
}

function locate(roots, id) {
    let result = null;
    function visit(nodes, parent, parentPath) {
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

function subtreeCollectionHeight(node) {
    return (
        (node.supports_children ? 1 : 0) +
        node.children.reduce(function (height, child) {
            return Math.max(height, subtreeCollectionHeight(child));
        }, 0)
    );
}

function collectionDepth(roots, path) {
    let nodes = roots;
    let depth = 0;
    path.forEach(function (index) {
        const node = nodes[index];
        if (node.supports_children) depth++;
        nodes = node.children;
    });
    return depth;
}

function contains(node, id) {
    return (
        node.id === id ||
        node.children.some(function (child) {
            return contains(child, id);
        })
    );
}

function inventory(showResult) {
    const result = new Map();
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

function defaults(showResult, kind) {
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

function Draft(showResult, restored) {
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

Draft.prototype.find = function (id) {
    const found = locate(this.roots, id);
    return found ? found.node : null;
};

Draft.prototype.clone = function () {
    return new Draft(this._showResult, {
        roots: this.roots,
        original: this._original,
        nextId: this._nextId
    });
};

Draft.prototype.flatten = function () {
    return flattenRoots(this.roots);
};

Draft.prototype.add = function (kind, parentId, index) {
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
};

Draft.prototype.remove = function (id) {
    const found = locate(this.roots, id);
    if (!found) return false;
    found.siblings.splice(found.index, 1);
    return true;
};

/** Both identities are stable; index addresses destination siblings after source removal. */
Draft.prototype.move = function (id, parentId, index) {
    const source = locate(this.roots, id);
    const parent = parentId === null || parentId === undefined ? null : locate(this.roots, parentId);
    if (
        !source ||
        (parentId !== null && parentId !== undefined && !parent) ||
        (parent && (!parent.node.supports_children || contains(source.node, parentId)))
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
};

Draft.prototype.updateFields = function (id, fields) {
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
};

/** Replacing a kind is an intentional new node; its former descendants are discarded. */
Draft.prototype.replace = function (id, kind) {
    const source = locate(this.roots, id);
    if (!source || !this._kinds.has(kind)) return null;
    const node = this.add(kind, source.parent ? source.parent.id : null, source.index);
    if (!node) return null;
    this.remove(id);
    return node;
};

Draft.prototype.compile = function (options) {
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
    function rememberParents(nodes, parentId) {
        nodes.forEach(function (node) {
            wantedParents.set(node.id, parentId);
            rememberParents(node.children, node.id);
        });
    }
    rememberParents(this.roots, null);
    const errors = [];
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
    const operations = [];

    function removeAt(found) {
        operations.push({ op: 'remove', path: copy(found.path) });
        found.siblings.splice(found.index, 1);
    }

    function moveAt(found, parentId, index) {
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
    function hasWanted(node) {
        return wanted.has(node.id) || node.children.some(hasWanted);
    }
    function prune(nodes) {
        nodes.slice().forEach(function (node) {
            if (!hasWanted(node)) removeAt(locate(working, node.id));
            else prune(node.children);
        });
    }
    prune(working);

    function detachDepartingDescendants(source) {
        flattenRoots(source.node.children)
            .reverse()
            .forEach(function (entry) {
                if (!wanted.has(entry.node.id)) return;
                const found = locate(working, entry.node.id);
                if (found.parent && wantedParents.get(found.node.id) !== found.parent.id) {
                    moveAt(found, null, working.length);
                }
            });
    }

    function reconcile(nodes, parentId) {
        nodes.forEach(function (node, index) {
            let found = locate(working, node.id);
            const parent = parentId === null ? null : locate(working, parentId);
            const siblings = parent ? parent.node.children : working;
            if (!found) {
                operations.push({
                    op: 'insert',
                    collection_path: parent ? copy(parent.path) : [],
                    index: index,
                    filter_kind: node.kind,
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
                moveAt(found, parentId, index);
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
        if (!original || !node.available) return;
        const fields = preferenceFieldEdits(original.fields, node.fields, true);
        if (fields.length) operations.push({ op: 'edit', path: copy(entry.path), fields: fields });
    });
    return { operations: operations, errors: [] };
};

const create = function (showResult) {
    return new Draft(showResult);
};

export { create, MAX_DEPTH as maxDepth };
