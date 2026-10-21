import * as elements from '@gpui/util/element-creator';
import {
    messageForError,
    createUnsupportedStatus,
    createErrorStatus,
    createDiagnostics,
    createPendingStatus
} from '@gpui/components/EditorStatus/EditorStatus';

/*
 * Compatibility layer: the notices themselves live in ./EditorStatus (plain DOM elements, private CSS Module).
 * The templates that still build their UI with ElementCreator get the same objects as before. New code
 * should use ./EditorStatus directly.
 */

function wrap(element) {
    return element && elements.ElementCreator.wrap(element);
}

function renderError(error, options) {
    return wrap(createErrorStatus(error, options));
}

function renderPending(pending, onReconcile) {
    return wrap(createPendingStatus(pending, onReconcile));
}

function renderDiagnostics(diagnostics) {
    return wrap(createDiagnostics(diagnostics));
}

function renderUnsupported(message) {
    return wrap(createUnsupportedStatus(message));
}

export { messageForError, renderError, renderPending, renderDiagnostics, renderUnsupported };
