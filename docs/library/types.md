# TypeScript Types

ScriptIt is built with TypeScript and provides comprehensive type definitions for all its APIs. This page documents all the types, interfaces, and type utilities available when using ScriptIt in TypeScript projects.

## Core Types

### `createScriptRunner`

The main function for creating script runner instances.

```typescript
function createScriptRunner(
  options?: CreateScriptRunnerOptions
): Promise<ScriptRunnerInstance>
```

## Configuration Types

### `CreateScriptRunnerOptions`

Configuration options for creating a script runner instance.

```typescript
interface CreateScriptRunnerOptions 
  extends Partial<Omit<RunnerConfig, "loadedConfigPath">> {
  
  // Configuration file
  configFile?: string;
  
  // Environment configuration
  initialEnv?: Record<string, string | undefined>;
  
  // Working directory
  workingDirectory?: string;
  
  // Console interception configuration
  consoleInterception?: {
    enabled?: boolean;
    includeLevel?: boolean;
    preserveOriginal?: boolean;
    useColors?: boolean;
  };
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `configFile` | `string` | Path to configuration file |
| `initialEnv` | `Record<string, string \| undefined>` | Initial environment variables |
| `workingDirectory` | `string` | Working directory for script execution |
| `consoleInterception` | `ConsoleInterceptionOptions` | Console interception settings |
| `scriptsDir` | `string` | Directory containing scripts (inherited) |
| `tmpDir` | `string` | Temporary files directory (inherited) |
| `envFiles` | `string[]` | Environment files to load (inherited) |
| `defaultParams` | `Record<string, unknown>` | Default parameters (inherited) |
| `excludePatterns` | `string[]` | Glob patterns to exclude (inherited) |

### `RunnerConfig`

Base configuration interface for the script runner.

```typescript
interface RunnerConfig {
  scriptsDir: string;
  tmpDir: string;
  envFiles: string[];
  defaultParams?: Record<string, unknown>;
  loadedConfigPath?: string;
  excludePatterns?: string[];
}
```

### `EffectiveConfig`

Resolved configuration after loading and merging all sources.

```typescript
interface EffectiveConfig extends RunnerConfig {
  loadedConfigPath: string | null;
  // All properties are resolved and non-optional where applicable
}
```

## Script Runner Instance Types

### `ScriptRunnerInstance`

The main interface for script runner instances returned by `createScriptRunner()`.

```typescript
interface ScriptRunnerInstance {
  // Properties
  config: EffectiveConfig;
  environment: Record<string, string | undefined>;
  
  // Methods
  executeScript: (
    scriptPath: string,
    executionParams?: ExecutionParams,
    customLogger?: LoggerFunction
  ) => Promise<ScriptExecutionResult>;
  
  listScripts: () => Promise<string[]>;
  runTUI: () => Promise<void>;
  
  // Event methods
  on: <K extends keyof ScriptEventHandler>(
    eventName: K,
    listener: ScriptEventHandler[K]
  ) => ScriptRunnerInstance;
  
  off: <K extends keyof ScriptEventHandler>(
    eventName: K,
    listener: ScriptEventHandler[K]
  ) => ScriptRunnerInstance;
  
