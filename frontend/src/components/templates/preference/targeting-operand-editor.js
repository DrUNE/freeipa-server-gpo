/** RSAT-style operand forms. Common boolean operators belong to the parent toolbar. */

import { createElement } from '@gpui/util/element-creator';
import { equal, validatePreferenceField, valuePayload, clone } from '@gpui/util/editor-dto';
import { fieldLabel, isTextarea } from '@gpui/components/templates/preference/targeting-presentations';
import * as presentations from '@gpui/components/templates/preference/targeting-presentations';
import * as typedInput from '@gpui/components/templates/preference/targeting-typed-input';

let nextInputId = 1;
const COMMON = ['filter.bool', 'filter.not', 'filter.combine', 'filter.negate', 'filter.hidden'];
const SIMPLE = {
    battery: [],
    computer: ['type', 'name'],
    cpu: ['speedMHz'],
    disk: ['freeSpace', 'drive'],
    domain: ['userContext', 'name'],
    dun: ['type'],
    ip_range: ['useIPv6', 'min', 'max'],
    ldap: ['binding', 'searchFilter', 'attribute', 'variableName'],
    mac_range: ['min', 'max'],
    org_unit: ['userContext', 'name', 'directMember'],
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
    time: ['begin', 'end'],
    variable: ['variableName', 'value'],
    os: ['version', 'edition', 'sp', 'type', 'class'],
    wmi: ['nameSpace', 'query', 'property', 'variableName'],
    group: ['userContext', 'name', 'sid', 'primaryGroup', 'localGroup'],
    collection: ['name']
};
const WORDS = {
    en: {
        match: 'Match type',
        file: 'File exists',
        folder: 'Folder exists',
        fileVersion: 'Match file version',
        key: 'Key exists',
        value: 'Value exists',
        data: 'Match value data',
        decimal: 'Decimal format',
        substring: 'Substring match',
        version: 'Version match',
        get: 'Get value data',
        defaultName: 'Default value name',
        everyYear: 'Every year',
        date: 'Date',
        calendar: 'Day and month',
        context: 'Target',
        computer: 'Computer',
        user: 'User',
        by: 'Match by',
        name: 'Name',
        sid: 'Security identifier (SID)',
        mode: 'Processing modes',
        conditions: 'Processing conditions',
        saved: 'Saved value: ',
        broken: 'The saved language is not recognized. Choose a language to replace it.',
        min: 'Minimum version',
        max: 'Maximum version',
        getValue: 'Value',
        userLanguageScope: 'User language is available only in User configuration.',
        useIPv6: 'Use IPv6',
        ipv6Address: 'IPv6 address',
        prefix: 'Prefix length',
        prefixHint: '0–128; 128 matches one address'
    },
    ru: {
        match: 'Тип соответствия',
        file: 'Файл существует',
        folder: 'Папка существует',
        fileVersion: 'Сопоставить версию файла',
        key: 'Ключ существует',
        value: 'Значение существует',
        data: 'Сопоставить данные значения',
        decimal: 'Десятичный формат',
        substring: 'Сопоставить подстроку',
        version: 'Сопоставить версию',
        get: 'Получить данные значения',
        defaultName: 'Имя значения по умолчанию',
        everyYear: 'Каждый год',
        date: 'Дата',
        calendar: 'День и месяц',
        context: 'Объект',
        computer: 'Компьютер',
        user: 'Пользователь',
        by: 'Сопоставлять по',
        name: 'Имени',
        sid: 'Идентификатору безопасности (SID)',
        mode: 'Режимы обработки',
        conditions: 'Условия обработки',
        saved: 'Сохранённое значение: ',
        broken: 'Сохранённый язык не распознан. Выберите язык для его замены.',
        min: 'Минимальная версия',
        max: 'Максимальная версия',
        getValue: 'Значение',
        userLanguageScope: 'Язык пользователя доступен только в разделе «Пользователь».',
        useIPv6: 'Использовать IPv6',
        ipv6Address: 'IPv6-адрес',
        prefix: 'Длина префикса',
        prefixHint: '0–128; 128 — один адрес'
    }
};

function fieldOf(fields, id) {
    return fields.find(function (field) {
        return field.id === id;
    });
}
function raw(fields, id) {
    const field = fieldOf(fields, id);
    return field ? valuePayload(field.value) : null;
}
function assign(fields, id, value) {
    const field = fieldOf(fields, id);
    if (!field || field.editable === false) return;
    const envelope = clone(field.value);
    envelope.value = value;
    field.value = envelope;
}
function stateOf(node) {
    if (!node._operandState) node._operandState = { original: clone(node.fields || []), dates: {}, values: {} };
    return node._operandState;
}
function today() {
    return new Date();
}
function weekday(date) {
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
}
function daysInMonth(month, year) {
    return new Date(Number(year), Number(month), 0).getDate();
}
function dateParts(fields) {
    return {
        day: raw(fields, 'filter.day'),
        month: raw(fields, 'filter.month'),
        year: raw(fields, 'filter.year'),
        dow: raw(fields, 'filter.dow')
    };
}
function isCommon(id) {
    return COMMON.indexOf(id) !== -1;
}
function languageChoices(field, language) {
    let names;
    try {
        names =
            typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames([language], { type: 'language' }) : null;
    } catch (_) {
        names = null;
    }
    return ((field && field.choices) || [])
        .filter(function (choice) {
            return choice.key !== 'unknown';
        })
        .map(function (choice) {
            let text;
            try {
                text = names && names.of(choice.key);
            } catch (_) {
                text = null;
            }
            return { key: choice.key, label: text && text !== choice.key ? text : choice.label };
        });
}

