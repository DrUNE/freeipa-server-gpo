import { createElement } from '@gpui/util/element-creator';
import { valuePayload } from '@gpui/util/editor-dto';
import * as editorIcons from '@gpui/components/editor-icons';
import * as presentations from '@gpui/components/templates/preference/targeting-presentations';

/**
 * The condition tree of the targeting editor: the rows, drag and drop and keyboard reordering.
 * @param {any} context the editor's state and operations
 */
function createTargetingTree({
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
}) {
    function summary(node) {
        if (node.kind === 'ip_range' && fieldPayload(node, 'filter.useIPv6') === true) {
            const address = fieldPayload(node, 'filter.min'),
                prefix = fieldPayload(node, 'filter.max');
            return address
                ? address + (prefix === null || prefix === undefined || prefix === '' ? '' : '/' + prefix)
                : '';
        }
        const common = [
            'filter.bool',
            'filter.not',
            'filter.combine',
            'filter.negate',
            'filter.hidden',
            'filter.displayName',
            'filter.useIPv6'
        ];
        const values = node.fields
            .filter(function (field) {
                return common.indexOf(field.id) === -1 && field.editable;
            })
            .map(function (field) {
                const value = valuePayload(field.value);
                const choices = presentations.choices(node.kind, field.id, language) || field.choices || [];
                const choice = choices.find(function (candidate) {
                    return candidate.key === value;
                });
                if (field.id === 'filter.languageLocale')
                    return fieldPayload(node, 'filter.displayName') || (choice && choice.label) || value;
                return choice ? choice.label : value;
            })
            .filter(function (value) {
                return value !== null && value !== undefined && value !== '' && typeof value !== 'boolean';
            });
        return values.length
            ? values
                  .map(function (value) {
                      return Array.isArray(value) ? value.join(', ') : String(value);
                  })
                  .join(' · ')
            : node.detail || '';
    }

    function renderTree() {
        tree.getElement().innerHTML = '';
        let first = true;
        function append(nodes, depth) {
            nodes.forEach(function (node, index) {
                const combine = String(
                    fieldPayload(node, 'filter.bool') || fieldPayload(node, 'filter.combine') || node.combine || 'and'
                ).toLowerCase();
                let logic = index === 0 ? '' : pt(combine === 'or' ? 'targetingOr' : 'targetingAnd') + ' ';
                let negate = fieldPayload(node, 'filter.not');
                if (negate === null || negate === undefined) negate = fieldPayload(node, 'filter.negate');
                if (negate === null || negate === undefined) negate = node.negate;
                if (negate) logic += pt('targetingNot') + ' ';
                const row = createElement('div', {
                    className: [
                        'gpo-editor-filter-node',
                        node.id === ui.selectedId ? 'active' : null,
                        fieldPayload(node, 'filter.hidden') ? 'is-hidden-filter' : null,
                        ui.errorIds.has(node.id) ? 'gpo-editor-filter-node--error' : null
                    ],
                    attrs: {
                        role: 'treeitem',
                        'data-targeting-id': node.id,
                        'aria-level': depth + 1,
                        'aria-selected': String(node.id === ui.selectedId),
                        'aria-expanded': node.supports_children ? String(!collapsed.has(node.id)) : null,
                        tabindex: node.id === ui.selectedId || (!ui.selectedId && first) ? '0' : '-1'
                    },
                    style: { paddingLeft: depth * 18 + 4 + 'px' }
                });
                first = false;
                const handle = createElement('button', {
                    className: 'gpo-editor-filter-handle',
                    attrs: {
                        type: 'button',
                        draggable: blocked() ? 'false' : 'true',
                        disabled: blocked() ? 'disabled' : null,
                        tabindex: '-1',
                        'aria-label': pt('dragTargetingItem'),
                        title: pt('dragTargetingItem')
                    },
                    html: '<svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="6" cy="3" r="1"/><circle cx="6" cy="8" r="1"/><circle cx="6" cy="13" r="1"/></svg>'
                });
                handle.on('click', function (event) {
                    event.stopPropagation();
                    select(node.id, true);
                });
                handle.on('dragstart', function (event) {
                    if (blocked()) {
                        event.preventDefault();
                        return;
                    }
                    capture();
                    ui.selectedId = node.id;
                    ui.dragId = node.id;
                    ui.dropTarget = null;
                    renderFields();
                    syncToolbar();
                    tree.getElement()
                        .querySelectorAll('[data-targeting-id]')
                        .forEach(function (element) {
                            const selected = element.getAttribute('data-targeting-id') === node.id;
                            element.classList.toggle('active', selected);
                            element.setAttribute('aria-selected', String(selected));
                            element.setAttribute('tabindex', selected ? '0' : '-1');
                        });
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', node.id);
                    container.addClass('is-dragging');
                    row.addClass('active');
                });
                handle.on('dragend', endDrag);
                row.append(handle);
                const arrow = createElement('button', {
                    className: 'gpo-editor-filter-arrow',
                    attrs: {
                        type: 'button',
                        tabindex: '-1',
                        'aria-label': pt(
                            collapsed.has(node.id) ? 'expandTargetingCollection' : 'collapseTargetingCollection'
                        ),
                        disabled: !node.supports_children ? 'disabled' : null
                    },
                    text: node.supports_children ? (collapsed.has(node.id) ? '›' : '⌄') : ''
                });
                arrow.on('click', function (event) {
                    event.stopPropagation();
                    capture();
                    if (formState.busy) return;
                    if (collapsed.has(node.id)) collapsed.delete(node.id);
                    else {
                        collapsed.add(node.id);
                        if (ui.selectedId && ui.selectedId !== node.id && descendant(node, ui.selectedId)) {
                            ui.selectedId = node.id;
                            renderFields();
                            syncToolbar();
                        }
                    }
                    renderTree();
                    focusNode(ui.selectedId || node.id);
                });
                row.append(arrow);
                row.append(
                    createElement('span', {
                        className: [
                            'gpo-editor-filter-icon',
                            editorIcons.targeting(node.supports_children ? 'collection' : node.kind)
                        ],
                        attrs: { 'aria-hidden': 'true' }
                    })
                );
                row.append(
                    createElement('span', {
                        className: 'gpo-editor-filter-label',
                        children: [
                            createElement('span', { text: logic + nodeLabel(node) }),
                            createElement('span', { className: 'gpo-editor-filter-detail', text: summary(node) })
                        ]
                    })
                );
                row.on('click', function (event) {
                    event.stopPropagation();
                    if (!formState.busy) select(node.id, true);
                });
                row.on('dblclick', function (event) {
                    if (
                        event.target.closest(
                            'button,input,select,textarea,[contenteditable]:not([contenteditable="false"])'
                        )
                    )
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    focusOperands(node.id);
                });
                row.on('dragover', function (event) {
                    if (!ui.dragId || blocked()) return;
                    event.preventDefault();
                    event.stopPropagation();
                    clearDrop();
                    ui.dropTarget = destination(node, event, row.getElement());
                    event.dataTransfer.dropEffect = ui.dropTarget.valid ? 'move' : 'none';
                    row.addClass(
                        ui.dropTarget.valid ? 'targeting-drop-' + ui.dropTarget.where : 'targeting-drop-invalid'
                    );
                });
                row.on('drop', function (event) {
                    if (!ui.dragId || !ui.dropTarget) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const target = ui.dropTarget;
                    ui.selectedId = ui.dragId;
                    if (target.valid) applyMove(target.parentId, target.index);
                    else setNotice(pt('invalidTargetingMove'));
                    endDrag();
                });
                tree.append(row);
                if (!collapsed.has(node.id)) append(node.children, depth + 1);
            });
        }
        append(ui.draft.roots, 0);
        if (!ui.draft.roots.length)
            tree.append(createElement('div', { className: 'gpo-editor-filters__empty', text: pt('targetingEmpty') }));
        const rootDrop = createElement('div', {
            className: 'gpo-editor-filters__root-drop',
            text: pt('targetingRootDrop')
        });
        rootDrop.on('dragover', function (event) {
            if (!ui.dragId || blocked()) return;
            event.preventDefault();
            clearDrop();
            const source = locate(ui.dragId);
            ui.dropTarget = {
                parentId: null,
                index: ui.draft.roots.length - (source && !source.parent ? 1 : 0),
                valid: true
            };
            rootDrop.addClass('targeting-drop-inside');
        });
        rootDrop.on('drop', function (event) {
            if (!ui.dragId || !ui.dropTarget) return;
            event.preventDefault();
            ui.selectedId = ui.dragId;
            applyMove(ui.dropTarget.parentId, ui.dropTarget.index);
            endDrag();
        });
        tree.append(rootDrop);
        if (ui.navigation) ui.navigation.sync();
    }

    return { renderTree, summary };
}

export { createTargetingTree };
