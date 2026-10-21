/**
 * High-level GPO editor RPC client.
 *
 * The browser intentionally retains only the selected GPO display name and
 * opaque identifiers returned by the server.  Filesystem, registry and
 * libadmix binding details never cross this boundary.
 */

import IPA from 'freeipa/ipa';
import type {
    GpoEditorAdvancedAuditShowResult,
    GpoEditorAdvancedAuditUpdateResult,
    GpoEditorChildrenResult,
    GpoEditorOpenResult,
    GpoEditorPolicyIndexResult,
    GpoEditorPolicyShowResult,
    GpoEditorPolicyUpdateResult,
    GpoEditorPreferenceCreateResult,
    GpoEditorPreferenceDeleteResult,
    GpoEditorPreferenceDocumentsResult,
    GpoEditorPreferenceItemsResult,
    GpoEditorPreferenceShowResult,
    GpoEditorPreferenceUpdateResult,
    GpoEditorReconcileResult,
    GpoEditorScriptAssetDeleteResult,
    GpoEditorScriptAssetDownloadResult,
    GpoEditorScriptAssetReplaceResult,
    GpoEditorScriptAssetUploadResult,
    GpoEditorScriptEntriesReorderResult,
    GpoEditorScriptEntryAddResult,
    GpoEditorScriptEntryRemoveResult,
    GpoEditorScriptEntryUpdateResult,
    GpoEditorScriptFilesResult,
    GpoEditorScriptOrderUpdateResult,
    GpoEditorScriptUploadAndAddResult,
    GpoEditorScriptsShowResult,
    GpoEditorSecurityDefinitionsShowResult,
    GpoEditorSecurityDefinitionsUpdateResult
} from '../../types/rpc';
import rpc from 'freeipa/rpc';
import { getLanguage } from '@gpui/locales/translations';

/** A request body: plain data the server validates; the client only copies it. */
type Request = object;

let selectedDisplayName: string | null = null;
let editorOpenPromise: Promise<GpoEditorOpenResult> | null = null;
let editorOpenResult: GpoEditorOpenResult | null = null;

function clone<T>(value: T): T {
    if (value === undefined) return undefined as T;
    return JSON.parse(JSON.stringify(value)) as T;
}

/** What the FreeIPA transport hands over: a JSON-RPC answer, possibly wrapped once more, or nothing. */
function unwrapResponse<T = Record<string, never>>(data: any): T {
    const outer = data && data.result !== undefined ? data.result : data;
    const payload = outer && outer.result !== undefined ? outer.result : outer;
    return (payload === null || payload === undefined ? {} : payload) as T;
}

function firstObject(candidates: unknown[]): Record<string, any> {
    for (let i = 0; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        if (candidate && typeof candidate === 'object') return candidate as Record<string, any>;
    }
    return {};
}

/** The error of an editor call, in one shape whatever FreeIPA or the server reported (see `normalizeError`). */
class EditorError extends Error {
    category: string;
    code: string | number;
    field: string | null;
    path: unknown;
    details: Record<string, any>;
    pendingPublication: unknown;

    constructor(message?: string | null, details?: Record<string, any> | null) {
        super(message || 'GPO editor request failed');
        const info = details || {};
        this.name = 'GpoEditorError';
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
            } catch {
                /* not JSON: keep the text out of `details` and fall back to `info` below */
            }
        }
        this.details = parsedDetails && typeof parsedDetails === 'object' ? parsedDetails : info;
        this.pendingPublication =
            info.pending_publication ||
            info.pendingPublication ||
            (this.details && this.details.pending_publication) ||
            null;
    }
}

