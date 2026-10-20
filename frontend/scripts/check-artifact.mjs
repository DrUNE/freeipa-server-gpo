// Fails when the committed bundle differs from a fresh build of frontend/src.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const committed = path.resolve(root, '..', 'plugin', 'ui', 'grouppolicy', 'js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gpui-artifact-'));
try {
    execFileSync('npx', ['vite', 'build', '--logLevel', 'error', '--outDir', tmp, '--emptyOutDir'], {
        cwd: root,
        stdio: 'inherit'
    });
    const list = dir =>
        fs
            .readdirSync(dir, { recursive: true, withFileTypes: true })
            .filter(e => e.isFile())
            .map(e => path.relative(dir, path.join(e.parentPath, e.name)))
            .sort();
    const a = list(committed),
        b = list(tmp);
    const problems = [];
    for (const f of new Set([...a, ...b])) {
        if (!a.includes(f)) problems.push('missing in artifact: ' + f);
        else if (!b.includes(f)) problems.push('not produced by build: ' + f);
        else if (!fs.readFileSync(path.join(committed, f)).equals(fs.readFileSync(path.join(tmp, f))))
            problems.push('differs: ' + f);
    }
    if (problems.length) {
        console.error(problems.join('\n') + '\nRun "make ui-build" and commit the result.');
        process.exit(1);
    }
    console.log('artifact is up to date (' + a.length + ' files)');
} finally {
    fs.rmSync(tmp, { recursive: true, force: true });
}
