import type { RunnerConfig } from "./common/types/index.js";
import { type EffectiveConfig } from "./core/index.js";
export interface CreateScriptRunnerOptions extends Partial<Omit<RunnerConfig, "loadedConfigPath">> {
    configFile?: string;
    initialEnv?: Record<string, string | undefined>;
    workingDirectory?: string;
}
export interface ScriptRunnerInstance {
    config: EffectiveConfig;
    environment: Record<string, string | undefined>;
    executeScript: (scriptPath: string, executionParams?: Record<string, unknown>, customLogger?: (message: string) => void) => Promise<unknown>;
    runTUI: () => Promise<void>;
    listScripts: () => Promise<string[]>;
    on: (eventName: string, listener: (...args: unknown[]) => void) => ScriptRunnerInstance;
    off: (eventName: string, listener: (...args: unknown[]) => void) => ScriptRunnerInstance;
    emit: (eventName: string, ...args: unknown[]) => boolean;
}
export declare function createScriptRunner(options?: CreateScriptRunnerOptions): Promise<ScriptRunnerInstance>;
export type { RunnerConfig, ScriptContext, ScriptModule, } from "./common/types/index.js";
//# sourceMappingURL=lib.d.ts.map