// examples/basic-test.js
// Basic test script without console usage

export const description = "Basic test without console";

export async function execute(context) {
  context.log("Starting basic test");
  
  // Just do some basic operations
  const result = 1 + 1;
  
  context.log(`Result: ${result}`);
  context.log("Basic test complete");
  
  return { success: true, result };
} 