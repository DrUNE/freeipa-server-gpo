import { scriptFile } from '@gpui/components/editor-icons';
import { t } from '@gpui/locales/translations';
import { createElement } from '@gpui/util/element-creator';

function st(key) {
    return t('systemSettings.' + key);
}

function eventLabel(event) {
    return st(
        { startup: 'startupScripts', shutdown: 'shutdownScripts', logon: 'logonScript', logoff: 'logoffScript' }[event]
    );
}

function nameCell(label, icon) {
    return createElement('td', {
        children: [
            createElement('span', {
                className: 'gpo-catalog-name',
                children: [
                    createElement('span', { className: ['icon', icon], attrs: { 'aria-hidden': 'true' } }),
                    createElement('span', { text: label })
                ]
            })
        ]
    });
}

function assetIcon(name) {
    return scriptFile(/\.ps(?:1|m1|d1)$/i.test(name) ? 'powershell' : 'classic');
}

function button(label, action, disabled, extraClass) {
    return createElement('button', {
        className: ['button', disabled ? null : 'active', extraClass],
        attrs: { type: 'button', disabled: disabled ? 'disabled' : null },
        text: label,
        events: { click: action }
    });
}

function fileBase64(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onerror = function () {
            reject(reader.error || new Error('File reading failed.'));
        };
        reader.onload = function () {
            const value = String(reader.result || '');
            const comma = value.indexOf(',');
            if (comma < 0) reject(new Error('File reading failed.'));
            else resolve(value.slice(comma + 1));
        };
        reader.readAsDataURL(file);
    });
}

function saveDownloadedAsset(asset) {
    if (
        !asset ||
        typeof asset.name !== 'string' ||
        !asset.name ||
        asset.name === '.' ||
        asset.name === '..' ||
        asset.name.trim() !== asset.name ||
        /[\\/\u0000]/.test(asset.name) ||
        typeof asset.content_base64 !== 'string' ||
        !Number.isSafeInteger(asset.byte_size) ||
        asset.byte_size < 0
    ) {
        throw new Error(st('invalidDownload'));
    }
    let binary;
    try {
        binary = atob(asset.content_base64);
    } catch (_error) {
        throw new Error(st('invalidDownload'));
    }
    if (binary.length !== asset.byte_size) throw new Error(st('invalidDownload'));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 0);
}

export { st, eventLabel, nameCell, assetIcon, button, fileBase64, saveDownloadedAsset };
