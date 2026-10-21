import { createElement } from '@gpui/util/element-creator';

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

export { renderDivider };
