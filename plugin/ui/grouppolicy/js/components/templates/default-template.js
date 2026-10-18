/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define(['../../util/element-creator'], function (elementCreator) { 'use strict';
    var exports = {};

    var { createElement } = elementCreator;


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

    exports.renderDefaultTemplate = renderDefaultTemplate;


    return Object.freeze(exports);
});
