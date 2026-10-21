import assert from 'node:assert/strict';
import { test } from 'vitest';
import * as planner from '@gpui/core/security/dependency-plan';

/*
 * Security dependency planner (core/security/dependency-plan): when one policy of
 * a related group is edited, plan(model, policy, draft) proposes consistent values for the others
 * (password ages, Kerberos ticket/service/renew lifetimes, account lockout, event log retention)
 * or returns null when no coherent proposal exists.
 *
 * Fixtures are in-memory models: catalog() builds a Map of policies from {name: [type, initial,
 * ranges, inputRanges, enum options]} with optional existing values; password(), kerberos(),
 * lockout() and eventLog() are the concrete groups. plan() wraps planner.plan and also asserts
 * the draft and the catalog are not mutated and the edited policy is not among the proposals;
 * target/byName/value pick the draft, proposed change and its value. The planner only trusts the
 * known namespace and policy shapes, so several tests mutate the definitions on purpose.
 */
const BASE = 'urn:altlinux:sdmx:policies:';
const AGE = 'overwrite_events_older_than_the_retention_period';
const AS_NEEDED = 'overwrite_events_as_needed';
const clone = value => JSON.parse(JSON.stringify(value));
const state = (kind, value) => ({ state: 'set', value: { kind, value } });

// Builds a model with one `value` element per policy; policies named in `existing` are defined with that value.
function catalog(namespace, prefix, definitions, existing = {}) {
    const policies = new Map();
    for (const [name, [kind, initial, ranges = [], inputRanges = [], options = []]] of Object.entries(definitions)) {
        const id = prefix + '.' + name;
        const policy = {
            namespace,
            policyId: id,
            definition: {
                display_name: name,
                elements: [
                    {
                        id: 'value',
                        value_type: kind,
                        required: true,
                        ranges: ranges.map(([min, max]) => ({ min, max })),
                        input_ranges: inputRanges.map(([min, max]) => ({ min, max })),
                        options: options.map(id => ({ id })),
                        initial: { kind, value: initial }
                    }
                ]
            },
            state: Object.prototype.hasOwnProperty.call(existing, name)
                ? { state: 'defined', elements: { value: state(kind, existing[name]) } }
                : { state: 'undefined' }
        };
        policies.set(namespace + '\u0000' + id, policy);
    }
    return { policies };
}

// Returns the policy and a draft for it (initial value unless one is given).
function target(model, name, defined, value) {
    const policy = [...model.policies.values()].find(item => item.policyId.endsWith('.' + name));
    const kind = policy.definition.elements[0].value_type;
    const initial = policy.definition.elements[0].initial.value;
    return {
        policy,
        draft: {
            defined,
            elements: { value: state(kind, value === undefined ? initial : value) }
        }
    };
}

// Runs the planner and checks its purity contract (no mutation, no self-proposal).
function plan(model, name, defined, value) {
    const { policy, draft } = target(model, name, defined, value);
    const beforeDraft = clone(draft);
    const beforeStates = clone([...model.policies.values()].map(item => item.state));
    const result = planner.plan(model, policy, draft);
    assert.deepEqual(draft, beforeDraft, 'the edited policy draft must not be changed');
    assert.deepEqual(
        [...model.policies.values()].map(item => item.state),
        beforeStates,
        'the catalog snapshot must not be changed'
    );
    assert.ok(
        !result || result.changes.every(change => change.policy !== policy),
        'the primary policy must not appear among proposals'
    );
    return result;
}

function byName(result, name) {
    return result && result.changes.find(change => change.policy.policyId.endsWith('.' + name));
}

function value(change) {
    return change && change.draft.elements.value.value.value;
}

// Password ages: 0..999 maximum, 0..998 minimum; the minimum must stay below the maximum.
function password(existing = {}) {
    return catalog(
        BASE + 'account-password',
        'account.password',
        {
            maximum_password_age: ['integer', 42, [[0, 999]]],
            minimum_password_age: ['integer', 30, [[0, 998]]]
        },
        existing
    );
}

