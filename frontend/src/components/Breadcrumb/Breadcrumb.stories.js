import { expect, fn, userEvent, within } from 'storybook/test';
import { createBreadcrumb } from '@gpui/components/Breadcrumb/Breadcrumb';

const segments = [
    { title: 'Computer configuration', item: { id: 'root' } },
    { title: 'Administrative templates', item: { id: 'adm' } },
    { title: 'Windows components', item: { id: 'win' } }
];

function render({ segments, onNavigate }) {
    const host = document.createElement('div');
    host.className = 'gp__container';
    host.style.cssText = 'max-width: 640px';
    host.append(createBreadcrumb({ label: 'Path', segments, onNavigate }));
    return host;
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'The path to the open node: every ancestor is a button, the last segment is the current page. The buttons are one Tab stop; Left, Right, Home and End move between them.'
            }
        }
    },
    title: 'Primitives/Breadcrumb',
    args: { segments, onNavigate: fn() },
    render
};

export const Default = {
    play: async ({ canvasElement, args }) => {
        const nav = within(canvasElement).getByRole('navigation', { name: 'Path' });
        const buttons = within(nav).getAllByRole('button');
        await expect(buttons).toHaveLength(3);
        await expect(buttons[2]).toHaveAttribute('aria-current', 'page');
        // One Tab stop: the last segment.
        await expect(buttons.map(button => button.tabIndex)).toEqual([-1, -1, 0]);
        await userEvent.click(buttons[1]);
        await expect(args.onNavigate).toHaveBeenCalledWith({ id: 'adm' });
    }
};

export const Keyboard = {
    play: async ({ canvasElement }) => {
        const buttons = within(canvasElement).getAllByRole('button');
        buttons[2].focus();
        await userEvent.keyboard('{ArrowLeft}');
        await expect(buttons[1]).toHaveFocus();
        await expect(buttons.map(button => button.tabIndex)).toEqual([-1, 0, -1]);
        await userEvent.keyboard('{Home}');
        await expect(buttons[0]).toHaveFocus();
        await userEvent.keyboard('{End}');
        await expect(buttons[2]).toHaveFocus();
        await userEvent.keyboard('{ArrowRight}');
        await expect(buttons[2]).toHaveFocus();
    }
};

export const NotNavigable = {
    args: { segments: [{ title: 'Example GPO' }] },
    play: async ({ canvasElement }) => {
        const nav = within(canvasElement).getByRole('navigation', { name: 'Path' });
        await expect(within(nav).queryAllByRole('button')).toHaveLength(0);
        await expect(nav).toHaveTextContent('Example GPO');
    }
};

export const LongPath = {
    args: {
        segments: Array.from({ length: 8 }, (_, index) => ({
            title: `A fairly long category name number ${index + 1}`,
            item: { id: index }
        }))
    },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getAllByRole('button')).toHaveLength(8);
    }
};
