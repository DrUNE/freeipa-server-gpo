/* GENERATED from frontend/src by "npm run build" in frontend/. Do not edit. */
define(['./en', './ru'], function (en$1, ru$1) { 'use strict';
    var exports = {};

  var en = en$1;
  var ru = ru$1;


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

  exports.getLanguage = getLanguage;
  exports.setLanguage = setLanguage;
  exports.t = t;


    return Object.freeze(exports);
});
