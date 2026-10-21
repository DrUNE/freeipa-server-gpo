/**
 * What the host of the ES-module build provides (an import map or a bundler alias): the two FreeIPA modules the editor imports.
 * Copied to dist-esm/gpui-host.d.ts by `npm run build:esm`.
 */

/**
 * Provided by the host (an import map or a bundler alias): the part of FreeIPA's `freeipa/ipa` the editor uses.
 */
declare module 'freeipa/ipa' {
    const IPA: {
        /** Sent as `version` with every command. */
        api_version: string;
        notify(message: string, type?: string): void;
        notify_success(message: string): void;
    };
    export default IPA;
}

/**
 * Provided by the host: the part of FreeIPA's `freeipa/rpc` the editor uses. `command(spec).execute()` sends the JSON-RPC
 * command `<entity>_<method>` (the editor always uses entity `gpo`) with `[args, options]` and calls `on_success(data)` or
 * `on_error(xhr, textStatus, thrown)`.
 */
declare module 'freeipa/rpc' {
    interface CommandSpec {
        entity: string;
        method: string;
        args: string[];
        options: Record<string, unknown>;
        retry?: boolean;
        on_success(data: unknown): void;
        on_error(xhr: unknown, textStatus: string, thrown: unknown): void;
    }
    const rpc: { command(spec: CommandSpec): { execute(): void } };
    export default rpc;
}
