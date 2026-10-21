// These are the cross-policy constraints in the bundled SDMX 1.0 catalog.
// Keep the namespace in the match: other vendors may use the same policy ID.
import type {
    ElementState,
    SecurityDraft,
    SecurityElement,
    SecurityModel,
    SecurityPolicy,
    DependencyPlan
} from './types';

type Pair = [number, number];
/** Expected shape of a policy value: its type, the allowed ranges and the ranges of the input. */
type Shape = [string, Pair[], Pair[]];
type Policies = Record<string, SecurityPolicy>;
type Drafts = Record<string, SecurityDraft>;

const BASE = 'urn:altlinux:sdmx:policies:';
const AGE_BASED = 'overwrite_events_older_than_the_retention_period';
const AS_NEEDED = 'overwrite_events_as_needed';
const SHAPES: Record<string, Shape> = {
    'account.password.maximum_password_age': ['integer', [[0, 999]], []],
    'account.password.minimum_password_age': ['integer', [[0, 998]], []],
    'account.kerberos.max_ticket_age': ['integer', [[0, 99999]], []],
    'account.kerberos.max_service_age': [
        'integer',
        [
            [0, 0],
            [10, 99999]
        ],
        []
    ],
    'account.kerberos.max_renew_age': ['integer', [[0, 99999]], []],
    'account.lockout.lockout_bad_count': ['integer', [[0, 999]], []],
    'account.lockout.reset_lockout_count': ['integer', [[1, 99999]], []],
    'account.lockout.lockout_duration': ['integer', [[0, 99999]], []],
    'account.lockout.allow_administrator_lockout': ['boolean', [], []],
    'event_log.security_log_audit_log_retention_period': ['enum', [], []],
    'event_log.security_log_retention_days': ['integer', [[1, 365]], []],
    'event_log.application_log_audit_log_retention_period': ['enum', [], []],
    'event_log.application_log_retention_days': ['integer', [[1, 365]], []],
    'event_log.system_log_audit_log_retention_period': ['enum', [], []],
    'event_log.system_log_retention_days': ['integer', [[1, 365]], []]
};

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function sameRanges(actualValue: unknown, expected: Pair[]): boolean {
    if (!Array.isArray(actualValue) || actualValue.length !== expected.length) return false;
    // The server data is unchecked here: the cast mirrors what the checks below verify at run time.
    const actual = actualValue as ({ min: number; max: number } | null)[];
    if (
        actual.some(function (range) {
            return !range || typeof range !== 'object';
        })
    )
        return false;
    const sorted = actual
        .map(function (range): Pair {
            return [(range as { min: number }).min, (range as { max: number }).max];
        })
        .sort(function (left, right) {
            return left[0] - right[0] || left[1] - right[1];
        });
    const wanted = expected.slice().sort(function (left, right) {
        return left[0] - right[0] || left[1] - right[1];
    });
    return sorted.every(function (range, index) {
        return (
            Number.isSafeInteger(range[0]) &&
            Number.isSafeInteger(range[1]) &&
            range[0] === wanted[index][0] &&
            range[1] === wanted[index][1]
        );
    });
}

function compatible(element: SecurityElement | null | undefined, shape: Shape): boolean {
    if (
        !element ||
        element.id !== 'value' ||
        element.value_type !== shape[0] ||
        element.required !== true ||
        !element.initial ||
        element.initial.kind !== shape[0] ||
        !sameRanges(element.ranges, shape[1]) ||
        !Array.isArray(element.options)
    )
        return false;
    if (!sameRanges(element.input_ranges, shape[2])) return false;
    const initial = element.initial.value;
    const inputRanges = element.input_ranges as { min: number; max: number }[]; // checked by sameRanges above
    const elementOptions = element.options as unknown[]; // checked by Array.isArray above
    if (shape[0] === 'integer') {
        const domain = inputRanges.length
            ? inputRanges.map(function (range): Pair {
                  return [range.min, range.max];
              })
            : shape[1];
        return (
            Number.isSafeInteger(initial) &&
            domain.some(function (range) {
                return (initial as number) >= range[0] && (initial as number) <= range[1];
            }) &&
            !elementOptions.length
        );
    }
    if (shape[0] === 'boolean') {
        return typeof initial === 'boolean' && !elementOptions.length;
    }
    const options = element.options as ({ id: unknown } | null)[];
    if (
        !Array.isArray(options) ||
        options.some(function (option) {
            return !option || typeof option.id !== 'string';
        })
    )
        return false;
    const choices = options.map(function (option) {
        // every option is an object with a string id (checked above)
        return (option as { id: string }).id;
    });
    return (
        typeof initial === 'string' &&
        choices.indexOf(initial) !== -1 &&
        choices.indexOf(AGE_BASED) !== -1 &&
        choices.indexOf(AS_NEEDED) !== -1
    );
}

