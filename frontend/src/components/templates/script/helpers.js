import * as editorIcons from '@gpui/components/editor-icons';
import * as translations from '@gpui/locales/translations';
import * as elements from '@gpui/util/element-creator';

var t = translations.t;
var create = elements.createElement;

function st(key) {
    return t('systemSettings.' + key);
}

function eventLabel(event) {
    return st(
        { startup: 'startupScripts', shutdown: 'shutdownScripts', logon: 'logonScript', logoff: 'logoffScript' }[event]
    );
}

function nameCell(label, icon) {
    return create('td', {
        children: [
            create('span', {
                className: 'gpo-catalog-name',
                children: [
                    create('span', { className: ['icon', icon], attrs: { 'aria-hidden': 'true' } }),
                    create('span', { text: label })
                ]
            })
        ]
    });
}

function assetIcon(name) {
    return editorIcons.scriptFile(/\.ps(?:1|m1|d1)$/i.test(name) ? 'powershell' : 'classic');
}

function button(label, action, disabled, extraClass) {
    return create('button', {
        className: ['button', disabled ? null : 'active', extraClass],
        attrs: { type: 'button', disabled: disabled ? 'disabled' : null },
        text: label,
        events: { click: action }
    });
}

function fileBase64(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = function () {
            reject(reader.error || new Error('File reading failed.'));
        };
        reader.onload = function () {
            var value = String(reader.result || '');
            var comma = value.indexOf(',');
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
    var binary;
    try {
        binary = atob(asset.content_base64);
    } catch (_error) {
        throw new Error(st('invalidDownload'));
    }
    if (binary.length !== asset.byte_size) throw new Error(st('invalidDownload'));
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    var url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
    var link = document.createElement('a');
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
