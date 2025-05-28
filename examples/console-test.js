// examples/console-test.js
// Simple test script to verify console interception

export const description = "Console interception test";

export async function execute(context) {
  context.log("=== Console Interception Test ===");
  
  // Test basic console methods
  console.log("Hello from console.log!");
  console.error("This is console.error");
  console.warn("This is console.warn");
  console.info("This is console.info");
  console.debug("This is console.debug");
  
  // Test with multiple arguments
  console.log("Multiple", "arguments", "test", 123, true);
  
  // Test with objects
  console.log("Object test:", { name: "test", value: 42 });
  
  context.log("=== Test Complete ===");
  
  return { success: true };
} 