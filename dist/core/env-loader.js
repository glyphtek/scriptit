// src/core/env-loader.ts
import { existsSync as pathExistsSync } from "node:fs";
import dotenv from "dotenv";
import { logger } from "../common/logger/index.js";
import { interpolateEnvVars } from "../common/utils/index.js";
/**
 * Loads environment variables from .env files and merges with system environment
 * and any programmatically provided environment variables
 *
 * @param envFilePaths Array of full paths to env files to load
 * @param initialEnv Optional manually provided environment variables (highest precedence)
 * @param defaultParams Default parameters that may contain env var references to interpolate
 * @returns Combined environment with all variables
 */
export function loadEnvironment(envFilePaths, initialEnv = {}, defaultParams = {}) {
    logger.debug(`loadEnvironment: Loading from env files: ${envFilePaths.join(", ")}`);
    const loadedEnv = {};
    // Load from specified .env files
    for (const filePath of envFilePaths) {
        if (pathExistsSync(filePath)) {
            logger.debug(`loadEnvironment: Loading env file: ${filePath}`);
            const result = dotenv.config({
                path: filePath,
                override: true, // Later files take precedence
            });
            if (result.parsed) {
                Object.assign(loadedEnv, result.parsed);
                logger.debug(`loadEnvironment: Loaded ${Object.keys(result.parsed).length} variables from ${filePath}`);
            }
            else {
                logger.debug(`loadEnvironment: No variables parsed from ${filePath}`);
            }
        }
        else {
            logger.debug(`loadEnvironment: Env file does not exist: ${filePath}`);
        }
    }
    // System environment variables take precedence over .env files
    // initialEnv (programmatically provided) takes highest precedence
    const envWithSystemAndInitial = {
        ...loadedEnv,
        ...process.env,
        ...initialEnv,
    };
    // Interpolate env vars in default params using the complete environment
    const interpolatedParams = interpolateEnvVars(defaultParams, envWithSystemAndInitial);
    // Final environment with interpolated params
    const finalEnv = {
        ...envWithSystemAndInitial,
        ...(typeof interpolatedParams === "object" && interpolatedParams !== null
            ? interpolatedParams
            : {}), // Ensure it's an object before spreading
    };
    logger.debug(`loadEnvironment: Loaded ${Object.keys(finalEnv).length} total environment variables`);
    return finalEnv;
}
//# sourceMappingURL=env-loader.js.map