/** Only new nodes receive defaults. Opening a persisted node never calls this implicitly. */
function initialize(node, options) {
    const fields = clone(node.fields || []);
    if (node.originalPath) return fields;
    const language = options && options.language === 'ru' ? 'ru' : 'en';
    const scope = (options && options.scope) || 'computer';
    const now = today();
    function empty(id, value) {
        const old = raw(fields, id);
        if (old === null || old === undefined || old === '') assign(fields, id, value);
    }
    switch (node.kind) {
        case 'computer':
            empty('filter.type', 'NETBIOS');
            break;
        case 'date':
            empty('filter.period', 'WEEKLY');
            if (raw(fields, 'filter.period') === 'WEEKLY') empty('filter.dow', weekday(now));
            if (raw(fields, 'filter.period') === 'MONTHLY') empty('filter.day', now.getDate());
            if (raw(fields, 'filter.period') === 'YEARLY') {
                empty('filter.day', now.getDate());
                empty('filter.month', now.getMonth() + 1);
            }
            break;
        case 'disk':
            empty('filter.drive', 'System');
            break;
        case 'file':
            empty('filter.type', 'EXISTS');
            break;
        case 'language': {
            const localeField = fieldOf(fields, 'filter.languageLocale');
            if (localeField) {
                const available = languageChoices(localeField, language);
                const chosen =
                    available.find(function (choice) {
                        return choice.key === (language === 'ru' ? 'ru-RU' : 'en-US');
                    }) ||
                    available.find(function (choice) {
                        return choice.key === language;
                    }) ||
                    available[0];
                if (chosen) {
                    assign(fields, localeField.id, chosen.key);
                    assign(fields, 'filter.displayName', chosen.label);
                }
            }
            if (scope === 'computer') assign(fields, 'filter.default', false);
            empty('filter.system', true);
            break;
        }
        case 'msi':
            empty('filter.type', 'PRODUCT');
            empty('filter.subtype', 'EXISTS');
            break;
        case 'terminal':
            empty('filter.type', 'NE');
            empty('filter.option', 'NE');
            break;
        case 'time':
            empty('filter.begin', '00:00:00');
            empty('filter.end', '23:59:00');
            break;
        case 'registry':
            empty('filter.type', 'KEYEXISTS');
            empty('filter.hive', 'HKEY_LOCAL_MACHINE');
            break;
        case 'wmi':
            empty('filter.nameSpace', 'Root\\cimv2');
            break;
        case 'run_once':
            if (!raw(fields, 'filter.id')) {
                const id =
                    typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (letter) {
                              const value = Math.floor(Math.random() * 16);
                              return (letter === 'x' ? value : (value & 3) | 8).toString(16);
                          });
                assign(fields, 'filter.id', '{' + id.toUpperCase() + '}');
            }
            break;
    }
    if (scope === 'computer' && ['domain', 'org_unit', 'group', 'run_once'].indexOf(node.kind) !== -1)
        assign(fields, 'filter.userContext', false);
    return fields;
}

function activeIds(node) {
    const fields = node.fields || [];
    let ids = SIMPLE[node.kind];
    if (node.kind === 'date') {
        const period = raw(fields, 'filter.period');
        ids = ['period'].concat(
            period === 'WEEKLY'
                ? ['dow']
                : period === 'MONTHLY'
                  ? ['day']
                  : period === 'YEARLY'
                    ? ['month', 'day', 'year']
                    : []
        );
    } else if (node.kind === 'file') {
        ids = ['path', 'type', 'folder'].concat(
            raw(fields, 'filter.type') === 'VERSION' ? ['min', 'max', 'gte', 'lte'] : []
        );
    } else if (node.kind === 'language') ids = ['languageLocale', 'default', 'system', 'native'];
    else if (node.kind === 'msi') {
        const subtype = raw(fields, 'filter.subtype');
        ids = ['type', 'subtype', 'code'].concat(
            subtype === 'VERSION'
                ? ['min', 'max', 'gte', 'lte']
                : /^(GET|MATCH)_/.test(subtype || '')
                  ? ['item', 'value']
                  : []
        );
    } else if (node.kind === 'registry') {
        const type = raw(fields, 'filter.type') || 'KEYEXISTS';
        const regSubtype = raw(fields, 'filter.subtype') || 'EQUALHEX';
        ids = ['type', 'hive', 'key'].concat(type === 'KEYEXISTS' ? [] : ['valueName', 'valueType']);
        if (type === 'MATCHVALUE')
            ids = ids
                .concat(['subtype'])
                .concat(regSubtype === 'VERSION' ? ['min', 'max', 'gte', 'lte'] : ['valueData']);
        if (type === 'GETVALUE') ids.push('variableName');
    } else if (node.kind === 'terminal') {
        const option = raw(fields, 'filter.option');
        ids = ['type', 'option'].concat(option === 'IP' ? ['min', 'max'] : option === 'NE' ? [] : ['value']);
    } else if (node.kind === 'user') ids = raw(fields, 'filter.sid') ? ['sid'] : ['name'];
    return (ids || []).map(function (id) {
        return 'filter.' + id;
    });
}

