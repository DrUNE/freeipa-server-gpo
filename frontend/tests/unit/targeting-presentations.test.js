import assert from 'node:assert/strict';
import { test } from 'vitest';
import * as presentation from '@gpui/core/targeting/presentations';

// Unit tests for the targeting presentation registry (labels, enum choices,
// numeric limits, notes) used by the targeting form renderer. Pure data
// lookups, no DOM and no fake API: everything is read straight from the module.
// Helpers: plain() strips frozen/proxy wrappers for deepEqual, keys() lists the
// native tokens of a choice list (the labels are localized, the tokens are not).
function plain(value) {
    return JSON.parse(JSON.stringify(value));
}
function keys(kind, id) {
    return plain(presentation.choices(kind, id, 'en')).map(value => value.key);
}

// Every visible operand per supported filter kind; this is the contract the
// label-coverage test iterates, so a new kind or operand must be added here.
const operandIds = {
    battery: [],
    computer: ['type', 'name'],
    cpu: ['speedMHz'],
    date: ['period', 'dow', 'day', 'month', 'year'],
    disk: ['freeSpace', 'drive'],
    domain: ['name', 'userContext'],
    dun: ['type'],
    file: ['path', 'type', 'folder', 'min', 'max', 'gte', 'lte'],
    ip_range: ['useIPv6', 'min', 'max'],
    language: ['languageLocale', 'default', 'system', 'native'],
    ldap: ['binding', 'searchFilter', 'variableName', 'attribute'],
    mac_range: ['min', 'max'],
    msi: ['type', 'subtype', 'code', 'item', 'value', 'min', 'max', 'gte', 'lte'],
    org_unit: ['name', 'userContext', 'directMember'],
    pcmcia: [],
    portable: ['unknown', 'docked', 'undocked'],
    proc_mode: [
        'synchFore',
        'asynchFore',
        'backRefr',
        'forceRefr',
        'linkTrns',
        'noChg',
        'rsopTrns',
        'safeBoot',
        'slowLink',
        'verbLog',
        'rsopEnbl'
    ],
    ram: ['totalMB'],
    run_once: ['id', 'userContext', 'comments'],
    site: ['name'],
    terminal: ['type', 'option', 'value', 'min', 'max'],
    time: ['begin', 'end'],
    user: ['name', 'sid'],
    variable: ['variableName', 'value'],
    os: ['class', 'version', 'type', 'edition', 'sp'],
    registry: [
        'type',
        'subtype',
        'valueName',
        'valueType',
        'valueData',
        'variableName',
        'key',
        'hive',
        'min',
        'max',
        'gte',
        'lte',
        'version'
    ],
    wmi: ['query', 'nameSpace', 'property', 'variableName'],
    group: ['name', 'sid', 'userContext', 'primaryGroup', 'localGroup'],
    collection: ['name']
};

// Missing translations would silently fall back to raw metadata names in the UI,
// so each kind/operand must have an explicit en and ru label (ru must contain Cyrillic).
test('every one of the 29 supported kinds and its visible operands has explicit English and Russian labels', () => {
    assert.equal(presentation.supportedKinds.length, 29);
    assert.deepEqual(plain(presentation.supportedKinds).sort(), Object.keys(operandIds).sort());
    assert.ok(Object.isFrozen(presentation.supportedKinds));
    for (const [kind, ids] of Object.entries(operandIds)) {
        for (const language of ['en', 'ru']) {
            assert.notEqual(presentation.kindLabel(kind, 'missing', language), 'missing', kind);
            for (const id of ids) {
                const label = presentation.fieldLabel(kind, 'filter.' + id, 'missing', language);
                assert.notEqual(label, 'missing', kind + '/' + id + '/' + language);
                assert.ok(label.trim().length > 0);
                if (language === 'ru') assert.match(label, /[А-Яа-яЁё]/u, kind + '/' + id);
            }
        }
    }
});

// Locale normalization (ru-RU, ru_RU, RU) and the fallback chain: explicit label,
// then server metadata, then the raw id. Same field id can mean different things per kind.
test('locale matching, kind-specific meanings, unknown fields and metadata fallback remain predictable', () => {
    assert.equal(presentation.kindLabel('date', '', 'ru-RU'), 'Сопоставление дат');
    assert.equal(presentation.kindLabel('date', '', 'ru_RU'), 'Сопоставление дат');
    assert.equal(presentation.kindLabel('date', '', 'RU'), 'Сопоставление дат');
    assert.equal(presentation.kindLabel('date', '', 'fr-FR'), 'Date match');
    assert.equal(presentation.kindLabel('VendorFilter', 'Vendor label', 'ru'), 'Vendor label');
    assert.equal(presentation.kindLabel('VendorFilter', '', 'en'), 'VendorFilter');
    assert.equal(presentation.fieldLabel('computer', 'filter.name', '', 'en'), 'Computer name');
    assert.equal(presentation.fieldLabel('domain', 'filter.name', '', 'en'), 'Domain name');
    assert.equal(presentation.fieldLabel('file', 'filter.min', '', 'en'), 'Minimum version');
    assert.equal(presentation.fieldLabel('ip_range', 'filter.min', '', 'en'), 'First IP address');
    assert.equal(presentation.fieldLabel('file', 'filter.bool', 'Preserved metadata', 'ru'), 'Preserved metadata');
    assert.equal(
        presentation.fieldLabel('language', 'filter.displayName', 'Internal metadata', 'ru'),
        'Internal metadata'
    );
    assert.equal(presentation.fieldLabel('__proto__', 'toString', 'Unknown', 'en'), 'Unknown');
});

