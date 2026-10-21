import { createElement, ElementCreator } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { t } from '@gpui/locales/translations';
import { renderPending, renderError, renderDiagnostics } from '@gpui/components/editor-status';
import * as editorStatus from '@gpui/components/editor-status';
import { open } from '@gpui/components/confirmation-dialog';
import { trapTab } from '@gpui/components/editor-dialog';
import * as editorDialog from '@gpui/components/editor-dialog';
import { bind } from '@gpui/components/list-navigation';
import * as listNavigation from '@gpui/components/list-navigation';
import { scriptEvent, scriptFile } from '@gpui/components/editor-icons';
import {
    createBody,
    createButton as createDialogButton,
    createCloseButton,
    createDialogShell
} from '@gpui/components/Dialog/Dialog';
import {
    st,
    eventLabel,
    button,
    nameCell,
    assetIcon,
    fileBase64,
    saveDownloadedAsset
} from '@gpui/components/templates/script/helpers';

const wrap = ElementCreator.wrap;
let nextHeaderOwnerId = 1;
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
    let navigations = {},
        pickerNavigation = null;
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
    const headerOwner = 'scripts-' + nextHeaderOwnerId++;
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
    function closePicker() {
        if (pickerNavigation) {
            pickerNavigation.cleanup();
            pickerNavigation = null;
        }
        if (state.picker) {
            state.picker.remove();
            state.picker = null;
        }
        if (state.pickerOverlay) {
            state.pickerOverlay.remove();
            state.pickerOverlay = null;
        }
        if (state.pickerFocus && state.pickerFocus.isConnected) state.pickerFocus.focus();
        state.pickerFocus = null;
        setHeaderState();
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
    function openPicker(initialName, onSelect) {
        if (state.busy || state.picker) return;
        state.pickerFocus = document.activeElement;
        let chosen = assets().some(function (asset) {
            return asset.name === initialName;
        })
            ? initialName
            : null;
        const selectButton = button(
            st('selectFile'),
            function () {
                choose();
            },
            !chosen,
            'btn-ok'
        );
        selectButton.addClass('gpo-editor-scripts__picker-select');
        const rows = assets().map(function (asset) {
            const row = createElement('tr', {
                className: asset.name === chosen ? 'active' : null,
                attrs: { tabindex: '-1', 'data-script-asset': asset.name },
                children: [
                    nameCell(asset.name, assetIcon(asset.name)),
                    createElement('td', { text: String(asset.byte_size) + ' ' + st('bytes') })
                ]
            });
            function select() {
                chosen = asset.name;
                Array.prototype.forEach.call(table.getElement().querySelectorAll('tbody tr'), function (candidate) {
                    candidate.classList.toggle('active', candidate === row.getElement());
                });
                selectButton.getElement().disabled = false;
                selectButton.addClass('active');
                if (pickerNavigation) pickerNavigation.sync();
            }
            row.getElement().__select = select;
            row.on('click', function () {
                select();
                if (pickerNavigation) pickerNavigation.focusSelected();
            });
            row.on('dblclick', function () {
                select();
                choose();
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
                                createElement('th', { text: st('columnName') }),
                                createElement('th', { text: st('columnSize') })
                            ]
                        })
                    ]
                }),
                createElement('tbody', { children: rows })
            ]
        });
        function choose() {
            if (!chosen || state.busy) return;
            closePicker();
            onSelect(chosen);
        }
        const pickerContent = assets().length
            ? table
            : createElement('div', { className: 'gpo-editor-empty', text: st('emptyAssets') });
        const cancelButton = wrap(createDialogButton('cancel', t('header.cancel')));
        cancelButton.on('click', closePicker);
        const closeButton = wrap(createCloseButton(st('close')));
        closeButton.on('click', closePicker);
        const shell = createDialogShell({
            titleId: 'gpo-editor-scripts-picker-title',
            title: st('browseFiles'),
            body: createBody(pickerContent.getElement()),
            closeButton: closeButton.getElement(),
            buttons: [cancelButton.getElement(), selectButton.getElement()],
            className: 'gpo-editor-scripts__picker',
            hostClassName: 'gpo-editor-scripts__picker-overlay'
        });
        const picker = wrap(shell.dialog);
        shell.dialog.setAttribute('aria-label', st('browseFiles'));
        shell.host.addEventListener('click', function (event) {
            if (event.target === shell.host) closePicker();
        });
        picker.on('keydown', function (event) {
            if (
                event.defaultPrevented ||
                event.target.closest('[role="dialog"], [role="alertdialog"]') !== shell.dialog
            )
                return;
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closePicker();
            }
            trapTab(event, shell.dialog);
        });
        rootElement.appendChild(shell.host);
        state.pickerOverlay = shell.host;
        state.picker = shell.dialog;
        pickerNavigation = bind(table.getElement(), {
            rows: function () {
                return Array.from(table.getElement().querySelectorAll('[data-script-asset]'));
            },
            selected: function () {
                return (
                    Array.from(table.getElement().querySelectorAll('[data-script-asset]')).find(function (row) {
                        return row.getAttribute('data-script-asset') === chosen;
                    }) || null
                );
            },
            select: function (row) {
                row.__select();
            },
            activate: choose,
            busy: function () {
                return state.busy || !current();
            }
        });
        setHeaderState();
        if (chosen && rows.length)
            rows.find(function (row) {
                return row.getElement().classList.contains('active');
            })
                .getElement()
                .focus();
        else picker.getElement().querySelector('.btn-cancel').focus();
    }
    function openForm(kind) {
        if (state.busy || state.loading || !groupView().editable) return;
        const entry = kind === 'edit' ? selectedEntry() : null;
        if (kind === 'edit' && !entry) return;
        if (kind === 'select' && !selectedAsset()) return;
        closeForm();
        state.formFocus = document.activeElement;
        const isEdit = kind === 'edit';
        const modern = Boolean(config.mode);
        const sourceSelect = createElement('select', {
            children: [
                createElement('option', { attrs: { value: 'existing_asset' }, text: st('existingAsset') }),
                createElement('option', { attrs: { value: 'external_command' }, text: st('externalCommand') })
            ]
        });
        sourceSelect.getElement().value = entry
            ? entry.managed_asset_name
                ? 'existing_asset'
                : 'external_command'
            : kind === 'select' || assets().length
              ? 'existing_asset'
              : 'external_command';
        const assetInput = createElement('input', {
            attrs: {
                type: 'text',
                readonly: 'readonly',
                value:
                    (entry && entry.managed_asset_name) ||
                    (kind === 'select' && selectedAsset() && selectedAsset().name) ||
                    ''
            }
        });
        const browseButton = button(
            config.mode ? '…' : st('browseFiles'),
            function () {
                const input = modern ? commandInput : assetInput;
                openPicker(input.getElement().value, function (name) {
                    input.getElement().value = name;
                    markDirty();
                    browseButton.getElement().focus();
                });
            },
            false,
            config.mode ? 'gpo-editor-scripts__ellipsis' : 'gpo-editor-scripts__browse'
        );
        if (config.mode) {
            browseButton.getElement().setAttribute('aria-label', st('selectFromSysvol'));
            browseButton.getElement().title = st('selectFromSysvol');
        }
        const commandInput = createElement('input', {
            attrs: {
                type: 'text',
                value: entry ? entry.command_line : '',
                placeholder: modern ? st('externalCommand') : null
            }
        });
        const parametersInput = createElement('input', {
            attrs: { type: 'text', value: entry ? entry.parameters : '' }
        });
        const assetRow = field(
            st('nameLabel'),
            createElement('div', {
                className: 'gpo-editor-scripts__asset-field',
                children: [modern ? commandInput : assetInput, browseButton]
            })
        );
        const commandRow = modern ? null : field(st('nameLabel'), commandInput);
        const formError = createElement('div', { className: 'gpo-editor-scripts__form-error' });
        function values() {
            if (modern) return [commandInput.getElement().value, parametersInput.getElement().value];
            return [
                sourceSelect.getElement().value,
                assetInput.getElement().value,
                commandInput.getElement().value,
                parametersInput.getElement().value
            ];
        }
        const initialValues = JSON.stringify(values());
        function markDirty() {
            setHeaderState();
        }
        function syncSource() {
            if (modern) return;
            const existing = sourceSelect.getElement().value === 'existing_asset';
            assetRow.getElement().hidden = !existing;
            commandRow.getElement().hidden = existing;
            markDirty();
        }
        sourceSelect.on('change', syncSource);
        commandInput.on('input', markDirty);
        parametersInput.on('input', markDirty);
        const formBody = wrap(createBody(null));
        (modern
            ? [assetRow, field(st('argumentsLabel'), parametersInput), formError]
            : [
                  field(st('sourceLabel'), sourceSelect),
                  assetRow,
                  commandRow,
                  field(st('argumentsLabel'), parametersInput),
                  formError
              ]
        ).forEach(function (child) {
            formBody.append(child);
        });
        const formCancel = wrap(createDialogButton('cancel', t('header.cancel')));
        formCancel.on('click', requestCloseForm);
        const formApply = wrap(createDialogButton('apply', t('header.apply')));
        formApply.on('click', function () {
            void submit();
        });
        const formClose = wrap(createCloseButton(st('close')));
        formClose.on('click', requestCloseForm);
        const shell = createDialogShell({
            titleId: 'gpo-editor-scripts-form-title',
            title: st(isEdit ? 'editTitle' : 'addTitle'),
            body: formBody.getElement(),
            closeButton: formClose.getElement(),
            buttons: [formCancel.getElement(), formApply.getElement()],
            className: 'gpo-editor-scripts__form'
        });
        const form = wrap(shell.dialog);
        shell.host.addEventListener('click', function (event) {
            if (event.target === shell.host) requestCloseForm();
        });
        form.on('keydown', function (event) {
            if (
                event.defaultPrevented ||
                event.target.closest('[role="dialog"], [role="alertdialog"]') !== shell.dialog
            )
                return;
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                requestCloseForm();
            }
            trapTab(event, shell.dialog);
        });
        async function submit() {
            if (state.busy) return false;
            formError.setText('');
            const command = modern
                ? commandInput.getElement().value.trim()
                : sourceSelect.getElement().value === 'existing_asset'
                  ? assetInput.getElement().value
                  : commandInput.getElement().value.trim();
            const matchedAsset =
                modern &&
                assets().find(function (asset) {
                    return asset.name.toLowerCase() === command.toLowerCase();
                });
            const source = modern
                ? matchedAsset
                    ? 'existing_asset'
                    : 'external_command'
                : sourceSelect.getElement().value;
            const name = modern && matchedAsset ? matchedAsset.name : assetInput.getElement().value;
            if (
                !modern &&
                source === 'existing_asset' &&
                !assets().some(function (asset) {
                    return asset.name === name;
                })
            ) {
                formError.setText(st('chooseFile'));
                return false;
            }
            if (!command) {
                formError.setText(st('chooseCommand'));
                return false;
            }
            const parameters = parametersInput.getElement().value.trim();
            const group = state.group;
            const event = state.event;
            const snapshot = groupView().snapshot;
            const ok = await mutate(function () {
                if (isEdit)
                    return API.scriptEntryUpdate(scope, event, {
                        executable_group: group,
                        identity: entry.identity,
                        command_line: command,
                        parameters: parameters
                    });
                const request = {
                    mode: source,
                    executable_group: group,
                    snapshot: snapshot,
                    parameters: parameters
                };
                if (source === 'existing_asset') request.name = name;
                else request.command_line = command;
                return API.scriptEntryAdd(scope, event, request);
            }, formError.getElement());
            if (ok) closeForm(true);
            return ok;
        }
        rootElement.appendChild(shell.host);
        state.formHost = shell.host;
        state.form = shell.dialog;
        state.formState = {
            dirty: function () {
                return JSON.stringify(values()) !== initialValues;
            },
            submit: submit
        };
        syncSource();
        setHeaderState();
        (modern ? commandInput : sourceSelect).getElement().focus();
    }
    function field(label, input) {
        return createElement('div', {
            className: 'gpo-editor-field',
            children: [createElement('div', { className: 'gpo-editor-field__label', text: label }), input]
        });
    }
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
    async function uploadChosen(event, replace) {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file || state.busy || !state.view) return;
        const asset = replace ? selectedAsset() : null;
        if (replace && !asset) return;
        if (file.size > state.view.upload_limit_bytes) {
            setError({ category: 'size_limit', message: st('uploadTooLarge') });
            return;
        }
        async function upload() {
            try {
                const content = await fileBase64(file);
                if (!current() || !state.event) return;
                await mutate(function () {
                    return replace
                        ? API.scriptAssetReplace(scope, state.event, {
                              name: asset.name,
                              revision: asset.revision,
                              content_base64: content
                          })
                        : API.scriptAssetUpload(scope, state.event, {
                              name: file.name,
                              content_base64: content
                          });
                });
            } catch (error) {
                if (current()) setError(error);
            }
        }
        if (replace)
            confirm(st('replaceFileConfirm'), function () {
                void upload();
            });
        else await upload();
    }
    function deleteAsset() {
        const selected =
            config.mode === 'assets'
                ? assets().filter(function (asset) {
                      return state.selectedAssets.has(asset.name);
                  })
                : [selectedAsset()].filter(Boolean);
        if (!selected.length || state.busy) return;
        if (
            selected.some(function (asset) {
                return asset.references && asset.references.length;
            })
        ) {
            setError({ category: 'validation', message: st('fileInUse') });
            return;
        }
        const event = state.event;
        confirm(st(selected.length > 1 ? 'deleteSelectedFilesConfirm' : 'deleteFileConfirm'), function () {
            state.removal = {
                assets: true,
                before: assets().map(function (asset) {
                    return asset.name;
                }),
                removed: selected.map(function (asset) {
                    return asset.name;
                })
            };
            void mutate(async function () {
                let response = null;
                try {
                    for (let index = 0; index < selected.length; index++) {
                        response = await API.scriptAssetDelete(scope, event, {
                            name: selected[index].name,
                            revision: selected[index].revision
                        });
                    }
                    return response;
                } catch (error) {
                    if (response) {
                        applyResponse(response);
                        if (typeof config.onSaved === 'function') config.onSaved(response);
                    }
                    throw error;
                }
            });
        });
    }
    async function downloadAsset() {
        const asset = selectedAsset();
        if (!asset || state.busy) return;
        state.busy = true;
        renderBody();
        try {
            const response = await API.scriptAssetDownload(scope, state.event, {
                name: asset.name,
                revision: asset.revision
            });
            if (current()) saveDownloadedAsset(response && response.asset);
        } catch (error) {
            if (current()) setError(error);
        } finally {
            state.busy = false;
            if (current()) {
                renderBody();
                if (document.activeElement === document.body && navigations.assets) navigations.assets.focusSelected();
            }
        }
    }
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
    function renderOrder() {
        const select = createElement('select', {
            children: [
                createElement('option', { attrs: { value: 'unspecified' }, text: st('orderUnspecified') }),
                createElement('option', { attrs: { value: 'classic_first' }, text: st('orderClassicFirst') }),
                createElement('option', { attrs: { value: 'powershell_first' }, text: st('orderPowershellFirst') })
            ]
        });
        select.getElement().value = state.orderDraft || state.view.execution_order || 'unspecified';
        const canApply =
            !state.busy && Boolean(state.view.powershell.editable) && state.orderDraft !== state.view.execution_order;
        const apply = button(
            st('applyOrder'),
            function () {
                void saveOrderDraft();
            },
            !canApply
        );
        select.on('change', function () {
            state.orderDraft = select.getElement().value;
            const available =
                !state.busy && state.view.powershell.editable && state.orderDraft !== state.view.execution_order;
            apply.getElement().disabled = !available;
            apply.getElement().classList.toggle('active', available);
        });
        select.getElement().disabled = state.busy || !state.view.powershell.editable;
        return createElement('div', {
            className: 'gpo-editor-scripts__order',
            children: [createElement('label', { text: st('psOrderLabel') }), select, apply]
        });
    }
    function saveOrderDraft() {
        if (
            !state.view ||
            state.busy ||
            !state.view.powershell.editable ||
            state.orderDraft === state.view.execution_order
        )
            return Promise.resolve(true);
        const snapshot = state.view.powershell.snapshot;
        const order = state.orderDraft;
        return mutate(function () {
            return API.scriptOrderUpdate(scope, state.event, {
                snapshot: snapshot,
                execution_order: order
            });
        });
    }
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
        navigations = {};
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

