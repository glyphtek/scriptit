import { runTUI } from "./blessed-ui.js";
/**
 * Unified interface for running the TUI
 */
export function runBlessedTUI(configPath, scriptsDir, tmpDir, environment, configDisplayValues, emitter) {
    return runTUI(configPath, scriptsDir, tmpDir, environment, configDisplayValues, emitter);
}
export { runTUI };
//# sourceMappingURL=index.js.map