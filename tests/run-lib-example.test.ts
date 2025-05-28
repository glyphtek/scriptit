// tests/run-lib-example.test.ts
// Test that actually runs the library example to ensure it works end-to-end

import { test, expect, beforeAll, afterAll } from "bun:test";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

const LIB_EXAMPLE_DIR = path.join(__dirname, "../examples/lib");
const ENV_FILE = path.join(LIB_EXAMPLE_DIR, ".env");

beforeAll(async () => {
  // Set up environment file for the test
  const envContent = `NODE_ENV=test
LOG_LEVEL=info
PROCESSING_MODE=test
API_ENDPOINT=https://test.example.com
TEST_INTERPOLATION=test-value`;
  
  await fs.writeFile(ENV_FILE, envContent);
});

afterAll(async () => {
  // Clean up
  try {
    await fs.unlink(ENV_FILE);
  } catch (error) {
    // Ignore if file doesn't exist
  }
});

function runLibraryExample(): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", ["start"], {
      cwd: LIB_EXAMPLE_DIR,
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
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });

    child.on("error", (error) => {
      reject(error);
    });

    // Set a timeout to prevent hanging
    setTimeout(() => {
      child.kill();
      reject(new Error("Library example execution timed out"));
    }, 30000); // 30 second timeout
  });
}

test("library example - runs successfully end-to-end", async () => {
  const result = await runLibraryExample();
  
  // Should exit successfully
  expect(result.exitCode).toBe(0);
  
  // Should not have critical errors
  expect(result.stderr).not.toContain("Error:");
  expect(result.stderr).not.toContain("Failed to");
  
  // Should contain expected output
  expect(result.stdout).toContain("🚀 Script Runner Library Example");
  expect(result.stdout).toContain("✅ Script runner initialized successfully");
  expect(result.stdout).toContain("📋 Listing available scripts");
  expect(result.stdout).toContain("🎉 Library example completed successfully");
});

test("library example - creates and executes scripts", async () => {
  const result = await runLibraryExample();
  
  expect(result.exitCode).toBe(0);
  
  // Should create example scripts
  expect(result.stdout).toContain("📝 Created example scripts");
  expect(result.stdout).toContain("scripts/example.ts");
  expect(result.stdout).toContain("scripts/data-processor.ts");
  
  // Should execute scripts successfully
  expect(result.stdout).toContain("🎯 Executing example script");
  expect(result.stdout).toContain("✅ Script execution completed");
  expect(result.stdout).toContain("📤 Result:");
});

test("library example - demonstrates event handling", async () => {
  const result = await runLibraryExample();
  
  expect(result.exitCode).toBe(0);
  
  // Should set up event listeners
  expect(result.stdout).toContain("🎧 Setting up event listeners");
  
  // Should show event handling in action
  expect(result.stdout).toContain("🔄 About to execute:");
  expect(result.stdout).toContain("✅ Completed:");
});

test("library example - handles configuration properly", async () => {
  const result = await runLibraryExample();
  
  expect(result.exitCode).toBe(0);
  
  // Should show configuration details
  expect(result.stdout).toContain("📁 Scripts directory:");
  expect(result.stdout).toContain("📁 Temp directory:");
  expect(result.stdout).toContain("🔧 Exclude patterns:");
}); 