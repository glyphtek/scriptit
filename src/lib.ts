// src/lib.ts (or src/index.ts - your library's main export file)

import EventEmitter from "node:events"; // For the 'on' method
import { existsSync as pathExistsSync } from "node:fs";
import path from "node:path";
import type {
  ColoredConsole,
  RunnerConfig,
  ScriptContext,
  ScriptModule,
} from "./common/types/index.js";
import { getScriptFiles } from "./common/utils/index.js"; // Import getScriptFiles for script discovery
import {
  type EffectiveConfig, // Type for the result of loadRunnerConfigInternal
  type ScriptExecutor, // Type for the executor
  createScriptExecutorInstance, // To get an executor instance
  loadEnvironment,
  loadRunnerConfigInternal, // Renamed to avoid conflict if you also export a user-facing loadConfig
} from "./core/index.js";
import { runBlessedTUI } from "./ui/index.js"; // Import from ui/index.ts

// Default paths if not specified
const DEFAULT_CONFIG_FILE_PATH = "runner.config.js";

// Type for script execution results
export interface ScriptExecutionResult {
  [key: string]: unknown;
}

// Event handler types
export type ScriptEventHandler = {
  "script:beforeExecute": (
    scriptPath: string,
    params: Record<string, unknown>,
  ) => void;
  "script:afterExecute": (
    scriptPath: string,
    result: ScriptExecutionResult,
  ) => void;
  "script:error": (scriptPath: string, error: unknown) => void;
  "script:log": (scriptPath: string, message: string) => void;
  "tui:beforeStart": () => void;
  "tui:afterEnd": () => void;
};

export interface CreateScriptRunnerOptions
  extends Partial<Omit<RunnerConfig, "loadedConfigPath">> {
  configFile?: string; // Explicitly allow configFile to be passed
  initialEnv?: Record<string, string | undefined>; // Programmatically set/override env vars
  workingDirectory?: string; // Set working directory for script execution
  consoleInterception?: {
    enabled?: boolean;
    includeLevel?: boolean;
    preserveOriginal?: boolean;
    useColors?: boolean;
  };
}

export interface ScriptRunnerInstance {
  config: EffectiveConfig;
  environment: Record<string, string | undefined>;
  executeScript: (
    scriptPath: string,
    executionParams?: Record<string, unknown>,
    customLogger?: (message: string) => void, // Allow custom logger for this specific execution
  ) => Promise<ScriptExecutionResult>;
  runTUI: () => Promise<void>;
  listScripts: () => Promise<string[]>; // Added method to list available scripts
  on: <K extends keyof ScriptEventHandler>(
    eventName: K,
    listener: ScriptEventHandler[K],
  ) => ScriptRunnerInstance;
  off: <K extends keyof ScriptEventHandler>(
    eventName: K,
    listener: ScriptEventHandler[K],
  ) => ScriptRunnerInstance;
  emit: <K extends keyof ScriptEventHandler>(
    eventName: K,
    ...args: Parameters<ScriptEventHandler[K]>
  ) => boolean;
  // close?: () => Promise<void>; // If needed later
}

