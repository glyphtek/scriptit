import type { RunnerConfig } from "../types/index.js";
export declare const DEFAULT_SCRIPTS_DIR = "scripts";
export declare const DEFAULT_TMP_DIR = "tmp";
export declare const DEFAULT_CONFIG_FILE = "runner.config.js";
export declare function interpolateEnvVars(value: any, env: Record<string, string | undefined>): any;
export declare function loadConfig(configPath?: string): Promise<RunnerConfig>;
export declare function loadEnvironmentVariables(envFiles: string[]): Record<string, string | undefined>;
export declare function getScriptFiles(scriptsBaseDir: string, excludePatterns?: string[]): Promise<string[]>;
//# sourceMappingURL=utils.d.ts.map