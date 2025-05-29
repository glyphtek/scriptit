// examples/simple-colored-test.ts
// Simple test script to demonstrate colored console interception

export const description = "Simple test for colored console interception";

export async function execute(context: any) {
  context.log("=== Testing Basic Colored Console Interception ===");
  
  // Test different console methods with colors
  console.log("This is a regular console.log message (white)");
  console.error("This is a console.error message (red)");
  console.warn("This is a console.warn message (yellow)");
  console.info("This is a console.info message (blue)");
  console.debug("This is a console.debug message (gray)");
  
  context.log("\n--- Testing with simple data ---");
  
  // Test with simple objects
  console.log("Simple object:", { name: "test", value: 42 });
  console.error("Simple error:", new Error("Test error"));
  console.warn("Simple array:", [1, 2, 3]);
  console.info("Simple boolean:", true);
  console.debug("Simple number:", 123);
  
  context.log("=== Simple Colored Console Test Complete ===");
  
  return { 
    success: true, 
    message: "Simple colored console test completed"
  };
} 