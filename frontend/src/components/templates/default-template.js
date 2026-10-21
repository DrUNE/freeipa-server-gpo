import { createElement } from '@gpui/util/element-creator';

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