export async function createScriptRunner(
  options: CreateScriptRunnerOptions = {},
): Promise<ScriptRunnerInstance> {
  const emitter = new EventEmitter();

  // Handle working directory change if specified
  if (options.workingDirectory) {
    const targetDir = path.resolve(options.workingDirectory);
    if (!pathExistsSync(targetDir)) {
      throw new Error(`Working directory does not exist: ${targetDir}`);
    }
    process.chdir(targetDir);
  }

  // 1. Load Configuration
  // The internal config loader might take slightly different or more structured options
  const effectiveConfig = await loadRunnerConfigInternal({
    configPath: options.configFile, // Use explicit configFile option
    cliOptions: {
      // Pass other relevant options as if they were CLI overrides
      scriptsDir: options.scriptsDir,
      tmpDir: options.tmpDir,
      // envFiles from options.envFiles would be merged by loadRunnerConfigInternal
    },
    defaultConfigValues: {
      // Base defaults
      envFiles: options.envFiles || [".env"], // Allow override of default envFiles
      defaultParams: options.defaultParams || {},
      excludePatterns: options.excludePatterns || [], // Include exclude patterns in config
    },
  });

  // 2. Load Environment Variables
  // `options.initialEnv` takes highest precedence programmatically
  const finalEnvironment = loadEnvironment(
    effectiveConfig.envFiles.map((f) => path.resolve(f)), // Use resolved envFiles from effectiveConfig
    options.initialEnv,
    effectiveConfig.defaultParams, // Pass defaultParams for interpolation
  );

  // 3. Create Script Executor Instance
  // The executor is stateless regarding which script to run, it just knows how to run one
  // given a path and a context.
  const scriptExecutor = createScriptExecutorInstance({
    consoleInterception: {
      enabled: options.consoleInterception?.enabled ?? true, // Enable by default
      includeLevel: options.consoleInterception?.includeLevel ?? false,
      preserveOriginal: options.consoleInterception?.preserveOriginal ?? false,
      useColors: options.consoleInterception?.useColors ?? true,
    },
  });

  const instance: ScriptRunnerInstance = {
    config: effectiveConfig,
    environment: finalEnvironment,

    // Method to list available scripts (respecting exclude patterns)
    listScripts: async (): Promise<string[]> => {
      const scriptPaths = await getScriptFiles(
        effectiveConfig.scriptsDir,
        effectiveConfig.excludePatterns,
      );

      // Return relative paths from scriptsDir for easier display/usage
      return scriptPaths.map((fullPath) =>
        path.relative(effectiveConfig.scriptsDir, fullPath),
      );
    },

    executeScript: async (
      scriptPath: string,
      executionParams?: Record<string, unknown>,
      customLogger?: (message: string) => void,
    ): Promise<ScriptExecutionResult> => {
      const params =
        executionParams || (Object.create(null) as Record<string, unknown>);
      const absoluteScriptPath = path.isAbsolute(scriptPath)
        ? scriptPath
        : path.resolve(effectiveConfig.scriptsDir, scriptPath);

      if (!pathExistsSync(absoluteScriptPath)) {
        const err = new Error(`Script file not found: ${absoluteScriptPath}`);
        emitter.emit("script:error", absoluteScriptPath, err);
        throw err;
      }

      emitter.emit("script:beforeExecute", absoluteScriptPath, params);

      // Build context for this specific execution
      const scriptSpecificEnv = {
        ...finalEnvironment,
        ...(params.env || {}),
      };
      const contextLog =
        customLogger ||
        ((msg: string) => {
          // Default log for programmatic execution if no custom logger
          console.log(
            `[ScriptRunner Lib] [${path.basename(absoluteScriptPath)}] ${msg}`,
          );
          emitter.emit("script:log", absoluteScriptPath, msg);
        });

      const context: ScriptContext = {
        env: scriptSpecificEnv,
        tmpDir: effectiveConfig.tmpDir,
        configPath: effectiveConfig.loadedConfigPath,
        log: contextLog,
        params:
          (params.params as Record<string, unknown>) ||
          ({} as Record<string, unknown>), // User-defined params for the script
        // Spread other potential context items defined in RunnerConfig or executionParams
        ...(effectiveConfig.defaultParams || {}), // Already interpolated when finalEnvironment was created
        ...(params.contextOverrides || {}), // Allow deep override of context
      };

      try {
        const result = await scriptExecutor.run(absoluteScriptPath, context);
        const typedResult = result as ScriptExecutionResult;
        emitter.emit("script:afterExecute", absoluteScriptPath, typedResult);
        return typedResult;
      } catch (error: unknown) {
        emitter.emit("script:error", absoluteScriptPath, error);
        throw error; // Re-throw for the caller to handle
      }
    },

    runTUI: async () => {
      emitter.emit("tui:beforeStart");
      // The TUI needs the base config to find scripts and display info.
      // It also needs the fully resolved initial environment.

      // Values for the TUI's config display panel
      const configDisplayValues = {
        scriptsDir: path.relative(process.cwd(), effectiveConfig.scriptsDir),
        tmpDir: path.relative(process.cwd(), effectiveConfig.tmpDir),
        envFiles: effectiveConfig.envFiles,
        excludePatterns: effectiveConfig.excludePatterns || [], // Add exclude patterns to display
        defaultParamsCount: Object.keys(effectiveConfig.defaultParams || {})
          .length,
        loadedConfigPath: effectiveConfig.loadedConfigPath
          ? path.basename(effectiveConfig.loadedConfigPath)
          : "Defaults / Not found",
      };

      // `runBlessedTUI` is the function from `src/tui/ui.ts`
      // It will internally use `getScriptFiles` (which uses `config.scriptsDir`)
      // and when a script is selected, it will build its own context or call
      // a method similar to `instance.executeScript` but tailored for TUI logging.
      // For simplicity, TUI can call its own internal execution logic that mirrors `executeScript`.
      await runBlessedTUI(
        effectiveConfig.loadedConfigPath,
        effectiveConfig.scriptsDir,
        effectiveConfig.tmpDir,
        finalEnvironment, // Pass the fully resolved environment
        configDisplayValues,
        emitter, // Pass emitter so TUI can also emit events or listen
      );
      emitter.emit("tui:afterEnd");
    },
    on: (eventName, listener) => {
      emitter.on(eventName, listener);
      return instance;
    },
    off: (eventName, listener) => {
      emitter.off(eventName, listener);
      return instance;
    },
    emit: (eventName, ...args) => emitter.emit(eventName, ...args),
  };

  return instance;
}

// Export additional types and utilities that might be useful for consumers
export type {
  RunnerConfig,
  ScriptContext,
  ScriptModule,
  ColoredConsole,
} from "./common/types/index.js";
