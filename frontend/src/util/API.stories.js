import { expect, waitFor, within } from 'storybook/test';
import * as API from '@gpui/util/API';

/*
 * How a story gets server data: `util/API` talks to the fake `freeipa/rpc` (.storybook/shims/rpc.js), which answers from the
 * mock server of the dev stand; `parameters.rpc.scenario` (or the Scenario switch of the toolbar) picks its behaviour.
 * The screen stories use the same mechanism.
 */

function render() {
    const host = document.createElement('div');
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', 'Server answer');
    host.textContent = 'Loading';
    API.initialize('Dev GPO')
        .then(() => API.preferenceItems('computer', 'files'))
        .then(result => {
            host.textContent = result.items.length ? result.items.map(item => item.label).join(', ') : 'No items';
        })
        .catch(error => {
            host.textContent = 'Failed: ' + error.message;
        });
    return host;
}

export default { title: 'Infrastructure/Fake RPC', render };

export const Normal = {
    play: async ({ canvasElement }) => {
        const region = within(canvasElement).getByRole('region', { name: 'Server answer' });
        await waitFor(() => expect(region).toHaveTextContent('Example file, Second file'));
    }
};

export const Empty = {
    parameters: { rpc: { scenario: 'empty' } },
    play: async ({ canvasElement }) => {
        const region = within(canvasElement).getByRole('region', { name: 'Server answer' });
        await waitFor(() => expect(region).toHaveTextContent('No items'));
    }
};

export const ServerError = {
    parameters: { rpc: { scenario: 'error' } },
    play: async ({ canvasElement }) => {
        const region = within(canvasElement).getByRole('region', { name: 'Server answer' });
        await waitFor(() => expect(region).toHaveTextContent('Failed: Dev scenario "error"'));
    }
};

export const Slow = {
    parameters: { rpc: { scenario: 'slow' } },
    play: async ({ canvasElement }) => {
        const region = within(canvasElement).getByRole('region', { name: 'Server answer' });
        // The loading state is visible first, the answer later.
        await expect(region).toHaveTextContent('Loading');
        await waitFor(() => expect(region).toHaveTextContent('Example file'), { timeout: 3000 });
    }
};
