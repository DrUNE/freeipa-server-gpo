import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// FreeIPA's own modules do not exist outside the Web UI; stories use the same ES shims as the dev stand.
export const alias = {
    'freeipa/ipa': path.join(root, 'dev', 'shims', 'ipa.js'),
    'freeipa/rpc': path.join(root, 'dev', 'shims', 'rpc.js')
};
export const pluginCss = path.resolve(root, '..', 'plugin', 'ui', 'grouppolicy', 'css');
