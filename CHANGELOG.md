# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-01-XX

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

## [0.2.0] - Previous Version
- Initial TUI implementation
- Basic CLI functionality
- Environment variable management

## [0.1.0] - Initial Release
- Basic script execution
- Configuration file support
- Environment file loading 