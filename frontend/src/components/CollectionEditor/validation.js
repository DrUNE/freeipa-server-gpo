import { h } from '@gpui/lib/dom';
import { tr } from '@gpui/components/CollectionEditor/translate';

/**
 * Validation line, per-cell errors, counters and the pending (not yet committed) cell edit.
 * Attaches `pending`, `busy`, `announce`, `updateValidation` to the context.
 * @param {any} ctx
 */
export function installValidation(ctx) {
    const { state, readOnly, prefix, els } = ctx;
    ctx.pending = function () {
        const editing = ctx.editing;
        return editing ? { id: editing.id, field: editing.field, value: editing.input.value } : null;
    };
    ctx.busy = function () {
        const dialog = ctx.dialog;
        return Boolean(dialog && (dialog.isBusy() || dialog.root.getElement().inert));
    };
    ctx.announce = function (text) {
        els.live.textContent = text;
    };
    ctx.updateValidation = function () {
        const problems = readOnly ? [] : state.errors(ctx.pending());
        els.errors.textContent = problems
            .filter(function (problem) {
                return !problem.id;
            })
            .map(function (problem) {
                return tr('errors.' + problem.code);
            })
            .join(' ');
        Array.from(els.body.querySelectorAll('[data-collection-field]')).forEach(function (cell) {
            const id = cell.parentElement.getAttribute('data-collection-row');
            const field = cell.getAttribute('data-collection-field');
            const problem = problems.find(function (error) {
                return error.id === id && error.field === field;
            });
            const prior = cell.querySelector('.gpo-collection-cell__error');
            if (prior) prior.remove();
            cell.classList.toggle('gpo-collection-cell--invalid', Boolean(problem));
            const input = cell.querySelector('[data-collection-input]');
            if (problem) {
                const errorId = prefix + '-' + id + '-' + field + '-error';
                cell.appendChild(
                    h('span', { id: errorId, class: 'gpo-collection-cell__error' }, tr('errors.' + problem.code))
                );
                if (input) {
                    input.setAttribute('aria-invalid', 'true');
                    input.setAttribute('aria-describedby', errorId);
                }
            } else if (input) {
                input.removeAttribute('aria-invalid');
                input.removeAttribute('aria-describedby');
            }
        });
        const size = state.read(ctx.pending()).value.length;
        els.count.textContent = els.search.value
            ? tr('shownCount', { shown: state.visible(els.search.value).length, total: state.rows.length })
            : tr(state.mode === 'key_value' ? 'pairsCount' : 'itemsCount', { count: size });
        if (ctx.dialog) ctx.dialog.setApplyDisabled(problems.length !== 0);
        return problems;
    };
}