function ipv4(value) {
    if (!/^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}$/.test(String(value))) return null;
    const parts = String(value).split('.').map(Number);
    return parts.every(function (part) {
        return part <= 255;
    })
        ? parts.reduce(function (number, part) {
              return number * 256 + part;
          }, 0)
        : null;
}
function mac(value) {
    return /^([a-f\d]{2}:){5}[a-f\d]{2}$/i.test(String(value)) ? parseInt(String(value).replace(/:/g, ''), 16) : null;
}
function ipv6(value) {
    let text = String(value);
    if (text.indexOf(':') === -1) return null;
    if (text.indexOf('.') !== -1) {
        const tailIndex = text.lastIndexOf(':'),
            tail = text.slice(tailIndex + 1);
        if (ipv4(tail) === null) return null;
        const bytes = tail.split('.').map(Number);
        text =
            text.slice(0, tailIndex + 1) +
            (bytes[0] * 256 + bytes[1]).toString(16) +
            ':' +
            (bytes[2] * 256 + bytes[3]).toString(16);
    }
    if (!/^[a-f\d:]+$/i.test(text)) return null;
    const halves = text.split('::');
    if (halves.length > 2) return null;
    const left = halves[0] ? halves[0].split(':') : [],
        right = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
    if (
        !left.concat(right).every(function (part) {
            return /^[a-f\d]{1,4}$/i.test(part);
        })
    )
        return null;
    const gap = 8 - left.length - right.length;
    if ((halves.length === 1 && gap !== 0) || (halves.length === 2 && gap < 1)) return null;
    return left.concat(halves.length === 2 ? Array(gap).fill('0') : [], right).map(function (part) {
        return parseInt(part, 16);
    });
}
function version(value) {
    if (!/^\d+(\.\d+){0,3}$/.test(String(value))) return null;
    const parts = String(value).split('.').map(Number);
    return parts.every(function (part) {
        return part <= 65535;
    })
        ? parts.concat([0, 0, 0, 0]).slice(0, 4)
        : null;
}
function compare(left, right) {
    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i]) return left[i] - right[i];
    }
    return 0;
}
function semanticType(kind, id, useIPv6) {
    if (id === 'filter.min' || id === 'filter.max') {
        if (kind === 'ip_range' && useIPv6) return id === 'filter.min' ? 'ipv6' : null;
        if (kind === 'ip_range' || kind === 'terminal') return 'ipv4';
        if (kind === 'mac_range') return 'mac';
        if (['file', 'msi', 'registry'].indexOf(kind) !== -1) return 'version';
    }
    if ((kind === 'msi' && id === 'filter.code') || (kind === 'run_once' && id === 'filter.id')) return 'guid';
    return null;
}
function validTime(value) {
    const match = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})?$/.exec(String(value));
    if (!match || Number(match[1]) > 24 || Number(match[2]) > 59 || Number(match[3]) > 59) return false;
    if (Number(match[1]) === 24 && (Number(match[2]) || Number(match[3]) || (match[4] && /[1-9]/.test(match[4]))))
        return false;
    if (match[5] && match[5] !== 'Z') {
        const offset = match[5].slice(1).split(':').map(Number);
        if (offset[0] > 14 || offset[1] > 59 || (offset[0] === 14 && offset[1])) return false;
    }
    return true;
}

