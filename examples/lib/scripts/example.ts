// scripts/example.ts
// Example script for library usage

export const description = "Example script demonstrating library integration";

export async function execute(context: any) {
  context.log("🎯 Executing example script from library");
  context.log(`📱 App: ${context.appName || "Unknown"}`);
  context.log(`🔢 Version: ${context.version || "Unknown"}`);
  context.log(`💬 Custom message: ${context.params?.customMessage || "No message"}`);
  context.log(`🔧 Execution mode: ${context.env.EXECUTION_MODE || "unknown"}`);
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: "Example script completed",
    timestamp: new Date().toISOString(),
  };
}