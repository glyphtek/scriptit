// src/common/types/types.ts
export interface ScriptContext {
  env: Record<string, string | undefined>;
  tmpDir: string;
  configPath?: string;
  log: (message: string) => void; // Function to log to the TUI
  [key: string]: any; // Allow other custom params
}

export interface ScriptModule {
  tearUp?: (context: ScriptContext) => Promise<any> | any;
  execute?: (context: ScriptContext, tearUpResult?: any) => Promise<any> | any;
  tearDown?: (
    context: ScriptContext,
    executeResult?: any,
    tearUpResult?: any,
  ) => Promise<void> | void;
  description?: string; // Optional description for the UI
  default?: (context: ScriptContext, tearUpResult?: any) => Promise<any> | any; // Support for default export functions (e.g., lambda functions)
}

export interface RunnerConfig {
  scriptsDir: string;
  tmpDir: string;
  envFiles: string[];
  defaultParams?: Record<string, any>;
  loadedConfigPath?: string; // Optional: path of the config file that was loaded
  excludePatterns?: string[]; // Glob patterns to exclude from scripts list
}
