import { expect, userEvent, waitFor, within } from 'storybook/test';
import { renderSecurityTemplate } from '@gpui/components/templates/security-template';
import { navigationNodes } from '@gpui/core/security/model';
import * as API from '@gpui/util/API';
import { mountScreen } from '../../../.storybook/screen.js';

/*
 * The Security Settings screen: the policies of a category of the security catalog, on the data of the fake server. The
 * play tests use roles and labels only.
 */

async function categoryItem() {
    const nodes = navigationNodes(await API.securityDefinitionsShow());
    // An empty catalog has no category: the screen then shows an empty one.
    return nodes[0] || { title: 'Security Settings', securityCategory: true, children: [] };
}

function render() {
    return mountScreen(async () =>
        renderSecurityTemplate({ item: await categoryItem(), hideHeading: true, isCurrent: () => true })
    );
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'The Security Settings screen: the policies of a category of the security catalog, with a filter, on the data of the fake server.'
            }
        }
    },
    title: 'Screens/Security',
    render
};

export const Policies = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = await canvas.findByRole('table');
        await waitFor(() => expect(within(table).getAllByRole('row').length).toBeGreaterThan(1));
        await expect(within(table).getByText('Minimum password length')).toBeInTheDocument();
        // Filtering narrows the list; a miss says so.
        const filter = canvas.getByRole('searchbox', { name: /filter/i });
        await userEvent.type(filter, 'zzz');
        await expect(await canvas.findByText(/no matching/i)).toBeInTheDocument();
    }
};

export const Slow = {
    parameters: { rpc: { scenario: 'slow' } },
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'loading');
        await waitFor(
            () => expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'ready'),
            { timeout: 4000 }
        );
    }
};

export const ServerError = {
    parameters: { rpc: { scenario: 'error' } },
    play: async ({ canvasElement }) => {
        const alert = await within(canvasElement).findByRole('alert');
        await expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'error');
        await expect(alert).toHaveAttribute('data-editor-status', 'error');
    }
};

export const NothingToList = {
    parameters: { rpc: { scenario: 'empty' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText(/no items are configured/i)).toBeInTheDocument();
    }
};
