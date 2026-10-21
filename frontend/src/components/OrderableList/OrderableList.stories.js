import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { createOrderableList } from '@gpui/components/OrderableList/OrderableList';

const items = [
    { id: 'logon', label: 'Logon script' },
    { id: 'drives', label: 'Map drives' },
    { id: 'printers', label: 'Add printers' }
];

function render({ items, disabled, onReorder }) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.style.cssText = 'max-width: 420px; position: relative';
    host.append(createOrderableList({ label: 'Scripts', items, disabled, uncontrolled: true, onReorder }).element);
    return host;
}

export default { title: 'Primitives/OrderableList', args: { items, disabled: false, onReorder: fn() }, render };

const order = canvas =>
    within(canvas.getByRole('list', { name: 'Scripts' }))
        .getAllByRole('listitem')
        .map(item => item.getAttribute('data-orderable-id'));

export const Default = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(order(canvas)).toEqual(['logon', 'drives', 'printers']);
        // The first item cannot go up, the last cannot go down.
        await expect(canvas.getByRole('button', { name: 'Move Logon script up' })).toBeDisabled();
        await expect(canvas.getByRole('button', { name: 'Move Add printers down' })).toBeDisabled();
    }
};

export const Buttons = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Move Logon script down' }));
        await expect(order(canvas)).toEqual(['drives', 'logon', 'printers']);
        await expect(args.onReorder).toHaveBeenLastCalledWith(['drives', 'logon', 'printers'], {
            id: 'logon',
            from: 0,
            to: 1
        });
        // The moved item keeps the focus (its handle) and the move is announced.
        await expect(canvas.getByRole('button', { name: 'Move Logon script' })).toHaveFocus();
        await expect(canvas.getByRole('status')).toHaveTextContent('Logon script moved to position 2 of 3.');
    }
};

export const Keyboard = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        canvas.getByRole('button', { name: 'Move Add printers' }).focus();
        await userEvent.keyboard('{Control>}{ArrowUp}{/Control}');
        await expect(order(canvas)).toEqual(['logon', 'printers', 'drives']);
        await expect(canvas.getByRole('button', { name: 'Move Add printers' })).toHaveFocus();
        await userEvent.keyboard('{Control>}{ArrowUp}{ArrowUp}{/Control}');
        await expect(order(canvas)).toEqual(['printers', 'logon', 'drives']);
        // Plain arrows do not reorder.
        await userEvent.keyboard('{ArrowDown}');
        await expect(order(canvas)).toEqual(['printers', 'logon', 'drives']);
    }
};

export const Drag = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const handle = canvas.getByRole('button', { name: 'Move Logon script' });
        const target = canvasElement.querySelector('[data-orderable-id="drives"]');
        const transfer = new DataTransfer();
        handle.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: transfer }));
        const rect = target.getBoundingClientRect();
        target.dispatchEvent(
            new DragEvent('dragover', {
                bubbles: true,
                cancelable: true,
                dataTransfer: transfer,
                clientY: rect.bottom - 1
            })
        );
        target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
        await waitFor(() => expect(order(canvas)).toEqual(['drives', 'logon', 'printers']));
    }
};

export const Disabled = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled();
    }
};

export const Empty = {
    args: { items: [] },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText('No items')).toBeVisible();
    }
};

export const LongTitles = {
    args: {
        items: [
            {
                id: 'a',
                label: 'A very long script name that does not fit into the narrow column of the list at all.cmd'
            },
            { id: 'b', label: 'Short' }
        ]
    },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(2);
    }
};
