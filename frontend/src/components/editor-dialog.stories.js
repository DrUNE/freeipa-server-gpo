import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ElementCreator } from '../util/element-creator';
import * as dialog from './editor-dialog';

/*
 * Characterization of the shared editor dialog: what every consumer (ADMX, security, scripts, preferences,
 * collections) relies on. The stories render a host with an opener button; `play` drives the dialog the way
 * a user does and asserts the observable contract: roles, focus, keyboard, busy state, error display.
 */

function field(id, label) {
    const wrapper = document.createElement('div');
    const input = document.createElement('input');
    input.id = id;
    input.setAttribute('aria-label', label);
    wrapper.append(input);
    return wrapper;
}

function render(args) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.style.cssText = 'position:relative;min-height:420px';
    const opener = document.createElement('button');
    opener.textContent = 'Open';
    opener.addEventListener('click', () => {
        const content = document.createElement('div');
        content.append(field('first', 'First field'), field('second', 'Second field'));
        // The dialog's host is an ElementCreator, as in every template that opens it.
        dialog.open(ElementCreator.wrap(host), { ...args, content });
    });
    host.append(opener);
    return host;
}

const baseArgs = { title: 'Edit setting', onApply: fn(), onClose: fn() };

export default {
    title: 'Dialogs/EditorDialog',
    render,
    args: baseArgs,
    beforeEach: ({ args }) => {
        args.onApply.mockClear();
        args.onClose.mockClear();
    }
};

async function open(canvasElement) {
    const canvas = within(canvasElement);
    const opener = canvas.getByText('Open');
    await userEvent.click(opener);
    const modal = await canvas.findByRole('dialog');
    // Initial focus moves into the dialog on the next microtask.
    await waitFor(() => expect(modal.contains(document.activeElement)).toBe(true));
    return { canvas, opener, modal, within: within(modal) };
}

export const Default = {
    play: async ({ canvasElement }) => {
        const { modal, within: inDialog } = await open(canvasElement);
        await expect(modal).toHaveAttribute('aria-modal', 'true');
        await expect(modal).toHaveAccessibleName('Edit setting');
        await expect(inDialog.getByRole('button', { name: /ok/i })).toBeEnabled();
        await expect(inDialog.getByRole('button', { name: /cancel/i })).toBeEnabled();
        await expect(modal.querySelector('.close')).toHaveAttribute('aria-label');
    }
};

export const ApplyClosesAndRestoresFocus = {
    play: async ({ canvasElement, args }) => {
        const { canvas, opener, within: inDialog } = await open(canvasElement);
        await userEvent.click(inDialog.getByRole('button', { name: /ok/i }));
        await expect(args.onApply).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
        await expect(args.onClose).toHaveBeenCalledTimes(1);
        await expect(document.activeElement).toBe(opener);
    }
};

export const ApplyReturningFalseKeepsDialogOpen = {
    args: { ...baseArgs, onApply: fn(async () => false) },
    play: async ({ canvasElement, args }) => {
        const { modal, within: inDialog } = await open(canvasElement);
        await userEvent.click(inDialog.getByRole('button', { name: /ok/i }));
        await waitFor(() => expect(args.onApply).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(modal).toHaveAttribute('aria-busy', 'false'));
        await expect(modal.isConnected).toBe(true);
        await expect(args.onClose).not.toHaveBeenCalled();
    }
};

export const ApplyFailureShowsErrorAndStaysOpen = {
    args: {
        ...baseArgs,
        onApply: fn(async () => {
            throw { category: 'validation', message: 'Untranslated server diagnostic' };
        })
    },
    play: async ({ canvasElement, args }) => {
        const { modal, within: inDialog } = await open(canvasElement);
        const apply = inDialog.getByRole('button', { name: /ok/i });
        await userEvent.click(apply);
        // The dialog has an always-present alert region; the notice inside it is the EditorStatus error.
        await waitFor(() => expect(modal.querySelector('[data-editor-status="error"]')).not.toBeNull());
        const failure = modal.querySelector('[data-editor-status="error"]');
        await expect(failure).not.toHaveTextContent('Untranslated');
        await expect(modal.isConnected).toBe(true);
        await expect(args.onClose).not.toHaveBeenCalled();
        // The dialog is usable again after the failure.
        await expect(apply).toBeEnabled();
        await expect(modal).toHaveAttribute('aria-busy', 'false');
    }
};