function group(
    model: SecurityModel | null | undefined,
    namespace: string,
    prefix: string,
    names: string[]
): Policies | null {
    if (!model || !model.policies || typeof model.policies.get !== 'function') return null;
    const policies: Policies = {};
    for (let i = 0; i < names.length; i += 1) {
        const id = prefix + '.' + names[i];
        const policy = model.policies.get(namespace + '\u0000' + id);
        const elements = policy && policy.definition && policy.definition.elements;
        if (
            !policy ||
            policy.namespace !== namespace ||
            policy.policyId !== id ||
            !Array.isArray(elements) ||
            elements.length !== 1 ||
            !SHAPES[id] ||
            !compatible(elements[0], SHAPES[id])
        )
            return null;
        policies[names[i]] = policy;
    }
    return policies;
}

function draftFor(policy: SecurityPolicy): SecurityDraft {
    const defined = Boolean(policy.state && policy.state.state === 'defined');
    const current: Record<string, ElementState> = (defined && policy.state.elements) || {};
    const elements: Record<string, ElementState> = {};
    (policy.definition.elements || []).forEach(function (element) {
        elements[element.id] = defined
            ? clone(current[element.id] || { state: 'unset' })
            : element.initial
              ? { state: 'set', value: clone(element.initial) }
              : { state: 'unset' };
    });
    return { defined: defined, elements: elements };
}

function valueOf(draft: SecurityDraft | null | undefined): unknown {
    const state = draft && draft.defined && draft.elements && draft.elements.value;
    return state && state.state === 'set' && state.value ? state.value.value : null;
}

function initialOf(policy: SecurityPolicy): unknown {
    const element = (policy.definition.elements || []).find(function (item) {
        return item.id === 'value';
    });
    return element && element.initial ? element.initial.value : null;
}

function set(draft: SecurityDraft, policy: SecurityPolicy, value: unknown): void {
    // the policy was validated by group(): its only element is `value`
    const element = (policy.definition.elements as SecurityElement[]).find(function (item) {
        return item.id === 'value';
    }) as SecurityElement;
    draft.defined = true;
    draft.elements.value = {
        state: 'set',
        value: { kind: element.value_type, value: value }
    };
}

function unset(draft: SecurityDraft): void {
    draft.defined = false;
}

// The value of a validated integer element: a safe integer, falling back to the element's initial value.
function number(draft: SecurityDraft, policy: SecurityPolicy): number {
    const value = valueOf(draft);
    return (Number.isSafeInteger(value) ? value : initialOf(policy)) as number;
}

function finish(policies: Policies, names: string[], primaryName: string, desired: Drafts): DependencyPlan | null {
    const changes = names
        .filter(function (name) {
            if (name === primaryName) return false;
            const previous = draftFor(policies[name]);
            const next = desired[name];
            return (
                previous.defined !== next.defined ||
                (next.defined && JSON.stringify(previous.elements) !== JSON.stringify(next.elements))
            );
        })
        .map(function (name) {
            return { policy: policies[name], draft: desired[name] };
        });
    return changes.length ? { changes: changes } : null;
}

function begin(policies: Policies, names: string[], primaryName: string, primaryDraft: SecurityDraft): Drafts {
    const desired: Drafts = {};
    names.forEach(function (name) {
        desired[name] = draftFor(policies[name]);
    });
    desired[primaryName] = clone(primaryDraft);
    return desired;
}