// Enabling either age proposes the other with its default and defined = true.
test('password ages are proposed together from either first policy', () => {
    let result = plan(password(), 'maximum_password_age', true, 42);
    assert.equal(value(byName(result, 'minimum_password_age')), 30);
    assert.equal(byName(result, 'minimum_password_age').draft.defined, true);
    result = plan(password(), 'minimum_password_age', true, 30);
    assert.equal(value(byName(result, 'maximum_password_age')), 42);
});

// Proposals are clamped to both range boundaries; no valid companion value gives null instead of an out-of-range proposal.
test('password-age proposals obey zero and both range boundaries', () => {
    assert.equal(value(byName(plan(password(), 'maximum_password_age', true, 0), 'minimum_password_age')), 30);
    assert.equal(value(byName(plan(password(), 'maximum_password_age', true, 1), 'minimum_password_age')), 0);
    assert.equal(value(byName(plan(password(), 'minimum_password_age', true, 998), 'maximum_password_age')), 999);
    assert.equal(plan(password({ minimum_password_age: 30 }), 'maximum_password_age', true, 0), null);
});

// On a conflict the existing companion is adjusted (max-1, min+1) and the value the user typed is never changed; undefining proposes undefining the companion.
test('password-age conflict repairs the companion, never the chosen value', () => {
    assert.equal(
        value(
            byName(
                plan(password({ minimum_password_age: 40 }), 'maximum_password_age', true, 10),
                'minimum_password_age'
            )
        ),
        9
    );
    assert.equal(
        value(
            byName(
                plan(password({ maximum_password_age: 10 }), 'minimum_password_age', true, 20),
                'maximum_password_age'
            )
        ),
        21
    );
    assert.equal(plan(password({ maximum_password_age: 0 }), 'minimum_password_age', true, 998), null);
    assert.equal(
        byName(plan(password({ minimum_password_age: 30 }), 'maximum_password_age', false), 'minimum_password_age')
            .draft.defined,
        false
    );
});

// Kerberos: ticket age, service age (0 or 10..99999) and renew age, with the service lifetime derived from the ticket age at a fixed 60x ratio.
function kerberos(existing = {}) {
    return catalog(
        BASE + 'account-kerberos',
        'account.kerberos',
        {
            max_ticket_age: ['integer', 7, [[0, 99999]]],
            max_service_age: [
                'integer',
                600,
                [
                    [0, 0],
                    [10, 99999]
                ]
            ],
            max_renew_age: ['integer', 7, [[0, 99999]]]
        },
        existing
    );
}

// Starting from any one of the three policies yields a coherent proposal for the other two.
test('Kerberos proposes a coherent triple from every starting policy', () => {
    let result = plan(kerberos(), 'max_ticket_age', true, 7);
    assert.equal(value(byName(result, 'max_service_age')), 420);
    assert.equal(value(byName(result, 'max_renew_age')), 7);
    result = plan(kerberos(), 'max_service_age', true, 600);
    assert.equal(value(byName(result, 'max_ticket_age')), 10);
    assert.equal(value(byName(result, 'max_renew_age')), 7);
    result = plan(kerberos(), 'max_renew_age', true, 7);
    assert.equal(value(byName(result, 'max_ticket_age')), 10);
    assert.equal(value(byName(result, 'max_service_age')), 600);
});

// The edited value stays fixed, derived values respect the limits, zero means the all-zero triple, and undefining proposes undefining the others.
test('Kerberos preserves the edited value, handles limits, and proposes the zero triple', () => {
    let result = plan(
        kerberos({ max_ticket_age: 7, max_service_age: 600, max_renew_age: 7 }),
        'max_ticket_age',
        true,
        1
    );
    assert.equal(value(byName(result, 'max_service_age')), 60);
    result = plan(
        kerberos({ max_ticket_age: 7, max_service_age: 420, max_renew_age: 7 }),
        'max_service_age',
        true,
        99999
    );
    assert.equal(value(byName(result, 'max_ticket_age')), 1667);
    result = plan(kerberos(), 'max_ticket_age', true, 0);
    assert.equal(value(byName(result, 'max_service_age')), 0);
    assert.equal(value(byName(result, 'max_renew_age')), 0);
    result = plan(kerberos(), 'max_service_age', true, 0);
    assert.equal(value(byName(result, 'max_ticket_age')), 7);
    assert.equal(value(byName(result, 'max_renew_age')), 7);
    result = plan(kerberos({ max_ticket_age: 0, max_service_age: 0, max_renew_age: 0 }), 'max_service_age', true, 0);
    assert.equal(result, null);
    result = plan(kerberos({ max_ticket_age: 0, max_service_age: 0, max_renew_age: 0 }), 'max_renew_age', true, 7);
    assert.equal(value(byName(result, 'max_ticket_age')), 7);
    result = plan(kerberos({ max_ticket_age: 10, max_service_age: 600, max_renew_age: 7 }), 'max_renew_age', false);
    assert.equal(result.changes.length, 2);
    assert.ok(result.changes.every(change => !change.draft.defined));
});

