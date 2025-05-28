import type { ScriptContext } from "../common/types/index.js";
export type ScriptExecutorOptions = Record<string, never>;
export interface ScriptExecutor {
    run: (scriptPath: string, context: ScriptContext) => Promise<unknown>;
}
/**
 * Creates a script executor instance that can run scripts
 * with proper lifecycle management (tearUp, execute, tearDown)
 */
export declare function createScriptExecutorInstance(options?: ScriptExecutorOptions): ScriptExecutor;
//# sourceMappingURL=script-executor.d.ts.map