function normalizeError(xhr: any, textStatus?: string, thrown?: any): EditorError {
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

function normalizeLocale(locale: unknown): string {
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

function localePreferences(): string[] {
    const uiLocale = getLanguage();
    let browserLocales: string[] = [];
    if (typeof navigator !== 'undefined') {
        browserLocales =
            Array.isArray(navigator.languages) && navigator.languages.length
                ? [...navigator.languages]
                : [navigator.language];
    }

    const result: string[] = [];
    [uiLocale].concat(browserLocales, ['en-US']).forEach(function (locale) {
        const normalized = normalizeLocale(locale);
        if (normalized && result.indexOf(normalized) === -1) result.push(normalized);
    });
    return result;
}

function requireDisplayName(): string {
    if (!selectedDisplayName) {
        throw new EditorError('No GPO is selected', { category: 'validation', field: 'displayname' });
    }
    return selectedDisplayName;
}

function execute<T = unknown>(method: string, args: unknown[], options?: Request): Promise<T> {
    let displayName: string;
    try {
        displayName = requireDisplayName();
    } catch (error) {
        return Promise.reject(error);
    }

    return new Promise<T>(function (resolve, reject) {
        const commandOptions = Object.assign({ version: IPA.api_version }, clone(options || {}));
        rpc.command({
            entity: 'gpo',
            method: method,
            // Security errors are rendered by the editor in the selected UI
            // language.  FreeIPA's retry dialog would expose the raw server
            // message first and require a second dismissal to reach it.
            retry: !/^editor_(security|advanced_audit|script|policy_index)/.test(method),
            args: [displayName].concat(clone(args || []) as string[]),
            options: commandOptions,
            on_success: function (data: unknown) {
                resolve(unwrapResponse<T>(data));
            },
            on_error: function (xhr: unknown, textStatus: string, thrown: unknown) {
                reject(normalizeError(xhr, textStatus, thrown));
            }
        }).execute();
    });
}

function withLocales(options?: Request) {
    return Object.assign({}, options || {}, { locales: localePreferences() });
}

function rememberEnvelope<T>(result: T): T {
    const cached = editorOpenResult;
    if (!cached || !result || typeof result !== 'object') return result;
    // The cached answer of `open` follows the envelope of every later answer (the policy, the pending publication).
    const target = cached as unknown as Record<string, unknown>;
    (['gpo', 'template', 'diagnostics', 'pending_publication'] as const).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            target[key] = clone((result as Record<string, unknown>)[key]);
        }
    });
    return result;
}

