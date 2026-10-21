/**
 * High-level GPO editor RPC client.
 *
 * The browser intentionally retains only the selected GPO display name and
 * opaque identifiers returned by the server.  Filesystem, registry and
 * libadmix binding details never cross this boundary.
 */

import IPA from 'freeipa/ipa';
import rpc from 'freeipa/rpc';
import { getLanguage } from '@gpui/locales/translations';

let selectedDisplayName = null;
let editorOpenPromise = null;
let editorOpenResult = null;

function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
}

function unwrapResponse(data) {
    const outer = data && data.result !== undefined ? data.result : data;
    const payload = outer && outer.result !== undefined ? outer.result : outer;
    return payload === null || payload === undefined ? {} : payload;
}

function firstObject(candidates) {
    for (let i = 0; i < candidates.length; i += 1) {
        if (candidates[i] && typeof candidates[i] === 'object') {
            return candidates[i];
        }
    }
    return {};
}

function EditorError(message, details) {
    const info = details || {};
    this.name = 'GpoEditorError';
    this.message = message || 'GPO editor request failed';
    let inferredCategory = info.category || info.error_category || null;
    const errorName = String(info.name || info.error_name || '');
    if (!inferredCategory && /ACIError|Authorization|NotAllowed/i.test(errorName + ' ' + (message || ''))) {
        inferredCategory = 'authorization';
    }
    this.category = inferredCategory || (typeof info.code === 'string' ? info.code : null) || 'operational';
    this.code = info.code || this.category;
    this.field = info.field || null;
    this.path = info.path || null;
    let parsedDetails = info.details;
    if (typeof parsedDetails === 'string') {
        try {
            parsedDetails = JSON.parse(parsedDetails);
        } catch (ignore) {}
    }
    this.details = parsedDetails && typeof parsedDetails === 'object' ? parsedDetails : info;
    this.pendingPublication =
        info.pending_publication ||
        info.pendingPublication ||
        (this.details && this.details.pending_publication) ||
        null;
    // captureStackTrace is V8-only, hence the guard.
    const errorCtor = /** @type {any} */ (Error);
    if (errorCtor.captureStackTrace) errorCtor.captureStackTrace(this, EditorError);
}
EditorError.prototype = Object.create(Error.prototype);
EditorError.prototype.constructor = EditorError;

function normalizeError(xhr, textStatus, thrown) {
    if (thrown instanceof EditorError) return thrown;

    const response = xhr && (xhr.responseJSON || xhr.response || xhr.data);
    const responseError = response && response.error ? response.error : response;
    const thrownData = thrown && (thrown.data || thrown.details || thrown.error);
    const details = firstObject([
        thrownData && thrownData.error && thrownData.error.data,
        thrownData && thrownData.data,
        responseError && responseError.data,
        thrownData,
        responseError,
        thrown
    ]);
    const message =
        details.message ||
        (thrown && thrown.message) ||
        (responseError && responseError.message) ||
        textStatus ||
        'GPO editor request failed';

    return new EditorError(String(message), details);
}

function normalizeLocale(locale) {
    const value = String(locale || '').replace('_', '-');
    const parts = value.split('-').filter(Boolean);
    if (parts.length === 0) return 'en-US';
    const language = parts[0].toLowerCase();
    if (parts.length === 1) {
        if (language === 'ru') return 'ru-RU';
        if (language === 'en') return 'en-US';
        return language;
    }
    return language + '-' + parts[1].toUpperCase();
}

function localePreferences() {
    const uiLocale = getLanguage();
    let browserLocales = [];
    if (typeof navigator !== 'undefined') {
        browserLocales =
            Array.isArray(navigator.languages) && navigator.languages.length
                ? navigator.languages
                : [navigator.language];
    }

    const result = [];
    [uiLocale].concat(browserLocales, ['en-US']).forEach(function (locale) {
        const normalized = normalizeLocale(locale);
        if (normalized && result.indexOf(normalized) === -1) result.push(normalized);
    });
    return result;
}

