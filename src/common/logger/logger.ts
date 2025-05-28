import chalk from "chalk";

const DEBUG_ENV_VAR = "SCRIPT_RUNNER_DEBUG";

// Cache the debug mode state
let isDebugMode =
  process.env[DEBUG_ENV_VAR] === "true" || process.env[DEBUG_ENV_VAR] === "1";

export function updateDebugMode() {
  isDebugMode =
    process.env[DEBUG_ENV_VAR] === "true" || process.env[DEBUG_ENV_VAR] === "1";
}

// Call this if the environment variable might change during the application's lifecycle,
// though for CLI startup, it's usually set once.
// For long-running TUI, it might be useful if env could be reloaded.

/**
 * Simple logger utility for the script runner
 * Provides different log levels and debug mode support
 */
export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDebugMode) {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
        )
        .join(" ");
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  },
  info: (...args: unknown[]): void => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");
    console.log(chalk.blueBright(message)); // Or just console.log without specific color
  },
  warn: (...args: unknown[]): void => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");
    console.warn(chalk.yellowBright(`[WARN] ${message}`));
  },
  error: (...args: unknown[]): void => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");
    console.error(chalk.redBright(`[ERROR] ${message}`));
  },
  // For specific CLI output not necessarily debug/info/warn/error
  cliOutput: (...args: unknown[]): void => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" ");
    console.log(message);
  },
  // Log to TUI (this will be specific to the TUI's blessed log widget)
  // This part needs to be handled where the TUI log widget is available.
  // We can pass a tuiLog function to the logger or handle it separately.
};
