# CLI Commands

ScriptIt provides a powerful command-line interface with several commands for different use cases. All commands support runtime selection and various configuration options.

## Overview

```bash
scriptit [options] [command]
```

### Global Options

These options are available for all commands:

| Option | Description |
|--------|-------------|
| `-V, --version` | Output the version number |
| `-d, --debug` | Run in debug mode with verbose logging |
| `--pwd <dir>` | Set working directory for script execution (all relative paths resolve from here) |
| `-h, --help` | Display help for command |

### Runtime Selection

ScriptIt supports multiple JavaScript runtimes with intelligent auto-detection:

```bash
# Auto-detection (Priority: Bun > Deno > Node.js)
scriptit exec script.js

# Force specific runtime
scriptit --runtime=bun exec script.js
scriptit --runtime=deno exec script.js
scriptit --runtime=node exec script.js

# Environment variable
SCRIPTIT_RUNTIME=bun scriptit exec script.js
```

**Available Runtimes:**
- **Bun** - Recommended for TypeScript, fastest performance
- **Deno** - Built-in TypeScript support, secure by default
- **Node.js** - Uses tsx for TypeScript if available

## Commands

### `init` - Initialize Project

Initialize a new ScriptIt project with proper directory structure.

```bash
scriptit init [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --scripts-dir <dir>` | Directory for scripts | `scripts` |
| `-t, --tmp-dir <dir>` | Directory for temporary files | `tmp` |
| `-f, --force` | Overwrite existing files and directories | `false` |

#### Examples

```bash
# Basic initialization
scriptit init

# Custom scripts directory
scriptit init --scripts-dir src/scripts

# Force overwrite existing files
scriptit init --force

# Custom directories
scriptit init --scripts-dir my-scripts --tmp-dir temp
```

#### What Gets Created

The `init` command creates:

```
project/
├── scripts/           # Script files directory
├── tmp/              # Temporary files directory
├── .env              # Environment variables template
├── scriptit.config.js # Configuration file
└── README.md         # Project documentation
```

### `exec` - Execute Script

Execute a single script file directly with colored console output.

```bash
scriptit exec [options] <scriptPath>
```

#### Options

| Option | Description |
|--------|-------------|
| `-c, --config <path>` | Path to runner configuration file |
| `-e, --env <vars...>` | Set environment variables (e.g., NAME=Bun X=Y) |

#### Examples

```bash
# Execute a script
scriptit exec hello.js

# With custom config
scriptit exec --config custom.config.js script.js

# Set environment variables
scriptit exec --env NODE_ENV=production API_KEY=secret script.js

# Multiple environment variables
scriptit exec --env NODE_ENV=dev DEBUG=true PORT=3000 script.js

# Force specific runtime
scriptit --runtime=bun exec script.ts

# With working directory
scriptit --pwd /path/to/project exec script.js
```

#### Script Requirements

Scripts must export either:

1. **Execute function** (traditional pattern):
```javascript
export async function execute(context) {
  const console = context.console || global.console;
  console.log('Hello from ScriptIt!');
  return { success: true };
}
```

2. **Default function** (default export pattern):
```javascript
export default async function(context) {
  const console = context.console || global.console;
  console.log('Hello from ScriptIt!');
  return { success: true };
}
```

#### Context Object

The `context` parameter provides:

```javascript
{
  console: {        // Colored console methods
    log: Function,   // White output
    error: Function, // Red output
    warn: Function,  // Yellow output
    info: Function,  // Blue output
    debug: Function  // Gray output
  },
  env: {            // Environment variables
    NODE_ENV: 'development',
    API_KEY: 'your-key',
    // ... all process.env variables
  },
  // Additional context properties...
}
```

### `run` - Interactive TUI

Launch the interactive Terminal UI for browsing and executing scripts.

```bash
scriptit run [options]
```

#### Options

| Option | Description |
|--------|-------------|
| `-c, --config <path>` | Path to runner configuration file |
| `-s, --scripts-dir <dir>` | Override scripts directory from config |
| `-t, --tmp-dir <dir>` | Override temporary directory from config |
| `--no-tui` | Run without Terminal UI, just list available scripts |
| `--force-tui` | Force TUI mode even when debug is enabled |

#### Examples

```bash
# Launch interactive TUI (default command)
scriptit run
scriptit  # Same as above

# Custom scripts directory
scriptit run --scripts-dir src/scripts

# List scripts without TUI
scriptit run --no-tui

# Force TUI in debug mode
scriptit --debug run --force-tui

# Custom config and directories
scriptit run --config custom.config.js --scripts-dir scripts --tmp-dir temp
```

