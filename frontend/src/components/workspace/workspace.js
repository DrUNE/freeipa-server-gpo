import * as __dep0 from '../../util/element-creator';


var { createElement } = __dep0;


function renderWorkspace() {
    const element = createElement('div', {
        className: 'workspace'
    });
    
    return element; // Return ElementCreator so callers can use its methods.
}

export { renderWorkspace };
