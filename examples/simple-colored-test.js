// examples/simple-colored-test.js
// Simple test script to demonstrate colored console interception

export const description = "Simple test for colored console interception";

export async function execute(context) {
  context.log("=== Testing Basic Colored Console Interception ===");
  
  // Test different console methods with colors
  console.log("This is a regular console.log message (white)");
  console.error("This is a console.error message (red)");
  console.warn("This is a console.warn message (yellow)");
  console.info("This is a console.info message (blue)");
  console.debug("This is a console.debug message (gray)");
  
  context.log("=== Simple Colored Console Test Complete ===");
  
  return { 
    success: true, 
    message: "Simple colored console test completed"
  };
} 