function renderScriptsTemplate(options) {
    const config = options || {};
    // Existing event links can still be opened while navigation migrates to one Scripts leaf.
    if (config.item && config.item.event) return renderScriptEventEditor(config);

    const scope = config.item && config.item.scope === 'user' ? 'user' : 'computer';
    const events = EVENTS[scope];
    const state = {
        selectedEvent:
            events.indexOf(config.item && config.item.scriptEvent) !== -1 ? config.item.scriptEvent : events[0],
        summaries: {},
        errors: {},
        generations: {},
        modal: null,
        confirmation: null,
        disposed: false
    };
    let overviewNavigation = null;
    const root = createElement('div', { className: ['gp__scripts', 'gp__preference', 'gpo-editor-scripts'] });
    const rootElement = root.getElement();
    const overview = createElement('div', { className: ['preference__data-table', 'gpo-editor-scripts__overview'] });
    if (!config.hideHeading)
        root.append(
            createElement('h2', {
                className: 'gpo-editor-scripts__title',
                text: config.categoryPath || st('scripts'),
                attrs: { 'data-category-path': '' }
            })
        );
    root.append(overview);

    const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
    const headerControls = headerElement && headerElement.querySelector('.gp__control');
    const headerActions = headerElement && headerElement.querySelector('.gp__control-actions');
    const admxActions = headerElement && headerElement.querySelector('.gp__control-admx');
    const helpSeparator = headerElement && headerElement.querySelector('.gp__control-separator');
    const createButton = headerControls && headerControls.querySelector('.preferences__btn-create');
    const editButton = headerControls && headerControls.querySelector('.preferences__btn-edit');
    const deleteButton = headerControls && headerControls.querySelector('.preferences__btn-delete');
    const headerOwner = 'scripts-' + nextHeaderOwnerId++;
    const oldHeader = [createButton, editButton, deleteButton].map(function (control) {
        return control
            ? {
                  text: control.textContent,
                  display: control.style.display,
                  disabled: control.disabled,
                  active: control.classList.contains('active')
              }
            : null;
    });
    const folderButton = button(
        st('openFolder'),
        function () {
            openModal('assets');
        },
        false
    );
    folderButton.addClass('gpo-editor-scripts__folder-button');
    if (headerControls) {
        headerControls.setAttribute('data-script-owner', headerOwner);
        headerControls.style.display = 'flex';
        if (createButton) createButton.style.display = 'none';
        if (deleteButton) deleteButton.style.display = 'none';
        if (editButton) {
            editButton.textContent = st('openEvent');
            editButton.classList.add('active');
            editButton.addEventListener('click', onOpenEvent);
        }
        headerControls.appendChild(folderButton.getElement());
    }
    if (headerActions) {
        headerActions.setAttribute('data-script-owner', headerOwner);
        headerActions.style.display = 'flex';
    }
    if (admxActions) admxActions.style.display = 'none';
    if (helpSeparator) helpSeparator.style.display = 'none';

    function current() {
        return !state.disposed && (typeof config.isCurrent !== 'function' || config.isCurrent());
    }
    function ownsHeader() {
        return Boolean(headerControls && headerControls.getAttribute('data-script-owner') === headerOwner);
    }
    function updateHeader() {
        if (!ownsHeader()) return;
        const enabled = !state.modal;
        if (editButton) {
            editButton.disabled = !enabled;
            editButton.classList.toggle('active', enabled);
        }
        folderButton.getElement().disabled = !enabled;
        folderButton.getElement().classList.toggle('active', enabled);
    }
    function refreshEvent(event) {
        const generation = (state.generations[event] || 0) + 1;
        state.generations[event] = generation;
        return API.scriptsShow(scope, event).then(
            function (response) {
                if (!current() || state.generations[event] !== generation) return;
                state.summaries[event] = (response && response.scripts) || null;
                delete state.errors[event];
                renderOverview();
            },
            function (error) {
                if (!current() || state.generations[event] !== generation) return;
                state.errors[event] = error;
                renderOverview();
            }
        );
    }
    function renderOverview() {
        if (!current()) return;
        const heldFocus = overview.getElement().contains(document.activeElement);
        if (overviewNavigation) overviewNavigation.cleanup();
        function selectRow(row, event) {
            state.selectedEvent = event;
            Array.prototype.forEach.call(table.getElement().querySelectorAll('tbody tr'), function (candidate) {
                candidate.classList.toggle('active', candidate === row.getElement());
            });
            renderOverviewError();
            if (overviewNavigation) overviewNavigation.sync();
        }
        const table = createElement('table', {
            className: ['preference__table', 'gpo-catalog-table', 'gpo-editor-scripts__event-table'],
            children: [
                createElement('thead', {
                    children: [
                        createElement('tr', {
                            children: [
                                createElement('th', { text: st('eventColumn') }),
                                createElement('th', { text: st('scriptsColumn') }),
                                createElement('th', { text: st('powershellColumn') })
                            ]
                        })
                    ]
                }),
                createElement('tbody', {
                    children: events.map(function (event) {
                        const view = state.summaries[event];
                        const row = createElement('tr', {
                            className: event === state.selectedEvent ? 'active' : null,
                            attrs: { tabindex: '-1', 'data-script-event': event },
                            children: [
                                nameCell(eventLabel(event), scriptEvent(event)),
                                createElement('td', { text: view ? String(view.classic.entries.length) : '—' }),
                                createElement('td', { text: view ? String(view.powershell.entries.length) : '—' })
                            ]
                        });
                        row.getElement().__select = function () {
                            selectRow(row, event);
                        };
                        row.on('click', function () {
                            selectRow(row, event);
                            overviewNavigation.focusSelected();
                        });
                        row.on('dblclick', function () {
                            if (!state.modal) {
                                selectRow(row, event);
                                openModal('event');
                            }
                        });
                        return row;
                    })
                })
            ]
        });
        const slot = overview.getElement();
        slot.replaceChildren(table.getElement());
        overviewNavigation = bind(table.getElement(), {
            rows: function () {
                return Array.from(table.getElement().querySelectorAll('[data-script-event]'));
            },
            selected: function () {
                return (
                    Array.from(table.getElement().querySelectorAll('[data-script-event]')).find(function (row) {
                        return row.getAttribute('data-script-event') === state.selectedEvent;
                    }) || null
                );
            },
            select: function (row) {
                row.__select();
            },
            activate: function () {
                openModal('event');
            },
            busy: function () {
                return !current() || Boolean(state.modal);
            }
        });
        renderOverviewError();
        if (heldFocus) overviewNavigation.focusSelected();
    }
    function renderOverviewError() {
        const slot = overview.getElement();
        const prior = slot.querySelector('.gpo-editor-scripts__overview-error');
        if (prior) prior.remove();
        if (state.errors[state.selectedEvent]) {
            const error = createElement('div', { className: 'gpo-editor-scripts__overview-error' });
            error.append(
                renderError(state.errors[state.selectedEvent], {
                    onRefresh: function () {
                        void refreshEvent(state.selectedEvent);
                    }
                })
            );
            slot.appendChild(error.getElement());
        }
    }
    function onOpenEvent() {
        if (ownsHeader() && !state.modal) openModal('event');
    }
    function closeModal(force, afterClose) {
        const active = state.modal;
        if (!active || (active.detail && active.detail.isBusy())) return false;
        if (!force && active.detail && active.detail.hasUnsavedChanges()) {
            if (!state.confirmation)
                state.confirmation = open(rootElement, {
                    message: st('discardFormConfirm'),
                    onCancel: function () {
                        state.confirmation = null;
                    },
                    onConfirm: function () {
                        state.confirmation = null;
                        closeModal(true, afterClose);
                    }
                });
            return false;
        }
        if (active.detail) active.detail.cleanup();
        active.dialog.remove();
        active.overlay.remove();
        state.modal = null;
        updateHeader();
        void refreshEvent(active.event);
        if (current()) {
            if (active.previousFocus && active.previousFocus.isConnected) active.previousFocus.focus();
            else if (overviewNavigation) overviewNavigation.focusSelected();
        }
        if (typeof afterClose === 'function') afterClose();
        return true;
    }
    function openModal(mode) {
        if (!current() || state.modal) return;
        const event = state.selectedEvent;
        const previousFocus = document.activeElement;
        const host = createElement('div', { className: 'gpo-editor-scripts__detail-host' });
        const title =
            mode === 'assets' ? st('folderForEvent').replace('{event}', eventLabel(event)) : eventLabel(event);
        const detailBody = createBody(null);
        detailBody.append(host.getElement());
        const closeAction = wrap(createDialogButton('cancel', st('closeDialog')));
        closeAction.on('click', function () {
            closeModal();
        });
        const closeX = wrap(createCloseButton(st('close')));
        closeX.on('click', function () {
            closeModal();
        });
        const shell = createDialogShell({
            titleId: 'gpo-editor-scripts-modal-title',
            title: title,
            body: detailBody,
            closeButton: closeX.getElement(),
            buttons: [closeAction.getElement()],
            width: mode === 'assets' ? 'min(620px, calc(100vw - 32px))' : 'min(600px, calc(100vw - 32px))',
            className: mode === 'assets' ? 'gpo-editor-scripts__explorer' : 'gpo-editor-scripts__event-dialog'
        });
        const dialog = wrap(shell.dialog);
        shell.host.addEventListener('click', function (clickEvent) {
            if (clickEvent.target === shell.host) closeModal();
        });
        dialog.on('keydown', function (keyEvent) {
            if (
                keyEvent.defaultPrevented ||
                keyEvent.target.closest('[role="dialog"], [role="alertdialog"]') !== shell.dialog
            )
                return;
            if (keyEvent.key === 'Escape') {
                keyEvent.preventDefault();
                keyEvent.stopPropagation();
                closeModal();
            }
            trapTab(keyEvent, shell.dialog);
        });
        rootElement.appendChild(shell.host);
        state.modal = {
            mode: mode,
            event: event,
            detail: null,
            dialog: dialog.getElement(),
            overlay: shell.host,
            previousFocus: previousFocus
        };
        updateHeader();
        mountDetail();
        dialog.getElement().querySelector('.btn-cancel').focus();

        function mountDetail() {
            const active = state.modal;
            if (!active || active.dialog !== dialog.getElement()) return;
            if (active.detail) active.detail.cleanup();
            active.detail = renderScriptEventEditor({
                item: { scope: scope, event: event },
                mode: mode,
                isCurrent: function () {
                    return current() && state.modal === active;
                },
                openFolder: function () {
                    closeModal(false, function () {
                        openModal('assets');
                    });
                }
            });
            host.getElement().replaceChildren(active.detail.getElement());
            renderOverview();
        }
    }
    root.hasUnsavedChanges = function () {
        return Boolean(state.modal && state.modal.detail && state.modal.detail.hasUnsavedChanges());
    };
    root.applyChanges = function () {
        return state.modal && state.modal.detail ? state.modal.detail.applyChanges() : Promise.resolve(true);
    };
    root.cancelChanges = function () {
        if (state.modal && state.modal.detail && state.modal.detail.isBusy()) return false;
        if (state.modal) closeModal(true);
        return true;
    };
    root.cleanup = function () {
        state.disposed = true;
        if (overviewNavigation) overviewNavigation.cleanup();
        if (state.confirmation) {
            state.confirmation.close();
            state.confirmation = null;
        }
        if (state.modal && state.modal.detail) state.modal.detail.cleanup();
        if (state.modal) {
            state.modal.dialog.remove();
            state.modal.overlay.remove();
            state.modal = null;
        }
        if (ownsHeader()) {
            editButton && editButton.removeEventListener('click', onOpenEvent);
            folderButton.getElement().remove();
            [createButton, editButton, deleteButton].forEach(function (control, index) {
                if (!control) return;
                control.textContent = oldHeader[index].text;
                control.style.display = oldHeader[index].display;
                control.disabled = oldHeader[index].disabled;
                control.classList.toggle('active', oldHeader[index].active);
            });
            headerControls.removeAttribute('data-script-owner');
            headerControls.style.display = 'none';
        }
        if (headerActions && headerActions.getAttribute('data-script-owner') === headerOwner) {
            headerActions.removeAttribute('data-script-owner');
            headerActions.style.display = '';
            if (admxActions) admxActions.style.display = '';
            if (helpSeparator) helpSeparator.style.display = '';
        }
    };
    root.onMounted = function () {
        if (config.item && config.item.openPolicyDialog && current()) openModal('event');
    };
    renderOverview();
    events.forEach(function (event) {
        void refreshEvent(event);
    });
    return root;
}

