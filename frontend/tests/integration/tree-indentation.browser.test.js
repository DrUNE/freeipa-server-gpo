import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'vitest';

let chromium;
try {
    chromium = (await import('playwright')).chromium;
} catch {
    /* Browser dependencies are optional in unit-only environments. */
}

/*
 * Browser check of the tree indentation CSS (src/styles/main.css + other.css).
 * Fixture: a hand-written static <ul> tree injected with page.setContent and styled by the
 * real stylesheets via addStyleTag; no server, no RequireJS, no JS from src/. Only the
 * bounding-box x of each icon is measured.
 */
const cssRoot = path.resolve(import.meta.dirname, '../../src/styles');

// Folders have an extra switcher span that leaves have not; the icons must still line up
// (folder and file siblings share x, each depth shifts by exactly 22px), otherwise the tree looks ragged.
test(
    'folder and leaf icons keep the same indentation at each tree depth',
    {
        skip: !chromium ? 'Install playwright (npm install in frontend/) for browser checks.' : false
    },
    async () => {
        const browser = await chromium.launch({ headless: true });
        try {
            const page = await browser.newPage();
            await page.setContent(`<div class="gp__container"><nav class="tree-view"><ul class="tree-view__list">
            <li class="view folder opened"><span class="tree-item"><span class="icon-switcher"></span><span class="icon ico-folder" id="parent"></span>Parent</span>
                <ul class="tree-view__list">
                    <li class="view folder opened"><span class="tree-item"><span class="icon-switcher"></span><span class="icon ico-folder" id="child-folder"></span>Folder</span>
                        <ul class="tree-view__list"><li class="view file"><span class="tree-item"><span class="icon ico-file" id="grandchild-file"></span>File</span></li></ul>
                    </li>
                    <li class="view file"><span class="tree-item"><span class="icon ico-file" id="child-file"></span>File</span></li>
                </ul>
            </li>
        </ul></nav></div>`);
            await page.addStyleTag({ path: path.join(cssRoot, 'main.css') });
            await page.addStyleTag({ path: path.join(cssRoot, 'other.css') });
            const x = await page.evaluate(() =>
                Object.fromEntries(
                    ['parent', 'child-folder', 'child-file', 'grandchild-file'].map(id => [
                        id,
                        document.getElementById(id).getBoundingClientRect().x
                    ])
                )
            );
            assert.equal(x['child-file'], x['child-folder']);
            assert.equal(x['child-file'] - x.parent, 22);
            assert.equal(x['grandchild-file'] - x['child-folder'], 22);
        } finally {
            await browser.close();
        }
    }
);
