import { existsSync as pathExistsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
// src/cli.ts
import { Command, Option } from "commander";
// Use a simpler approach with regular imports
import { logger } from "./common/logger/index.js";
import { DEFAULT_CONFIG_FILE, DEFAULT_SCRIPTS_DIR, DEFAULT_TMP_DIR, getScriptFiles, interpolateEnvVars, loadConfig, loadEnvironmentVariables, } from "./common/utils/index.js";
import { runBlessedTUI as runTUI } from "./ui/index.js";
// Continue with CLI implementation
const program = new Command();
program
    .name("scriptit")
    .description("ScriptIt - A powerful CLI and library for running scripts with environment management, TUI, and support for lambda functions")
    .version("0.3.0");
program
    .command("init")
    .description("Initialize a new script runner project structure.")
    .option("-s, --scripts-dir <dir>", "Directory for scripts", DEFAULT_SCRIPTS_DIR)
    .option("-t, --tmp-dir <dir>", "Directory for temporary files", DEFAULT_TMP_DIR)
    .option("-f, --force", "Overwrite existing files and directories if they exist")
    .action(async (options) => {
    const scriptsDir = path.resolve(options.scriptsDir);
    const tmpDir = path.resolve(options.tmpDir);
    const configFilePath = path.resolve(DEFAULT_CONFIG_FILE);
    const gitignorePath = path.resolve(".gitignore");
    console.log(chalk.blue("Initializing script runner project..."));
    const dirsToCreate = [scriptsDir, tmpDir];
    for (const dir of dirsToCreate) {
        if (pathExistsSync(dir) && !options.force) {
            console.warn(chalk.yellow(`Directory ${dir} already exists. Use --force to overwrite.`));
        }
        else {
            await fs.mkdir(dir, { recursive: true });
            console.log(chalk.green(`Created directory: ${dir}`));
        }
    }
    // Create example runner.config.js
    if (!pathExistsSync(configFilePath) || options.force) {
        const runnerConfigContent = `
// runner.config.js
// You can use CommonJS (module.exports) or ES Modules (export default)
export default {
  scriptsDir: '${path.relative(process.cwd(), scriptsDir) || "."}', // relative path from project root
  tmpDir: '${path.relative(process.cwd(), tmpDir) || "."}',         // relative path from project root
  envFiles: [
    '.env',          // General environment variables
    '.env.local',    // Local overrides (gitignored)
    // '.env.production' // Example for specific environments
  ],
  defaultParams: { // These will be available in the script context
    // myGlobalParam: "hello world",
    // apiToken: "\${API_TOKEN_FROM_ENV}" // Example of env var interpolation
  }
};
`;
        await fs.writeFile(configFilePath, runnerConfigContent.trim());
        console.log(chalk.green(`Created config file: ${configFilePath}`));
    }
    else {
        console.warn(chalk.yellow(`Config file ${configFilePath} already exists. Use --force to overwrite.`));
    }
    // Create example .env file
    const exampleEnvPath = path.resolve(".env.example");
    if (!pathExistsSync(exampleEnvPath) || options.force) {
        await fs.writeFile(exampleEnvPath, 'MY_VARIABLE="Hello from .env"\nAPI_TOKEN_FROM_ENV="your_secret_token_here"\n');
        console.log(chalk.green(`Created example env file: ${exampleEnvPath} (copy to .env and customize)`));
    }
    if (!pathExistsSync(path.resolve(".env"))) {
        await fs.copyFile(exampleEnvPath, path.resolve(".env"));
        console.log(chalk.green(`Copied .env.example to .env`));
    }
    // Create example script
    const exampleScriptPath = path.join(scriptsDir, "example.ts");
    if (!pathExistsSync(exampleScriptPath) || options.force) {
        const exampleScriptContent = `
// ${path.join(options.scriptsDir, "example.ts")}
// This is an example script for ScriptIt

/**
 * @description An example script that demonstrates the tearUp, execute, and tearDown pipeline.
 */
export const description = "Logs messages and environment variables.";

/**
 * @param {import('../../src/common/types').ScriptContext} context
 */
export async function tearUp(context) {
  context.log('TearUp: Preparing something...');
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async work
  const data = { prepared: true, timestamp: Date.now() };
  context.log(\`TearUp: Done. Temp dir: \${context.tmpDir}\`);
  return data;
}

/**
 * @param {import('../../src/common/types').ScriptContext} context
 * @param {any} tearUpResult The result from tearUp
 */
export async function execute(context, tearUpResult) {
  context.log('Execute: Running main logic...');
  context.log(\`  Received from tearUp: \${JSON.stringify(tearUpResult)}\`);
  context.log(\`  MY_VARIABLE from env: \${context.env.MY_VARIABLE}\`);
  context.log(\`  Config path: \${context.configPath}\`);
  
  // Example: writing to tmpDir
  const tempFilePath = context.tmpDir + '/example_output.txt';
  await fs.writeFile(tempFilePath, \`Output from example script at \${new Date().toISOString()}\\n\`);
  context.log(\`  Wrote to \${tempFilePath}\`);

  if (context.env.FAIL_EXAMPLE === 'true') {
    throw new Error("Intentional failure triggered by FAIL_EXAMPLE env var.");
  }

  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work
  context.log('Execute: Main logic complete.');
  return { success: true, data: "Execution finished" };
}

/**
 * @param {import('../../src/common/types').ScriptContext} context
 * @param {any} executeResult The result from execute
 * @param {any} tearUpResult The result from tearUp
 */
export async function tearDown(context, executeResult, tearUpResult) {
  context.log('TearDown: Cleaning up...');
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async work
  context.log(\`  Received from execute: \${JSON.stringify(executeResult)}\`);
  context.log(\`  TearUp data during teardown: \${JSON.stringify(tearUpResult)}\`);
  context.log('TearDown: Cleanup complete.');
}
`;
        await fs.writeFile(exampleScriptPath, exampleScriptContent.trim());
        console.log(chalk.green(`Created example script: ${exampleScriptPath}`));
        // Create a lambda-style example
        const lambdaExamplePath = path.join(options.scriptsDir, "lambda-example.ts");
        const lambdaExampleContent = `
// ${path.join(options.scriptsDir, "lambda-example.ts")}
// This demonstrates using a default export (lambda-style function)

export const description = "Lambda-style script using default export";

/**
 * Default export function - ScriptIt will use this automatically
 * Perfect for existing lambda functions or simple scripts
 */
export default async function(context) {
  context.log('Lambda-style execution starting...');
  context.log(\`Environment: \${context.env.NODE_ENV || 'development'}\`);
  context.log(\`Working directory: \${process.cwd()}\`);
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const result = {
    timestamp: new Date().toISOString(),
    success: true,
    message: "Lambda execution completed"
  };
  
  context.log(\`Result: \${JSON.stringify(result)}\`);
  return result;
}
`;
        await fs.writeFile(lambdaExamplePath, lambdaExampleContent.trim());
        console.log(chalk.green(`Created lambda example: ${lambdaExamplePath}`));
    }
    else {
        console.warn(chalk.yellow(`Example script ${exampleScriptPath} already exists. Use --force to overwrite.`));
    }
    // Add tmpDir to .gitignore
    let gitignoreContent = "";
    if (pathExistsSync(gitignorePath)) {
        gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    }
    const tmpDirRelative = path.relative(process.cwd(), tmpDir) || ".";
    const tmpDirGitIgnoreEntry = `${tmpDirRelative.replace(/\\/g, "/")}/`; // Ensure forward slashes and trailing slash
    if (!gitignoreContent.includes(tmpDirGitIgnoreEntry)) {
        gitignoreContent += `\n# Temporary files for ScriptIt\n${tmpDirGitIgnoreEntry}\n`;
        await fs.writeFile(gitignorePath, gitignoreContent);
        console.log(chalk.green(`Added '${tmpDirGitIgnoreEntry}' to .gitignore`));
    }
    else {
        console.log(chalk.blue(`'${tmpDirGitIgnoreEntry}' already in .gitignore`));
    }
    // Add .env.local to .gitignore
    const envLocalGitIgnoreEntry = ".env.local";
    if (!gitignoreContent.includes(envLocalGitIgnoreEntry)) {
        gitignoreContent += `\n# Local environment variables (gitignored)\n${envLocalGitIgnoreEntry}\n`;
        await fs.writeFile(gitignorePath, gitignoreContent.trim()); // trim to avoid multiple newlines if added multiple times
        console.log(chalk.green(`Added '${envLocalGitIgnoreEntry}' to .gitignore`));
    }
    else {
        console.log(chalk.blue(`'${envLocalGitIgnoreEntry}' already in .gitignore`));
    }
    console.log(chalk.bgGreen.black("\nInitialization complete!"));
    console.log(chalk.yellow("To get started:"));
    console.log(chalk.yellow(`1. (Optional) Customize '${DEFAULT_CONFIG_FILE}'`));
    console.log(chalk.yellow(`2. (Optional) Create/edit '.env' file with your environment variables.`));
    console.log(chalk.yellow(`3. Add your scripts to the '${options.scriptsDir}' directory.`));
    console.log(chalk.yellow(`4. Run '${program.name()} run' or just '${program.name()}' to start.`));
});
program
    .option("-d, --debug", "Run in debug mode with verbose logging")
    .option("--pwd <dir>", "Set working directory for script execution (all relative paths resolve from here)")
    .hook("preAction", (thisCommand, actionCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
        process.env.SCRIPTIT_DEBUG = "true";
        console.log(chalk.blue("Debug mode enabled"));
    }
    if (opts.pwd) {
        const targetDir = path.resolve(opts.pwd);
        if (!pathExistsSync(targetDir)) {
            console.error(chalk.red(`Error: Directory does not exist: ${targetDir}`));
            process.exit(1);
        }
        console.log(chalk.gray(`Changing working directory to: ${targetDir}`));
        process.chdir(targetDir);
    }
});
// Function to execute a single script (will be used by 'exec' command and potentially by TUI later if refactored)
async function executeScriptFile(scriptPath, config, cliProvidedEnv = {}) {
    const absoluteScriptPath = path.resolve(scriptPath);
    if (!pathExistsSync(absoluteScriptPath)) {
        logger.error(`Script file not found at ${absoluteScriptPath}`);
        process.exit(1);
    }
    // Ensure tmpDir exists from config
    if (!pathExistsSync(config.tmpDir)) {
        try {
            await fs.mkdir(config.tmpDir, { recursive: true });
            console.log(chalk.gray(`Created temporary directory: ${config.tmpDir}`));
        }
        catch (e) {
            console.error(chalk.red(`Error creating temporary directory ${config.tmpDir}: ${e.message}`));
            process.exit(1);
        }
    }
    const baseEnv = loadEnvironmentVariables(config.envFiles.map((f) => path.resolve(f)));
    const interpolatedDefaultParams = config.defaultParams
        ? interpolateEnvVars(config.defaultParams, baseEnv)
        : {};
    // CLI-provided env vars take precedence over config default params, which take precedence over .env files
    const fullEnv = {
        ...baseEnv,
        ...(typeof interpolatedDefaultParams === 'object' && interpolatedDefaultParams !== null ? interpolatedDefaultParams : {}),
        ...cliProvidedEnv,
    };
    logger.cliOutput(chalk.cyan(`--- Running script: ${path.basename(absoluteScriptPath)} ---`)); // Use chalk directly for user-facing output styling
    logger.cliOutput(chalk.gray(`  Config file used: ${config.loadedConfigPath || "Defaults"}`));
    logger.cliOutput(chalk.gray(`  Temp directory: ${config.tmpDir}`));
    logger.cliOutput(chalk.gray(`  Env files considered: ${config.envFiles.join(", ")}`));
    try {
        const scriptModule = (await import(`file://${absoluteScriptPath}?v=${Date.now()}`));
        // Determine which function to use for execution
        // Priority: default > execute (to support lambda functions and other scenarios)
        let executeFunction;
        let functionName;
        if (typeof scriptModule.default === "function") {
            executeFunction = scriptModule.default;
            functionName = "default";
        }
        else if (typeof scriptModule.execute === "function") {
            executeFunction = scriptModule.execute;
            functionName = "execute";
        }
        else {
            throw new Error(`Script ${absoluteScriptPath} must export either an 'execute' function or a 'default' function.`);
        }
        const context = {
            env: fullEnv,
            tmpDir: config.tmpDir,
            configPath: config.loadedConfigPath, // Add loadedConfigPath to RunnerConfig if needed
            params: {}, // Add missing params property
            log: (msg) => console.log(chalk.blueBright(`  [SCRIPT OUTPUT] ${msg}`)), // Log to console
            // Pass other default params from config if needed, they are already in fullEnv
            // ...config.defaultParams // already interpolated into fullEnv
        };
        let tearUpResult;
        if (typeof scriptModule.tearUp === "function") {
            console.log(chalk.blue("  -> tearUp()"));
            tearUpResult = await scriptModule.tearUp(context);
            console.log(chalk.gray(`     tearUp result: ${typeof tearUpResult === "object" ? JSON.stringify(tearUpResult) : tearUpResult}`));
        }
        console.log(chalk.blue(`  -> ${functionName}()`));
        const executeResult = await executeFunction(context, tearUpResult);
        console.log(chalk.gray(`     ${functionName} result: ${typeof executeResult === "object" ? JSON.stringify(executeResult) : executeResult}`));
        if (typeof scriptModule.tearDown === "function") {
            console.log(chalk.blue("  -> tearDown()"));
            await scriptModule.tearDown(context, executeResult, tearUpResult);
        }
        console.log(chalk.green(`--- Script ${path.basename(absoluteScriptPath)} finished successfully ---\n`));
        process.exit(0); // Explicit success exit
    }
    catch (error) {
        console.error(chalk.red(`--- Error running script ${path.basename(absoluteScriptPath)} ---`));
        console.error(chalk.red(error.stack || error.message));
        console.error(chalk.red(`--- Script ${path.basename(absoluteScriptPath)} failed ---\n`));
        process.exit(1); // Explicit failure exit
    }
}
program
    .command("exec <scriptPath>")
    .description("Execute a single script file directly.")
    .option("-c, --config <path>", "Path to runner configuration file")
    // Allow passing arbitrary env variables like VAR1=value1 VAR2=value2
    .addOption(new Option("-e, --env <vars...>", "Set environment variables (e.g., NAME=Bun X=Y)"))
    .action(async (scriptPath, options) => {
    // Load configuration (tmpDir, envFiles, defaultParams will be used from here)
    const config = await loadConfig(options.config);
    // Store where the config was loaded from for context
    config.loadedConfigPath =
        options.config ||
            (pathExistsSync(DEFAULT_CONFIG_FILE) ? DEFAULT_CONFIG_FILE : undefined);
    // Process --env options
    const cliEnvVars = {};
    if (options.env && Array.isArray(options.env)) {
        for (const envVar of options.env) {
            const [key, ...valueParts] = envVar.split("=");
            if (key && valueParts.length > 0) {
                cliEnvVars[key.trim()] = valueParts.join("=").trim();
            }
            else {
                console.warn(chalk.yellow(`Skipping malformed --env argument: ${envVar}`));
            }
        }
    }
    await executeScriptFile(scriptPath, config, cliEnvVars);
});
program
    .command("run", { isDefault: true })
    .description("Run scripts using the interactive UI.")
    .option("-c, --config <path>", "Path to runner configuration file")
    .option("-s, --scripts-dir <dir>", "Override scripts directory from config")
    .option("-t, --tmp-dir <dir>", "Override temporary directory from config")
    .option("--no-tui", "Run without Terminal UI, just list available scripts")
    .option("--force-tui", "Force TUI mode even when debug is enabled")
    .action(async (options) => {
    const config = await loadConfig(options.config);
    config.loadedConfigPath =
        options.config ||
            (pathExistsSync(DEFAULT_CONFIG_FILE) ? DEFAULT_CONFIG_FILE : undefined);
    // Override config with CLI options if provided
    if (options.scriptsDir) {
        config.scriptsDir = path.resolve(options.scriptsDir);
    }
    if (options.tmpDir) {
        config.tmpDir = path.resolve(options.tmpDir);
    }
    // Ensure tmpDir exists
    if (!pathExistsSync(config.tmpDir)) {
        await fs.mkdir(config.tmpDir, { recursive: true });
    }
    const baseEnv = loadEnvironmentVariables(config.envFiles.map((f) => path.resolve(f)));
    const interpolatedDefaultParams = config.defaultParams
        ? interpolateEnvVars(config.defaultParams, baseEnv)
        : {};
    const fullEnv = { ...baseEnv, ...(typeof interpolatedDefaultParams === 'object' && interpolatedDefaultParams !== null ? interpolatedDefaultParams : {}) };
    // Populate configDisplayValues for the TUI
    const configDisplayValues = {
        scriptsDir: path.relative(process.cwd(), config.scriptsDir),
        tmpDir: path.relative(process.cwd(), config.tmpDir),
        envFiles: config.envFiles,
        excludePatterns: config.excludePatterns || [],
        defaultParamsCount: Object.keys(config.defaultParams || {}).length,
        loadedConfigPath: config.loadedConfigPath
            ? path.basename(config.loadedConfigPath)
            : "Defaults / Not found",
    };
    // If --no-tui is specified or in debug mode (unless --force-tui is specified), just list scripts without TUI
    if (options.tui === false ||
        (process.env.SCRIPTIT_DEBUG === "true" && !options.forceTui)) {
        console.log(chalk.blue("Running in non-TUI mode. Available scripts:"));
        console.log(chalk.gray(`Scripts directory: ${config.scriptsDir}`));
        // Show exclude patterns if defined
        if (config.excludePatterns && config.excludePatterns.length > 0) {
            console.log(chalk.gray(`Exclude patterns: ${config.excludePatterns.join(", ")}`));
        }
        try {
            const scripts = await getScriptFiles(config.scriptsDir, config.excludePatterns);
            if (scripts.length === 0) {
                console.log(chalk.yellow("No scripts found in the scripts directory."));
            }
            else {
                console.log(chalk.green("Available scripts:"));
                for (const [index, scriptPath] of scripts.entries()) {
                    const relativePath = path.relative(config.scriptsDir, scriptPath);
                    console.log(chalk.cyan(`${index + 1}. ${relativePath}`));
                    try {
                        const scriptModule = await import(`file://${scriptPath}?v=${Date.now()}`);
                        // Show function type information
                        const hasDefault = typeof scriptModule.default === "function";
                        const hasExecute = typeof scriptModule.execute === "function";
                        const hasTearUp = typeof scriptModule.tearUp === "function";
                        const hasTearDown = typeof scriptModule.tearDown === "function";
                        let functionInfo = "";
                        if (hasDefault && hasExecute) {
                            functionInfo = " [default + execute]";
                        }
                        else if (hasDefault) {
                            functionInfo = " [default]";
                        }
                        else if (hasExecute) {
                            functionInfo = " [execute]";
                        }
                        else {
                            functionInfo = " [no valid function]";
                        }
                        if (hasTearUp || hasTearDown) {
                            const lifecycle = [];
                            if (hasTearUp)
                                lifecycle.push("tearUp");
                            if (hasTearDown)
                                lifecycle.push("tearDown");
                            functionInfo += ` + ${lifecycle.join("+")}`;
                        }
                        console.log(chalk.gray(`   Function type:${functionInfo}`));
                        if (scriptModule.description) {
                            console.log(chalk.gray(`   Description: ${scriptModule.description}`));
                        }
                    }
                    catch (err) {
                        console.log(chalk.yellow(`   Error loading script: ${err.message}`));
                    }
                }
                console.log(chalk.blue("\nTo run a script, use:"));
                console.log(`scriptit exec <script-path>`);
            }
        }
        catch (err) {
            console.error(chalk.red(`Error listing scripts: ${err.message}`));
        }
        return;
    }
    try {
        await runTUI(config.loadedConfigPath, // Pass the actual path used
        config.scriptsDir, config.tmpDir, fullEnv, configDisplayValues);
    }
    catch (err) {
        console.error(chalk.red("Error initializing TUI:"));
        console.error(chalk.red(err.stack || err.message));
        console.log(chalk.yellow("\nTry running with --no-tui or --debug option to see available scripts."));
    }
});
// Parse command line arguments and execute the appropriate command
program.parse();
//# sourceMappingURL=cli.js.map