import { openCollectionEditor } from '@gpui/components/CollectionEditor/CollectionEditor';

/** Adapter kept for `collection-control.js` and the AMD test tree; the editor lives in `CollectionEditor/`. */
export function open(host, options) {
    return openCollectionEditor(host, options);
}
