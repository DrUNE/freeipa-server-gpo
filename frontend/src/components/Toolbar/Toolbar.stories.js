import { expect, fn, userEvent, within } from 'storybook/test';
import * as translations from '@gpui/locales/translations';
import { createToolbar, setToolbarItem, toolbarItem } from '@gpui/components/Toolbar/Toolbar';

/** The labels of the editor's own translations, so that the EN/RU switch of the toolbar changes them. */
const label = key => translations.t('systemSettings.' + key);

function items(args) {
    return [
        { id: 'add', label: label('add'), onClick: args.onAdd },
        { id: 'edit', label: label('edit'), onClick: args.onEdit, disabled: true },
        { id: 'remove', label: label('remove'), onClick: args.onRemove, disabled: true, title: 'Select an entry first' }
    ];
}

/** A host with the editor's root class, as the templates mount it. */
function mount(toolbar) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.append(toolbar);
    return host;
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'A group of action buttons (Add / Edit / Remove / Move, Upload / Download). Buttons are enabled and disabled with `setToolbarItem`, which keeps `disabled` and the global `.active` look together.'
            }
        }
    },
    title: 'Primitives/Toolbar',
    args: { onAdd: fn(), onEdit: fn(), onRemove: fn() },
    render: args => mount(createToolbar({ label: 'Script entries', items: items(args) }))
};

export const Default = {
    play: async ({ canvasElement, args }) => {
        const toolbar = within(canvasElement).getByRole('group', { name: 'Script entries' });
        await expect(toolbar).toHaveAttribute('data-toolbar');
        const buttons = within(toolbar).getAllByRole('button');
        await expect(buttons.map(button => button.textContent)).toEqual([label('add'), label('edit'), label('remove')]);
        // Only the enabled button is `active` (the editor's global look of an enabled button) and answers a click.
        await expect(buttons.map(button => /** @type {HTMLButtonElement} */ (button).disabled)).toEqual([
            false,
            true,
            true
        ]);
        await expect(buttons.map(button => button.classList.contains('active'))).toEqual([true, false, false]);
        await userEvent.click(buttons[0]);
        await expect(args.onAdd).toHaveBeenCalledTimes(1);
        await userEvent.click(buttons[1]);
        await expect(args.onEdit).not.toHaveBeenCalled();
        await expect(buttons[2]).toHaveAttribute('title', 'Select an entry first');
    }
};

export const Enabling = {
    play: async ({ canvasElement, args }) => {
        const toolbar = canvasElement.querySelector('[data-toolbar]');
        setToolbarItem(toolbar, 'edit', { disabled: false });
        setToolbarItem(toolbar, 'remove', { disabled: false, title: '' });
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: label('edit') })).toBeEnabled();
        await expect(canvas.getByRole('button', { name: label('remove') })).not.toHaveAttribute('title');
        await expect(toolbarItem(toolbar, 'edit')).toHaveClass('active');
        await userEvent.click(canvas.getByRole('button', { name: label('remove') }));
        await expect(args.onRemove).toHaveBeenCalledTimes(1);
        // Disabling again takes the `active` mark off with it.
        setToolbarItem(toolbar, 'edit', { disabled: true });
        await expect(toolbarItem(toolbar, 'edit')).not.toHaveClass('active');
        // An item the screen does not show is ignored.
        setToolbarItem(toolbar, 'up', { disabled: false });
    }
};

export const Keyboard = {
    play: async ({ canvasElement, args }) => {
        const add = within(canvasElement).getByRole('button', { name: label('add') });
        await userEvent.tab();
        await expect(add).toHaveFocus();
        await userEvent.keyboard('{Enter}');
        await expect(args.onAdd).toHaveBeenCalledTimes(1);
        // Disabled buttons are skipped by Tab.
        await userEvent.tab();
        await expect(add).not.toHaveFocus();
    }
};
