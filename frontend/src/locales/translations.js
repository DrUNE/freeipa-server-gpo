import * as en from '@gpui/locales/en';
import * as ru from '@gpui/locales/ru';

const translations = { en, ru };
let currentLang = 'en';

/**
 * Возвращает перевод по ключу для текущего языка (см. setLanguage).
 * Ключ — путь через точки во вложенном словаре локали, например 'dialog.title'.
 * Если ключ не найден (или путь обрывается на несуществующем уровне),
 * возвращается сам ключ, чтобы в интерфейсе было видно, чего не хватает.
 * Ключ должен указывать на строку: путь к вложенному словарю вернул бы объект, а не текст.
 *
 * @param {string} key Ключ перевода, например 'dialog.title'.
 * @returns {string} Перевод или сам ключ, если перевод не найден.
 */
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];

    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            return key; // Key not found.
        }
    }

    return /** @type {string} */ (value);
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
    }
}

function getLanguage() {
    return currentLang;
}

export { t, setLanguage, getLanguage };
