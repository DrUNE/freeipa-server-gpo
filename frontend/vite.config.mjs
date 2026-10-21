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

// The development build has no source map for styles (Vite does not make one for the extracted sheet), so each source file
// of the sheet is marked with a comment instead: `/* src/styles/shell.css */`. Works on the merged sheet: the nodes still
// know their file, also after @import has been inlined.
function markStyleSources() {
    return {
        postcssPlugin: 'gpui-mark-style-sources',
        Once(root) {
            let current = null;
            for (const node of [...root.nodes]) {
                const file = node.source && node.source.input && node.source.input.file;
                if (!file || file === current || node.type === 'comment') continue;
                current = file;
                node.parent.insertBefore(node, {
                    type: 'comment',
                    text: path.relative(import.meta.dirname, file),
                    raws: { left: ' ', right: ' ' }
                });
            }
        }
    };
}
markStyleSources.postcss = true;

export default defineConfig(({ command, mode }) =>
    command === 'serve'
        ? {
              root: path.join(root, 'dev'),
              publicDir,
              // src/lib/dom.js marks every created element with data-source="src/File.js:line".
              define: { __GPUI_DEV__: true },
              // Styles get source maps too (`File.module.css:line` in the Styles pane); scripts are served as written.
              css: { devSourcemap: true },
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
        : mode === 'esm'
          ? {
                // The editor as an ES module for freeipa-webui (`npm run build:esm`, not committed): the same code as js/app.js
                // without the UMD wrapper. `freeipa/ipa` and `freeipa/rpc` stay bare imports; the host maps them (an import map
                // or a bundler alias) to its own adapter over the FreeIPA session and RPC client.
                publicDir: false,
                base: './',
                define: { __GPUI_DEV__: false },
                resolve: { alias: { '@gpui': path.join(root, 'src') } },
                build: {
                    outDir: path.join(root, 'dist-esm'),
                    emptyOutDir: true,
                    assetsDir: '',
                    minify: false,
                    reportCompressedSize: false,
                    lib: {
                        cssFileName: 'gpui',
                        entry: path.join(root, 'src', 'app.js'),
                        formats: ['es'],
                        fileName: () => 'gpui.js'
                    },
                    rollupOptions: { external: [/^freeipa\//] }
                }
            }
          : {
                // The plugin directory, committed as frontend/dist (js/app.js is one UMD bundle). Under
                // FreeIPA's RequireJS it registers as an AMD module that depends on the
                // Web UI's own freeipa/* modules.
                publicDir,
                // app.css is served from <plugin>/js/ and the images from <plugin>/img/: /img/x in the CSS becomes ../img/x.
                base: './',
                // `--mode development` (npm run watch) is the dev build: source maps for scripts and styles and the
                // data-source marks of h(); the committed build (production) has neither.
                define: { __GPUI_DEV__: mode === 'development' },
                css: {
                    devSourcemap: true,
                    postcss: { plugins: mode === 'development' ? [markStyleSources()] : [] }
                },
                resolve: { alias: { '@gpui': path.join(root, 'src') } },
                build: {
                    outDir,
                    emptyOutDir: true,
                    assetsDir: '',
                    minify: false,
                    sourcemap: mode === 'development',
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
