// examples/simple-console-test.js
// Simple test script to test console interception

export const description = "Simple console interception test";

export async function execute(context) {
  context.log("=== Simple Console Test ===");
  
  // Test basic console methods
  console.log("Hello from console.log");
  console.error("Hello from console.error");
  console.warn("Hello from console.warn");
  
  context.log("=== Test Complete ===");
  
  return { success: true };
} 