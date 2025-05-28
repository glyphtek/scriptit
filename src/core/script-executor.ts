// src/core/script-executor.ts
import { existsSync as pathExistsSync } from "node:fs";
import path from "node:path";
import { logger } from "../common/logger/index.js";
import type { ScriptContext, ScriptModule } from "../common/types/index.js";

export type ScriptExecutorOptions = Record<string, never>;

export interface ScriptExecutor {
  run: (scriptPath: string, context: ScriptContext) => Promise<unknown>;
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
          context.log("Running tearUp()");
          tearUpResult = await scriptModule.tearUp(context);
          logger.debug(
            `Script executor: tearUp completed for ${path.basename(absoluteScriptPath)}`,
          );
        }

        // Execute main function (either default or execute)
        logger.debug(
          `Script executor: Running ${functionName} for ${path.basename(absoluteScriptPath)}`,
        );
        context.log(`Running ${functionName}()`);
        const executeResult = await executeFunction(context, tearUpResult);

        // Execute tearDown if it exists
        if (typeof scriptModule.tearDown === "function") {
          logger.debug(
            `Script executor: Running tearDown for ${path.basename(absoluteScriptPath)}`,
          );
          context.log("Running tearDown()");
          await scriptModule.tearDown(context, executeResult, tearUpResult);
          logger.debug(
            `Script executor: tearDown completed for ${path.basename(absoluteScriptPath)}`,
          );
        }

        return executeResult;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Script executor error: ${errorMessage}`);
        context.log(`Error: ${errorMessage}`);
        throw error;
      }
    },
  };
}