function requireDisplayName() {
    if (!selectedDisplayName) {
        throw new EditorError('No GPO is selected', { category: 'validation', field: 'displayname' });
    }
    return selectedDisplayName;
}

function execute(method, args, options) {
    let displayName;
    try {
        displayName = requireDisplayName();
    } catch (error) {
        return Promise.reject(error);
    }

    return new Promise(function (resolve, reject) {
        const commandOptions = Object.assign({ version: IPA.api_version }, clone(options || {}));
        rpc.command({
            entity: 'gpo',
            method: method,
            // Security errors are rendered by the editor in the selected UI
            // language.  FreeIPA's retry dialog would expose the raw server
            // message first and require a second dismissal to reach it.
            retry: !/^editor_(security|advanced_audit|script|policy_index)/.test(method),
            args: [displayName].concat(clone(args || [])),
            options: commandOptions,
            on_success: function (data) {
                resolve(unwrapResponse(data));
            },
            on_error: function (xhr, textStatus, thrown) {
                reject(normalizeError(xhr, textStatus, thrown));
            }
        }).execute();
    });
}

function withLocales(options) {
    return Object.assign({}, options || {}, { locales: localePreferences() });
}

function rememberEnvelope(result) {
    const cached = editorOpenResult;
    if (!cached || !result || typeof result !== 'object') return result;
    ['gpo', 'template', 'diagnostics', 'pending_publication'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            cached[key] = clone(result[key]);
        }
    });
    return result;
}

/** @returns {Promise<import('../../types/rpc').GpoEditorOpenResult>} */
function initialize(displayName) {
    selectedDisplayName = displayName ? String(displayName) : null;
    editorOpenResult = null;
    editorOpenPromise = selectedDisplayName
        ? execute('editor_open', [], withLocales()).then(function (result) {
              editorOpenResult = result;
              return result;
          })
        : Promise.reject(
              new EditorError('No GPO is selected', {
                  category: 'validation',
                  field: 'displayname'
              })
          );
    return editorOpenPromise;
}

/** @returns {Promise<import('../../types/rpc').GpoEditorOpenResult>} */
function open(options) {
    if (!options && editorOpenResult) return Promise.resolve(editorOpenResult);
    if (!options && editorOpenPromise) return editorOpenPromise;
    return execute('editor_open', [], withLocales(options)).then(function (result) {
        editorOpenResult = result;
        return result;
    });
}

/** @returns {Promise<import('../../types/rpc').GpoEditorChildrenResult>} */
function children(scope, categoryId) {
    const options = {};
    if (categoryId !== null && categoryId !== undefined) options.category_id = categoryId;
    return execute('editor_children', [scope], withLocales(options));
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPolicyIndexResult>} */
function policyIndex(scope) {
    return execute('editor_policy_index', [scope], withLocales());
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPolicyShowResult>} */
function policyShow(scope, policyId) {
    return execute('editor_policy_show', [scope, policyId], withLocales());
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPolicyUpdateResult>} */
function policyUpdate(scope, policyId, request) {
    return execute(
        'editor_policy_update',
        [scope, policyId],
        withLocales({
            request: clone(request || {})
        })
    ).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPreferenceDocumentsResult>} */
