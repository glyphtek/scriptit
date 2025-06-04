// src/core/script-executor.ts
import { existsSync as pathExistsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { logger } from "../common/logger/index.js";
import type {
  RunnerConfig,
  ScriptContext,
  ScriptModule,
  VariableDefinition,
} from "../common/types/index.js";
import {
  interpolateEnvVars,
  loadEnvironmentVariables,
  normalizeVariableDefinitions,
} from "../common/utils/index.js";

export interface ScriptExecutorOptions {
  consoleInterception?: {
    enabled: boolean;
    logFunction?: (message: string) => void;
    includeLevel?: boolean;
    preserveOriginal?: boolean;
    useColors?: boolean;
  };
}

export interface ScriptExecutor {
  run: (scriptPath: string, context: ScriptContext) => Promise<unknown>;
}

export interface EnvironmentPrompter {
  promptForVariables(
    variables: VariableDefinition[],
    existingEnv: Record<string, string | undefined>,
  ): Promise<Record<string, string>>;
}

export interface ScriptExecutionOptions {
  scriptPath: string;
  config: RunnerConfig;
  cliProvidedEnv?: Record<string, string | undefined>;
  cliEnvPrompts?: string[];
  prompter?: EnvironmentPrompter;
  logger?: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
}

/**
 * Safe string conversion that avoids circular references
 */
function safeStringify(arg: unknown): string {
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  if (typeof arg === "string") return arg;
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
  if (typeof arg === "function") return "[Function]";
  if (typeof arg === "symbol") return "[Symbol]";
  if (typeof arg === "bigint") return `${String(arg)}n`;

  // For objects, be very conservative to avoid circular references
  if (typeof arg === "object") {
    if (arg instanceof Error) {
      return `Error: ${arg.message}`;
    }
    if (arg instanceof Date) {
      return arg.toISOString();
    }
    if (Array.isArray(arg)) {
      return `[Array(${arg.length})]`;
    }
    return "[Object]";
  }

  return "[Unknown]";
}

/**
 * Creates a colored console-like object that redirects to the log function
 */
function createColoredConsole(
  logFunction: (message: string) => void,
  useColors = true,
) {
  const colorFunctions = {
    log: useColors ? chalk.white : (text: string) => text,
    error: useColors ? chalk.red : (text: string) => text,
    warn: useColors ? chalk.yellow : (text: string) => text,
    info: useColors ? chalk.blue : (text: string) => text,
    debug: useColors ? chalk.gray : (text: string) => text,
  };

  const createMethod = (level: keyof typeof colorFunctions) => {
    return (...args: unknown[]) => {
      try {
        // Use safe string conversion to avoid circular references
        const message = args.map((arg) => safeStringify(arg)).join(" ");
        const coloredMessage = colorFunctions[level](message);
        logFunction(coloredMessage);
      } catch (error) {
        logFunction(`[${level.toUpperCase()}] <error>`);
      }
    };
  };

  return {
    log: createMethod("log"),
    error: createMethod("error"),
    warn: createMethod("warn"),
    info: createMethod("info"),
    debug: createMethod("debug"),
  };
}

/**
 * Creates a script executor instance that can run scripts
 * with proper lifecycle management (tearUp, execute, tearDown)
 */
export function createScriptExecutorInstance(
  options: ScriptExecutorOptions = {},
): ScriptExecutor {
  return {
    run: async (
      scriptPath: string,
      context: ScriptContext,
    ): Promise<unknown> => {
      const absoluteScriptPath = path.isAbsolute(scriptPath)
        ? scriptPath
        : path.resolve(scriptPath);

      if (!pathExistsSync(absoluteScriptPath)) {
        throw new Error(`Script file not found: ${absoluteScriptPath}`);
      }

      logger.debug(
        `Script executor: Loading script ${path.basename(absoluteScriptPath)}`,
      );

      // Create enhanced context with colored console if interception is enabled
      let enhancedContext = context;
      if (options.consoleInterception?.enabled) {
        const logFunc = options.consoleInterception.logFunction || context.log;
        const coloredConsole = createColoredConsole(
          logFunc,
          options.consoleInterception.useColors,
        );

        // Add colored console to context instead of replacing global console
        enhancedContext = {
          ...context,
          console: coloredConsole,
        };

        logger.debug(
          `Console interception enabled for ${path.basename(absoluteScriptPath)}`,
        );
      }

      try {
        const scriptModule = (await import(
          `file://${absoluteScriptPath}?v=${Date.now()}`
        )) as ScriptModule;

        // Determine which function to use for execution
        // Priority: default > execute (to support lambda functions and other scenarios)
        let executeFunction: (
          context: ScriptContext,
          tearUpResult?: unknown,
        ) => Promise<unknown> | unknown;
        let functionName: string;

        if (typeof scriptModule.default === "function") {
          executeFunction = scriptModule.default;
          functionName = "default";
        } else if (typeof scriptModule.execute === "function") {
          executeFunction = scriptModule.execute;
          functionName = "execute";
        } else {
          throw new Error(
            `Script ${absoluteScriptPath} must export either an 'execute' function or a 'default' function.`,
          );
        }

        // Execute tearUp if it exists
        let tearUpResult: unknown;
        if (typeof scriptModule.tearUp === "function") {
          logger.debug(
            `Script executor: Running tearUp for ${path.basename(absoluteScriptPath)}`,
          );
          enhancedContext.log("Running tearUp()");
          tearUpResult = await scriptModule.tearUp(enhancedContext);
          logger.debug(
            `Script executor: tearUp completed for ${path.basename(absoluteScriptPath)}`,
          );
        }

        // Execute main function (either default or execute)
        logger.debug(
          `Script executor: Running ${functionName} for ${path.basename(absoluteScriptPath)}`,
        );
        enhancedContext.log(`Running ${functionName}()`);
        const executeResult = await executeFunction(
          enhancedContext,
          tearUpResult,
        );

        // Execute tearDown if it exists
        if (typeof scriptModule.tearDown === "function") {
          logger.debug(
            `Script executor: Running tearDown for ${path.basename(absoluteScriptPath)}`,
          );
          enhancedContext.log("Running tearDown()");
          await scriptModule.tearDown(
            enhancedContext,
            executeResult,
            tearUpResult,
          );
          logger.debug(
            `Script executor: tearDown completed for ${path.basename(absoluteScriptPath)}`,
          );
        }

        return executeResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Script executor error: ${errorMessage}`);
        enhancedContext.log(`Error: ${errorMessage}`);
        throw error;
      }
    },
  };
}

/**
 * High-level script execution function that handles environment variable prompting
 * and script execution. Can be used by both CLI and TUI with different prompters.
 */
export async function executeScriptWithEnvironment(
  options: ScriptExecutionOptions,
): Promise<unknown> {
  const {
    scriptPath,
    config,
    cliProvidedEnv = {},
    cliEnvPrompts = [],
    prompter,
    logger: customLogger,
  } = options;

  const log = customLogger || {
    info: (msg: string) => console.log(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string) => console.error(msg),
  };

  const absoluteScriptPath = path.resolve(scriptPath);
  if (!pathExistsSync(absoluteScriptPath)) {
    throw new Error(`Script file not found at ${absoluteScriptPath}`);
  }

  // Ensure tmpDir exists from config
  if (!pathExistsSync(config.tmpDir)) {
    try {
      await fs.mkdir(config.tmpDir, { recursive: true });
      log.info(`Created temporary directory: ${config.tmpDir}`);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Error creating temporary directory ${config.tmpDir}: ${errorMessage}`,
      );
    }
  }

  // Load script module to check for variable definitions
  let scriptVariables: VariableDefinition[] = [];
  try {
    const scriptModule: ScriptModule = await import(
      `file://${absoluteScriptPath}?v=${Date.now()}`
    );

    if (scriptModule.variables) {
      scriptVariables = normalizeVariableDefinitions(scriptModule.variables);
    }
  } catch (error: unknown) {
    // If we can't load the script for variable checking, continue without prompting
    // The actual error will be caught during execution
    log.warn(
      `Could not pre-load script for variable checking: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // Combine CLI env prompts with script's declared variables
  const allVariables = [
    ...normalizeVariableDefinitions(cliEnvPrompts),
    ...scriptVariables,
  ];

  // Remove duplicates (CLI takes precedence)
  const uniqueVariables = allVariables.filter(
    (variable, index, array) =>
      array.findIndex((v) => v.name === variable.name) === index,
  );

  // Load base environment
  const baseEnv = loadEnvironmentVariables(
    config.envFiles.map((f) => path.resolve(f)),
  );
  const interpolatedDefaultParams = config.defaultParams
    ? interpolateEnvVars(config.defaultParams, baseEnv)
    : {};

  // Initial full environment (before prompting)
  const initialFullEnv = {
    ...baseEnv,
    ...(typeof interpolatedDefaultParams === "object" &&
    interpolatedDefaultParams !== null
      ? interpolatedDefaultParams
      : {}),
    ...cliProvidedEnv,
  };

  // Prompt for any missing variables
  let promptedVars: Record<string, string> = {};
  if (uniqueVariables.length > 0 && prompter) {
    promptedVars = await prompter.promptForVariables(
      uniqueVariables,
      initialFullEnv,
    );

    // Set prompted variables in process.env so they're available to the script
    for (const [key, value] of Object.entries(promptedVars)) {
      process.env[key] = value;
    }
  }

  // CLI-provided env vars take precedence over config default params, which take precedence over .env files
  const fullEnv = {
    ...baseEnv,
    ...(typeof interpolatedDefaultParams === "object" &&
    interpolatedDefaultParams !== null
      ? interpolatedDefaultParams
      : {}),
    ...cliProvidedEnv,
    ...promptedVars, // Add prompted variables
  };

  log.info(`Running script: ${path.basename(absoluteScriptPath)}`);
  log.info(`Config file used: ${config.loadedConfigPath || "Defaults"}`);
  log.info(`Temp directory: ${config.tmpDir}`);
  log.info(`Env files considered: ${config.envFiles.join(", ")}`);

  // Show prompted variables (without values for security)
  if (Object.keys(promptedVars).length > 0) {
    log.info(`Prompted variables: ${Object.keys(promptedVars).join(", ")}`);
  }

  // Create script executor with console interception enabled
  const scriptExecutor = createScriptExecutorInstance({
    consoleInterception: {
      enabled: true, // Enable colored console interception
      includeLevel: false, // Don't include log level prefix for cleaner output
      preserveOriginal: false, // Don't call original console methods to avoid duplication
      useColors: true, // Enable colors for different log levels
    },
  });

  const context: ScriptContext = {
    env: fullEnv,
    tmpDir: config.tmpDir,
    configPath: config.loadedConfigPath,
    params: {},
    log: (msg: string) => log.info(`[SCRIPT OUTPUT] ${msg}`),
  };

  const result = await scriptExecutor.run(absoluteScriptPath, context);
  log.info(`Script ${path.basename(absoluteScriptPath)} finished successfully`);

  if (result !== undefined) {
    log.info(
      `Script result: ${typeof result === "object" ? JSON.stringify(result) : result}`,
    );
  }

  return result;
}
