import type { ScriptContext } from "../common/types/index.js";
export type ScriptExecutorOptions = {};
export interface ScriptExecutor {
    run: (scriptPath: string, context: ScriptContext) => Promise<any>;
}
/**
 * Creates a script executor instance that can run scripts
 * with proper lifecycle management (tearUp, execute, tearDown)
 */
export declare function createScriptExecutorInstance(options?: ScriptExecutorOptions): ScriptExecutor;
//# sourceMappingURL=script-executor.d.ts.map