import { h } from '@gpui/lib/dom';
import { t } from '@gpui/locales/translations';
import styles from '@gpui/components/OrderableList/OrderableList.module.css';

/*
 * OrderableList: a list whose order the user changes, three ways that give the same result: the Up and Down buttons of
 * an item, Ctrl+Up and Ctrl+Down on its handle, and dragging the handle onto another item.
 *
 * Public hooks:
 *   [data-orderable-list]        the list (`role="list"`, named by `label`)
 *   [data-orderable-id="<id>"]   an item
 *   [data-orderable-part="handle|up|down|status"]
 * Every move is announced in a polite live region; the moved item keeps the focus. `onReorder(ids, change)` is called with
 * the new order and `{ id, from, to }`; the list does not change `items` itself (call `setItems`) unless `uncontrolled`.
 */

function format(key, values) {
    return Object.keys(values).reduce(
        (text, name) => text.replace('{' + name + '}', values[name]),
        t('orderableList.' + key)
    );
}

/**
 * @typedef {{ id: string, label: string }} OrderableItem
 * @param {{ label: string, items: OrderableItem[], disabled?: boolean, uncontrolled?: boolean,
 *   onReorder?: (ids: string[], change: { id: string, from: number, to: number }) => void }} options
 * @returns {{ element: HTMLElement, setItems: (items: OrderableItem[]) => void, ids: () => string[], setDisabled: (disabled: boolean) => void }}
 */
export function createOrderableList({ label, items, disabled = false, uncontrolled = false, onReorder }) {
    let current = items.slice();
    let isDisabled = disabled;
    let drag = null;
    const list = h('ul', { class: styles.list, role: 'list', 'aria-label': label, 'data-orderable-list': '' });
    const status = h('div', {
        class: styles.live,
        role: 'status',
        'aria-live': 'polite',
        'data-orderable-part': 'status'
    });
    const helpId = 'orderable-help-' + Math.random().toString(36).slice(2, 8);
    const help = h('span', { id: helpId, class: styles.live }, t('orderableList.handleHelp'));
    const element = h('div', { class: styles.root }, list, status, help);

    function move(id, to) {
        const from = current.findIndex(item => item.id === id);
        const target = Math.max(0, Math.min(current.length - 1, to));
        if (from < 0 || target === from) return;
        const next = current.slice();
        const [item] = next.splice(from, 1);
        next.splice(target, 0, item);
        if (uncontrolled) current = next;
        if (onReorder)
            onReorder(
                next.map(entry => entry.id),
                { id, from, to: target }
            );
        render();
        const handle = list.querySelector('[data-orderable-id="' + id + '"] [data-orderable-part="handle"]');
        if (handle) /** @type {HTMLElement} */ (handle).focus();
        status.textContent = format('moved', { label: item.label, index: target + 1, total: current.length });
    }

    function render() {
        list.replaceChildren(
            ...(current.length
                ? current.map((item, index) => renderItem(item, index))
                : [h('li', { class: styles.empty }, t('orderableList.empty'))])
        );
    }

    function renderItem(item, index) {
        const handle = h(
            'button',
            {
                type: 'button',
                class: styles.handle,
                draggable: isDisabled ? 'false' : 'true',
                disabled: isDisabled,
                'aria-label': format('handle', { label: item.label }),
                'aria-describedby': helpId,
                'data-orderable-part': 'handle'
            },
            '⋮⋮'
        );
        handle.addEventListener('keydown', event => {
            if (isDisabled || !event.ctrlKey || event.altKey || event.metaKey) return;
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
            event.preventDefault();
            move(item.id, index + (event.key === 'ArrowUp' ? -1 : 1));
        });
        handle.addEventListener('dragstart', event => {
            drag = { id: item.id, targetId: item.id, after: false };
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.id);
            }
            row.classList.add(styles.dragging);
        });
        handle.addEventListener('dragend', clearDrag);
        const up = h(
            'button',
            {
                type: 'button',
                class: styles.button,
                disabled: isDisabled || index === 0,
                'aria-label': format('moveUp', { label: item.label }),
                'data-orderable-part': 'up'
            },
            '↑'
        );
        const down = h(
            'button',
            {
                type: 'button',
                class: styles.button,
                disabled: isDisabled || index === current.length - 1,
                'aria-label': format('moveDown', { label: item.label }),
                'data-orderable-part': 'down'
            },
            '↓'
        );
        up.addEventListener('click', () => move(item.id, index - 1));
        down.addEventListener('click', () => move(item.id, index + 1));
        const row = h(
            'li',
            { class: styles.item, 'data-orderable-id': item.id },
            handle,
            h('span', { class: styles.title }, item.label),
            up,
            down
        );
        row.addEventListener('dragover', event => {
            if (!drag) return;
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
            const rect = row.getBoundingClientRect();
            drag.targetId = item.id;
            drag.after = event.clientY > rect.top + rect.height / 2;
            markDrop(row, drag.id !== item.id);
        });
        row.addEventListener('drop', event => {
            if (!drag) return;
            event.preventDefault();
            const from = current.findIndex(entry => entry.id === drag.id);
            let to = current.findIndex(entry => entry.id === drag.targetId) + (drag.after ? 1 : 0);
            if (from < to) to -= 1;
            const id = drag.id;
            clearDrag();
            move(id, to);
        });
        return row;
    }

    function markDrop(row, show) {
        list.querySelectorAll('li').forEach(entry => entry.classList.remove(styles.before, styles.after));
        if (show && drag) row.classList.add(drag.after ? styles.after : styles.before);
    }

    function clearDrag() {
        drag = null;
        list.querySelectorAll('li').forEach(entry =>
            entry.classList.remove(styles.dragging, styles.before, styles.after)
        );
    }

    render();
    return {
        element,
        setItems(next) {
            current = next.slice();
            render();
        },
        ids: () => current.map(item => item.id),
        setDisabled(value) {
            isDisabled = value;
            render();
        }
    };
}
