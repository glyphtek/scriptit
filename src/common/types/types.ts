// src/common/types/types.ts
export interface ScriptContext {
  env: Record<string, string | undefined>;
  tmpDir: string;
  params: Record<string, unknown>;
  configPath?: string;
  log: (message: string) => void; // Function to log to the TUI
  [key: string]: unknown; // Allow other custom params
}

export interface ScriptModule {
  tearUp?: (context: ScriptContext) => Promise<unknown> | unknown;
  execute?: (context: ScriptContext, tearUpResult?: unknown) => Promise<unknown> | unknown;
  tearDown?: (
    context: ScriptContext,
    executeResult?: unknown,
    tearUpResult?: unknown,
  ) => Promise<void> | void;
  description?: string; // Optional description for the UI
  default?: (context: ScriptContext, tearUpResult?: unknown) => Promise<unknown> | unknown; // Support for default export functions (e.g., lambda functions)
}

export interface RunnerConfig {
  scriptsDir: string;
  tmpDir: string;
  envFiles: string[];
  defaultParams?: Record<string, unknown>;
  loadedConfigPath?: string; // Optional: path of the config file that was loaded
  excludePatterns?: string[]; // Glob patterns to exclude from scripts list
}
