import { expect, fn, userEvent, within } from 'storybook/test';
import { renderFolderTemplate } from '@gpui/components/templates/folder-template';

/*
 * The catalog of a category: its folders and policies as a filterable list (the right pane next to the tree). The play
 * tests use roles and labels only.
 */

const children = [
    { title: 'Windows components', type: 'folder', icon: 'ico-folder' },
    { title: 'System', type: 'folder', icon: 'ico-folder' },
    { title: 'Allow telemetry', type: 'file', icon: 'ico-file' },
    { title: 'Turn off the Store', type: 'file', icon: 'ico-file' }
];

function render({ onItemClick, help, categoryPath, hideHeading }) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.style.cssText = 'height: 360px; max-width: 700px; display: flex; flex-direction: column';
    const view = renderFolderTemplate({ categoryPath, hideHeading, children, help, onItemClick, listState: {} });
    host.append(view.getElement());
    return host;
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'The catalog of a category: its folders and policies as a filterable listbox, with an optional help block.'
            }
        }
    },
    title: 'Screens/Catalog',
    args: { onItemClick: fn(), categoryPath: 'Computer configuration / Administrative templates' },
    render
};

export const List = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: /administrative templates/i })).toBeVisible();
        await expect(canvas.getByText('Windows components')).toBeVisible();
        await expect(canvas.getByText('Allow telemetry')).toBeVisible();
        const list = canvas.getByRole('listbox', { name: /administrative templates/i });
        await expect(within(list).getAllByRole('option')).toHaveLength(4);
    }
};

export const OpenWithClicks = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        // A folder opens with one click, a policy with a double click.
        await userEvent.click(canvas.getByText('System'));
        await expect(args.onItemClick).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'System' }));
        await userEvent.click(canvas.getByText('Allow telemetry'));
        await expect(args.onItemClick).not.toHaveBeenLastCalledWith(
            expect.objectContaining({ title: 'Allow telemetry' })
        );
        await userEvent.dblClick(canvas.getByText('Allow telemetry'));
        await expect(args.onItemClick).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Allow telemetry' }));
    }
};

export const Filter = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const filter = canvas.getByRole('searchbox', { name: /search/i });
        await userEvent.type(filter, 'store');
        await expect(canvas.getByText('Turn off the Store')).toBeVisible();
        await expect(canvas.queryByText('System')).toBeNull();
        await userEvent.clear(filter);
        await userEvent.type(filter, 'zzz');
        await expect(canvas.getByRole('status')).toHaveTextContent(/no matching/i);
        // Escape clears the filter.
        await userEvent.keyboard('{Escape}');
        await expect(canvas.getByText('System')).toBeVisible();
    }
};

export const WithHelp = {
    args: { help: 'Settings that control the Windows components of the computer.' },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText(/control the Windows components/)).toBeVisible();
    }
};
