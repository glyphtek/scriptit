import * as readline from "node:readline";
import chalk from "chalk";
import type { VariableDefinition } from "../types/types.js";

/**
 * Prompts user for a single variable value
 */
async function promptForVariable(
  variable: VariableDefinition,
): Promise<string> {
  return new Promise((resolve) => {
    const message =
      variable.message || `Please enter value for ${variable.name}:`;
    const promptText =
      variable.type === "password"
        ? chalk.yellow(`🔐 ${message} `)
        : chalk.cyan(`📝 ${message} `);

    if (variable.type === "password") {
      // For password fields, hide input
      process.stdout.write(promptText);

      process.stdin.setRawMode(true);
      process.stdin.resume();

      let input = "";

      const onData = (char: Buffer) => {
        const ch = char.toString();

        switch (ch) {
          case "\n":
          case "\r":
          case "\u0004": // Ctrl+D
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", onData);
            process.stdout.write("\n");
            resolve(input);
            break;
          case "\u0003": // Ctrl+C
            process.stdout.write("\n");
            process.exit(1);
            break;
          case "\u007f": // Backspace
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write("\b \b");
            }
            break;
          default:
            if (ch.charCodeAt(0) >= 32) {
              // Printable characters
              input += ch;
              process.stdout.write("*");
            }
            break;
        }
      };

      process.stdin.on("data", onData);
    } else {
      // Regular input with readline
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(promptText, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

/**
 * Normalizes variable definitions from mixed formats to consistent format
 */
export function normalizeVariableDefinitions(
  variables: VariableDefinition[] | string[],
): VariableDefinition[] {
  return variables.map((variable) => {
    if (typeof variable === "string") {
      return {
        name: variable,
        message: `Please enter value for ${variable}:`,
        type: "input" as const,
      };
    }
    return {
      ...variable,
      message: variable.message || `Please enter value for ${variable.name}:`,
      type: variable.type || "input",
    };
  });
}

/**
 * Prompts for multiple environment variables
 */
export async function promptForEnvironmentVariables(
  variables: VariableDefinition[],
  existingEnv: Record<string, string | undefined> = {},
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Filter out variables that are already set
  const missingVariables = variables.filter(
    (variable) =>
      !existingEnv[variable.name] || existingEnv[variable.name] === "",
  );

  if (missingVariables.length === 0) {
    console.log(
      chalk.green("✅ All required environment variables are already set"),
    );
    return result;
  }

  console.log(
    chalk.blue(
      `📝 Need to collect ${missingVariables.length} environment variable(s):`,
    ),
  );
  console.log(chalk.gray("💡 Press Ctrl+C to cancel at any time"));
  console.log();

  for (const variable of missingVariables) {
    const value = await promptForVariable(variable);
    if (value) {
      result[variable.name] = value;
      console.log(chalk.green(`✅ ${variable.name} set`));
    } else {
      console.log(chalk.yellow(`⚠️ ${variable.name} left empty`));
    }
  }

  console.log();
  return result;
}

/**
 * Parses comma or space separated variable names from CLI
 */
export function parseEnvPromptsList(envPrompts: string[]): string[] {
  const result: string[] = [];

  for (const item of envPrompts) {
    // Split by comma and/or whitespace, filter empty strings
    const variables = item.split(/[,\s]+/).filter((v) => v.trim() !== "");
    result.push(...variables);
  }

  // Remove duplicates
  return [...new Set(result)];
}
