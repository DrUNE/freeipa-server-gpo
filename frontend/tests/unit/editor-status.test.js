import assert from 'node:assert/strict';
import { test } from 'vitest';
import * as en from '@gpui/locales/en';
import * as ru from '@gpui/locales/ru';
import * as translations from '@gpui/locales/translations';
import * as status from '@gpui/components/EditorStatus/EditorStatus';

import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../src');

/*
 * Covers the user-facing error text of EditorStatus and the completeness of the Security locale keys.
 * No DOM or fake API: the real en/ru locales and the translations module are used directly, and the language is
 * switched with translations.setLanguage. The second test also reads the security template sources from src/.
 */

// A server error is shown as a category message plus, when the server diagnostic is a known one, a translated detail;
// unknown diagnostics must not leak untranslated server text into the UI.
test('error messages use the selected language and translate known server details', () => {
    for (const [language, locale] of [
        ['en', en],
        ['ru', ru]
    ]) {
        translations.setLanguage(language);
        for (const category of Object.keys(locale.editorStatus.errors)) {
            assert.equal(status.messageForError({ category }), locale.editorStatus.errors[category]);
        }
        assert.equal(
            status.messageForError({ message: 'Security policy actions must be a list' }),
            locale.editorStatus.errors.operational + ' ' + locale.editorStatus.details.securityActionsList
        );
        assert.equal(
            status.messageForError({
                category: 'validation',
                field: 'policies',
                message: 'Security policy actions must be a list.'
            }),
            locale.editorStatus.errors.validation + ' ' + locale.editorStatus.details.securityActionsList
        );
        assert.equal(
            status.messageForError({ category: 'validation', message: 'Security element actions must be a list.' }),
            locale.editorStatus.errors.validation + ' ' + locale.editorStatus.details.securityElementActionsList
        );
        assert.equal(
            status.messageForError({ category: 'validation', message: 'Keyed-row actions must be a list.' }),
            locale.editorStatus.errors.validation + ' ' + locale.editorStatus.details.securityRowActionsList
        );
        assert.equal(
            status.messageForError({ category: 'validation', message: 'Untranslated server diagnostic' }),
            locale.editorStatus.errors.validation
        );
    }
});

// Static check: both locales have the same key tree, and every tr('key', ...) call in the security templates resolves
// to a real translation (a missing key makes t() return the key itself) in en and ru.
test('Security and editor-status locale keys are complete in both languages', () => {
    function paths(value, prefix = '') {
        return Object.entries(value).flatMap(([key, child]) =>
            typeof child === 'object' ? paths(child, prefix + key + '.') : [prefix + key]
        );
    }
    for (const area of ['security', 'editorStatus']) assert.deepEqual(paths(en[area]).sort(), paths(ru[area]).sort());
    const files = [
        'components/templates/security-template.js',
        'components/templates/advanced-audit-template.js',
        ...fs
            .readdirSync(path.join(root, 'components/templates/security'))
            .map(file => 'components/templates/security/' + file)
    ];
    for (const language of ['en', 'ru']) {
        translations.setLanguage(language);
        for (const file of files) {
            const source = fs.readFileSync(path.join(root, file), 'utf8');
            const relative = source.includes("t('security.' + key)");
            for (const match of source.matchAll(/\btr\('([^']+)'\s*,/g)) {
                const key = relative ? 'security.' + match[1] : match[1];
                assert.notEqual(translations.t(key), key, language + ': ' + file + ': ' + key);
            }
        }
    }
});
