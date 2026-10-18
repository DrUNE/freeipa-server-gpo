/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define(['../../util/element-creator'], function (elementCreator) { 'use strict';
    var exports = {};

    var { createElement } = elementCreator;


    function renderFooter(container) {
        const element = createElement('div', {
            className: 'gp__footer',
        });
        container.appendChild(element.getElement());
        return element.getElement();
    }

    exports.renderFooter = renderFooter;


    return Object.freeze(exports);
});