  emit: <K extends keyof ScriptEventHandler>(
    eventName: K,
    ...args: Parameters<ScriptEventHandler[K]>
  ) => boolean;
}
```

### `ExecutionParams`

Parameters for script execution.

```typescript
interface ExecutionParams {
  params?: Record<string, unknown>;
  env?: Record<string, string>;
  contextOverrides?: Record<string, unknown>;
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `params` | `Record<string, unknown>` | Parameters passed to the script |
| `env` | `Record<string, string>` | Environment variable overrides |
| `contextOverrides` | `Record<string, unknown>` | Context property overrides |

### `ScriptExecutionResult`

Result returned from script execution.

```typescript
interface ScriptExecutionResult {
  [key: string]: unknown;
}
```

Scripts can return any data structure, which will be preserved in the result.

### `LoggerFunction`

Type for custom logging functions.

```typescript
type LoggerFunction = (message: string) => void;
```

## Script Types

### `ScriptModule`

Interface that scripts must implement.

```typescript
interface ScriptModule {
  // Lifecycle methods
  tearUp?: (context: ScriptContext) => Promise<unknown> | unknown;
  execute?: (
    context: ScriptContext,
    tearUpResult?: unknown
  ) => Promise<unknown> | unknown;
  tearDown?: (
    context: ScriptContext,
    executeResult?: unknown,
    tearUpResult?: unknown
  ) => Promise<void> | void;
  
  // Alternative entry point
  default?: (
    context: ScriptContext,
    tearUpResult?: unknown
  ) => Promise<unknown> | unknown;
  
  // Metadata
  description?: string;
}
```

**Methods:**

| Method | Type | Description |
|--------|------|-------------|
| `tearUp` | `(context: ScriptContext) => Promise<unknown> \| unknown` | Setup phase (optional) |
| `execute` | `(context: ScriptContext, tearUpResult?: unknown) => Promise<unknown> \| unknown` | Main execution (optional if default exists) |
| `tearDown` | `(context: ScriptContext, executeResult?: unknown, tearUpResult?: unknown) => Promise<void> \| void` | Cleanup phase (optional) |
| `default` | `(context: ScriptContext, tearUpResult?: unknown) => Promise<unknown> \| unknown` | Alternative entry point (optional) |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `description` | `string` | Script description for UI display |

### `ScriptContext`

Context object passed to scripts during execution.

```typescript
interface ScriptContext {
  // Environment and configuration
  env: Record<string, string | undefined>;
  tmpDir: string;
  configPath?: string;
  
  // Logging and parameters
  log: LoggerFunction;
  params: Record<string, unknown>;
  
  // Enhanced console (when console interception is enabled)
  console?: ColoredConsole;
  
  // Additional context properties from defaultParams and contextOverrides
  [key: string]: unknown;
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `env` | `Record<string, string \| undefined>` | Environment variables |
| `tmpDir` | `string` | Temporary directory path |
| `configPath` | `string` | Path to loaded configuration file |
| `log` | `LoggerFunction` | Logging function |
| `params` | `Record<string, unknown>` | Script parameters |
| `console` | `ColoredConsole` | Enhanced console with colors (optional) |

### `ColoredConsole`

Enhanced console interface with colored output methods.

```typescript
interface ColoredConsole {
  log: (...args: any[]) => void;      // White output
  error: (...args: any[]) => void;    // Red output
  warn: (...args: any[]) => void;     // Yellow output
  info: (...args: any[]) => void;     // Blue output
  debug: (...args: any[]) => void;    // Gray output
}
```

## Event System Types

### `ScriptEventHandler`

Type definitions for all available events.

```typescript
type ScriptEventHandler = {
  'script:beforeExecute': (
    scriptPath: string, 
    params: Record<string, unknown>
  ) => void;
  
  'script:afterExecute': (
    scriptPath: string, 
    result: ScriptExecutionResult
  ) => void;
  
  'script:error': (
    scriptPath: string, 
    error: unknown
  ) => void;
  
  'script:log': (
    scriptPath: string, 
    message: string
  ) => void;
  
  'tui:beforeStart': () => void;
  'tui:afterEnd': () => void;
};
```

**Events:**

| Event | Parameters | Description |
|-------|------------|-------------|
| `script:beforeExecute` | `scriptPath: string, params: Record<string, unknown>` | Fired before script execution |
| `script:afterExecute` | `scriptPath: string, result: ScriptExecutionResult` | Fired after successful execution |
| `script:error` | `scriptPath: string, error: unknown` | Fired when script execution fails |
| `script:log` | `scriptPath: string, message: string` | Fired when script logs a message |
| `tui:beforeStart` | None | Fired before TUI starts |
| `tui:afterEnd` | None | Fired after TUI ends |

## Console Interception Types

### `ConsoleInterceptionOptions`

Configuration for console interception.

```typescript
interface ConsoleInterceptionOptions {
  enabled?: boolean;
  includeLevel?: boolean;
  preserveOriginal?: boolean;
  useColors?: boolean;
}
```

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable console interception |
| `includeLevel` | `boolean` | `false` | Include log level in output |
| `preserveOriginal` | `boolean` | `false` | Preserve original console methods |
| `useColors` | `boolean` | `true` | Enable colored output |

### `ScriptExecutorOptions`

Options for script executor configuration.

```typescript
interface ScriptExecutorOptions {
  consoleInterception?: {
    enabled: boolean;
    logFunction?: LoggerFunction;
    includeLevel?: boolean;
    preserveOriginal?: boolean;
    useColors?: boolean;
  };
}
```

## Utility Types

### `EventEmitterMethods`

Type for event emitter methods on the script runner instance.

```typescript
type EventEmitterMethods<T> = {
  on: <K extends keyof T>(
    eventName: K,
    listener: T[K]
  ) => ScriptRunnerInstance;
  
  off: <K extends keyof T>(
    eventName: K,
    listener: T[K]
  ) => ScriptRunnerInstance;
  
  emit: <K extends keyof T>(
    eventName: K,
    ...args: Parameters<T[K]>
  ) => boolean;
};
```

### `PartialConfig`

Utility type for partial configuration objects.

```typescript
type PartialConfig<T> = {
  [P in keyof T]?: T[P];
};
```

## Type Guards

### `isScriptModule`

Type guard to check if an object implements the ScriptModule interface.

```typescript
function isScriptModule(obj: any): obj is ScriptModule {
  return obj && 
    (typeof obj.execute === 'function' || typeof obj.default === 'function');
}
```

### `hasExecuteFunction`

Type guard to check if a script module has an execute function.

```typescript
function hasExecuteFunction(module: ScriptModule): module is ScriptModule & {
  execute: NonNullable<ScriptModule['execute']>;
} {
  return typeof module.execute === 'function';
}
```

### `hasDefaultFunction`

Type guard to check if a script module has a default function.

```typescript
function hasDefaultFunction(module: ScriptModule): module is ScriptModule & {
  default: NonNullable<ScriptModule['default']>;
} {
  return typeof module.default === 'function';
}
```

## Usage Examples

### Basic TypeScript Usage

```typescript
import { 
  createScriptRunner, 
  type CreateScriptRunnerOptions,
  type ScriptExecutionResult,
  type ScriptEventHandler
} from '@glyphtek/scriptit';

const options: CreateScriptRunnerOptions = {
  scriptsDir: './scripts',
  tmpDir: './tmp',
  consoleInterception: {
    enabled: true,
    useColors: true
  }
};

const runner = await createScriptRunner(options);
const result: ScriptExecutionResult = await runner.executeScript('script.js');
```

### Typed Script Results

```typescript
import { createScriptRunner, type ScriptExecutionResult } from '@glyphtek/scriptit';

// Define expected result structure
interface ProcessingResult {
  success: boolean;
  processedFiles: number;
  errors: string[];
  duration: number;
}

async function runProcessingScript(): Promise<ProcessingResult> {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  });

  const result: ScriptExecutionResult = await runner.executeScript('process-data.ts');
  
  // Type assertion with validation
  if (typeof result === 'object' && result !== null) {
    return result as ProcessingResult;
  }
  
  throw new Error('Invalid script result structure');
}
```

### Event Handler Typing

```typescript
import { createScriptRunner, type ScriptEventHandler } from '@glyphtek/scriptit';

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
});

