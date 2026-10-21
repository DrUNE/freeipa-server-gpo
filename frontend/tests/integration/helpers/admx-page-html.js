/*
 * The HTML page of the ADMX navigation tests (the editor on a fake API), shared by the tests that need the same mock
 * application without registering the tests of admx-navigation.browser.test.js. It is the `html` template literal of that
 * file, cut out by its two markers and evaluated; the markers are asserted here, once, so a change to that file fails with
 * this message instead of in each user.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const source = fs.readFileSync(path.join(import.meta.dirname, '..', 'admx-navigation.browser.test.js'), 'utf8');
const start = source.indexOf('const html = `');
const end = source.indexOf('\nconst browserOptions', start);
assert.ok(
    start >= 0 && end > start,
    "admx-navigation.browser.test.js must keep 'const html = `' and a following 'const browserOptions' line (helpers/admx-page-html.js cuts the page out between them)"
);

export const html = vm.runInNewContext(source.slice(start, end) + '\nhtml;');
