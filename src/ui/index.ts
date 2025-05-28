// src/ui/index.ts
import type EventEmitter from "node:events";
import { runTUI } from "./blessed-ui.js";

/**
 * Unified interface for running the TUI
 */
export async function runBlessedTUI(
  configPath: string | undefined,
  scriptsDir: string,
  tmpDir: string,
  environment: Record<string, string | undefined>,
  configDisplayValues: Record<string, unknown>,
  emitter?: EventEmitter,
): Promise<void> {
  return runTUI(
    configPath,
    scriptsDir,
    tmpDir,
    environment,
    configDisplayValues,
    emitter,
  );
}

export { runTUI };
