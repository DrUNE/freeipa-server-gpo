// Puts the declarations of the ES-module build next to it (run by `npm run build:esm`):
// dist-esm/gpui.d.ts (the editor's `init`) and dist-esm/gpui-host.d.ts (the two FreeIPA modules the host has to provide).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist-esm');
for (const [from, to] of [
    ['types/gpui-esm.d.ts', 'gpui.d.ts'],
    ['scripts/templates/gpui-host.d.ts', 'gpui-host.d.ts']
]) {
    fs.copyFileSync(path.join(root, from), path.join(out, to));
    console.log('wrote ' + path.join('dist-esm', to));
}
