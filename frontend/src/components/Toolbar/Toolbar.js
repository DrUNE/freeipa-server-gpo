import { cx, h } from '@gpui/lib/dom';
import styles from '@gpui/components/Toolbar/Toolbar.module.css';

/*
 * A group of action buttons: the Add / Edit / Remove / Move row of a table, the Upload / Download row of a file list.
 *
 * Styling is private. Code that lays a toolbar out, and tests, find it and its parts through attributes and roles:
 *   [data-toolbar]               the group (role="group", named by `label`)
 *   [data-toolbar-item="<id>"]   a button; its accessible name is its label
 * Buttons are enabled and disabled with `setToolbarItem`, never by touching `disabled` and `active` directly: the editor's
 * global `.button` is grey until it has the class `active`, so the two always change together.
 * The consumer's own classes go in `className` (position, spacing, the width of the buttons).
 */

/**
 * @typedef {{ id: string, label: string, onClick: (event: MouseEvent) => void, disabled?: boolean, title?: string, className?: string }} ToolbarItem
 */

/**
 * @param {{ label: string, items: ToolbarItem[], className?: string }} options
 * @returns {HTMLElement}
 */
export function createToolbar({ label, items, className }) {
    const toolbar = h(
        'div',
        { class: cx(styles.toolbar, className), role: 'group', 'aria-label': label, 'data-toolbar': true },
        ...items.map(createItem)
    );
    return toolbar;
}

/** @param {ToolbarItem} item */
function createItem({ id, label, onClick, disabled = false, title, className }) {
    const button = h(
        'button',
        { class: cx('button', styles.item, className), type: 'button', 'data-toolbar-item': id, title },
        label
    );
    button.addEventListener('click', onClick);
    applyState(button, { disabled });
    return button;
}

/** @param {HTMLButtonElement} button @param {{ disabled?: boolean, title?: string }} state */
function applyState(button, { disabled, title }) {
    if (disabled !== undefined) {
        button.disabled = disabled;
        button.classList.toggle('active', !disabled);
    }
    if (title !== undefined) {
        if (title) button.title = title;
        else button.removeAttribute('title');
    }
}

/** The button of an item, or `null`. @param {HTMLElement} toolbar @param {string} id */
export function toolbarItem(toolbar, id) {
    return /** @type {HTMLButtonElement | null} */ (toolbar.querySelector(`[data-toolbar-item="${id}"]`));
}

/**
 * Enables or disables an item (and sets its tooltip). An unknown id is ignored: a screen may show fewer items than it updates.
 * @param {HTMLElement} toolbar
 * @param {string} id
 * @param {{ disabled?: boolean, title?: string }} state
 */
export function setToolbarItem(toolbar, id, state) {
    const button = toolbarItem(toolbar, id);
    if (button) applyState(button, state);
}
