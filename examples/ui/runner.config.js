// example/runner.config.js
// Example configuration for ScriptIt

export default {
  scriptsDir: './scripts',
  tmpDir: './tmp',
  envFiles: [
    '.env',
    '.env.local',
  ],
  defaultParams: {
    projectName: "Example Project",
    version: "${PROJECT_VERSION}",
    environment: "${NODE_ENV}",
  },
  excludePatterns: [
    "*.helper.*",     // Exclude helper files
    "_*",             // Exclude files starting with underscore
    "helpers/**",     // Exclude entire helpers directory
    "*.test.*",       // Exclude test files
  ],
}; 