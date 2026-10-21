import { t } from '@gpui/locales/translations';

/**
 * Text from the `collections.*` locale group; `{name}` placeholders are replaced from `values`.
 * @param {string} key
 * @param {Record<string, string | number>} [values]
 */
export function tr(key, values) {
    let text = t('collections.' + key);
    Object.keys(values || {}).forEach(function (name) {
        text = text.replace('{' + name + '}', String(values[name]));
    });
    return text;
}
