import { createElement } from '@gpui/util/element-creator';

function renderWorkspace() {
    const element = createElement('div', {
        className: 'workspace'
    });

    return element; // Return ElementCreator so callers can use its methods.
}

export { renderWorkspace };
