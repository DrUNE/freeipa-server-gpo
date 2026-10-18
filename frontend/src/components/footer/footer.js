import * as __dep0 from '../../util/element-creator';

var { createElement } = __dep0;

function renderFooter(container) {
    const element = createElement('div', {
        className: 'gp__footer'
    });
    container.appendChild(element.getElement());
    return element.getElement();
}

export { renderFooter };
