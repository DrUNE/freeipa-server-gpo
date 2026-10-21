import { expect, within } from 'storybook/test';
import {
    createBody,
    createButton,
    createCloseButton,
    createDialogShell,
    createErrorRegion,
    setConfirming
} from '@gpui/components/Dialog/Dialog';

/*
 * The chrome on its own: no behavior, only the look. The pinned values are the ones the dialogs had as global
 * `.preference__modal*` rules before they moved into Dialog.module.css.
 */

function render({ title = 'Edit setting', width, fill, lines = 3, error = '', confirming = false }) {
    const content = document.createElement('div');
    for (let i = 0; i < lines; i++)
        content.append(Object.assign(document.createElement('p'), { textContent: `Line ${i + 1}` }));
    const failure = createErrorRegion();
    failure.textContent = error;
    const body = createBody(null);
    body.append(failure, content);
    const { host, dialog } = createDialogShell({
        titleId: 'dialog-title',
        title,
        body,
        closeButton: createCloseButton('Close'),
        buttons: [createButton('cancel', 'Cancel'), createButton('apply', 'OK')],
        width,
        fill
    });
    if (confirming) setConfirming(dialog, true);
    const stage = document.createElement('div');
    stage.className = 'gp__container';
    stage.style.cssText = 'position:relative;height:420px';
    stage.append(host);
    return stage;
}

const part = (canvasElement, name) => canvasElement.querySelector(`[data-dialog-part="${name}"]`);
const style = element => getComputedStyle(element);

export default {
    parameters: {
        docs: {
            description: {
                component:
                    "The chrome of the editor's modal dialogs: the backdrop, the window, the header with the close button, the body with an error region and the footer. The behaviour (focus, keyboard, busy state, the discard question) is `editor-dialog.js`."
            }
        }
    },
    title: 'Dialogs/Dialog chrome',
    render
};

export const Default = {
    play: async ({ canvasElement }) => {
        const dialog = canvasElement.querySelector('[data-dialog]');
        await expect(dialog).toHaveAttribute('role', 'dialog');
        await expect(dialog).toHaveAccessibleName('Edit setting');
        await expect(style(dialog).position).toBe('fixed');
        await expect(style(dialog).borderTopWidth).toBe('1px');
        await expect(style(part(canvasElement, 'wrapper')).width).toBe('560px');
        const header = style(part(canvasElement, 'header'));
        await expect([header.backgroundColor, header.minHeight, header.borderBottomColor]).toEqual([
            'rgb(245, 245, 245)',
            '40px',
            'rgb(209, 209, 209)'
        ]);
        const title = style(part(canvasElement, 'title'));
        await expect([title.fontWeight, title.padding, title.textAlign]).toEqual(['600', '10px 40px', 'center']);
        const footer = style(part(canvasElement, 'footer'));
        await expect([footer.height, footer.padding, footer.gap, footer.justifyContent]).toEqual([
            '45px',
            '0px 20px',
            '10px',
            'right'
        ]);
        // Footer buttons are the editor's bordered 80x25 push buttons.
        const cancel = within(canvasElement).getByRole('button', { name: 'Cancel' });
        await expect([style(cancel).width, style(cancel).height]).toEqual(['80px', '25px']);
        await expect(style(part(canvasElement, 'close')).width).toBe('16px');
    }
};

export const CustomWidth = {
    args: { width: '640px' },
    play: async ({ canvasElement }) => {
        await expect(style(part(canvasElement, 'wrapper')).width).toBe('640px');
    }
};

export const LongTitleWraps = {
    args: { title: 'A very long policy title '.repeat(12) },
    play: async ({ canvasElement }) => {
        const title = part(canvasElement, 'title');
        await expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
        await expect(style(title).overflowWrap).toBe('anywhere');
    }
};

export const FillScrollsInsideTheWindow = {
    args: { fill: true, lines: 80 },
    play: async ({ canvasElement }) => {
        const dialog = canvasElement.querySelector('[data-dialog]');
        await expect(style(dialog).overflow).toBe('hidden');
        await expect(style(part(canvasElement, 'wrapper')).display).toBe('flex');
        // Header and footer keep their size when the content is taller than the window.
        await expect(style(part(canvasElement, 'header')).flexShrink).toBe('0');
        await expect(style(part(canvasElement, 'footer')).flexShrink).toBe('0');
    }
};

export const ErrorRegion = {
    args: { error: 'Something failed' },
    play: async ({ canvasElement }) => {
        await expect(style(part(canvasElement, 'error')).margin).toBe('20px');
    }
};

export const EmptyErrorRegionIsHidden = {
    play: async ({ canvasElement }) => {
        await expect(style(part(canvasElement, 'error')).display).toBe('none');
    }
};

export const Confirming = {
    args: { confirming: true },
    play: async ({ canvasElement }) => {
        await expect(style(canvasElement.querySelector('[data-dialog]')).filter).toBe('brightness(0.75)');
    }
};