function password(
    model: SecurityModel | null | undefined,
    policy: SecurityPolicy,
    draft: SecurityDraft
): DependencyPlan | null {
    const names = ['maximum_password_age', 'minimum_password_age'];
    const policies = group(model, BASE + 'account-password', 'account.password', names);
    if (!policies) return null;
    const primary = names.find(function (name) {
        return policies[name] === policy;
    });
    if (!primary) return null;
    const other = names.find(function (name) {
        return name !== primary;
    }) as string; // a group has two names: the other one always exists
    const desired = begin(policies, names, primary, draft);
    if (!draft.defined) {
        unset(desired[other]);
        return finish(policies, names, primary, desired);
    }
    const chosen = valueOf(draft) as number; // checked to be a safe integer on the next line
    if (!Number.isSafeInteger(chosen)) return null;
    let counterpart: number = number(desired[other], policies[other]);
    if (primary === 'maximum_password_age') {
        if (chosen < 0 || chosen > 999) return null;
        counterpart = Math.max(0, Math.min(998, counterpart));
        if (chosen !== 0) counterpart = Math.min(counterpart, chosen - 1);
    } else {
        if (chosen < 0 || chosen > 998) return null;
        counterpart = Math.max(0, Math.min(999, counterpart));
        if (counterpart !== 0) counterpart = Math.max(counterpart, chosen + 1);
    }
    set(desired[other], policies[other], counterpart);
    return finish(policies, names, primary, desired);
}

function kerberos(
    model: SecurityModel | null | undefined,
    policy: SecurityPolicy,
    draft: SecurityDraft
): DependencyPlan | null {
    const names = ['max_ticket_age', 'max_service_age', 'max_renew_age'];
    const policies = group(model, BASE + 'account-kerberos', 'account.kerberos', names);
    if (!policies) return null;
    const primary = names.find(function (name) {
        return policies[name] === policy;
    });
    if (!primary) return null;
    const desired = begin(policies, names, primary, draft);
    if (!draft.defined) {
        names.forEach(function (name) {
            if (name !== primary) unset(desired[name]);
        });
        return finish(policies, names, primary, desired);
    }
    const chosen = valueOf(draft);
    if (!Number.isSafeInteger(chosen)) return null;
    let ticket = number(desired.max_ticket_age, policies.max_ticket_age);
    let service = number(desired.max_service_age, policies.max_service_age);
    let renew = number(desired.max_renew_age, policies.max_renew_age);
    // Unlimited user tickets require unlimited service and renewal values.
    if (primary === 'max_ticket_age' && ticket === 0) {
        service = 0;
        renew = 0;
    } else {
        if (ticket === 0 && (service > 0 || renew > 0)) {
            if (primary === 'max_service_age' && service === 0) renew = 0;
            else ticket = Math.max(initialOf(policies.max_ticket_age) as number, Math.ceil(service / 60));
        }
        if (service > ticket * 60) {
            if (primary === 'max_ticket_age') service = ticket * 60;
            else ticket = Math.ceil(service / 60);
        }
    }
    if (
        ticket < 0 ||
        service < 0 ||
        service > 99999 ||
        ticket > 99999 ||
        (service > 0 && service < 10) ||
        (ticket === 0 && (service !== 0 || renew !== 0)) ||
        renew < 0 ||
        renew > 99999
    )
        return null;
    names.forEach(function (name) {
        const next = name === 'max_ticket_age' ? ticket : name === 'max_service_age' ? service : renew;
        if (name !== primary) set(desired[name], policies[name], next);
    });
    return finish(policies, names, primary, desired);
}

