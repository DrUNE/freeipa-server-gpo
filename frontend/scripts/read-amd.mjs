// Reads an ES module from frontend/src and returns it in the classic AMD shape
// `define([deps], function (deps) { ...; return {exports}; })`, so unit tests can
// keep injecting mocked dependencies through a stubbed `define`.
// Handles only the import/export forms used in frontend/src (namespace and default
// imports, side-effect imports, one `export { ... }` list). Statements may span lines,
// as Prettier wraps long ones.
import fs from 'node:fs';

const IMPORT = /^import\s+(?:\*\s+as\s+)?(\w+)\s+from\s+'([^']+)';?[ \t]*$/gm;
const SIDE_EFFECT_IMPORT = /^import\s+'([^']+)';?[ \t]*$/gm;
const EXPORT_LIST = /^export\s*\{([\s\S]*?)\};?[ \t]*$/m;

function readAmd(filename) {
    let body = fs.readFileSync(filename, 'utf8');
    const deps = [];
    const params = [];

    body = body.replace(IMPORT, (_, local, source) => {
        params.push(local);
        deps.push(source);
        return '';
    });
    body = body.replace(SIDE_EFFECT_IMPORT, (_, source) => {
        deps.push(source);
        params.push('__side' + params.length);
        return '';
    });
    const exported = EXPORT_LIST.exec(body);
    if (!exported) throw new Error('no export list in ' + filename);
    body = body.replace(EXPORT_LIST, '');

    const leftover = /^(import|export)\b.*$/m.exec(body);
    if (leftover) throw new Error('unsupported module syntax in ' + filename + ': ' + leftover[0]);

    const members = exported[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
            const [local, name] = s.split(/\s+as\s+/);
            return (name || local) + ': ' + local;
        });
    return (
        'define(' +
        JSON.stringify(deps) +
        ', function (' +
        params.join(', ') +
        ') {\n' +
        body +
        '\nreturn Object.freeze({ ' +
        members.join(', ') +
        ' });\n});\n'
    );
}

export { readAmd };
