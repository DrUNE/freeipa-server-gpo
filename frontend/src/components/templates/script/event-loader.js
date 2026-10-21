import * as API from '@gpui/util/API';
import * as editorStatus from '@gpui/components/editor-status';
import * as listNavigation from '@gpui/components/list-navigation';

const GROUPS = ['classic', 'powershell'];

/**
 * Loading the event view and publishing mutations: the request counters, the busy state and the answers that replace the view.
 * @param {any} context the editor's state and operations
 */
function createEventLoader({
    assets,
    config,
    current,
    navigations,
    renderBody,
    rootElement,
    scope,
    setError,
    state,
    syncModalBusy
}) {
    function applyResponse(response) {
        const previousOrder = state.view && state.view.execution_order;
        state.envelope = response;
        state.view = (response && response.scripts) || null;
        state.error = null;
        if (state.view && (state.orderDraft === null || state.orderDraft === previousOrder)) {
            state.orderDraft = state.view.execution_order || 'unspecified';
        }
        GROUPS.forEach(function (group) {
            const rows = (state.view && state.view[group] && state.view[group].entries) || [];
            if (state.removal && state.removal.group === group) {
                state.selectedEntry[group] = listNavigation.neighbor(
                    state.removal.before,
                    state.removal.removed,
                    rows.map(function (entry) {
                        return entry.identity;
                    })
                );
            }
            if (
                !rows.some(function (entry) {
                    return entry.identity === state.selectedEntry[group];
                })
            ) {
                state.selectedEntry[group] = null;
            }
        });
        if (
            !assets().some(function (asset) {
                return asset.name === state.selectedAsset;
            })
        ) {
            state.selectedAsset = null;
        }
        state.selectedAssets.forEach(function (name) {
            if (
                !assets().some(function (asset) {
                    return asset.name === name;
                })
            ) {
                state.selectedAssets.delete(name);
            }
        });
        if (state.removal && state.removal.assets) {
            const surviving = assets().map(function (asset) {
                return asset.name;
            });
            const removed = state.removal.removed.filter(function (name) {
                return surviving.indexOf(name) === -1;
            });
            if (removed.length) {
                const neighbor = listNavigation.neighbor(state.removal.before, removed, surviving);
                state.selectedAssets = new Set(neighbor ? [neighbor] : []);
                state.selectedAsset = neighbor;
                state.assetFocus = neighbor;
            }
        }
        if (
            !assets().some(function (asset) {
                return asset.name === state.assetFocus;
            })
        )
            state.assetFocus = state.selectedAsset;
        renderBody();
    }

    async function loadEvent() {
        const requestId = ++state.requestId;
        const event = state.event;
        state.loading = true;
        state.error = null;
        renderBody();
        try {
            const response = await API.scriptsShow(scope, event);
            if (!current() || requestId !== state.requestId || event !== state.event) return;
            state.loading = false;
            applyResponse(response);
        } catch (error) {
            if (!current() || requestId !== state.requestId) return;
            state.loading = false;
            setError(error);
        }
    }

    async function mutate(operation, errorSlot) {
        if (state.busy || !current()) return false;
        const focusedTable = document.activeElement && document.activeElement.closest('[data-script-list]');
        const returnList =
            focusedTable && rootElement.contains(focusedTable) ? focusedTable.getAttribute('data-script-list') : null;
        const returnGroup = state.group;
        state.busy = true;
        state.error = null;
        state.saveStatus = 'saving';
        syncModalBusy();
        renderBody();
        try {
            const response = await operation();
            if (!current()) return false;
            applyResponse(response);
            state.saveStatus = 'saved';
            if (typeof config.onSaved === 'function') config.onSaved(response);
            return true;
        } catch (error) {
            if (current()) {
                state.saveStatus = null;
                if (errorSlot && errorSlot.isConnected) {
                    errorSlot.textContent = '';
                    errorSlot.appendChild(
                        editorStatus
                            .renderError(error, {
                                onRefresh: function () {
                                    void loadEvent();
                                }
                            })
                            .getElement()
                    );
                } else setError(error);
            }
            return false;
        } finally {
            state.busy = false;
            state.removal = null;
            if (current()) {
                syncModalBusy();
                renderBody();
            }
            if (
                current() &&
                returnList &&
                returnGroup === state.group &&
                !state.form &&
                !state.picker &&
                document.activeElement === document.body &&
                navigations[returnList]
            )
                navigations[returnList].focusSelected();
        }
    }

    return { applyResponse, loadEvent, mutate };
}

export { createEventLoader };
