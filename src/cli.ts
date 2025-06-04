import { existsSync as pathExistsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
// src/cli.ts
import { Command, Option } from "commander";

// Use a simpler approach with regular imports
import { logger } from "./common/logger/index.js";
import type {
  RunnerConfig,
  ScriptContext,
  ScriptModule,
  VariableDefinition,
} from "./common/types/index.js";
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_SCRIPTS_DIR,
  DEFAULT_TMP_DIR,
  getScriptFiles,
  interpolateEnvVars,
  loadConfig,
  loadEnvironmentVariables,
  normalizeVariableDefinitions,
  parseEnvPromptsList,
  promptForEnvironmentVariables,
} from "./common/utils/index.js";
import {
  type EnvironmentPrompter,
  createScriptExecutorInstance,
  executeScriptWithEnvironment,
} from "./core/script-executor.js";
import { runBlessedTUI as runTUI } from "./ui/index.js";

// Reusable CLI Options
const CLI_OPTIONS = {
  // Configuration options
  config: new Option(
    "-c, --config <path>",
    "Path to runner configuration file",
  ),

  // Directory options
  scriptsDir: new Option(
    "-s, --scripts-dir <dir>",
    "Directory for scripts",
  ).default(DEFAULT_SCRIPTS_DIR),

  scriptsDirOverride: new Option(
    "-s, --scripts-dir <dir>",
    "Override scripts directory from config",
  ),

  tmpDir: new Option(
    "-t, --tmp-dir <dir>",
    "Directory for temporary files",
  ).default(DEFAULT_TMP_DIR),

  tmpDirOverride: new Option(
    "-t, --tmp-dir <dir>",
    "Override temporary directory from config",
  ),

  // Environment options
  env: new Option(
    "-e, --env <vars...>",
    "Set environment variables (e.g., NAME=Bun X=Y)",
  ),

  envPrompts: new Option(
    "--env-prompts <vars...>",
    "Prompt for environment variables before execution (e.g., API_KEY,SECRET)",
  ),

  // UI options
  noTui: new Option(
    "--no-tui",
    "Run without Terminal UI, just list available scripts",
  ),

  forceTui: new Option(
    "--force-tui",
    "Force TUI mode even when debug is enabled",
  ),

  // Init options
  force: new Option(
    "-f, --force",
    "Overwrite existing files and directories if they exist",
  ),

  // Global options
  debug: new Option("-d, --debug", "Run in debug mode with verbose logging"),

  pwd: new Option(
    "--pwd <dir>",
    "Set working directory for script execution (all relative paths resolve from here)",
  ),
} as const;

// Continue with CLI implementation
const program = new Command();

program
  .name("scriptit")
  .description(
    "ScriptIt - A powerful CLI and library for running scripts with environment management, TUI, and support for lambda functions",
  )
  .version("0.7.1")
  .addOption(CLI_OPTIONS.debug)
  .addOption(CLI_OPTIONS.pwd)
  .hook("preAction", (thisCommand, actionCommand) => {
    const opts = thisCommand.opts();

    if (opts.debug) {
      process.env.SCRIPTIT_DEBUG = "true";
      console.log(chalk.blue("Debug mode enabled"));
    }

    if (opts.pwd) {
      const targetDir = path.resolve(opts.pwd);
      if (!pathExistsSync(targetDir)) {
        console.error(
          chalk.red(`Error: Directory does not exist: ${targetDir}`),
        );
        process.exit(1);
      }

      console.log(chalk.gray(`Changing working directory to: ${targetDir}`));
      process.chdir(targetDir);
    }
  });

