// Builds the fixture tree used by the browser tests: every ES module in src/
// as its own classic AMD module (js/), next to the plugin's css/ and img/.
// Not shipped; the shipped artifact is the single bundle from `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAmd } from './read-amd.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const out = path.join(root, '.test-root');
const plugin = path.resolve(root, '..', 'plugin', 'ui', 'grouppolicy');

fs.rmSync(out, { recursive: true, force: true });
for (const entry of fs.readdirSync(src, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const file = path.join(entry.parentPath, entry.name);
    const dest = path.join(out, 'js', path.relative(src, file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, readAmd(file));
}
for (const name of ['css', 'img', 'chain.js', 'gpo.js']) fs.symlinkSync(path.join(plugin, name), path.join(out, name));
console.log('test root: ' + out);
