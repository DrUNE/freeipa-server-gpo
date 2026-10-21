import { expect, fn, userEvent, within } from 'storybook/test';
import { fieldControl, mockupFieldControl } from '@gpui/components/templates/preference/view/field-control';

/*
 * The labelled fields of the editor's forms, built the way the forms build them (`fieldControl`: the generic form and the
 * targeting operands; `mockupFieldControl`: the 22 preference documents). A field is found by its label and its value is
 * read with `read()`, which is what a form does on Save.
 */

const text = (id, label, value, extra = {}) => ({
    id,
    label,
    editable: true,
    value: { kind: 'text', value },
    ...extra
});

/** A host with the editor's root classes, with the fields one under another. */
function mount(...fields) {
    const host = document.createElement('div');
    host.className = 'gp__container gp__preference';
    host.style.cssText = 'max-width: 480px; padding: 12px; display: grid; gap: 12px';
    for (const field of fields) host.append(field.element.getElement());
    return host;
}

const controls = new Map();
/** Builds one control and remembers it for the play function of the story. */
function build(kind, field, options, readonly = false) {
    const control = (kind === 'mockup' ? mockupFieldControl : fieldControl)(field, readonly, false, options);
    controls.set(field.id, control);
    return control;
}

export default {
    parameters: {
        docs: {
            description: {
                component:
                    'A form field: a label bound with `for`, the control, a hint and an error, tied together with `aria-describedby`. Layouts follow the control: text, select, checkbox, plain, and the two mockup layouts of preference forms.'
            }
        }
    },
    title: 'Primitives/Field',
    args: { onChange: fn() }
};

export const Text = {
    render: () => mount(build('form', text('properties.fromPath', 'Source path', 'C:\\Windows'), { wrapText: true })),
    play: async ({ canvasElement }) => {
        const input = within(canvasElement).getByRole('textbox', { name: 'Source path' });
        await expect(input).toHaveValue('C:\\Windows');
        await userEvent.clear(input);
        await userEvent.type(input, 'D:\\Data');
        // What the form sends on Save.
        await expect(controls.get('properties.fromPath').read()).toEqual({ kind: 'text', value: 'D:\\Data' });
        await expect(canvasElement.querySelector('[data-field-id="properties.fromPath"]')).toBeInTheDocument();
    }
};

export const Required = {
    render: () => mount(build('form', text('name', 'Name', '', { required: true }), { wrapText: true })),
    play: async ({ canvasElement }) => {
        const field = canvasElement.querySelector('[data-field-id="name"]');
        // The asterisk is part of the label, but a screen reader hears the field as required through the input.
        await expect(within(field).getByRole('textbox', { name: /^Name/ })).toBeRequired();
        await expect(field.querySelector('[data-field-part="label"]')).toHaveTextContent('Name*');
    }
};

export const WithError = {
    render: () => mount(build('form', text('name', 'Name', 'x'), { wrapText: true })),
    play: async ({ canvasElement }) => {
        const field = canvasElement.querySelector('[data-field-id="name"]');
        const input = within(field).getByRole('textbox', { name: 'Name' });
        const error = field.querySelector('[data-field-part="error"]');
        await expect(error).toBeEmptyDOMElement();
        await expect(field).not.toHaveAttribute('data-field-invalid');

        controls.get('name').setError('The name is required.');
        await expect(error).toHaveTextContent('The name is required.');
        await expect(field).toHaveAttribute('data-field-invalid');
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        // The message is the description of the input.
        await expect(input).toHaveAccessibleDescription('The name is required.');

        // Typing clears it.
        await userEvent.type(input, 'y');
        await expect(error).toBeEmptyDOMElement();
        await expect(input).not.toHaveAttribute('aria-invalid');
        await expect(field).not.toHaveAttribute('data-field-invalid');
    }
};

