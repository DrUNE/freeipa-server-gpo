import * as __dep0 from '@gpui/util/element-creator';

var { createElement } = __dep0;

/**
 * Renders the fallback template when no template is defined.
 * @returns {ElementCreator} Element containing a template-not-defined message.
 */
function renderDefaultTemplate() {
    const defaultTemplate = createElement('div', {
        className: 'gp__default-template',
        children: [
            createElement('div', {
                className: 'default-template__message',
                text: 'Шаблон не определен'
            })
        ]
    });

    return defaultTemplate;
}

export { renderDefaultTemplate };
