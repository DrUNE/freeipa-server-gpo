import { expect, fn, userEvent, within } from 'storybook/test';
import { open } from '@gpui/components/ConfirmationDialog/ConfirmationDialog';

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'A yes/no question over a host element (an `alertdialog`). Focus goes to the safe answer, Escape answers no, Tab cycles between the two buttons and focus returns to where it was.'
            }
        }
    },
    title: 'Dialogs/ConfirmationDialog',
    render: args => {
        const host = document.createElement('div');
        host.style.cssText = 'position:relative;min-height:240px';
        const opener = document.createElement('button');
        opener.textContent = 'Open';
        host.append(opener);
        opener.addEventListener('click', () => open(host, args));
        return host;
    },
    args: { message: 'Discard unsaved changes?', onConfirm: fn(), onCancel: fn() }
};

export const Default = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByText('Open'));
        await expect(canvas.getByRole('alertdialog')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: /yes/i }));
        await expect(args.onConfirm).toHaveBeenCalled();
    }
};

export const Cancel = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByText('Open');
        await userEvent.click(opener);
        const dialog = canvas.getByRole('alertdialog', { name: /confirm/i });
        await expect(dialog).toHaveAccessibleDescription('Discard unsaved changes?');
        // The safe answer is focused first.
        await expect(within(dialog).getByRole('button', { name: /no/i })).toHaveFocus();
        await userEvent.click(within(dialog).getByRole('button', { name: /no/i }));
        await expect(args.onCancel).toHaveBeenCalled();
        await expect(args.onConfirm).not.toHaveBeenCalled();
        await expect(canvas.queryByRole('alertdialog')).toBeNull();
        await expect(opener).toHaveFocus();
    }
};

export const EscapeAndTab = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByText('Open');
        await userEvent.click(opener);
        const no = canvas.getByRole('button', { name: /no/i });
        const yes = canvas.getByRole('button', { name: /yes/i });
        await userEvent.tab({ shift: true });
        await expect(yes).toHaveFocus();
        await userEvent.tab();
        await expect(no).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        await expect(args.onCancel).toHaveBeenCalledTimes(1);
        await expect(canvas.queryByRole('alertdialog')).toBeNull();
        await expect(opener).toHaveFocus();
    }
};

export const WithContent = {
    args: {
        title: 'Related settings',
        message: 'Apply these values:',
        confirmLabel: 'Apply changes',
        cancelLabel: 'Cancel'
    },
    render: args => {
        const host = document.createElement('div');
        host.style.cssText = 'position:relative;min-height:240px';
        const opener = document.createElement('button');
        opener.textContent = 'Open';
        const table = document.createElement('table');
        table.innerHTML = '<tbody><tr><td>Minimum password age: 0</td></tr></tbody>';
        host.append(opener);
        opener.addEventListener('click', () => open(host, { ...args, content: table }));
        return host;
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByText('Open'));
        const dialog = canvas.getByRole('alertdialog', { name: 'Related settings' });
        await expect(within(dialog).getByText('Minimum password age: 0')).toBeVisible();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply changes' }));
        await expect(args.onConfirm).toHaveBeenCalled();
    }
};
