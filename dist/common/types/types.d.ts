export interface ScriptContext {
    env: Record<string, string | undefined>;
    tmpDir: string;
    configPath?: string;
    log: (message: string) => void;
    [key: string]: any;
}
export interface ScriptModule {
    tearUp?: (context: ScriptContext) => Promise<any> | any;
    execute?: (context: ScriptContext, tearUpResult?: any) => Promise<any> | any;
    tearDown?: (context: ScriptContext, executeResult?: any, tearUpResult?: any) => Promise<void> | void;
    description?: string;
    default?: (context: ScriptContext, tearUpResult?: any) => Promise<any> | any;
}
export interface RunnerConfig {
    scriptsDir: string;
    tmpDir: string;
    envFiles: string[];
    defaultParams?: Record<string, any>;
    loadedConfigPath?: string;
    excludePatterns?: string[];
}
//# sourceMappingURL=types.d.ts.map