// UI labels are localized but the stored keys must stay the exact native tokens;
// free-form language locale is supplied by the renderer, so choices() returns null there.
test('computer and date choices are deliberate localized controls over exact native tokens', () => {
    assert.deepEqual(keys('computer', 'filter.type'), ['NETBIOS', 'DNS']);
    assert.deepEqual(keys('date', 'filter.period'), ['WEEKLY', 'MONTHLY', 'YEARLY']);
    assert.deepEqual(keys('date', 'filter.dow'), ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
    assert.equal(presentation.choices('date', 'filter.period', 'ru')[2].label, 'Дата');
    assert.equal(presentation.choices('date', 'filter.dow', 'ru')[0].label, 'Понедельник');
    assert.equal(
        presentation.choices('language', 'filter.languageLocale', 'en'),
        null,
        'native language inventory is supplied by the renderer'
    );
    assert.equal(presentation.choices('language', 'filter.displayName', 'ru'), null);
});

// Pins the enum spellings written to the policy XML (odd casing like 'Vista', 'PPPoE'
// included); changing one would break round-tripping of existing policies.
test('all conditional matcher enum vocabularies retain the active native spellings', () => {
    assert.deepEqual(keys('file', 'type'), ['EXISTS', 'VERSION']);
    assert.deepEqual(keys('msi', 'type'), ['PRODUCT', 'PATCH', 'FILECOMPONENT']);
    assert.deepEqual(keys('msi', 'subtype'), [
        'EXISTS',
        'VERSION',
        'GET_PROPERTY',
        'GET_INFORMATION',
        'MATCH_PROPERTY',
        'MATCH_INFORMATION'
    ]);
    assert.deepEqual(keys('registry', 'type'), ['VALUEEXISTS', 'KEYEXISTS', 'MATCHVALUE', 'GETVALUE']);
    assert.deepEqual(keys('registry', 'subtype'), ['EQUALHEX', 'EQUALDEC', 'SUBSTRING', 'VERSION']);
    assert.deepEqual(keys('registry', 'valueType'), [
        'REG_SZ',
        'REG_EXPAND_SZ',
        'REG_MULTI_SZ',
        'REG_DWORD',
        'REG_BINARY',
        ''
    ]);
    assert.deepEqual(keys('registry', 'hive'), [
        'HKEY_LOCAL_MACHINE',
        'HKEY_CLASSES_ROOT',
        'HKEY_CURRENT_USER',
        'HKEY_CURRENT_CONFIG',
        'HKEY_USERS'
    ]);
    assert.deepEqual(keys('terminal', 'type'), ['NE', 'TS', 'CONSOLE']);
    assert.deepEqual(keys('terminal', 'option'), [
        'APPLICATION',
        'PROGRAM',
        'CLIENT',
        'SESSION',
        'DIRECTORY',
        'IP',
        'NE'
    ]);
    assert.deepEqual(keys('dun', 'type'), [
        '',
        'modem',
        'isdn',
        'x25',
        'vpn',
        'pad',
        'GENERIC',
        'SERIAL',
        'FRAMERELAY',
        'ATM',
        'SONET',
        'SW56',
        'IRDA',
        'PARALLEL',
        'PPPoE'
    ]);
    assert.equal(presentation.choices('proc_mode', 'filter.syncFore', 'en'), null);
});

// The OS lists only offer legacy tokens that native code accepts, with no invented
// current-platform entries; every option needs a non-empty label.
test('OS selectors do not invent current-platform tokens and preserve every active legacy token', () => {
    assert.deepEqual(keys('os', 'class'), ['NE', '9X', 'NT']);
    assert.deepEqual(keys('os', 'version'), [
        'NE',
        '95',
        '98',
        'ME',
        'NT',
        '2K',
        'XP',
        '2K3',
        '2K3R2',
        'VISTA',
        'Vista',
        '2K8',
        'WIN7',
        '2K8R2',
        'WIN8',
        'WIN8S',
        'WINBLUE',
        'WINBLUESRV',
        'WINTHRESHOLD',
        'WINTHRESHOLDSRV'
    ]);
    assert.deepEqual(keys('os', 'type'), ['NE', 'R2', 'SE', 'WS', 'SV', 'DC', 'PRO', 'PR']);
    assert.deepEqual(keys('os', 'edition'), [
        'NE',
        '64EP',
        '64DC',
        'AS',
        'DTC',
        'EP',
        'WEB',
        '64',
        'HM',
        'MC',
        'TPC',
        'SRV',
        'STD',
        'TSE',
        'SBS',
        'PRO',
        '64STGSTD',
        '64STGWKGRP',
        '64MPSTD',
        '64MPPREM',
        '64ESSSOL'
    ]);
    assert.deepEqual(keys('os', 'sp'), [
        'NE',
        'Gold',
        'Service Pack 1',
        'Service Pack 2',
        'Service Pack 3',
        'Service Pack 4',
        'Service Pack 5',
        'Service Pack 6'
    ]);
    for (const id of ['class', 'version', 'type', 'edition', 'sp']) {
        assert.equal(presentation.choices('os', id, 'ru')[0].label, 'Любой');
        const labels = presentation.choices('os', id, 'en').map(value => value.label);
        assert.ok(
            labels.every(label => label.trim()),
            id
        );
    }
});

// Numeric inputs mirror the native field widths (e.g. 16-bit MHz/MB, 8-bit disk space)
// and must not claim unit conversions the native side does not perform.
test('numeric adapters reflect native widths, not speculative unit conversions', () => {
    assert.deepEqual(plain(presentation.numeric('cpu', 'filter.speedMHz')), { min: 0, max: 65535, step: 1 });
    assert.deepEqual(plain(presentation.numeric('ram', 'filter.totalMB')), { min: 0, max: 65535, step: 1 });
    assert.deepEqual(plain(presentation.numeric('disk', 'filter.freeSpace')), { min: 0, max: 255, step: 1 });
    assert.deepEqual(plain(presentation.numeric('date', 'filter.day')), { min: 1, max: 31, step: 1 });
    assert.deepEqual(plain(presentation.numeric('date', 'filter.month')), { min: 1, max: 12, step: 1 });
    assert.deepEqual(plain(presentation.numeric('date', 'filter.year')), { min: 1, max: 65535, step: 1 });
    assert.equal(presentation.numeric('registry', 'filter.valueData'), null);
    assert.equal(presentation.numeric('time', 'filter.begin'), null);
    assert.equal(presentation.numeric('__proto__', 'toString'), null);
    assert.match(presentation.note('disk', 'en'), /0–255 KB/);
    assert.doesNotMatch(presentation.note('disk', 'en'), /percent|kilobyte|megabyte/i);
});

// Which fields get a textarea, and the explanatory notes for presence-only filters
// (battery, pcmcia) that have no operands to show.
test('query and multiline controls are explicit and notes explain presence-only filters', () => {
    for (const [kind, id] of [
        ['wmi', 'query'],
        ['ldap', 'searchFilter'],
        ['run_once', 'comments'],
        ['registry', 'valueData']
    ]) {
        assert.equal(presentation.isTextarea(kind, 'filter.' + id), true);
    }
    for (const [kind, id] of [
        ['computer', 'name'],
        ['file', 'path'],
        ['date', 'year'],
        ['wmi', 'variableName'],
        ['ldap', 'binding']
    ]) {
        assert.equal(presentation.isTextarea(kind, 'filter.' + id), false);
    }
    assert.match(presentation.note('battery', 'en'), /battery power/);
    assert.match(presentation.note('pcmcia', 'en'), /PCMCIA card slots/);
    assert.match(presentation.note('battery', 'ru'), /батареи/);
    assert.match(presentation.note('pcmcia', 'ru'), /слоты PCMCIA/);
    assert.equal(presentation.note('computer', 'ru'), '');
    assert.equal(presentation.note('__proto__', 'ru'), '');
});

// The registry is shared module state: callers get copies, so mutating a returned
// choice list or range must not leak into later lookups.
test('returned choices and constraints cannot mutate the shared presentation registry', () => {
    const choices = presentation.choices('computer', 'type', 'en');
    choices[0].key = 'UNSUPPORTED';
    choices[0].label = 'Broken';
    choices.push({ key: 'EXTRA', label: 'Extra' });
    assert.deepEqual(keys('computer', 'type'), ['NETBIOS', 'DNS']);
    assert.equal(presentation.choices('computer', 'type', 'en')[0].label, 'NetBIOS name');
    const range = presentation.numeric('cpu', 'speedMHz');
    range.max = 999999;
    assert.equal(presentation.numeric('cpu', 'speedMHz').max, 65535);
});
