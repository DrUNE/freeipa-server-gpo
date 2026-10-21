/** RSAT-style operand forms. Common boolean operators belong to the parent toolbar. */

import { equal, validatePreferenceField, valuePayload, clone } from '@gpui/core/editor-dto';
import * as presentations from '@gpui/core/targeting/presentations';
import type { FieldDescriptor } from '@gpui/core/dto-types';
import type { OperandNode, OperandOptions, OperandState, OperandError, DateParts } from '@gpui/core/targeting/types';

// The data side of the operand forms: the field catalogs, value helpers, initial state and validation.
const COMMON = ['filter.bool', 'filter.not', 'filter.combine', 'filter.negate', 'filter.hidden'];
const SIMPLE: Record<string, string[]> = {
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
const WORDS: Record<string, Record<string, string>> = {
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

function fieldOf(fields: FieldDescriptor[], id: string): FieldDescriptor | undefined {
    return fields.find(function (field) {
        return field.id === id;
    });
}
// `any`: the payload type depends on the field and is compared/computed with freely by callers (as valuePayload does).
function raw(fields: FieldDescriptor[], id: string): any {
    const field = fieldOf(fields, id);
    return field ? valuePayload(field.value) : null;
}
function assign(fields: FieldDescriptor[], id: string, value: unknown): void {
    const field = fieldOf(fields, id);
    if (!field || field.editable === false) return;
    const envelope = clone(field.value);
    envelope.value = value;
    field.value = envelope;
}
function stateOf(node: OperandNode): OperandState {
    if (!node._operandState) node._operandState = { original: clone(node.fields || []), dates: {}, values: {} };
    return node._operandState;
}
function today(): Date {
    return new Date();
}
function weekday(date: Date): string {
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
}
function daysInMonth(month: unknown, year: unknown): number {
    return new Date(Number(year), Number(month), 0).getDate();
}
function dateParts(fields: FieldDescriptor[]): DateParts {
    return {
        day: raw(fields, 'filter.day'),
        month: raw(fields, 'filter.month'),
        year: raw(fields, 'filter.year'),
        dow: raw(fields, 'filter.dow')
    };
}
function isCommon(id: string): boolean {
    return COMMON.indexOf(id) !== -1;
}
function languageChoices(
    field: FieldDescriptor | null | undefined,
    language: string
): { key: string; label: string }[] {
    let names: Intl.DisplayNames | null;
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
            let text: string | null | undefined;
            try {
                text = names && names.of(choice.key);
            } catch (_) {
                text = null;
            }
            return { key: choice.key, label: text && text !== choice.key ? text : choice.label };
        });
}

/** Only new nodes receive defaults. Opening a persisted node never calls this implicitly. */
function initialize(node: OperandNode, options?: OperandOptions): FieldDescriptor[] {
    const fields = clone(node.fields || []);
    if (node.originalPath) return fields;
    const language = options && options.language === 'ru' ? 'ru' : 'en';
    const scope = (options && options.scope) || 'computer';
    const now = today();
    function empty(id: string, value: unknown): void {
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

function activeIds(node: OperandNode): string[] {
    const fields = node.fields || [];
    let ids: string[] | undefined = SIMPLE[node.kind];
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

function ipv4(value: unknown): number | null {
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
function mac(value: unknown): number | null {
    return /^([a-f\d]{2}:){5}[a-f\d]{2}$/i.test(String(value)) ? parseInt(String(value).replace(/:/g, ''), 16) : null;
}
function ipv6(value: unknown): number[] | null {
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
function version(value: unknown): number[] | null {
    if (!/^\d+(\.\d+){0,3}$/.test(String(value))) return null;
    const parts = String(value).split('.').map(Number);
    return parts.every(function (part) {
        return part <= 65535;
    })
        ? parts.concat([0, 0, 0, 0]).slice(0, 4)
        : null;
}
function compare(left: number[], right: number[]): number {
    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i]) return left[i] - right[i];
    }
    return 0;
}
function semanticType(kind: string, id: string, useIPv6?: boolean): string | null {
    if (id === 'filter.min' || id === 'filter.max') {
        if (kind === 'ip_range' && useIPv6) return id === 'filter.min' ? 'ipv6' : null;
        if (kind === 'ip_range' || kind === 'terminal') return 'ipv4';
        if (kind === 'mac_range') return 'mac';
        if (['file', 'msi', 'registry'].indexOf(kind) !== -1) return 'version';
    }
    if ((kind === 'msi' && id === 'filter.code') || (kind === 'run_once' && id === 'filter.id')) return 'guid';
    return null;
}
function validTime(value: unknown): boolean {
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
function validateFields(node: OperandNode | null | undefined): OperandError[] {
    if (!node || node.available === false) return [];
    const fields = node.fields || [];
    const active = activeIds(node);
    const original = node._operandState && node._operandState.original;
    const fresh = !node.originalPath;
    const errors: OperandError[] = [];
    function changed(id: string): boolean {
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
    function check(id: string): boolean {
        return changed(id) || modeChanged;
    }
    function add(id: string, code: string): void {
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
    function pair(parser: (value: unknown) => number | number[] | null, code: string, optional: boolean): void {
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
            // a parser returns either numbers or arrays, so both bounds are of the same kind
            (Array.isArray(parsedMin) ? compare(parsedMin, parsedMax as number[]) : parsedMin - (parsedMax as number)) >
                0
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

export {
    COMMON,
    SIMPLE,
    WORDS,
    fieldOf,
    raw,
    assign,
    stateOf,
    today,
    weekday,
    daysInMonth,
    dateParts,
    isCommon,
    languageChoices,
    initialize,
    activeIds,
    ipv4,
    mac,
    ipv6,
    version,
    compare,
    semanticType,
    validTime,
    validateFields
};
