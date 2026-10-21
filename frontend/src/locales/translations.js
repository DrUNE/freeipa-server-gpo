import * as __dep0 from '@gpui/locales/en';
import * as __dep1 from '@gpui/locales/ru';

var en = __dep0;
var ru = __dep1;

const translations = { en, ru };
let currentLang = 'en';

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

    return value;
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
