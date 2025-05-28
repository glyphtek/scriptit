// test/basic.test.ts
// Basic tests for ScriptIt functionality

import { test, expect } from "bun:test";
import { createScriptRunner } from "../src/lib.js";
import path from "node:path";
import fs from "node:fs/promises";

test("createScriptRunner should initialize correctly", async () => {
  const runner = await createScriptRunner({
    scriptsDir: path.join(__dirname, "../examples/ui/scripts"),
    tmpDir: path.join(__dirname, "../examples/ui/tmp"),
    envFiles: [".env.example"],
  });

  expect(runner).toBeDefined();
  expect(runner.config).toBeDefined();
  expect(runner.environment).toBeDefined();
  expect(typeof runner.executeScript).toBe("function");
  expect(typeof runner.listScripts).toBe("function");
});

test("listScripts should return available scripts", async () => {
  const runner = await createScriptRunner({
    scriptsDir: path.join(__dirname, "../examples/ui/scripts"),
    tmpDir: path.join(__dirname, "../examples/ui/tmp"),
  });

  const scripts = await runner.listScripts();
  expect(Array.isArray(scripts)).toBe(true);
});

test("exclude patterns should filter scripts", async () => {
  const runner = await createScriptRunner({
    scriptsDir: path.join(__dirname, "../examples/ui/scripts"),
    tmpDir: path.join(__dirname, "../examples/ui/tmp"),
    excludePatterns: ["*.helper.*", "_*"],
  });

  const scripts = await runner.listScripts();
  
  // Should not include helper files or files starting with _
  const hasHelperFiles = scripts.some(script => script.includes(".helper."));
  const hasUnderscoreFiles = scripts.some(script => script.startsWith("_"));
  
  expect(hasHelperFiles).toBe(false);
  expect(hasUnderscoreFiles).toBe(false);
}); 