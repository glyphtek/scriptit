// examples/ui/scripts/lambda-test.ts
// Test script demonstrating default export (lambda-style) functionality

export const description = "Lambda-style script using default export - perfect for existing lambda functions";

/**
 * Default export function - ScriptIt will automatically detect and use this
 * This pattern is perfect for:
 * - Existing lambda functions
 * - Simple scripts without complex lifecycle
 * - Quick automation tasks
 */
export default async function(context: any) {
  context.log("🚀 Lambda-style execution starting...");
  
  // Access environment variables
  context.log(`📍 Environment: ${context.env.NODE_ENV || 'development'}`);
  context.log(`📁 Working directory: ${process.cwd()}`);
  context.log(`🗂️  Temp directory: ${context.tmpDir}`);
  
  // Simulate some async work (like API calls, file processing, etc.)
  context.log("⏳ Processing data...");
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Example of using environment variables for configuration
  const apiEndpoint = context.env.API_ENDPOINT || 'https://api.example.com';
  context.log(`🌐 API Endpoint: ${apiEndpoint}`);
  
  // Create some output in the temp directory
  const outputFile = `${context.tmpDir}/lambda-output-${Date.now()}.json`;
  const outputData = {
    timestamp: new Date().toISOString(),
    success: true,
    message: "Lambda execution completed successfully",
    environment: context.env.NODE_ENV || 'development',
    processId: process.pid,
    nodeVersion: process.version,
  };
  
  await Bun.write(outputFile, JSON.stringify(outputData, null, 2));
  context.log(`💾 Output saved to: ${outputFile}`);
  
  context.log("✅ Lambda-style execution completed!");
  
  return outputData;
} 