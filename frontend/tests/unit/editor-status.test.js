import assert from 'node:assert/strict';
import { test, vi } from 'vitest';
import * as enModule from '../../src/locales/en.js';
import * as ruModule from '../../src/locales/ru.js';
import * as translationsModule from '../../src/locales/translations.js';
import * as statusModule from '../../src/components/editor-status.js';

vi.mock('../../src/util/element-creator.js', () => ({ createElement: (tag, options) => ({ tag, ...options }) }));

import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../src');
const en = enModule;
const ru = ruModule;
const translations = translationsModule;
const status = statusModule;

test('editor errors, actions and pending notices use the selected language', () => {
    for (const [language, locale] of [
        ['en', en],
        ['ru', ru]
    ]) {
        translations.setLanguage(language);
        for (const category of Object.keys(locale.editorStatus.errors)) {
            assert.equal(status.messageForError({ category }), locale.editorStatus.errors[category]);
        }
        const error = status.renderError(
            { category: 'publication-conflict', field: 'value' },
            { onRefresh() {}, onReconcile() {} }
        );
        assert.equal(error.children[1].text, locale.editorStatus.field + ': value');
        assert.deepEqual(
            Array.from(error.children[2].children, action => action.text),
            [locale.editorStatus.refresh, locale.editorStatus.reconcile]
        );
        assert.equal(status.renderPending({}, () => {}).children[0].text, locale.editorStatus.pending);
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
        const details = status.renderDiagnostics([{ code: 'source_error', message: 'Untranslated diagnostic' }]);
        assert.equal(details.tag, 'details');
        assert.equal(details.children[0].text, locale.editorStatus.technicalDetails);
    }
});

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
            const relative = source.includes("translations.t('security.' + key)");
            for (const match of source.matchAll(/\btr\('([^']+)'\s*,/g)) {
                const key = relative ? 'security.' + match[1] : match[1];
                assert.notEqual(translations.t(key), key, language + ': ' + file + ': ' + key);
            }
        }
    }
});
