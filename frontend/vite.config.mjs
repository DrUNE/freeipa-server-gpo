import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import * as backend from './dev/backend.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(root, '..', 'plugin', 'ui', 'grouppolicy');
const pluginUrl = '/ipa/ui/js/plugins/chain/';

const mime = { '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.js': 'application/javascript' };

// Dev stand: mock FreeIPA JSON-RPC and the plugin's static files (css, img),
// mirroring the URL layout of a real server.
function devStand() {
    return {
        name: 'gpui-dev-stand',
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const url = new URL(request.url, 'http://localhost');
                const send = (status, body, type) => {
                    response.statusCode = status;
                    response.setHeader('Content-Type', type || 'application/json');
                    response.end(body);
                };
                if (url.pathname === '/ipa/ui' || url.pathname === '/ipa/ui/') {
                    request.url = '/index.html' + url.search;
                    return next();
                }
                if (request.method === 'POST' && url.pathname === '/ipa/session/json') {
                    const chunks = [];
                    request.on('data', chunk => chunks.push(chunk));
                    request.on('end', () => {
                        let body;
                        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
                        catch (error) { return send(400, JSON.stringify({ error: { message: 'Invalid JSON: ' + error.message } })); }
                        const reply = backend.dispatch(body);
                        console.log(`[rpc ${reply.error ? '✗' : '←'}] ${body.method}${reply.error ? ': ' + reply.error.message : ''}`);
                        send(200, JSON.stringify(reply));
                    });
                    return;
                }
                if (request.method === 'POST' && url.pathname === '/__dev/reset') {
                    backend.reset();
                    return send(200, '{"ok":true}');
                }
                if (url.pathname.startsWith(pluginUrl)) {
                    const file = path.normalize(path.join(pluginRoot, decodeURIComponent(url.pathname.slice(pluginUrl.length))));
                    if (!file.startsWith(pluginRoot + path.sep) || !fs.existsSync(file)) return send(404, 'Not found', 'text/plain');
                    return send(200, fs.readFileSync(file), mime[path.extname(file)] || 'application/octet-stream');
                }
                next();
            });
        }
    };
}

export default defineConfig(({ command }) => command === 'serve' ? {
    root: path.join(root, 'dev'),
    plugins: [devStand()],
    resolve: {
        alias: {
            '@gpui': path.join(root, 'src'),
            'freeipa/ipa': path.join(root, 'dev', 'shims', 'ipa.js'),
            'freeipa/rpc': path.join(root, 'dev', 'shims', 'rpc.js')
        }
    },
    server: { host: '127.0.0.1', port: 8765, fs: { allow: [root] } }
} : {
    // One UMD bundle, committed to plugin/ui/grouppolicy/js/app.js. Under
    // FreeIPA's RequireJS it registers as an AMD module that depends on the
    // Web UI's own freeipa/* modules.
    publicDir: false,
    build: {
        outDir: path.join(pluginRoot, 'js'),
        emptyOutDir: true,
        minify: false,
        reportCompressedSize: false,
        lib: {
            entry: path.join(root, 'src', 'app.js'),
            name: 'gpui',
            formats: ['umd'],
            fileName: () => 'app.js'
        },
        rollupOptions: {
            external: [/^freeipa\//],
            output: { globals: { 'freeipa/ipa': 'IPA', 'freeipa/rpc': 'IPA_rpc' } }
        }
    }
});
