import { createElement } from '@gpui/util/element-creator';
import { scriptFile } from '@gpui/components/editor-icons';
import { st, button, nameCell } from '@gpui/components/templates/script/helpers';

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
        const table = createElement('table', {
            className: ['preference__table', 'gpo-catalog-table'],
            children: [
                createElement('thead', {
                    children: [
                        createElement('tr', {
                            children: [
                                createElement('th', { text: st('columnName') }),
                                createElement('th', { text: st('columnArguments') })
                            ]
                        })
                    ]
                }),
                createElement('tbody', {
                    children: rows.length
                        ? rows.map(function (entry) {
                              const row = createElement('tr', {
                                  className: entry.identity === state.selectedEntry[state.group] ? 'active' : null,
                                  attrs: { tabindex: '-1', 'data-script-entry': entry.identity },
                                  children: [
                                      nameCell(entry.command_line, scriptFile(state.group)),
                                      createElement('td', { text: entry.parameters })
                                  ]
                              });
                              function select() {
                                  state.selectedEntry[state.group] = entry.identity;
                                  Array.prototype.forEach.call(
                                      table.getElement().querySelectorAll('tbody tr'),
                                      function (candidate) {
                                          candidate.classList.toggle('active', candidate === row.getElement());
                                      }
                                  );
                                  syncButtons();
                                  setHeaderState();
                                  if (navigations.entries) navigations.entries.sync();
                              }
                              row.getElement().__select = select;
                              row.on('click', function () {
                                  select();
                                  navigations.entries.focusSelected();
                              });
                              row.on('dblclick', function () {
                                  if (!state.busy && !state.form && !state.picker && !state.confirmation) {
                                      select();
                                      openForm('edit');
                                  }
                              });
                              return row;
                          })
                        : [
                              createElement('tr', {
                                  className: 'gpo-editor-scripts__empty-row',
                                  children: [
                                      createElement('td', {
                                          attrs: { colspan: '2' },
                                          text: st('emptyEntries')
                                      })
                                  ]
                              })
                          ]
                })
            ]
        });
        const controls = {
            add: button(
                st('add'),
                function () {
                    openForm('add');
                },
                !editable
            ),
            edit: button(
                st('edit'),
                function () {
                    openForm('edit');
                },
                true
            ),
            remove: button(st('remove'), removeEntry, true),
            up: button(
                st('up'),
                function () {
                    moveEntry(-1);
                },
                true
            ),
            down: button(
                st('down'),
                function () {
                    moveEntry(1);
                },
                true
            )
        };
        function syncButtons() {
            const index = rows.findIndex(function (entry) {
                return entry.identity === state.selectedEntry[state.group];
            });
            const selected = editable && index >= 0;
            const up = editable && index >= 1;
            const down = editable && index >= 0 && index < rows.length - 1;
            [controls.edit, controls.remove].forEach(function (control) {
                control.getElement().disabled = !selected;
                control.getElement().classList.toggle('active', selected);
            });
            controls.up.getElement().disabled = !up;
            controls.down.getElement().disabled = !down;
            controls.up.getElement().classList.toggle('active', up);
            controls.down.getElement().classList.toggle('active', down);
        }
        syncButtons();
        bindTable(table, 'entries', {
            rows: function () {
                return Array.from(table.getElement().querySelectorAll('[data-script-entry]'));
            },
            selected: function () {
                return (
                    Array.from(table.getElement().querySelectorAll('[data-script-entry]')).find(function (row) {
                        return row.getAttribute('data-script-entry') === state.selectedEntry[state.group];
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
            children: [
                createElement('div', {
                    className: 'gpo-editor-scripts__list',
                    children: [table]
                }),
                createElement('div', {
                    className: 'gpo-editor-scripts__toolbar',
                    children:
                        config.mode === 'event'
                            ? [controls.up, controls.down, controls.add, controls.edit, controls.remove]
                            : [controls.up, controls.down]
                })
            ]
        });
    }

    return renderEntries;
}

export { createEntriesPanel };
