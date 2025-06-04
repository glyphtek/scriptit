# Architecture Guide

This guide explains ScriptIt's internal architecture, focusing on the unified script execution system and environment variable prompting capabilities introduced in recent versions.

## Overview

ScriptIt is built with a modular architecture that separates concerns and enables code reuse across different interfaces (CLI and TUI). The core principle is to have shared execution logic with pluggable interface-specific components.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ScriptIt Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                           ┌─────────────┐      │
│  │    CLI      │                           │    TUI      │      │
│  │ Interface   │                           │ Interface   │      │
│  └─────────────┘                           └─────────────┘      │
│        │                                         │              │
│        │                                         │              │
│  ┌─────────────┐                           ┌─────────────┐      │
│  │ CLI         │                           │ TUI         │      │
│  │ Prompter    │                           │ Prompter    │      │
│  └─────────────┘                           └─────────────┘      │
│        │                                         │              │
│        └─────────────────┬───────────────────────┘              │
│                          │                                      │
│                    ┌─────────────┐                              │
│                    │ Core Script │                              │
│                    │ Execution   │                              │
│                    │ Engine      │                              │
│                    └─────────────┘                              │
│                          │                                      │
│            ┌─────────────┼─────────────┐                        │
│            │             │             │                        │
│     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│     │ Environment │ │ Script      │ │ Console     │             │
│     │ Management  │ │ Executor    │ │ Interceptor │             │
│     └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Script Execution Engine (`src/core/script-executor.ts`)

The heart of ScriptIt is the unified script execution engine that handles:

- **Script Loading** - Dynamic import with cache busting
- **Lifecycle Management** - tearUp → execute → tearDown
- **Environment Preparation** - Variable collection and injection
- **Console Interception** - Colored output and logging
- **Error Handling** - Comprehensive error reporting

#### Key Function: `executeScriptWithEnvironment()`

```typescript
export async function executeScriptWithEnvironment(
  options: ScriptExecutionOptions
): Promise<unknown>
```

This function orchestrates the entire script execution process:

1. **Script Validation** - Ensures script file exists
2. **Environment Discovery** - Loads script to detect variable requirements
3. **Variable Collection** - Uses appropriate prompter for missing variables
4. **Environment Assembly** - Merges all environment sources with proper precedence
5. **Script Execution** - Runs script with enhanced context
6. **Result Handling** - Processes and returns script results

### 2. Environment Prompter Interface

The prompter interface enables different UIs to collect environment variables:

```typescript
export interface EnvironmentPrompter {
  promptForVariables(
    variables: VariableDefinition[],
    existingEnv: Record<string, string | undefined>
  ): Promise<Record<string, string>>;
}
```

#### CLI Prompter (`CLIEnvironmentPrompter`)

Uses Node.js readline for terminal-based prompting:

- **Regular Input** - Standard readline interface
- **Password Input** - Raw mode with character masking
- **Interrupt Handling** - Graceful Ctrl+C handling
- **Progress Feedback** - Colored status messages

#### TUI Prompter (`TUIEnvironmentPrompter`)

Uses blessed widgets for modal-based prompting:

- **Modal Dialogs** - Centered, bordered input dialogs
- **Visual Feedback** - Icons and color coding for variable types
- **Keyboard Navigation** - Enter/Escape/Tab controls
- **Integration** - Seamless integration with TUI layout

### 3. Configuration System

Centralized configuration loading and management:

```typescript
interface RunnerConfig {
  scriptsDir: string;
  tmpDir: string;
  envFiles: string[];
  excludePatterns: string[];
  defaultParams: Record<string, unknown>;
  loadedConfigPath?: string;
}
```

## Environment Variable System

### Variable Definition

Scripts can define required variables in multiple formats:

```typescript
// Full definition with custom prompts and types
export const variables = [
  { name: 'API_KEY', message: 'Enter your API key:', type: 'password' },
  { name: 'USER_NAME', message: 'Enter your username:', type: 'input' },
];

// Shorthand definition for quick setup
export const variables = ['API_KEY', 'DATABASE_URL', 'SECRET_TOKEN'];
```

### Variable Collection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                Variable Collection Process                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Load Script Module                                          │
│     └─ Extract `variables` export                               │
│                                                                 │
│  2. Merge Variable Sources                                      │
│     ├─ CLI --env-prompts                                        │
│     ├─ Script variables export                                  │
│     └─ Remove duplicates (CLI takes precedence)                 │
│                                                                 │
│  3. Load Base Environment                                       │
│     ├─ .env files                                              │
│     ├─ Config defaultParams                                     │
│     └─ CLI --env arguments                                      │
│                                                                 │
│  4. Filter Missing Variables                                    │
│     └─ Only prompt for variables not already set                │
│                                                                 │
│  5. Prompt for Missing Variables                                │
│     ├─ CLI: readline prompting                                  │
│     └─ TUI: modal dialog prompting                              │
│                                                                 │
│  6. Assemble Final Environment                                  │
│     ├─ Base environment                                         │
│     ├─ CLI-provided values                                      │
│     ├─ Prompted values                                          │
│     └─ Set in process.env                                       │
│                                                                 │
│  7. Execute Script                                              │
│     └─ All variables available in context.env                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Precedence

