import { createElement } from '@gpui/util/element-creator';
import { st, button, nameCell, assetIcon } from '@gpui/components/templates/script/helpers';

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
        const rows = all.map(function (asset) {
            const checkbox = explorer
                ? createElement('input', {
                      attrs: { type: 'checkbox', tabindex: '-1', 'aria-label': st('selectFile') + ': ' + asset.name }
                  })
                : null;
            if (checkbox) checkbox.getElement().checked = state.selectedAssets.has(asset.name);
            const row = createElement('tr', {
                className: explorer
                    ? state.selectedAssets.has(asset.name)
                        ? 'active'
                        : null
                    : asset.name === state.selectedAsset
                      ? 'active'
                      : null,
                attrs: { tabindex: '-1', 'data-script-asset': asset.name },
                children: [
                    checkbox ? createElement('td', { children: [checkbox] }) : null,
                    nameCell(asset.name, assetIcon(asset.name)),
                    createElement('td', { text: String(asset.byte_size) + ' ' + st('bytes') }),
                    createElement('td', { text: String((asset.references || []).length) })
                ]
            });
            function select(selected, exclusive, range) {
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
                    Array.prototype.forEach.call(
                        table.getElement().querySelectorAll('[data-script-asset]'),
                        function (candidate) {
                            const active = state.selectedAssets.has(candidate.getAttribute('data-script-asset'));
                            candidate.classList.toggle('active', active);
                            candidate.setAttribute('aria-selected', active ? 'true' : 'false');
                            candidate.querySelector('input[type=checkbox]').checked = active;
                        }
                    );
                } else {
                    state.selectedAsset = asset.name;
                    Array.prototype.forEach.call(table.getElement().querySelectorAll('tbody tr'), function (candidate) {
                        candidate.classList.toggle('active', candidate === row.getElement());
                    });
                }
                state.assetFocus = asset.name;
                syncButtons();
                if (navigations.assets) navigations.assets.sync();
            }
            row.getElement().__select = function (event) {
                select(true, !event || !event.ctrlKey, Boolean(event && event.shiftKey));
            };
            row.on('click', function (event) {
                select(
                    explorer && !event.shiftKey ? !state.selectedAssets.has(asset.name) : true,
                    false,
                    event.shiftKey
                );
                navigations.assets.sync();
                row.getElement().focus();
            });
            row.on('dblclick', function (event) {
                if (event.target.closest('input, select, textarea, button, a, summary, [contenteditable]')) return;
                if (state.busy || state.form || state.picker || state.confirmation) return;
                select(true, true);
                if (explorer) void downloadAsset();
                else openForm('select');
            });
            if (checkbox)
                checkbox.on('click', function (event) {
                    event.stopPropagation();
                });
            if (checkbox)
                checkbox.on('change', function () {
                    select(checkbox.getElement().checked);
                });
            return row;
        });
        const table = createElement('table', {
            className: ['preference__table', 'gpo-catalog-table'],
            children: [
                createElement('thead', {
                    children: [
                        createElement('tr', {
                            children: [
                                explorer ? createElement('th', { text: '' }) : null,
                                createElement('th', { text: st('columnName') }),
                                createElement('th', { text: st('columnSize') }),
                                createElement('th', { text: st(explorer ? 'usedBy' : 'columnReferences') })
                            ]
                        })
                    ]
                }),
                createElement('tbody', {
                    children: rows.length
                        ? rows
                        : [
                              createElement('tr', {
                                  className: 'gpo-editor-scripts__empty-row',
                                  children: [
                                      createElement('td', {
                                          attrs: { colspan: explorer ? '4' : '3' },
                                          text: st('emptyAssets')
                                      })
                                  ]
                              })
                          ]
                })
            ]
        });
        const controls = {
            upload: button(
                st('upload'),
                function () {
                    uploadInput.getElement().click();
                },
                !mayChange
            ),
            select: button(
                st('addSelectedScript'),
                function () {
                    openForm('select');
                },
                true
            ),
            replace: button(
                st('replaceFile'),
                function () {
                    replaceInput.getElement().click();
                },
                true
            ),
            download: button(
                st('download'),
                function () {
                    void downloadAsset();
                },
                true
            ),
            delete: button(st('deleteFile'), deleteAsset, true),
            refresh: button(
                st('refresh'),
                function () {
                    void loadEvent();
                },
                state.busy
            )
        };
        function syncButtons() {
            const asset = selectedAsset();
            const selected = explorer
                ? all.filter(function (item) {
                      return state.selectedAssets.has(item.name);
                  })
                : asset
                  ? [asset]
                  : [];
            const enabled = [
                mayChange,
                mayChange && Boolean(asset),
                mayChange && Boolean(asset),
                !state.busy && Boolean(asset),
                mayChange &&
                    selected.length > 0 &&
                    selected.every(function (item) {
                        return !(item.references && item.references.length);
                    })
            ];
            [controls.upload, controls.select, controls.replace, controls.download, controls.delete].forEach(
                function (control, index) {
                    control.getElement().disabled = !enabled[index];
                    control.getElement().classList.toggle('active', enabled[index]);
                }
            );
            controls.delete.getElement().title = selected.some(function (item) {
                return item.references && item.references.length;
            })
                ? st('fileInUse')
                : '';
            controls.refresh.getElement().disabled = state.busy;
            controls.refresh.getElement().classList.toggle('active', !state.busy);
        }
        syncButtons();
        bindTable(table, 'assets', {
            rows: function () {
                return Array.from(table.getElement().querySelectorAll('[data-script-asset]'));
            },
            selected: function () {
                return (
                    Array.from(table.getElement().querySelectorAll('[data-script-asset]')).find(function (row) {
                        return row.getAttribute('data-script-asset') === (state.assetFocus || state.selectedAsset);
                    }) || null
                );
            },
            isSelected: explorer
                ? function (row) {
                      return state.selectedAssets.has(row.getAttribute('data-script-asset'));
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
        const toolbar = createElement('div', {
            className: 'gpo-editor-scripts__toolbar',
            children: explorer
                ? all.length
                    ? [controls.upload, controls.replace, controls.download, controls.delete, controls.refresh]
                    : [controls.upload]
                : [controls.upload, controls.select, controls.replace, controls.download, controls.delete]
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
