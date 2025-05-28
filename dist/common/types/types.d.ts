export interface ScriptContext {
    env: Record<string, string | undefined>;
    tmpDir: string;
    params: Record<string, unknown>;
    configPath?: string;
    log: (message: string) => void;
    [key: string]: unknown;
}
export interface ScriptModule {
    tearUp?: (context: ScriptContext) => Promise<unknown> | unknown;
    execute?: (context: ScriptContext, tearUpResult?: unknown) => Promise<unknown> | unknown;
    tearDown?: (context: ScriptContext, executeResult?: unknown, tearUpResult?: unknown) => Promise<void> | void;
    description?: string;
    default?: (context: ScriptContext, tearUpResult?: unknown) => Promise<unknown> | unknown;
}
export interface RunnerConfig {
    scriptsDir: string;
    tmpDir: string;
    envFiles: string[];
    defaultParams?: Record<string, unknown>;
    loadedConfigPath?: string;
    excludePatterns?: string[];
}
//# sourceMappingURL=types.d.ts.map