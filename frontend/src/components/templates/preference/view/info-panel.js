import { createElement } from '@gpui/util/element-creator';
import { pt } from '@gpui/core/preference-view-common';

/**
 * The info panel under the preferences table: switches and description of the selected item.
 * `request(identity)` loads the item's fields and shows them; a newer request or `invalidate()` drops a stale answer.
 * @param {{ config: any, rootElement: HTMLElement, ensureItemFields: (identity: any) => Promise<any> }} context
 */
function createInfoPanel({ config, rootElement, ensureItemFields }) {
    let requestCounter = 0;

    function buildInfoPanel() {
        const info = createElement('div', {
            className: ['preference__info', config.isHelpOpen ? 'is-open' : null]
        });
        const settings = createElement('div', { className: 'preference__settings' });
        settings.append(
            createElement('div', {
                className: 'preference__settings-title',
                text: pt('settingsTitle')
            })
        );
        settings.append(createElement('div', { className: 'preference__settings-data' }));
        info.append(settings);
        const description = createElement('div', { className: 'preference__description' });
        description.append(
            createElement('div', {
                className: 'preference__description-title',
                text: pt('descriptionTitle')
            })
        );
        description.append(
            createElement('div', {
                className: ['preference__description-data', 'empty'],
                text: pt('noDescription')
            })
        );
        info.append(description);
        return info;
    }

    function settingsItems() {
        return [
            { id: 'metadata.bypassErrors', label: pt('settingBypassErrors') },
            { id: 'metadata.removePolicy', label: pt('settingRemovePolicy') },
            { id: 'properties.disabled', label: pt('settingDisabled') }
        ];
    }

    function fieldCheckedState(field) {
        const v = field && field.value;
        const raw = v && typeof v === 'object' ? v.value : v;
        if (raw === null || raw === undefined) return null;
        if (raw === true || raw === 1) return true;
        if (raw === false || raw === 0) return false;
        return Boolean(raw);
    }

    function fieldText(field) {
        const v = field && field.value;
        const raw = v && typeof v === 'object' ? v.value : v;
        if (Array.isArray(raw)) return raw.join('\n');
        return raw === null || raw === undefined ? '' : String(raw);
    }

    function renderInfoPanel(fields) {
        const dataSlot = rootElement.querySelector('.preference__settings-data');
        const descSlot = rootElement.querySelector('.preference__description-data');
        if (!dataSlot || !descSlot) return;
        const byId = new Map();
        (Array.isArray(fields) ? fields : []).forEach(function (field) {
            if (field && field.id !== undefined && !byId.has(field.id)) byId.set(field.id, field);
        });
        dataSlot.innerHTML = '';
        settingsItems().forEach(function (spec) {
            const field = byId.get(spec.id);
            const label = (field && field.label) || spec.label;
            const value = fieldCheckedState(field);
            dataSlot.appendChild(
                createElement('div', {
                    className: 'preference__settings-item',
                    children: [
                        createElement('div', { className: 'preference__settings-name', text: label + ':' }),
                        createElement('div', {
                            className: 'preference__settings-value',
                            text: value === null ? '' : value ? pt('yes') : pt('no')
                        })
                    ]
                }).getElement()
            );
        });
        const descField = byId.get('metadata.desc');
        const descText = fieldText(descField);
        descSlot.innerHTML = '';
        if (descText) {
            descSlot.classList.remove('empty');
            descSlot.textContent = descText;
        } else {
            descSlot.classList.add('empty');
            descSlot.textContent = pt('noDescription');
        }
    }

    function resetInfoPanel() {
        renderInfoPanel([]);
    }

    async function requestInfoPanel(identity) {
        const requestId = ++requestCounter;
        try {
            const fields = await ensureItemFields(identity);
            if (requestId !== requestCounter || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            if (fields) renderInfoPanel(fields);
            else resetInfoPanel();
        } catch (error) {
            if (requestId !== requestCounter || (typeof config.isCurrent === 'function' && !config.isCurrent())) return;
            resetInfoPanel();
        }
    }

    return {
        build: buildInfoPanel,
        render: renderInfoPanel,
        reset: resetInfoPanel,
        request: requestInfoPanel,
        invalidate() {
            requestCounter += 1;
        }
    };
}

export { createInfoPanel };