export const ReadOnly = {
    render: () => mount(build('form', text('name', 'Name', 'fixed', { editable: false }), { wrapText: true })),
    play: async ({ canvasElement }) => {
        const field = canvasElement.querySelector('[data-field-id="name"]');
        const input = within(field).getByRole('textbox', { name: 'Name' });
        await expect(input).toBeDisabled();
        await expect(field).toHaveAttribute('data-field-readonly');
        // A read-only field says so, and the input points at the note.
        await expect(field.querySelector('[data-field-part="hint"]')).toBeInTheDocument();
        await expect(input).toHaveAccessibleDescription(/^Read-only\s*$/);
        // The value is returned as it was.
        await expect(controls.get('name').read()).toEqual({ kind: 'text', value: 'fixed' });
    }
};

export const Checkbox = {
    render: () =>
        mount(
            build(
                'form',
                {
                    id: 'metadata.disabled',
                    label: 'Disabled',
                    editable: true,
                    value: { kind: 'boolean', value: false }
                },
                { wrapCheckbox: true }
            )
        ),
    play: async ({ canvasElement }) => {
        const box = within(canvasElement).getByRole('checkbox', { name: 'Disabled' });
        await expect(box).not.toBeChecked();
        await userEvent.click(box);
        await expect(box).toBeChecked();
        await expect(controls.get('metadata.disabled').read()).toEqual({ kind: 'boolean', value: true });
        // The label is a click target as well.
        await userEvent.click(canvasElement.querySelector('[data-field-part="label"]'));
        await expect(box).not.toBeChecked();
    }
};

export const Select = {
    render: () =>
        mount(
            build(
                'form',
                {
                    id: 'properties.action',
                    label: 'Action',
                    editable: true,
                    value: { kind: 'action', value: 'update' }
                },
                { wrapSelect: true }
            )
        ),
    play: async ({ canvasElement }) => {
        const select = within(canvasElement).getByRole('combobox', { name: 'Action' });
        await expect(select).toHaveValue('update');
        await userEvent.selectOptions(select, 'delete');
        await expect(controls.get('properties.action').read()).toEqual({ kind: 'action', value: 'delete' });
    }
};

export const Number = {
    render: () =>
        mount(build('form', { id: 'count', label: 'Count', editable: true, value: { kind: 'integer', value: 3 } }, {})),
    play: async ({ canvasElement }) => {
        const input = within(canvasElement).getByRole('spinbutton', { name: 'Count' });
        await userEvent.clear(input);
        await userEvent.type(input, '12');
        await expect(controls.get('count').read()).toEqual({ kind: 'integer', value: 12 });
        // An emptied optional number is null, not 0.
        await userEvent.clear(input);
        await expect(controls.get('count').read()).toEqual({ kind: 'integer', value: null });
    }
};

export const Documents = {
    name: 'In a document layout',
    render: () =>
        mount(
            build('mockup', text('properties.targetPath', 'Target path', 'C:\\Users'), {}),
            build(
                'mockup',
                { id: 'properties.hidden', label: 'Hidden', editable: true, value: { kind: 'boolean', value: true } },
                {}
            ),
            build('mockup', text('metadata.desc', 'Description', 'Notes'), { textarea: true })
        ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox', { name: 'Target path' })).toHaveValue('C:\\Users');
        await expect(canvas.getByRole('checkbox', { name: 'Hidden' })).toBeChecked();
        await expect(canvas.getByRole('textbox', { name: 'Description' })).toHaveValue('Notes');
        // The layouts of the documents are not inside `.gpo-editor-field`; their sizes come from `.field`.
        await expect(canvasElement.querySelector('.gpo-editor-field')).toBeNull();
    }
};

export const DynamicallyDisabled = {
    render: () => mount(build('form', text('path', 'Path', 'kept'), { wrapText: true })),
    play: async ({ canvasElement }) => {
        const control = controls.get('path');
        const input = within(canvasElement).getByRole('textbox', { name: 'Path' });
        await userEvent.clear(input);
        await userEvent.type(input, 'edited');
        control.setError('Bad value');
        // Another field switches this one off: it returns to what the server sent and drops its error.
        await expect(control.setDynamicDisabled(true)).toBe(true);
        await expect(input).toBeDisabled();
        await expect(input).toHaveValue('kept');
        await expect(canvasElement.querySelector('[data-field-part="error"]')).toBeEmptyDOMElement();
        await expect(control.setDynamicDisabled(true)).toBe(false);
        await control.setDynamicDisabled(false);
        await expect(input).toBeEnabled();
    }
};