// Type-safe event handlers
const beforeExecuteHandler: ScriptEventHandler['script:beforeExecute'] = 
  (scriptPath, params) => {
    console.log(`Starting: ${scriptPath}`, params);
  };

const afterExecuteHandler: ScriptEventHandler['script:afterExecute'] = 
  (scriptPath, result) => {
    console.log(`Completed: ${scriptPath}`, result);
  };

runner.on('script:beforeExecute', beforeExecuteHandler);
runner.on('script:afterExecute', afterExecuteHandler);
```

### Custom Script Context

```typescript
import { type ScriptContext } from '@glyphtek/scriptit';

// Extend context with custom properties
interface CustomScriptContext extends ScriptContext {
  database: DatabaseConnection;
  cache: CacheService;
  metrics: MetricsCollector;
}

// Script with typed context
export async function execute(context: CustomScriptContext) {
  const console = context.console || global.console;
  
  // Access typed custom properties
  const users = await context.database.getUsers();
  const cachedData = await context.cache.get('user-data');
  
  context.metrics.increment('script.execution');
  
  console.log(`Processed ${users.length} users`);
  
  return {
    success: true,
    userCount: users.length,
    cacheHit: !!cachedData
  };
}
```

### Generic Script Execution

```typescript
import { createScriptRunner, type ScriptExecutionResult } from '@glyphtek/scriptit';

// Generic function for typed script execution
async function executeTypedScript<T = ScriptExecutionResult>(
  scriptPath: string,
  params?: Record<string, unknown>
): Promise<T> {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  });

  const result = await runner.executeScript(scriptPath, { params });
  return result as T;
}

// Usage with specific types
interface DeployResult {
  deployed: boolean;
  version: string;
  artifacts: string[];
}

