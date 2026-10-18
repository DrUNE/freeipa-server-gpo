import * as __dep0 from '../../util/element-creator';


var { createElement } = __dep0;


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
