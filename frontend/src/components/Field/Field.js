import { cx, h } from '@gpui/lib/dom';

/*
 * One labelled field of a form: the label, the control, the "read-only" hint and the error message, wired so that a screen
 * reader gets the label as the name of the control and the hint and the error as its description.
 *
 * Public hooks (the look is still the editor's global sheets, `gpo-editor-field*` and `field*`):
 *   [data-field-id="<id>"]          the field (the id of the server descriptor; code looks fields up by it)
 *   [data-field-part="label"]       the label (a <label> bound to the control)
 *   [data-field-part="hint"]        the "read-only" note, present only for a read-only field
 *   [data-field-part="error"]       the error message, empty while the field is valid
 *   [data-field-readonly] / [data-field-invalid]   state, set by `setFieldReadonly` / `setFieldError`
 *
 * Layouts (the structure of the old forms, kept because their styles depend on it):
 *   checkbox  label, control, hint, error                 inside .field.field__checkbox
 *   text      label, control + error, hint                inside .field.field__input
 *   select    label, control, hint, error                 inside .field (with .field__label / .field__element)
 *   plain     label, control, hint, error                 flat, no wrappers
 *   mockup    label, control + error                      the layouts of the 22 preference documents (.field__input)
 *   mockup-checkbox   the control with its label inside one <label>
 */

/** @typedef {'checkbox' | 'text' | 'select' | 'plain' | 'mockup' | 'mockup-checkbox'} FieldLayout */

let sequence = 0;
const nextId = () => 'gpui-field-' + ++sequence;

/**
 * @param {{
 *   id: string,
 *   label: string,
 *   control: HTMLElement,
 *   focusTarget?: HTMLElement,
 *   layout: FieldLayout,
 *   required?: boolean,
 *   readonly?: boolean,
 *   readonlyText?: string,
 *   rootClass?: string[],
 *   labelClass?: string,
 *   labelId?: string
 * }} options
 *   `control` is what is placed in the field (an input, or a wrapper that holds one); `focusTarget` is the element the
 *   label points at, when that is not `control` itself (a checkbox inside its wrapper).
 * @returns {{ element: HTMLElement, errorElement: HTMLElement }}
 */
export function createField({
    id,
    label,
    control,
    focusTarget,
    layout,
    required,
    readonly,
    readonlyText,
    rootClass,
    labelClass
}) {
    const target = focusTarget || control;
    if (!target.id) target.id = nextId();
    const errorId = target.id + '-error';
    const hintId = target.id + '-hint';
    const error = h('span', { class: 'gpo-editor-field__error', id: errorId, 'data-field-part': 'error' });
    const hint =
        readonly && readonlyText
            ? h('span', { class: 'gpo-editor-field__hint', id: hintId, 'data-field-part': 'hint' }, readonlyText)
            : null;
    target.setAttribute('aria-describedby', cx(hint && hintId, errorId));

    const caption = [h('span', {}, label), required ? h('span', { class: 'gpo-editor-field__required' }, '*') : null];
    const checkboxLike = layout === 'checkbox' || layout === 'mockup-checkbox';
    const labelElement =
        checkboxLike && layout === 'mockup-checkbox'
            ? null
            : h(
                  'label',
                  {
                      class: cx(layout === 'mockup' ? null : 'gpo-editor-field__label', labelClass),
                      for: target.id,
                      'data-field-part': 'label'
                  },
                  ...caption
              );
    const classes = cx(
        // The 22 document layouts were never inside `.gpo-editor-field` (their sizes come from `.field`), keep it so.
        layout !== 'mockup' && layout !== 'mockup-checkbox' && 'gpo-editor-field',
        layout === 'checkbox' && 'field field__checkbox',
        layout === 'text' && 'field field__input',
        layout === 'select' && 'field',
        layout === 'mockup' && 'field field__input',
        layout === 'mockup-checkbox' && 'field field__checkbox',
        ...(rootClass || [])
    );

    /** @type {(Node | null)[]} */
    let children;
    if (layout === 'checkbox') {
        children = [wrap('field__label', labelElement), wrap('field__element', control), hint, error];
    } else if (layout === 'text') {
        children = [wrap('field__label', labelElement), wrap('field__element', control, error), hint];
    } else if (layout === 'select') {
        children = [wrap('field__label', labelElement), wrap('field__element', control), hint, error];
    } else if (layout === 'mockup') {
        children = [wrap('field__label', labelElement), wrap('field__element', control, error)];
    } else if (layout === 'mockup-checkbox') {
        children = [
            h(
                'label',
                { for: target.id, 'data-field-part': 'label' },
                control,
                h('span', { class: 'field__label-checkbox' }, label)
            ),
            error
        ];
    } else {
        children = [labelElement, control, hint, error];
    }
    const element = h(
        'div',
        { class: classes, 'data-field-id': id, 'data-field-readonly': readonly ? true : null },
        ...children
    );
    return { element, errorElement: error };
}

/** @param {string} className @param {...(Node | null)} children */
function wrap(className, ...children) {
    return h('div', { class: className }, ...children);
}

/**
 * Shows or clears the error of a field. The message is the text of the error element; `aria-invalid` on the control is the
 * business of the control's owner (`setError` of the field control), since only it knows the control.
 * @param {HTMLElement} field
 * @param {string} [message]
 */
export function setFieldError(field, message) {
    const error = field.querySelector('[data-field-part="error"]');
    if (error) error.textContent = message || '';
    if (message) field.setAttribute('data-field-invalid', '');
    else field.removeAttribute('data-field-invalid');
}
