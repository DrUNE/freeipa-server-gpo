import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// FreeIPA's own modules do not exist outside the Web UI. Stories use the dev stand's shim of `freeipa/ipa` and their own
// `freeipa/rpc` (.storybook/shims/rpc.js: the mock server of the stand, called in the page).
export const alias = {
    '@gpui': path.join(root, 'src'),
    'freeipa/ipa': path.join(root, 'dev', 'shims', 'ipa.js'),
    'freeipa/rpc': path.join(root, '.storybook', 'shims', 'rpc.js')
};
