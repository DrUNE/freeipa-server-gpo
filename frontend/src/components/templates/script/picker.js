import { createElement, ElementCreator } from '@gpui/util/element-creator';
import { t } from '@gpui/locales/translations';
import { trapTab } from '@gpui/components/editor-dialog';
import { bind } from '@gpui/components/list-navigation';
import {
    createBody,
    createButton as createDialogButton,
    createCloseButton,
    createDialogShell
} from '@gpui/components/Dialog/Dialog';
import { st, button, nameCell, assetIcon } from '@gpui/components/templates/script/helpers';

const wrap = ElementCreator.wrap;

/**
 * The SYSVOL file picker of the script form: a dialog over the form that lists the event's files.
 * @param {{ state: any, assets: () => any[], current: () => boolean, rootElement: HTMLElement, setHeaderState: () => void }} context
 */
function createAssetPicker({ state, assets, current, rootElement, setHeaderState }) {
    function closePicker() {
        if (state.pickerNavigation) {
            state.pickerNavigation.cleanup();
            state.pickerNavigation = null;
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
                if (state.pickerNavigation) state.pickerNavigation.sync();
            }
            row.getElement().__select = select;
            row.on('click', function () {
                select();
                if (state.pickerNavigation) state.pickerNavigation.focusSelected();
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
        state.pickerNavigation = bind(table.getElement(), {
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

    return { open: openPicker, close: closePicker };
}

export { createAssetPicker };
