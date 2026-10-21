import { createElement } from '@gpui/util/element-creator';

let nextInputId = 1;
const TYPES = {
    ipv4: { count: 4, length: 3, max: 255, separator: '.', characters: /^\d*$/, inserted: /^[\d.]*$/ },
    mac: { count: 6, length: 2, separator: ':', characters: /^[a-f\d]*$/i, inserted: /^[a-f\d:-]*$/i },
    version: { count: 4, length: 5, max: 65535, separator: '.', characters: /^\d*$/, inserted: /^[\d.]*$/ },
    guid: { inserted: /^[a-f\d{}-]*$/i },
    ipv6: { inserted: /^[a-f\d:.]*$/i }
};
const WORDS = {
    en: {
        ipv4: 'IPv4 address',
        ipv6: 'IPv6 address',
        mac: 'MAC address',
        version: 'Version',
        guid: 'GUID',
        octet: 'Octet',
        byte: 'Byte',
        component: 'Component',
        of: 'of',
        saved: 'saved value'
    },
    ru: {
        ipv4: 'Адрес IPv4',
        ipv6: 'Адрес IPv6',
        mac: 'MAC-адрес',
        version: 'Версия',
        guid: 'GUID',
        octet: 'Октет',
        byte: 'Байт',
        component: 'Компонент',
        of: 'из',
        saved: 'сохранённое значение'
    }
};

function validSegment(value, type) {
    return (
        value.length <= type.length &&
        type.characters.test(value) &&
        (value === '' || type.max === undefined || Number(value) <= type.max)
    );
}

/** A partial value is useful while editing; completeness belongs to the operand validator. */
function splitSegments(value, name) {
    const type = TYPES[name];
    if (value === '') return [''];
    let parts;
    if (name === 'mac' && /^[a-f\d]+$/i.test(value) && value.length > 2) {
        if (value.length > 12 || value.length % 2) return null;
        parts = value.match(/.{2}/g);
    } else {
        if (name === 'mac' && value.indexOf(':') !== -1 && value.indexOf('-') !== -1) return null;
        parts = value.split(name === 'mac' ? /[:-]/ : '.');
    }
    return parts.length <= type.count &&
        parts.every(function (part) {
            return validSegment(part, type);
        })
        ? parts
        : null;
}

function joinSegments(inputs, separator) {
    const parts = inputs.map(function (input) {
        return input.value;
    });
    while (parts.length && parts[parts.length - 1] === '') parts.pop();
    return parts.join(separator);
}

/** Accept a GUID prefix or a complete GUID, without extracting hex from arbitrary text. */
function guidValue(value) {
    let body = value,
        opening = false,
        closing = false;
    if (body.charAt(0) === '{') {
        opening = true;
        body = body.slice(1);
    }
    if (body.charAt(body.length - 1) === '}') {
        closing = true;
        body = body.slice(0, -1);
    }
    if (!/^[a-f\d-]*$/i.test(body) || body.length > 36 || (closing && !opening)) return null;
    for (let i = 0; i < body.length; i++) {
        if (body.charAt(i) === '-' && [8, 13, 18, 23].indexOf(i) === -1) return null;
    }
    const hex = body.replace(/-/g, '');
    if (hex.length > 32 || (closing && hex.length !== 32)) return null;
    const parts = [];
    let offset = 0;
    [8, 4, 4, 4, 12].forEach(function (length) {
        if (offset < hex.length) parts.push(hex.slice(offset, offset + length));
        offset += length;
    });
    let formatted = parts.join('-');
    if (hex.length === 32) return '{' + formatted.toUpperCase() + '}';
    if (body.charAt(body.length - 1) === '-' && [8, 12, 16, 20].indexOf(hex.length) !== -1) formatted += '-';
    return (opening ? '{' : '') + formatted;
}

function replaceSelection(input, text) {
    const start = input.selectionStart === null ? input.value.length : input.selectionStart;
    const end = input.selectionEnd === null ? start : input.selectionEnd;
    return input.value.slice(0, start) + text + input.value.slice(end);
}

function insertedText(before, after) {
    let start = 0;
    while (start < before.length && start < after.length && before.charAt(start) === after.charAt(start)) start++;
    let endBefore = before.length,
        endAfter = after.length;
    while (endBefore > start && endAfter > start && before.charAt(endBefore - 1) === after.charAt(endAfter - 1)) {
        endBefore--;
        endAfter--;
    }
    return after.slice(start, endAfter);
}

