import { createElement, ElementCreator } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { renderError } from '@gpui/components/editor-status';
import { open } from '@gpui/components/confirmation-dialog';
import { trapTab } from '@gpui/components/editor-dialog';
import * as editorDialog from '@gpui/components/editor-dialog';
import { bind } from '@gpui/components/list-navigation';
import { scriptEvent } from '@gpui/core/editor-icons';
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
    fileBase64,
    saveDownloadedAsset,
    nextHeaderOwner
} from '@gpui/components/templates/script/helpers';

import { renderScriptEventEditor, EVENTS } from '@gpui/components/templates/script/event-editor';

const wrap = ElementCreator.wrap;

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
    const headerOwner = nextHeaderOwner();
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
