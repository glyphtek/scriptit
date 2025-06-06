# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-01-29

### Added
- **Colored Console Interception**: Added support for colored console output during script execution
  - 🤍 White for `console.log` messages
  - 🔴 Red for `console.error` messages  
  - 🟡 Yellow for `console.warn` messages
  - 🔵 Blue for `console.info` messages
  - ⚫ Gray for `console.debug` messages
- **Safe Console Context**: Scripts can access colored console via `context.console` for memory-safe operation
- **Configurable Console Options**: Support for enabling/disabling colors, level prefixes, and original console preservation
- **Cross-Runtime Console Support**: Colored console works across Bun, Node.js, and Deno runtimes

### Changed
- **Enhanced Script Context**: Added optional `console` property to script context for colored output
- **Improved Object Serialization**: Safe string conversion that prevents circular reference memory leaks
- **Better Error Handling**: Enhanced console interception with graceful fallbacks

### Fixed
- **Memory Leak Prevention**: Resolved circular reference issues in console object serialization
- **Console Restoration**: Proper cleanup of console interception after script execution

## [0.4.2] - 2025-01-28

### Fixed
- **Symlink Resolution**: Fixed shell script to properly resolve symlinks in global installations
- **Global Binary Path**: Improved path detection for npm/bun global installations where binary is symlinked
- **CLI File Location**: Enhanced logic to find CLI file when script is executed via symlink

## [0.4.1] - 2025-01-28

### Fixed
- **CLI Path Resolution**: Fixed shell script to correctly locate CLI file in published npm packages
- **Global Installation**: Resolved "CLI file not found" error when installing globally via npm/bun
- **Package Structure**: Improved path detection logic to handle different installation scenarios

## [0.4.0] - 2025-01-28

### Added
- **Intelligent Runtime Detection**: Replaced simple Bun binary with smart shell script that auto-detects best available runtime
- **Runtime Priority System**: Automatic detection with priority order: Bun > Deno > Node.js (with tsx for TypeScript)
- **Manual Runtime Selection**: Support for runtime selection via `SCRIPTIT_RUNTIME` environment variable or `--runtime` flag
- **Debug Mode**: Added `SCRIPTIT_DEBUG=true` for runtime detection troubleshooting
- **Runtime Help System**: New `--help-runtime` flag provides comprehensive runtime documentation
- **Enhanced TypeScript Support**: Improved TypeScript execution across all runtimes with tsx fallback

### Changed
- **Binary Migration**: Migrated from `bin/scriptit.js` (Node.js) to `bin/scriptit.sh` (intelligent shell script)
- **Runtime Flexibility**: No longer locked to single runtime - adapts to available tools
- **Error Handling**: Improved error messages for missing runtimes and execution failures

### Fixed
- **Cross-Platform Compatibility**: Better runtime detection and execution across different environments
- **TypeScript Execution**: Resolved TypeScript execution issues with proper runtime selection

## [0.3.0] - 2025-01-28

### Added
- **Default Function Support**: Scripts can now export `default` functions alongside `execute` functions
- **PWD Option**: Added `--pwd` CLI option and `workingDirectory` library option for flexible execution contexts
- **Comprehensive Examples**: Added UI and Library usage examples with detailed documentation
- **Extensive Test Suite**: Added comprehensive tests for all functionality including integration tests
- **Cross-Runtime Support**: Full compatibility with Node.js, Deno, and Bun
- **Event System**: Library API includes event emitters for script lifecycle monitoring
- **Exclude Patterns**: Support for glob patterns to exclude helper scripts and utilities

### Changed
- **Rebranded**: Changed from "script-runner" to "ScriptIt" for better developer experience
- **Restructured Codebase**: Organized into `common/`, `core/`, and `ui/` directories
- **Enhanced TUI**: Improved Terminal UI with better keyboard navigation and display
- **Library API**: Comprehensive programmatic API for script execution and management

### Fixed
- **Import Path Issues**: Resolved ES module import path problems
- **CLI Execution**: Fixed Commander.js integration and argument parsing
- **TUI Rendering**: Fixed blessed layout and keyboard handling issues
- **Path Display**: Cleaned up script path display in TUI
- **Environment Variable Interpolation**: Fixed order of operations for proper variable substitution

## [0.2.0] - Previous Version
- Initial TUI implementation
- Basic CLI functionality
- Environment variable management

## [0.1.0] - Initial Release
- Basic script execution
- Configuration file support
- Environment file loading 