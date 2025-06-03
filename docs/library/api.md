# Library API

ScriptIt provides a powerful programmatic API that allows you to integrate script execution into your applications. The library API offers the same features as the CLI with additional programmatic control and event handling.

## Overview

The ScriptIt library exports a main function `createScriptRunner()` that returns a configured script runner instance with methods for executing scripts, managing the TUI, and handling events.

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp',
  consoleInterception: true
})

const result = await runner.executeScript('my-script.js')
```

## Installation

Install ScriptIt as a dependency in your project:

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

## Main API

### `createScriptRunner(options?)`

Creates and configures a script runner instance.

```typescript
async function createScriptRunner(
  options?: CreateScriptRunnerOptions
): Promise<ScriptRunnerInstance>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `CreateScriptRunnerOptions` | Configuration options (optional) |

#### Returns

Returns a `Promise<ScriptRunnerInstance>` with methods for script execution and management.

## Configuration Options

### `CreateScriptRunnerOptions`

```typescript
interface CreateScriptRunnerOptions {
  // Directory configuration
  scriptsDir?: string;              // Directory containing scripts
  tmpDir?: string;                  // Temporary files directory
  workingDirectory?: string;        // Set working directory
  
  // Configuration file
  configFile?: string;              // Path to config file
  
  // Environment configuration
  envFiles?: string[];              // Environment files to load
  initialEnv?: Record<string, string | undefined>; // Initial environment variables
  defaultParams?: Record<string, unknown>; // Default parameters
  
  // Script filtering
  excludePatterns?: string[];       // Glob patterns to exclude
  
  // Console configuration
  consoleInterception?: {
    enabled?: boolean;              // Enable console interception
    includeLevel?: boolean;         // Include log level in output
    preserveOriginal?: boolean;     // Preserve original console methods
    useColors?: boolean;            // Enable colored output
  };
}
```

### Configuration Examples

#### Basic Configuration

```typescript
const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})
```

#### Advanced Configuration

```typescript
const runner = await createScriptRunner({
  // Directory configuration
  scriptsDir: './src/scripts',
  tmpDir: './temp',
  workingDirectory: '/path/to/project',
  
  // Configuration file
  configFile: './scriptit.config.js',
  
  // Environment configuration
  envFiles: ['.env', '.env.local'],
  initialEnv: {
    NODE_ENV: 'development',
    DEBUG: 'true'
  },
  defaultParams: {
    appName: 'My Application',
    version: '1.0.0'
  },
  
  // Script filtering
  excludePatterns: ['*.test.js', '_*', 'helpers/**'],
  
  // Console configuration
  consoleInterception: {
    enabled: true,
    useColors: true,
    includeLevel: false,
    preserveOriginal: false
  }
})
```

#### Working Directory Example

```typescript
// Change working directory before creating runner
const runner = await createScriptRunner({
  workingDirectory: '/path/to/project',
  scriptsDir: './scripts',  // Resolves from workingDirectory
  tmpDir: './tmp'
})
```

## ScriptRunnerInstance

The `createScriptRunner()` function returns a `ScriptRunnerInstance` with the following interface:

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `config` | `EffectiveConfig` | Resolved configuration |
| `environment` | `Record<string, string \| undefined>` | Loaded environment variables |

### Methods

#### `executeScript(scriptPath, executionParams?, customLogger?)`

Execute a single script with optional parameters and custom logging.

```typescript
async executeScript(
  scriptPath: string,
  executionParams?: Record<string, unknown>,
  customLogger?: (message: string) => void
): Promise<ScriptExecutionResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `scriptPath` | `string` | Path to script (relative to scriptsDir or absolute) |
| `executionParams` | `Record<string, unknown>` | Execution parameters (optional) |
| `customLogger` | `(message: string) => void` | Custom logging function (optional) |

**Execution Parameters:**

```typescript
{
  params?: Record<string, unknown>;     // Parameters passed to script
  env?: Record<string, string>;         // Environment variable overrides
  contextOverrides?: Record<string, unknown>; // Context property overrides
}
```

**Examples:**

```typescript
// Basic execution
const result = await runner.executeScript('hello.js')

