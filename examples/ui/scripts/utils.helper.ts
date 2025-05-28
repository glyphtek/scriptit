// example/scripts/utils.helper.ts
// This file should be excluded by the *.helper.* pattern

export function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-');
}

export function validateEnvironmentVars(context: any, requiredVars: string[]): void {
  for (const varName of requiredVars) {
    if (!context.env[varName]) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
  }
}

export function createTempPath(context: any, filename: string): string {
  return `${context.tmpDir}/${filename}`;
} 