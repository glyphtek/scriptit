# Changelog

All notable changes to ScriptIt will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2025-01-29

### Fixed
- **CLI Documentation**: Corrected README to match actual CLI implementation
  - Removed non-existent `--console-colors` flag references
  - Added comprehensive documentation for all available CLI options
  - Fixed console interception configuration examples (`consoleInterception: { enabled: true }`)
- **Type Accuracy**: Updated ScriptContext interface to match implementation
  - Fixed console method signatures to use `(...args: any[])` instead of `(message: string)`
  - Added missing `params` property to ScriptContext
  - Corrected type annotations from `any` to `unknown` for better type safety

### Enhanced
- **Documentation Structure**: Significantly improved README organization and readability
  - Simplified introduction with clearer value proposition
  - Added Quick Start section for immediate value
  - Grouped features into logical categories (Developer Experience, Runtime & Performance, etc.)
  - Consolidated redundant sections and improved scannability
  - Added comprehensive troubleshooting section with common issues and solutions
- **Build Performance**: Migrated to rolldown-vite for faster documentation builds
  - Configured Bun package overrides for seamless rolldown-vite integration
  - Improved VitePress build performance with Rust-powered bundling
- **CLI Help**: Enhanced command documentation with complete option lists and examples

### Technical
- **Package Configuration**: Added rolldown-vite override in package.json for improved build performance
- **Version Consistency**: Updated CLI version string to match package version
- **Documentation Accuracy**: All README examples now work exactly as shown without modification

### Migration Notes

No breaking changes in this release. All existing functionality continues to work as before.

#### Documentation Updates
If you were using examples from the README, note these corrections:
- Colored console is enabled by default in CLI (no flag needed)
- Use `consoleInterception: { enabled: true }` instead of `consoleInterception: true` in library configuration

## [0.5.0] - 2025-01-29

### Added
- **Colored Console Output**: Automatic color coding for different console methods
  - 🤍 White for `console.log()` - Regular information
  - 🔴 Red for `console.error()` - Errors and critical issues  
  - 🟡 Yellow for `console.warn()` - Warnings and cautions
  - 🔵 Blue for `console.info()` - Informational messages
  - ⚫ Gray for `console.debug()` - Debug information
- **Enhanced Script Context**: Scripts now receive `context.console` with colored output methods
- **Memory-Safe Console Interception**: Safe object serialization prevents circular references and memory leaks
- **Cross-Runtime Color Support**: Colored console works across Bun, Node.js, and Deno
- **Library Console Interception**: Added `consoleInterception` option to `CreateScriptRunnerOptions`

### Enhanced
- **CLI Experience**: Colored console output enabled by default for better debugging
- **Script Execution**: Enhanced context provides richer environment for script development
- **Error Handling**: Better error formatting and display with colored output
- **Performance**: Optimized console interception with minimal overhead

### Technical
- **Safe Serialization**: Implemented `safeStringify()` to handle complex objects without circular reference issues
- **Chalk Integration**: Leveraged chalk library for consistent color rendering across platforms
- **Context Enhancement**: Extended script context with colored console methods

### Usage Examples

```javascript
// Scripts now have access to colored console via context
export async function execute(context) {
  context.console.log('Regular message');    // White
  context.console.info('Information');       // Blue  
  context.console.warn('Warning');          // Yellow
  context.console.error('Error');           // Red
  context.console.debug('Debug info');      // Gray
}
```

```javascript
// Library usage with console interception
const runner = createScriptRunner({
  consoleInterception: true  // Enable colored console
});
```

## [0.4.2] - 2025-01-28

### Fixed
- Improved error handling in script execution
- Better TypeScript type definitions
- Enhanced cross-runtime compatibility

### Enhanced
- More robust environment variable handling
- Improved TUI responsiveness
- Better error messages and debugging information

## [0.4.1] - 2025-01-27

### Fixed
- Fixed CLI argument parsing edge cases
- Resolved TUI rendering issues on some terminals
- Improved default export function error handling

### Enhanced
- Better runtime detection logic
- Improved .env file loading
- Enhanced script context with more utilities

## [0.4.0] - 2024-12-15

### Added
- **Terminal UI (TUI)**: Interactive script selection and execution interface
- **Enhanced Script Context**: Rich context object with environment variables and utilities
- **Cross-Runtime Support**: Automatic detection and execution across Bun, Node.js, and Deno
- **Environment Management**: Sophisticated .env file handling and variable interpolation
- **Script Lifecycle**: Support for tearUp, execute, and tearDown functions
- **Configuration System**: Flexible runner.config.js for project-specific settings
- **Error Handling**: Comprehensive error reporting and graceful failure handling
- **Logging System**: Built-in logging with different levels and formatting

### Changed
- **Project Structure**: Reorganized codebase for better maintainability
- **CLI Interface**: Improved command structure and help documentation
- **Performance**: Optimized script loading and execution

### Fixed
- **Memory Management**: Resolved potential memory leaks in script execution
- **Path Resolution**: Fixed issues with relative and absolute path handling
- **Environment Loading**: Improved reliability of .env file processing

## [0.3.0] - 2025-01-25

### Added
- **Library API**: Use ScriptIt programmatically in your applications
- **Event System**: Listen to script execution events
- **Configuration Files**: Support for `scriptit.config.js`

### Enhanced
- **Performance**: Optimized script execution performance
- **Documentation**: Comprehensive documentation and examples
- **CLI**: Improved command-line interface

## [0.2.0] - 2025-01-24

### Added
- **Cross-Runtime Support**: Support for Bun, Node.js, and Deno
- **Environment Variables**: Automatic .env file loading
- **Script Context**: Enhanced script execution context

### Enhanced
- **CLI Interface**: Improved command-line interface
- **Error Handling**: Better error messages and debugging

## [0.1.0] - 2025-01-23

### Added
- **Initial Release**: Basic script execution functionality
- **CLI Tool**: Command-line interface for running scripts
- **Bun Support**: Optimized for Bun runtime

---

## Migration Guides

### Upgrading to v0.5.0

The v0.5.0 release introduces colored console output. To use this feature:

#### CLI Usage
```bash
# Colored console is enabled by default in CLI
scriptit exec my-script.js
```

#### Library Usage
```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = createScriptRunner({
  consoleInterception: { enabled: true }  // Enable colored console
})
```

#### Script Updates
For best results, update your scripts to use the context console:

```javascript
// Recommended approach
const console = context.console || global.console

console.log('This will be colored when interception is enabled')
console.error('This will be red')
console.warn('This will be yellow')
```

### Upgrading to v0.4.0

The v0.4.0 release introduced the TUI and default export functions. No breaking changes were made, but new features are available:

```bash
# Use the new TUI interface
scriptit run

# Execute scripts directly
scriptit exec my-script.js
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/glyphtek/scriptit/blob/main/CONTRIBUTING.md) for details.

## Support

- 🐛 [Report Issues](https://github.com/glyphtek/scriptit/issues)
- 💬 [Join Discussions](https://github.com/glyphtek/scriptit/discussions)
- 📖 [Documentation](https://scriptit.github.io/)
- ⭐ [Star on GitHub](https://github.com/glyphtek/scriptit) 