// With parameters
const result = await runner.executeScript('process-data.js', {
  params: {
    inputFile: 'data.csv',
    outputDir: './output'
  },
  env: {
    NODE_ENV: 'production'
  }
})

// With custom logger
const logs: string[] = []
const result = await runner.executeScript('script.js', {}, (message) => {
  logs.push(message)
  console.log(`[CUSTOM] ${message}`)
})
```

#### `listScripts()`

List all available scripts in the scripts directory.

```typescript
async listScripts(): Promise<string[]>
```

**Returns:** Array of script paths relative to the scripts directory.

**Example:**

```typescript
const scripts = await runner.listScripts()
console.log('Available scripts:', scripts)
// Output: ['hello.js', 'data/process.ts', 'utils/cleanup.js']
```

#### `runTUI()`

Launch the interactive Terminal UI programmatically.

```typescript
async runTUI(): Promise<void>
```

**Example:**

```typescript
// Launch TUI from your application
await runner.runTUI()
```

#### Event Methods

##### `on(eventName, listener)`

Register an event listener.

```typescript
on<K extends keyof ScriptEventHandler>(
  eventName: K,
  listener: ScriptEventHandler[K]
): ScriptRunnerInstance
```

##### `off(eventName, listener)`

Remove an event listener.

```typescript
off<K extends keyof ScriptEventHandler>(
  eventName: K,
  listener: ScriptEventHandler[K]
): ScriptRunnerInstance
```

##### `emit(eventName, ...args)`

Emit an event (primarily for internal use).

```typescript
emit<K extends keyof ScriptEventHandler>(
  eventName: K,
  ...args: Parameters<ScriptEventHandler[K]>
): boolean
```

## Types

### `ScriptExecutionResult`

Result returned from script execution:

```typescript
interface ScriptExecutionResult {
  [key: string]: unknown;
}
```

Scripts can return any data structure, which will be available in the result.

### `ScriptEventHandler`

Event handler type definitions:

```typescript
type ScriptEventHandler = {
  'script:beforeExecute': (scriptPath: string, params: Record<string, unknown>) => void;
  'script:afterExecute': (scriptPath: string, result: ScriptExecutionResult) => void;
  'script:error': (scriptPath: string, error: unknown) => void;
  'script:log': (scriptPath: string, message: string) => void;
  'tui:beforeStart': () => void;
  'tui:afterEnd': () => void;
};
```

## Usage Examples

### Basic Script Execution

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

async function runScript() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  })

  try {
    const result = await runner.executeScript('hello.js')
    console.log('Script result:', result)
  } catch (error) {
    console.error('Script failed:', error.message)
  }
}

runScript()
```

### Event Handling

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

async function runWithEvents() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  })

  // Register event listeners
  runner.on('script:beforeExecute', (scriptPath, params) => {
    console.log(`Starting script: ${scriptPath}`)
    console.log('Parameters:', params)
  })

  runner.on('script:afterExecute', (scriptPath, result) => {
    console.log(`Script completed: ${scriptPath}`)
    console.log('Result:', result)
  })

  runner.on('script:error', (scriptPath, error) => {
    console.error(`Script failed: ${scriptPath}`)
    console.error('Error:', error)
  })

  runner.on('script:log', (scriptPath, message) => {
    console.log(`[${scriptPath}] ${message}`)
  })

  // Execute script
  await runner.executeScript('example.js')
}

runWithEvents()
```

### Batch Script Execution

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

async function runBatch() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  })

  // Get all available scripts
  const scripts = await runner.listScripts()
  console.log(`Found ${scripts.length} scripts`)

  // Execute scripts in sequence
  for (const script of scripts) {
    try {
      console.log(`\nExecuting: ${script}`)
      const result = await runner.executeScript(script)
      console.log(`✅ Success:`, result)
    } catch (error) {
      console.error(`❌ Failed:`, error.message)
    }
  }
}

runBatch()
```

### Custom Environment and Parameters

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

async function runWithCustomEnv() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp',
    initialEnv: {
      API_URL: 'https://api.example.com',
      DEBUG: 'true'
    },
    defaultParams: {
      appName: 'My App',
      version: '1.0.0'
    }
  })

  const result = await runner.executeScript('deploy.js', {
    params: {
      environment: 'staging',
      dryRun: false
    },
    env: {
      DEPLOY_KEY: process.env.DEPLOY_KEY
    }
  })

  console.log('Deployment result:', result)
}