ScriptIt follows a clear precedence order for environment variables:

1. **Prompted Variables** - Collected interactively (Highest priority)
2. **CLI Arguments** (`--env NAME=value`) - CLI-provided environment variables
3. **Config Default Params** - From runner.config.js
4. **Environment Files** - .env, .env.local, etc. (Lowest priority)

## Console Interception

ScriptIt provides colored console output through a sophisticated interception system:

### Console Enhancement

```typescript
interface EnhancedContext extends ScriptContext {
  console: {
    log: (...args: unknown[]) => void;    // White
    info: (...args: unknown[]) => void;   // Blue
    warn: (...args: unknown[]) => void;   // Yellow
    error: (...args: unknown[]) => void;  // Red
    debug: (...args: unknown[]) => void;  // Gray
  };
}
```

### Safe Serialization

The console interceptor includes safe serialization to prevent circular reference errors:

- **Primitive Types** - Direct string conversion
- **Objects** - Safe JSON serialization with fallbacks
- **Functions** - `[Function]` placeholder
- **Circular References** - `[Object]` placeholder
- **Error Objects** - Special error message extraction

## Interface Integration

### CLI Integration (`src/cli.ts`)

The CLI integrates with the core execution engine through:

1. **Centralized Options** - Reusable option definitions in `CLI_OPTIONS`
2. **Shared Execution** - Uses `executeScriptWithEnvironment()`
3. **CLI Prompter** - Readline-based environment variable collection
4. **Error Handling** - Process exit codes and colored error messages

### TUI Integration (`src/ui/blessed-ui.ts`)

The TUI integrates through:

1. **Modal Prompting** - Blessed-based environment variable collection
2. **Real-time Logging** - Live output streaming to TUI panels
3. **Shared Configuration** - Uses same config system as CLI
4. **Event Handling** - Keyboard navigation and script execution

## Error Handling

### Hierarchical Error Handling

1. **Script Level** - Script-specific errors with context
2. **Execution Level** - Environment and configuration errors
3. **Interface Level** - CLI/TUI specific error display
4. **Process Level** - Exit codes and termination

### Error Types

- **Configuration Errors** - Invalid config or missing files
- **Environment Errors** - Missing directories or variables
- **Script Errors** - Runtime errors within scripts
- **Interface Errors** - TUI/CLI specific issues

## Performance Considerations

### Script Loading

- **Dynamic Imports** - Fresh script loading with cache busting
- **Lazy Loading** - Scripts loaded only when needed
- **Error Isolation** - Script errors don't crash the system

### Memory Management

- **Variable Cleanup** - Prompted variables cleared after execution
- **Module Caching** - Careful cache management for script updates
- **Resource Cleanup** - Proper cleanup of temporary resources

## Extension Points

The architecture is designed for extensibility:

### New Prompter Implementations

```typescript
class WebUIPrompter implements EnvironmentPrompter {
  async promptForVariables(
    variables: VariableDefinition[],
    existingEnv: Record<string, string | undefined>
  ): Promise<Record<string, string>> {
    // Web-based prompting implementation
  }
}
```

### Custom Execution Contexts

```typescript
const customExecutor = createScriptExecutorInstance({
  consoleInterception: {
    enabled: true,
    logFunction: customLogger,
    useColors: false
  }
});
```

### Configuration Extensions

```typescript
interface ExtendedConfig extends RunnerConfig {
  customFeatures: {
    enableMetrics: boolean;
    apiEndpoint: string;
  };
}
```

## Best Practices

### For Core Development

1. **Interface Abstraction** - Keep UI-specific code out of core
2. **Error Propagation** - Let errors bubble up with context
3. **Configuration Validation** - Validate config early and clearly
4. **Type Safety** - Use TypeScript interfaces consistently

### For Interface Development

1. **Prompter Implementation** - Implement consistent prompting behavior
2. **Error Display** - Provide clear, actionable error messages
3. **User Feedback** - Show progress and status information
4. **Resource Cleanup** - Clean up UI resources properly

### For Script Authors

1. **Variable Declaration** - Declare required variables explicitly
2. **Error Handling** - Provide meaningful error messages
3. **Context Usage** - Use enhanced console for better output
4. **Type Annotations** - Include TypeScript types for better DX

## Migration Guide

### From Previous Versions

The unified architecture is backward compatible, but new features are available:

```typescript
// Old approach (still works)
export async function execute(context) {
  console.log('Hello world');
}

// New approach (recommended)
export const variables = ['API_KEY'];

export async function execute(context) {
  const console = context.console || global.console;
  console.info('Using enhanced console with colors');
  console.log('API Key:', context.env.API_KEY ? '***' : 'Not set');
}
```

## Related Documentation

- [Writing Scripts](/guides/writing-scripts) - Script development guide
- [TUI Features](/features/tui) - Terminal UI documentation
- [CLI Commands](/cli/commands) - Command-line interface
- [Environment Variables](/cli/environment) - Environment management 