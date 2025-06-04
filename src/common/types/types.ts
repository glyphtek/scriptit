// src/common/types/types.ts
export interface ColoredConsole {
  log: (...args: unknown[]) => void; // White output
  error: (...args: unknown[]) => void; // Red output
  warn: (...args: unknown[]) => void; // Yellow output
  info: (...args: unknown[]) => void; // Blue output
  debug: (...args: unknown[]) => void; // Gray output
}

// Interactive environment variable definitions
export interface VariableDefinition {
  name: string;
  message?: string;
  type?: "input" | "password" | "confirm";
}

export interface ScriptContext {
  env: Record<string, string | undefined>;
  tmpDir: string;
  params: Record<string, unknown>;
  configPath?: string;
  log: (message: string) => void; // Function to log to the TUI
  console?: ColoredConsole; // Enhanced console with colored output (when console interception is enabled)
  [key: string]: unknown; // Allow other custom params
}

export interface ScriptModule {
  tearUp?: (context: ScriptContext) => Promise<unknown> | unknown;
  execute?: (
    context: ScriptContext,
    tearUpResult?: unknown,
  ) => Promise<unknown> | unknown;
  tearDown?: (
    context: ScriptContext,
    executeResult?: unknown,
    tearUpResult?: unknown,
  ) => Promise<void> | void;
  description?: string; // Optional description for the UI
  default?: (
    context: ScriptContext,
    tearUpResult?: unknown,
  ) => Promise<unknown> | unknown; // Support for default export functions (e.g., lambda functions)
  variables?: VariableDefinition[] | string[]; // Interactive variables (full or shorthand)
}

export interface RunnerConfig {
  scriptsDir: string;
  tmpDir: string;
  envFiles: string[];
  defaultParams?: Record<string, unknown>;
  loadedConfigPath?: string; // Optional: path of the config file that was loaded
  excludePatterns?: string[]; // Glob patterns to exclude from scripts list
}
