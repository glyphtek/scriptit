# ScriptIt

[![npm version](https://badge.fury.io/js/%40glyphtek%2Fscriptit.svg)](https://badge.fury.io/js/@glyphtek/scriptit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/glyphtek/scriptit?style=social)](https://github.com/glyphtek/scriptit)

A powerful **cross-runtime** CLI and library built to create a configurable scripts runner. It supports environment variables, configuration files, dynamic script loading, a TUI for script selection, and a programmatic API for integration into other projects. **Now with enhanced support for lambda functions and default exports!**

## Features

*   **Cross-Runtime Compatibility:** Works seamlessly with Node.js (18+), Deno, and Bun
*   **CLI & Library:** Use it as a standalone command-line tool or integrate its core logic into your projects
*   **Interactive TUI:** A terminal-based UI with multiple panels to easily select and run scripts, view configuration, and see real-time output.
*   **Flexible Script Support:** 
    *   Traditional `execute` function pattern for structured scripts
    *   **NEW:** Default export support for lambda functions and existing code
    *   Automatic detection and execution of the appropriate function type
*   **Configuration Files:** Define runner behavior using a `runner.config.js` (or `.ts`) file.
    *   Specify script directories, temporary folders, and environment files.
    *   Define default parameters for scripts.
    *   **NEW:** Exclude patterns to filter out helper files and internal scripts
*   **Environment Variable Management:**
    *   Load `.env` files (e.g., `.env`, `.env.local`).
    *   Interpolate environment variables within configuration values (`${MY_VAR}`).
    *   Pass environment variables directly via CLI for single executions.
*   **Dynamic Script Loading:** Scripts are loaded fresh on each execution, allowing external updates without restarting the runner.
*   **Nested Script Discovery:** Automatically finds scripts in subdirectories.
*   **Script Execution Pipeline:** Scripts can define `tearUp()`, `execute()`, and `tearDown()` functions, executed in sequence.
    *   Passes a `context` object with environment variables, paths, and a logger to each pipeline function.
*   **Temporary Directory:** Provides a managed temporary directory for scripts.
*   **Git Integration:** `init` command can add the temporary folder to `.gitignore`.
*   **Lambda-Ready:** Perfect for existing lambda functions - just point ScriptIt at your functions directory!
*   **Extensible:** Designed to be adaptable to various scripting needs.

## Table of Contents

*   [Prerequisites](#prerequisites)
*   [Installation](#installation)
*   [CLI Usage](#cli-usage)
    *   [Initialize Project (`init`)](#initialize-project-init)
    *   [Run with TUI (`run` or default)](#run-with-tui-run-or-default)
    *   [Execute Single Script (`exec`)](#execute-single-script-exec)
*   [Library Usage](#library-usage)
*   [Configuration (`runner.config.js`)](#configuration-runnerconfigjs)
*   [Creating Scripts](#creating-scripts)
    *   [Script Structure](#script-structure)
    *   [The `context` Object](#the-context-object)
*   [Development](#development)
*   [Contributing](#contributing)
*   [License](#license)

## Prerequisites

Choose one of the following JavaScript runtimes:

*   **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
*   **[Deno](https://deno.land/)** (latest version)
*   **[Bun](https://bun.sh/)** (v1.0.0 or higher)

## Installation

### Global Installation

**Node.js:**
```bash
npm install -g @glyphtek/scriptit
# or
yarn global add @glyphtek/scriptit
```

**Bun:**
```bash
bun install -g @glyphtek/scriptit
```

**Deno:**
```bash
deno install --allow-read --allow-write --allow-run --allow-env -n scriptit npm:@glyphtek/scriptit
```

### Local Installation (for project-specific usage)

**Node.js:**
```bash
npm install @glyphtek/scriptit
# or
yarn add @glyphtek/scriptit
```

**Bun:**
```bash
bun add @glyphtek/scriptit
```

**Deno:**
```typescript
import { createScriptRunner } from "npm:@glyphtek/scriptit";
```

## CLI Usage

### Initialize Project (`init`)

```bash
scriptit init
```

This creates:
- A `scripts/` directory with example scripts
- A `tmp/` directory for temporary files
- A `runner.config.js` configuration file
- Updates `.gitignore` to exclude the tmp directory

### Run with TUI (`run` or default)

```bash
scriptit run
# or simply
scriptit
```

This opens an interactive Terminal UI where you can:
- Browse and select scripts with arrow keys (↑↓) or j/k
- View configuration details
- See real-time script output
- Navigate with keyboard shortcuts:
  - **↑↓** or **j/k**: Navigate script list
  - **Tab**: Switch between panels
  - **Enter**: Execute selected script
  - **C**: Toggle configuration panel
  - **F**: Toggle file list
  - **R**: Refresh script list
  - **Q** or **Ctrl+C**: Quit

### Execute Single Script (`exec`)

```bash
scriptit exec ./scripts/my-script.ts
# or with environment variables
scriptit exec ./scripts/my-script.ts -e NODE_ENV=production API_KEY=secret
# or from a different working directory
scriptit --pwd /path/to/project exec ./scripts/my-script.ts
```

### Working Directory Option (`--pwd`)

The `--pwd` option allows you to run ScriptIt from any directory while having all relative paths resolve from a specific location:

```bash
# Run from anywhere, but resolve paths from /path/to/project
scriptit --pwd /path/to/project run

# Execute a script with working directory
scriptit --pwd /path/to/project exec ./scripts/deploy.ts

# Initialize a project in a specific directory
scriptit --pwd /path/to/new-project init
```

This is particularly useful for:
- **CI/CD pipelines** - Run scripts from build directories
- **Automation tools** - Execute scripts from different project locations
- **Lambda functions** - Point to existing function directories
- **Multi-project setups** - Manage scripts across different repositories

## Script Types Supported

ScriptIt supports multiple script patterns:

### Traditional Execute Pattern
```typescript
// scripts/traditional.ts
export const description = "Traditional script with lifecycle";

export async function tearUp(context) {
  // Setup logic
  return setupData;
}

export async function execute(context, tearUpResult) {
  // Main logic
  return result;
}

export async function tearDown(context, executeResult, tearUpResult) {
  // Cleanup logic
}
```

### Lambda/Default Export Pattern
```typescript
// scripts/lambda.ts
export const description = "Lambda-style script";

export default async function(context) {
  // Your existing lambda function logic
  return result;
}
```

### Debugging

ScriptIt uses an environment variable to enable detailed debug logging to the console. This is helpful for troubleshooting issues with configuration loading, script discovery, or internal operations.

To enable debug mode, set the `SCRIPTIT_DEBUG` environment variable to `true`:

**Bash/Zsh:**

```bash
export SCRIPTIT_DEBUG=true
scriptit run
# or for a single command
SCRIPTIT_DEBUG=true scriptit exec ./scripts/my-script.ts
```

## Library Usage

ScriptIt can be used programmatically in your applications across different runtimes:

**Node.js/Bun:**
```typescript
import { createScriptRunner } from '@glyphtek/scriptit';
```

**Deno:**
```typescript
import { createScriptRunner } from "npm:@glyphtek/scriptit";
```

**Example usage:**
```typescript
// Basic usage
const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp',
  excludePatterns: ['*.helper.*', '_*'],
});

// With working directory (all paths resolve from this directory)
const runner = await createScriptRunner({
  workingDirectory: '/path/to/project',
  scriptsDir: './scripts',  // Resolves to /path/to/project/scripts
  tmpDir: './tmp',          // Resolves to /path/to/project/tmp
});

// Execute scripts
const result = await runner.executeScript('my-script.ts', {
  params: { customParam: 'value' },
  env: { NODE_ENV: 'production' },
});

// List available scripts
const scripts = await runner.listScripts();

// Event handling
runner.on('script:beforeExecute', (scriptPath, params) => {
  console.log(`Executing: ${scriptPath}`);
});
```

### Working Directory in Library Mode

The `workingDirectory` option is particularly useful for:

```typescript
// CI/CD integration
const runner = await createScriptRunner({
  workingDirectory: process.env.BUILD_DIR,
  scriptsDir: './deployment-scripts',
});

// Multi-project management
const projectRunner = await createScriptRunner({
  workingDirectory: '/projects/my-app',
  scriptsDir: './scripts',
});

// Lambda function integration
const lambdaRunner = await createScriptRunner({
  workingDirectory: '/lambda-functions',
  scriptsDir: './',  // Use the lambda directory directly
  excludePatterns: ['node_modules/**', '*.test.*'],
});
```

## Configuration (`runner.config.js`)

ScriptIt uses a configuration file to define how scripts are discovered and executed. Create a `runner.config.js` (or `.ts`) file in your project root:

```javascript
// runner.config.js
export default {
  // Directory containing your scripts (relative to config file)
  scriptsDir: './scripts',
  
  // Directory for temporary files (relative to config file)
  tmpDir: './tmp',
  
  // Environment files to load (in order of precedence)
  envFiles: [
    '.env',          // Base environment
    '.env.local',    // Local overrides (gitignored)
    '.env.production' // Environment-specific
  ],
  
  // Patterns to exclude from script discovery
  excludePatterns: [
    '**/node_modules/**',  // Exclude dependencies
    '**/*.test.*',         // Exclude test files
    '**/*.helper.*',       // Exclude helper files
    '_*',                  // Exclude files starting with underscore
    '**/helpers/**'        // Exclude helpers directory
  ],
  
  // Default parameters available to all scripts
  defaultParams: {
    appName: 'My Application',
    version: '1.0.0',
    apiUrl: '${API_BASE_URL}/api/v1', // Environment variable interpolation
  }
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scriptsDir` | `string` | `"scripts"` | Directory containing executable scripts |
| `tmpDir` | `string` | `"tmp"` | Directory for temporary files |
| `envFiles` | `string[]` | `[".env"]` | Environment files to load |
| `excludePatterns` | `string[]` | `[]` | Glob patterns to exclude from script discovery |
| `defaultParams` | `object` | `{}` | Default parameters passed to all scripts |

## Creating Scripts

### Script Structure

ScriptIt supports two main script patterns:

#### 1. Traditional Lifecycle Pattern

```typescript
// scripts/example.ts
export const description = "Example script with full lifecycle";

// Optional: Setup phase
export async function tearUp(context) {
  context.log('Setting up resources...');
  
  // Initialize databases, create temp files, etc.
  const setupData = {
    startTime: Date.now(),
    tempFile: `${context.tmpDir}/setup-${Date.now()}.json`
  };
  
  return setupData; // Passed to execute and tearDown
}

// Required: Main execution logic
export async function execute(context, tearUpResult) {
  context.log('Executing main logic...');
  
  // Access environment variables
  const apiKey = context.env.API_KEY;
  
  // Access default parameters
  const appName = context.appName;
  
  // Use tearUp results
  const duration = Date.now() - tearUpResult.startTime;
  
  return { success: true, duration };
}

// Optional: Cleanup phase
export async function tearDown(context, executeResult, tearUpResult) {
  context.log('Cleaning up...');
  
  // Clean up resources, delete temp files, etc.
  if (tearUpResult.tempFile) {
    // Clean up temp file
  }
}
```

#### 2. Lambda/Default Export Pattern

```typescript
// scripts/lambda-style.ts
export const description = "Lambda-style script";

// Perfect for existing lambda functions
export default async function(context) {
  context.log('Lambda execution starting...');
  
  // Your existing lambda logic here
  const result = await processData(context.env.INPUT_DATA);
  
  return result;
}
```

### The `context` Object

Every script receives a `context` object with the following properties:

```typescript
interface ScriptContext {
  // Environment variables (from .env files + system + defaults)
  env: Record<string, string | undefined>;
  
  // Temporary directory path
  tmpDir: string;
  
  // Path to the loaded configuration file
  configPath?: string;
  
  // Logging function
  log: (message: string) => void;
  
  // Default parameters from config (also available in env)
  [key: string]: any;
}
```

#### Using the Context

```typescript
export async function execute(context) {
  // Logging
  context.log('Starting execution...');
  
  // Environment variables
  const dbUrl = context.env.DATABASE_URL;
  const nodeEnv = context.env.NODE_ENV || 'development';
  
  // Default parameters
  const appName = context.appName; // From defaultParams
  
  // Temporary files
  const tempFile = `${context.tmpDir}/processing-${Date.now()}.json`;
  
  // Configuration info
  context.log(`Config loaded from: ${context.configPath}`);
}
```

### Script Discovery Rules

1. **File Extensions**: Only `.js` and `.ts` files are discovered
2. **Recursive Search**: Searches all subdirectories
3. **Exclude Patterns**: Files matching `excludePatterns` are ignored
4. **Function Priority**: `default` export takes precedence over `execute` function

### Best Practices

- **Use descriptive names**: `deploy-production.ts` vs `script1.ts`
- **Add descriptions**: Export a `description` string for documentation
- **Handle errors gracefully**: Use try/catch blocks and meaningful error messages
- **Use tearUp/tearDown**: For resource management and cleanup
- **Leverage environment variables**: For configuration and secrets
- **Keep scripts focused**: One responsibility per script

## Development

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+ or **Deno** (latest)
- **TypeScript** 5.0+ (for development)

### Setup

```bash
# Clone the repository
git clone https://github.com/glyphtek/scriptit.git
cd scriptit

# Install dependencies
bun install
# or
npm install

# Build the project
bun run build

# Run tests
bun test
```

### Project Structure

```
src/
├── common/              # Shared utilities
│   ├── logger/          # Logging functionality
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Utility functions
├── core/                # Core functionality
│   ├── config-loader.ts # Configuration loading
│   ├── env-loader.ts    # Environment variable loading
│   └── script-executor.ts # Script execution engine
├── ui/                  # User interface
│   └── blessed-ui.ts    # Terminal UI implementation
├── cli.ts               # Command-line interface
└── lib.ts               # Library API

tests/                   # Test suites
examples/                # Usage examples
├── ui/                  # CLI/TUI examples
└── lib/                 # Library usage examples
```

### Scripts

```bash
# Development
bun run dev              # Run CLI in development mode
bun run dev:watch        # Watch mode

# Building
bun run build            # Build for production
bun run build:bun        # Build with Bun bundler

# Testing
bun test                 # Run all tests
bun run test:lib         # Run library tests only
bun run test:ui          # Test UI examples

# Code Quality
bun run lint             # Lint code
bun run format           # Format code
bun run check            # Lint + format
```

### Contributing Guidelines

1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Follow TypeScript best practices** and existing code style
4. **Update documentation** for new features
5. **Ensure cross-runtime compatibility** (Node.js, Deno, Bun)
6. **Run tests and linting** before submitting

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Ways to Contribute

- **Bug Reports**: Open an issue with reproduction steps
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Submit pull requests
- **Documentation**: Improve docs and examples
- **Testing**: Add test cases and improve coverage

### Development Workflow

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `bun test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**ScriptIt** - Making script management simple and powerful across all JavaScript runtimes.
