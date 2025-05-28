# ScriptIt Examples

This directory contains comprehensive examples demonstrating different ways to use **ScriptIt**.

## Examples Overview

### 🖥️ [UI Example](./ui/) - CLI and Terminal Interface
Perfect for interactive script management and development workflows.

**Use Cases:**
- Interactive script development and testing
- Visual browsing of available scripts
- Real-time script output monitoring
- Configuration management through TUI

**Key Features:**
- Terminal User Interface (TUI) with keyboard navigation
- CLI commands for direct script execution
- Configuration panel with environment details
- Support for both traditional and lambda-style scripts

### 📚 [Library Example](./lib/) - Programmatic Integration
Ideal for integrating ScriptIt into existing applications and automated workflows.

**Use Cases:**
- Automated script execution in applications
- Background job processing
- Scheduled task management
- Custom workflow orchestration

**Key Features:**
- Programmatic script execution
- Event-driven architecture
- Custom logging and error handling
- Environment and configuration management

## Quick Start

### UI Example
```bash
cd examples/ui
scriptit init
scriptit run
```

### Library Example
```bash
cd examples/lib
bun install
bun start
```

## Directory Structure

```
examples/
├── README.md            # This file
├── ui/                  # CLI and TUI examples
│   ├── runner.config.js # Configuration file
│   ├── env.example      # Environment variables
│   ├── scripts/         # Example scripts
│   ├── helpers/         # Helper files (excluded)
│   ├── tmp/             # Temporary files
│   └── README.md        # UI-specific documentation
└── lib/                 # Library integration examples
    ├── package.json     # Node.js project setup
    ├── src/index.ts     # Main library example
    ├── scripts/         # Auto-generated example scripts
    ├── tmp/             # Temporary files
    ├── env.example      # Environment variables
    └── README.md        # Library-specific documentation
```

## Common Features Demonstrated

Both examples showcase:

### 🔧 **Configuration Management**
- Custom scripts and temp directories
- Environment file loading
- Default parameter interpolation
- Exclude patterns for helper files

### 📝 **Script Lifecycle**
- **tearUp**: Resource initialization
- **execute**: Main script logic  
- **tearDown**: Cleanup and finalization

### 🌍 **Environment Handling**
- Multiple .env file support
- Variable interpolation
- Runtime environment overrides

### 🚫 **Exclude Patterns**
- `*.helper.*` - Helper utility files
- `_*` - Internal/private files
- `helpers/**` - Helper directories
- `*.test.*` - Test files

## Example Scripts

Both examples include similar demonstration scripts:

### hello.ts
Simple script showing basic functionality:
- Environment variable access
- Parameter usage
- Logging capabilities
- Return values

### lifecycle.ts / data-processor.ts
Complex scripts demonstrating:
- Full tearUp/execute/tearDown lifecycle
- File operations
- Error handling
- Temporary file management

## Choosing the Right Approach

| Feature | UI Example | Library Example |
|---------|------------|-----------------|
| **Interactive Use** | ✅ Perfect | ❌ Not applicable |
| **Automation** | ⚠️ Limited | ✅ Excellent |
| **Integration** | ❌ Standalone only | ✅ Full integration |
| **Development** | ✅ Great for testing | ⚠️ Requires setup |
| **Deployment** | ✅ Simple CLI | ✅ Embedded in apps |

## Common Patterns

Both examples demonstrate:
- **Flexible Script Support**: Traditional `execute` functions and lambda-style default exports
- **Environment Management**: Loading and interpolating environment variables
- **Configuration**: Using `runner.config.js` for project setup
- **Exclude Patterns**: Filtering helper files and internal scripts
- **Lifecycle Management**: tearUp, execute, and tearDown phases

## Next Steps

1. **Start with UI Example** if you want to see ScriptIt in action quickly
2. **Try the Library Example** if you want to integrate ScriptIt programmatically
3. **Read the documentation** in each example's README for detailed explanations
4. **Experiment with configurations** to understand the flexibility of ScriptIt
5. **Create your own scripts** following the patterns shown in the examples

## Support

For questions and issues:
- Check the main project README
- Review the TypeScript definitions in `src/`
- Look at the test files in `tests/`
- Create an issue in the project repository 