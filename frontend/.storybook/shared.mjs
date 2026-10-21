import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// FreeIPA's own modules do not exist outside the Web UI; stories use the same ES shims as the dev stand.
export const alias = {
    '@gpui': path.join(root, 'src'),
    'freeipa/ipa': path.join(root, 'dev', 'shims', 'ipa.js'),
    'freeipa/rpc': path.join(root, 'dev', 'shims', 'rpc.js')
};
