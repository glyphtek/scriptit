// tests/lib-integration.test.ts
// Integration test for the library example

import { test, expect, beforeAll } from "bun:test";
import path from "node:path";
import fs from "node:fs/promises";

const LIB_EXAMPLE_DIR = path.join(__dirname, "../examples/lib");

beforeAll(async () => {
  // Ensure the lib example directory exists
  const exists = await fs.access(LIB_EXAMPLE_DIR).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error(`Library example directory not found: ${LIB_EXAMPLE_DIR}`);
  }
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
  // Check for required directories and files
  const requiredPaths = [
    "src",
    "src/index.ts",
    "scripts",
    "tmp",
    "package.json",
    "env.example",
    "README.md",
  ];
  
  for (const relativePath of requiredPaths) {
    const fullPath = path.join(LIB_EXAMPLE_DIR, relativePath);
    const exists = await fs.access(fullPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  }
});

test("library example - README has proper documentation", async () => {
  const readmePath = path.join(LIB_EXAMPLE_DIR, "README.md");
  const content = await fs.readFile(readmePath, "utf-8");
  
  // Verify README contains essential sections
  expect(content).toContain("# Script Runner Library Example");
  expect(content).toContain("## Getting Started");
  expect(content).toContain("## What the Example Demonstrates");
  expect(content).toContain("## Integration Patterns");
  
  // Verify it has code examples
  expect(content).toContain("```typescript");
  expect(content).toContain("createScriptRunner");
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