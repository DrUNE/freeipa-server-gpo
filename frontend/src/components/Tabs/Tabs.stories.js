import { expect, fn, userEvent, within } from 'storybook/test';
import { createTabs } from '@gpui/components/Tabs/Tabs';

/** Panels with a field each, like the preference form. */
function panel(text) {
    const content = document.createElement('p');
    content.textContent = text;
    return content;
}

const instances = [];

function render({ active, onChange, three = false }) {
    const tabs = createTabs({
        label: 'Preference item',
        active,
        onChange,
        tabs: [
            { id: 'tab-basic', label: 'Basic settings', content: panel('Basic panel') },
            { id: 'tab-general', label: 'General', content: panel('General panel') }
        ].concat(three ? [{ id: 'tab-extra', label: 'Extra', content: panel('Extra panel') }] : [])
    });
    instances.push(tabs);
    const host = document.createElement('div');
    host.className = 'gp__container gp__preference';
    host.style.cssText = 'max-width: 480px';
    host.append(tabs.element);
    return host;
}

export default { title: 'Primitives/Tabs', args: { onChange: fn() }, render };

export const Default = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const list = canvas.getByRole('tablist', { name: 'Preference item' });
        const [basic, general] = within(list).getAllByRole('tab');
        await expect(basic).toHaveAttribute('aria-selected', 'true');
        await expect(general).toHaveAttribute('aria-selected', 'false');
        // Only the shown tab is a stop of the Tab key.
        await expect([basic.tabIndex, general.tabIndex]).toEqual([0, -1]);
        // The panel is named by its tab.
        await expect(canvas.getByRole('tabpanel', { name: 'Basic settings' })).toHaveTextContent('Basic panel');
        await expect(canvasElement.querySelector('[data-tab-panel="tab-general"]')).not.toHaveClass('active');
    }
};

export const Click = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('tab', { name: 'General' }));
        await expect(canvas.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
        await expect(canvas.getByRole('tabpanel', { name: 'General' })).toHaveClass('active');
        await expect(canvasElement.querySelector('[data-tab-panel="tab-basic"]')).not.toHaveClass('active');
        await expect(args.onChange).toHaveBeenCalledWith('tab-general');
        // Clicking the shown tab again changes nothing.
        await userEvent.click(canvas.getByRole('tab', { name: 'General' }));
        await expect(args.onChange).toHaveBeenCalledTimes(1);
    }
};

export const Keyboard = {
    args: { three: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [basic, general, extra] = canvas.getAllByRole('tab');
        basic.focus();
        await userEvent.keyboard('{ArrowRight}');
        await expect(general).toHaveFocus();
        await expect(general).toHaveAttribute('aria-selected', 'true');
        await userEvent.keyboard('{End}');
        await expect(extra).toHaveFocus();
        // Past the last tab it wraps around.
        await userEvent.keyboard('{ArrowRight}');
        await expect(basic).toHaveFocus();
        await userEvent.keyboard('{ArrowLeft}');
        await expect(extra).toHaveFocus();
        await userEvent.keyboard('{Home}');
        await expect(basic).toHaveFocus();
        await expect(canvas.getByRole('tabpanel', { name: 'Basic settings' })).toBeInTheDocument();
    }
};

export const OtherStartTab = {
    args: { active: 'tab-general' },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('tab', { name: 'General' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        await expect(canvasElement.querySelector('#tab-general')).toHaveClass('active');
    }
};

export const PanelFilledLater = {
    play: async () => {
        const tabs = instances[instances.length - 1];
        const extra = document.createElement('p');
        extra.textContent = 'Added later';
        tabs.panel('tab-general').append(extra);
        await expect(tabs.panel('tab-general')).toHaveTextContent('General panel');
        await expect(tabs.panel('tab-general')).toHaveTextContent('Added later');
    }
};

export const FromOutside = {
    play: async ({ canvasElement, args }) => {
        const tabs = instances[instances.length - 1];
        tabs.activate('tab-general');
        await expect(tabs.active()).toBe('tab-general');
        await expect(within(canvasElement).getByRole('tab', { name: 'General' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        await expect(args.onChange).toHaveBeenCalledWith('tab-general');
        // An unknown id is ignored.
        tabs.activate('nope');
        await expect(tabs.active()).toBe('tab-general');
    }
};
