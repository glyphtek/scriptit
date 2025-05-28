// src/ui/blessed-ui.ts
import type EventEmitter from "node:events";
import path from "node:path";
import blessed from "blessed";
import chalk from "chalk";
import { logger } from "../common/logger/index.js";
import type { ScriptContext, ScriptModule } from "../common/types/index.js";
import { getScriptFiles } from "../common/utils/index.js";

/**
 * Main TUI implementation using blessed
 */
export async function runTUI(
  configPath: string | undefined,
  initialScriptsDir: string,
  initialTmpDir: string,
  initialEnv: Record<string, string | undefined>,
  initialConfigValues: Record<string, any>,
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

    // --- Helper Functions ---
    function updateConfigBox() {
      let content = `{yellow-fg}Config File:{/} ${configPath ? path.basename(configPath) : "Default"}\n`;
      content += `{yellow-fg}Scripts Dir:{/} ${path.relative(process.cwd(), initialScriptsDir)}\n`;
      content += `{yellow-fg}Temp Dir:{/} ${path.relative(process.cwd(), initialTmpDir)}\n`;
      content += `{yellow-fg}Env Vars:{/} ${Object.keys(initialEnv).length} loaded\n`;

      if (
        initialConfigValues.excludePatterns &&
        initialConfigValues.excludePatterns.length > 0
      ) {
        content += `{yellow-fg}Exclude:{/} ${initialConfigValues.excludePatterns.join(", ")}\n`;
      }

      configBox.setContent(content);
    }

    async function populateFileList() {
      outputLog.log("Populating script list...");

      try {
        const excludePatterns = initialConfigValues.excludePatterns || [];
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
      } catch (error: any) {
        outputLog.log(`Error loading scripts: ${error.message}`);
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
      const selectedIndex = (fileList as any).selected;
      if (selectedIndex < 0 || selectedIndex >= currentScriptPaths.length) {
        outputLog.log("No script selected");
        return;
      }

      const scriptPath = currentScriptPaths[selectedIndex];
      const relativePath = path.relative(initialScriptsDir, scriptPath);

      outputLog.log(`\n{green-fg}=== Running ${relativePath} ==={/}`);

      try {
        // Import and execute the script
        const scriptModule = (await import(
          `file://${scriptPath}?v=${Date.now()}`
        )) as ScriptModule;

        // Determine which function to use for execution
        // Priority: default > execute (to support lambda functions and other scenarios)
        let executeFunction: (
          context: ScriptContext,
          tearUpResult?: any,
        ) => Promise<any> | any;
        let functionName: string;

        if (typeof scriptModule.default === "function") {
          executeFunction = scriptModule.default;
          functionName = "default";
        } else if (typeof scriptModule.execute === "function") {
          executeFunction = scriptModule.execute;
          functionName = "execute";
        } else {
          throw new Error(
            "Script must export either an 'execute' function or a 'default' function",
          );
        }

        const context: ScriptContext = {
          env: initialEnv,
          tmpDir: initialTmpDir,
          configPath: configPath,
          log: (message: string) => {
            outputLog.log(`  ${message}`);
            screen.render();
          },
        };

        // Execute tearUp if it exists
        let tearUpResult: any;
        if (typeof scriptModule.tearUp === "function") {
          outputLog.log("Running tearUp()...");
          tearUpResult = await scriptModule.tearUp(context);
        }

        // Execute main function (either default or execute)
        outputLog.log(`Running ${functionName}()...`);
        const executeResult = await executeFunction(context, tearUpResult);

        // Execute tearDown if it exists
        if (typeof scriptModule.tearDown === "function") {
          outputLog.log("Running tearDown()...");
          await scriptModule.tearDown(context, executeResult, tearUpResult);
        }

        outputLog.log(
          `{green-fg}=== ${relativePath} completed successfully ==={/}\n`,
        );
      } catch (error: any) {
        outputLog.log(`{red-fg}Error: ${error.message}{/}\n`);
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
  } catch (error: any) {
    console.error("Error initializing TUI:", error);
    process.exit(1);
  }
}
