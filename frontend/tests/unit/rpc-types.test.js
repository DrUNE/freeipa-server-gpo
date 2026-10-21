import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'vitest';
import { generate } from '../../scripts/generate-rpc-types.mjs';

test('types/rpc.d.ts is generated from the reference answers and up to date', () => {
    const file = path.resolve(import.meta.dirname, '../../types/rpc.d.ts');
    // The committed file is formatted by Prettier, the generator's output is not: compare without whitespace.
    const squash = text => text.replace(/\s+/g, '');
    assert.equal(
        squash(fs.readFileSync(file, 'utf8')),
        squash(generate()),
        'run `npm run types:rpc` and commit types/rpc.d.ts'
    );
});

test('every reference answer has its type', () => {
    const contracts = path.resolve(import.meta.dirname, '../../../tests/contracts/gpo_editor');
    const methods = fs
        .readdirSync(contracts)
        .map(name => JSON.parse(fs.readFileSync(path.join(contracts, name), 'utf8')).method);
    const types = fs.readFileSync(path.resolve(import.meta.dirname, '../../types/rpc.d.ts'), 'utf8');
    for (const method of methods) assert.match(types, new RegExp('Answer of `' + method + '`'));
});
