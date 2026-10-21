import { createElement } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { renderPending, renderDiagnostics } from '@gpui/components/editor-status';
import * as editorStatus from '@gpui/components/editor-status';
import { open } from '@gpui/components/confirmation-dialog';
import { bind } from '@gpui/components/list-navigation';
import * as listNavigation from '@gpui/components/list-navigation';
import { st, eventLabel, button, nextHeaderOwner } from '@gpui/components/templates/script/helpers';

import { createAssetsPanel } from '@gpui/components/templates/script/assets-panel';
import { createEntriesPanel } from '@gpui/components/templates/script/entries-panel';
import { createAssetPicker } from '@gpui/components/templates/script/picker';
import { createEntryForm } from '@gpui/components/templates/script/entry-form';
import { createOrderPanel } from '@gpui/components/templates/script/order-panel';
import { createAssetActions } from '@gpui/components/templates/script/asset-actions';

const GROUPS = ['classic', 'powershell'];
const EVENTS = { computer: ['startup', 'shutdown'], user: ['logon', 'logoff'] };

// All mutations are published individually; there is no unsaved local state.
function renderScriptEventEditor(options) {
    const config = options || {};
    const scope = config.item && config.item.scope === 'user' ? 'user' : 'computer';
    let event = config.item && config.item.event;
    if (EVENTS[scope].indexOf(event) === -1) event = EVENTS[scope][0];
    const state = {
        event: event,
        group: 'classic',
        view: null,
        envelope: null,
        loading: false,
        busy: false,
        error: null,
        selectedEntry: { classic: null, powershell: null },
        selectedAsset: null,
        selectedAssets: new Set(),
        requestId: 0,
        disposed: false,
        form: null,
        formState: null,
        picker: null,
        confirmation: null,
        orderDraft: null,
        saveStatus: null
    };
    const navigations = {};
    state.pickerNavigation = null;
    state.assetFocus = null;
    state.removal = null;
    const root = createElement('div', { className: ['gp__scripts', 'gp__preference', 'gpo-editor-scripts'] });
    const rootElement = root.getElement();
    const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
    const headerControls = headerElement && headerElement.querySelector('.gp__control');
    const headerActions = headerElement && headerElement.querySelector('.gp__control-actions');
    const admxActions = headerElement && headerElement.querySelector('.gp__control-admx');
    const helpSeparator = headerElement && headerElement.querySelector('.gp__control-separator');
    const createButton = headerControls && headerControls.querySelector('.preferences__btn-create');
    const editButton = headerControls && headerControls.querySelector('.preferences__btn-edit');
    const deleteButton = headerControls && headerControls.querySelector('.preferences__btn-delete');
    const headerOwner = nextHeaderOwner();
    const headerLabels = [createButton, editButton, deleteButton].map(function (control) {
        return control ? control.textContent : null;
    });
    const headerListeners = [];
    const modalDisabledStates = new WeakMap();
    if (headerControls) {
        headerControls.setAttribute('data-script-owner', headerOwner);
        headerControls.style.display = 'flex';
    }
    if (headerActions) {
        headerActions.setAttribute('data-script-owner', headerOwner);
        headerActions.style.display = 'flex';
    }
    if (admxActions) admxActions.style.display = 'none';
    if (helpSeparator) helpSeparator.style.display = 'none';
    [createButton, editButton, deleteButton].forEach(function (control, index) {
        if (control) control.textContent = st(['add', 'edit', 'remove'][index]);
    });
    const modalBody = createElement('div', { className: 'scripts__modal-content' });
    const uploadInput = createElement('input', {
        className: 'gpo-editor-scripts__file-input',
        attrs: { type: 'file', hidden: 'hidden', 'aria-label': st('upload') },
        style: { display: 'none' },
        events: {
            change: function (event) {
                void uploadChosen(event, false);
            }
        }
    });
    const replaceInput = createElement('input', {
        className: 'gpo-editor-scripts__file-input',
        attrs: { type: 'file', hidden: 'hidden', 'aria-label': st('replaceFile') },
        style: { display: 'none' },
        events: {
            change: function (event) {
                void uploadChosen(event, true);
            }
        }
    });
    if (!config.mode)
        root.append(
            createElement('h2', {
                className: 'gpo-editor-scripts__title',
                text: eventLabel(event)
            })
        );
    root.append(modalBody).append(uploadInput).append(replaceInput);

    function ownsHeader() {
        return Boolean(headerControls && headerControls.getAttribute('data-script-owner') === headerOwner);
    }
    function setHeaderState() {
        if (!ownsHeader()) return;
        const editable = Boolean(groupView().editable) && !state.busy && !state.loading && !state.form && !state.picker;
        [createButton, editButton, deleteButton].forEach(function (control, index) {
            if (!control) return;
            control.classList.toggle('active', editable && (index === 0 || Boolean(selectedEntry())));
        });
    }
    function listenHeader(control, handler) {
        if (!control) return;
        control.addEventListener('click', handler);
        headerListeners.push(function () {
            control.removeEventListener('click', handler);
        });
    }
    listenHeader(createButton, function () {
        if (ownsHeader() && createButton.classList.contains('active')) openForm('add');
    });
    listenHeader(editButton, function () {
        if (ownsHeader() && editButton.classList.contains('active')) openForm('edit');
    });
    listenHeader(deleteButton, function () {
        if (ownsHeader() && deleteButton.classList.contains('active')) removeEntry();
    });

    function current() {
        return !state.disposed && (typeof config.isCurrent !== 'function' || config.isCurrent());
    }
    function groupView() {
        return (state.view && state.view[state.group]) || { entries: [], editable: false };
    }
    function entries() {
        return groupView().entries || [];
    }
    function selectedEntry() {
        return (
            entries().find(function (entry) {
                return entry.identity === state.selectedEntry[state.group];
            }) || null
        );
    }
    function assets() {
        return (state.view && state.view.assets) || [];
    }
    function selectedAsset() {
        return (
            assets().find(function (asset) {
                return asset.name === state.selectedAsset;
            }) || null
        );
    }
    function setError(error) {
        state.error = error;
        renderBody();
    }
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
    function syncModalBusy() {
        [state.form, state.picker].forEach(function (modal) {
            if (!modal) return;
            modal.setAttribute('aria-busy', state.busy ? 'true' : 'false');
            Array.prototype.forEach.call(modal.querySelectorAll('input, select, button'), function (control) {
                if (state.busy) {
                    if (!modalDisabledStates.has(control)) {
                        modalDisabledStates.set(control, {
                            disabled: control.disabled,
                            active: control.classList.contains('active')
                        });
                    }
                    control.disabled = true;
                    control.classList.remove('active');
                } else if (modalDisabledStates.has(control)) {
                    const original = modalDisabledStates.get(control);
                    control.disabled = original.disabled;
                    control.classList.toggle('active', original.active);
                    modalDisabledStates.delete(control);
                }
            });
        });
    }
    function closeConfirmation() {
        if (state.confirmation) {
            state.confirmation.close();
            state.confirmation = null;
        }
    }
    function confirm(message, onConfirm) {
        closeConfirmation();
        state.confirmation = open(rootElement, {
            message: message,
            onCancel: function () {
                state.confirmation = null;
            },
            onConfirm: function () {
                state.confirmation = null;
                onConfirm();
            }
        });
    }
    function closeForm(force) {
        if (state.busy && !force) return false;
        closePicker();
        if (state.form) {
            state.formHost.remove();
            state.form = null;
            state.formHost = null;
        }
        state.formState = null;
        if (current()) {
            if (state.formFocus && state.formFocus.isConnected) state.formFocus.focus();
            else if (navigations.entries) navigations.entries.focusSelected();
        }
        state.formFocus = null;
        setHeaderState();
        return true;
    }
    function requestCloseForm() {
        if (state.busy || state.picker) return false;
        if (state.formState && state.formState.dirty()) {
            confirm(st('discardFormConfirm'), function () {
                closeForm(true);
            });
            return false;
        }
        return closeForm();
    }
    const picker = createAssetPicker({ state, assets, current, rootElement, setHeaderState });
    const openPicker = picker.open;
    const closePicker = picker.close;
    const entryForm = createEntryForm({
        config,
        scope,
        state,
        groupView,
        selectedEntry,
        selectedAsset,
        assets,
        rootElement,
        mutate,
        setHeaderState,
        openPicker,
        closeForm,
        requestCloseForm
    });
    const openForm = entryForm.open;
    function removeEntry() {
        const entry = selectedEntry();
        if (!entry || !groupView().editable || state.busy) return;
        const group = state.group;
        const event = state.event;
        confirm(st('removeEntryConfirm'), function () {
            state.removal = {
                group: group,
                before: entries().map(function (row) {
                    return row.identity;
                }),
                removed: [entry.identity]
            };
            void mutate(function () {
                return API.scriptEntryRemove(scope, event, {
                    executable_group: group,
                    identity: entry.identity
                });
            });
        });
    }
    function moveEntry(delta) {
        const group = state.group;
        const rows = entries();
        const index = rows.findIndex(function (entry) {
            return entry.identity === state.selectedEntry[group];
        });
        const target = index + delta;
        if (!groupView().editable || state.busy || index < 0 || target < 0 || target >= rows.length) return;
        const order = rows.map(function (entry) {
            return entry.identity;
        });
        const moved = order[index];
        order[index] = order[target];
        order[target] = moved;
        const snapshot = groupView().snapshot;
        void mutate(function () {
            return API.scriptEntriesReorder(scope, state.event, {
                executable_group: group,
                snapshot: snapshot,
                identities: order
            });
        });
    }
    const { deleteAsset, uploadChosen, downloadAsset } = createAssetActions({
        applyResponse,
        confirm,
        assets,
        config,
        current,
        mutate,
        navigations,
        renderBody,
        scope,
        selectedAsset,
        setError,
        state
    });
    const renderEntries = createEntriesPanel({
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
    });
    const renderAssets = createAssetsPanel({
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
    });
    const { renderOrder, saveOrderDraft } = createOrderPanel({ mutate, scope, state });
    function renderBody() {
        if (!current()) return;
        setHeaderState();
        const slot = modalBody.getElement();
        const activeTable = document.activeElement && document.activeElement.closest('[data-script-list]');
        const heldList =
            activeTable && slot.contains(activeTable) ? activeTable.getAttribute('data-script-list') : null;
        const heldGroupTab =
            slot.contains(document.activeElement) && document.activeElement.getAttribute('data-script-group');
        Object.keys(navigations).forEach(function (kind) {
            navigations[kind].cleanup();
        });
        Object.keys(navigations).forEach(function (key) {
            delete navigations[key];
        });
        slot.textContent = '';
        if (state.loading) {
            slot.appendChild(createElement('div', { className: 'gpo-editor-empty', text: st('loading') }).getElement());
            return;
        }
        if (state.error) {
            slot.appendChild(
                editorStatus
                    .renderError(state.error, {
                        onRefresh: function () {
                            void loadEvent();
                        },
                        onReconcile: function () {
                            void API.reconcile().then(loadEvent, setError);
                        }
                    })
                    .getElement()
            );
        }
        if (!state.view) return;
        if (state.envelope && state.envelope.pending_publication) {
            const pending = renderPending(state.envelope.pending_publication, function () {
                void API.reconcile().then(loadEvent, setError);
            });
            if (pending) slot.appendChild(pending.getElement());
        }
        const diagnostics = groupView().diagnostics || [];
        if (!groupView().editable) {
            slot.appendChild(
                createElement('p', {
                    className: 'gpo-editor-scripts__hint',
                    text: st('readOnlyScripts')
                }).getElement()
            );
        }
        if (diagnostics.length) slot.appendChild(renderDiagnostics(diagnostics).getElement());
        if (state.saveStatus)
            slot.appendChild(
                createElement('p', {
                    className: 'gpo-editor-scripts__save-status',
                    attrs: { role: 'status', 'aria-live': 'polite' },
                    text: state.saveStatus === 'saving' ? st('saving') : state.saveStatus === 'saved' ? st('saved') : ''
                }).getElement()
            );
        if (config.mode !== 'assets') {
            slot.appendChild(
                createElement('div', {
                    className: 'preference__modal-tabs',
                    children: [
                        createElement('div', {
                            className: 'tab-buttons',
                            attrs: { role: 'tablist' },
                            children: GROUPS.map(function (group) {
                                return createElement('button', {
                                    className: ['preference__tab-button', group === state.group ? 'active' : null],
                                    attrs: {
                                        type: 'button',
                                        role: 'tab',
                                        'data-script-group': group,
                                        'aria-selected': group === state.group ? 'true' : 'false'
                                    },
                                    text: st(group),
                                    events: {
                                        click: function () {
                                            state.group = group;
                                            renderBody();
                                        }
                                    }
                                });
                            })
                        }),
                        renderEntries()
                    ]
                }).getElement()
            );
            slot.appendChild(renderOrder().getElement());
            if (config.mode === 'event' && typeof config.openFolder === 'function') {
                slot.appendChild(
                    button(
                        st('showFiles'),
                        config.openFolder,
                        state.busy,
                        'gpo-editor-scripts__show-files'
                    ).getElement()
                );
            }
        }
        if (config.mode !== 'event') slot.appendChild(renderAssets().getElement());
        if (heldGroupTab) {
            const restoredTab = slot.querySelector('[data-script-group="' + heldGroupTab + '"]');
            if (restoredTab) restoredTab.focus({ preventScroll: true });
        } else if (heldList && navigations[heldList]) navigations[heldList].focusSelected();
    }
    function bindTable(table, kind, options) {
        table.getElement().setAttribute('data-script-list', kind);
        navigations[kind] = bind(
            table.getElement(),
            Object.assign({}, options, {
                busy: function () {
                    return (
                        !current() ||
                        state.busy ||
                        state.loading ||
                        Boolean(state.form || state.picker || state.confirmation)
                    );
                }
            })
        );
        return navigations[kind];
    }
    root.hasUnsavedChanges = function () {
        return (
            state.busy ||
            Boolean(state.formState && state.formState.dirty()) ||
            Boolean(state.view && state.orderDraft !== state.view.execution_order)
        );
    };
    root.isBusy = function () {
        return state.busy;
    };
    root.updateResponse = function (response) {
        if (current()) applyResponse(response);
    };
    root.applyChanges = async function () {
        if (state.busy) return false;
        if (state.formState && state.formState.dirty()) {
            if (!(await state.formState.submit())) return false;
        }
        return saveOrderDraft();
    };
    root.cancelChanges = function () {
        if (state.busy) return false;
        closeForm(true);
        if (state.view) state.orderDraft = state.view.execution_order;
        renderBody();
        return true;
    };
    root.cleanup = function () {
        state.disposed = true;
        Object.keys(navigations).forEach(function (kind) {
            navigations[kind].cleanup();
        });
        ++state.requestId;
        closeForm(true);
        closeConfirmation();
        headerListeners.forEach(function (remove) {
            remove();
        });
        if (ownsHeader()) {
            headerControls.style.display = 'none';
            headerControls.removeAttribute('data-script-owner');
            [createButton, editButton, deleteButton].forEach(function (control, index) {
                if (!control) return;
                control.classList.remove('active');
                control.textContent = headerLabels[index];
            });
        }
        if (headerActions && headerActions.getAttribute('data-script-owner') === headerOwner) {
            headerActions.removeAttribute('data-script-owner');
            headerActions.style.display = '';
            if (admxActions) admxActions.style.display = '';
            if (helpSeparator) helpSeparator.style.display = '';
        }
    };
    void loadEvent();
    return root;
}

export { renderScriptEventEditor, EVENTS };
