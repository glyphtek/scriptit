# Terminal UI (TUI)

ScriptIt provides a beautiful and intuitive Terminal User Interface (TUI) for interactive script management and execution. The TUI offers a visual way to browse, select, and execute scripts with real-time output monitoring.

## Overview

The TUI is built using the blessed library and provides a full-screen terminal interface with multiple panels, keyboard navigation, and real-time script execution monitoring.

```bash
# Launch TUI (default command)
scriptit run
scriptit  # Same as above

# Launch TUI with custom configuration
scriptit run --config custom.config.js --scripts-dir src/scripts
```

## Interface Layout

The TUI consists of several panels arranged in a user-friendly layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│ [C]onfig | [F]iles | [Tab] Focus | [Enter] Run | [j/k] Navigate | [Q]uit │ ← Control Panel
├─────────────────────────────────────────────────────────────────────┤
│ ┌─ Scripts ─────────┐ ┌─ Configuration ─┐                           │
│ │ • hello.js        │ │ Config: Default │                           │
│ │ • deploy.ts       │ │ Scripts: ./scr… │                           │
│ │ • backup.js       │ │ Temp: ./tmp     │                           │
│ │ • utils/clean.js  │ │ Env Vars: 12    │                           │
│ │                   │ │ Exclude: *.test │                           │
│ └───────────────────┘ └─────────────────┘                           │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─ Output (ACTIVE) ─────────────────────────────────────────────────┐ │
│ │ TUI initialized. Use [↑↓] or [j/k] to navigate...                │ │
│ │ 🚀 Starting: hello.js                                            │ │
│ │   Hello from ScriptIt!                                           │ │
│ │   ✅ Script completed successfully                                │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Panels

### 1. Control Panel

The top panel displays available keyboard shortcuts and commands:

- **[C]onfig** - Toggle configuration panel visibility
- **[F]iles** - Toggle file list panel visibility  
- **[Tab]** - Switch focus between panels
- **[Enter]** - Execute selected script
- **[j/k]** - Navigate using vim-style keys
- **[R]efresh** - Refresh script list
- **[Q]uit** - Exit the TUI

### 2. Scripts Panel

The scripts panel shows all available scripts in your scripts directory:

**Features:**
- **Hierarchical display** - Shows directory structure
- **Relative paths** - Clean, readable script paths
- **Selection indicator** - Highlights currently selected script
- **Scrollable list** - Navigate through many scripts
- **Real-time filtering** - Respects exclude patterns

**Navigation:**
- `↑/↓` or `j/k` - Move selection up/down
- `Enter` - Execute selected script
- `Home/End` - Jump to first/last script

### 3. Configuration Panel (Toggle)

The configuration panel displays current settings and can be toggled with `C`:

**Information Displayed:**
- **Config File** - Shows loaded configuration file or "Default"
- **Scripts Directory** - Relative path to scripts directory
- **Temp Directory** - Relative path to temporary directory
- **Environment Variables** - Count of loaded environment variables
- **Exclude Patterns** - Active exclude patterns for filtering

### 4. Output Panel

The output panel shows real-time script execution output:

**Features:**
- **Colored output** - Preserves console colors from scripts
- **Real-time updates** - Shows output as it happens
- **Scrollable history** - Navigate through previous output
- **Execution status** - Clear success/failure indicators
- **Script results** - Displays returned values from scripts

**Navigation:**
- `j/k` - Scroll output up/down when focused
- `Tab` - Switch focus to/from output panel

## Keyboard Controls

### Global Controls

| Key | Action | Description |
|-----|--------|-------------|
| `q`, `Q`, `Ctrl+C` | Quit | Exit the TUI application |
| `Tab` | Switch Focus | Toggle between Scripts and Output panels |
| `c`, `C` | Toggle Config | Show/hide configuration panel |
| `f`, `F` | Toggle Files | Show/hide file list panel |
| `r`, `R` | Refresh | Reload script list from directory |

### Scripts Panel Controls

