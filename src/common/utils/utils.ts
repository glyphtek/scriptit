// src/common/utils/utils.ts
import { existsSync as pathExistsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import dotenv from "dotenv";
import { minimatch } from "minimatch";
import { logger } from "../logger/index.js";
import type { RunnerConfig } from "../types/index.js";

export const DEFAULT_SCRIPTS_DIR = "scripts";
export const DEFAULT_TMP_DIR = "tmp";
export const DEFAULT_CONFIG_FILE = "runner.config.js"; // or .ts if you transpile

export function interpolateEnvVars(
  value: unknown,
  env: Record<string, string | undefined>,
): unknown {
  if (typeof value === "string") {
    return value.replace(/\$\{([^}]+)\}/g, (_, varName) => env[varName] || "");
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateEnvVars(item, env));
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const key in value) {
      result[key] = interpolateEnvVars(
        (value as Record<string, unknown>)[key],
        env,
      );
    }
    return result;
  }
  return value;
}

export async function loadConfig(configPath?: string): Promise<RunnerConfig> {
  const resolvedConfigPath = path.resolve(configPath || DEFAULT_CONFIG_FILE);
  logger.debug(
    `loadConfig: Attempting to load config from: ${resolvedConfigPath}`,
  );
  let userConfig: Partial<RunnerConfig> = {};

  if (pathExistsSync(resolvedConfigPath)) {
    logger.debug(`loadConfig: Config file found: ${resolvedConfigPath}`);
    try {
      const importedConfig = await import(
        `${resolvedConfigPath}?v=${Date.now()}`
      );
      userConfig = importedConfig.default || importedConfig;
      logger.debug("loadConfig: User config loaded:", userConfig);

      // Log exclude patterns if present
      if (userConfig.excludePatterns) {
        logger.debug(
          "loadConfig: Exclude patterns found:",
          userConfig.excludePatterns,
        );
      } else {
        logger.debug("loadConfig: No exclude patterns defined in config");
      }
    } catch (error) {
      logger.warn(
        `loadConfig: Could not load config file ${resolvedConfigPath}:`,
        error,
      );
    }
  } else {
    logger.debug(
      `loadConfig: Config file NOT found: ${resolvedConfigPath}. Using defaults.`,
    );
  }

  const defaultConfig: RunnerConfig = {
    scriptsDir: DEFAULT_SCRIPTS_DIR,
    tmpDir: DEFAULT_TMP_DIR,
    envFiles: [".env"],
    defaultParams: {},
  };

  const mergedConfig = { ...defaultConfig, ...userConfig };

  // Resolve directories to absolute paths AFTER merging
  logger.debug(
    `loadConfig: Merged scriptsDir before resolve: ${mergedConfig.scriptsDir}`,
  );
  mergedConfig.scriptsDir = path.resolve(mergedConfig.scriptsDir);
  logger.debug(
    `loadConfig: Merged tmpDir before resolve: ${mergedConfig.tmpDir}`,
  );
  mergedConfig.tmpDir = path.resolve(mergedConfig.tmpDir);

  logger.debug(
    `loadConfig: Final effective scriptsDir: ${mergedConfig.scriptsDir}`,
  );
  logger.debug(`loadConfig: Final effective tmpDir: ${mergedConfig.tmpDir}`);

  return mergedConfig;
}

export function loadEnvironmentVariables(
  envFiles: string[],
): Record<string, string | undefined> {
  const loadedEnv: Record<string, string | undefined> = {};

  // Load from specified .env files
  for (const file of envFiles) {
    if (pathExistsSync(path.resolve(file))) {
      const result = dotenv.config({
        path: path.resolve(file),
        override: true,
      }); // override ensures later files take precedence
      if (result.parsed) {
        Object.assign(loadedEnv, result.parsed);
      }
    }
  }

  // System environment variables take highest precedence over .env files
  return { ...loadedEnv, ...process.env };
}

/**
 * Recursively find all .js and .ts files in a directory.
 * @param dirPath The directory to search.
 * @param baseDir The original base directory for scripts (to create relative paths for display).
 * @param currentRelativePath The current relative path from the baseDir (used in recursion).
 * @param excludePatterns Optional array of glob patterns to exclude.
 * @returns A promise that resolves to an array of full file paths.
 */
async function findScriptFilesRecursive(
  dirPath: string,
  baseDir: string,
  currentRelativePath = "",
  excludePatterns: string[] = [],
): Promise<string[]> {
  let scriptFiles: string[] = [];
  try {
    if (!pathExistsSync(dirPath)) {
      logger.error(
        `findScriptFilesRecursive: Directory DOES NOT EXIST: ${dirPath}`,
      );
      return [];
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullEntryPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(currentRelativePath, entry.name);

      // Check if this entry should be excluded
      const relativePathFromBase = path.relative(baseDir, fullEntryPath);

      const shouldExclude = excludePatterns.some((pattern) => {
        const matches = minimatch(relativePathFromBase, pattern, {
          matchBase: true,
          dot: true,
        });
        if (matches) {
          logger.debug(
            `Excluded by pattern "${pattern}": ${relativePathFromBase}`,
          );
        }
        return matches;
      });

      if (shouldExclude) {
        logger.debug(
          `Excluded file/directory: ${relativePathFromBase} (matched exclude pattern)`,
        );
        continue; // Skip this entry
      }

      if (entry.isDirectory()) {
        // Recursively search in subdirectories
        scriptFiles = scriptFiles.concat(
          await findScriptFilesRecursive(
            fullEntryPath,
            baseDir,
            entryRelativePath,
            excludePatterns,
          ),
        );
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
      ) {
        // Add script file (store its full absolute path)
        scriptFiles.push(fullEntryPath);
      }
    }
  } catch (error) {
    logger.warn(`Error reading directory ${dirPath}:`, error);
  }
  return scriptFiles;
}

export async function getScriptFiles(
  scriptsBaseDir: string,
  excludePatterns: string[] = [],
): Promise<string[]> {
  logger.debug(
    `getScriptFiles: Called with scriptsBaseDir: "${scriptsBaseDir}"`,
  );

  if (excludePatterns.length > 0) {
    logger.debug(
      `getScriptFiles: Using exclude patterns: ${JSON.stringify(excludePatterns)}`,
    );
  }

  const allScriptFullPaths = await findScriptFilesRecursive(
    scriptsBaseDir,
    scriptsBaseDir,
    "",
    excludePatterns,
  );

  logger.debug(
    "getScriptFiles: Found script full paths (recursive):",
    allScriptFullPaths,
  );

  return allScriptFullPaths;
}
