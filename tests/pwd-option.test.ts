// tests/pwd-option.test.ts
// Test the --pwd option functionality

import { test, expect, beforeAll, afterAll } from "bun:test";
import { createScriptRunner } from "../src/lib.js";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const TEST_DIR = path.join(process.cwd(), "test-pwd-temp");
const SCRIPTS_DIR = path.join(TEST_DIR, "scripts");
const originalCwd = process.cwd();

beforeAll(async () => {
  // Create test directory structure
  await fs.mkdir(SCRIPTS_DIR, { recursive: true });
  
  // Create a test script
  const testScript = `
export const description = "Test script for pwd functionality";

export default async function(context) {
  context.log(\`Working directory: \${process.cwd()}\`);
  context.log(\`Scripts directory: \${context.env.SCRIPTS_DIR || 'not set'}\`);
  return {
    cwd: process.cwd(),
    scriptsDir: context.env.SCRIPTS_DIR,
  };
}
`;
  
  await fs.writeFile(path.join(SCRIPTS_DIR, "pwd-test.ts"), testScript);
  
  // Create runner config
  const config = `
export default {
  scriptsDir: './scripts',
  tmpDir: './tmp',
  envFiles: ['.env'],
};
`;
  
  await fs.writeFile(path.join(TEST_DIR, "runner.config.js"), config);
  
  // Create .env file
  await fs.writeFile(path.join(TEST_DIR, ".env"), `SCRIPTS_DIR=${SCRIPTS_DIR}\n`);
});

afterAll(async () => {
  // Cleanup
  process.chdir(originalCwd);
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});

test("Library: workingDirectory option changes working directory", async () => {
  const runner = await createScriptRunner({
    workingDirectory: TEST_DIR,
    scriptsDir: "./scripts",
    tmpDir: "./tmp",
  });
  
  // Verify working directory was changed
  expect(process.cwd()).toBe(TEST_DIR);
  
  // List scripts should work from new directory
  const scripts = await runner.listScripts();
  expect(scripts).toContain("pwd-test.ts");
  
  // Execute script and verify it sees the correct working directory
  const result = await runner.executeScript("pwd-test.ts");
  expect(result.cwd).toBe(TEST_DIR);
  
  // Restore original working directory
  process.chdir(originalCwd);
});

test("Library: workingDirectory with absolute paths", async () => {
  const runner = await createScriptRunner({
    workingDirectory: TEST_DIR,
    scriptsDir: SCRIPTS_DIR, // Absolute path
    tmpDir: path.join(TEST_DIR, "tmp"), // Absolute path
  });
  
  expect(process.cwd()).toBe(TEST_DIR);
  
  const scripts = await runner.listScripts();
  expect(scripts).toContain("pwd-test.ts");
  
  process.chdir(originalCwd);
});

test("Library: workingDirectory error handling", async () => {
  const nonExistentDir = path.join(TEST_DIR, "does-not-exist");
  
  await expect(createScriptRunner({
    workingDirectory: nonExistentDir,
  })).rejects.toThrow("Working directory does not exist");
});

test("CLI: --pwd option works with exec command", async () => {
  return new Promise<void>((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, "pwd-test.ts");
    const cliPath = path.join(originalCwd, "bin", "scriptit.js");
    
    const child = spawn("bun", [
      cliPath,
      "--pwd", TEST_DIR,
      "exec", "./scripts/pwd-test.ts"
    ], {
      cwd: originalCwd, // Start from original directory
      stdio: ["pipe", "pipe", "pipe"],
    });
    
    let stdout = "";
    let stderr = "";
    
    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    
    child.on("close", (code) => {
      try {
        expect(code).toBe(0);
        expect(stdout).toContain(`Working directory: ${TEST_DIR}`);
        expect(stdout).toContain("Changing working directory to:");
        resolve();
      } catch (error) {
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
        reject(error);
      }
    });
    
    child.on("error", reject);
    
    // Set timeout
    setTimeout(() => {
      child.kill();
      reject(new Error("Test timeout"));
    }, 10000);
  });
});

test("CLI: --pwd option error handling", async () => {
  return new Promise<void>((resolve, reject) => {
    const nonExistentDir = path.join(TEST_DIR, "does-not-exist");
    const cliPath = path.join(originalCwd, "bin", "scriptit.js");
    
    const child = spawn("bun", [
      cliPath,
      "--pwd", nonExistentDir,
      "exec", "./scripts/pwd-test.ts"
    ], {
      cwd: originalCwd,
      stdio: ["pipe", "pipe", "pipe"],
    });
    
    let stderr = "";
    
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    
    child.on("close", (code) => {
      try {
        expect(code).toBe(1);
        expect(stderr).toContain("Directory does not exist");
        resolve();
      } catch (error) {
        console.error("STDERR:", stderr);
        reject(error);
      }
    });
    
    child.on("error", reject);
    
    setTimeout(() => {
      child.kill();
      reject(new Error("Test timeout"));
    }, 5000);
  });
}); 