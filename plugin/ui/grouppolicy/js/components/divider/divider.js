/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define(['../../util/element-creator'], function (elementCreator) { 'use strict';
    var exports = {};

    var { createElement } = elementCreator;


    function renderDivider() {
        const dividerLine = createElement('div', {
            className: 'divider__line'
        });
        
        const element = createElement('div', {
            className: 'divider',
            children: [dividerLine]
        });
        
        return element; // Return ElementCreator so callers can use its methods.
    }

    exports.renderDivider = renderDivider;


    return Object.freeze(exports);
});
