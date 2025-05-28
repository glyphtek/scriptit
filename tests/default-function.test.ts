// tests/default-function.test.ts
// Test for the new default function support

import { test, expect, beforeAll, afterAll } from "bun:test";
import { createScriptRunner } from "../src/lib.js";
import path from "node:path";
import fs from "node:fs/promises";

const TEST_DIR = path.join(__dirname, "../examples/ui");
const SCRIPTS_DIR = path.join(TEST_DIR, "scripts");
const TMP_DIR = path.join(TEST_DIR, "tmp");

beforeAll(async () => {
  // Ensure directories exist
  await fs.mkdir(SCRIPTS_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });
});

test("default function support - can execute lambda-style script", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
  });

  // Test the lambda-test.ts script that uses default export
  const result = await runner.executeScript('lambda-test.ts');

  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.message).toBe("Lambda execution completed successfully");
  expect(result.timestamp).toBeDefined();
  expect(result.environment).toBeDefined();
});

test("default function support - prioritizes default over execute", async () => {
  // Create a test script with both default and execute functions
  const testScriptPath = path.join(SCRIPTS_DIR, "both-functions-test.ts");
  const testScriptContent = `
export const description = "Test script with both default and execute functions";

export async function execute(context) {
  return { functionUsed: "execute", success: true };
}

export default async function(context) {
  return { functionUsed: "default", success: true };
}
`;

  await fs.writeFile(testScriptPath, testScriptContent);

  try {
    const runner = await createScriptRunner({
      scriptsDir: SCRIPTS_DIR,
      tmpDir: TMP_DIR,
    });

    const result = await runner.executeScript('both-functions-test.ts');

    expect(result).toBeDefined();
    expect(result.functionUsed).toBe("default"); // Should prioritize default
    expect(result.success).toBe(true);
  } finally {
    // Clean up
    await fs.unlink(testScriptPath).catch(() => {});
  }
});

test("default function support - falls back to execute when no default", async () => {
  // Create a test script with only execute function
  const testScriptPath = path.join(SCRIPTS_DIR, "execute-only-test.ts");
  const testScriptContent = `
export const description = "Test script with only execute function";

export async function execute(context) {
  return { functionUsed: "execute", success: true };
}
`;

  await fs.writeFile(testScriptPath, testScriptContent);

  try {
    const runner = await createScriptRunner({
      scriptsDir: SCRIPTS_DIR,
      tmpDir: TMP_DIR,
    });

    const result = await runner.executeScript('execute-only-test.ts');

    expect(result).toBeDefined();
    expect(result.functionUsed).toBe("execute");
    expect(result.success).toBe(true);
  } finally {
    // Clean up
    await fs.unlink(testScriptPath).catch(() => {});
  }
});

test("default function support - throws error when no valid function", async () => {
  // Create a test script with no valid functions
  const testScriptPath = path.join(SCRIPTS_DIR, "no-function-test.ts");
  const testScriptContent = `
export const description = "Test script with no valid functions";

export function someOtherFunction() {
  return "not a valid script function";
}
`;

  await fs.writeFile(testScriptPath, testScriptContent);

  try {
    const runner = await createScriptRunner({
      scriptsDir: SCRIPTS_DIR,
      tmpDir: TMP_DIR,
    });

    await expect(runner.executeScript('no-function-test.ts')).rejects.toThrow(
      "must export either an 'execute' function or a 'default' function"
    );
  } finally {
    // Clean up
    await fs.unlink(testScriptPath).catch(() => {});
  }
}); 