/**
 * Development shim for the FreeIPA `freeipa/rpc` module.
 *
 * `rpc.command(spec).execute()` posts a FreeIPA-style JSON-RPC request to the
 * dev server, which answers from tools/ui-dev/backend.js.  Set
 * `window.DEV_RPC_ENDPOINT` before the app loads to point at another URL.
 */
    var sequence = 0;

    function command(spec) {
        spec = spec || {};
        var name = spec.entity ? spec.entity + '_' + spec.method : spec.method;

        return {
            execute: function() {
                var id = ++sequence;
                var body = {
                    method: name,
                    params: [spec.args || [], spec.options || {}],
                    id: id
                };
                console.debug('[rpc →]', id, name, body.params);

                fetch(window.DEV_RPC_ENDPOINT || '/ipa/session/json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(body)
                }).then(function(response) {
                    return response.json().then(function(payload) {
                        return { status: response.status, payload: payload };
                    });
                }).then(function(result) {
                    var payload = result.payload;
                    var xhr = { status: result.status, responseJSON: payload };
                    if (payload && payload.error) {
                        console.warn('[rpc ✗]', id, name, payload.error);
                        if (spec.on_error) spec.on_error(xhr, 'error', payload.error);
                        return;
                    }
                    console.debug('[rpc ←]', id, name, payload && payload.result);
                    if (spec.on_success) spec.on_success(payload, 'success', xhr);
                }).catch(function(error) {
                    console.error('[rpc !]', id, name, error);
                    if (spec.on_error) {
                        spec.on_error({ status: 0 }, 'error', {
                            name: 'NetworkError',
                            message: String(error && error.message || error)
                        });
                    }
                });
            }
        };
    }

    export default { command: command };
