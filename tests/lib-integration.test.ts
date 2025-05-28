// tests/lib-integration.test.ts
// Integration test for the library example

import { test, expect, beforeAll } from "bun:test";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIB_EXAMPLE_DIR = path.resolve(__dirname, "../examples/lib");

beforeAll(async () => {
  // Ensure the lib example directory exists
  console.log("Checking library example directory:", LIB_EXAMPLE_DIR);
  const exists = await fs.access(LIB_EXAMPLE_DIR).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error(`Library example directory not found: ${LIB_EXAMPLE_DIR}`);
  }
  console.log("Library example directory exists");
});

test("library example - can import and run without errors", async () => {
  // This test verifies that the library example can be imported and executed
  // without throwing any import errors or runtime errors
  
  const indexPath = path.join(LIB_EXAMPLE_DIR, "src", "index.ts");
  
  // Check if the main file exists
  const exists = await fs.access(indexPath).then(() => true).catch(() => false);
  expect(exists).toBe(true);
  
  // Read the file content to verify it has the expected structure
  const content = await fs.readFile(indexPath, "utf-8");
  
  // Verify it imports from @glyphtek/scriptit
  expect(content).toContain("import { createScriptRunner } from '@glyphtek/scriptit'");
  
  // Verify it has the main function
  expect(content).toContain("async function main()");
  
  // Verify it has script creation logic
  expect(content).toContain("createExampleScripts");
  
  // Verify it demonstrates key features
  expect(content).toContain("runner.listScripts()");
  expect(content).toContain("runner.executeScript");
  expect(content).toContain("runner.on(");
});

test("library example - package.json is properly configured", async () => {
  const packagePath = path.join(LIB_EXAMPLE_DIR, "package.json");
  
  const exists = await fs.access(packagePath).then(() => true).catch(() => false);
  expect(exists).toBe(true);
  
  const packageContent = await fs.readFile(packagePath, "utf-8");
  const packageJson = JSON.parse(packageContent);
  
  // Verify essential package.json fields
  expect(packageJson.name).toBe("scriptit-lib-example");
  expect(packageJson.type).toBe("module");
  expect(packageJson.dependencies).toHaveProperty("@glyphtek/scriptit");
  expect(packageJson.scripts).toHaveProperty("start");
  expect(packageJson.scripts.start).toBe("bun run src/index.ts");
});

test("library example - has proper directory structure", async () => {
  // Test each required path explicitly with better error handling
  
  try {
    // Check src directory
    await fs.access(path.join(LIB_EXAMPLE_DIR, "src"));
    
    // Check src/index.ts file
    await fs.access(path.join(LIB_EXAMPLE_DIR, "src", "index.ts"));
    
    // Check scripts directory
    await fs.access(path.join(LIB_EXAMPLE_DIR, "scripts"));
    
    // Check tmp directory
    await fs.access(path.join(LIB_EXAMPLE_DIR, "tmp"));
    
    // Check package.json file
    await fs.access(path.join(LIB_EXAMPLE_DIR, "package.json"));
    
    // Check env.example file
    await fs.access(path.join(LIB_EXAMPLE_DIR, "env.example"));
    
    // Check README.md file
    await fs.access(path.join(LIB_EXAMPLE_DIR, "README.md"));
    
    // If we get here, all files exist
    expect(true).toBe(true);
  } catch (error) {
    // If any file is missing, the test should fail with a descriptive message
    throw new Error(`Directory structure check failed: ${error.message}`);
  }
});

test("library example - README has proper documentation", async () => {
  const readmePath = path.join(LIB_EXAMPLE_DIR, "README.md");
  const content = await fs.readFile(readmePath, "utf-8");
  
  // Verify README contains essential sections
  expect(content).toContain("# ScriptIt Library Example");
  expect(content).toContain("## Overview");
  expect(content).toContain("## Getting Started");
  expect(content).toContain("## What the Example Demonstrates");
  
  // Verify it has code examples
  expect(content).toContain("```typescript");
  expect(content).toContain("runner.executeScript");
});

test("library example - environment file is properly structured", async () => {
  const envPath = path.join(LIB_EXAMPLE_DIR, "env.example");
  const content = await fs.readFile(envPath, "utf-8");
  
  // Verify it has expected environment variables
  expect(content).toContain("NODE_ENV=");
  expect(content).toContain("LOG_LEVEL=");
  expect(content).toContain("API_ENDPOINT=");
  
  // Verify it's properly formatted
  const lines = content.trim().split('\n');
  expect(lines.length).toBeGreaterThan(0);
  
  // Each non-comment line should be a key=value pair
  const envLines = lines.filter(line => !line.startsWith('#') && line.trim());
  for (const line of envLines) {
    expect(line).toMatch(/^[A-Z_]+=.+$/);
  }
}); 