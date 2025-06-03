# What is ScriptIt?

ScriptIt is a powerful, cross-runtime script runner designed to simplify JavaScript and TypeScript execution across different runtime environments. Whether you're using Bun, Node.js, or Deno, ScriptIt provides a unified interface with enhanced developer experience features.

## The Problem

Modern JavaScript development involves multiple runtime environments, each with their own quirks and capabilities. Developers often face challenges like:

- **Runtime fragmentation**: Different commands and behaviors across Bun, Node.js, and Deno
- **Environment management**: Complex setup for different environments and configurations
- **Debugging difficulties**: Plain console output without visual distinction between log levels
- **Script organization**: No unified way to manage and execute scripts across projects
- **Development workflow**: Switching between different tools and interfaces

## The Solution

ScriptIt addresses these challenges by providing:

### 🎯 **Unified Interface**
One tool that works consistently across all major JavaScript runtimes. Write once, run anywhere.

### 🎨 **Enhanced Developer Experience**
Beautiful colored console output, interactive TUI, and rich context for better debugging and monitoring.

### 🔧 **Smart Environment Management**
Automatic .env file loading, runtime detection, and configuration management.

### ⚡ **Performance Optimized**
Built with Bun in mind but optimized for all runtimes with minimal overhead.

### 📦 **Flexible Usage**
Use as a CLI tool for quick scripts or integrate as a library in larger applications.

## Key Features

### Cross-Runtime Compatibility
```bash
# Same command works with any runtime
scriptit exec my-script.js --runtime bun
scriptit exec my-script.js --runtime node
scriptit exec my-script.js --runtime deno
```

### Colored Console Output
```javascript
// my-script.js - Automatic color coding for better visibility
export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Info message');    // White
  console.error('Error message'); // Red
  console.warn('Warning');        // Yellow
  console.info('Information');    // Blue
  console.debug('Debug info');    // Gray
}
```

### Interactive Terminal UI
```bash
# Launch interactive script manager
scriptit run
```

### Environment Management
```bash
# Automatic .env loading and environment setup
scriptit exec script.js --env production
```

## Use Cases

### 🚀 **Rapid Prototyping**
Quickly test ideas and concepts without setting up complex build processes.

```javascript
// quick-test.js - Rapid prototyping script
export const description = "Quick API test script";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('Testing API...');
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  console.log('API Response:', json);
  
  return { success: true, data: json };
}
```

Run with:
```bash
scriptit exec quick-test.js
```

### 🔧 **Build Scripts & Automation**
Replace complex build tools with simple, readable scripts.

```javascript
// build.js
export const description = "Build script with colored output";

export async function execute(context) {
  const console = context.console || global.console;

  console.info('Starting build process...');
  // Your build logic here
  console.log('✅ Build completed successfully');
  
  return { success: true };
}
```

### 🧪 **Testing & Debugging**
Enhanced console output makes debugging more efficient.

```javascript
// debug.js
export const description = "Debug script with enhanced logging";

export async function execute(context) {
  const console = context.console || global.console;

  console.debug('Starting debug session');
  console.log('Processing user data:', userData);
  console.warn('Deprecated API usage detected');
  console.error('Critical error in payment processing');
  
  return { debugComplete: true };
}
```

### 📊 **Data Processing**
Process data files with rich logging and error handling.

```javascript
// process-data.js
export const description = "Data processing script";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = require('fs');

  console.info('Loading data file...');
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

  console.log(`Processing ${data.length} records`);
  // Processing logic...
  console.log('✅ Data processing complete');
  
  return { recordsProcessed: data.length };
}
```

### 🔄 **CI/CD Integration**
Integrate into continuous integration pipelines with consistent behavior.

```bash
# In your CI pipeline
scriptit exec deploy.js --runtime node --env production
```

## Architecture

ScriptIt is built with a modular architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Interface │    │  Library API    │    │  Terminal UI    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │      Script Executor       │
                    │   (Core Engine)            │
                    └─────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐         ┌───────▼───────┐       ┌───────▼───────┐
    │    Bun    │         │    Node.js    │       │     Deno      │
    │  Runtime  │         │   Runtime     │       │   Runtime     │
    └───────────┘         └───────────────┘       └───────────────┘
```

### Core Components

- **Script Executor**: The heart of ScriptIt, handles script execution across runtimes
- **Console Interceptor**: Provides colored console output and enhanced logging
- **Environment Manager**: Handles .env files and environment variables
- **Runtime Detector**: Automatically detects and selects the best runtime
- **TUI Engine**: Powers the interactive terminal interface

## Philosophy

ScriptIt is built on these core principles:

### **Developer First**
Every feature is designed to improve the developer experience, from colored console output to interactive interfaces.

### **Runtime Agnostic**
Support all major JavaScript runtimes without favoring one over another (though optimized for Bun).

### **Zero Configuration**
Work out of the box with sensible defaults, but allow customization when needed.

### **Performance Conscious**
Minimal overhead and efficient execution across all supported runtimes.

### **Extensible**
Designed to be extended and integrated into larger workflows and applications.

## Getting Started

Ready to try ScriptIt? Head over to the [Getting Started](/getting-started) guide to install and run your first script with colored console output!

## Community

- 🐛 [Report Issues](https://github.com/glyphtek/scriptit/issues)
- 💬 [Join Discussions](https://github.com/glyphtek/scriptit/discussions)
- 📖 [Contribute](https://github.com/glyphtek/scriptit/blob/main/CONTRIBUTING.md)
- ⭐ [Star on GitHub](https://github.com/glyphtek/scriptit) 