import type EventEmitter from "node:events";
/**
 * Main TUI implementation using blessed
 */
export declare function runTUI(configPath: string | undefined, initialScriptsDir: string, initialTmpDir: string, initialEnv: Record<string, string | undefined>, initialConfigValues: Record<string, unknown>, emitter?: EventEmitter): Promise<void>;
//# sourceMappingURL=blessed-ui.d.ts.map