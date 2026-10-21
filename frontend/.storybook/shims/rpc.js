/**
 * The `freeipa/rpc` module of Storybook: stories talk to the same mock server as the dev stand (dev/backend.mjs, whose
 * answers are checked against tests/contracts/gpo_editor/*.json), in the page, without a network.
 *
 * `useScenario(name)` picks how the server behaves (`normal`, `error`, `slow`, `empty`, see dev/backend.mjs) and starts
 * from fresh fixtures; the preview calls it for every story from `parameters.rpc.scenario`.
 */
/* global setTimeout */
import * as backend from '../../dev/backend.mjs';

// `slow` is long enough to see a loading state and short enough for a test to wait for the answer.
const SLOW_MS = 400;
let scenario = 'normal';
let sequence = 0;

export function useScenario(name = 'normal') {
    if (!backend.SCENARIOS.includes(name)) throw new Error('Unknown RPC scenario: ' + name);
    scenario = name;
    backend.reset();
}

function command(spec = {}) {
    const method = spec.entity ? spec.entity + '_' + spec.method : spec.method;
    return {
        execute() {
            const body = { method, params: [spec.args || [], spec.options || {}], id: ++sequence };
            const reply = backend.dispatch(JSON.parse(JSON.stringify(body)), scenario);
            setTimeout(
                () => {
                    if (reply.error) {
                        if (spec.on_error) spec.on_error({ status: 200, responseJSON: reply }, 'error', reply.error);
                    } else if (spec.on_success) {
                        spec.on_success(reply, 'success', { status: 200 });
                    }
                },
                scenario === 'slow' ? SLOW_MS : 0
            );
        }
    };
}

export default { command };
