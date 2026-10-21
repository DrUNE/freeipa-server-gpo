import { ElementCreator } from '@gpui/util/element-creator';
import { createBreadcrumb } from '@gpui/components/Breadcrumb/Breadcrumb';
import { t } from '@gpui/locales/translations';

function render(segments, onNavigate) {
    return ElementCreator.wrap(createBreadcrumb({ label: t('navigation.path'), segments, onNavigate }));
}

function attachFilter(header, view) {
    if (!header || !view) return;
    const input = Array.from(view.querySelectorAll('[data-policy-filter]')).find(function (candidate) {
        const owner = candidate.closest('[role="dialog"]');
        // The entire editor lives in FreeIPA's outer dialog. Exclude
        // only dialogs nested inside this view, not that outer shell.
        return !owner || !view.contains(owner);
    });
    if (!input) return;
    const toolbar = input.parentElement;
    input.classList.add('gpo-category-path__filter');
    header.appendChild(input);
    if (toolbar && toolbar.classList.contains('gpo-security-workbench__toolbar') && !toolbar.children.length)
        toolbar.remove();
}

export { render, attachFilter };