const deployResult = await executeTypedScript<DeployResult>('deploy.ts', {
  environment: 'production',
  version: '1.2.0'
});

console.log(`Deployed version ${deployResult.version}`);
console.log(`Artifacts: ${deployResult.artifacts.join(', ')}`);
```

### Configuration with Type Safety

```typescript
import { 
  createScriptRunner, 
  type CreateScriptRunnerOptions,
  type RunnerConfig 
} from '@glyphtek/scriptit';

// Type-safe configuration builder
class ScriptRunnerConfigBuilder {
  private config: Partial<CreateScriptRunnerOptions> = {};

  scriptsDirectory(dir: string): this {
    this.config.scriptsDir = dir;
    return this;
  }

  temporaryDirectory(dir: string): this {
    this.config.tmpDir = dir;
    return this;
  }

  environmentFiles(...files: string[]): this {
    this.config.envFiles = files;
    return this;
  }

  excludePatterns(...patterns: string[]): this {
    this.config.excludePatterns = patterns;
    return this;
  }

  enableConsoleColors(enabled: boolean = true): this {
    this.config.consoleInterception = {
      ...this.config.consoleInterception,
      enabled,
      useColors: enabled
    };
    return this;
  }

  build(): CreateScriptRunnerOptions {
    return { ...this.config };
  }
}

// Usage
const config = new ScriptRunnerConfigBuilder()
  .scriptsDirectory('./src/scripts')
  .temporaryDirectory('./temp')
  .environmentFiles('.env', '.env.local')
  .excludePatterns('*.test.ts', '_*')
  .enableConsoleColors(true)
  .build();

const runner = await createScriptRunner(config);
```

## Type Declarations

If you're using ScriptIt in a TypeScript project, the types are automatically included. For JavaScript projects with TypeScript checking, you can reference the types:

```typescript
// types.d.ts
/// <reference types="@glyphtek/scriptit" />

declare module '@glyphtek/scriptit' {
  // Additional type augmentations if needed
}
```

## Advanced Type Patterns

### Script Factory Pattern

```typescript
import { type ScriptContext, type ScriptModule } from '@glyphtek/scriptit';

// Factory for creating typed scripts
function createScript<TParams = Record<string, unknown>, TResult = unknown>(
  implementation: (context: ScriptContext, params: TParams) => Promise<TResult> | TResult
): ScriptModule {
  return {
    async execute(context: ScriptContext): Promise<TResult> {
      const params = context.params as TParams;
      return await implementation(context, params);
    }
  };
}

// Usage
interface ProcessParams {
  inputFile: string;
  outputDir: string;
  format: 'json' | 'csv';
}

interface ProcessResult {
  success: boolean;
  outputFiles: string[];
  recordCount: number;
}

export default createScript<ProcessParams, ProcessResult>(
  async (context, params) => {
    const console = context.console || global.console;
    
    console.log(`Processing ${params.inputFile}`);
    console.log(`Output format: ${params.format}`);
    
    // Implementation...
    
    return {
      success: true,
      outputFiles: [`${params.outputDir}/output.${params.format}`],
      recordCount: 100
    };
  }
);
```

### Event-Driven Architecture

```typescript
import { 
  createScriptRunner, 
  type ScriptEventHandler,
  type ScriptExecutionResult 
} from '@glyphtek/scriptit';

// Typed event bus
class ScriptEventBus {
  private handlers: Partial<ScriptEventHandler> = {};

  on<K extends keyof ScriptEventHandler>(
    event: K,
    handler: ScriptEventHandler[K]
  ): void {
    this.handlers[event] = handler;
  }

  setupRunner(runner: any): void {
    Object.entries(this.handlers).forEach(([event, handler]) => {
      if (handler) {
        runner.on(event as keyof ScriptEventHandler, handler);
      }
    });
  }
}

// Usage
const eventBus = new ScriptEventBus();

eventBus.on('script:beforeExecute', (scriptPath, params) => {
  console.log(`🚀 Starting ${scriptPath}`);
});

eventBus.on('script:afterExecute', (scriptPath, result) => {
  console.log(`✅ Completed ${scriptPath}`);
});

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
});

eventBus.setupRunner(runner);
```

## Related Documentation

- [Library API](/library/api) - Main API documentation
- [Event System](/library/events) - Event system details
- [CLI Commands](/cli/commands) - CLI type equivalents
- [Examples](/examples/library) - TypeScript usage examples 