import { expect, fn, userEvent, within } from 'storybook/test';
import { createControl } from '@gpui/components/collection-control';

const list = {
    id: 'packages',
    kind: 'list',
    label: 'Packages',
    collection: { mode: 'list', unique_keys: false, allow_empty_values: false, min_items: 1 }
};
const keyValue = {
    id: 'devices',
    kind: 'list',
    label: 'Security Devices',
    collection: {
        mode: 'key_value',
        unique_keys: true,
        key_case_sensitive: false,
        allow_empty_values: true,
        min_items: 1
    }
};

function render({ parameter, value, editable, onChange }) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.style.cssText = 'position: relative; min-height: 420px';
    const control = createControl(parameter, value, editable);
    control.element.getElement().addEventListener('change', () => onChange(control.read()));
    host.append(control.element.getElement());
    return host;
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'The editor of a list or key/value list parameter: a summary with an Edit button, and a dialog with a table with inline editing, Add and Remove, search, validation per row and reordering. OK is enabled only for a valid, changed collection; cancelling a changed one asks first.'
            }
        }
    },
    title: 'Primitives/CollectionEditor',
    args: {
        parameter: list,
        value: { kind: 'text_list', value: ['git', 'vim'] },
        editable: true,
        onChange: fn()
    },
    render
};

export const Summary = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Items: 2')).toBeVisible();
        await expect(canvas.getByRole('button', { name: 'Edit Packages' })).toBeEnabled();
    }
};

export const AddRow = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Edit Packages' }));
        const dialog = within(await canvas.findByRole('dialog', { name: 'Packages' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Add' }));
        await userEvent.keyboard('curl{Enter}');
        await expect(dialog.getByRole('button', { name: 'OK' })).toBeEnabled();
        await userEvent.click(dialog.getByRole('button', { name: 'OK' }));
        await expect(args.onChange).toHaveBeenCalledWith({ kind: 'text_list', value: ['git', 'vim', 'curl'] });
        await expect(canvas.queryByRole('dialog')).toBeNull();
        await expect(canvas.getByText('Items: 3')).toBeVisible();
    }
};

export const Empty = {
    args: { value: { kind: 'text_list', value: [] } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('No items')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Edit Packages' }));
        const dialog = within(await canvas.findByRole('dialog', { name: 'Packages' }));
        // The minimum is one item: the list cannot be accepted empty.
        await expect(dialog.getByText('Add at least one item.')).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'OK' })).toBeDisabled();
    }
};

export const ReadOnly = {
    args: { editable: false },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('button', { name: 'Edit Packages' })).toBeDisabled();
    }
};

export const DuplicateKey = {
    args: {
        parameter: keyValue,
        value: {
            kind: 'key_value_list',
            value: [
                { key: 'OpenSC', value: 'C:\\modules\\opensc.dll' },
                { key: 'CryptoPro', value: 'C:\\modules\\cp.dll' }
            ]
        }
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Pairs: 2')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Edit Security Devices' }));
        const dialog = within(await canvas.findByRole('dialog', { name: 'Security Devices' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Add' }));
        // The new row opens its key for typing; the key is compared without case.
        await userEvent.keyboard('opensc{Enter}');
        // Both rows with the same name are marked.
        await expect(await dialog.findAllByText('This name is already used.')).toHaveLength(2);
        await expect(dialog.getByRole('button', { name: 'OK' })).toBeDisabled();
    }
};

export const DiscardChanges = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Edit Packages' }));
        const dialog = within(await canvas.findByRole('dialog', { name: 'Packages' }));
        await userEvent.click(dialog.getByRole('button', { name: 'Add' }));
        await userEvent.keyboard('curl{Enter}');
        await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
        const question = await canvas.findByRole('alertdialog');
        await expect(question).toHaveAccessibleDescription('Discard unsaved changes?');
        await userEvent.click(within(question).getByRole('button', { name: /yes/i }));
        await expect(canvas.queryByRole('dialog')).toBeNull();
        await expect(canvas.getByText('Items: 2')).toBeVisible();
    }
};
