import { existsSync as pathExistsSync } from "node:fs";
import path from "node:path";
import { logger } from "../common/logger/index.js";
import { DEFAULT_CONFIG_FILE, DEFAULT_SCRIPTS_DIR, DEFAULT_TMP_DIR, } from "../common/utils/index.js";
export async function loadRunnerConfigInternal(options = {}) {
    const resolvedConfigPath = path.resolve(options.configPath || DEFAULT_CONFIG_FILE);
    logger.debug(`loadRunnerConfigInternal: Attempting to load config from: ${resolvedConfigPath}`);
    let userConfig = {};
    if (pathExistsSync(resolvedConfigPath)) {
        logger.debug(`loadRunnerConfigInternal: Config file found: ${resolvedConfigPath}`);
        try {
            const importedConfig = await import(resolvedConfigPath + `?v=${Date.now()}`);
            userConfig = importedConfig.default || importedConfig;
            logger.debug(`loadRunnerConfigInternal: User config loaded:`, userConfig);
            // Log exclude patterns if present
            if (userConfig.excludePatterns) {
                logger.debug(`loadRunnerConfigInternal: Exclude patterns found:`, userConfig.excludePatterns);
            }
            else {
                logger.debug(`loadRunnerConfigInternal: No exclude patterns defined in config`);
            }
        }
        catch (error) {
            logger.warn(`loadRunnerConfigInternal: Could not load config file ${resolvedConfigPath}:`, error);
        }
    }
    else {
        logger.debug(`loadRunnerConfigInternal: Config file NOT found: ${resolvedConfigPath}. Using defaults.`);
    }
    const defaultConfig = {
        scriptsDir: DEFAULT_SCRIPTS_DIR,
        tmpDir: DEFAULT_TMP_DIR,
        envFiles: [".env"],
        defaultParams: {},
        excludePatterns: [], // Default to empty array for exclude patterns
        ...(options.defaultConfigValues || {}),
    };
    // Merge user config with defaults
    const mergedConfig = { ...defaultConfig, ...userConfig };
    // CLI options take precedence over config file
    if (options.cliOptions) {
        if (options.cliOptions.scriptsDir) {
            mergedConfig.scriptsDir = options.cliOptions.scriptsDir;
        }
        if (options.cliOptions.tmpDir) {
            mergedConfig.tmpDir = options.cliOptions.tmpDir;
        }
        if (options.cliOptions.envFiles) {
            mergedConfig.envFiles = options.cliOptions.envFiles;
        }
    }
    // Resolve directories to absolute paths
    mergedConfig.scriptsDir = path.resolve(mergedConfig.scriptsDir);
    mergedConfig.tmpDir = path.resolve(mergedConfig.tmpDir);
    // Store where the config was loaded from
    mergedConfig.loadedConfigPath = pathExistsSync(resolvedConfigPath)
        ? resolvedConfigPath
        : undefined;
    logger.debug(`loadRunnerConfigInternal: Final effective config:`, mergedConfig);
    return mergedConfig;
}
//# sourceMappingURL=config-loader.js.map