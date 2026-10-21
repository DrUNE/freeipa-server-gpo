import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { equal, clone } from '@gpui/core/editor-dto';
import { t } from '@gpui/locales/translations';
import { pt, tableColumns, actionLabel, itemFieldValue, scopeField, listFrom } from '@gpui/core/preference-view-common';

/**
 * The items table of the preferences page and everything that feeds it: the list request, the per-item field cache
 * and the selection (which drives the info panel). The page's mutable state is `view`.
 * @param {any} context the page's state and operations (see renderPreferencesTemplate)
 */
function createItemsTable({
    config,
    documentDto,
    infoPanel,
    item,
    itemFieldsCache,
    openForm,
    rootElement,
    setHeaderState,
    showPageError,
    view
}) {
    function renderTable() {
        const tableSlot = rootElement.querySelector('.gpo-editor-preferences__table');
        if (!tableSlot) return;
        const heldFocus = tableSlot.contains(document.activeElement);
        tableSlot.innerHTML = '';
        if (!view.items.length) {
            tableSlot.appendChild(
                createElement('div', {
                    className: 'gpo-editor-empty',
                    text: pt('emptyItems')
                }).getElement()
            );
            if (view.tableNavigation) {
                view.tableNavigation.sync();
                if (heldFocus) view.tableNavigation.focusSelected();
            }
            return;
        }
        const columns = tableColumns(item.preferenceKind);
        const useTemplate = Boolean(columns);
        const headerCells = useTemplate
            ? columns.map(function (column) {
                  return createElement('th', { text: pt(column.labelKey) });
              })
            : [
                  createElement('th', { text: pt('itemColumn') }),
                  createElement('th', { text: pt('filtersColumn') }),
                  createElement('th', { text: pt('actionsColumn') })
              ];

        function buildDataCells(preferenceItem, index) {
            if (!useTemplate) {
                return [
                    createElement('td', { text: preferenceItem.label }),
                    createElement('td', { text: preferenceItem.has_filters ? pt('yes') : pt('no') })
                ];
            }
            return columns.map(function (column) {
                let text = '';
                if (column.source === 'name') {
                    text = preferenceItem.label;
                } else if (column.source === 'order') {
                    text = String(index + 1);
                } else if (column.source === 'field') {
                    const value = cachedFieldValue(preferenceItem.identity, column.field);
                    text =
                        column.format === 'action'
                            ? actionLabel(value)
                            : value === null || value === undefined
                              ? ''
                              : String(value);
                }
                return createElement('td', { text: text });
            });
        }

        function buildActionsCell(preferenceItem) {
            return createElement('td', {
                className: 'gpo-editor-preference-table__actions',
                children: [
                    createElement('button', {
                        className: 'button',
                        attrs: {
                            type: 'button',
                            disabled: view.opening ? 'disabled' : null
                        },
                        text: documentDto.editable ? t('header.edit') : pt('viewTitle'),
                        events: {
                            click: function (event) {
                                event.stopPropagation();
                                selectItem(preferenceItem.identity);
                                void openForm(view.selectedIdentity);
                            }
                        }
                    })
                ]
            });
        }

        const bodyRows = view.items.map(function (preferenceItem, index) {
            const selected = view.selectedIdentity !== null && equal(view.selectedIdentity, preferenceItem.identity);
            const cells = buildDataCells(preferenceItem, index);
            if (!useTemplate) cells.push(buildActionsCell(preferenceItem));
            const row = createElement('tr', {
                className: selected ? 'active' : null,
                attrs: {
                    tabindex: '-1',
                    'data-preference-identity': cacheKey(preferenceItem.identity),
                    'aria-selected': selected ? 'true' : 'false'
                },
                children: cells,
                events: {
                    click: function () {
                        selectItem(preferenceItem.identity);
                        if (view.tableNavigation) view.tableNavigation.focusSelected();
                    },
                    dblclick: function () {
                        if (view.modalState || view.opening || view.deleting) return;
                        selectItem(preferenceItem.identity);
                        void openForm(view.selectedIdentity);
                    }
                }
            });
            row.getElement().__preferenceIdentity = preferenceItem.identity;
            return row;
        });

        const table = createElement('table', {
            className: ['preference__table', 'gpo-catalog-table'],
            children: [
                createElement('thead', { children: [createElement('tr', { children: headerCells })] }),
                createElement('tbody', { children: bodyRows })
            ]
        });
        tableSlot.appendChild(table.getElement());
        if (view.tableNavigation) {
            view.tableNavigation.sync();
            if (heldFocus) view.tableNavigation.focusSelected();
        }
    }

    function selectItem(identity) {
        view.selectedIdentity = clone(identity);
        Array.prototype.forEach.call(rootElement.querySelectorAll('[data-preference-identity]'), function (row) {
            const selected = equal(row.__preferenceIdentity, view.selectedIdentity);
            row.classList.toggle('active', selected);
            row.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        if (view.tableNavigation) view.tableNavigation.sync();
        setHeaderState();
        void infoPanel.request(view.selectedIdentity);
    }

    function focusTable() {
        if (!view.disposed && (typeof config.isCurrent !== 'function' || config.isCurrent()) && view.tableNavigation) {
            view.tableNavigation.focusSelected();
        }
    }

    function cacheKey(identity) {
        return JSON.stringify(identity);
    }

    function cachedFieldValue(identity, fieldId) {
        const fields = itemFieldsCache.get(cacheKey(identity));
        if (!fields) return '';
        return itemFieldValue({ fields: fields }, fieldId);
    }

    function scheduleTableRefresh() {
        if (view.tableRefreshScheduled) return;
        view.tableRefreshScheduled = true;
        const run = function () {
            view.tableRefreshScheduled = false;
            if (typeof config.isCurrent === 'function' && !config.isCurrent()) return;
            renderTable();
        };
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(run);
        } else {
            setTimeout(run, 16);
        }
    }

    function ensureItemFields(identity) {
        const key = cacheKey(identity);
        if (itemFieldsCache.has(key)) {
            return Promise.resolve(itemFieldsCache.get(key));
        }
        const startedGeneration = view.fieldsRequestId;
        return API.preferenceShow(item.scope, item.preferenceKind, clone(identity)).then(function (response) {
            if (startedGeneration !== view.fieldsRequestId) return null;
            const fields = clone(response.fields || response.new_item_fields || []).map(function (field) {
                return scopeField(field, item.scope);
            });
            itemFieldsCache.set(key, fields);
            return fields;
        });
    }

    function prefetchTableFields() {
        const generation = ++view.fieldsRequestId;
        view.items.forEach(function (preferenceItem) {
            if (preferenceItem.identity === null || preferenceItem.identity === undefined) return;
            if (itemFieldsCache.has(cacheKey(preferenceItem.identity))) return;
            void ensureItemFields(preferenceItem.identity).then(function (fields) {
                if (!fields) return;
                if (generation !== view.fieldsRequestId) return;
                if (typeof config.isCurrent === 'function' && !config.isCurrent()) return;
                scheduleTableRefresh();
            });
        });
    }

    function invalidateCachedFields(identity) {
        itemFieldsCache.delete(cacheKey(identity));
        view.fieldsRequestId += 1;
    }

    async function loadItems() {
        const requestId = ++view.itemsRequestId;
        try {
            const response = await API.preferenceItems(item.scope, item.preferenceKind);
            if (requestId !== view.itemsRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent()))
                return;
            view.items = listFrom(response, 'items');
            if (
                view.selectedIdentity !== null &&
                !view.items.some(function (entry) {
                    return equal(entry.identity, view.selectedIdentity);
                })
            )
                view.selectedIdentity = null;
            const errorSlot = rootElement.querySelector('.gpo-editor-preferences__error');
            if (errorSlot) errorSlot.innerHTML = '';
            renderTable();
            setHeaderState();
            void prefetchTableFields();
            if (view.selectedIdentity !== null) {
                void infoPanel.request(view.selectedIdentity);
            } else {
                infoPanel.reset();
            }
        } catch (error) {
            if (requestId !== view.itemsRequestId || (typeof config.isCurrent === 'function' && !config.isCurrent()))
                return;
            showPageError(error);
        }
    }

    return {
        renderTable,
        selectItem,
        focusTable,
        cacheKey,
        cachedFieldValue,
        scheduleTableRefresh,
        ensureItemFields,
        prefetchTableFields,
        invalidateCachedFields,
        loadItems
    };
}

export { createItemsTable };
