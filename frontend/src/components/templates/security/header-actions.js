import { createElement } from '@gpui/util/element-creator';
import { t } from '@gpui/locales/translations';

let sequence = 0;

// Use the same header controls as Preferences, including their order and styling.
function bind(header, fallbackHost, handlers) {
    const headerElement = header && header.getElement ? header.getElement() : null;
    let controls = headerElement && headerElement.querySelector('.gp__control');
    const local = !controls;
    if (local) {
        const wrapper = createElement('div', { className: 'gp__control' });
        fallbackHost.append(wrapper);
        controls = wrapper.getElement();
    }
    const owner = 'security-' + ++sequence;
    controls.setAttribute('data-security-owner', owner);
    controls.style.display = 'flex';
    const states = {};
    ['create', 'edit', 'delete'].forEach(function (action) {
        let button = controls.querySelector('.preferences__btn-' + action);
        if (!button) {
            const element = createElement('button', {
                className: ['button', 'preferences__btn-' + action],
                attrs: { type: 'button' }
            });
            controls.appendChild(element.getElement());
            button = element.getElement();
        }
        const initial = {
            text: button.textContent,
            display: button.style.display,
            disabled: button.disabled,
            active: button.classList.contains('active')
        };
        const handler = handlers[action];
        button.textContent = t(
            action === 'create' ? 'security.addItem' : action === 'delete' ? 'security.remove' : 'header.edit'
        );
        button.style.display = handler ? '' : 'none';
        function click(event) {
            if (!button.disabled && handler) handler(event);
        }
        button.addEventListener('click', click);
        states[action] = { button: button, initial: initial, click: click };
    });
    function ownsHeader() {
        return controls.getAttribute('data-security-owner') === owner;
    }
    function update(selection, busy) {
        if (!ownsHeader()) return;
        ['create', 'edit', 'delete'].forEach(function (action) {
            const enabled =
                !busy && Boolean(handlers[action]) && (action === 'create' || Boolean(selection && selection[action]));
            states[action].button.disabled = !enabled;
            states[action].button.classList.toggle('active', enabled);
        });
    }
    update(null, false);
    return {
        update: update,
        cleanup: function () {
            Object.keys(states).forEach(function (action) {
                const state = states[action];
                state.button.removeEventListener('click', state.click);
                if (!ownsHeader()) return;
                state.button.textContent = state.initial.text;
                state.button.style.display = state.initial.display;
                state.button.disabled = state.initial.disabled;
                state.button.classList.toggle('active', state.initial.active);
            });
            if (ownsHeader()) {
                controls.removeAttribute('data-security-owner');
                controls.style.display = 'none';
                if (local) controls.remove();
            }
        }
    };
}

export { bind };
