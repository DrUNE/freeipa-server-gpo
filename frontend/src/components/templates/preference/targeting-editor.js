import { createElement } from '@gpui/util/element-creator';
import { validatePreferenceField, valuePayload, clone } from '@gpui/util/editor-dto';
import { create } from '@gpui/util/targeting-tree-draft';
import { neighbor, bind } from '@gpui/components/list-navigation';
import * as editorIcons from '@gpui/components/editor-icons';
import { supportedKinds, kindLabel } from '@gpui/components/templates/preference/targeting-presentations';
import { initialize, validateFields } from '@gpui/components/templates/preference/targeting-operand-editor';
import * as operandEditor from '@gpui/components/templates/preference/targeting-operand-editor';
import { createTargetingTree } from '@gpui/components/templates/preference/targeting-tree';

function render(options) {
    const pt = options.pt;
    const readonly = Boolean(options.readonly);
    const formState = options.formState;
    const kinds = options.showResult.filter_kinds || [];
    // The editor's mutable state in one object, so that parts of it can live in other modules.
    const ui = {
        accepted: create(options.showResult),
        draft: null,
        selectedId: null,
        selectedControls: [],
        selectedOperands: null,
        combineTouched: false,
        notTouched: false,
        errorIds: new Set(),
        dragId: null,
        dropTarget: null,
        navigation: null
    };
    ui.draft = ui.accepted.clone();
    const language = options.language || 'en';
    const collapsed = new Set();
    const container = createElement('div', { className: 'gpo-editor-filters' });
    const toolbar = createElement('div', { className: 'gpo-editor-filters__toolbar' });
    const notice = createElement('div', {
        className: 'gpo-editor-filters__notice',
        attrs: { role: 'status', 'aria-live': 'polite' }
    });
    const tree = createElement('div', {
        className: 'gpo-editor-filters__tree',
        attrs: { role: 'tree', 'aria-label': pt('targettingTitle') }
    });
    const properties = createElement('div', { className: 'gpo-editor-filters__fields' });
    const menu = createElement('div', {
        className: 'gpo-editor-filters__menu',
        attrs: { role: 'menu', hidden: 'hidden' }
    });
    const collectionKind = kinds.find(function (kind) {
        return kind.supports_children || kind.kind === 'collection';
    });
    const createButton = createElement('button', {
        className: ['button', 'gpo-editor-filter-add'],
        attrs: { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
        text: pt('createTargetingItem') + ' ▾'
    });
    const addCollection = createElement('button', {
        className: 'button',
        attrs: { type: 'button' },
        text: pt('addTargetingCollection')
    });
    const combineSelect = createElement('select', {
        attrs: { 'aria-label': pt('targetingOperator') },
        children: [
            createElement('option', { attrs: { value: 'and' }, text: pt('targetingAnd') }),
            createElement('option', { attrs: { value: 'or' }, text: pt('targetingOr') })
        ]
    });
    const notCheckbox = createElement('input', { attrs: { type: 'checkbox', 'aria-label': pt('targetingNot') } });
    const removeButton = createElement('button', {
        className: ['button', 'gpo-editor-filter-remove'],
        attrs: {
            type: 'button',
            'aria-label': pt('removeFilter'),
            title: pt('removeFilter')
        },
        children: [
            createElement('span', {
                attrs: { 'aria-hidden': 'true' },
                html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg>'
            })
        ]
    });
    const shortcutHelp = createElement('span', {
        className: 'gpo-editor-visually-hidden',
        id: 'gpo-targeting-shortcuts',
        text: pt('targetingKeyboardHelp')
    });
    tree.setAttr('aria-describedby', 'gpo-targeting-shortcuts');

    function blocked() {
        return readonly || formState.busy;
    }
    function locate(id, nodes, parent) {
        const list = nodes || ui.draft.roots;
        for (let i = 0; i < list.length; i += 1) {
            if (list[i].id === id) return { node: list[i], parent: parent || null, siblings: list, index: i };
            const child = locate(id, list[i].children, list[i]);
            if (child) return child;
        }
        return null;
    }
    function descendant(node, id) {
        return (
            node.id === id ||
            node.children.some(function (child) {
                return descendant(child, id);
            })
        );
    }
    function capture() {
        const location = locate(ui.selectedId);
        const node = location && location.node;
        if (!node || !node.available) return;
        const operands = new Map(
            (ui.selectedOperands ? ui.selectedOperands.readFields() : []).map(function (field) {
                return [field.id, field];
            })
        );
        const common = ['filter.bool', 'filter.not', 'filter.combine', 'filter.negate', 'filter.hidden'];
        ui.draft.updateFields(
            node.id,
            node.fields.map(function (current) {
                const field =
                    common.indexOf(current.id) === -1 && operands.has(current.id) ? operands.get(current.id) : current;
                const value = clone(field.value);
                if (
                    ui.combineTouched &&
                    location.index > 0 &&
                    (field.id === 'filter.bool' || field.id === 'filter.combine') &&
                    field.editable !== false
                )
                    value.value = combineSelect.getElement().value;
                if (
                    ui.notTouched &&
                    (field.id === 'filter.not' || field.id === 'filter.negate') &&
                    field.editable !== false
                )
                    value.value = notCheckbox.getElement().checked;
                return Object.assign({}, field, { value: value });
            })
        );
    }
    function setNotice(message) {
        notice.setText(message || '');
    }
    function hideMenu() {
        menu.getElement().hidden = true;
        createButton.setAttr('aria-expanded', 'false');
    }
    function syncToolbar() {
        createButton.getElement().disabled = blocked() || !kinds.length;
        addCollection.getElement().disabled = blocked() || !collectionKind;
        removeButton.getElement().disabled = blocked() || !ui.selectedId;
        const location = locate(ui.selectedId);
        const node = location && location.node;
        const combine =
            node &&
            node.fields.find(function (field) {
                return field.id === 'filter.bool' || field.id === 'filter.combine';
            });
        const negate =
            node &&
            node.fields.find(function (field) {
                return field.id === 'filter.not' || field.id === 'filter.negate';
            });
        combineSelect.getElement().disabled =
            blocked() || !node || location.index === 0 || !node.available || !combine || combine.editable === false;
        notCheckbox.getElement().disabled =
            blocked() || !node || !node.available || !negate || negate.editable === false;
        combineSelect.getElement().value = combine ? valuePayload(combine.value) : 'and';
        notCheckbox.getElement().checked = Boolean(negate && valuePayload(negate.value));
        ui.combineTouched = false;
        ui.notTouched = false;
    }
    function focusNode(id) {
        const row = /** @type {HTMLElement[]} */ (
            Array.from(tree.getElement().querySelectorAll('[data-targeting-id]'))
        ).find(function (element) {
            return element.getAttribute('data-targeting-id') === id;
        });
        if (row) {
            row.focus({ preventScroll: true });
            row.scrollIntoView({ block: 'nearest' });
        }
    }
    function select(id, focus) {
        capture();
        ui.selectedId = id;
        let current = locate(id);
        while (current && current.parent) {
            collapsed.delete(current.parent.id);
            current = locate(current.parent.id);
        }
        renderTree();
        renderFields();
        syncToolbar();
        if (focus) focusNode(id);
    }
    function focusOperands(id) {
        if (blocked()) return;
        if (ui.selectedId !== id) select(id);
        const control = properties
            .getElement()
            .querySelector(
                'input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),[contenteditable="true"]'
            );
        if (control) control.focus({ preventScroll: true });
        else {
            properties.setAttr('tabindex', '-1');
            properties.getElement().focus({ preventScroll: true });
        }
    }
    function fieldPayload(node, id) {
        const field = node.fields.find(function (candidate) {
            return candidate.id === id;
        });
        return field ? valuePayload(field.value) : null;
    }
    const { renderTree } = createTargetingTree({
        applyMove,
        blocked,
        capture,
        clearDrop,
        collapsed,
        container,
        descendant,
        destination,
        endDrag,
        fieldPayload,
        focusNode,
        focusOperands,
        formState,
        language,
        locate,
        nodeLabel,
        pt,
        renderFields,
        select,
        setNotice,
        syncToolbar,
        tree,
        ui
    });
    function clearDrop() {
        tree.getElement()
            .querySelectorAll(
                '.targeting-drop-before, .targeting-drop-after, .targeting-drop-inside, .targeting-drop-invalid'
            )
            .forEach(function (row) {
                row.classList.remove(
                    'targeting-drop-before',
                    'targeting-drop-after',
                    'targeting-drop-inside',
                    'targeting-drop-invalid'
                );
            });
        ui.dropTarget = null;
    }
    function endDrag() {
        clearDrop();
        ui.dragId = null;
        container.removeClass('is-dragging');
    }
    function destination(node, event, row) {
        const box = row.getBoundingClientRect();
        const offset = (event.clientY - box.top) / Math.max(1, box.height);
        const where =
            node.supports_children && offset > 0.25 && offset < 0.75 ? 'inside' : offset > 0.5 ? 'after' : 'before';
        const location = locate(node.id);
        const parent = where === 'inside' ? node : location.parent;
        let index = where === 'inside' ? node.children.length : location.index + (where === 'after' ? 1 : 0);
        const source = locate(ui.dragId);
        if (source && source.parent === parent && source.index < index) index -= 1;
        return {
            parentId: parent && parent.id,
            index: index,
            where: where,
            valid: Boolean(source && node.id !== ui.dragId && (!parent || !descendant(source.node, parent.id)))
        };
    }
    function applyMove(parentId, index) {
        if (blocked() || !ui.selectedId) return;
        capture();
        try {
            const source = locate(ui.selectedId);
            const noop =
                source &&
                ((source.parent && source.parent.id) || null) === (parentId || null) &&
                source.index === index;
            const changed = ui.draft.move(ui.selectedId, parentId, index);
            if (parentId) collapsed.delete(parentId);
            setNotice(changed ? pt('targetingMoved') : noop ? '' : pt('targetingDepthLimit'));
            renderTree();
            syncToolbar();
            focusNode(ui.selectedId);
        } catch (_) {
            setNotice(pt('invalidTargetingMove'));
        }
    }
    function renderFields() {
        properties.getElement().innerHTML = '';
        ui.selectedControls = [];
        ui.selectedOperands = null;
        const node = ui.draft.find(ui.selectedId);
        container.setAttr('data-selected-kind', (node && node.kind) || '');
        if (!node) {
            properties.append(
                createElement('div', { className: 'gpo-editor-filters__empty', text: pt('selectFilter') })
            );
            return;
        }
        properties.append(createElement('h3', { text: nodeLabel(node) }));
        if (!node.available) {
            properties.append(
                createElement('div', { className: 'gpo-editor-preference-notice', text: pt('unsupportedFilterFields') })
            );
            return;
        }
        ui.selectedOperands = operandEditor.render({
            node: node,
            blocked: blocked(),
            scope: options.scope,
            language: language,
            fieldControl: options.fieldControl,
            pt: pt,
            onChange: function () {
                capture();
                ui.errorIds.clear();
                setNotice('');
                renderTree();
            }
        });
        ui.selectedControls = ui.selectedOperands.controls;
        properties.append(ui.selectedOperands.element);
    }
    function nodeLabel(node) {
        if (node.supports_children)
            return fieldPayload(node, 'filter.name') || node.label || kindLabel(node.kind, node.kind, language);
        return kindLabel(node.kind, node.label || node.kind || pt('unsupportedFilterFields'), language);
    }
    function add(kind) {
        if (blocked()) return;
        capture();
        hideMenu();
        const location = locate(ui.selectedId);
        const parentId =
            location && location.node.supports_children
                ? location.node.id
                : location && location.parent
                  ? location.parent.id
                  : null;
        const index =
            location && location.node.supports_children
                ? location.node.children.length
                : location
                  ? location.index + 1
                  : ui.draft.roots.length;
        const node = ui.draft.add(kind, parentId, index);
        if (!node) {
            setNotice(pt('targetingDepthLimit'));
            return;
        }
        ui.draft.updateFields(node.id, initialize(node, { language: language, scope: options.scope }));
        if (parentId) collapsed.delete(parentId);
        ui.selectedId = node.id;
        setNotice('');
        renderTree();
        renderFields();
        syncToolbar();
        focusNode(ui.selectedId);
    }
    function remove() {
        if (blocked() || !ui.selectedId) return;
        capture();
        const location = locate(ui.selectedId);
        if (!location) return;
        const removedId = ui.selectedId;
        const siblings = location.siblings.map(function (node) {
            return node.id;
        });
        if (!ui.draft.remove(removedId)) return;
        ui.selectedId =
            neighbor(
                siblings,
                [removedId],
                location.siblings.map(function (node) {
                    return node.id;
                })
            ) || (location.parent ? location.parent.id : null);
        setNotice('');
        renderTree();
        renderFields();
        syncToolbar();
        if (ui.selectedId) focusNode(ui.selectedId);
        else tree.getElement().focus({ preventScroll: true });
    }
    kinds
        .filter(function (kind) {
            return !kind.supports_children && kind.kind !== 'collection';
        })
        .forEach(function (kind) {
            if (options.scope === 'computer' && ['dun', 'terminal', 'user'].indexOf(kind.kind) !== -1) return;
            menu.append(
                createElement('button', {
                    attrs: { type: 'button', role: 'menuitem', 'data-kind': kind.kind },
                    children: [
                        createElement('span', {
                            className: ['gpo-editor-filter-icon', editorIcons.targeting(kind.kind)],
                            attrs: { 'aria-hidden': 'true' }
                        }),
                        createElement('span', { text: kindLabel(kind.kind, kind.label || kind.kind, language) })
                    ],
                    events: {
                        click: function () {
                            add(kind.kind);
                        }
                    }
                })
            );
        });
    createButton.on('click', function () {
        if (blocked()) return;
        menu.getElement().hidden = !menu.getElement().hidden;
        createButton.setAttr('aria-expanded', String(!menu.getElement().hidden));
        if (!menu.getElement().hidden && menu.getElement().firstElementChild)
            /** @type {HTMLElement} */ (menu.getElement().firstElementChild).focus();
    });
    menu.on('keydown', function (event) {
        const entries = Array.from(menu.getElement().querySelectorAll('button'));
        const index = entries.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
        if (event.key === 'Escape') {
            event.preventDefault();
            hideMenu();
            createButton.getElement().focus();
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            entries[(index + (event.key === 'ArrowDown' ? 1 : entries.length - 1)) % entries.length].focus();
        }
    });
    addCollection.on('click', function () {
        if (collectionKind) add(collectionKind.kind);
    });
    removeButton.on('click', remove);
    combineSelect.on('change', function () {
        if (combineSelect.getElement().disabled) return;
        ui.combineTouched = true;
        capture();
        renderTree();
    });
    notCheckbox.on('change', function () {
        ui.notTouched = true;
        capture();
        renderTree();
    });
    tree.on('click', function (event) {
        if (event.target === tree.getElement()) select(null);
    });
    tree.on('keydown', function (event) {
        if (
            event.defaultPrevented ||
            formState.busy ||
            event.altKey ||
            event.metaKey ||
            event.target.closest('input,select,textarea,a,summary,[contenteditable]:not([contenteditable="false"])')
        )
            return;
        const row = event.target.closest('[data-targeting-id]');
        if (!row) return;
        const id = row.getAttribute('data-targeting-id');
        const location = locate(id);
        if (!location) return;
        if (event.ctrlKey && !blocked() && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
            select(id, true);
            applyMove(
                location.parent && location.parent.id,
                Math.max(0, Math.min(location.siblings.length - 1, location.index + (event.key === 'ArrowUp' ? -1 : 1)))
            );
            return;
        }
        if (event.ctrlKey && !blocked() && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            select(id, true);
            if (event.key === 'ArrowLeft' && location.parent) {
                const parentLocation = locate(location.parent.id);
                applyMove(parentLocation.parent && parentLocation.parent.id, parentLocation.index + 1);
            } else if (
                event.key === 'ArrowRight' &&
                location.index > 0 &&
                location.siblings[location.index - 1].supports_children
            ) {
                const previous = location.siblings[location.index - 1];
                applyMove(previous.id, previous.children.length);
            } else setNotice(pt('targetingKeyboardMoveUnavailable'));
            return;
        }
        if (event.ctrlKey || event.shiftKey || event.target.closest('button')) return;
        if (event.key === 'ArrowRight' && location.node.supports_children) {
            event.preventDefault();
            if (collapsed.has(id)) {
                collapsed.delete(id);
                renderTree();
                focusNode(id);
            } else if (location.node.children.length) select(location.node.children[0].id, true);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (location.node.supports_children && !collapsed.has(id)) {
                collapsed.add(id);
                renderTree();
                focusNode(id);
            } else if (location.parent) select(location.parent.id, true);
        }
    });
    ui.navigation = bind(tree.getElement(), {
        rows: function () {
            return tree.getElement().querySelectorAll('[data-targeting-id]');
        },
        selected: function () {
            return (
                Array.from(tree.getElement().querySelectorAll('[data-targeting-id]')).find(function (row) {
                    return row.getAttribute('data-targeting-id') === ui.selectedId;
                }) || null
            );
        },
        select: function (row) {
            select(row.getAttribute('data-targeting-id'));
        },
        activate: function (row) {
            focusOperands(row.getAttribute('data-targeting-id'));
        },
        remove: remove,
        canActivate: function (row) {
            const node = ui.draft.find(row.getAttribute('data-targeting-id'));
            return !readonly && Boolean(node && node.available);
        },
        canRemove: function () {
            return !readonly;
        },
        busy: function () {
            return Boolean(formState.busy || ui.dragId);
        }
    });
    container.cleanup = function () {
        endDrag();
        ui.navigation.cleanup();
    };
    container.on('keydown', function (event) {
        if (event.key === 'Escape' && (ui.dragId || !menu.getElement().hidden)) {
            event.preventDefault();
            event.stopPropagation();
            endDrag();
            hideMenu();
        }
    });
    container.on('input', function () {
        ui.errorIds.clear();
        setNotice('');
    });
    container.on('click', function (event) {
        if (!event.target.closest('.gpo-editor-filters__create')) hideMenu();
    });
    toolbar.append(createElement('div', { className: 'gpo-editor-filters__create', children: [createButton, menu] }));
    toolbar.append(addCollection);
    toolbar.append(
        createElement('label', {
            className: 'gpo-editor-filter-operator',
            attrs: { 'data-field-id': 'filter.bool' },
            children: [combineSelect]
        })
    );
    toolbar.append(
        createElement('label', {
            className: 'gpo-editor-filter-negation',
            attrs: { 'data-field-id': 'filter.not' },
            children: [notCheckbox, createElement('span', { text: pt('targetingNot') })]
        })
    );
    toolbar.append(removeButton);
    container.append(toolbar);
    container.append(shortcutHelp);
    container.append(notice);
    container.append(createElement('div', { className: 'gpo-editor-filters__layout', children: [tree, properties] }));
    formState.beginFilterDraft = function () {
        ui.draft = ui.accepted.clone();
        ui.selectedId = null;
        ui.selectedControls = [];
        ui.selectedOperands = null;
        ui.errorIds.clear();
        setNotice('');
        hideMenu();
        renderTree();
        renderFields();
        syncToolbar();
    };
    formState.cancelFilterDraft = function () {
        formState.beginFilterDraft();
    };
    formState.acceptFilterDraft = function () {
        capture();
        const result = validatedResult(ui.draft);
        ui.errorIds = new Set(
            result.errors.map(function (error) {
                return error.id;
            })
        );
        if (result.errors.length) {
            select(result.errors[0].id);
            setNotice(pt('validationFixErrors'));
            result.errors
                .filter(function (error) {
                    return error.id === ui.selectedId;
                })
                .forEach(function (error) {
                    ui.selectedControls
                        .filter(function (control) {
                            return control.id === error.fieldId;
                        })
                        .forEach(function (control) {
                            control.setError(options.validationMessage(error.code));
                        });
                });
            const first = ui.selectedControls.find(function (control) {
                return control.id === result.errors[0].fieldId;
            });
            if (first) first.focus();
            return false;
        }
        ui.accepted = ui.draft.clone();
        if (result.operations.length) formState.dirty = true;
        return true;
    };
    formState.readFilterResult = function () {
        const result = validatedResult(ui.accepted);
        return {
            operations: result.operations,
            errors: result.errors.map(function (error) {
                return {
                    path: ui.accepted.flatten().find(function (entry) {
                        return entry.node.id === error.id;
                    }).path,
                    id: error.fieldId,
                    code: error.code
                };
            })
        };
    };
    function validatedResult(model) {
        return model.compile({
            validateNode: function (node) {
                if (supportedKinds.indexOf(node.kind) === -1) return null;
                const errors = [];
                node.fields.forEach(function (field) {
                    if (
                        field.editable === false ||
                        ['filter.bool', 'filter.not', 'filter.combine', 'filter.negate', 'filter.hidden'].indexOf(
                            field.id
                        ) === -1
                    )
                        return;
                    const code = validatePreferenceField(field, field.value);
                    if (code) errors.push({ fieldId: field.id, code: code });
                });
                return errors.concat(validateFields(node));
            }
        });
    }
    renderTree();
    renderFields();
    syncToolbar();
    return container;
}

export { render };
