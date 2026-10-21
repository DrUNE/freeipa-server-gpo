import { expect, userEvent, waitFor, within } from 'storybook/test';
import { renderAdmxTemplate } from '@gpui/components/templates/admx-template';
import { mountScreen } from '../../../.storybook/screen.js';

/*
 * The ADMX policy screen: the state of one policy, its parameters, the comment and the help, on the data of the fake
 * server. `modalLayout` is the form of the policy dialog (tabs), the default is the page of a category. The play tests use
 * roles and labels only.
 */

function render({ policyId = 'alt-repo', scope = 'computer', modalLayout = true }) {
    return mountScreen(() =>
        renderAdmxTemplate({
            item: { scope, policyId },
            modalLayout,
            categoryPath: modalLayout ? undefined : 'Software / Repositories',
            isCurrent: () => true
        })
    );
}

export default { title: 'Screens/ADMX Policy', render };

async function ready(canvasElement) {
    await waitFor(() => expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'ready'));
}

export const Form = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        // The policy is not configured; its parameters are not editable until it is enabled.
        await expect(canvas.getByRole('radio', { name: /not configured/i })).toBeChecked();
        await expect(canvas.getByRole('textbox', { name: 'Repository URL' })).toBeDisabled();
        await userEvent.click(canvas.getByRole('radio', { name: /^enabled/i }));
        const url = canvas.getByRole('textbox', { name: 'Repository URL' });
        await waitFor(() => expect(url).toBeEnabled());
        await expect(url).toHaveValue('http://ftp.altlinux.org/pub/distributions/ALTLinux');
        await expect(canvas.getByRole('checkbox', { name: 'Enable repository' })).toBeChecked();
        // The comment is editable.
        await userEvent.type(canvas.getByRole('textbox', { name: /comment/i }), 'checked');
        await expect(canvas.getByRole('textbox', { name: /comment/i })).toHaveValue('checked');
    }
};

export const Help = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await userEvent.click(canvas.getByRole('tab', { name: /explanation/i }));
        await expect(await canvas.findByText(/Fixture policy served by/)).toBeVisible();
        await expect(canvas.getByText(/Group Policy client/)).toBeVisible();
    }
};

export const Choice = {
    args: { policyId: 'sys-mode' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        const select = canvas.getByRole('combobox', { name: 'Mode' });
        await expect(select).toBeDisabled();
        await userEvent.click(canvas.getByRole('radio', { name: /^enabled/i }));
        await waitFor(() => expect(select).toBeEnabled());
        await userEvent.selectOptions(select, 'Manual');
        await expect(select).toHaveDisplayValue('Manual');
    }
};

export const Number = {
    args: { policyId: 'sys-timeout' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await expect(canvas.getByRole('spinbutton', { name: 'Timeout, minutes' })).toHaveValue(20);
    }
};

export const ListOfValues = {
    args: { policyId: 'alt-install' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await expect(canvas.getByRole('radio', { name: /not configured/i })).toBeChecked();
        await expect(canvas.getByText('Packages')).toBeInTheDocument();
    }
};

export const PreservedRawValue = {
    args: { policyId: 'alt-raw' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        // A value the editor cannot represent is shown as it is and cannot be changed.
        await expect(canvas.getByRole('radio', { name: /^enabled/i })).toBeDisabled();
        await expect(canvas.getByRole('textbox', { name: /comment/i })).toBeDisabled();
        await expect(canvasElement.querySelector('pre')).not.toBeNull();
    }
};

export const WithoutParameters = {
    args: { policyId: 'root-policy' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await expect(canvas.getAllByRole('radio')).toHaveLength(3);
        await expect(canvas.queryByRole('textbox', { name: /repository/i })).toBeNull();
    }
};

export const Page = {
    args: { modalLayout: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await expect(canvas.getByRole('heading', { level: 2, name: 'Software / Repositories' })).toBeInTheDocument();
        await expect(canvas.getByRole('textbox', { name: 'Repository URL' })).toBeInTheDocument();
        await expect(canvas.getByRole('radio', { name: /not configured/i })).toBeChecked();
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

export const UnknownPolicy = {
    args: { policyId: 'no-such-policy' },
    play: async ({ canvasElement }) => {
        // The server does not know the policy: the screen says so instead of an empty form.
        const alert = await within(canvasElement).findByRole('alert');
        await expect(alert).toHaveAttribute('data-editor-status', 'error');
    }
};
