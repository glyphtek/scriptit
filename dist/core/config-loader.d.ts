import type { RunnerConfig } from "../common/types/index.js";
export interface EffectiveConfig extends RunnerConfig {
    loadedConfigPath?: string;
}
export interface ConfigLoaderOptions {
    configPath?: string;
    cliOptions?: {
        scriptsDir?: string;
        tmpDir?: string;
        envFiles?: string[];
    };
    defaultConfigValues?: Partial<RunnerConfig>;
}
export declare function loadRunnerConfigInternal(options?: ConfigLoaderOptions): Promise<EffectiveConfig>;
//# sourceMappingURL=config-loader.d.ts.map