function lockout(
    model: SecurityModel | null | undefined,
    policy: SecurityPolicy,
    draft: SecurityDraft
): DependencyPlan | null {
    const names = ['lockout_bad_count', 'reset_lockout_count', 'lockout_duration', 'allow_administrator_lockout'];
    const policies = group(model, BASE + 'account-lockout', 'account.lockout', names);
    if (!policies) return null;
    const primary = names.find(function (name) {
        return policies[name] === policy;
    });
    if (!primary) return null;
    const desired = begin(policies, names, primary, draft);
    let threshold = number(desired.lockout_bad_count, policies.lockout_bad_count);
    if (primary === 'lockout_bad_count' && draft.defined && !Number.isSafeInteger(valueOf(draft))) return null;
    if (
        (primary === 'lockout_bad_count' && (!draft.defined || threshold === 0)) ||
        (primary !== 'lockout_bad_count' && !draft.defined)
    ) {
        // Removing any member of an active lockout group requires disabling
        // lockout explicitly. The UI must disclose this before submitting.
        if (primary !== 'lockout_bad_count' && desired.lockout_bad_count.defined && threshold > 0)
            set(desired.lockout_bad_count, policies.lockout_bad_count, 0);
        names.forEach(function (name) {
            if (name !== primary && name !== 'lockout_bad_count') unset(desired[name]);
        });
        return finish(policies, names, primary, desired);
    }
    if (
        primary !== 'lockout_bad_count' &&
        !Number.isSafeInteger(valueOf(draft)) &&
        primary !== 'allow_administrator_lockout'
    )
        return null;
    if (!desired.lockout_bad_count.defined || threshold === 0) {
        threshold = initialOf(policies.lockout_bad_count) as number;
    }
    let reset = number(desired.reset_lockout_count, policies.reset_lockout_count);
    let duration = number(desired.lockout_duration, policies.lockout_duration);
    let administrator: unknown = valueOf(desired.allow_administrator_lockout);
    if (typeof administrator !== 'boolean') {
        administrator = initialOf(policies.allow_administrator_lockout);
    }
    if (duration > 0 && duration < reset) {
        if (primary === 'lockout_duration') reset = duration;
        else duration = reset;
    }
    if (threshold < 1 || threshold > 999 || reset < 1 || reset > 99999 || duration < 0 || duration > 99999) return null;
    const planned: Record<string, unknown> = {
        lockout_bad_count: threshold,
        reset_lockout_count: reset,
        lockout_duration: duration,
        allow_administrator_lockout: administrator
    };
    names.forEach(function (name) {
        if (name !== primary) set(desired[name], policies[name], planned[name]);
    });
    return finish(policies, names, primary, desired);
}

function eventLog(
    model: SecurityModel | null | undefined,
    policy: SecurityPolicy,
    draft: SecurityDraft
): DependencyPlan | null {
    const namespace = BASE + 'event-log';
    for (let i = 0; i < 3; i += 1) {
        const stream = ['security', 'application', 'system'][i];
        const names = [stream + '_log_audit_log_retention_period', stream + '_log_retention_days'];
        const policies = group(model, namespace, 'event_log', names);
        if (!policies) continue;
        const primary = names.find(function (name) {
            return policies[name] === policy;
        });
        if (!primary) continue;
        const other = names.find(function (name) {
            return name !== primary;
        }) as string; // a group has two names: the other one always exists
        const desired = begin(policies, names, primary, draft);
        if (primary === names[0]) {
            if (draft.defined && valueOf(draft) === AGE_BASED) {
                set(desired[other], policies[other], number(desired[other], policies[other]));
            } else {
                unset(desired[other]);
            }
        } else if (draft.defined) {
            set(desired[other], policies[other], AGE_BASED);
        } else if (desired[other].defined && valueOf(desired[other]) === AGE_BASED) {
            set(desired[other], policies[other], AS_NEEDED);
        }
        return finish(policies, names, primary, desired);
    }
    return null;
}

function plan(
    model: SecurityModel | null | undefined,
    policy: SecurityPolicy | null | undefined,
    draft: SecurityDraft | null | undefined
): DependencyPlan | null {
    if (!policy || !draft) return null;
    return (
        password(model, policy, draft) ||
        kerberos(model, policy, draft) ||
        lockout(model, policy, draft) ||
        eventLog(model, policy, draft)
    );
}

export { plan };
