import { createElement } from '@gpui/util/element-creator';

function renderFooter(container) {
    const element = createElement('div', {
        className: 'gp__footer'
    });
    container.appendChild(element.getElement());
    return element.getElement();
}

export { renderFooter };
