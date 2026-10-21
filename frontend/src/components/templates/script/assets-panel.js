import { createElement, ElementCreator } from '@gpui/util/element-creator';
import { createDataTable, rowId, setSelectedRows, tableRows } from '@gpui/components/DataTable/DataTable';
import { createToolbar, setToolbarItem } from '@gpui/components/Toolbar/Toolbar';
import { st, nameContent, assetIcon } from '@gpui/components/templates/script/helpers';

const wrap = ElementCreator.wrap;

/**
 * The files table of the event page with its toolbar (upload, replace, download, delete).
 * @param {any} context the editor's state and operations (see renderScriptEventEditor)
 */
function createAssetsPanel({
    assets,
    bindTable,
    config,
    deleteAsset,
    downloadAsset,
    groupView,
    loadEvent,
    navigations,
    openForm,
    replaceInput,
    selectedAsset,
    state,
    uploadInput
}) {
    function renderAssets() {
        const all = assets();
        const mayChange = !state.busy && Boolean(groupView().editable);
        const explorer = config.mode === 'assets';
        /** The checkbox of an explorer row; it follows the selection like the row does. */
        const checkboxes = new Map();
        /** What a row does when it is chosen: by a click, a key or its checkbox. */
        const selectors = new Map();
        function applySelection() {
            if (explorer) {
                setSelectedRows(tableElement, state.selectedAssets);
                tableRows(tableElement).forEach(function (row) {
                    checkboxes.get(rowId(row)).checked = state.selectedAssets.has(rowId(row));
                });
            } else {
                setSelectedRows(tableElement, [state.selectedAsset]);
            }
        }
        function selectAsset(asset, selected, exclusive, range) {
            if (explorer) {
                if (range && state.assetFocus) {
                    const from = all.findIndex(function (entry) {
                        return entry.name === state.assetFocus;
                    });
                    const to = all.indexOf(asset);
                    if (exclusive) state.selectedAssets.clear();
                    all.slice(Math.min(from, to), Math.max(from, to) + 1).forEach(function (entry) {
                        state.selectedAssets.add(entry.name);
                    });
                } else if (exclusive) state.selectedAssets.clear();
                if (selected) state.selectedAssets.add(asset.name);
                else state.selectedAssets.delete(asset.name);
                state.selectedAsset = state.selectedAssets.size === 1 ? Array.from(state.selectedAssets)[0] : null;
            } else {
                state.selectedAsset = asset.name;
            }
            applySelection();
            state.assetFocus = asset.name;
            syncButtons();
            if (navigations.assets) navigations.assets.sync();
        }
        const tableElement = createDataTable({
            label: st('managedFiles'),
            multiple: explorer,
            columns: (explorer ? [{ id: 'select', label: '' }] : []).concat([
                { id: 'name', label: st('columnName') },
                { id: 'size', label: st('columnSize') },
                { id: 'references', label: st(explorer ? 'usedBy' : 'columnReferences') }
            ]),
            emptyText: st('emptyAssets'),
            className: 'preference__table gpo-catalog-table',
            emptyClassName: 'gpo-editor-scripts__empty-row',
            rows: all.map(function (asset) {
                let checkbox = null;
                if (explorer) {
                    checkbox = createElement('input', {
                        attrs: {
                            type: 'checkbox',
                            tabindex: '-1',
                            'aria-label': st('selectFile') + ': ' + asset.name
                        }
                    });
                    checkbox.getElement().checked = state.selectedAssets.has(asset.name);
                    checkbox.on('click', function (event) {
                        event.stopPropagation();
                    });
                    checkbox.on('change', function () {
                        selectAsset(asset, checkbox.getElement().checked);
                    });
                    checkboxes.set(asset.name, checkbox.getElement());
                }
                selectors.set(asset.name, function (event) {
                    selectAsset(asset, true, !event || !event.ctrlKey, Boolean(event && event.shiftKey));
                });
                return {
                    id: asset.name,
                    attrs: { 'data-script-asset': asset.name },
                    cells: [
                        checkbox ? checkbox.getElement() : null,
                        nameContent(asset.name, assetIcon(asset.name)),
                        String(asset.byte_size) + ' ' + st('bytes'),
                        String((asset.references || []).length)
                    ].filter(function (cell, index) {
                        return explorer || index > 0;
                    }),
                    selected: explorer ? state.selectedAssets.has(asset.name) : asset.name === state.selectedAsset,
                    onClick: function (event) {
                        selectAsset(
                            asset,
                            explorer && !event.shiftKey ? !state.selectedAssets.has(asset.name) : true,
                            false,
                            event.shiftKey
                        );
                        navigations.assets.sync();
                        /** @type {HTMLElement} */ (event.currentTarget).focus();
                    },
                    onDoubleClick: function (event) {
                        if (event.target.closest('input, select, textarea, button, a, summary, [contenteditable]'))
                            return;
                        if (state.busy || state.form || state.picker || state.confirmation) return;
                        selectAsset(asset, true, true);
                        if (explorer) void downloadAsset();
                        else openForm('select');
                    }
                };
            })
        });
        tableRows(tableElement).forEach(function (/** @type {any} */ row) {
            row.__select = selectors.get(rowId(row));
        });
        const table = wrap(tableElement);
        const open = function (name) {
            return function () {
                if (name === 'upload') uploadInput.getElement().click();
                else if (name === 'select') openForm('select');
                else if (name === 'replace') replaceInput.getElement().click();
                else if (name === 'download') void downloadAsset();
                else if (name === 'delete') deleteAsset();
                else void loadEvent();
            };
        };
        const items = {
            upload: { id: 'upload', label: st('upload'), onClick: open('upload'), disabled: !mayChange },
            select: { id: 'select', label: st('addSelectedScript'), onClick: open('select'), disabled: true },
            replace: { id: 'replace', label: st('replaceFile'), onClick: open('replace'), disabled: true },
            download: { id: 'download', label: st('download'), onClick: open('download'), disabled: true },
            delete: { id: 'delete', label: st('deleteFile'), onClick: open('delete'), disabled: true },
            refresh: { id: 'refresh', label: st('refresh'), onClick: open('refresh'), disabled: state.busy }
        };
        const toolbar = createToolbar({
            label: st('managedFiles'),
            className: 'gpo-editor-scripts__toolbar',
            items: explorer
                ? all.length
                    ? [items.upload, items.replace, items.download, items.delete, items.refresh]
                    : [items.upload]
                : [items.upload, items.select, items.replace, items.download, items.delete]
        });
        function syncButtons() {
            const asset = selectedAsset();
            const selected = explorer
                ? all.filter(function (item) {
                      return state.selectedAssets.has(item.name);
                  })
                : asset
                  ? [asset]
                  : [];
            const referenced = selected.some(function (item) {
                return item.references && item.references.length;
            });
            setToolbarItem(toolbar, 'upload', { disabled: !mayChange });
            setToolbarItem(toolbar, 'select', { disabled: !(mayChange && Boolean(asset)) });
            setToolbarItem(toolbar, 'replace', { disabled: !(mayChange && Boolean(asset)) });
            setToolbarItem(toolbar, 'download', { disabled: !(!state.busy && Boolean(asset)) });
            setToolbarItem(toolbar, 'delete', {
                disabled: !(mayChange && selected.length > 0 && !referenced),
                title: referenced ? st('fileInUse') : ''
            });
            setToolbarItem(toolbar, 'refresh', { disabled: state.busy });
        }
        syncButtons();
        bindTable(table, 'assets', {
            rows: function () {
                return tableRows(tableElement);
            },
            selected: function () {
                return (
                    tableRows(tableElement).find(function (row) {
                        return rowId(row) === (state.assetFocus || state.selectedAsset);
                    }) || null
                );
            },
            isSelected: explorer
                ? function (row) {
                      return state.selectedAssets.has(rowId(row));
                  }
                : undefined,
            select: function (row, event) {
                row.__select(event);
            },
            activate: function (row, event) {
                row.__select();
                if (!explorer) openForm('select');
                else if (event && event.key === 'F2') {
                    if (groupView().editable) replaceInput.getElement().click();
                } else void downloadAsset();
            },
            remove: deleteAsset,
            canActivate: function () {
                return explorer || Boolean(groupView().editable);
            },
            canRemove: function () {
                const selected = explorer
                    ? all.filter(function (asset) {
                          return state.selectedAssets.has(asset.name);
                      })
                    : [selectedAsset()].filter(Boolean);
                return (
                    Boolean(groupView().editable) &&
                    selected.length > 0 &&
                    selected.every(function (asset) {
                        return !(asset.references && asset.references.length);
                    })
                );
            }
        });
        const list = createElement('div', {
            className: 'gpo-editor-scripts__list',
            children: [table]
        });
        return createElement('section', {
            className: 'gpo-editor-scripts__assets',
            children: [
                explorer ? null : createElement('h3', { text: st('managedFiles') }),
                explorer ? toolbar : list,
                explorer ? list : toolbar,
                selectedAsset() && selectedAsset().references && selectedAsset().references.length
                    ? createElement('p', {
                          className: 'gpo-editor-scripts__hint',
                          text: st('fileInUse')
                      })
                    : null
            ]
        });
    }

    return renderAssets;
}

export { createAssetsPanel };
