// tests/lib-example.test.ts
// Tests for the library example functionality

import { test, expect, beforeAll, afterAll } from "bun:test";
import { createScriptRunner, type ScriptExecutionResult } from "../src/lib.js";
import path from "node:path";
import fs from "node:fs/promises";

const TEST_DIR = path.join(__dirname, "../examples/lib");
const SCRIPTS_DIR = path.join(TEST_DIR, "scripts");
const TMP_DIR = path.join(TEST_DIR, "tmp");

beforeAll(async () => {
  // Ensure directories exist
  await fs.mkdir(SCRIPTS_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });
  
  // Create test scripts
  await createTestScripts();
});

afterAll(async () => {
  // Clean up test files
  try {
    await fs.rm(path.join(SCRIPTS_DIR, "test-example.ts"), { force: true });
    await fs.rm(path.join(SCRIPTS_DIR, "test-lifecycle.ts"), { force: true });
    await fs.rm(path.join(SCRIPTS_DIR, "test-helper.helper.ts"), { force: true });
    await fs.rm(path.join(SCRIPTS_DIR, "_test-internal.ts"), { force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});

async function createTestScripts() {
  // Simple test script
  const simpleScript = `// scripts/test-example.ts
export const description = "Test script for library validation";

export async function execute(context) {
  context.log("Test script executing");
  context.log(\`App: \${context.appName || "Unknown"}\`);
  context.log(\`Custom param: \${context.params?.testParam || "None"}\`);
  context.log(\`Env var: \${context.env.TEST_VAR || "Not set"}\`);
  
  return {
    success: true,
    message: "Test completed",
    receivedParams: context.params,
    envVars: {
      TEST_VAR: context.env.TEST_VAR,
      NODE_ENV: context.env.NODE_ENV,
    },
  };
}`;

  // Lifecycle test script
  const lifecycleScript = `// scripts/test-lifecycle.ts
export const description = "Test script with full lifecycle";

export async function tearUp(context) {
  context.log("TearUp: Setting up test");
  const testData = {
    id: "test-" + Date.now(),
    tmpFile: \`\${context.tmpDir}/test-data.json\`,
  };
  
  await Bun.write(testData.tmpFile, JSON.stringify({ test: "data" }));
  return testData;
}

export async function execute(context, tearUpResult) {
  context.log("Execute: Running test logic");
  const data = JSON.parse(await Bun.file(tearUpResult.tmpFile).text());
  
  return {
    success: true,
    tearUpId: tearUpResult.id,
    dataRead: data,
  };
}

export async function tearDown(context, executeResult, tearUpResult) {
  context.log("TearDown: Cleaning up test");
  // Clean up the temp file
  try {
    await fs.unlink(tearUpResult.tmpFile);
  } catch (error) {
    // File might not exist
  }
}`;

  // Helper script (should be excluded)
  const helperScript = `// scripts/test-helper.helper.ts
export function helperFunction() {
  return "This should be excluded";
}`;

  // Internal script (should be excluded)
  const internalScript = `// scripts/_test-internal.ts
export const INTERNAL_CONFIG = {
  secret: "This should be excluded"
};`;

  await fs.writeFile(path.join(SCRIPTS_DIR, "test-example.ts"), simpleScript);
  await fs.writeFile(path.join(SCRIPTS_DIR, "test-lifecycle.ts"), lifecycleScript);
  await fs.writeFile(path.join(SCRIPTS_DIR, "test-helper.helper.ts"), helperScript);
  await fs.writeFile(path.join(SCRIPTS_DIR, "_test-internal.ts"), internalScript);
}

test("library example - basic initialization", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
    excludePatterns: ['*.helper.*', '_*'],
    defaultParams: {
      appName: 'Test App',
      version: '1.0.0',
    },
  });

  expect(runner).toBeDefined();
  expect(runner.config).toBeDefined();
  expect(runner.config.scriptsDir).toBe(SCRIPTS_DIR);
  expect(runner.config.tmpDir).toBe(TMP_DIR);
  expect(runner.config.excludePatterns).toEqual(['*.helper.*', '_*']);
});