function preferenceDocuments() {
    return execute('editor_preference_documents', [], {});
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPreferenceItemsResult>} */
function preferenceItems(scope, kind) {
    return execute('editor_preference_items', [scope, kind], {});
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPreferenceShowResult>} */
function preferenceShow(scope, kind, identity) {
    return execute('editor_preference_show', [scope, kind], {
        request: { identity: identity === undefined ? null : clone(identity) }
    });
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPreferenceCreateResult>} */
function preferenceCreate(scope, kind, request) {
    return execute('editor_preference_create', [scope, kind], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPreferenceUpdateResult>} */
function preferenceUpdate(scope, kind, request) {
    return execute('editor_preference_update', [scope, kind], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorPreferenceDeleteResult>} */
function preferenceDelete(scope, kind, identity) {
    return execute('editor_preference_delete', [scope, kind], {
        request: { identity: clone(identity) }
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptsShowResult>} */
function scriptsShow(scope, event) {
    return execute('editor_scripts_show', [scope, event], {});
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptFilesResult>} */
function scriptFiles(scope, event) {
    return execute('editor_script_files', [scope, event], {});
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptEntryAddResult>} */
function scriptEntryAdd(scope, event, request) {
    return execute('editor_script_entry_add', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptEntryUpdateResult>} */
function scriptEntryUpdate(scope, event, request) {
    return execute('editor_script_entry_update', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptEntryRemoveResult>} */
function scriptEntryRemove(scope, event, request) {
    return execute('editor_script_entry_remove', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptEntriesReorderResult>} */
function scriptEntriesReorder(scope, event, request) {
    return execute('editor_script_entries_reorder', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptOrderUpdateResult>} */
function scriptOrderUpdate(scope, event, request) {
    return execute('editor_script_order_update', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptAssetUploadResult>} */
function scriptAssetUpload(scope, event, request) {
    return execute('editor_script_asset_upload', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptUploadAndAddResult>} */
function scriptUploadAndAdd(scope, event, request) {
    return execute('editor_script_upload_and_add', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptAssetReplaceResult>} */
function scriptAssetReplace(scope, event, request) {
    return execute('editor_script_asset_replace', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptAssetDeleteResult>} */
function scriptAssetDelete(scope, event, request) {
    return execute('editor_script_asset_delete', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorScriptAssetDownloadResult>} */
function scriptAssetDownload(scope, event, request) {
    return execute('editor_script_asset_download', [scope, event], {
        request: clone(request || {})
    });
}

/** @returns {Promise<import('../../types/rpc').GpoEditorReconcileResult>} */
function reconcile() {
    return execute('editor_reconcile', [], {}).then(rememberEnvelope);
}

/** @returns {Promise<import('../../types/rpc').GpoEditorSecurityDefinitionsShowResult>} */
function securityDefinitionsShow() {
    return execute('editor_security_definitions_show', [], withLocales());
}
/** @returns {Promise<import('../../types/rpc').GpoEditorSecurityDefinitionsUpdateResult>} */
function securityDefinitionsUpdate(request) {
    return execute(
        'editor_security_definitions_update',
        [],
        withLocales({
            request: clone(request || {})
        })
    ).then(rememberEnvelope);
}
/** @returns {Promise<import('../../types/rpc').GpoEditorAdvancedAuditShowResult>} */
function advancedAuditShow() {
    return execute('editor_advanced_audit_show', [], {});
}
/** @returns {Promise<import('../../types/rpc').GpoEditorAdvancedAuditUpdateResult>} */
function advancedAuditUpdate(request) {
    return execute('editor_advanced_audit_update', [], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

const getDisplayName = function () {
    return selectedDisplayName;
};
const getOpenResult = function () {
    return editorOpenResult;
};
const _test = {
    unwrapResponse: unwrapResponse,
    normalizeError: normalizeError,
    normalizeLocale: normalizeLocale
};

export {
    EditorError,
    initialize,
    open,
    children,
    policyIndex,
    policyShow,
    policyUpdate,
    preferenceDocuments,
    preferenceItems,
    preferenceShow,
    preferenceCreate,
    preferenceUpdate,
    preferenceDelete,
    scriptsShow,
    scriptFiles,
    scriptEntryAdd,
    scriptEntryUpdate,
    scriptEntryRemove,
    scriptEntriesReorder,
    scriptOrderUpdate,
    scriptAssetUpload,
    scriptUploadAndAdd,
    scriptAssetReplace,
    scriptAssetDelete,
    scriptAssetDownload,
    reconcile,
    securityDefinitionsShow,
    securityDefinitionsUpdate,
    advancedAuditShow,
    advancedAuditUpdate,
    getDisplayName,
    getOpenResult,
    localePreferences,
    _test
};
