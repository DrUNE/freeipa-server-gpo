import { expect, fn, userEvent, within } from 'storybook/test';
import * as translations from '@gpui/locales/translations';
import {
    createDiagnostics,
    createErrorStatus,
    createPendingStatus,
    createUnsupportedStatus
} from '@gpui/components/EditorStatus/EditorStatus';

/** Mounts the notice into a plain host the way the editor's templates do. */
function mount(element) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.append(element);
    return host;
}

const t = key => translations.t('editorStatus.' + key);

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'Status notices of the editor: an error with optional actions, a pending-publication notice, an "unsupported" notice and a block of technical diagnostics.'
            }
        }
    },
    title: 'Editor/EditorStatus',
    args: { onRefresh: fn(), onReconcile: fn() }
};

export const Validation = {
    args: { error: { category: 'validation', message: 'Untranslated server diagnostic' } },
    render: ({ error }) => mount(createErrorStatus(error)),
    play: async ({ canvasElement }) => {
        const notice = canvasElement.querySelector('[data-editor-status="error"]');
        await expect(notice).toHaveAttribute('role', 'alert');
        await expect(notice).toHaveAttribute('data-error-category', 'validation');
        // Only translated details are shown; an unknown server message never reaches the user.
        await expect(notice).toHaveTextContent(t('errors.validation'));
        await expect(notice).not.toHaveTextContent('Untranslated');
        await expect(within(notice).queryAllByRole('button')).toHaveLength(0);
        // The look of the former global `.gpo-editor-status--error` rules.
        const style = getComputedStyle(notice);
        await expect([style.backgroundColor, style.color, style.borderTopColor, style.margin, style.padding]).toEqual([
            'rgb(255, 244, 244)',
            'rgb(140, 43, 43)',
            'rgb(201, 25, 11)',
            '10px 20px',
            '10px 12px'
        ]);
        // The editor makes text unselectable; the message must stay copyable.
        await expect(getComputedStyle(notice.firstElementChild).userSelect).toBe('text');
    }
};

export const TranslatedDetail = {
    args: { error: { category: 'validation', message: 'Security policy actions must be a list.' } },
    render: ({ error }) => mount(createErrorStatus(error)),
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector('[data-editor-status]')).toHaveTextContent(
            t('errors.validation') + ' ' + t('details.securityActionsList')
        );
    }
};

export const WithField = {
    args: { error: { category: 'validation', field: 'policies.value' } },
    render: ({ error }) => mount(createErrorStatus(error)),
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector('[data-editor-status]')).toHaveTextContent(
            t('field') + ': policies.value'
        );
    }
};

export const PublicationConflict = {
    args: { error: { category: 'publication-conflict', field: 'value' } },
    render: ({ error, onRefresh, onReconcile }) => mount(createErrorStatus(error, { onRefresh, onReconcile })),
    play: async ({ canvasElement, args }) => {
        const notice = within(canvasElement.querySelector('[data-editor-status]'));
        const buttons = notice.getAllByRole('button');
        await expect(buttons.map(button => button.textContent)).toEqual([t('refresh'), t('reconcile')]);
        await userEvent.click(buttons[0]);
        await expect(args.onRefresh).toHaveBeenCalledTimes(1);
        await userEvent.click(buttons[1]);
        await expect(args.onReconcile).toHaveBeenCalledTimes(1);
    }
};

export const PublicationConflictRussian = {
    ...PublicationConflict,
    globals: { locale: 'ru' }
};

export const ReconcileOnlyForPublicationErrors = {
    args: { error: { category: 'validation' } },
    render: ({ error, onRefresh, onReconcile }) => mount(createErrorStatus(error, { onRefresh, onReconcile })),
    play: async ({ canvasElement }) => {
        const notice = within(canvasElement.querySelector('[data-editor-status]'));
        await expect(notice.getAllByRole('button').map(button => button.textContent)).toEqual([t('refresh')]);
    }
};

export const Pending = {
    render: ({ onReconcile }) => mount(createPendingStatus({ pending: true }, onReconcile)),
    play: async ({ canvasElement, args }) => {
        const notice = canvasElement.querySelector('[data-editor-status="pending"]');
        await expect(notice).toHaveAttribute('role', 'status');
        await expect(notice).toHaveTextContent(t('pending'));
        const style = getComputedStyle(notice);
        await expect([style.backgroundColor, style.color, style.borderTopColor]).toEqual([
            'rgb(255, 248, 223)',
            'rgb(102, 77, 3)',
            'rgb(224, 180, 0)'
        ]);
        await userEvent.click(within(notice).getByRole('button', { name: t('reconcile') }));
        await expect(args.onReconcile).toHaveBeenCalledTimes(1);
    }
};

export const NothingPending = {
    render: () => mount(document.createTextNode(String(createPendingStatus(null)))),
    play: async ({ canvasElement }) => {
        await expect(canvasElement).toHaveTextContent('null');
    }
};

export const Unsupported = {
    render: () => mount(createUnsupportedStatus(translations.t('policies.unsupportedSource'))),
    play: async ({ canvasElement }) => {
        const notice = canvasElement.querySelector('[data-editor-status="unsupported"]');
        await expect(notice).toHaveAttribute('role', 'status');
        await expect(notice).toHaveTextContent(translations.t('policies.unsupportedSource'));
    }
};

export const Diagnostics = {
    render: () =>
        mount(
            createDiagnostics([{ code: 'source_error', message: 'Untranslated diagnostic' }, { message: 'No code' }])
        ),
    play: async ({ canvasElement }) => {
        const details = canvasElement.querySelector('[data-editor-status-diagnostics]');
        await expect(details.tagName).toBe('DETAILS');
        await expect(within(details).getByText(t('technicalDetails'))).toBeVisible();
        const lines = Array.from(details.querySelectorAll('pre'), pre => pre.textContent);
        await expect(lines).toEqual(['source_error: Untranslated diagnostic', 'No code']);
        // The editor makes text unselectable; diagnostics must stay copyable.
        await expect(getComputedStyle(details).userSelect).toBe('text');
    }
};