| Key | Action | Description |
|-----|--------|-------------|
| `↑`, `k` | Move Up | Select previous script |
| `↓`, `j` | Move Down | Select next script |
| `Enter` | Execute | Run the selected script |
| `Home` | First Script | Jump to first script in list |
| `End` | Last Script | Jump to last script in list |

### Output Panel Controls

| Key | Action | Description |
|-----|--------|-------------|
| `j` | Scroll Down | Scroll output down |
| `k` | Scroll Up | Scroll output up |
| `Page Down` | Page Down | Scroll down one page |
| `Page Up` | Page Up | Scroll up one page |

## Features

### Script Discovery

The TUI automatically discovers scripts in your configured scripts directory:

- **Recursive scanning** - Finds scripts in subdirectories
- **Pattern filtering** - Respects exclude patterns from configuration
- **File type support** - Supports `.js`, `.ts`, and other configured extensions
- **Real-time updates** - Refresh with `R` to see new scripts

### Real-time Execution

When you execute a script, the TUI provides:

- **Immediate feedback** - Shows execution start/end
- **Live output streaming** - See output as it happens
- **Colored console output** - Preserves script color formatting
- **Error handling** - Clear error messages and stack traces
- **Result display** - Shows script return values

### Visual Feedback

The TUI provides rich visual feedback:

- **Panel borders** - Color-coded panel borders
- **Focus indicators** - Clear indication of active panel
- **Status messages** - Informative status updates
- **Progress indicators** - Shows script execution progress
- **Color coding** - Different colors for different message types

## Configuration

### TUI-Specific Options

Configure TUI behavior in your `scriptit.config.js`:

```javascript
export default {
  // TUI configuration
  tui: {
    enabled: true,              // Enable TUI by default
    theme: 'default',           // Color theme
    refreshInterval: 1000,      // Auto-refresh interval (ms)
    showHiddenFiles: false,     // Show hidden files
    defaultFocus: 'scripts'     // Default focused panel
  },
  
  // Display configuration
  display: {
    showRelativePaths: true,    // Show relative paths in scripts list
    maxPathLength: 50,          // Truncate long paths
    showFileExtensions: true,   // Show file extensions
    groupByDirectory: false     // Group scripts by directory
  }
}
```

### Environment Variables

Control TUI behavior with environment variables:

```bash
# Disable TUI and use CLI mode
scriptit run --no-tui

# Force TUI even in debug mode
scriptit run --force-tui

# Enable debug mode for TUI
SCRIPTIT_DEBUG=true scriptit run
```

## Usage Examples

### Basic TUI Usage

```bash
# Launch TUI with default settings
scriptit run

# Navigate to a script using arrow keys or j/k
# Press Enter to execute the selected script
# Press q to quit
```

### Custom Configuration

```bash
# Use custom scripts directory
scriptit run --scripts-dir src/automation

# Use custom configuration file
scriptit run --config production.config.js

# Combine options
scriptit run --config prod.config.js --scripts-dir scripts --tmp-dir temp
```

### Development Workflow

```bash
# 1. Initialize project with TUI-friendly structure
scriptit init

# 2. Create some scripts
mkdir -p scripts/utils
echo 'export async function execute(context) { 
  const console = context.console || global.console;
  console.log("Hello from TUI!"); 
}' > scripts/hello.js

# 3. Launch TUI
scriptit run

# 4. Navigate and execute scripts interactively
```

### Debugging with TUI

```bash
# Enable debug mode to see detailed information
SCRIPTIT_DEBUG=true scriptit run

# The TUI will show additional debug information:
# - Runtime detection details
# - Configuration loading process
# - Script discovery process
# - Execution environment details
```

## Advanced Features

### Script Metadata Display

The TUI can display script metadata when available:

```javascript
// my-script.js
export const description = "This description appears in the TUI";
export const author = "Your Name";
export const version = "1.0.0";

export async function execute(context) {
  // Script implementation
}
```

### Multi-Panel Layout

The TUI supports different layout modes:

