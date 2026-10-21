// The reference answers of the `gpo_editor_*` methods (tests/contracts/gpo_editor/*.json) and the comparison of an
// answer with them. The same files and the same rules are used by tests/test_gpo_editor_contract.py, which checks the
// real server commands; here the dev stand's mock server and util/API.js are checked.
//
// Shape means: the same keys at every level, the same JSON type of every value, the first element of non-empty
// lists compared; `null` in a reference answer means "any value" (the field is optional or its content is not part
// of the contract), and an empty list on either side compares nothing.
import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve(import.meta.dirname, '../../../../tests/contracts/gpo_editor');

/** @returns {{ method: string, args: any[], options: any, result: any }[]} */
export function contracts() {
    return fs
        .readdirSync(directory)
        .filter(name => name.endsWith('.json'))
        .sort()
        .map(name => ({
            name: name.replace(/\.json$/, ''),
            ...JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'))
        }));
}

function jsonType(value) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

/** Where `actual` does not have the shape of `reference`; an empty list means it does. */
export function differences(actual, reference, where = '$') {
    if (reference === null) return [];
    if (jsonType(actual) !== jsonType(reference))
        return [`${where}: ${jsonType(actual)} instead of ${jsonType(reference)}`];
    if (Array.isArray(reference)) {
        return reference.length && actual.length ? differences(actual[0], reference[0], `${where}[0]`) : [];
    }
    if (typeof reference !== 'object') return [];
    const found = [];
    for (const key of [...new Set([...Object.keys(reference), ...Object.keys(actual)])].sort()) {
        if (!(key in actual)) found.push(`${where}.${key}: missing`);
        else if (!(key in reference)) found.push(`${where}.${key}: not in the contract`);
        else found.push(...differences(actual[key], reference[key], `${where}.${key}`));
    }
    return found;
}
