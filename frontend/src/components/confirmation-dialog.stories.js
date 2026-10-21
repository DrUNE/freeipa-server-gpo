import { expect, fn, userEvent, within } from 'storybook/test';
import { open } from '@gpui/components/confirmation-dialog';

export default {
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
