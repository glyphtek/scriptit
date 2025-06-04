# ScriptIt

[![npm version](https://badge.fury.io/js/%40glyphtek%2Fscriptit.svg)](https://badge.fury.io/js/@glyphtek/scriptit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/glyphtek/scriptit?style=social)](https://github.com/glyphtek/scriptit)

A powerful **cross-runtime** script runner with TUI, environment management, and colored console output. Works seamlessly with Node.js, Bun, and Deno.

**🎨 NEW in v0.5.1:** Enhanced documentation and improved GitHub Pages deployment!

**🎯 NEW in v0.6.0:** Interactive Environment Prompts for secure variable collection!

**🏗️ NEW in v0.7.0:** Unified architecture with CLI refactoring and enhanced TUI experience!

## 🚀 Quick Start

```bash
# Install globally
bun add -g @glyphtek/scriptit

# Initialize a new project
scriptit init

# Run the interactive TUI
scriptit run

# Or execute a single script (colored console enabled by default)
scriptit exec ./scripts/my-script.js
```

## 📚 Documentation

**[📖 Visit the full documentation site →](https://scriptit.github.io/)**

- 🚀 [Getting Started Guide](https://scriptit.github.io/getting-started)
- 🎨 [Colored Console Output](https://scriptit.github.io/features/console-colors)
- 🖥️ [CLI Commands](https://scriptit.github.io/cli/commands)
- 📦 [Library API](https://scriptit.github.io/library/api)
- 💡 [Examples](https://scriptit.github.io/examples/)

## ✨ Key Features

### 🎨 **Developer Experience**
- **Colored Console Output:** Automatic color coding for console methods with beautiful output
  - 🤍 White for `console.log()` • 🔴 Red for `console.error()`
  - 🟡 Yellow for `console.warn()` • 🔵 Blue for `console.info()` • ⚫ Gray for `console.debug()`
- **Interactive Terminal UI:** Multi-panel interface for script selection and real-time output
- **Enhanced Script Context:** Rich context object with colored console support

### ⚡ **Runtime & Performance**
- **Cross-Runtime Compatibility:** Node.js (18+), Deno, and Bun support
- **Dynamic Script Loading:** Fresh loading on each execution for external updates
- **Lambda Function Support:** Perfect for existing functions - just point and run!
- **Flexible Script Patterns:** Traditional lifecycle or modern default export functions

### 🔧 **Configuration & Environment**
- **Configuration Files:** `runner.config.js` for project-specific behavior
- **Environment Management:** Smart `.env` file loading with variable interpolation
- **Script Discovery:** Automatic nested discovery with customizable exclude patterns
- **Working Directory Support:** Run from anywhere with `--pwd` option

### 📦 **Integration Ready**
- **CLI & Library:** Use standalone or integrate into your applications
- **Event System:** Listen to script execution events
- **Git Integration:** Smart `.gitignore` management for temporary files

## Table of Contents

*   [Prerequisites](#prerequisites)
*   [Installation](#installation)
*   [CLI Usage](#cli-usage)
*   [Script Types & Examples](#script-types--examples)
*   [Library Usage](#library-usage)
*   [Configuration](#configuration)
*   [Migration Guide](#migration-guide)
*   [Troubleshooting](#troubleshooting)
*   [Development](#development)
*   [Community & Support](#community--support)

## Prerequisites

Choose one of the following JavaScript runtimes:

*   **[Bun](https://bun.sh/)** (v1.0.0+) - **Recommended for best performance**
*   **[Node.js](https://nodejs.org/)** (v18.0.0+)
*   **[Deno](https://deno.land/)** (latest)

## Installation

### Global Installation

<details>
<summary><strong>Bun (Recommended)</strong></summary>

```bash
bun add -g @glyphtek/scriptit
```
</details>

<details>
<summary><strong>Node.js</strong></summary>

```bash
npm install -g @glyphtek/scriptit
# or
yarn global add @glyphtek/scriptit
```
</details>

<details>
<summary><strong>Deno</strong></summary>

```bash
deno install --allow-read --allow-write --allow-run --allow-env -n scriptit npm:@glyphtek/scriptit
```
</details>

### Local Installation

**Bun:** `bun add @glyphtek/scriptit`  
**Node.js:** `npm install @glyphtek/scriptit`  
**Deno:** `import { createScriptRunner } from "npm:@glyphtek/scriptit"`

## CLI Usage

### Initialize Project

```bash
scriptit init
```

Creates a complete project structure with example scripts, configuration, and proper `.gitignore` setup.

**Options:**
- `-s, --scripts-dir <dir>` - Directory for scripts (default: `scripts`)
- `-t, --tmp-dir <dir>` - Directory for temporary files (default: `tmp`)
- `-f, --force` - Overwrite existing files and directories

### Interactive Terminal UI

```bash
scriptit run
# or simply
scriptit
```

**Options:**
- `-c, --config <path>` - Path to runner configuration file
- `-s, --scripts-dir <dir>` - Override scripts directory from config
- `-t, --tmp-dir <dir>` - Override temporary directory from config
- `--no-tui` - Run without Terminal UI, just list available scripts
- `--force-tui` - Force TUI mode even when debug is enabled

**Navigation:**
- **↑↓** or **j/k**: Navigate scripts • **Tab**: Switch panels • **Enter**: Execute
- **C**: Toggle config • **F**: Toggle files • **R**: Refresh • **Q**: Quit

### Execute Single Scripts

```bash
# Basic execution (colored console enabled by default)
scriptit exec ./scripts/my-script.ts

# With environment variables
scriptit exec ./scripts/deploy.ts -e NODE_ENV=production API_KEY=secret

# With interactive environment prompts
scriptit exec ./scripts/deploy.ts --env-prompts API_KEY,SECRET_TOKEN

# With custom configuration
scriptit exec ./scripts/my-script.ts -c custom.config.js

# Multiple environment variables
scriptit exec ./scripts/script.ts -e NODE_ENV=prod -e DEBUG=false -e PORT=8080

# Combine static and prompted environment variables
scriptit exec ./scripts/deploy.ts -e NODE_ENV=production --env-prompts API_KEY,SECRET_TOKEN
```

**Options:**
- `-c, --config <path>` - Path to runner configuration file
- `-e, --env <vars...>` - Set environment variables (e.g., NAME=value X=Y)
- `--env-prompts <vars...>` - Prompt for environment variables before execution (e.g., API_KEY,SECRET)

### Global Options

Available for all commands:

```bash
# Enable debug mode with verbose logging
scriptit --debug exec ./scripts/my-script.ts

# Set working directory (all relative paths resolve from here)
scriptit --pwd /path/to/project exec ./scripts/deploy.ts

# Show version
scriptit --version

# Show help
scriptit --help
```

### Working Directory Support

The `--pwd` option is perfect for:
- **CI/CD pipelines** - Run from build directories
- **Multi-project setups** - Manage scripts across repositories
- **Lambda integration** - Point to existing function directories

```bash
# Change working directory before execution
scriptit --pwd /path/to/project run

# All relative paths resolve from the specified directory
scriptit --pwd /app exec ./scripts/deploy.ts
```

## Script Types & Examples

### Traditional Lifecycle Pattern

```typescript
// scripts/deployment.ts
export const description = "Deploy application with full lifecycle";

export async function tearUp(context) {
  context.log('Setting up deployment...');
  return { startTime: Date.now() };
}

export async function execute(context, tearUpResult) {
  const console = context.console || global.console;
  
  console.info('Starting deployment...');
  console.warn('This will overwrite production!');
  
  // Main deployment logic
  const result = await deployApplication(context.env.API_KEY);
  
  console.log('Deployment completed successfully');
  return result;
}

export async function tearDown(context, executeResult, tearUpResult) {
  const duration = Date.now() - tearUpResult.startTime;
  context.log(`Deployment completed in ${duration}ms`);
}
```

### Lambda/Default Export Pattern

```typescript
// scripts/data-processor.ts
export const description = "Process data with colored output";

export default async function(context) {
  const console = context.console || global.console;
  
  console.log('Processing data...');
  console.info(`Environment: ${context.env.NODE_ENV}`);
  
  try {
    const result = await processLargeDataset(context.env.INPUT_FILE);
    console.log('✅ Processing completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Processing failed:', error.message);
    throw error;
  }
}
```

### Enhanced Context Object

```typescript
interface ScriptContext {
  // Enhanced console with colors (when enabled)
  console: {
    log: (...args: unknown[]) => void;    // White
    info: (...args: unknown[]) => void;   // Blue
    warn: (...args: unknown[]) => void;   // Yellow  
    error: (...args: unknown[]) => void;  // Red
    debug: (...args: unknown[]) => void;  // Gray
  };
  
  // Environment & configuration
  env: Record<string, string | undefined>;
  tmpDir: string;
  configPath?: string;
  log: (message: string) => void;
  params: Record<string, unknown>;
  
  // Default parameters from config
  [key: string]: unknown;
}
```

## Interactive Environment Prompts

ScriptIt supports interactive prompting for environment variables across both CLI and TUI interfaces, allowing you to securely collect sensitive data at runtime without hardcoding values.

### Universal Prompting

Environment variable prompting works seamlessly across all interfaces:

- **CLI**: Terminal-based prompting with readline
- **TUI**: Beautiful modal dialogs with visual feedback  
- **Library**: Programmatic integration with custom prompters

Both interfaces support the same features:
- **Password masking** with `*` characters
- **Smart detection** (only prompts for missing variables)
- **Type-aware prompting** (input vs password fields)
- **Consistent variable precedence** across all interfaces

### Declarative Method (Script-defined)

Scripts can declare their required environment variables using the `variables` export:

```typescript
// Full definition with custom prompts and types
export const variables = [
  { name: 'API_KEY', message: 'Enter your API key:', type: 'password' },
  { name: 'USER_NAME', message: 'Enter your username:', type: 'input' },
];

// Shorthand definition for quick setup
export const variables = ['API_KEY', 'DATABASE_URL', 'SECRET_TOKEN'];

export async function execute(context) {
  const console = context.console || global.console;
  
  // Variables are automatically prompted and available in context.env
  console.log(`API Key: ${context.env.API_KEY ? '***hidden***' : 'Not set'}`);
  console.log(`Username: ${context.env.USER_NAME || 'Not provided'}`);
  
  return { success: true };
}
```

### Imperative Method (CLI-driven)

Use the `--env-prompts` flag to prompt for any variables on demand:

```bash
# Prompt for specific variables
scriptit exec my-script.js --env-prompts API_KEY,SECRET_TOKEN

# Space-separated format also works
scriptit exec my-script.js --env-prompts API_KEY SECRET_TOKEN

# Works with the run command too
scriptit run --env-prompts DATABASE_URL,API_KEY
```

### Variable Types

- **`input`** (default): Regular text input
- **`password`**: Hidden input with masked characters (`*`)

### Execution Priority

ScriptIt follows this order when collecting environment variables:

1. **Existing Environment**: Variables already set in shell, `.env` files, or via `--env` flag
2. **Skip Prompting**: Variables that are already set are not prompted again  
3. **Combine Sources**: CLI `--env-prompts` + script `variables` export (CLI takes precedence for duplicates)
4. **Interactive Collection**: Prompt for any missing variables
5. **Script Execution**: All variables available in `context.env`

### Security Features

- **Password masking**: Sensitive inputs are hidden with `*` characters
- **No logging**: Prompted values are not logged or displayed in output
- **Process isolation**: Values are set in `process.env` for script duration only

## Library Usage

### Basic Integration

```typescript
import { createScriptRunner } from '@glyphtek/scriptit';

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp',
  consoleInterception: { enabled: true },  // Enable colored console
  excludePatterns: ['*.helper.*', '_*'],
});

// Execute scripts
const result = await runner.executeScript('deploy.ts', {
  params: { environment: 'production' },
  env: { API_KEY: 'secret' }
});

// Event handling
runner.on('script:beforeExecute', (scriptPath) => {
  console.log(`🚀 Executing: ${scriptPath}`);
});
```

### Advanced Configuration

```typescript
// Multi-project setup
const projectRunner = await createScriptRunner({
  workingDirectory: '/projects/my-app',
  scriptsDir: './deployment-scripts',
  envFiles: ['.env', '.env.production'],
  defaultParams: {
    projectName: 'My App',
    version: process.env.npm_package_version
  }
});

// Lambda function integration
const lambdaRunner = await createScriptRunner({
  workingDirectory: '/lambda-functions',
  scriptsDir: './',
  excludePatterns: ['node_modules/**', '*.test.*'],
  consoleInterception: { enabled: true }
});
```

## Configuration

Create a `runner.config.js` file in your project root:

```javascript
// runner.config.js
export default {
  scriptsDir: './scripts',
  tmpDir: './tmp',
  envFiles: ['.env', '.env.local', '.env.production'],
  excludePatterns: [
    '**/node_modules/**',
    '**/*.test.*',
    '**/*.helper.*',
    '_*',
    '**/helpers/**'
  ],
  defaultParams: {
    appName: 'My Application',
    version: '1.0.0',
    apiUrl: '${API_BASE_URL}/api/v1'  // Environment variable interpolation
  }
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scriptsDir` | `string` | `"scripts"` | Scripts directory path |
| `tmpDir` | `string` | `"tmp"` | Temporary files directory |
| `envFiles` | `string[]` | `[".env"]` | Environment files to load |
| `excludePatterns` | `string[]` | `[]` | Script exclusion patterns |
| `defaultParams` | `object` | `{}` | Default script parameters |

## Migration Guide

### Upgrading to v0.5.0 (Colored Console)

**CLI Usage:**
```bash
# Colored console is enabled by default in CLI
scriptit exec my-script.js
```

**Library Usage:**
```typescript
const runner = createScriptRunner({
  consoleInterception: { enabled: true }  // Enable colored console
});
```

**Script Updates:**
```typescript
// Use enhanced console for best results
export default async function(context) {
  const console = context.console || global.console;
  console.log('This will be colored when interception is enabled');
}
```

### Upgrading to v0.4.0 (TUI & Default Exports)

- **New TUI interface:** `scriptit run` now opens interactive UI
- **Default export support:** Lambda functions work directly
- **No breaking changes:** Existing scripts continue to work

## Troubleshooting

### Common Issues

**🔍 Script not found**
- Check your `scriptsDir` configuration
- Ensure files have `.js` or `.ts` extensions
- Verify exclude patterns aren't filtering your scripts

**🌍 Environment variables not loading**
- Ensure `.env` files are in project root or configured in `envFiles`
- Check file permissions and syntax
- Use `context.log()` to debug loaded variables

**🖥️ TUI not working properly**
- Some terminals have limited support - try `--no-tui`
- Ensure terminal size is adequate (minimum 80x24)
- Try different terminal emulators
- Use `--debug` for verbose logging

**🎨 Colored console not working**
- Colored console is enabled by default in CLI mode
- For library usage, set `consoleInterception: { enabled: true }`
- Some terminals may not support all colors
- Ensure scripts use `context.console` fallback pattern

**🔧 Permission errors**
- Check file permissions for script and temp directories
- Ensure ScriptIt has necessary runtime permissions
- Verify working directory access with `--pwd`

**⚙️ Debug mode issues**
- Use `--debug` flag for verbose logging
- TUI is disabled by default in debug mode (use `--force-tui` to override)
- Check `SCRIPTIT_DEBUG` environment variable

### Getting Help

If you encounter issues not covered here, please check our [troubleshooting guide](https://scriptit.github.io/troubleshooting) or open an issue.

## Development

### Quick Setup

```bash
git clone https://github.com/glyphtek/scriptit.git
cd scriptit
bun install
bun run build
bun test
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Development mode |
| `bun run build` | Production build |
| `bun test` | Run all tests |
| `bun run lint` | Code linting |
| `bun run format` | Code formatting |

### Contributing Guidelines

1. **Fork & Clone:** Create your feature branch
2. **Test:** Write tests for new functionality  
3. **Quality:** Follow TypeScript best practices
4. **Compatibility:** Ensure cross-runtime support
5. **Documentation:** Update docs for new features

## Community & Support

### 🤝 Get Help

- 🐛 [Report Issues](https://github.com/glyphtek/scriptit/issues)
- 💬 [Join Discussions](https://github.com/glyphtek/scriptit/discussions)
- 📖 [Documentation](https://scriptit.github.io/)
- 📚 [API Reference](https://scriptit.github.io/library/api)

### 🌟 Show Support

- ⭐ [Star on GitHub](https://github.com/glyphtek/scriptit)
- 🐦 [Follow on Twitter](https://twitter.com/glyphtek)
- 💖 [Sponsor Development](https://github.com/sponsors/sergiohromano)

### 🚀 Contributing

We welcome contributions! Ways to help:

- **Bug Reports:** Detailed reproduction steps
- **Feature Requests:** Describe your use case
- **Code Contributions:** PRs with tests
- **Documentation:** Improve guides and examples
- **Community:** Help others in discussions

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**ScriptIt** - Making script management simple and powerful across all JavaScript runtimes.