// The service lifetime input domain is zero or 10..99999; values outside it (and outside the other ranges) give no proposal.
test('Kerberos service lifetime permits zero or 10–99999 without extending the catalog bounds', () => {
    const minimum = plan(kerberos(), 'max_service_age', true, 10);
    assert.equal(value(byName(minimum, 'max_ticket_age')), 7);
    assert.equal(value(byName(minimum, 'max_renew_age')), 7);
    for (const invalid of [-1, 1, 9, 100000]) {
        assert.equal(plan(kerberos(), 'max_service_age', true, invalid), null);
    }
    for (const name of ['max_ticket_age', 'max_renew_age']) {
        for (const invalid of [-1, 100000]) {
            assert.equal(plan(kerberos(), name, true, invalid), null);
        }
    }
});

// If the catalog's input domain differs from the one the planner knows, automatic proposals are switched off rather than guessing.
test('a changed Kerberos service input domain disables automatic proposals', () => {
    const model = kerberos();
    model.policies.get(
        BASE + 'account-kerberos\u0000account.kerberos.max_service_age'
    ).definition.elements[0].input_ranges = [{ min: 10, max: 99999 }];
    assert.equal(plan(model, 'max_ticket_age', true, 0), null);
    assert.equal(plan(model, 'max_service_age', true, 600), null);
});

// Lockout: bad count, reset counter, duration and the allow-administrator flag.
function lockout(existing = {}) {
    return catalog(
        BASE + 'account-lockout',
        'account.lockout',
        {
            lockout_bad_count: ['integer', 5, [[0, 999]]],
            reset_lockout_count: ['integer', 10, [[1, 99999]]],
            lockout_duration: ['integer', 10, [[0, 99999]]],
            allow_administrator_lockout: ['boolean', false]
        },
        existing
    );
}

// Activation proposes all three companions, including a defined boolean false.
test('lockout activation proposes all three companions, including defined false', () => {
    let result = plan(lockout(), 'lockout_bad_count', true, 5);
    assert.equal(result.changes.length, 3);
    assert.equal(value(byName(result, 'reset_lockout_count')), 10);
    assert.equal(value(byName(result, 'lockout_duration')), 10);
    assert.equal(value(byName(result, 'allow_administrator_lockout')), false);
    result = plan(lockout(), 'reset_lockout_count', true, 10);
    assert.equal(result.changes.length, 3);
    assert.equal(value(byName(result, 'lockout_bad_count')), 5);
});

// The edited duration/reset value is kept; zero duration means indefinite and needs no proposal.
test('lockout durations preserve the edited value and zero means indefinite', () => {
    assert.equal(
        value(
            byName(
                plan(
                    lockout({
                        lockout_bad_count: 5,
                        reset_lockout_count: 10,
                        lockout_duration: 10,
                        allow_administrator_lockout: false
                    }),
                    'reset_lockout_count',
                    true,
                    20
                ),
                'lockout_duration'
            )
        ),
        20
    );
    assert.equal(
        value(
            byName(
                plan(
                    lockout({
                        lockout_bad_count: 5,
                        reset_lockout_count: 10,
                        lockout_duration: 10,
                        allow_administrator_lockout: false
                    }),
                    'lockout_duration',
                    true,
                    1
                ),
                'reset_lockout_count'
            )
        ),
        1
    );
    assert.equal(
        plan(
            lockout({
                lockout_bad_count: 5,
                reset_lockout_count: 10,
                lockout_duration: 0,
                allow_administrator_lockout: false
            }),
            'lockout_duration',
            true,
            0
        ),
        null
    );
});

