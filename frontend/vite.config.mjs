import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import * as backend from './dev/backend.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
// The installable plugin directory (committed build output; the RPM and the installer take it from here).
const outDir = path.join(root, 'dist');
// Verbatim files of that directory: chain.js, gpo.js and img/ (referenced from the CSS as /img/...).
const publicDir = path.join(root, 'public');

// Dev stand: mock FreeIPA JSON-RPC (the editor's own files come from Vite).
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
                        try {
                            body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
                        } catch (error) {
                            return send(400, JSON.stringify({ error: { message: 'Invalid JSON: ' + error.message } }));
                        }
                        const scenario = url.searchParams.get('scenario') || 'normal';
                        const reply = backend.dispatch(body, scenario);
                        console.log(
                            `[rpc ${reply.error ? '✗' : '←'}${scenario === 'normal' ? '' : ' ' + scenario}] ${body.method}${reply.error ? ': ' + reply.error.message : ''}`
                        );
                        setTimeout(() => send(200, JSON.stringify(reply)), scenario === 'slow' ? 1500 : 0);
                    });
                    return;
                }
                if (request.method === 'POST' && url.pathname === '/__dev/reset') {
                    backend.reset();
                    return send(200, '{"ok":true}');
                }
                next();
            });
        }
    };
}

export default defineConfig(({ command }) =>
    command === 'serve'
        ? {
              root: path.join(root, 'dev'),
              publicDir,
              plugins: [devStand()],
              resolve: {
                  alias: {
                      '@gpui': path.join(root, 'src'),
                      'freeipa/ipa': path.join(root, 'dev', 'shims', 'ipa.js'),
                      'freeipa/rpc': path.join(root, 'dev', 'shims', 'rpc.js')
                  }
              },
              server: { host: '127.0.0.1', port: 8765, fs: { allow: [root] } }
          }
        : {
              // The plugin directory, committed as frontend/dist (js/app.js is one UMD bundle). Under
              // FreeIPA's RequireJS it registers as an AMD module that depends on the
              // Web UI's own freeipa/* modules.
              publicDir,
              // app.css is served from <plugin>/js/ and the images from <plugin>/img/: /img/x in the CSS becomes ../img/x.
              base: './',
              resolve: { alias: { '@gpui': path.join(root, 'src') } },
              build: {
                  outDir,
                  emptyOutDir: true,
                  assetsDir: '',
                  minify: false,
                  reportCompressedSize: false,
                  // All styles (the components' CSS Modules, then src/styles/*.css) are emitted as js/app.css, the
                  // only stylesheet gpo.js loads.
                  lib: {
                      cssFileName: 'js/app',
                      entry: path.join(root, 'src', 'app.js'),
                      name: 'gpui',
                      formats: ['umd'],
                      fileName: () => 'js/app.js'
                  },
                  rollupOptions: {
                      external: [/^freeipa\//],
                      output: { globals: { 'freeipa/ipa': 'IPA', 'freeipa/rpc': 'IPA_rpc' } }
                  }
              }
          }
);
