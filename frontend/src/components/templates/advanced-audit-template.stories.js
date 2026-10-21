import { expect, userEvent, waitFor, within } from 'storybook/test';
import { renderAdvancedAuditTemplate } from '@gpui/components/templates/advanced-audit-template';
import { mountScreen } from '../../../.storybook/screen.js';

/*
 * The Advanced Audit screen of the editor with the data of the fake server (the same rows as the dev stand). The scenarios
 * show what the screen does when the server fails, is slow or has nothing to list.
 */

const FAMILY = 'system_audit_policies';

function render() {
    return mountScreen(() =>
        renderAdvancedAuditTemplate({ item: { advancedAuditFamilyId: FAMILY }, isCurrent: () => true })
    );
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'The Advanced Audit screen: the rows of an audit family with filtering, on the data of the fake server.'
            }
        }
    },
    title: 'Screens/Advanced Audit',
    render
};

export const Rows = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = await canvas.findByRole('table');
        const rows = await waitFor(() => {
            const found = table.querySelectorAll('[data-advanced-audit-kind]');
            expect(found.length).toBeGreaterThan(0);
            return Array.from(found);
        });
        await expect(rows.map(row => row.textContent).join('|')).toMatch(/Logon/);
        await expect(canvas.getByRole('searchbox')).toBeInTheDocument();
        // Filtering narrows the list; clearing restores it.
        await userEvent.type(canvas.getByRole('searchbox'), 'Process');
        await waitFor(() =>
            expect(table.querySelectorAll('[data-advanced-audit-kind]').length).toBeLessThan(rows.length)
        );
    }
};

export const Slow = {
    parameters: { rpc: { scenario: 'slow' } },
    play: async ({ canvasElement }) => {
        // Nothing is shown before the server answers, then the screen appears.
        await expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'loading');
        await waitFor(
            () => expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'ready'),
            {
                timeout: 4000
            }
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
        const table = await canvas.findByRole('table');
        // The catalog of subcategories is empty, so there is nothing to select or edit.
        await expect(table.querySelectorAll('[data-advanced-audit-kind]')).toHaveLength(0);
    }
};
