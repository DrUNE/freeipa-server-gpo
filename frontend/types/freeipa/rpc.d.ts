declare const rpc: { command(spec: Record<string, any>): { execute(): void }; [key: string]: any };
export default rpc;