#### TUI Features

The Terminal UI provides:

- **📁 Script Browser** - Navigate through script directories
- **🎨 Colored Output** - Real-time colored console output
- **⚡ Quick Execution** - Run scripts with keyboard shortcuts
- **📊 Status Display** - See script execution status
- **🔍 Search** - Find scripts quickly
- **📝 Script Info** - View script descriptions and metadata

#### TUI Controls

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate scripts |
| `Enter` | Execute selected script |
| `/` | Search scripts |
| `q` | Quit TUI |
| `r` | Refresh script list |
| `?` | Show help |

## Common Workflows

### Development Workflow

```bash
# 1. Initialize project
scriptit init

# 2. Create a script
cat > scripts/hello.js << 'EOF'
export async function execute(context) {
  const console = context.console || global.console;
  console.log('Hello from ScriptIt!');
  console.info('Development mode');
  return { message: 'Success!' };
}
EOF

# 3. Execute directly
scriptit exec scripts/hello.js

# 4. Or use TUI
scriptit run
```

### Production Workflow

```bash
# Execute with production environment
scriptit exec --env NODE_ENV=production --env DEBUG=false deploy.js

# Use specific runtime for consistency
scriptit --runtime=node exec --config prod.config.js deploy.js

# Set working directory
scriptit --pwd /app exec scripts/deploy.js
```

### TypeScript Workflow

```bash
# TypeScript works out of the box
scriptit exec script.ts

# Force Bun for best TypeScript performance
scriptit --runtime=bun exec script.ts

# Deno also has excellent TypeScript support
scriptit --runtime=deno exec script.ts
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SCRIPTIT_RUNTIME` | Default runtime to use | `bun`, `deno`, `node` |
| `SCRIPTIT_DEBUG` | Enable debug mode | `true`, `false` |

### Config File

Create `scriptit.config.js` for project-specific settings:

```javascript
export default {
  runtime: 'auto',
  scriptsDir: 'scripts',
  tmpDir: 'tmp',
  consoleColors: true,
  timeout: 30000,
  env: {
    NODE_ENV: 'development'
  }
}
```

## Error Handling

### Common Errors

**Script not found:**
```bash
❌ ScriptIt Error: Script file not found: missing.js
💡 Check the file path and ensure the script exists
```

**Invalid script structure:**
```bash
❌ ScriptIt Error: Script must export 'execute' function or default function
💡 Add: export async function execute(context) { ... }
```

**Runtime not available:**
```bash
❌ ScriptIt Error: Bun runtime selected but not found
💡 Install Bun: https://bun.sh
```

### Debug Mode

Enable debug mode for detailed information:

```bash
scriptit --debug exec script.js
```

Debug mode shows:
- Runtime detection process
- Configuration loading
- Script execution details
- Environment variables
- Performance metrics

## Tips and Best Practices

### 1. Use Colored Console

Always use the enhanced console for better output:

```javascript
// ✅ Good - colored output
export async function execute(context) {
  const console = context.console || global.console;
  console.log('This will be white');
  console.error('This will be red');
}

// ❌ Less helpful - no colors
export async function execute(context) {
  console.log('This will not be colored');
}
```

### 2. Handle Environment Variables

Access environment variables through context:

```javascript
export async function execute(context) {
  const apiKey = context.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }
  // Use apiKey...
}
```

### 3. Return Meaningful Results

Return structured data from your scripts:

```javascript
export async function execute(context) {
  // Do work...
  return {
    success: true,
    processedFiles: 42,
    duration: '2.3s',
    errors: []
  };
}
```

### 4. Use Appropriate Runtimes

Choose the right runtime for your needs:

- **Bun**: Best for TypeScript, fastest startup
- **Deno**: Secure by default, built-in TypeScript
- **Node.js**: Maximum compatibility, large ecosystem

### 5. Organize Scripts

Use descriptive names and organize in directories:

```
scripts/
├── build/
│   ├── compile.js
│   └── deploy.js
├── dev/
│   ├── start.js
│   └── test.js
└── utils/
    ├── cleanup.js
    └── backup.js
```

## Related Documentation

- [Configuration](/cli/configuration) - Detailed configuration options
- [Environment Variables](/cli/environment) - Environment management
- [Runtime Selection](/cli/runtime) - Runtime-specific features
- [Colored Console](/features/console-colors) - Console output features
- [Examples](/examples/cli) - Real-world CLI examples 