program
  .command("init")
  .description("Initialize a new script runner project structure.")
  .addOption(CLI_OPTIONS.scriptsDir)
  .addOption(CLI_OPTIONS.tmpDir)
  .addOption(CLI_OPTIONS.force)
  .action(async (options) => {
    const scriptsDir = path.resolve(options.scriptsDir);
    const tmpDir = path.resolve(options.tmpDir);
    const configFilePath = path.resolve(DEFAULT_CONFIG_FILE);
    const gitignorePath = path.resolve(".gitignore");

    console.log(chalk.blue("Initializing script runner project..."));

    const dirsToCreate = [scriptsDir, tmpDir];
    for (const dir of dirsToCreate) {
      if (pathExistsSync(dir) && !options.force) {
        console.warn(
          chalk.yellow(
            `Directory ${dir} already exists. Use --force to overwrite.`,
          ),
        );
      } else {
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
    } else {
      console.warn(
        chalk.yellow(
          `Config file ${configFilePath} already exists. Use --force to overwrite.`,
        ),
      );
    }

    // Create example .env file
    const exampleEnvPath = path.resolve(".env.example");
    if (!pathExistsSync(exampleEnvPath) || options.force) {
      await fs.writeFile(
        exampleEnvPath,
        'MY_VARIABLE="Hello from .env"\nAPI_TOKEN_FROM_ENV="your_secret_token_here"\n',
      );
      console.log(
        chalk.green(
          `Created example env file: ${exampleEnvPath} (copy to .env and customize)`,
        ),
      );
    }
    if (!pathExistsSync(path.resolve(".env"))) {
      await fs.copyFile(exampleEnvPath, path.resolve(".env"));
      console.log(chalk.green("Copied .env.example to .env"));
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
      const lambdaExamplePath = path.join(
        options.scriptsDir,
        "lambda-example.ts",
      );
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
    } else {
      console.warn(
        chalk.yellow(
          `Example script ${exampleScriptPath} already exists. Use --force to overwrite.`,
        ),
      );
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
    } else {
      console.log(
        chalk.blue(`'${tmpDirGitIgnoreEntry}' already in .gitignore`),
      );
    }
    // Add .env.local to .gitignore
    const envLocalGitIgnoreEntry = ".env.local";
    if (!gitignoreContent.includes(envLocalGitIgnoreEntry)) {
      gitignoreContent += `\n# Local environment variables (gitignored)\n${envLocalGitIgnoreEntry}\n`;
      await fs.writeFile(gitignorePath, gitignoreContent.trim()); // trim to avoid multiple newlines if added multiple times
      console.log(
        chalk.green(`Added '${envLocalGitIgnoreEntry}' to .gitignore`),
      );
    } else {
      console.log(
        chalk.blue(`'${envLocalGitIgnoreEntry}' already in .gitignore`),
      );
    }

    console.log(chalk.bgGreen.black("\nInitialization complete!"));
    console.log(chalk.yellow("To get started:"));
    console.log(
      chalk.yellow(`1. (Optional) Customize '${DEFAULT_CONFIG_FILE}'`),
    );
    console.log(
      chalk.yellow(
        `2. (Optional) Create/edit '.env' file with your environment variables.`,
      ),
    );
    console.log(
      chalk.yellow(
        `3. Add your scripts to the '${options.scriptsDir}' directory.`,
      ),
    );
    console.log(
      chalk.yellow(
        `4. Run '${program.name()} run' or just '${program.name()}' to start.`,
      ),
    );
  });

program
  .command("exec <scriptPath>")
  .description("Execute a single script file directly.")
  .addOption(CLI_OPTIONS.config)
  .addOption(CLI_OPTIONS.env)
  .addOption(CLI_OPTIONS.envPrompts)
  .action(async (scriptPath, options) => {
    // Load configuration (tmpDir, envFiles, defaultParams will be used from here)
    const config = await loadConfig(options.config);
    // Store where the config was loaded from for context
    config.loadedConfigPath =
      options.config ||
      (pathExistsSync(DEFAULT_CONFIG_FILE) ? DEFAULT_CONFIG_FILE : undefined);

    // Process --env options
    const cliEnvVars: Record<string, string> = {};
    if (options.env && Array.isArray(options.env)) {
      for (const envVar of options.env) {
        const [key, ...valueParts] = envVar.split("=");
        if (key && valueParts.length > 0) {
          cliEnvVars[key.trim()] = valueParts.join("=").trim();
        } else {
          console.warn(
            chalk.yellow(`Skipping malformed --env argument: ${envVar}`),
          );
        }
      }
    }

    // Process --env-prompts options
    let envPromptsToPass: string[] = [];
    if (options.envPrompts && Array.isArray(options.envPrompts)) {
      envPromptsToPass = parseEnvPromptsList(options.envPrompts);
    }

    await executeScriptFile(scriptPath, config, cliEnvVars, envPromptsToPass);
  });

program
  .command("run", { isDefault: true })
  .description("Run scripts using the interactive UI.")
  .addOption(CLI_OPTIONS.config)
  .addOption(CLI_OPTIONS.scriptsDirOverride)
  .addOption(CLI_OPTIONS.tmpDirOverride)
  .addOption(CLI_OPTIONS.noTui)
  .addOption(CLI_OPTIONS.forceTui)
  .addOption(CLI_OPTIONS.envPrompts)
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

    const baseEnv = loadEnvironmentVariables(
      config.envFiles.map((f) => path.resolve(f)),
    );
    const interpolatedDefaultParams = config.defaultParams
      ? interpolateEnvVars(config.defaultParams, baseEnv)
      : {};
    const fullEnv = {
      ...baseEnv,
      ...(typeof interpolatedDefaultParams === "object" &&
      interpolatedDefaultParams !== null
        ? interpolatedDefaultParams
        : {}),
    };

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
    if (
      options.noTui === true ||
      (process.env.SCRIPTIT_DEBUG === "true" && !options.forceTui)
    ) {
      console.log(chalk.blue("Running in non-TUI mode. Available scripts:"));
      console.log(chalk.gray(`Scripts directory: ${config.scriptsDir}`));

      // Show exclude patterns if defined
      if (config.excludePatterns && config.excludePatterns.length > 0) {
        console.log(
          chalk.gray(`Exclude patterns: ${config.excludePatterns.join(", ")}`),
        );
      }

      try {
        const scripts = await getScriptFiles(
          config.scriptsDir,
          config.excludePatterns,
        );
        if (scripts.length === 0) {
          console.log(
            chalk.yellow("No scripts found in the scripts directory."),
          );
        } else {
          console.log(chalk.green("Available scripts:"));
          for (const [index, scriptPath] of scripts.entries()) {
            const relativePath = path.relative(config.scriptsDir, scriptPath);
            console.log(chalk.cyan(`${index + 1}. ${relativePath}`));

            try {
              const scriptModule = await import(
                `file://${scriptPath}?v=${Date.now()}`
              );

              // Show function type information
              const hasDefault = typeof scriptModule.default === "function";
              const hasExecute = typeof scriptModule.execute === "function";
              const hasTearUp = typeof scriptModule.tearUp === "function";
              const hasTearDown = typeof scriptModule.tearDown === "function";

              let functionInfo = "";
              if (hasDefault && hasExecute) {
                functionInfo = " [default + execute]";
              } else if (hasDefault) {
                functionInfo = " [default]";
              } else if (hasExecute) {
                functionInfo = " [execute]";
              } else {
                functionInfo = " [no valid function]";
              }

              if (hasTearUp || hasTearDown) {
                const lifecycle = [];
                if (hasTearUp) lifecycle.push("tearUp");
                if (hasTearDown) lifecycle.push("tearDown");
                functionInfo += ` + ${lifecycle.join("+")}`;
              }

              console.log(chalk.gray(`   Function type:${functionInfo}`));

              if (scriptModule.description) {
                console.log(
                  chalk.gray(`   Description: ${scriptModule.description}`),
                );
              }
            } catch (err: unknown) {
              const errorMessage =
                err instanceof Error ? err.message : String(err);
              console.log(
                chalk.yellow(`   Error loading script: ${errorMessage}`),
              );
            }
          }

          console.log(chalk.blue("\nTo run a script, use:"));
          console.log("scriptit exec <script-path>");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(chalk.red(`Error listing scripts: ${errorMessage}`));
      }
      return;
    }

    try {
      await runTUI(
        config.loadedConfigPath, // Pass the actual path used
        config.scriptsDir,
        config.tmpDir,
        fullEnv,
        configDisplayValues,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(chalk.red("Error initializing TUI:"));
      console.error(chalk.red(errorMessage));
      console.log(
        chalk.yellow(
          "\nTry running with --no-tui or --debug option to see available scripts.",
        ),
      );
    }
  });

// Parse command line arguments and execute the appropriate command
program.parse();

// Function to execute a single script (will be used by 'exec' command and potentially by TUI later if refactored)
async function executeScriptFile(
  scriptPath: string,
  config: RunnerConfig,
  cliProvidedEnv: Record<string, string | undefined> = {}, // For env vars passed directly via CLI
  cliEnvPrompts: string[] = [], // For --env-prompts from CLI
) {
  const prompter = new CLIEnvironmentPrompter();

  const cliLogger = {
    info: (msg: string) => logger.cliOutput(chalk.cyan(msg)),
    warn: (msg: string) => logger.cliOutput(chalk.yellow(msg)),
    error: (msg: string) => logger.cliOutput(chalk.red(msg)),
  };

  try {
    logger.cliOutput(
      chalk.cyan(`--- Running script: ${path.basename(scriptPath)} ---`),
    );

    const result = await executeScriptWithEnvironment({
      scriptPath,
      config,
      cliProvidedEnv,
      cliEnvPrompts,
      prompter,
      logger: {
        info: (msg: string) => logger.cliOutput(chalk.gray(`  ${msg}`)),
        warn: (msg: string) => console.warn(chalk.yellow(`  ${msg}`)),
        error: (msg: string) => console.error(chalk.red(`  ${msg}`)),
      },
    });

    console.log(
      chalk.green(
        `--- Script ${path.basename(scriptPath)} finished successfully ---\n`,
      ),
    );

    if (result !== undefined) {
      console.log(
        chalk.gray(
          `     Script result: ${typeof result === "object" ? JSON.stringify(result) : result}`,
        ),
      );
    }

    process.exit(0); // Explicit success exit
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      chalk.red(`--- Error running script ${path.basename(scriptPath)} ---`),
    );
    console.error(chalk.red(errorMessage));
    console.error(
      chalk.red(`--- Script ${path.basename(scriptPath)} failed ---\n`),
    );
    process.exit(1); // Explicit failure exit
  }
}

// CLI-specific environment prompter using readline
class CLIEnvironmentPrompter implements EnvironmentPrompter {
  async promptForVariables(
    variables: VariableDefinition[],
    existingEnv: Record<string, string | undefined>,
  ): Promise<Record<string, string>> {
    return promptForEnvironmentVariables(variables, existingEnv);
  }
}
