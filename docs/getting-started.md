# Getting Started

Welcome to ScriptIt! This guide will help you get up and running with ScriptIt in just a few minutes.

## What is ScriptIt?

ScriptIt is a powerful cross-runtime script runner that allows you to execute JavaScript and TypeScript scripts across Bun, Node.js, and Deno with enhanced features like:

- 🎨 **Colored console output** for better debugging
- 🖥️ **Terminal UI (TUI)** for interactive script management
- 🔧 **Environment management** with .env support
- ⚡ **Cross-runtime compatibility** with automatic detection
- 🚀 **Enhanced script context** with rich environment and utilities

## Installation

### Global Installation (Recommended)

Install ScriptIt globally to use the CLI from anywhere:

::: code-group

```bash [Bun]
bun add -g @glyphtek/scriptit
```

```bash [npm]
npm install -g @glyphtek/scriptit
```

```bash [pnpm]
pnpm add -g @glyphtek/scriptit
```

```bash [yarn]
yarn global add @glyphtek/scriptit
```

:::

### Local Installation

For use as a library in your project:

::: code-group

```bash [Bun]
bun add @glyphtek/scriptit
```

```bash [npm]
npm install @glyphtek/scriptit
```

```bash [pnpm]
pnpm add @glyphtek/scriptit
```

```bash [yarn]
yarn add @glyphtek/scriptit
```

:::

## Your First Script

Let's create a simple script to see ScriptIt in action.

### 1. Create a Script File

Create a file called `hello.js`:

```javascript
// hello.js - Traditional execute function pattern
export const description = "Hello world script with colored console";

export async function execute(context) {
  // Use the enhanced console with fallback for colored output
  const console = context.console || global.console;
  
  console.log('👋 Hello from ScriptIt!');
  console.error('This is an error message');
  console.warn('This is a warning');
  console.info('This is info');
  console.debug('This is debug information');

  // Access the enhanced context
  console.log('Current working directory:', process.cwd());
  console.log('Script arguments:', process.argv.slice(2));
  
  return { message: 'Hello script completed successfully!' };
}
```

Or using the default export pattern:

```javascript
// hello-default.js - Default export pattern
export const description = "Hello world default export script";

export default async function(context) {
  // Use the enhanced console with fallback for colored output
  const console = context.console || global.console;
  
  console.log('👋 Hello from ScriptIt Default!');
  console.info('This script uses the default export pattern');
  console.warn('Perfect for existing functions');
  
  return { message: 'Default export script completed!' };
}
```

### 2. Run with Colored Console

```bash
scriptit exec hello.js
```

You'll see beautiful colored output (enabled by default):
- 🤍 White for `console.log`
- 🔴 Red for `console.error`
- 🟡 Yellow for `console.warn`
- 🔵 Blue for `console.info`
- ⚫ Gray for `console.debug`

### 3. Try the Interactive TUI

```bash
scriptit run
```

This opens an interactive terminal interface where you can:
- Browse and select scripts
- View real-time output
- Manage multiple script executions

## Key Features

### Colored Console Output

ScriptIt provides colored console output when you use the enhanced context:

```javascript
// In your script, use the fallback pattern for colors
export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Regular log message');     // White
  console.error('Error message');         // Red
  console.warn('Warning message');        // Yellow
  console.info('Info message');          // Blue
  console.debug('Debug message');        // Gray
}
```

### Environment Variables

Create a `.env` file in your project:

```env
API_KEY=your-secret-key
DATABASE_URL=postgresql://localhost:5432/mydb
NODE_ENV=development
```

Access them in your script:

```javascript
export async function execute(context) {
  console.log('API Key:', context.env.API_KEY);
  console.log('Environment:', context.env.NODE_ENV);
}
```

### Runtime Selection

ScriptIt automatically detects the best runtime, but you can specify one:

```bash
# Force Bun runtime
scriptit exec script.ts --runtime bun

# Force Node.js runtime
scriptit exec script.js --runtime node

# Force Deno runtime
scriptit exec script.ts --runtime deno
```

## Library Usage

Use ScriptIt programmatically in your applications:

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp',
  consoleInterception: {
    enabled: true,
    useColors: true
  }
});

// Execute a script file
await runner.executeScript('hello.js')

// Execute with parameters
await runner.executeScript('process-data.js', {
  params: {
    inputFile: 'data.csv',
    outputDir: './output'
  },
  env: {
    NODE_ENV: 'production'
  }
})

// Listen to events
runner.on('script:beforeExecute', (scriptPath, params) => {
  console.log(`Starting script: ${scriptPath}`)
})

runner.on('script:afterExecute', (scriptPath, result) => {
  console.log(`Script ${scriptPath} completed successfully`)
})

runner.on('script:error', (scriptPath, error) => {
  console.error(`Script ${scriptPath} failed:`, error.message)
})
```

## Script Structure Requirements

**Important**: ScriptIt requires your scripts to export either:

1. **An `execute` function** (traditional pattern):
```javascript
export async function execute(context) {
  // Your script logic here
  return result; // optional
}
```

2. **A `default` function** (default export pattern):
```javascript
export default async function(context) {
  // Your script logic here
  return result; // optional
}
```

Scripts without these functions will fail with an error.

## Configuration

### CLI Configuration

Create a `scriptit.config.js` file in your project root:

```javascript
export default {
  scriptsDir: './scripts',
  tmpDir: './tmp',
  envFiles: ['.env'],
  consoleInterception: {
    enabled: true,
    useColors: true
  },
  timeout: 30000,
  workingDirectory: process.cwd()
}
```

### Environment-Specific Settings

```javascript
export default {
  development: {
    runtime: 'bun',
    consoleColors: true,
    verbose: true
  },
  production: {
    runtime: 'node',
    consoleColors: false,
    timeout: 60000
  }
}
```

## Next Steps

Now that you have ScriptIt set up, explore these topics:

- [CLI Commands](/cli/commands) - Learn all available CLI options
- [Library API](/library/api) - Integrate ScriptIt into your applications
- [Colored Console](/features/console-colors) - Deep dive into console features
- [Examples](/examples/) - See real-world usage examples

## Need Help?

- 📖 Check the [documentation](/introduction)
- 🐛 Report issues on [GitHub](https://github.com/glyphtek/scriptit/issues)
- 💬 Join discussions on [GitHub Discussions](https://github.com/glyphtek/scriptit/discussions)

Happy scripting! 🚀