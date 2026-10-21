// Reads an ES module from frontend/src and returns it in the classic AMD shape
// `define([deps], function (deps) { ...; return {exports}; })`, so unit tests can
// keep injecting mocked dependencies through a stubbed `define`.
// Handles only the import/export forms used in frontend/src: namespace imports (`* as x`),
// default imports (`x from`, including `*.module.css`, whose test-root module returns the class map
// itself), named imports (`{ a, b as c }`), side-effect imports, and one `export { ... }` list.
// Declarations may be exported inline (`export function f`, `export const x`) or through one trailing
// `export { ... }` list. Statements may span lines, as Prettier wraps long ones.
import fs from 'node:fs';
import path from 'node:path';

const NAMESPACE_IMPORT = /^import\s+\*\s+as\s+(\w+)\s+from\s+'([^']+)';?[ \t]*$/gm;
const DEFAULT_IMPORT = /^import\s+(\w+)\s+from\s+'([^']+)';?[ \t]*$/gm;
const NAMED_IMPORT = /^import\s*\{([^}]*)\}\s*from\s*'([^']+)';?[ \t]*$/gm;
const SIDE_EFFECT_IMPORT = /^import\s+'([^']+)';?[ \t]*$/gm;
const INLINE_EXPORT = /^export\s+(?:async\s+)?(?:function\s*\*?|const|let|var|class)\s+(\w+)/gm;
const EXPORT_LIST = /^export\s*\{([\s\S]*?)\};?[ \t]*$/m;

// `@gpui/x` is `src/x`. In the AMD tree an id is resolved against the importing module, so the alias becomes the
// relative id the module would have had (it works under any baseUrl, e.g. the `js/` prefix some fixtures use).
const srcRoot = path.resolve(import.meta.dirname, '..', 'src');
const amdId = (source, filename) => {
    if (!source.startsWith('@gpui/')) return source;
    const relative = path.relative(path.dirname(filename), path.join(srcRoot, source.slice('@gpui/'.length)));
    return relative.startsWith('.') ? relative : './' + relative;
};

function readAmd(filename) {
    let body = fs.readFileSync(filename, 'utf8');
    const deps = [];
    const params = [];

    const prelude = [];
    body = body.replace(NAMESPACE_IMPORT, (_, local, source) => {
        params.push(local);
        deps.push(amdId(source, filename));
        return '';
    });
    body = body.replace(DEFAULT_IMPORT, (_, local, source) => {
        // An AMD module has no default export: modules that `export default` are not supported, the
        // only default imports are CSS modules, which return the map itself.
        params.push(local);
        deps.push(amdId(source, filename));
        return '';
    });
    body = body.replace(NAMED_IMPORT, (_, list, source) => {
        const param = '__named' + params.length;
        params.push(param);
        deps.push(amdId(source, filename));
        for (const item of list
            .split(',')
            .map(x => x.trim())
            .filter(Boolean)) {
            const [name, local] = item.split(/\s+as\s+/);
            prelude.push(`var ${local || name} = ${param}.${name};`);
        }
        return '';
    });
    body = body.replace(SIDE_EFFECT_IMPORT, (_, source) => {
        deps.push(amdId(source, filename));
        params.push('__side' + params.length);
        return '';
    });
    const names = [];
    body = body.replace(INLINE_EXPORT, (match, name) => {
        names.push(name);
        return match.replace(/^export\s+/, '');
    });
    const exported = EXPORT_LIST.exec(body);
    if (exported) body = body.replace(EXPORT_LIST, '');
    if (!exported && !names.length) throw new Error('no exports in ' + filename);

    const leftover = /^(import|export)\b.*$/m.exec(body);
    if (leftover) throw new Error('unsupported module syntax in ' + filename + ': ' + leftover[0]);

    const members = (exported ? exported[1].split(',') : [])
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
            const [local, name] = s.split(/\s+as\s+/);
            return (name || local) + ': ' + local;
        })
        .concat(names.map(name => name + ': ' + name));
    return (
        'define(' +
        JSON.stringify(deps) +
        ', function (' +
        params.join(', ') +
        ') {\n' +
        prelude.join('\n') +
        '\n' +
        body +
        '\nreturn Object.freeze({ ' +
        members.join(', ') +
        ' });\n});\n'
    );
}

export { readAmd };
