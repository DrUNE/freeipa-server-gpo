import { createElement, ElementCreator } from '@gpui/util/element-creator';
import { createDataTable, rowId, setSelectedRows, tableRows } from '@gpui/components/DataTable/DataTable';
import { createToolbar, setToolbarItem } from '@gpui/components/Toolbar/Toolbar';
import { scriptFile } from '@gpui/components/editor-icons';
import { st, nameContent } from '@gpui/components/templates/script/helpers';

const wrap = ElementCreator.wrap;

/**
 * The script entries table of the event page with its toolbar (add, edit, remove, move).
 * @param {any} context the editor's state and operations (see renderScriptEventEditor)
 */
function createEntriesPanel({
    bindTable,
    config,
    entries,
    groupView,
    moveEntry,
    navigations,
    openForm,
    removeEntry,
    setHeaderState,
    state
}) {
    function renderEntries() {
        const rows = entries();
        const editable = Boolean(groupView().editable) && !state.busy;
        function selectEntry(id) {
            state.selectedEntry[state.group] = id;
            setSelectedRows(tableElement, [id]);
            syncButtons();
            setHeaderState();
            if (navigations.entries) navigations.entries.sync();
        }
        const tableElement = createDataTable({
            label: st(state.group),
            columns: [
                { id: 'name', label: st('columnName') },
                { id: 'arguments', label: st('columnArguments') }
            ],
            emptyText: st('emptyEntries'),
            className: 'preference__table gpo-catalog-table',
            emptyClassName: 'gpo-editor-scripts__empty-row',
            rows: rows.map(function (entry) {
                return {
                    id: entry.identity,
                    attrs: { 'data-script-entry': entry.identity },
                    cells: [nameContent(entry.command_line, scriptFile(state.group)), entry.parameters],
                    selected: entry.identity === state.selectedEntry[state.group],
                    onClick: function () {
                        selectEntry(entry.identity);
                        navigations.entries.focusSelected();
                    },
                    onDoubleClick: function () {
                        if (!state.busy && !state.form && !state.picker && !state.confirmation) {
                            selectEntry(entry.identity);
                            openForm('edit');
                        }
                    }
                };
            })
        });
        tableRows(tableElement).forEach(function (/** @type {any} */ row) {
            row.__select = function () {
                selectEntry(rowId(row));
            };
        });
        const table = wrap(tableElement);
        const move = function (delta) {
            return function () {
                moveEntry(delta);
            };
        };
        const toolbar = createToolbar({
            label: st(state.group),
            className: 'gpo-editor-scripts__toolbar',
            items: [
                { id: 'up', label: st('up'), onClick: move(-1), disabled: true },
                { id: 'down', label: st('down'), onClick: move(1), disabled: true }
            ].concat(
                config.mode === 'event'
                    ? [
                          {
                              id: 'add',
                              label: st('add'),
                              onClick: function () {
                                  openForm('add');
                              },
                              disabled: !editable
                          },
                          {
                              id: 'edit',
                              label: st('edit'),
                              onClick: function () {
                                  openForm('edit');
                              },
                              disabled: true
                          },
                          { id: 'remove', label: st('remove'), onClick: removeEntry, disabled: true }
                      ]
                    : []
            )
        });
        function syncButtons() {
            const index = rows.findIndex(function (entry) {
                return entry.identity === state.selectedEntry[state.group];
            });
            const selected = editable && index >= 0;
            setToolbarItem(toolbar, 'edit', { disabled: !selected });
            setToolbarItem(toolbar, 'remove', { disabled: !selected });
            setToolbarItem(toolbar, 'up', { disabled: !(editable && index >= 1) });
            setToolbarItem(toolbar, 'down', { disabled: !(editable && index >= 0 && index < rows.length - 1) });
        }
        syncButtons();
        bindTable(table, 'entries', {
            rows: function () {
                return tableRows(tableElement);
            },
            selected: function () {
                return (
                    tableRows(tableElement).find(function (row) {
                        return rowId(row) === state.selectedEntry[state.group];
                    }) || null
                );
            },
            select: function (row) {
                row.__select();
            },
            activate: function () {
                openForm('edit');
            },
            remove: removeEntry,
            canActivate: function () {
                return Boolean(groupView().editable);
            },
            canRemove: function () {
                return Boolean(groupView().editable);
            }
        });
        return createElement('section', {
            className: 'gpo-editor-scripts__entries',
            children: [createElement('div', { className: 'gpo-editor-scripts__list', children: [table] }), toolbar]
        });
    }

    return renderEntries;
}

export { createEntriesPanel };
