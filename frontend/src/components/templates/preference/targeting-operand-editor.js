/** RSAT-style operand forms. Common boolean operators belong to the parent toolbar. */

import { createElement } from '@gpui/util/element-creator';
import { valuePayload, clone } from '@gpui/core/editor-dto';
import { fieldLabel, isTextarea } from '@gpui/core/targeting/presentations';
import * as presentations from '@gpui/core/targeting/presentations';
import * as typedInput from '@gpui/components/templates/preference/targeting-typed-input';

import {
    SIMPLE,
    WORDS,
    assign,
    dateParts,
    daysInMonth,
    fieldOf,
    initialize,
    isCommon,
    languageChoices,
    raw,
    semanticType,
    stateOf,
    today,
    validateFields,
    weekday
} from '@gpui/core/targeting/operand-model';

let nextInputId = 1;
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
