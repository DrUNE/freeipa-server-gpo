import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import { cx, h } from '@gpui/lib/dom';

// A document that is just enough for h(): elements record their attributes and children.
function fakeDocument() {
    return {
        createElement: tag => {
            const element = { tag, attributes: {}, children: [] };
            element.setAttribute = (name, value) => (element.attributes[name] = value);
            element.append = (...nodes) => element.children.push(...nodes);
            return element;
        }
    };
}

afterEach(() => vi.unstubAllGlobals());

test('h() sets attributes, skips empty ones and empty children', () => {
    vi.stubGlobal('document', fakeDocument());
    const element = h(
        'div',
        { class: 'a', hidden: true, title: null, id: undefined, lang: false },
        'text',
        null,
        false
    );
    assert.deepEqual(element.attributes, { class: 'a', hidden: '' });
    assert.deepEqual(element.children, ['text']);
});

test('elements carry no data-source unless the dev flag is on', () => {
    vi.stubGlobal('document', fakeDocument());
    assert.deepEqual(h('div').attributes, {});
});

test('with the dev flag an element names the file and line of the first frame outside lib/dom.js', () => {
    vi.stubGlobal('document', fakeDocument());
    vi.stubGlobal('__GPUI_DEV__', true);
    vi.stubGlobal(
        'Error',
        class {
            stack = [
                'Error',
                '    at callerSource (http://127.0.0.1:8765/src/lib/dom.js?t=1:12:20)',
                '    at h (http://127.0.0.1:8765/src/lib/dom.js?t=1:30:9)',
                '    at createStatus (http://127.0.0.1:8765/src/components/EditorStatus/EditorStatus.js?t=7:41:12)',
                '    at run (http://127.0.0.1:8765/@fs/x/node_modules/vite/client.js:3:1)'
            ].join('\n');
        }
    );
    assert.equal(h('div').attributes['data-source'], 'src/components/EditorStatus/EditorStatus.js:41');
});

test('with the dev flag an element without a source frame gets no data-source', () => {
    vi.stubGlobal('document', fakeDocument());
    vi.stubGlobal('__GPUI_DEV__', true);
    vi.stubGlobal(
        'Error',
        class {
            stack = 'Error\n    at h (somewhere-else.js:1:1)';
        }
    );
    assert.deepEqual(h('div').attributes, {});
});

test('cx() joins the truthy class names', () => {
    assert.equal(cx('a', false, null, undefined, 'b'), 'a b');
});
