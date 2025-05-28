// examples/console-test.ts
// Test script to demonstrate console interception

export const description = "Test script demonstrating console interception";

export async function execute(context: any) {
  context.log("=== Testing Console Interception ===");
  
  // Test basic console methods
  console.log("This is a console.log message");
  console.error("This is a console.error message");
  console.warn("This is a console.warn message");
  console.info("This is a console.info message");
  
  // Test with objects
  console.log("Object logging:", { name: "test", value: 42 });
  console.error("Error object:", new Error("Test error"));
  
  // Test with multiple arguments
  console.log("Multiple", "arguments", "test", 123, true);
  
  // Test console.dir
  console.dir({ nested: { object: "test" } });
  
  // Test console.table (if supported)
  console.table([
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 }
  ]);
  
  // Test console.group
  console.group("Grouped messages");
  console.log("Message inside group");
  console.warn("Warning inside group");
  console.groupEnd();
  
  // Test console.time
  console.time("timer-test");
  await new Promise(resolve => setTimeout(resolve, 100));
  console.timeEnd("timer-test");
  
  // Test console.count
  console.count("test-counter");
  console.count("test-counter");
  console.count("test-counter");
  
  // Test console.assert
  console.assert(true, "This assertion should not show");
  console.assert(false, "This assertion should show");
  
  context.log("=== Console Interception Test Complete ===");
  
  return { success: true, message: "Console interception test completed" };
} 