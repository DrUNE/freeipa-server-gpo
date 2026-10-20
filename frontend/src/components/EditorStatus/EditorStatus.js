import { cx, h } from '../../lib/dom';
import * as dto from '../../util/editor-dto';
import * as translations from '../../locales/translations';
import styles from './EditorStatus.module.css';

/*
 * Status notices of the editor: an error with optional actions, a pending-publication notice, an
 * "unsupported" notice and a block of technical diagnostics.
 *
 * Styling is private (EditorStatus.module.css). Other code and tests find a notice through attributes:
 *   [data-editor-status]                 the notice root; the value is its kind: error | pending | unsupported
 *   [data-editor-status-action]          an action button inside a notice
 *   [data-editor-status-diagnostics]     the diagnostics block
 *   [data-error-category]                on an error: its category
 */

/**
 * What the editor passes as an error: an `EditorError` from util/API.js, or any object with the same fields.
 * @typedef {{ message?: string, category?: string, field?: string, pendingPublication?: boolean } | null | undefined} EditorStatusError
 */

const DETAILS = {
    'Security policy actions must be a list': 'securityActionsList',
    'Security element actions must be a list': 'securityElementActionsList',
    'Keyed-row actions must be a list': 'securityRowActionsList',
    'At least one non-empty list entry is required': 'listRequiresEntry',
    'Invalid collection entries': 'collectionInvalidEntry'
};

function text(key) {
    return translations.t('editorStatus.' + key);
}

/** Localized message for an error: its category's text plus a translated detail when the server message is known. */
/** @param {EditorStatusError} error */
export function messageForError(error) {
    const category = dto.errorCategory(error).replace(/-/g, '_');
    const key = 'editorStatus.errors.' + category;
    let prefix = translations.t(key);
    if (prefix === key) prefix = text('errors.operational');
    const message = error && error.message ? String(error.message) : '';
    // RPC diagnostics are not localized UI strings. Append only translated
    // details, retaining the original error object for diagnostic callers.
    const detail = DETAILS[message.replace(/[.]$/, '')];
    return detail ? prefix + ' ' + text('details.' + detail) : prefix;
}

function createAction(label, onClick) {
    const button = h('button', { class: 'button', type: 'button', 'data-editor-status-action': true }, label);
    button.addEventListener('click', onClick);
    return button;
}

/**
 * @param {EditorStatusError} error
 * @param {{ onRefresh?: (event: Event) => void, onReconcile?: (event: Event) => void }} [options]
 *   actions are shown only for the callbacks that are given (reconcile also needs a publication error)
 */
export function createErrorStatus(error, options = {}) {
    const category = dto.errorCategory(error).replace(/-/g, '_');
    const actions = [];
    if (typeof options.onRefresh === 'function') actions.push(createAction(text('refresh'), options.onRefresh));
    if (
        (category.indexOf('publication') !== -1 || (error && error.pendingPublication)) &&
        typeof options.onReconcile === 'function'
    ) {
        actions.push(createAction(text('reconcile'), options.onReconcile));
    }
    return h(
        'div',
        {
            class: cx(styles.status, styles.error),
            role: 'alert',
            'data-editor-status': 'error',
            'data-error-category': category
        },
        h('div', { class: styles.message }, messageForError(error)),
        error && error.field && h('div', { class: styles.field }, text('field') + ': ' + error.field),
        actions.length > 0 && h('div', { class: styles.actions }, ...actions)
    );
}

/** The "publication is pending" notice, or `null` when nothing is pending. */
export function createPendingStatus(pending, onReconcile) {
    if (!pending) return null;
    return h(
        'div',
        { class: cx(styles.status, styles.pending), role: 'status', 'data-editor-status': 'pending' },
        h('div', { class: styles.message }, text('pending')),
        typeof onReconcile === 'function' && createAction(text('reconcile'), onReconcile)
    );
}

/** A notice that the policy source is not supported by the editor. */
export function createUnsupportedStatus(message) {
    return h(
        'div',
        { class: cx(styles.status, styles.unsupported), role: 'status', 'data-editor-status': 'unsupported' },
        message
    );
}

/** Collapsible technical details: one line per diagnostic, `code: message`. */
export function createDiagnostics(diagnostics) {
    return h(
        'details',
        { class: styles.diagnostics, 'data-editor-status-diagnostics': true },
        h('summary', {}, text('technicalDetails')),
        ...(diagnostics || []).map(diagnostic =>
            h('pre', {}, [diagnostic.code, diagnostic.message].filter(Boolean).join(': '))
        )
    );
}
