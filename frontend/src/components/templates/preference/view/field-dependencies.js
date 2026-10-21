import { valuePayload } from '@gpui/util/editor-dto';
import * as preferenceLayouts from '@gpui/components/templates/preference/layouts/index';

const PREFERENCE_LAYOUTS = preferenceLayouts;

function dependencyRulesFor(kind) {
    const layout = PREFERENCE_LAYOUTS[kind];
    return layout && Array.isArray(layout.dependencies) ? layout.dependencies : [];
}

function conditionTextValue(raw) {
    if (raw === null || raw === undefined) return '';
    if (Array.isArray(raw)) return raw.join('\n');
    return String(raw);
}

function conditionValueIsEmpty(raw) {
    if (raw === null || raw === undefined) return true;
    if (typeof raw === 'string') return raw.trim() === '';
    if (Array.isArray(raw)) return raw.length === 0;
    return false;
}

function conditionBooleanValue(raw) {
    return raw === true || raw === 1 || raw === 'true';
}

function conditionCompare(expected, raw) {
    if (expected === true) return conditionBooleanValue(raw);
    if (expected === false) return raw === false || raw === 0;
    return conditionTextValue(raw).toLowerCase() === conditionTextValue(expected).toLowerCase();
}

function conditionHolds(condition, readSource) {
    if (!condition) return true;
    if (condition.anyOf !== undefined) {
        return (Array.isArray(condition.anyOf) ? condition.anyOf : []).some(function (nested) {
            return conditionHolds(nested, readSource);
        });
    }
    if (condition.suffix !== undefined) {
        return conditionTextValue(readSource(condition.source))
            .toLowerCase()
            .endsWith(String(condition.suffix).toLowerCase());
    }
    if (Object.prototype.hasOwnProperty.call(condition, 'nonEmpty')) {
        return Boolean(condition.nonEmpty) !== conditionValueIsEmpty(readSource(condition.source));
    }
    const raw = readSource(condition.source);
    if (condition.in !== undefined) {
        return (Array.isArray(condition.in) ? condition.in : []).some(function (item) {
            return conditionCompare(item, raw);
        });
    }
    if (condition.notIn !== undefined) {
        return !(Array.isArray(condition.notIn) ? condition.notIn : []).some(function (item) {
            return conditionCompare(item, raw);
        });
    }
    if (condition.equals !== undefined) {
        return conditionCompare(condition.equals, raw);
    }
    if (condition.notEquals !== undefined) {
        return !conditionCompare(condition.notEquals, raw);
    }
    return true;
}

function ruleEnabled(rule, readSource) {
    const conditions = Array.isArray(rule && rule.enabledWhen) ? rule.enabledWhen : [];
    return conditions.every(function (condition) {
        return conditionHolds(condition, readSource);
    });
}

function attachFieldDependencies(formElement, controlsById, rules) {
    const disabledIds = new Set();
    function sourceValue(fieldId) {
        let payload = null;
        (controlsById.get(fieldId) || []).forEach(function (control) {
            const current = control.read();
            if (current !== undefined) payload = valuePayload(current);
        });
        return payload;
    }
    function sync() {
        const passes = Math.min(rules.length + 1, 12);
        for (let pass = 0; pass < passes; pass += 1) {
            let changed = false;
            const cache = new Map();
            const nextDisabled = [];
            const readSource = function (fieldId) {
                if (!cache.has(fieldId)) cache.set(fieldId, sourceValue(fieldId));
                return cache.get(fieldId);
            };
            rules.forEach(function (rule) {
                if (!rule || !rule.field) return;
                const enabled = ruleEnabled(rule, readSource);
                if (!enabled) nextDisabled.push(rule.field);
                (controlsById.get(rule.field) || []).forEach(function (control) {
                    if (control.setDynamicDisabled && control.setDynamicDisabled(!enabled)) {
                        changed = true;
                    }
                });
            });
            disabledIds.clear();
            nextDisabled.forEach(function (id) {
                disabledIds.add(id);
            });
            if (!changed) break;
        }
    }
    formElement.addEventListener('input', sync);
    formElement.addEventListener('change', sync);
    return { sync: sync, disabledIds: disabledIds };
}

export {
    dependencyRulesFor,
    conditionTextValue,
    conditionValueIsEmpty,
    conditionBooleanValue,
    conditionCompare,
    conditionHolds,
    ruleEnabled,
    attachFieldDependencies
};