function focusEnd(input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

/**
 * The adapter owns text presentation only. Its caller retains the original DTO envelope.
 * readValue() returns the exact initial text until an accepted edit emits onChange(text).
 */
function render(options) {
    const name = options.type;
    const type = TYPES[name];
    if (!type) throw new Error('Unsupported targeting input type: ' + name);
    const words = WORDS[options.language === 'ru' ? 'ru' : 'en'];
    const label = options.label || words[name];
    const disabled = Boolean(options.disabled);
    const original = options.value === null || options.value === undefined ? '' : String(options.value);
    let current = original;
    const inputs = [];
    const element = createElement('div', {
        className: ['gpo-targeting-typed-input', 'gpo-targeting-typed-input--' + name],
        attrs: { role: 'group', 'aria-label': label, 'aria-disabled': disabled ? 'true' : null }
    });
    const singleType = name === 'guid' || name === 'ipv6';
    const parts = singleType ? null : splitSegments(original, name);
    const fallback =
        name === 'guid'
            ? guidValue(original) === null
            : name === 'ipv6'
              ? !type.inserted.test(original)
              : parts === null;

    function emit(value) {
        if (disabled || value === current) return;
        current = value;
        if (typeof options.onChange === 'function') options.onChange(value);
    }

    function inputElement(className, inputLabel, size) {
        const input = createElement('input', {
            className: className,
            attrs: {
                id: 'gpo-targeting-typed-input-' + nextInputId++,
                type: 'text',
                'aria-label': inputLabel,
                inputmode: name === 'ipv4' || name === 'version' ? 'numeric' : 'text',
                autocomplete: 'off',
                autocapitalize: 'off',
                spellcheck: 'false',
                size: size,
                disabled: disabled ? 'disabled' : null
            }
        }).getElement();
        inputs.push(input);
        element.append(input);
        return input;
    }

    function bindSingle(input, isFallback) {
        let accepted = original;
        input.value = original;
        function normalized(candidate) {
            if (name === 'guid') return guidValue(candidate);
            if (name === 'ipv6') return type.inserted.test(candidate) ? candidate : null;
            const parsed = splitSegments(candidate, name);
            if (!parsed) return null;
            while (parsed.length && parsed[parsed.length - 1] === '') parsed.pop();
            return parsed.join(type.separator);
        }
        function accept(candidate, paste) {
            let formatted = normalized(candidate);
            if (formatted === null) {
                // A legacy value can be corrected incrementally, retaining the remaining text.
                // Newly pasted or wholly replaced invalid text is never silently shortened.
                if (
                    !isFallback ||
                    paste ||
                    !type.inserted.test(insertedText(accepted, candidate)) ||
                    (candidate.length >= accepted.length && normalized(accepted) !== null)
                )
                    return false;
                formatted = candidate;
            }
            const caret = input.selectionStart;
            const atEnd = caret === input.value.length;
            const hexBefore =
                name === 'guid' && caret !== null ? (input.value.slice(0, caret).match(/[a-f\d]/gi) || []).length : 0;
            input.value = formatted;
            accepted = formatted;
            if (atEnd || paste) input.setSelectionRange(formatted.length, formatted.length);
            else if (name === 'guid' && caret !== null) {
                let position = 0,
                    seen = 0;
                while (position < formatted.length && seen < hexBefore) {
                    if (/[a-f\d]/i.test(formatted.charAt(position))) seen++;
                    position++;
                }
                input.setSelectionRange(position, position);
            }
            emit(formatted);
            return true;
        }
        function deleteGuid(inputType) {
            if (name !== 'guid' || guidValue(input.value) === null) return false;
            const start = input.selectionStart,
                end = input.selectionEnd;
            if (start === null || end === null) return false;
            const hex = input.value.replace(/[{}-]/g, '');
            if (!hex.length) {
                accept('', false);
                input.setSelectionRange(0, 0);
                return true;
            }
            let before = (input.value.slice(0, start).match(/[a-f\d]/gi) || []).length;
            let after = (input.value.slice(0, end).match(/[a-f\d]/gi) || []).length;
            const backward = /Backward$/.test(inputType);
            if (before === after) {
                if (backward) before--;
                else after++;
            }
            if (before < 0 || after > hex.length) return true;
            const remaining = hex.slice(0, before) + hex.slice(after);
            const candidate = remaining && input.value.charAt(0) === '{' ? '{' + remaining : remaining;
            accept(candidate, false);
            let position = 0,
                seen = 0;
            while (position < input.value.length && seen < before) {
                if (/[a-f\d]/i.test(input.value.charAt(position))) seen++;
                position++;
            }
            input.setSelectionRange(position, position);
            return true;
        }
        input.addEventListener('beforeinput', function (event) {
            if (disabled) {
                event.preventDefault();
                return;
            }
            if (event.inputType.indexOf('delete') === 0) {
                if (deleteGuid(event.inputType)) event.preventDefault();
                return;
            }
            if (event.data === null || event.data === undefined) return;
            const candidate = replaceSelection(input, event.data);
            if (!type.inserted.test(event.data) || (!isFallback && normalized(candidate) === null))
                event.preventDefault();
        });
        input.addEventListener('input', function () {
            if (disabled || !type.inserted.test(insertedText(accepted, input.value)) || !accept(input.value, false))
                input.value = accepted;
        });
        input.addEventListener('paste', function (event) {
            event.preventDefault();
            if (disabled || !event.clipboardData) return;
            const text = event.clipboardData.getData('text/plain');
            if (!type.inserted.test(text)) return;
            // A complete value replaces the operand even if the caret is inside an old value.
            const whole = normalized(text);
            const complete =
                name === 'guid'
                    ? whole && /^\{[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}\}$/i.test(whole)
                    : name === 'ipv6'
                      ? whole && whole.indexOf(':') !== -1
                      : whole && splitSegments(text, name).length === type.count;
            accept(complete ? text : replaceSelection(input, text), true);
        });
    }

    if (fallback || singleType) {
        const single = inputElement(
            fallback
                ? 'gpo-targeting-typed-input__fallback'
                : ['gpo-targeting-typed-input__segment', 'gpo-targeting-typed-input__full'],
            fallback ? label + ', ' + words.saved : label,
            name === 'guid' ? 38 : name === 'ipv6' ? 39 : undefined
        );
        bindSingle(single, fallback);
    } else {
        const segmentName = name === 'ipv4' ? words.octet : name === 'mac' ? words.byte : words.component;
        for (let index = 0; index < type.count; index++) {
            if (index)
                element.append(
                    createElement('span', {
                        className: 'gpo-targeting-typed-input__separator',
                        attrs: { 'aria-hidden': 'true' },
                        text: type.separator
                    })
                );
            const segment = inputElement(
                'gpo-targeting-typed-input__segment',
                label + ', ' + segmentName + ' ' + (index + 1) + ' ' + words.of + ' ' + type.count,
                type.length
            );
            segment.value = parts[index] || '';
            bindSegment(segment, index);
        }
    }

    function bindSegment(input, index) {
        function commit() {
            inputs.forEach(function (segment) {
                segment._targetingAccepted = segment.value;
            });
            emit(joinSegments(inputs, type.separator));
        }
        input._targetingAccepted = input.value;
        function restore() {
            input.value = input._targetingAccepted;
        }
        function advance() {
            if (inputs[index + 1]) {
                inputs[index + 1].focus();
                inputs[index + 1].select();
            }
        }
        input.addEventListener('keydown', function (event) {
            if (disabled || event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key === type.separator || (name === 'mac' && event.key === '-')) {
                event.preventDefault();
                advance();
            } else if (event.key === 'Backspace' && input.value === '' && index) {
                event.preventDefault();
                focusEnd(inputs[index - 1]);
            }
        });
        input.addEventListener('beforeinput', function (event) {
            if (disabled) {
                event.preventDefault();
                return;
            }
            if (event.data === null || event.data === undefined || event.inputType.indexOf('delete') === 0) return;
            if (event.data === type.separator || (name === 'mac' && event.data === '-')) {
                event.preventDefault();
                advance();
                return;
            }
            if (!validSegment(replaceSelection(input, event.data), type)) event.preventDefault();
        });
        input.addEventListener('input', function () {
            if (disabled || !validSegment(input.value, type)) {
                restore();
                return;
            }
            commit();
        });
        input.addEventListener('paste', function (event) {
            event.preventDefault();
            if (disabled || !event.clipboardData) return;
            const text = event.clipboardData.getData('text/plain');
            const distributed =
                text.indexOf(type.separator) !== -1 ||
                (name === 'mac' && (text.indexOf('-') !== -1 || text.length > type.length));
            if (!distributed) {
                const local = replaceSelection(input, text);
                if (!validSegment(local, type)) return;
                input.value = local;
                focusEnd(input);
                commit();
                return;
            }
            const pasted = splitSegments(text, name);
            if (!pasted) return;
            const start = pasted.length === type.count ? 0 : index;
            if (start + pasted.length > type.count) return;
            for (let i = start; i < type.count; i++) inputs[i].value = pasted[i - start] || '';
            commit();
            focusEnd(inputs[Math.min(start + pasted.length - 1, type.count - 1)]);
        });
    }

    return {
        element: element,
        inputs: inputs,
        readValue: function () {
            return current;
        },
        focus: function () {
            if (inputs[0]) inputs[0].focus();
        }
    };
}

export { render };
