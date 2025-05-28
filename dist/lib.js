// src/lib.ts (or src/index.ts - your library's main export file)
import EventEmitter from "node:events"; // For the 'on' method
import { existsSync as pathExistsSync } from "node:fs";
import path from "node:path";
import { getScriptFiles } from "./common/utils/index.js"; // Import getScriptFiles for script discovery
import { // Type for the executor
createScriptExecutorInstance, // To get an executor instance
loadEnvironment, loadRunnerConfigInternal, // Renamed to avoid conflict if you also export a user-facing loadConfig
 } from "./core/index.js";
import { runBlessedTUI } from "./ui/index.js"; // Import from ui/index.ts
// Default paths if not specified
const DEFAULT_CONFIG_FILE_PATH = "runner.config.js";
export async function createScriptRunner(options = {}) {
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
    const finalEnvironment = loadEnvironment(effectiveConfig.envFiles.map((f) => path.resolve(f)), // Use resolved envFiles from effectiveConfig
    options.initialEnv, effectiveConfig.defaultParams);
    // 3. Create Script Executor Instance
    // The executor is stateless regarding which script to run, it just knows how to run one
    // given a path and a context.
    const scriptExecutor = createScriptExecutorInstance({
    // Potentially pass global things the executor might need,
    // but mostly context is built per-execution.
    });
    const instance = {
        config: effectiveConfig,
        environment: finalEnvironment,
        // Method to list available scripts (respecting exclude patterns)
        listScripts: async () => {
            const scriptPaths = await getScriptFiles(effectiveConfig.scriptsDir, effectiveConfig.excludePatterns);
            // Return relative paths from scriptsDir for easier display/usage
            return scriptPaths.map((fullPath) => path.relative(effectiveConfig.scriptsDir, fullPath));
        },
        executeScript: async (scriptPath, executionParams, customLogger) => {
            const params = executionParams || Object.create(null);
            const absoluteScriptPath = path.isAbsolute(scriptPath)
                ? scriptPath
                : path.resolve(effectiveConfig.scriptsDir, scriptPath);
            if (!pathExistsSync(absoluteScriptPath)) {
                const err = new Error(`Script file not found: ${absoluteScriptPath}`);
                emitter.emit("error", "executeScript", err, absoluteScriptPath);
                throw err;
            }
            emitter.emit("script:beforeExecute", absoluteScriptPath, params);
            // Build context for this specific execution
            const scriptSpecificEnv = {
                ...finalEnvironment,
                ...(params.env || {}),
            };
            const contextLog = customLogger ||
                ((msg) => {
                    // Default log for programmatic execution if no custom logger
                    console.log(`[ScriptRunner Lib] [${path.basename(absoluteScriptPath)}] ${msg}`);
                    emitter.emit("script:log", absoluteScriptPath, msg);
                });
            const context = {
                env: scriptSpecificEnv,
                tmpDir: effectiveConfig.tmpDir,
                configPath: effectiveConfig.loadedConfigPath,
                log: contextLog,
                params: params.params || {}, // User-defined params for the script
                // Spread other potential context items defined in RunnerConfig or executionParams
                ...(effectiveConfig.defaultParams || {}), // Already interpolated when finalEnvironment was created
                ...(params.contextOverrides || {}), // Allow deep override of context
            };
            try {
                const result = await scriptExecutor.run(absoluteScriptPath, context);
                emitter.emit("script:afterExecute", absoluteScriptPath, result);
                return result;
            }
            catch (error) {
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
            await runBlessedTUI(effectiveConfig.loadedConfigPath, effectiveConfig.scriptsDir, effectiveConfig.tmpDir, finalEnvironment, // Pass the fully resolved environment
            configDisplayValues, emitter);
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
//# sourceMappingURL=lib.js.map