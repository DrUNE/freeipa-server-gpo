'use strict';
// Reads an ES module from frontend/src and returns it in the classic AMD shape
// `define([deps], function (deps) { ...; return {exports}; })`, so unit tests can
// keep injecting mocked dependencies through a stubbed `define`.
// Handles only the import/export forms used in frontend/src.
const fs = require('node:fs');

function readAmd(filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const deps = [];
    const params = [];
    let exported = null;
    const body = source.split('\n').filter(line => {
        let m;
        if ((m = /^import (?:\* as )?(\w+) from '([^']+)';$/.exec(line))) { params.push(m[1]); deps.push(m[2]); return false; }
        if ((m = /^import '([^']+)';$/.exec(line))) { deps.push(m[1]); params.push('__side' + params.length); return false; }
        if ((m = /^export \{(.*)\};$/.exec(line))) { exported = m[1]; return false; }
        if (/^(import|export)\b/.test(line)) throw new Error('unsupported module syntax in ' + filename + ': ' + line);
        return true;
    }).join('\n');
    if (exported === null) throw new Error('no export list in ' + filename);
    const members = exported.split(',').map(s => s.trim()).filter(Boolean).map(s => {
        const [local, name] = s.split(/\s+as\s+/);
        return (name || local) + ': ' + local;
    });
    return 'define(' + JSON.stringify(deps) + ', function (' + params.join(', ') + ') {\n'
        + body + '\nreturn Object.freeze({ ' + members.join(', ') + ' });\n});\n';
}

module.exports = { readAmd };
