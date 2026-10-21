import { expect, userEvent, waitFor, within } from 'storybook/test';
import { renderScriptsTemplate } from '@gpui/components/templates/script-template';
import { mountScreen } from '../../../.storybook/screen.js';

/*
 * The Scripts overview (the four events of a scope) and the event page with its entries and files, on the data of the fake
 * server. The play tests use roles and labels only.
 */

function render({ scope = 'computer', event }) {
    return mountScreen(() =>
        renderScriptsTemplate(
            event
                ? { item: { scope, event }, mode: 'event', hideHeading: true, isCurrent: () => true }
                : { item: { scope }, isCurrent: () => true }
        )
    );
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'The Scripts screen: the overview of a scope, the page of an event with its selection rules and files, on the data of the fake server.'
            }
        }
    },
    title: 'Screens/Scripts',
    render
};

export const Overview = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(() =>
            expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'ready')
        );
        await expect(canvas.getByRole('heading', { level: 2 })).toBeInTheDocument();
        // Both events of the computer scope are listed, with the number of scripts in each.
        await waitFor(() => expect(canvasElement.querySelectorAll('[data-script-event]').length).toBe(2));
    }
};

export const OverviewOfUser = {
    args: { scope: 'user' },
    play: async ({ canvasElement }) => {
        await waitFor(() => expect(canvasElement.querySelectorAll('[data-script-event]').length).toBe(2));
    }
};

export const EventPage = {
    args: { event: 'startup' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const entries = await waitFor(() => {
            const table = canvasElement.querySelector('[data-script-list="entries"]');
            expect(table).not.toBeNull();
            return table;
        });
        const rows = entries.querySelectorAll('[data-table-row]');
        await expect(rows.length).toBeGreaterThan(0);
        const edit = canvas.getByRole('button', { name: /^Edit$/ });
        const remove = canvas.getByRole('button', { name: /^Remove$/ });
        // Nothing is selected yet, so the actions that need a selection are off.
        await expect(edit).toBeDisabled();
        await expect(remove).toBeDisabled();
        await userEvent.click(rows[0]);
        await expect(rows[0]).toHaveAttribute('aria-selected', 'true');
        await expect(edit).toBeEnabled();
        await expect(remove).toBeEnabled();
        // The page of an event lists the entries only; the files are in the explorer (mode `assets`).
        await expect(canvasElement.querySelector('[data-script-list="assets"]')).toBeNull();
    }
};

export const EventPageWithoutScripts = {
    args: { event: 'startup' },
    parameters: { rpc: { scenario: 'empty' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(() => expect(canvasElement.querySelector('[data-script-list="entries"]')).not.toBeNull());
        await expect(canvasElement.querySelectorAll('[data-script-list="entries"] [data-table-row]')).toHaveLength(0);
        await expect(canvasElement.querySelector('[data-script-list="entries"] [data-table-empty]')).not.toBeNull();
        // Adding stays possible, selecting and removing do not.
        await expect(canvas.getByRole('button', { name: /^Add$/ })).toBeEnabled();
        await expect(canvas.getByRole('button', { name: /^Remove$/ })).toBeDisabled();
    }
};

export const EventPageSlow = {
    args: { event: 'startup' },
    parameters: { rpc: { scenario: 'slow' } },
    play: async ({ canvasElement }) => {
        // Nothing of the page is there before the server answers; then the entries appear.
        await expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'loading');
        await expect(canvasElement.querySelector('[data-script-list]')).toBeNull();
        await waitFor(() => expect(canvasElement.querySelector('[data-script-list="entries"]')).not.toBeNull(), {
            timeout: 4000
        });
    }
};
