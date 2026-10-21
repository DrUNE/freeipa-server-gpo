import * as elements from '@gpui/util/element-creator';
import * as status from '@gpui/components/EditorStatus/EditorStatus';

/*
 * Compatibility layer: the notices themselves live in ./EditorStatus (plain DOM elements, private CSS Module).
 * The templates that still build their UI with ElementCreator get the same objects as before. New code
 * should use ./EditorStatus directly.
 */

function wrap(element) {
    return element && elements.ElementCreator.wrap(element);
}

var messageForError = status.messageForError;

function renderError(error, options) {
    return wrap(status.createErrorStatus(error, options));
}

function renderPending(pending, onReconcile) {
    return wrap(status.createPendingStatus(pending, onReconcile));
}

function renderDiagnostics(diagnostics) {
    return wrap(status.createDiagnostics(diagnostics));
}

function renderUnsupported(message) {
    return wrap(status.createUnsupportedStatus(message));
}

export { messageForError, renderError, renderPending, renderDiagnostics, renderUnsupported };
