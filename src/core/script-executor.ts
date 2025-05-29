// src/core/script-executor.ts
import { existsSync as pathExistsSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { logger } from "../common/logger/index.js";
import type { ScriptContext, ScriptModule } from "../common/types/index.js";

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

/**
 * Safe string conversion that avoids circular references
 */
function safeStringify(arg: unknown): string {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
  if (typeof arg === 'function') return '[Function]';
  if (typeof arg === 'symbol') return '[Symbol]';
  if (typeof arg === 'bigint') return `${String(arg)}n`;
  
  // For objects, be very conservative to avoid circular references
  if (typeof arg === 'object') {
    if (arg instanceof Error) {
      return `Error: ${arg.message}`;
    }
    if (arg instanceof Date) {
      return arg.toISOString();
    }
    if (Array.isArray(arg)) {
      return `[Array(${arg.length})]`;
    }
    return '[Object]';
  }
  
  return '[Unknown]';
}

/**
 * Creates a colored console-like object that redirects to the log function
 */
function createColoredConsole(logFunction: (message: string) => void, useColors = true) {
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
        const message = args.map(arg => safeStringify(arg)).join(' ');
        const coloredMessage = colorFunctions[level](message);
        logFunction(coloredMessage);
      } catch (error) {
        logFunction(`[${level.toUpperCase()}] <error>`);
      }
    };
  };

  return {
    log: createMethod('log'),
    error: createMethod('error'),
    warn: createMethod('warn'),
    info: createMethod('info'),
    debug: createMethod('debug'),
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
        const coloredConsole = createColoredConsole(logFunc, options.consoleInterception.useColors);
        
        // Add colored console to context instead of replacing global console
        enhancedContext = {
          ...context,
          console: coloredConsole,
        };
        
        logger.debug(`Console interception enabled for ${path.basename(absoluteScriptPath)}`);
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
        const executeResult = await executeFunction(enhancedContext, tearUpResult);

        // Execute tearDown if it exists
        if (typeof scriptModule.tearDown === "function") {
          logger.debug(
            `Script executor: Running tearDown for ${path.basename(absoluteScriptPath)}`,
          );
          enhancedContext.log("Running tearDown()");
          await scriptModule.tearDown(enhancedContext, executeResult, tearUpResult);
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