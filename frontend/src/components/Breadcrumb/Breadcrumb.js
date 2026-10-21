import { h } from '@gpui/lib/dom';

/*
 * Breadcrumb: the path to the open node; every ancestor is a button, the last segment is the current page.
 *
 * Public hooks (the look is still the editor's global sheet, `gpo-category-path*`):
 *   [data-category-path]   the nav element (landmark named by `label`)
 * Keyboard: the buttons form one Tab stop (the last one, or the one focused last); Left, Right, Home and End move between them.
 */

/**
 * @param {{ label: string, segments: Array<{ title?: string, item?: unknown } | null | undefined>, onNavigate?: (item: any) => void }} options
 * @returns {HTMLElement}
 */
export function createBreadcrumb({ label, segments, onNavigate }) {
    const parts = (segments || []).filter(segment => segment && segment.title);
    const list = h('ol', { class: 'gpo-category-path__list' });
    let focused = Math.max(0, parts.length - 1);

    function render() {
        Array.from(list.querySelectorAll('button')).forEach((button, index) => {
            button.tabIndex = index === focused ? 0 : -1;
        });
    }

    parts.forEach((segment, index) => {
        const navigable = Boolean(segment.item && onNavigate);
        const text = h(
            navigable ? 'button' : 'span',
            {
                class: 'gpo-category-path__segment',
                type: navigable ? 'button' : null,
                title: segment.title,
                'aria-current': index === parts.length - 1 ? 'page' : null
            },
            segment.title
        );
        if (navigable) {
            text.addEventListener('click', () => onNavigate?.(segment.item));
            text.addEventListener('focus', () => {
                focused = index;
                render();
            });
        }
        list.append(
            h(
                'li',
                {},
                index ? h('span', { class: 'gpo-category-path__separator', 'aria-hidden': 'true' }, ' / ') : null,
                text
            )
        );
    });

    list.addEventListener('keydown', event => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const buttons = Array.from(list.querySelectorAll('button'));
        const index = buttons.indexOf(/** @type {HTMLButtonElement} */ (event.target));
        if (index < 0) return;
        const next = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: buttons.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        focused = Math.max(0, Math.min(buttons.length - 1, next));
        render();
        buttons[focused].focus({ preventScroll: true });
    });

    render();
    return h('nav', { class: 'gpo-category-path', 'data-category-path': '', 'aria-label': label }, list);
}