function initialize(displayName?: string | null): Promise<GpoEditorOpenResult> {
    selectedDisplayName = displayName ? String(displayName) : null;
    editorOpenResult = null;
    editorOpenPromise = selectedDisplayName
        ? execute<GpoEditorOpenResult>('editor_open', [], withLocales()).then(function (result) {
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

function open(options?: Request): Promise<GpoEditorOpenResult> {
    if (!options && editorOpenResult) return Promise.resolve(editorOpenResult);
    if (!options && editorOpenPromise) return editorOpenPromise;
    return execute<GpoEditorOpenResult>('editor_open', [], withLocales(options)).then(function (result) {
        editorOpenResult = result;
        return result;
    });
}

function children(scope: string, categoryId?: string | null): Promise<GpoEditorChildrenResult> {
    const options: Record<string, unknown> = {};
    if (categoryId !== null && categoryId !== undefined) options.category_id = categoryId;
    return execute<GpoEditorChildrenResult>('editor_children', [scope], withLocales(options));
}

function policyIndex(scope: string): Promise<GpoEditorPolicyIndexResult> {
    return execute<GpoEditorPolicyIndexResult>('editor_policy_index', [scope], withLocales());
}

function policyShow(scope: string, policyId: string): Promise<GpoEditorPolicyShowResult> {
    return execute<GpoEditorPolicyShowResult>('editor_policy_show', [scope, policyId], withLocales());
}

function policyUpdate(scope: string, policyId: string, request?: Request): Promise<GpoEditorPolicyUpdateResult> {
    return execute<GpoEditorPolicyUpdateResult>(
        'editor_policy_update',
        [scope, policyId],
        withLocales({
            request: clone(request || {})
        })
    ).then(rememberEnvelope);
}

function preferenceDocuments(): Promise<GpoEditorPreferenceDocumentsResult> {
    return execute<GpoEditorPreferenceDocumentsResult>('editor_preference_documents', [], {});
}

function preferenceItems(scope: string, kind: string): Promise<GpoEditorPreferenceItemsResult> {
    return execute<GpoEditorPreferenceItemsResult>('editor_preference_items', [scope, kind], {});
}

function preferenceShow(scope: string, kind: string, identity?: unknown): Promise<GpoEditorPreferenceShowResult> {
    return execute<GpoEditorPreferenceShowResult>('editor_preference_show', [scope, kind], {
        request: { identity: identity === undefined ? null : clone(identity) }
    });
}

function preferenceCreate(scope: string, kind: string, request?: Request): Promise<GpoEditorPreferenceCreateResult> {
    return execute<GpoEditorPreferenceCreateResult>('editor_preference_create', [scope, kind], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function preferenceUpdate(scope: string, kind: string, request?: Request): Promise<GpoEditorPreferenceUpdateResult> {
    return execute<GpoEditorPreferenceUpdateResult>('editor_preference_update', [scope, kind], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function preferenceDelete(scope: string, kind: string, identity: unknown): Promise<GpoEditorPreferenceDeleteResult> {
    return execute<GpoEditorPreferenceDeleteResult>('editor_preference_delete', [scope, kind], {
        request: { identity: clone(identity) }
    }).then(rememberEnvelope);
}

function scriptsShow(scope: string, event: string): Promise<GpoEditorScriptsShowResult> {
    return execute<GpoEditorScriptsShowResult>('editor_scripts_show', [scope, event], {});
}

function scriptFiles(scope: string, event: string): Promise<GpoEditorScriptFilesResult> {
    return execute<GpoEditorScriptFilesResult>('editor_script_files', [scope, event], {});
}

function scriptEntryAdd(scope: string, event: string, request?: Request): Promise<GpoEditorScriptEntryAddResult> {
    return execute<GpoEditorScriptEntryAddResult>('editor_script_entry_add', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptEntryUpdate(scope: string, event: string, request?: Request): Promise<GpoEditorScriptEntryUpdateResult> {
    return execute<GpoEditorScriptEntryUpdateResult>('editor_script_entry_update', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptEntryRemove(scope: string, event: string, request?: Request): Promise<GpoEditorScriptEntryRemoveResult> {
    return execute<GpoEditorScriptEntryRemoveResult>('editor_script_entry_remove', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptEntriesReorder(
    scope: string,
    event: string,
    request?: Request
): Promise<GpoEditorScriptEntriesReorderResult> {
    return execute<GpoEditorScriptEntriesReorderResult>('editor_script_entries_reorder', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptOrderUpdate(scope: string, event: string, request?: Request): Promise<GpoEditorScriptOrderUpdateResult> {
    return execute<GpoEditorScriptOrderUpdateResult>('editor_script_order_update', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptAssetUpload(scope: string, event: string, request?: Request): Promise<GpoEditorScriptAssetUploadResult> {
    return execute<GpoEditorScriptAssetUploadResult>('editor_script_asset_upload', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptUploadAndAdd(
    scope: string,
    event: string,
    request?: Request
): Promise<GpoEditorScriptUploadAndAddResult> {
    return execute<GpoEditorScriptUploadAndAddResult>('editor_script_upload_and_add', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptAssetReplace(
    scope: string,
    event: string,
    request?: Request
): Promise<GpoEditorScriptAssetReplaceResult> {
    return execute<GpoEditorScriptAssetReplaceResult>('editor_script_asset_replace', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptAssetDelete(scope: string, event: string, request?: Request): Promise<GpoEditorScriptAssetDeleteResult> {
    return execute<GpoEditorScriptAssetDeleteResult>('editor_script_asset_delete', [scope, event], {
        request: clone(request || {})
    }).then(rememberEnvelope);
}

function scriptAssetDownload(
    scope: string,
    event: string,
    request?: Request
): Promise<GpoEditorScriptAssetDownloadResult> {
    return execute<GpoEditorScriptAssetDownloadResult>('editor_script_asset_download', [scope, event], {
        request: clone(request || {})
    });
}

function reconcile(): Promise<GpoEditorReconcileResult> {
    return execute<GpoEditorReconcileResult>('editor_reconcile', [], {}).then(rememberEnvelope);
}

function securityDefinitionsShow(): Promise<GpoEditorSecurityDefinitionsShowResult> {
    return execute<GpoEditorSecurityDefinitionsShowResult>('editor_security_definitions_show', [], withLocales());
}
function securityDefinitionsUpdate(request?: Request): Promise<GpoEditorSecurityDefinitionsUpdateResult> {
    return execute<GpoEditorSecurityDefinitionsUpdateResult>(
        'editor_security_definitions_update',
        [],
        withLocales({
            request: clone(request || {})
        })
    ).then(rememberEnvelope);
}
function advancedAuditShow(): Promise<GpoEditorAdvancedAuditShowResult> {
    return execute<GpoEditorAdvancedAuditShowResult>('editor_advanced_audit_show', [], {});
}
function advancedAuditUpdate(request?: Request): Promise<GpoEditorAdvancedAuditUpdateResult> {
    return execute<GpoEditorAdvancedAuditUpdateResult>('editor_advanced_audit_update', [], {
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
