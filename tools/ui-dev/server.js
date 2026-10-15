#!/usr/bin/env node
'use strict';

/**
 * Standalone development server for the GPUI editor.
 *
 *   npm --prefix tools/ui-dev install
 *   node tools/ui-dev/server.js [--port 8765] [--host 127.0.0.1]
 *
 * URL layout mirrors a FreeIPA server so that production-relative paths work:
 *   /ipa/ui/                              → tools/ui-dev/index.html
 *   /ipa/ui/js/plugins/chain/**           → plugin/ui/grouppolicy/**  (live, no copy)
 *   /ipa/ui/js/freeipa/{ipa,rpc}.js       → tools/ui-dev/shims/
 *   /ipa/ui/js/require.js                 → node_modules/requirejs/require.js
 *   POST /ipa/session/json                → tools/ui-dev/backend.js (fixtures)
 *   POST /__dev/reset                     → reset fixture state
 */

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const here = __dirname;
const repoRoot = path.resolve(here, '../..');
const pluginRoot = path.join(repoRoot, 'plugin/ui/grouppolicy');
const backend = require('./backend');

function argument(name, fallback) {
    const index = process.argv.indexOf('--' + name);
    return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const port = Number(argument('port', process.env.PORT || 8765));
const host = argument('host', '127.0.0.1');

function resolveRequireJs() {
    const candidates = [
        path.join(here, 'node_modules/requirejs/require.js'),
        path.join(repoRoot, 'node_modules/requirejs/require.js')
    ];
    for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
    try { return require.resolve('requirejs/require.js'); } catch (_) { return null; }
}

const requireJs = resolveRequireJs();
if (!requireJs) {
    console.error('requirejs is not installed. Run: npm --prefix tools/ui-dev install');
    process.exit(1);
}

const mime = {
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.json': 'application/json; charset=utf-8'
};

function send(response, status, body, type) {
    response.statusCode = status;
    response.setHeader('Content-Type', type || 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(body);
}

function sendFile(response, filename) {
    fs.readFile(filename, (error, data) => {
        if (error) return send(response, 404, 'Not found: ' + filename);
        send(response, 200, data, mime[path.extname(filename)] || 'application/octet-stream');
    });
}

function safeJoin(root, relative) {
    const target = path.normalize(path.join(root, relative));
    return target.startsWith(root + path.sep) || target === root ? target : null;
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        request.on('data', chunk => chunks.push(chunk));
        request.on('end', () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
            catch (error) { reject(error); }
        });
        request.on('error', reject);
    });
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://' + request.headers.host);
    const pathname = decodeURIComponent(url.pathname);

    if (request.method === 'POST' && pathname === '/ipa/session/json') {
        let body;
        try { body = await readJson(request); }
        catch (error) { return send(response, 400, JSON.stringify({ error: { message: 'Invalid JSON: ' + error.message } }), mime['.json']); }
        const reply = backend.dispatch(body);
        const marker = reply.error ? '✗' : '←';
        console.log(`[rpc ${marker}] ${body.method}${reply.error ? ': ' + reply.error.message : ''}`);
        return send(response, 200, JSON.stringify(reply), mime['.json']);
    }

    if (request.method === 'POST' && pathname === '/__dev/reset') {
        backend.reset();
        console.log('[dev] fixture state reset');
        return send(response, 200, '{"ok":true}', mime['.json']);
    }

    if (pathname === '/' || pathname === '/ipa/ui' || pathname === '/ipa/ui/' || pathname === '/ipa/ui/index.html') {
        return sendFile(response, path.join(here, 'index.html'));
    }
    if (pathname === '/ipa/ui/js/require.js') return sendFile(response, requireJs);

    const shim = pathname.match(/^\/ipa\/ui\/js\/freeipa\/([a-z_-]+)\.js$/);
    if (shim) {
        const file = path.join(here, 'shims', shim[1] + '.js');
        if (fs.existsSync(file)) return sendFile(response, file);
        return send(response, 404, 'No dev shim for freeipa/' + shim[1] + '. Add tools/ui-dev/shims/' + shim[1] + '.js');
    }

    if (pathname.startsWith('/ipa/ui/js/plugins/chain/')) {
        const file = safeJoin(pluginRoot, pathname.slice('/ipa/ui/js/plugins/chain/'.length));
        if (!file) return send(response, 403, 'Forbidden');
        return sendFile(response, file);
    }

    if (pathname.startsWith('/__dev/')) {
        const file = safeJoin(here, pathname.slice('/__dev/'.length));
        if (!file) return send(response, 403, 'Forbidden');
        return sendFile(response, file);
    }

    send(response, 404, 'Not found: ' + pathname);
});

server.listen(port, host, () => {
    console.log(`GPUI dev server: http://${host}:${port}/ipa/ui/`);
    console.log(`  plugin sources: ${pluginRoot}`);
    console.log(`  require.js:     ${requireJs}`);
    console.log('  Edit files under plugin/ui/grouppolicy/ and reload the page.');
});
