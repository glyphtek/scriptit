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
    executeScript: (scriptPath: string, executionParams?: Record<string, any>, customLogger?: (message: string) => void) => Promise<any>;
    runTUI: () => Promise<void>;
    listScripts: () => Promise<string[]>;
    on: (eventName: string, listener: (...args: any[]) => void) => ScriptRunnerInstance;
    off: (eventName: string, listener: (...args: any[]) => void) => ScriptRunnerInstance;
    emit: (eventName: string, ...args: any[]) => boolean;
}
export declare function createScriptRunner(options?: CreateScriptRunnerOptions): Promise<ScriptRunnerInstance>;
export type { RunnerConfig, ScriptContext, ScriptModule, } from "./common/types/index.js";
//# sourceMappingURL=lib.d.ts.map