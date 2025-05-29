// examples/context-console-test.js
// Test script using context.console for colored output

export const description = "Test script using context.console for colored output";

export async function execute(context) {
  context.log("=== Testing Context Console with Colors ===");
  
  // Use context.console if available, fallback to global console
  const console = context.console || global.console;
  
  // Test different console methods with colors
  console.log("This is a console.log message (should be white)");
  console.error("This is a console.error message (should be red)");
  console.warn("This is a console.warn message (should be yellow)");
  console.info("This is a console.info message (should be blue)");
  console.debug("This is a console.debug message (should be gray)");
  
  context.log("\n--- Testing with simple objects ---");
  
  // Test with simple objects
  console.log("Simple object:", { name: "test", value: 42 });
  console.error("Simple error:", new Error("Test error"));
  console.warn("Simple array:", [1, 2, 3]);
  console.info("Simple boolean:", true);
  console.debug("Simple number:", 123);
  
  context.log("=== Context Console Test Complete ===");
  
  return { 
    success: true, 
    message: "Context console test completed"
  };
} 