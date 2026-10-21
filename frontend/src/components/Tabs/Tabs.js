import { cx, h } from '@gpui/lib/dom';

/*
 * Tabs: a row of tab buttons over a set of panels, one of them shown.
 *
 * Public hooks (the look is still the editor's global sheets, `preference__modal-tabs` and friends):
 *   [data-tabs]               the whole component
 *   [data-tab="<id>"]         a tab button (role="tab"; `aria-selected`, and the class `active` for the styles)
 *   [data-tab-panel="<id>"]   its panel (role="tabpanel"); the element id is the tab id as well, for code that looks it up
 * Keyboard: Left and Right move to the previous and next tab and show it, Home and End to the first and the last; only the
 * shown tab is in the Tab order.
 */

/**
 * @typedef {{ id: string, label: string, content?: Node | null, hidden?: boolean }} TabSpec
 *   `content` may be added later through `panel(id)`; a `hidden` tab has its panel but no button (nothing to show in it)
 * @typedef {{ element: HTMLElement, activate: (id: string) => void, active: () => string, panel: (id: string) => HTMLElement }} Tabs
 */

/**
 * @param {{ label: string, tabs: TabSpec[], active?: string, className?: string, onChange?: (id: string) => void }} options
 *   `label` names the tab list for a screen reader.
 * @returns {Tabs}
 */
export function createTabs({ label, tabs, active, className, onChange }) {
    const shown = tabs.filter(tab => !tab.hidden);
    let current = shown.some(tab => tab.id === active) ? /** @type {string} */ (active) : (shown[0] || tabs[0]).id;

    const buttons = shown.map(tab => {
        const button = h(
            'button',
            {
                class: 'preference__tab-button',
                type: 'button',
                role: 'tab',
                'data-tab': tab.id,
                'aria-controls': tab.id
            },
            tab.label
        );
        button.id = tab.id + '-tab';
        button.addEventListener('click', () => activate(tab.id, false));
        return button;
    });
    const panels = tabs.map(tab => {
        const panel = h(
            'div',
            { class: 'tab-content', role: 'tabpanel', 'data-tab-panel': tab.id, 'aria-labelledby': tab.id + '-tab' },
            tab.content
        );
        panel.id = tab.id;
        return panel;
    });
    const list = h('div', { class: 'tab-buttons', role: 'tablist', 'aria-label': label }, ...buttons);
    list.addEventListener('keydown', event => {
        const index = shown.findIndex(tab => tab.id === current);
        const last = shown.length - 1;
        const target = {
            ArrowRight: index === last ? 0 : index + 1,
            ArrowLeft: index === 0 ? last : index - 1,
            Home: 0,
            End: last
        }[event.key];
        if (target === undefined) return;
        event.preventDefault();
        activate(shown[target].id, true);
    });
    const element = h('div', { class: cx('preference__modal-tabs', className), 'data-tabs': true }, list, ...panels);

    /** @param {string} id @param {boolean} focus */
    function activate(id, focus) {
        if (!tabs.some(tab => tab.id === id)) return;
        const changed = id !== current;
        current = id;
        buttons.forEach((button, index) => {
            const on = shown[index].id === id;
            button.classList.toggle('active', on);
            button.setAttribute('aria-selected', String(on));
            button.tabIndex = on ? 0 : -1;
            if (on && focus) button.focus();
        });
        panels.forEach((panel, index) => panel.classList.toggle('active', tabs[index].id === id));
        if (changed && onChange) onChange(id);
    }
    activate(current, false);

    return {
        element,
        activate: id => activate(id, false),
        active: () => current,
        panel: id => /** @type {HTMLElement} */ (panels[tabs.findIndex(tab => tab.id === id)])
    };
}
