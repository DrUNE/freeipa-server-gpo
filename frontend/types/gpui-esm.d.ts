/**
 * The public surface of the editor built as an ES module (`npm run build:esm`, copied to dist-esm/gpui.d.ts).
 * The host imports `init`, calls it with a container and the display name of a GPO, and calls `cleanup()` when it removes
 * the container. The host also has to provide the two modules the editor imports (`freeipa/ipa`, `freeipa/rpc`: see gpui-host.d.ts).
 */

export interface InitOptions {
    /** The element to render into; takes precedence over `containerId`. */
    container?: Element;
    /** The id of the element to render into (default `gp__container`). */
    containerId?: string;
    /** The display name of the GPO to edit. */
    policyName: string;
}

export interface EditorHandle {
    container: Element;
    /** Releases everything the editor put outside its container (listeners on `document`, the current view's own cleanup). */
    cleanup(): void;
}

/** Renders the editor into the container; a second call for the same container stops the previous editor. Null when there is no container. */
export function init(options: InitOptions): EditorHandle | null;
