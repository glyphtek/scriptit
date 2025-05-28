// example/scripts/hello.ts
// A simple hello world script

export const description = "A simple hello world script that demonstrates basic functionality";

export async function execute(context: any) {
  context.log("Hello, World!");
  context.log(`Project: ${context.projectName || "Unknown"}`);
  context.log(`Environment: ${context.environment || context.env.NODE_ENV || "development"}`);
  context.log(`My Variable: ${context.env.MY_VARIABLE || "Not set"}`);
  
  return { message: "Hello world completed successfully" };
} 