export const BusyWhileApplying = {
    args: {
        ...baseArgs,
        onApply: fn(
            () =>
                new Promise(resolve => {
                    globalThis.__finishApply = () => resolve(undefined);
                })
        )
    },
    play: async ({ canvasElement, args }) => {
        const { canvas, modal, within: inDialog } = await open(canvasElement);
        await userEvent.click(inDialog.getByRole('button', { name: /ok/i }));
        await waitFor(() => expect(modal).toHaveAttribute('aria-busy', 'true'));
        for (const name of [/ok/i, /cancel/i]) await expect(inDialog.getByRole('button', { name })).toBeDisabled();
        await expect(modal.querySelector('.close')).toBeDisabled();
        // A second click and Escape are ignored while busy.
        await userEvent.keyboard('{Escape}');
        await expect(modal.isConnected).toBe(true);
        await expect(args.onApply).toHaveBeenCalledTimes(1);
        globalThis.__finishApply();
        await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    }
};

export const EscapeClosesCleanDialog = {
    play: async ({ canvasElement, args }) => {
        const { canvas, opener } = await open(canvasElement);
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
        await expect(args.onClose).toHaveBeenCalledTimes(1);
        await expect(document.activeElement).toBe(opener);
    }
};

export const DirtyCancelAsksToDiscard = {
    args: { ...baseArgs, isDirty: () => true, discardMessage: 'Discard unsaved changes?' },
    play: async ({ canvasElement, args }) => {
        const { canvas, modal, within: inDialog } = await open(canvasElement);
        const cancel = inDialog.getByRole('button', { name: /cancel/i });
        await userEvent.click(cancel);
        const confirmation = await canvas.findByRole('alertdialog');
        await expect(confirmation).toHaveTextContent('Discard unsaved changes?');
        // The dialog underneath is inert while the question is open.
        await expect(modal.inert).toBe(true);
        await userEvent.click(within(confirmation).getByRole('button', { name: /no/i }));
        await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull());
        await expect(modal.inert).toBe(false);
        await expect(modal.isConnected).toBe(true);
        await expect(document.activeElement).toBe(cancel);
        await expect(args.onClose).not.toHaveBeenCalled();
        await userEvent.click(cancel);
        await userEvent.click(within(await canvas.findByRole('alertdialog')).getByRole('button', { name: /yes/i }));
        await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
        await expect(args.onClose).toHaveBeenCalledTimes(1);
    }
};

export const TabStaysInsideDialog = {
    play: async ({ canvasElement }) => {
        const { modal } = await open(canvasElement);
        const focusable = /** @type {HTMLElement[]} */ (Array.from(modal.querySelectorAll('button, input'))).filter(
            element => !(/** @type {HTMLButtonElement} */ (element).disabled)
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        last.focus();
        await userEvent.tab();
        await expect(document.activeElement).toBe(first);
        await userEvent.tab({ shift: true });
        await expect(document.activeElement).toBe(last);
    }
};

export const ReadOnlyHasNoApply = {
    args: { ...baseArgs, readOnly: true },
    play: async ({ canvasElement }) => {
        const { within: inDialog } = await open(canvasElement);
        await expect(inDialog.queryByRole('button', { name: /ok/i })).toBeNull();
        await expect(inDialog.getByRole('button', { name: /cancel/i })).toBeVisible();
    }
};

export const InitialFocusOnRequestedElement = {
    args: { ...baseArgs, initialFocus: () => document.getElementById('second') },
    play: async ({ canvasElement }) => {
        await open(canvasElement);
        await waitFor(() => expect(document.activeElement.id).toBe('second'));
    }
};

export const Russian = {
    globals: { locale: 'ru' },
    play: async ({ canvasElement }) => {
        const { within: inDialog } = await open(canvasElement);
        await expect(inDialog.getByRole('button', { name: 'Отмена' })).toBeVisible();
    }
};
