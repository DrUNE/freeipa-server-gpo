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
// Verbatim files of the plugin directory (chain.js, gpo.js, img/); the global sheets are src/styles.
const publicDir = path.join(root, 'public');

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
    // A TypeScript source becomes the same AMD module under its `.js` name.
    const dest = path.join(out, 'js', path.relative(src, file).replace(/\.ts$/, '.js'));
    // Stories are ES-module-only files for Storybook, not part of the editor.
    if (entry.name.endsWith('.stories.js')) continue;
    let code;
    if (entry.name.endsWith('.module.css')) code = await cssModule(file);
    else if (entry.name.endsWith('.js') || (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')))
        code = await readAmd(file);
    else continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(entry.name.endsWith('.css') ? dest + '.js' : dest, code);
}
// gpo.js links js/app.css; in the test tree the CSS Modules are injected by their modules, so it holds the global sheets.
const styles = path.join(src, 'styles');
const globalSheets = ['main', 'other']
    .map(name => fs.readFileSync(path.join(styles, name + '.css'), 'utf8'))
    .join('\n')
    .replace(/@import url\("([\w-]+\.css)"\);/g, (_, name) => fs.readFileSync(path.join(styles, name), 'utf8'));
fs.mkdirSync(path.join(out, 'js'), { recursive: true });
fs.writeFileSync(path.join(out, 'js', 'app.css'), globalSheets);
// The tests link /css/main.css and /css/other.css like the page did before the styles joined the bundle;
// `url(/img/...)` in them is served from /img.
fs.symlinkSync(path.join(src, 'styles'), path.join(out, 'css'));
for (const name of ['img', 'chain.js', 'gpo.js']) fs.symlinkSync(path.join(publicDir, name), path.join(out, name));
console.log('test root: ' + out);
