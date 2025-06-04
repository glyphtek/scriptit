// src/ui/blessed-ui.ts
import type EventEmitter from "node:events";
import path from "node:path";
import blessed from "blessed";
import chalk from "chalk";
import { logger } from "../common/logger/index.js";
import type {
  RunnerConfig,
  ScriptContext,
  ScriptModule,
} from "../common/types/index.js";
import { getScriptFiles, loadConfig } from "../common/utils/index.js";
import {
  createScriptExecutorInstance,
  executeScriptWithEnvironment,
} from "../core/script-executor.js";
import { TUIEnvironmentPrompter } from "./tui-prompter.js";

/**
 * Main TUI implementation using blessed
 */
export async function runTUI(
  configPath: string | undefined,
  initialScriptsDir: string,
  initialTmpDir: string,
  initialEnv: Record<string, string | undefined>,
  initialConfigValues: Record<string, unknown>,
  emitter?: EventEmitter, // Optional emitter from lib
) {
  try {
    logger.debug("Initializing TUI...");
    const screen = blessed.screen({
      smartCSR: true,
      title: "Bun Script Runner",
      fullUnicode: true,
      autoPadding: false,
    });

    // Load full config for the TUI to use
    const config: RunnerConfig = await loadConfig(configPath);
    config.loadedConfigPath = configPath;

    // --- State for Focus and Visibility ---
    let currentFocus: "fileList" | "outputLog" = "fileList";
    let isConfigVisible = false;
    let isFileListVisible = true;
    let currentScriptPaths: string[] = [];

    // --- Control Panel ---
    const controlPanel = blessed.box({
      parent: screen,
      top: 0,
      left: 0,
      width: "100%",
      height: 1,
      content:
        " [C]onfig | [F]iles | [Tab] Focus | [Enter] Run | [j/k] Navigate | [R]efresh | [Q]uit ",
      style: {
        fg: "white",
        bg: "blue",
      },
    });

    // --- File Selector Panel ---
    const fileList = blessed.list({
      parent: screen,
      top: 1,
      left: 0,
      width: "100%",
      height: "50%-1",
      label: " Scripts ",
      border: { type: "line" },
      style: {
        border: { fg: "green" },
        selected: { bg: "blue", fg: "white" },
        item: { fg: "yellow" },
        focus: { border: { fg: "yellow" } },
      },
      keys: true,
      mouse: true,
      scrollable: true,
      items: [],
      tags: true,
      wrap: false,
      shrink: true,
    });

    // --- Output Panel ---
    const outputLog = blessed.log({
      parent: screen,
      top: "50%",
      left: 0,
      width: "100%",
      height: "50%",
      label: " Output ",
      border: { type: "line" },
      style: {
        border: { fg: "magenta" },
        focus: { border: { fg: "yellow" } },
      },
      scrollable: true,
      alwaysScroll: true,
      tags: true,
      keys: true,
      mouse: true,
    });

    // --- Config Panel (hidden by default) ---
    const configBox = blessed.box({
      parent: screen,
      top: 1,
      left: 0,
      width: "30%",
      height: "50%-1",
      label: " Configuration ",
      content: "",
      border: { type: "line" },
      style: { border: { fg: "cyan" } },
      tags: true,
      hidden: true,
    });

    // Create TUI-specific environment prompter
    const tuiPrompter = new TUIEnvironmentPrompter(screen, outputLog);

    // --- Helper Functions ---
    function updateConfigBox() {
      let content = `{yellow-fg}Config File:{/} ${configPath ? path.basename(configPath) : "Default"}\n`;
      content += `{yellow-fg}Scripts Dir:{/} ${path.relative(process.cwd(), initialScriptsDir)}\n`;
      content += `{yellow-fg}Temp Dir:{/} ${path.relative(process.cwd(), initialTmpDir)}\n`;
      content += `{yellow-fg}Env Vars:{/} ${Object.keys(initialEnv).length} loaded\n`;

      const excludePatterns = initialConfigValues.excludePatterns as
        | string[]
        | undefined;
      if (
        excludePatterns &&
        Array.isArray(excludePatterns) &&
        excludePatterns.length > 0
      ) {
        content += `{yellow-fg}Exclude:{/} ${excludePatterns.join(", ")}\n`;
      }

      configBox.setContent(content);
    }

    async function populateFileList() {
      outputLog.log("Populating script list...");

      try {
        const excludePatterns =
          (initialConfigValues.excludePatterns as string[]) || [];
        const scriptPaths = await getScriptFiles(
          initialScriptsDir,
          excludePatterns,
        );
        currentScriptPaths = scriptPaths;

        // Create clean relative paths for display
        const items = scriptPaths.map((scriptPath) => {
          const relativePath = path.relative(initialScriptsDir, scriptPath);

          // Ensure we don't show absolute paths or paths starting with ../
          if (relativePath.startsWith("../") || path.isAbsolute(relativePath)) {
            return path.basename(scriptPath);
          }
          return relativePath;
        });

        fileList.setItems(items);

        if (items.length > 0) {
          fileList.select(0);
          outputLog.log(`Found ${items.length} scripts`);
        } else {
          outputLog.log("No scripts found");
        }

        screen.render();
      } catch (error: unknown) {
        outputLog.log(
          `Error loading scripts: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    function updateLayout() {
      if (isConfigVisible) {
        configBox.hidden = false;
        fileList.left = "30%";
        fileList.width = "70%";
      } else {
        configBox.hidden = true;
        fileList.left = 0;
        fileList.width = "100%";
      }

      if (!isFileListVisible) {
        fileList.hidden = true;
        outputLog.top = 1;
        outputLog.height = "100%-1";
      } else {
        fileList.hidden = false;
        outputLog.top = "50%";
        outputLog.height = "50%";
      }

      screen.render();
    }

    function setFocus(panel: "fileList" | "outputLog") {
      currentFocus = panel;
      if (panel === "fileList" && !fileList.hidden) {
        fileList.focus();
        fileList.setLabel(" Scripts (ACTIVE) ");
        outputLog.setLabel(" Output ");
      } else {
        outputLog.focus();
        outputLog.setLabel(" Output (ACTIVE) ");
        fileList.setLabel(" Scripts ");
      }
      screen.render();
    }

    async function executeSelectedScript() {
      const selectedIndex = (fileList as unknown as { selected: number })
        .selected;
      if (selectedIndex < 0 || selectedIndex >= currentScriptPaths.length) {
        outputLog.log("No script selected");
        return;
      }

      const scriptPath = currentScriptPaths[selectedIndex];
      const relativePath = path.relative(initialScriptsDir, scriptPath);

      outputLog.log(`\n{green-fg}=== Running ${relativePath} ==={/}`);
      screen.render();

      try {
        const result = await executeScriptWithEnvironment({
          scriptPath,
          config,
          cliProvidedEnv: {}, // TUI doesn't have CLI env vars
          cliEnvPrompts: [], // TUI doesn't have CLI env prompts
          prompter: tuiPrompter,
          logger: {
            info: (msg: string) => {
              outputLog.log(`  {gray-fg}${msg}{/}`);
              screen.render();
            },
            warn: (msg: string) => {
              outputLog.log(`  {yellow-fg}${msg}{/}`);
              screen.render();
            },
            error: (msg: string) => {
              outputLog.log(`  {red-fg}${msg}{/}`);
              screen.render();
            },
          },
        });

        outputLog.log(
          `{green-fg}=== ${relativePath} completed successfully ==={/}\n`,
        );

        if (result !== undefined) {
          outputLog.log(
            `  Result: ${typeof result === "object" ? JSON.stringify(result) : result}`,
          );
        }
      } catch (error: unknown) {
        outputLog.log(
          `{red-fg}Error: ${error instanceof Error ? error.message : String(error)}{/}\n`,
        );
      }

      screen.render();
    }

    // --- Keyboard Event Handlers ---
    screen.key(["q", "Q", "C-c"], () => {
      screen.destroy();
      process.exit(0);
    });

    screen.key(["tab"], () => {
      if (currentFocus === "fileList") {
        setFocus("outputLog");
      } else {
        setFocus("fileList");
      }
    });

    screen.key(["c", "C"], () => {
      isConfigVisible = !isConfigVisible;
      updateLayout();
    });

    screen.key(["f", "F"], () => {
      isFileListVisible = !isFileListVisible;
      updateLayout();
    });

    screen.key(["r", "R"], async () => {
      outputLog.log("Refreshing script list...");
      await populateFileList();
    });

    screen.key(["enter"], async () => {
      if (currentFocus === "fileList") {
        await executeSelectedScript();
      }
    });

    // File list navigation - only use j/k, let blessed handle arrow keys natively
    fileList.key(["j"], () => {
      fileList.down(1);
      screen.render();
    });

    fileList.key(["k"], () => {
      fileList.up(1);
      screen.render();
    });

    // Output log navigation - only use j/k for consistency
    outputLog.key(["j"], () => {
      outputLog.scroll(1);
      screen.render();
    });

    outputLog.key(["k"], () => {
      outputLog.scroll(-1);
      screen.render();
    });

    // --- Initialize TUI ---
    updateConfigBox();
    await populateFileList();
    updateLayout();
    setFocus("fileList");

    outputLog.log(
      "TUI initialized. Use [↑↓] or [j/k] to navigate, [Tab] to switch focus, [Enter] to run scripts, [Q] to quit.",
    );

    screen.render();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error initializing TUI:", errorMessage);
    process.exit(1);
  }
}
