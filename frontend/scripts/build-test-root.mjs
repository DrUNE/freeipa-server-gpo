// Builds the fixture tree used by the browser tests: every ES module in src/
// as its own classic AMD module (js/), next to the plugin's css/ and img/.
// Not shipped; the shipped artifact is the single bundle from `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import { readAmd } from './read-amd.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const out = path.join(root, '.test-root');
const plugin = path.resolve(root, '..', 'plugin', 'ui', 'grouppolicy');

fs.rmSync(out, { recursive: true, force: true });
// A CSS module becomes an AMD module `X.module.css.js` (RequireJS appends `.js` to ids): it injects the scoped
// stylesheet (at the front of <head>, like js/app.css in production) and returns the class map, like Vite's
// `import styles from './X.module.css'`.
async function cssModule(file) {
    let classes = {};
    const result = await postcss([
        postcssModules({
            getJSON: (_, json) => (classes = json),
            generateScopedName: '[name]__[local]___[hash:base64:5]'
        })
    ]).process(fs.readFileSync(file, 'utf8'), { from: file });
    // url(...) into plugin/ui/grouppolicy/img: the test server serves that directory at /img.
    result.css = result.css.replace(/url\((?:\.\.\/)+plugin\/ui\/grouppolicy\/img\//g, 'url(/img/');
    return `define([], function () {
    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(result.css)};
    document.head.insertBefore(style, document.head.firstChild);
    return ${JSON.stringify(classes)};
});
`;
}

for (const entry of fs.readdirSync(src, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const dest = path.join(out, 'js', path.relative(src, file));
    // Stories are ES-module-only files for Storybook, not part of the editor.
    if (entry.name.endsWith('.stories.js')) continue;
    let code;
    if (entry.name.endsWith('.module.css')) code = await cssModule(file);
    else if (entry.name.endsWith('.js')) code = readAmd(file);
    else continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(entry.name.endsWith('.css') ? dest + '.js' : dest, code);
}
for (const name of ['css', 'img', 'chain.js', 'gpo.js']) fs.symlinkSync(path.join(plugin, name), path.join(out, name));
console.log('test root: ' + out);
