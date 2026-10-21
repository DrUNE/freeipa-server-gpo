import { createElement, ElementCreator } from '@gpui/util/element-creator';
import * as API from '@gpui/util/API';
import { t } from '@gpui/locales/translations';
import { trapTab } from '@gpui/components/editor-dialog';
import {
    createBody,
    createButton as createDialogButton,
    createCloseButton,
    createDialogShell
} from '@gpui/components/Dialog/Dialog';
import { st, button } from '@gpui/components/templates/script/helpers';

const wrap = ElementCreator.wrap;

/**
 * The add/edit dialog of one script entry.
 * @param {any} context the editor's state and operations (see renderScriptEventEditor)
 */
function createEntryForm({
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
}) {
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

    return { open: openForm };
}

export { createEntryForm };
