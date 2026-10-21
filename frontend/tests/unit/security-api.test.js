import assert from 'node:assert/strict';
import { test } from 'vitest';
import { loadModule } from './helpers/load-module.js';

/*
 * Covers how util/API.js sends Security and Advanced Audit updates and surfaces their errors.
 * util/API.js is loaded through loadModule with a fake FreeIPA `rpc` whose command() records every spec and answers
 * editor_open with an empty result, and fails everything else through spec.on_error as the real server would.
 */

// Loads API.js against the given fake rpc; the Russian navigator/language is only there to satisfy the module.
async function loadApi(rpc) {
    return loadModule(
        'util/API.js',
        {
            'freeipa/ipa': { default: { api_version: '2.0' } },
            'freeipa/rpc': { default: rpc },
            '../locales/translations': { getLanguage: () => 'ru' }
        },
        { navigator: { language: 'ru-RU', languages: ['ru-RU'] } }
    );
}

// The request must reach the server with arrays intact (not coerced to objects), must not be retried by FreeIPA, and
// a validation error must come back as an Error with category/field so the editor can render it.
test('Security RPC preserves arrays and exposes structured FreeIPA validation errors', async () => {
    const specs = [];
    const response = {
        error: {
            message: 'Security policy actions must be a list.',
            data: { error_category: 'validation', field: 'request.policies' }
        }
    };
    const api = await loadApi({
        command(spec) {
            specs.push(spec);
            return {
                execute() {
                    if (spec.method === 'editor_open') {
                        spec.on_success({ result: { result: {} } });
                    } else {
                        spec.on_error({ responseJSON: response }, 'error', {
                            message: response.error.message,
                            data: response
                        });
                    }
                }
            };
        }
    });
    await api.initialize('Test GPO');
    const request = {
        expected_semantic_revision: 'sha256:good',
        policies: [{ namespace: 'urn:test', policy_id: 'p', elements: [] }]
    };

    await assert.rejects(api.securityDefinitionsUpdate(request), error => {
        assert.equal(error.category, 'validation');
        assert.equal(error.field, 'request.policies');
        return true;
    });
    assert.equal(specs[0].retry, true);
    assert.equal(specs[1].retry, false);
    assert.deepEqual(JSON.parse(JSON.stringify(specs[1].options.request)), request);
    assert.equal(Array.isArray(specs[1].options.request.policies), true);
});

// Same contract for Advanced Audit, when FreeIPA gives no response body: retry stays off so the editor status shows
// the error instead of the generic FreeIPA retry dialog.
test('Advanced Audit RPC uses editor error rendering instead of FreeIPA retry dialog', async () => {
    const specs = [];
    const api = await loadApi({
        command(spec) {
            specs.push(spec);
            return {
                execute() {
                    if (spec.method === 'editor_open') {
                        spec.on_success({ result: { result: {} } });
                    } else {
                        spec.on_error(null, 'error', {
                            message: 'Advanced Audit operations must be lists.',
                            data: { error_category: 'validation', field: 'request.set_options' }
                        });
                    }
                }
            };
        }
    });
    await api.initialize('Test GPO');

    await assert.rejects(api.advancedAuditUpdate({ set_options: [] }), error => {
        assert.equal(error.category, 'validation');
        assert.equal(error.field, 'request.set_options');
        return true;
    });
    assert.equal(specs[1].retry, false);
});
