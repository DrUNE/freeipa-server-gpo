import * as editorDialog from '@gpui/components/editor-dialog';
import { createContext } from '@gpui/components/CollectionEditor/context';
import { buildView } from '@gpui/components/CollectionEditor/view';
import { installValidation } from '@gpui/components/CollectionEditor/validation';
import { installCells } from '@gpui/components/CollectionEditor/cells';
import { installReorder } from '@gpui/components/CollectionEditor/reorder';
import { installTable } from '@gpui/components/CollectionEditor/table';
import { installToolbar } from '@gpui/components/CollectionEditor/toolbar';
import { installKeyboard } from '@gpui/components/CollectionEditor/keyboard';
import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Modal editor of a list or key/value collection parameter. Assembles the focused modules around one shared context
 * (state in `context.js`, markup in `view.js`, behaviour in the `install*` modules) and opens it in an editor dialog.
 * Public hooks: `.gpo-collection-dialog`, `[data-collection-add]`, `[data-collection-remove]`, `[data-collection-row]`,
 * `[data-collection-field]`, `[data-collection-input]`, `[data-collection-mode]`.
 * @param {HTMLElement} host
 * @param {{ parameter: any, value: any, readOnly?: boolean, onAccept: (value: any) => void, onClose?: () => void }} options
 */
export function openCollectionEditor(host, options) {
    const ctx = createContext(options);
    const { state, readOnly, els } = ctx;
    buildView(ctx);
    installValidation(ctx);
    installCells(ctx);
    installReorder(ctx);
    installTable(ctx);
    installToolbar(ctx);
    installKeyboard(ctx);
    ctx.render();
    const dialog = editorDialog.open(host, {
        title: options.parameter.label || options.parameter.id,
        className: ['gpo-collection-dialog'],
        width: '640px',
        fill: true,
        content: els.content,
        readOnly: readOnly,
        cancelLabel: tr(readOnly ? 'close' : 'cancel'),
        isDirty: function () {
            return !readOnly && state.isDirty(ctx.pending());
        },
        onApply: function () {
            ctx.finishEdit(true);
            const problems = ctx.updateValidation();
            if (problems.length) {
                if (problems[0].id) ctx.focusCell(problems[0].id, problems[0].field);
                else els.add.focus();
                return false;
            }
            options.onAccept(state.read());
            return true;
        },
        onClose: function () {
            ctx.clearDrag();
            ctx.editing = null;
            if (options.onClose) options.onClose();
        }
    });
    ctx.dialog = dialog;
    ctx.updateValidation();
    dialog.isDirty = function () {
        return !readOnly && state.isDirty(ctx.pending());
    };
    return dialog;
}
