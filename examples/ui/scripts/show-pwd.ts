// examples/ui/scripts/show-pwd.ts
// Demonstrates working directory functionality

export const description = "Shows current working directory and path information";

export default async function(context: any) {
  context.log("📍 Working Directory Information:");
  context.log(`   Current working directory: ${process.cwd()}`);
  context.log(`   Script execution directory: ${__dirname || 'N/A'}`);
  context.log(`   Temp directory: ${context.tmpDir}`);
  context.log(`   Config path: ${context.configPath || 'Not specified'}`);
  
  context.log("\n🔧 Environment Variables:");
  context.log(`   NODE_ENV: ${context.env.NODE_ENV || 'not set'}`);
  context.log(`   HOME: ${context.env.HOME || 'not set'}`);
  
  context.log("\n📂 Path Resolution:");
  const relativePath = "./test-file.txt";
  const absolutePath = require('path').resolve(relativePath);
  context.log(`   Relative path "${relativePath}" resolves to:`);
  context.log(`   ${absolutePath}`);
  
  return {
    cwd: process.cwd(),
    tmpDir: context.tmpDir,
    configPath: context.configPath,
    resolvedPath: absolutePath,
  };
} 