/** Validate active, deliberately edited operands; tolerate untouched legacy representations. */
function validateFields(node) {
    if (!node || node.available === false) return [];
    const fields = node.fields || [];
    const active = activeIds(node);
    const original = node._operandState && node._operandState.original;
    const fresh = !node.originalPath;
    const errors = [];
    function changed(id) {
        if (fresh) return true;
        const before = original && fieldOf(original, id),
            after = fieldOf(fields, id);
        return Boolean(before && after && !equal(before.value, after.value));
    }
    const modeChanged = [
        'filter.type',
        'filter.subtype',
        'filter.option',
        'filter.period',
        'filter.sid',
        'filter.useIPv6'
    ].some(changed);
    function check(id) {
        return changed(id) || modeChanged;
    }
    function add(id, code) {
        if (
            !errors.some(function (error) {
                return error.fieldId === id;
            })
        )
            errors.push({ fieldId: id, code: code });
    }
    active.forEach(function (id) {
        const field = fieldOf(fields, id);
        if (!field || field.editable === false || !check(id) || isCommon(id)) return;
        let descriptor = field;
        if (node.kind === 'dun' && id === 'filter.type') descriptor = Object.assign({}, field, { required: false });
        const generic = validatePreferenceField(descriptor, field.value);
        if (generic) add(id, generic);
        const value = raw(fields, id),
            numeric = presentations.numeric(node.kind, id);
        if (
            numeric &&
            value !== null &&
            value !== '' &&
            (!/^\d+$/.test(String(value)) ||
                !Number.isSafeInteger(Number(value)) ||
                Number(value) < numeric.min ||
                Number(value) > numeric.max)
        )
            add(id, 'invalid_number');
        const choices = presentations.choices(node.kind, id, 'en');
        if (
            choices &&
            value !== null &&
            !choices.some(function (choice) {
                return String(choice.key) === String(value);
            })
        )
            add(id, 'invalid_value');
    });
    function pair(parser, code, optional) {
        const min = raw(fields, 'filter.min'),
            max = raw(fields, 'filter.max');
        const parsedMin = min === null || min === '' ? null : parser(min),
            parsedMax = max === null || max === '' ? null : parser(max);
        if (
            check('filter.min') &&
            ((!optional && parsedMin === null) || (min !== null && min !== '' && parsedMin === null))
        )
            add('filter.min', !optional && !min ? 'required' : code);
        if (
            check('filter.max') &&
            ((!optional && parsedMax === null) || (max !== null && max !== '' && parsedMax === null))
        )
            add('filter.max', !optional && !max ? 'required' : code);
        if (
            (check('filter.min') || check('filter.max')) &&
            parsedMin !== null &&
            parsedMax !== null &&
            (Array.isArray(parsedMin) ? compare(parsedMin, parsedMax) : parsedMin - parsedMax) > 0
        )
            add('filter.max', 'invalid_range');
    }
    if (node.kind === 'ip_range' && raw(fields, 'filter.useIPv6') === true) {
        if (check('filter.min') && ipv6(raw(fields, 'filter.min')) === null)
            add('filter.min', !raw(fields, 'filter.min') ? 'required' : 'invalid_ipv6');
        const prefix = raw(fields, 'filter.max');
        if (check('filter.max') && (!/^\d+$/.test(String(prefix)) || Number(prefix) > 128))
            add('filter.max', prefix === null || prefix === '' ? 'required' : 'invalid_number');
    } else if (node.kind === 'ip_range' || (node.kind === 'terminal' && raw(fields, 'filter.option') === 'IP'))
        pair(ipv4, 'invalid_ip', false);
    if (node.kind === 'mac_range') pair(mac, 'invalid_mac', false);
    if (
        (node.kind === 'file' && raw(fields, 'filter.type') === 'VERSION') ||
        (node.kind === 'msi' && raw(fields, 'filter.subtype') === 'VERSION') ||
        (node.kind === 'registry' &&
            raw(fields, 'filter.type') === 'MATCHVALUE' &&
            raw(fields, 'filter.subtype') === 'VERSION')
    )
        pair(version, 'invalid_version', true);
    if (node.kind === 'time')
        ['filter.begin', 'filter.end'].forEach(function (id) {
            if (check(id) && !validTime(raw(fields, id))) add(id, 'invalid_time');
        });
    if (node.kind === 'msi' || node.kind === 'run_once') {
        const guidId = node.kind === 'msi' ? 'filter.code' : 'filter.id',
            guid = raw(fields, guidId);
        if (
            changed(guidId) &&
            guid &&
            !/^(?:[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}|\{[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\})$/i.test(
                String(guid)
            )
        )
            add(guidId, 'invalid_guid');
    }
    if (node.kind === 'date') {
        const period = raw(fields, 'filter.period'),
            day = raw(fields, 'filter.day'),
            month = raw(fields, 'filter.month'),
            year = raw(fields, 'filter.year');
        if (period === 'MONTHLY' && check('filter.day') && !(Number.isInteger(day) && day >= 1 && day <= 31))
            add('filter.day', day === null ? 'required' : 'invalid_date');
        if (period === 'YEARLY' && ['filter.day', 'filter.month', 'filter.year'].some(check)) {
            if (!(Number.isInteger(month) && month >= 1 && month <= 12))
                add('filter.month', month === null ? 'required' : 'invalid_date');
            if (!(Number.isInteger(day) && day >= 1 && day <= daysInMonth(month, year === null ? 2024 : Number(year))))
                add('filter.day', day === null ? 'required' : 'invalid_date');
            if (year !== null && (!/^\d{1,5}$/.test(String(year)) || Number(year) < 1 || Number(year) > 65535))
                add('filter.year', 'invalid_date');
        }
    }
    if (node.kind === 'user' || node.kind === 'group') {
        if (
            (fresh || changed('filter.name') || changed('filter.sid')) &&
            !raw(fields, 'filter.name') &&
            !raw(fields, 'filter.sid')
        )
            add(
                node.kind === 'user' && node._operandState && node._operandState.userMode === 'sid'
                    ? 'filter.sid'
                    : 'filter.name',
                'required'
            );
    }
    return errors;
}

function render(options) {
    const node = options.node;
    const kind = node.kind;
    const language = options.language === 'ru' ? 'ru' : 'en';
    const words = WORDS[language];
    const scope = options.scope || 'computer';
    const blocked = Boolean(options.blocked || node.available === false);
    const state = stateOf(node);
    const working = clone(node.fields || []);
    const controls = [];
    let renderGeneration = 0;
    const container = createElement('div', {
        className: 'gpo-editor-targeting-operands',
        attrs: { 'data-targeting-kind': kind }
    });
    const inputRecords = [];
    function value(id) {
        return raw(working, id);
    }
    function set(id, next) {
        assign(working, id, next);
    }
    function capture() {
        inputRecords.forEach(function (record) {
            record.capture();
        });
    }
    function changed() {
        capture();
        if (options.onChange) options.onChange();
    }
    function label(id, fallback) {
        return fieldLabel(kind, id, fallback || id, language);
    }
    function register(id, element, input, error, reader) {
        const record = {
            id: id,
            read: function () {
                capture();
                const field = fieldOf(working, id);
                return field ? clone(field.value) : null;
            },
            setError: function (message) {
                element.getElement().classList.toggle('gpo-editor-field--error', Boolean(message));
                if (message) input.setAttribute('aria-invalid', 'true');
                else input.removeAttribute('aria-invalid');
                error.setText(message || '');
            },
            focus: function () {
                input.focus();
            }
        };
        if (reader) inputRecords.push({ capture: reader });
        controls.push(record);
        return record;
    }
    function custom(id, text, type, initial, onInput, extra) {
        const settings = extra || {};
        const generation = renderGeneration;
        const inputId = 'gpo-targeting-operand-' + nextInputId++;
        const input = createElement(type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : 'input', {
            attrs: {
                id: inputId,
                type: type === 'checkbox' ? 'checkbox' : type === 'select' || type === 'textarea' ? null : type,
                disabled: blocked || settings.disabled ? 'disabled' : null,
                'aria-label': text,
                min: settings.min,
                max: settings.max,
                step: settings.step,
                rows: type === 'textarea' ? '4' : null
            },
            children:
                type === 'select'
                    ? (settings.choices || []).map(function (choice) {
                          return createElement('option', { attrs: { value: choice.key }, text: choice.label });
                      })
                    : []
        });
        const dom = input.getElement();
        if (type === 'checkbox') dom.checked = Boolean(initial);
        else dom.value = initial === null || initial === undefined ? '' : String(initial);
        const error = createElement('span', { className: 'gpo-editor-field__error' });
        const body =
            type === 'checkbox'
                ? createElement('span', {
                      className: 'gpo-editor-boolean',
                      children: [input, createElement('label', { attrs: { for: inputId } })]
                  })
                : input;
        const element = createElement('div', {
            className: [
                'field',
                type === 'checkbox' ? 'field__checkbox' : 'field__input',
                'gpo-editor-field',
                type === 'textarea' ? 'field__description' : null
            ],
            attrs: { 'data-field-id': id },
            children: [
                createElement('div', {
                    className: 'field__label',
                    children: [createElement('label', { attrs: { for: inputId }, text: text })]
                }),
                createElement('div', { className: 'field__element', children: [body, error] })
            ]
        });
        dom.addEventListener(type === 'select' || type === 'checkbox' ? 'change' : 'input', function () {
            if (generation !== renderGeneration || blocked || settings.disabled) return;
            onInput(type === 'checkbox' ? dom.checked : dom.value);
            changed();
        });
        register(id, element, dom, error);
        container.append(element);
        return { element: element, input: dom };
    }
    function ordinary(id, settings) {
        const field = fieldOf(working, id);
        if (!field || isCommon(id) || field.hidden) return;
        const generation = renderGeneration;
        const opts = settings || {};
        const displayed = clone(field);
        displayed.label = opts.label || label(id, field.label);
        const type = semanticType(kind, id, value('filter.useIPv6') === true);
        if (type) {
            const error = createElement('span', { className: 'gpo-editor-field__error' });
            const control = typedInput.render({
                type: type,
                value: value(id),
                label: displayed.label,
                language: language,
                disabled: blocked || opts.disabled || field.editable === false,
                onChange: function (next) {
                    if (generation !== renderGeneration || blocked || opts.disabled || field.editable === false) return;
                    set(id, field.value.kind === 'optional_text' && next === '' ? null : next);
                    if (registered) registered.setError('');
                    changed();
                }
            });
            const element = createElement('div', {
                className: ['field', 'field__input', 'gpo-editor-field', 'gpo-editor-field--typed'],
                attrs: { 'data-field-id': id },
                children: [
                    createElement('div', {
                        className: 'field__label',
                        children: [
                            createElement('label', { attrs: { for: control.inputs[0].id }, text: displayed.label })
                        ]
                    }),
                    createElement('div', { className: 'field__element', children: [control.element, error] })
                ]
            });
            const registered = register(id, element, control.inputs[0], error);
            const setError = registered.setError;
            registered.setError = function (message) {
                setError(message);
                control.inputs.forEach(function (input) {
                    if (message) input.setAttribute('aria-invalid', 'true');
                    else input.removeAttribute('aria-invalid');
                });
            };
            registered.focus = control.focus;
            container.append(element);
            return;
        }
        let choices = opts.choices || presentations.choices(kind, id, language);
        const booleanChoice = Boolean(
            choices && (field.value.kind === 'boolean' || field.value.kind === 'optional_boolean')
        );
        if (choices) {
            choices = clone(choices);
            const current = value(id);
            if (
                current !== null &&
                current !== undefined &&
                !choices.some(function (choice) {
                    return String(choice.key) === String(current);
                })
            )
                choices.unshift({ key: String(current), label: words.saved + String(current) });
            displayed.control = 'choice';
            displayed.choices = choices;
            if (current === null || current === undefined)
                displayed.value.value =
                    opts.defaultKey !== undefined ? opts.defaultKey : choices.length ? choices[0].key : '';
            if (booleanChoice)
                displayed.value = {
                    kind: 'text',
                    value:
                        current === null || current === undefined
                            ? String(opts.defaultKey || 'false')
                            : String(Boolean(current))
                };
        }
        if (isTextarea(kind, id)) {
            const old = clone(field.value);
            custom(
                id,
                displayed.label,
                'textarea',
                valuePayload(old),
                function (next) {
                    const nextValue = clone(old);
                    nextValue.value = old.kind === 'optional_text' && next === '' ? null : next;
                    fieldOf(working, id).value = nextValue;
                },
                { disabled: field.editable === false || opts.disabled }
            );
            return;
        }
        const force = blocked || opts.disabled;
        const fieldControl = options.fieldControl(displayed, force, false, {
            wrapSelect: true,
            wrapCheckbox: true,
            wrapText: true
        });
        const dom = fieldControl.element.getElement();
        const input = dom.querySelector('input,select,textarea');
        if (!input) {
            container.append(fieldControl.element);
            return;
        }
        input.setAttribute('aria-label', displayed.label);
        if (opts.hint) input.setAttribute('title', opts.hint);
        if (opts.hintId) input.setAttribute('aria-describedby', opts.hintId);
        const numeric = opts.numeric || presentations.numeric(kind, id);
        if (numeric && input.tagName === 'INPUT') {
            input.type = 'number';
            input.min = numeric.min;
            input.max = numeric.max;
            input.step = numeric.step || 1;
        }
        if (opts.inlineHint) {
            const hintId = 'gpo-targeting-hint-' + nextInputId++;
            input.classList.add('gpo-targeting-prefix');
            input.setAttribute('aria-describedby', hintId);
            input.parentNode.appendChild(
                createElement('span', {
                    className: 'gpo-editor-field__hint gpo-targeting-prefix__hint',
                    attrs: { id: hintId },
                    text: opts.inlineHint
                }).getElement()
            );
        }
        const isTime = kind === 'time' && (id === 'filter.begin' || id === 'filter.end');
        if (isTime) {
            input.type = 'time';
            input.step = '60';
            input.value = /^\d{2}:\d{2}/.test(String(value(id))) ? String(value(id)).slice(0, 5) : '';
        }
        let touched = false;
        const originalRead = fieldControl.read;
        function captureOne() {
            if (generation !== renderGeneration || !touched || force || field.editable === false) return;
            let next = originalRead();
            if (booleanChoice) {
                const booleanValue = clone(field.value);
                booleanValue.value = next.value === 'true';
                next = booleanValue;
            }
            if (isTime) {
                next = clone(field.value);
                next.value = /^\d{2}:\d{2}$/.test(input.value) ? input.value + ':00' : input.value;
            }
            fieldOf(working, id).value = clone(next);
        }
        fieldControl.read = function () {
            captureOne();
            return clone(fieldOf(working, id).value);
        };
        inputRecords.push({ capture: captureOne });
        controls.push(fieldControl);
        input.addEventListener('input', function () {
            if (generation !== renderGeneration) return;
            touched = true;
            captureOne();
            changed();
        });
        input.addEventListener('change', function () {
            if (generation !== renderGeneration) return;
            touched = true;
            captureOne();
            if (opts.onChange) {
                capture();
                opts.onChange(value(id));
                rebuild(true);
            }
            changed();
        });
        container.append(fieldControl.element);
    }
    function context() {
        ordinary('filter.userContext', {
            label: words.context,
            choices: [
                { key: 'false', label: words.computer },
                { key: 'true', label: words.user }
            ],
            defaultKey: 'false',
            disabled: scope === 'computer',
            onChange: function (next) {
                if (kind === 'group' && next === false) {
                    state.primary = value('filter.primaryGroup');
                    set('filter.primaryGroup', false);
                } else if (kind === 'group' && state.primary !== undefined) set('filter.primaryGroup', state.primary);
            }
        });
    }
    function versionRange() {
        ['min', 'max'].forEach(function (bound) {
            ordinary('filter.' + bound, { label: words[bound] });
            ordinary('filter.' + (bound === 'min' ? 'gte' : 'lte'), {
                choices: [
                    { key: 'false', label: bound === 'min' ? '>' : '<' },
                    { key: 'true', label: bound === 'min' ? '≥' : '≤' }
                ],
                defaultKey: 'false'
            });
        });
    }
    function dateMode(next) {
        const previous = state.dateMode || value('filter.period');
        state.dates[previous] = dateParts(working);
        set('filter.period', next);
        const cached = state.dates[next] || {},
            now = today();
        set('filter.dow', next === 'WEEKLY' ? cached.dow || weekday(now) : null);
        set('filter.day', next === 'MONTHLY' || next === 'YEARLY' ? cached.day || now.getDate() : null);
        set('filter.month', next === 'YEARLY' ? cached.month || now.getMonth() + 1 : null);
        set(
            'filter.year',
            next === 'YEARLY' ? (cached.year !== undefined ? cached.year : String(now.getFullYear())) : null
        );
        state.dateMode = next;
    }
    function calendar() {
        const month = Number(value('filter.month')) || today().getMonth() + 1;
        const selected = Number(value('filter.day'));
        const locale = language === 'ru' ? 'ru-RU' : 'en-US';
        const choices = Array.from({ length: 12 }, function (_, index) {
            return {
                key: String(index + 1),
                label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, index, 1))
            };
        });
        custom(
            'filter.month',
            label('filter.month', words.calendar),
            'select',
            month,
            function (next) {
                set('filter.month', Number(next));
                if (Number(value('filter.day')) > daysInMonth(next, 2024)) set('filter.day', daysInMonth(next, 2024));
                rebuild(true);
            },
            { choices: choices }
        );
        const board = createElement('div', {
            className: 'gpo-editor-targeting-calendar',
            attrs: { role: 'group', 'aria-label': words.calendar, 'data-field-id': 'filter.day' }
        });
        const days = createElement('div', { className: 'gpo-editor-targeting-calendar__days' });
        let firstButton;
        for (let day = 1; day <= daysInMonth(month, 2024); day++) {
            (function (number) {
                const button = createElement('button', {
                    className: ['button', 'gpo-editor-targeting-calendar__day', number === selected ? 'active' : null],
                    attrs: {
                        type: 'button',
                        disabled: blocked ? 'disabled' : null,
                        'aria-pressed': String(number === selected),
                        'data-calendar-day': number
                    },
                    text: String(number)
                });
                if (!firstButton || number === selected) firstButton = button.getElement();
                button.on('click', function () {
                    if (blocked) return;
                    capture();
                    set('filter.day', number);
                    set('filter.month', month);
                    rebuild(true);
                    changed();
                });
                days.append(button);
            })(day);
        }
        const error = createElement('span', { className: 'gpo-editor-field__error' });
        board.append(days);
        board.append(error);
        container.append(board);
        register('filter.day', board, firstButton, error);
    }
    function dateForm() {
        state.dateMode = value('filter.period');
        ordinary('filter.period', { onChange: dateMode });
        const period = value('filter.period');
        if (period === 'WEEKLY') ordinary('filter.dow');
        if (period === 'MONTHLY')
            ordinary('filter.day', {
                choices: Array.from({ length: 31 }, function (_, i) {
                    return { key: String(i + 1), label: String(i + 1) };
                })
            });
        if (period !== 'YEARLY') return;
        const annual = value('filter.year') === null;
        custom('targeting.everyYear', words.everyYear, 'checkbox', annual, function (next) {
            capture();
            if (next) {
                state.year = value('filter.year');
                set('filter.year', null);
            } else set('filter.year', state.year || String(today().getFullYear()));
            rebuild(true);
        });
        if (annual) calendar();
        else {
            const day = value('filter.day'),
                month = value('filter.month'),
                year = value('filter.year');
            const formatted =
                year && month && day
                    ? String(year).padStart(4, '0') +
                      '-' +
                      String(month).padStart(2, '0') +
                      '-' +
                      String(day).padStart(2, '0')
                    : '';
            const dateControl = custom(
                'filter.day',
                words.date,
                'date',
                formatted,
                function (next) {
                    const parts = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(next);
                    set('filter.year', parts ? parts[1] : null);
                    set('filter.month', parts ? Number(parts[2]) : null);
                    set('filter.day', parts ? Number(parts[3]) : null);
                },
                { min: '0001-01-01', max: '65535-12-31' }
            );
            const dateError = controls[controls.length - 1].setError;
            ['filter.month', 'filter.year'].forEach(function (id) {
                if (!fieldOf(working, id)) return;
                controls.push({
                    id: id,
                    read: function () {
                        return clone(fieldOf(working, id).value);
                    },
                    setError: dateError,
                    focus: function () {
                        dateControl.input.focus();
                    }
                });
            });
        }
    }
    function fileForm() {
        const type = value('filter.type') || 'EXISTS';
        const mode = type === 'VERSION' ? 'VERSION' : value('filter.folder') ? 'FOLDER' : 'FILE';
        const choices = [
            { key: 'FILE', label: words.file },
            { key: 'FOLDER', label: words.folder },
            { key: 'VERSION', label: words.fileVersion }
        ];
        if (type !== 'EXISTS' && type !== 'VERSION') choices.unshift({ key: type, label: words.saved + type });
        custom(
            'filter.type',
            words.match,
            'select',
            type !== 'EXISTS' && type !== 'VERSION' ? type : mode,
            function (next) {
                capture();
                set('filter.type', next === 'VERSION' ? 'VERSION' : 'EXISTS');
                set('filter.folder', next === 'FOLDER');
                rebuild(true);
            },
            { choices: choices }
        );
        ordinary('filter.path');
        if (type === 'VERSION') versionRange();
    }
    function languageForm() {
        const field = fieldOf(working, 'filter.languageLocale');
        if (field) {
            const choices = languageChoices(field, language);
            ordinary(field.id, {
                choices: choices,
                onChange: function (next) {
                    const choice = choices.find(function (candidate) {
                        return candidate.key === next;
                    });
                    if (choice) set('filter.displayName', choice.label);
                }
            });
            if (value(field.id) === 'unknown')
                container.append(
                    createElement('div', { className: 'gpo-editor-preference-notice', text: words.broken })
                );
        }
        const hintId = scope === 'computer' ? 'gpo-targeting-hint-' + nextInputId++ : null;
        ordinary('filter.default', {
            disabled: scope === 'computer',
            hint: scope === 'computer' ? words.userLanguageScope : null,
            hintId: hintId
        });
        ordinary('filter.system');
        ordinary('filter.native');
        if (scope === 'computer')
            container.append(
                createElement('div', {
                    className: 'gpo-editor-field__hint gpo-targeting-language__hint',
                    attrs: { id: hintId },
                    text: words.userLanguageScope
                })
            );
    }
    function ipRangeForm() {
        const v6 = value('filter.useIPv6') === true;
        state.ipMode = v6 ? 'ipv6' : 'ipv4';
        state.ipRanges = state.ipRanges || {};
        ordinary('filter.useIPv6', {
            label: words.useIPv6,
            onChange: function (next) {
                capture();
                state.ipRanges[state.ipMode] = { min: value('filter.min'), max: value('filter.max') };
                const mode = next ? 'ipv6' : 'ipv4';
                const cached = state.ipRanges[mode] || { min: '', max: next ? '128' : '' };
                set('filter.min', cached.min);
                set('filter.max', cached.max);
                state.ipMode = mode;
            }
        });
        ordinary('filter.min', { label: v6 ? words.ipv6Address : null });
        ordinary(
            'filter.max',
            v6 ? { label: words.prefix, numeric: { min: 0, max: 128, step: 1 }, inlineHint: words.prefixHint } : null
        );
    }
    function registryForm() {
        const type = value('filter.type') || 'KEYEXISTS',
            subtype = value('filter.subtype') || 'EQUALHEX';
        const mode = type === 'MATCHVALUE' ? subtype : type;
        const modes = [
            ['KEYEXISTS', 'key'],
            ['VALUEEXISTS', 'value'],
            ['EQUALHEX', 'data'],
            ['EQUALDEC', 'decimal'],
            ['SUBSTRING', 'substring'],
            ['VERSION', 'version'],
            ['GETVALUE', 'get']
        ].map(function (entry) {
            return { key: entry[0], label: words[entry[1]] };
        });
        if (
            !modes.some(function (choice) {
                return choice.key === mode;
            })
        )
            modes.unshift({ key: mode, label: words.saved + mode });
        custom(
            'filter.type',
            words.match,
            'select',
            mode,
            function (next) {
                capture();
                const match = ['EQUALHEX', 'EQUALDEC', 'SUBSTRING', 'VERSION'].indexOf(next) !== -1;
                set('filter.type', match ? 'MATCHVALUE' : next);
                if (match) set('filter.subtype', next);
                rebuild(true);
            },
            { choices: modes }
        );
        ordinary('filter.hive', { defaultKey: 'HKEY_LOCAL_MACHINE' });
        ordinary('filter.key');
        if (type === 'KEYEXISTS') return;
        const defaultName = value('filter.valueName') === '';
        custom('targeting.defaultName', words.defaultName, 'checkbox', defaultName, function (next) {
            capture();
            if (next) {
                state.valueName = value('filter.valueName');
                set('filter.valueName', '');
            } else
                set(
                    'filter.valueName',
                    state.valueName === '' || state.valueName === null || state.valueName === undefined
                        ? null
                        : state.valueName
                );
            rebuild(true);
        });
        ordinary('filter.valueName', { disabled: defaultName });
        ordinary('filter.valueType', { defaultKey: '' });
        if (type === 'GETVALUE') ordinary('filter.variableName');
        if (type === 'MATCHVALUE') {
            if (subtype === 'VERSION') versionRange();
            else ordinary('filter.valueData');
        }
    }
    function userForm() {
        const mode = state.userMode || (value('filter.sid') ? 'sid' : 'name');
        state.userMode = mode;
        custom(
            'targeting.userMatch',
            words.by,
            'select',
            mode,
            function (next) {
                capture();
                state.values[mode] = value('filter.' + mode);
                state.userMode = next;
                set('filter.' + mode, null);
                if (state.values[next] !== undefined) set('filter.' + next, state.values[next]);
                rebuild(true);
            },
            {
                choices: [
                    { key: 'name', label: words.name },
                    { key: 'sid', label: words.sid }
                ]
            }
        );
        ordinary('filter.' + mode);
    }
    function rebuild(skipCapture) {
        const annual = kind === 'date' && value('filter.period') === 'YEARLY' && value('filter.year') === null;
        const enteringAnnual = annual && !state.calendarActive;
        state.calendarActive = annual;
        const active = document.activeElement;
        const focusedField = container.getElement().contains(active) && active.closest('[data-field-id]');
        const focusedId = focusedField && focusedField.getAttribute('data-field-id');
        const focusedDay = focusedId && active.getAttribute('data-calendar-day');
        if (!skipCapture) capture();
        renderGeneration += 1;
        controls.splice(0);
        inputRecords.splice(0);
        container.getElement().replaceChildren();
        if (kind === 'date') dateForm();
        else if (kind === 'file') fileForm();
        else if (kind === 'language') languageForm();
        else if (kind === 'ip_range') ipRangeForm();
        else if (kind === 'registry') registryForm();
        else if (kind === 'user') userForm();
        else if (kind === 'msi') {
            ordinary('filter.type');
            ordinary('filter.subtype', { onChange: function () {} });
            ordinary('filter.code');
            const subtype = value('filter.subtype');
            if (subtype === 'VERSION') versionRange();
            else if (/^(GET|MATCH)_/.test(subtype || '')) {
                ordinary('filter.item');
                ordinary('filter.value', { label: /^GET_/.test(subtype) ? words.getValue : null });
            }
        } else if (kind === 'terminal') {
            ordinary('filter.type');
            ordinary('filter.option', { onChange: function () {} });
            if (value('filter.option') === 'IP') {
                ordinary('filter.min');
                ordinary('filter.max');
            } else if (value('filter.option') !== 'NE') ordinary('filter.value');
        } else {
            (SIMPLE[kind] || []).forEach(function (name) {
                if (name === 'userContext') context();
                else
                    ordinary('filter.' + name, {
                        disabled: kind === 'group' && name === 'primaryGroup' && value('filter.userContext') !== true
                    });
            });
        }
        const note = presentations.note(kind, language);
        if (note)
            container.append(
                createElement('div', {
                    className: 'gpo-editor-field__hint gpo-editor-targeting-operands__note',
                    text: note
                })
            );
        if (focusedId) {
            const focusedContainer = Array.from(container.getElement().querySelectorAll('[data-field-id]')).find(
                function (element) {
                    return element.getAttribute('data-field-id') === focusedId;
                }
            );
            const replacement =
                focusedContainer &&
                ((focusedDay && focusedContainer.querySelector('[data-calendar-day="' + focusedDay + '"]')) ||
                    focusedContainer.querySelector('[aria-pressed="true"],input,select,textarea,button'));
            if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
            else {
                const fallback = container
                    .getElement()
                    .querySelector(
                        'input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled)'
                    );
                if (fallback) fallback.focus({ preventScroll: true });
            }
        }
        const pane = container.getElement().closest('.gpo-editor-filters__fields');
        if (enteringAnnual && pane) pane.scrollTop = 0;
    }
    rebuild();
    return {
        element: container,
        controls: controls,
        readFields: function () {
            capture();
            return clone(working);
        },
        validate: function () {
            return validateFields(Object.assign({}, node, { fields: this.readFields() }));
        }
    };
}

export { render, initialize, validateFields };