runWithCustomEnv()
```

### Integration with Express.js

```typescript
import express from 'express'
import { createScriptRunner } from '@glyphtek/scriptit'

const app = express()
app.use(express.json())

// Initialize script runner
const runner = await createScriptRunner({
  scriptsDir: './api-scripts',
  tmpDir: './tmp',
  consoleInterception: {
    enabled: true,
    useColors: false  // Disable colors for API logs
  }
})

// API endpoint to execute scripts
app.post('/api/scripts/:scriptName', async (req, res) => {
  try {
    const { scriptName } = req.params
    const { params, env } = req.body

    const result = await runner.executeScript(scriptName, {
      params,
      env
    })

    res.json({
      success: true,
      result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// API endpoint to list available scripts
app.get('/api/scripts', async (req, res) => {
  try {
    const scripts = await runner.listScripts()
    res.json({ scripts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('API server running on port 3000')
})
```

### TypeScript Integration

```typescript
import { createScriptRunner, type ScriptExecutionResult } from '@glyphtek/scriptit'

interface DeploymentResult {
  success: boolean
  deployedFiles: string[]
  duration: number
}

async function deployApp(): Promise<DeploymentResult> {
  const runner = await createScriptRunner({
    scriptsDir: './deployment-scripts',
    tmpDir: './tmp'
  })

  const result: ScriptExecutionResult = await runner.executeScript('deploy.ts', {
    params: {
      environment: 'production',
      version: '1.2.0'
    }
  })

  // Type assertion for known script result structure
  return result as DeploymentResult
}

deployApp().then(result => {
  console.log(`Deployment ${result.success ? 'succeeded' : 'failed'}`)
  console.log(`Files deployed: ${result.deployedFiles.length}`)
  console.log(`Duration: ${result.duration}ms`)
})
```

### Error Handling and Retry Logic

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

async function runWithRetry(scriptPath: string, maxRetries = 3) {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  })

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: ${scriptPath}`)
      
      const result = await runner.executeScript(scriptPath)
      console.log('✅ Success:', result)
      return result
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        throw new Error(`Script failed after ${maxRetries} attempts: ${error.message}`)
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}

runWithRetry('flaky-script.js')
  .then(result => console.log('Final result:', result))
  .catch(error => console.error('All attempts failed:', error.message))
```

## Configuration File Integration

The library can load configuration from files just like the CLI:

```typescript
// scriptit.config.js
export default {
  scriptsDir: './src/scripts',
  tmpDir: './temp',
  envFiles: ['.env', '.env.local'],
  excludePatterns: ['*.test.js', '_*'],
  defaultParams: {
    appName: 'My Application'
  }
}
```

```typescript
// Use configuration file
const runner = await createScriptRunner({
  configFile: './scriptit.config.js',
  // Override specific options
  initialEnv: {
    NODE_ENV: 'development'
  }
})
```

## Best Practices

### 1. Error Handling

Always wrap script execution in try-catch blocks:

```typescript
try {
  const result = await runner.executeScript('script.js')
  // Handle success
} catch (error) {
  // Handle error
  console.error('Script execution failed:', error.message)
}
```

### 2. Event Monitoring

Use events for monitoring and logging:

```typescript
runner.on('script:beforeExecute', (scriptPath) => {
  console.log(`Starting: ${scriptPath}`)
})

runner.on('script:error', (scriptPath, error) => {
  // Log to monitoring service
  logger.error('Script failed', { scriptPath, error })
})
```

### 3. Resource Management

Clean up resources when done:

```typescript
// If you need to clean up (future feature)
// await runner.close()
```

### 4. Type Safety

Use TypeScript for better type safety:

```typescript
import type { ScriptExecutionResult } from '@glyphtek/scriptit'

interface MyScriptResult {
  processedCount: number
  errors: string[]
}

const result = await runner.executeScript('my-script.ts') as MyScriptResult
```

## Related Documentation

- [TypeScript Types](/library/types) - Complete type definitions
- [Event System](/library/events) - Detailed event documentation
- [CLI Commands](/cli/commands) - CLI equivalent functionality
- [Examples](/examples/library) - More library usage examples 