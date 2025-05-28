# ScriptIt UI Example

This example demonstrates using ScriptIt as a **CLI tool** with both Terminal UI (TUI) and command-line interfaces.

## Structure

```
examples/ui/
├── runner.config.js     # Configuration file
├── env.example          # Example environment variables
├── scripts/             # Executable scripts
│   ├── hello.ts         # Simple hello world script
│   ├── lifecycle.ts     # Demonstrates full tearUp/execute/tearDown lifecycle
│   ├── database-backup.ts # Realistic database backup example
│   ├── utils.helper.ts  # Helper file (excluded by patterns)
│   └── _internal.ts     # Internal file (excluded by patterns)
├── helpers/             # Helper directory (excluded by patterns)
│   └── database.helper.ts
└── tmp/                 # Temporary files directory
```

## Configuration Features Demonstrated

- **Scripts Directory**: Custom scripts location (`./scripts`)
- **Temporary Directory**: Custom temp directory (`./tmp`)
- **Environment Files**: Multiple env file support
- **Default Parameters**: Predefined parameters with variable interpolation
- **Exclude Patterns**: Comprehensive exclusion rules:
  - `*.helper.*` - Excludes helper files
  - `_*` - Excludes files starting with underscore
  - `helpers/**` - Excludes entire helpers directory
  - `*.test.*` - Excludes test files

## Features Demonstrated

- **Interactive Terminal UI (TUI)** - Visual script browser and executor
- **Command-line interface** - Direct script execution and management
- **Configuration management** - Custom config files and environment variables
- **Script lifecycle** - tearUp, execute, tearDown pattern
- **Lambda functions** - Default export pattern support
- **Exclude patterns** - Filter out helper files and internal scripts

## Quick Start

```bash
# Run the TUI
bun ../../bin/scriptit.sh

# Run without TUI
bun ../../bin/scriptit.sh --no-tui

# Execute a specific script
bun ../../bin/scriptit.sh exec hello.ts

# Execute with custom environment variables
bun ../../bin/scriptit.sh exec hello.ts --env MY_CUSTOM_VAR=value

# Use custom configuration
bun ../../bin/scriptit.sh --config ./runner.config.js exec hello.ts

# Initialize a new project structure
bun ../../bin/scriptit.sh init --scripts-dir ./my-scripts --tmp-dir ./my-tmp
```

## Terminal UI (TUI) Features

When you run ScriptIt without `--no-tui`, you get a beautiful terminal interface:

### Keyboard Shortcuts

- **↑↓** or **j/k** - Navigate script list
- **Tab** - Switch focus between panels (Scripts ↔ Output)
- **Enter** - Execute selected script
- **C** - Toggle configuration panel visibility
- **F** - Toggle file list panel visibility
- **R** - Refresh script list
- **Q** or **Ctrl+C** - Quit application

### Panels

1. **Control Panel** (top) - Shows available keyboard shortcuts
2. **Scripts Panel** (left/top) - Browse and select scripts
3. **Configuration Panel** (left, toggle with C) - View current settings
4. **Output Panel** (bottom/right) - Real-time script execution output

## Example Scripts

This directory contains several example scripts demonstrating different patterns:

### Traditional Lifecycle Script (`hello.ts`)
```typescript
export async function tearUp(context) {
  // Setup logic
}

export async function execute(context, tearUpResult) {
  // Main logic
}

export async function tearDown(context, executeResult, tearUpResult) {
  // Cleanup logic
}
```

### Lambda-Style Script (`lambda-example.ts`)
```typescript
export default async function(context) {
  // Your existing lambda function logic
  return result;
}
```

### Data Processing Script (`database-backup.ts`)
Demonstrates file operations, environment variables, and error handling.

## Configuration

The `runner.config.js` file shows all available configuration options:

```javascript
export default {
  scriptsDir: './scripts',
  tmpDir: './tmp',
  envFiles: ['.env', '.env.local'],
  excludePatterns: [
    '**/helpers/**',     // Exclude helpers directory
    '**/*.helper.*',     // Exclude helper files
    '_*'                 // Exclude files starting with underscore
  ],
  defaultParams: {
    appName: 'ScriptIt UI Example',
    version: '1.0.0'
  }
};
```

## Environment Variables

The `.env.example` file shows environment variable patterns:

```bash
MY_VARIABLE="Hello from .env"
API_TOKEN="your_secret_token_here"
DATABASE_URL="postgresql://localhost:5432/mydb"
```

## Working Directory Usage

ScriptIt supports running from different directories using the `--pwd` option:

```bash
# Run from project root, but execute in examples/ui context
bun bin/scriptit.sh --pwd examples/ui run

# Execute specific script with working directory
bun bin/scriptit.sh --pwd examples/ui exec ./scripts/hello.ts

# Initialize project in specific directory
bun bin/scriptit.sh --pwd /tmp/my-scripts init
```

This is useful for:
- **CI/CD pipelines** - Run scripts from build directories
- **Multi-project setups** - Manage scripts across different repositories
- **Automation tools** - Execute scripts from various locations

## Use Cases

### Development Workflow
- **Script Development** - Test and debug scripts interactively
- **Environment Testing** - Quickly switch between different configurations
- **Batch Operations** - Run multiple scripts in sequence

### DevOps & Automation
- **Deployment Scripts** - Manage deployment workflows
- **Database Operations** - Run migrations and backups
- **System Maintenance** - Automate routine tasks

### Team Collaboration
- **Shared Scripts** - Team members can easily discover and run scripts
- **Documentation** - Scripts are self-documenting with descriptions
- **Consistency** - Standardized execution environment

## Comparison with Library Usage

| Feature | UI Example (This) | Library Example |
|---------|------------------|-----------------|
| **Usage** | CLI tool, interactive | Programmatic integration |
| **Interface** | Terminal UI + commands | JavaScript/TypeScript API |
| **Best For** | Manual execution, development | Automation, integration |
| **Script Discovery** | Visual browsing | Programmatic listing |
| **Execution** | Interactive selection | Code-driven execution |
| **Output** | Real-time terminal display | Custom logging/handling |

## Next Steps

1. **Explore the TUI** - Run `bun ../../bin/scriptit.sh` and try the interface
2. **Create Custom Scripts** - Add your own scripts to the `scripts/` directory
3. **Customize Configuration** - Modify `runner.config.js` for your needs
4. **Try Library Usage** - Check out `../lib/` for programmatic integration
5. **Integration** - Use ScriptIt in your own projects