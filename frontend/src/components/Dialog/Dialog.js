import { cx, h } from '../../lib/dom';
import styles from './Dialog.module.css';

/*
 * The chrome of the editor's modal dialogs (see Dialog.module.css). `editor-dialog.js` builds the behavior
 * (focus, keyboard, busy state, discard question) on top of it.
 *
 * Styling is private. Code that lays out a dialog's content, and tests, find the parts through attributes:
 *   [data-dialog]                     the window (role="dialog"); `data-dialog-confirming` while a discard question is open
 *   [data-dialog-host]                the backdrop that holds the window
 *   [data-dialog-part="wrapper"]      the box inside the window
 *   [data-dialog-part="header"]       title bar            [data-dialog-part="title"]   the title
 *                                                          [data-dialog-part="close"]   the close button
 *   [data-dialog-part="body"]         the content area     [data-dialog-part="error"]   the error region in it
 *   [data-dialog-part="footer"]       the button row       [data-dialog-part="cancel"] / [data-dialog-part="apply"]
 * The window takes `width` (any CSS length, default 560px) and `fill` (the body scrolls inside the window).
 * Consumers that need their own look pass `className` / `hostClassName`; those classes are theirs.
 */

/** The window's own attributes; `data-dialog-confirming` is toggled with {@link setConfirming}. */
export function setConfirming(dialog, confirming) {
    if (confirming) dialog.setAttribute('data-dialog-confirming', '');
    else dialog.removeAttribute('data-dialog-confirming');
}

/**
 * The content area. Extra classes belong to the consumer.
 * @param {Node | string | null} content
 * @param {string} [className]
 */
export function createBody(content, className) {
    return h('div', { class: cx(styles.body, className), 'data-dialog-part': 'body' }, content);
}

/**
 * The always-present, initially empty region that shows an error on top of the body.
 * @param {string} [className]
 */
export function createErrorRegion(className) {
    return h('div', { class: cx(styles.error, className), role: 'alert', 'data-dialog-part': 'error' });
}

/**
 * A footer button. `button` and `btn-ok` / `btn-cancel` are legacy markers kept for code that queries them;
 * the look comes from the dialog's content-scope rules.
 * @param {'cancel' | 'apply'} kind
 * @param {string} label
 * @param {string} [className]
 */
export function createButton(kind, label, className) {
    return h(
        'button',
        {
            class: cx('button', kind === 'apply' ? 'btn-ok' : 'btn-cancel', className),
            type: 'button',
            'data-dialog-part': kind
        },
        label
    );
}

/**
 * The close button in the header (`close` is a legacy marker for code that queries it; it carries no styles).
 * @param {string} label accessible name
 * @param {string} [className]
 */
export function createCloseButton(label, className) {
    return h('button', {
        class: cx(styles.close, 'close', className),
        type: 'button',
        'aria-label': label,
        'data-dialog-part': 'close'
    });
}

/**
 * Assembles the dialog around ready parts.
 * @param {{ titleId: string, title: string, body: HTMLElement, closeButton: HTMLElement, buttons: HTMLElement[],
 *   width?: string, fill?: boolean, className?: string, hostClassName?: string }} options
 */
export function createDialogShell({
    titleId,
    title,
    body,
    closeButton,
    buttons,
    width,
    fill,
    className,
    hostClassName
}) {
    const dialog = h(
        'div',
        {
            class: cx(styles.dialog, fill && styles.fill, className),
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': titleId,
            tabindex: '-1',
            'data-dialog': true
        },
        h(
            'div',
            { class: styles.wrapper, 'data-dialog-part': 'wrapper' },
            h(
                'div',
                { class: styles.header, 'data-dialog-part': 'header' },
                h('div', { id: titleId, class: styles.title, 'data-dialog-part': 'title' }, title),
                closeButton
            ),
            body,
            h('div', { class: styles.footer, 'data-dialog-part': 'footer' }, ...buttons)
        )
    );
    if (width) dialog.style.setProperty('--dialog-width', width);
    // `gp__preference` is the scope of the editor's global field, table and tab rules for dialog content.
    const host = h(
        'div',
        { class: cx('gp__preference', styles.host, hostClassName), 'data-dialog-host': true },
        dialog
    );
    return { host, dialog };
}