test("library example - list scripts with exclusions", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
    excludePatterns: ['*.helper.*', '_*'],
  });

  const scripts = await runner.listScripts();
  
  // Should include test scripts but exclude helper and internal files
  const scriptNames = scripts.map(s => path.basename(s));
  
  expect(scriptNames).toContain("test-example.ts");
  expect(scriptNames).toContain("test-lifecycle.ts");
  expect(scriptNames).not.toContain("test-helper.helper.ts");
  expect(scriptNames).not.toContain("_test-internal.ts");
});

test("library example - execute simple script", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
    defaultParams: {
      appName: 'Test App',
      version: '1.0.0',
    },
  });

  const result: ScriptExecutionResult = await runner.executeScript('test-example.ts', {
    params: {
      testParam: 'Hello from test',
    },
    env: {
      TEST_VAR: 'test-value',
    },
  });

  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.message).toBe("Test completed");
  expect(result.receivedParams).toEqual({ testParam: 'Hello from test' });
  expect((result.envVars as any).TEST_VAR).toBe('test-value');
});

test("library example - execute lifecycle script", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
  });

  const result: ScriptExecutionResult = await runner.executeScript('test-lifecycle.ts');

  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect((result.tearUpId as string)).toMatch(/^test-\d+$/);
  expect(result.dataRead).toEqual({ test: "data" });
});

test("library example - event handling", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
  });

  const events: Array<{ type: string; scriptPath: string; data?: any }> = [];

  runner.on('script:beforeExecute', (scriptPath, params) => {
    events.push({ type: 'beforeExecute', scriptPath, data: params });
  });

  runner.on('script:afterExecute', (scriptPath, result) => {
    events.push({ type: 'afterExecute', scriptPath, data: result });
  });

  runner.on('script:error', (scriptPath, error) => {
    events.push({ type: 'error', scriptPath, data: error });
  });

  await runner.executeScript('test-example.ts', {
    params: { eventTest: true },
  });

  expect(events).toHaveLength(2);
  expect(events[0].type).toBe('beforeExecute');
  expect(events[0].scriptPath).toContain('test-example.ts');
  expect(events[0].data).toEqual({ params: { eventTest: true } });
  
  expect(events[1].type).toBe('afterExecute');
  expect(events[1].scriptPath).toContain('test-example.ts');
  expect(events[1].data.success).toBe(true);
});

test("library example - error handling", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
  });

  // Try to execute a non-existent script
  await expect(runner.executeScript('non-existent.ts')).rejects.toThrow();
});

test("library example - custom logger", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
  });

  const logMessages: string[] = [];
  const customLogger = (message: string) => {
    logMessages.push(message);
  };

  await runner.executeScript('test-example.ts', {
    params: { logTest: true },
  }, customLogger);

  expect(logMessages.length).toBeGreaterThan(0);
  expect(logMessages.some(msg => msg.includes('Test script executing'))).toBe(true);
});

test("library example - environment variable interpolation", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
    defaultParams: {
      interpolatedValue: '${TEST_INTERPOLATION}',
    },
    initialEnv: {
      TEST_INTERPOLATION: 'interpolated-value',
    },
  });

  expect(runner.environment.TEST_INTERPOLATION).toBe('interpolated-value');
  expect(runner.environment.interpolatedValue).toBe('interpolated-value');
});

test("library example - configuration validation", async () => {
  const runner = await createScriptRunner({
    scriptsDir: SCRIPTS_DIR,
    tmpDir: TMP_DIR,
    excludePatterns: ['*.helper.*', '_*', '*.test.*'],
    envFiles: ['.env'],
    defaultParams: {
      testParam: 'default-value',
    },
  });

  expect(runner.config.excludePatterns).toEqual(['*.helper.*', '_*', '*.test.*']);
  expect(runner.config.envFiles).toEqual(['.env']);
  expect(runner.config.defaultParams).toEqual({ testParam: 'default-value' });
}); 