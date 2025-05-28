// example/scripts/_internal.ts
// This file should be excluded by the _* pattern

export const INTERNAL_CONFIG = {
  maxRetries: 3,
  timeout: 30000,
  debugMode: false,
};

export function internalFunction() {
  console.log("This is an internal function that shouldn't be directly executable");
} 