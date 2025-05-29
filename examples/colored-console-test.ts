// examples/colored-console-test.ts
// Test script to demonstrate colored console interception

export const description = "Test script demonstrating colored console interception";

export async function execute(context: any) {
  context.log("=== Testing Colored Console Interception ===");
  
  // Test different console methods with colors
  console.log("This is a regular console.log message (white)");
  console.error("This is a console.error message (red)");
  console.warn("This is a console.warn message (yellow)");
  console.info("This is a console.info message (blue)");
  console.debug("This is a console.debug message (gray)");
  
  context.log("\n--- Testing with objects and complex data ---");
  
  // Test with objects
  console.log("Object logging:", { name: "test", value: 42, nested: { data: "example" } });
  console.error("Error object:", new Error("Test error for demonstration"));
  console.warn("Warning with array:", [1, 2, 3, "warning", { key: "value" }]);
  console.info("Info with boolean and null:", true, null, undefined);
  console.debug("Debug with mixed types:", "string", 123, { debug: true });
  
  context.log("\n--- Testing with multiple arguments ---");
  
  // Test with multiple arguments
  console.log("Multiple", "arguments", "in", "log", 123, true);
  console.error("Error", "with", "multiple", "args:", { error: "data" });
  console.warn("Warning", "message", "with", "numbers:", 1, 2, 3);
  console.info("Info", "about", "something:", "important");
  console.debug("Debug", "trace", "with", "details:", { timestamp: Date.now() });
  
  context.log("\n--- Testing edge cases ---");
  
  // Test edge cases
  console.log(); // Empty log
  console.error(""); // Empty string
  console.warn(null); // Null value
  console.info(undefined); // Undefined value
  console.debug(0); // Zero value
  
  context.log("\n--- Simulating real application logs ---");
  
  // Simulate real application scenarios
  console.info("Application started successfully");
  console.log("Processing user request...");
  console.debug("Database connection established");
  console.warn("Deprecated API endpoint used - please update");
  console.error("Failed to process payment - insufficient funds");
  console.log("Request completed in 245ms");
  
  context.log("=== Colored Console Interception Test Complete ===");
  
  return { 
    success: true, 
    message: "Colored console interception test completed",
    logLevelsUsed: ["log", "error", "warn", "info", "debug"]
  };
} 