function openScriptsDialog(host, options) {
    const config = options || {};
    const item = config.item || {};
    const scope = item.scope === 'user' ? 'user' : 'computer';
    let event = item.scriptEvent || item.event;
    if (EVENTS[scope].indexOf(event) === -1) event = EVENTS[scope][0];
    let closed = false;
    let explorer = null;
    const detailHost = createElement('div', { className: 'gpo-editor-scripts__detail-host' });
    const editor = renderScriptEventEditor({
        item: { scope: scope, event: event },
        mode: 'event',
        isCurrent: current,
        onSaved: config.onSaved,
        openFolder: openFolder
    });
    detailHost.append(editor);
    const dialog = editorDialog.open(host, {
        title: eventLabel(event),
        className: ['gpo-editor-scripts__event-dialog'],
        width: 'min(600px, calc(100vw - 32px))',
        hostClassName: ['gpo-editor-scripts'],
        content: detailHost,
        readOnly: true,
        cancelLabel: st('closeDialog'),
        closeLabel: st('close'),
        canClose: function () {
            return !editor.isBusy() && !explorer;
        },
        isDirty: editor.hasUnsavedChanges,
        discardMessage: st('discardFormConfirm'),
        onClose: function () {
            cleanup();
            if (config.onClose) config.onClose();
        },
        restoreFocus: config.restoreFocus
    });

    function current() {
        return !closed && (typeof config.isCurrent !== 'function' || config.isCurrent());
    }
    function openFolder() {
        if (!current() || explorer || editor.isBusy()) return;
        const filesHost = createElement('div', { className: 'gpo-editor-scripts__detail-host' });
        const files = renderScriptEventEditor({
            item: { scope: scope, event: event },
            mode: 'assets',
            isCurrent: function () {
                return current() && Boolean(explorer);
            },
            onSaved: function (response) {
                editor.updateResponse(response);
                if (typeof config.onSaved === 'function') config.onSaved(response);
            }
        });
        filesHost.append(files);
        dialog.root.getElement().inert = true;
        const filesDialog = editorDialog.open(host, {
            title: st('folderForEvent').replace('{event}', eventLabel(event)),
            className: ['gpo-editor-scripts__explorer'],
            width: 'min(620px, calc(100vw - 32px))',
            hostClassName: ['gpo-editor-scripts'],
            content: filesHost,
            readOnly: true,
            cancelLabel: st('closeDialog'),
            closeLabel: st('close'),
            canClose: function () {
                return !files.isBusy();
            },
            isDirty: files.hasUnsavedChanges,
            onClose: function () {
                files.cleanup();
                explorer = null;
                if (!closed) dialog.root.getElement().inert = false;
            }
        });
        explorer = { editor: files, dialog: filesDialog };
    }
    function cleanup() {
        if (closed) return;
        closed = true;
        if (explorer) explorer.dialog.close();
        editor.cleanup();
    }
    // The All Policies controller owns one lifecycle even while the files
    // explorer is temporarily displayed above the selected script event.
    const controller = {
        hasUnsavedChanges: function () {
            return editor.hasUnsavedChanges() || Boolean(explorer && explorer.editor.hasUnsavedChanges());
        },
        isBusy: function () {
            return editor.isBusy() || Boolean(explorer && explorer.editor.isBusy());
        },
        applyChanges: async function () {
            if (explorer && !(await explorer.editor.applyChanges())) return false;
            return editor.applyChanges();
        },
        cancelChanges: function () {
            if (editor.isBusy() || (explorer && explorer.editor.isBusy())) return false;
            if (explorer) explorer.dialog.close();
            return editor.cancelChanges();
        },
        cleanup: cleanup,
        getElement: function () {
            return editor.getElement();
        }
    };
    return { editor: controller, dialog: dialog };
}

const _test = { fileBase64: fileBase64, saveDownloadedAsset: saveDownloadedAsset };

export { renderScriptsTemplate, openScriptsDialog, _test };