```bash
# Hide configuration panel for more space
# Press 'C' to toggle configuration panel

# Hide file list to focus on output
# Press 'F' to toggle file list panel

# Switch focus between panels
# Press 'Tab' to switch focus
```

### Output Management

The output panel provides advanced features:

- **Automatic scrolling** - Follows new output automatically
- **Manual navigation** - Use j/k to scroll through history
- **Clear indicators** - Visual separation between script runs
- **Error highlighting** - Errors are clearly marked
- **Result formatting** - Script results are nicely formatted

## Troubleshooting

### Common Issues

**TUI doesn't start:**
```bash
❌ Error initializing TUI: Terminal not supported
💡 Try running with --no-tui flag
💡 Ensure your terminal supports ANSI colors
```

**Scripts not showing:**
```bash
# Check if scripts directory exists
ls -la scripts/

# Check exclude patterns in config
scriptit run --debug

# Refresh script list
# Press 'R' in TUI to refresh
```

**Keyboard not working:**
```bash
# Ensure terminal supports keyboard input
# Try different terminal emulator
# Check if running in proper TTY
```

### Debug Mode

Enable debug mode for detailed TUI information:

```bash
SCRIPTIT_DEBUG=true scriptit run
```

Debug mode shows:
- Terminal capabilities
- Script discovery process
- Configuration loading
- Keyboard event handling
- Panel rendering details

### Terminal Compatibility

The TUI works best with modern terminal emulators:

**✅ Fully Supported:**
- iTerm2 (macOS)
- Terminal.app (macOS)
- Windows Terminal
- GNOME Terminal
- Konsole
- Alacritty
- Hyper

**⚠️ Limited Support:**
- Basic terminals without color support
- Very old terminal emulators
- Some CI/CD environments

**❌ Not Supported:**
- Non-interactive environments
- Terminals without TTY support

## Integration with Other Features

### Console Colors

The TUI preserves colored console output from scripts:

```javascript
// colored-script.js
export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Regular message');    // White
  console.error('Error message');    // Red  
  console.warn('Warning message');   // Yellow
  console.info('Info message');      // Blue
  console.debug('Debug message');    // Gray
}
```

### Environment Variables

The TUI displays environment information in the configuration panel:

```javascript
// env-script.js
export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Environment:', context.env.NODE_ENV);
  console.log('API Key:', context.env.API_KEY ? '***' : 'Not set');
  console.log('Database:', context.env.DATABASE_URL ? 'Connected' : 'Not configured');
}
```

### Cross-Runtime Support

The TUI works consistently across all supported runtimes:

```bash
# TUI with Bun (fastest)
scriptit --runtime=bun run

# TUI with Deno (secure)
scriptit --runtime=deno run

# TUI with Node.js (compatible)
scriptit --runtime=node run
```

## Best Practices

### 1. Organize Scripts

Structure your scripts for better TUI navigation:

```
scripts/
├── development/
│   ├── setup.js
│   └── test.js
├── deployment/
│   ├── build.js
│   └── deploy.js
└── utilities/
    ├── cleanup.js
    └── backup.js
```

### 2. Use Descriptive Names

Choose clear, descriptive script names:

```javascript
// ✅ Good - clear purpose
export const description = "Deploy application to production";

// ❌ Avoid - unclear purpose
export const description = "Script";
```

### 3. Provide Feedback

Give users clear feedback during execution:

```javascript
export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🚀 Starting deployment...');
  console.log('📦 Building application...');
  console.log('🔄 Uploading files...');
  console.log('✅ Deployment complete!');
}
```

### 4. Handle Errors Gracefully

Provide clear error messages:

```javascript
export async function execute(context) {
  const console = context.console || global.console;
  
  try {
    // Script logic
    console.log('✅ Operation successful');
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    throw error; // Re-throw for TUI error handling
  }
}
```

## Related Documentation

- [CLI Commands](/cli/commands) - Command-line interface
- [Console Colors](/features/console-colors) - Colored output features
- [Configuration](/cli/configuration) - TUI configuration options
- [Getting Started](/getting-started) - Basic usage guide 