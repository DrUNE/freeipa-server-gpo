import * as API from '@gpui/util/API';
import { st, fileBase64, saveDownloadedAsset } from '@gpui/components/templates/script/helpers';

/**
 * Operations on the event's files: upload, replace, download and delete.
 * @param {any} context the editor's state and operations
 */
function createAssetActions({
    applyResponse,
    confirm,
    assets,
    config,
    current,
    mutate,
    navigations,
    renderBody,
    scope,
    selectedAsset,
    setError,
    state
}) {
    async function uploadChosen(event, replace) {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file || state.busy || !state.view) return;
        const asset = replace ? selectedAsset() : null;
        if (replace && !asset) return;
        if (file.size > state.view.upload_limit_bytes) {
            setError({ category: 'size_limit', message: st('uploadTooLarge') });
            return;
        }
        async function upload() {
            try {
                const content = await fileBase64(file);
                if (!current() || !state.event) return;
                await mutate(function () {
                    return replace
                        ? API.scriptAssetReplace(scope, state.event, {
                              name: asset.name,
                              revision: asset.revision,
                              content_base64: content
                          })
                        : API.scriptAssetUpload(scope, state.event, {
                              name: file.name,
                              content_base64: content
                          });
                });
            } catch (error) {
                if (current()) setError(error);
            }
        }
        if (replace)
            confirm(st('replaceFileConfirm'), function () {
                void upload();
            });
        else await upload();
    }

    function deleteAsset() {
        const selected =
            config.mode === 'assets'
                ? assets().filter(function (asset) {
                      return state.selectedAssets.has(asset.name);
                  })
                : [selectedAsset()].filter(Boolean);
        if (!selected.length || state.busy) return;
        if (
            selected.some(function (asset) {
                return asset.references && asset.references.length;
            })
        ) {
            setError({ category: 'validation', message: st('fileInUse') });
            return;
        }
        const event = state.event;
        confirm(st(selected.length > 1 ? 'deleteSelectedFilesConfirm' : 'deleteFileConfirm'), function () {
            state.removal = {
                assets: true,
                before: assets().map(function (asset) {
                    return asset.name;
                }),
                removed: selected.map(function (asset) {
                    return asset.name;
                })
            };
            void mutate(async function () {
                let response = null;
                try {
                    for (let index = 0; index < selected.length; index++) {
                        response = await API.scriptAssetDelete(scope, event, {
                            name: selected[index].name,
                            revision: selected[index].revision
                        });
                    }
                    return response;
                } catch (error) {
                    if (response) {
                        applyResponse(response);
                        if (typeof config.onSaved === 'function') config.onSaved(response);
                    }
                    throw error;
                }
            });
        });
    }

    async function downloadAsset() {
        const asset = selectedAsset();
        if (!asset || state.busy) return;
        state.busy = true;
        renderBody();
        try {
            const response = await API.scriptAssetDownload(scope, state.event, {
                name: asset.name,
                revision: asset.revision
            });
            if (current()) saveDownloadedAsset(response && response.asset);
        } catch (error) {
            if (current()) setError(error);
        } finally {
            state.busy = false;
            if (current()) {
                renderBody();
                if (document.activeElement === document.body && navigations.assets) navigations.assets.focusSelected();
            }
        }
    }

    return { deleteAsset, uploadChosen, downloadAsset };
}

export { createAssetActions };
