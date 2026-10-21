import { expect, userEvent, waitFor, within } from 'storybook/test';
import { createElement } from '@gpui/util/element-creator';
import { renderPreferencesTemplate } from '@gpui/components/templates/preference/preferences-view-template';
import { mountScreen } from '../../../../.storybook/screen.js';

/*
 * The preferences of one kind (Files of the computer scope): the list of items and the form of one item with its tabs, on
 * the data of the fake server. The editor's header owns the Add, Edit and Remove buttons of the page, so the story builds
 * the same three. The play tests use roles and labels only.
 */

function header() {
    const button = (name, text) =>
        createElement('button', { className: ['button', name], attrs: { type: 'button' }, text });
    return createElement('div', {
        children: [
            createElement('div', {
                className: 'gp__control',
                children: [
                    button('preferences__btn-create', 'Add'),
                    button('preferences__btn-edit', 'Edit'),
                    button('preferences__btn-delete', 'Remove')
                ]
            }),
            createElement('div', { className: 'gp__control-actions' })
        ]
    });
}

function render({ editable = true }) {
    const bar = header();
    const screen = mountScreen(() =>
        renderPreferencesTemplate({
            item: {
                scope: 'computer',
                preferenceKind: 'files',
                document: { editable, label: 'Files' }
            },
            header: bar,
            isCurrent: () => true
        })
    );
    // The buttons of the header are part of the screen here.
    const wrap = document.createElement('div');
    wrap.append(bar.getElement(), screen);
    return wrap;
}

export default { title: 'Screens/Preferences', render };

async function ready(canvasElement) {
    await waitFor(() => expect(canvasElement.querySelector('[data-screen]')).toHaveAttribute('data-screen', 'ready'));
}

export const List = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await expect(await canvas.findByRole('cell', { name: 'Example file' })).toBeInTheDocument();
        await expect(canvas.getByRole('cell', { name: 'Second file' })).toBeInTheDocument();
        await expect(canvas.getByText('This document can be edited')).toBeInTheDocument();
        // Nothing is selected: only Add is available.
        await expect(canvas.getByRole('button', { name: 'Add' })).toHaveClass('active');
        await expect(canvas.getByRole('button', { name: 'Edit' })).not.toHaveClass('active');
        await userEvent.click(canvas.getByRole('cell', { name: 'Example file' }));
        await expect(canvas.getByRole('row', { selected: true })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'Edit' })).toHaveClass('active');
    }
};

export const OpenForm = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await userEvent.click(await canvas.findByRole('cell', { name: 'Example file' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
        const dialog = await canvas.findByRole('dialog');
        const form = within(dialog);
        await expect(form.getByRole('textbox', { name: /Name/ })).toHaveValue('Example files');
        // The fields are on tabs; another tab shows its own fields.
        const tabs = form.getAllByRole('tab');
        await expect(tabs.length).toBeGreaterThan(1);
        await userEvent.click(tabs[1]);
        await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
        await userEvent.click(form.getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    }
};

export const CreateForm = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await userEvent.click(await canvas.findByRole('button', { name: 'Add' }));
        const dialog = await canvas.findByRole('dialog');
        await expect(within(dialog).getByRole('button', { name: 'Save' })).toBeEnabled();
        await expect(within(dialog).getAllByRole('tab').length).toBeGreaterThan(1);
    }
};

export const ValidationError = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await userEvent.click(await canvas.findByRole('cell', { name: 'Example file' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Edit' }));
        const form = within(await canvas.findByRole('dialog'));
        const name = form.getByRole('textbox', { name: /Name/ });
        await userEvent.clear(name);
        await userEvent.click(form.getByRole('button', { name: 'Save' }));
        // The form is not saved: it says what to fix and stays open.
        await expect(await form.findByRole('alert')).not.toBeEmptyDOMElement();
        await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    }
};

export const ReadOnlyDocument = {
    args: { editable: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await ready(canvasElement);
        await expect(await canvas.findByText('This document is read-only')).toBeInTheDocument();
        // The page has no way to change the document.
        await expect(canvas.queryByRole('button', { name: 'Add' })).toBeNull();
        await userEvent.dblClick(canvas.getByRole('cell', { name: 'Example file' }));
        const form = within(await canvas.findByRole('dialog'));
        await expect(form.queryByRole('button', { name: 'Save' })).toBeNull();
        await expect(form.getByRole('textbox', { name: /Name/ })).toBeDisabled();
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
        await expect(alert).toHaveAttribute('data-editor-status', 'error');
    }
};

export const NothingToList = {
    parameters: { rpc: { scenario: 'empty' } },
    play: async ({ canvasElement }) => {
        await ready(canvasElement);
        await waitFor(() => expect(canvasElement.querySelectorAll('[data-preference-identity]')).toHaveLength(0));
        // Adding stays possible; there is nothing to edit.
        await expect(within(canvasElement).getByRole('button', { name: 'Add' })).toHaveClass('active');
        await expect(within(canvasElement).getByRole('button', { name: 'Edit' })).not.toHaveClass('active');
    }
};
