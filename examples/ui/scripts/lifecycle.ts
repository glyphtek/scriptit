// example/scripts/lifecycle.ts
// Demonstrates the full tearUp -> execute -> tearDown lifecycle

export const description = "Demonstrates the complete script lifecycle with tearUp, execute, and tearDown";

export async function tearUp(context: any) {
  context.log("TearUp: Setting up resources...");
  
  // Simulate some setup work
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const setupData = {
    timestamp: new Date().toISOString(),
    tempFile: `${context.tmpDir}/lifecycle-${Date.now()}.txt`,
    initialized: true,
  };
  
  // Create a temporary file
  await Bun.write(setupData.tempFile, "Temporary data from tearUp\n");
  context.log(`TearUp: Created temp file: ${setupData.tempFile}`);
  
  return setupData;
}

export async function execute(context: any, tearUpResult: any) {
  context.log("Execute: Running main logic...");
  context.log(`Execute: Using data from tearUp: ${JSON.stringify(tearUpResult)}`);
  
  // Read from the temp file created in tearUp
  const tempContent = await Bun.file(tearUpResult.tempFile).text();
  context.log(`Execute: Read from temp file: ${tempContent.trim()}`);
  
  // Append to the temp file
  await Bun.write(tearUpResult.tempFile, tempContent + "Additional data from execute\n");
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const result = {
    success: true,
    processedAt: new Date().toISOString(),
    dataProcessed: "Sample data processing completed",
  };
  
  context.log("Execute: Main logic completed successfully");
  return result;
}

export async function tearDown(context: any, executeResult: any, tearUpResult: any) {
  context.log("TearDown: Cleaning up resources...");
  context.log(`TearDown: Execute result: ${JSON.stringify(executeResult)}`);
  
  // Clean up the temporary file
  try {
    await Bun.file(tearUpResult.tempFile).text(); // Check if file exists
    // In a real scenario, you might delete the file here
    // For demo purposes, we'll just log that we would clean it up
    context.log(`TearDown: Would clean up temp file: ${tearUpResult.tempFile}`);
  } catch (error) {
    context.log("TearDown: Temp file already cleaned up or doesn't exist");
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
  context.log("TearDown: Cleanup completed");
} 