// A zero bad count clears the companions; clearing a companion disables lockout; nothing to do when it is already off.
test('disabling lockout clears companions; clearing one companion proposes disabling lockout', () => {
    const active = {
        lockout_bad_count: 5,
        reset_lockout_count: 10,
        lockout_duration: 10,
        allow_administrator_lockout: false
    };
    let result = plan(lockout(active), 'lockout_bad_count', true, 0);
    assert.equal(result.changes.length, 3);
    assert.ok(result.changes.every(change => !change.draft.defined));
    result = plan(lockout(active), 'reset_lockout_count', false);
    assert.equal(value(byName(result, 'lockout_bad_count')), 0);
    assert.equal(byName(result, 'lockout_duration').draft.defined, false);
    assert.equal(byName(result, 'allow_administrator_lockout').draft.defined, false);
    assert.equal(plan(lockout(), 'lockout_bad_count', true, 0), null);
});

// Event log: retention mode enum plus a retention days policy for one stream.
function eventLog(stream, existing = {}) {
    const mode = stream + '_log_audit_log_retention_period';
    const days = stream + '_log_retention_days';
    return catalog(
        BASE + 'event-log',
        'event_log',
        {
            [mode]: ['enum', AS_NEEDED, [], [], [AGE, AS_NEEDED, 'do_not_overwrite_events_clear_the_log_manually']],
            [days]: ['integer', 7, [[1, 365]]]
        },
        existing
    );
}

// Same behavior for all three streams: the mode and the days policy propose each other in both directions.
for (const stream of ['security', 'application', 'system']) {
    test(stream + ' log retention proposes the other policy in both directions', () => {
        const mode = stream + '_log_audit_log_retention_period';
        const days = stream + '_log_retention_days';
        assert.equal(value(byName(plan(eventLog(stream), mode, true, AGE), days)), 7);
        assert.equal(value(byName(plan(eventLog(stream), days, true, 12), mode)), AGE);
        assert.equal(plan(eventLog(stream), mode, true, AS_NEEDED), null);
        assert.equal(
            byName(plan(eventLog(stream, { [mode]: AGE, [days]: 7 }), mode, true, AS_NEEDED), days).draft.defined,
            false
        );
        assert.equal(value(byName(plan(eventLog(stream, { [mode]: AGE, [days]: 7 }), days, false), mode)), AS_NEEDED);
    });
}

// Only the trusted namespace counts: a copy of the policy ids in another namespace must not be matched.
test('dependency planning never matches an untrusted namespace with a copied policy ID', () => {
    const model = catalog('urn:other:password', 'account.password', {
        maximum_password_age: ['integer', 42, [[0, 999]]],
        minimum_password_age: ['integer', 30, [[0, 998]]]
    });
    assert.equal(plan(model, 'maximum_password_age', true, 42), null);
});

// Any drift of the definition (type, range, input domain, requiredness, enum options) disables the proposals that were written for the old definition.
test('changed type, range, input domain, requiredness, or enum options disable stale proposals', () => {
    let model = password();
    model.policies.get(
        BASE + 'account-password\u0000account.password.minimum_password_age'
    ).definition.elements[0].value_type = 'string';
    assert.equal(plan(model, 'maximum_password_age', true, 42), null);
    model = password();
    model.policies.get(
        BASE + 'account-password\u0000account.password.minimum_password_age'
    ).definition.elements[0].ranges[0].max = 999;
    assert.equal(plan(model, 'maximum_password_age', true, 42), null);
    model = kerberos();
    model.policies.get(
        BASE + 'account-kerberos\u0000account.kerberos.max_service_age'
    ).definition.elements[0].input_ranges = [{ min: 0, max: 99999 }];
    assert.equal(plan(model, 'max_ticket_age', true, 7), null);
    model = lockout();
    model.policies.get(BASE + 'account-lockout\u0000account.lockout.lockout_duration').definition.elements[0].required =
        false;
    assert.equal(plan(model, 'lockout_bad_count', true, 5), null);
    model = eventLog('security');
    model.policies.get(
        BASE + 'event-log\u0000event_log.security_log_audit_log_retention_period'
    ).definition.elements[0].options = [{ id: AS_NEEDED }];
    assert.equal(plan(model, 'security_log_retention_days', true, 7), null);
});
