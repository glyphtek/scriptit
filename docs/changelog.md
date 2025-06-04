# Changelog

All notable changes to ScriptIt will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.1] - 2025-01-29

### Fixed
- **Documentation Accuracy**: Corrected environment variable precedence order in all documentation
  - **Environment Documentation**: Fixed `docs/cli/environment.md` precedence order to match actual implementation
  - **Architecture Guide**: Updated precedence order in `docs/guides/architecture.md`
  - **README**: Fixed environment precedence order to reflect actual code behavior
- **TypeScript Types**: Removed unsupported `"confirm"` type from `VariableDefinition` interface
  - Only `"input"` and `"password"` types are actually implemented and documented
  - Prevents confusion about unsupported features

### Enhanced
- **Interactive Prompting Documentation**: Added comprehensive section to `docs/cli/environment.md`
  - Detailed examples of `--env-prompts` flag usage
  - Declarative variable definition documentation
  - Variable types and security features explanation
  - Smart variable detection behavior

### Technical
- **Type Safety**: Improved TypeScript interface accuracy
- **Documentation Consistency**: All documentation now accurately reflects code implementation
- **No Breaking Changes**: All existing functionality remains intact

### Corrected Environment Variable Precedence

The documentation now correctly reflects the actual implementation:

1. **Prompted Variables** - Collected interactively (Highest priority)
2. **CLI Arguments** (`--env NAME=value`) - CLI-provided environment variables  
3. **Config Default Params** - From runner.config.js
4. **Environment Files** - .env, .env.local, etc. (Lowest priority)

## [0.7.0] - 2025-01-29

### Added
- **Unified Script Execution Architecture**: Complete architectural refactoring for better maintainability
  - **Shared Execution Engine**: Created `executeScriptWithEnvironment()` function in `src/core/script-executor.ts`
  - **Interface Abstraction**: `EnvironmentPrompter` interface enables different UI approaches for variable collection
  - **Consistent Environment Handling**: Unified environment variable precedence across CLI and TUI
- **Enhanced TUI Environment Prompting**: Beautiful modal dialogs for environment variable collection
  - **Modal Interface**: Centered dialogs with visual feedback and keyboard controls
  - **Type-Aware Prompting**: Password masking and input field differentiation
  - **Visual Indicators**: Icons and color coding for different variable types
  - **Smart Integration**: Seamless integration with existing TUI layout
- **CLI Architecture Improvements**: Major refactoring for better code organization
  - **Centralized Options**: `CLI_OPTIONS` constant eliminates ~20 lines of duplicate code
  - **Shared Execution Logic**: CLI and TUI now use the same core execution engine
  - **Enhanced Prompter**: Improved readline-based prompting with password masking

### Enhanced
- **Code Maintainability**: Significant reduction in code duplication across CLI and TUI
- **Environment Variable System**: Enhanced precedence handling and cross-interface consistency
- **Documentation**: Comprehensive architecture guide and updated feature documentation
- **Type Safety**: Improved TypeScript interfaces and type consistency
- **Security**: Enhanced password handling with proper masking and no-logging policies

### Technical
- **Core Module**: New `src/core/script-executor.ts` with shared execution logic
- **TUI Prompter**: New `src/ui/tui-prompter.ts` for modal-based environment prompting
- **Interface Consistency**: Both CLI and TUI use identical environment variable handling
- **Error Handling**: Improved error propagation and user feedback
- **Testing**: All 31 tests continue to pass with enhanced functionality

### Architecture
- **Separation of Concerns**: Clear separation between interface logic and core execution
- **Extensibility**: Pluggable prompter system enables future interface additions
- **Backward Compatibility**: All existing functionality preserved while adding new capabilities
- **Performance**: Optimized execution flow with reduced redundancy

### Documentation
- **Architecture Guide**: New comprehensive guide explaining the unified system
- **TUI Documentation**: Enhanced with modal prompting examples and workflows
- **API Documentation**: Updated to reflect new interfaces and capabilities
- **VitePress Integration**: Improved documentation site with better navigation

### Migration Notes

This is a backward-compatible architectural improvement. Existing scripts continue to work unchanged.

**New Capabilities:**
- TUI now supports the same environment variable prompting as CLI
- Both interfaces provide consistent variable precedence and handling
- Enhanced modal dialogs in TUI for better user experience
- Improved code maintainability for future development

**Internal Changes:**
- Script execution moved from CLI-specific to shared core module
- Environment prompting abstracted behind common interface
- Reduced code duplication and improved maintainability

## [0.6.0] - 2025-01-29

### Added
- **Interactive Environment Prompts**: Revolutionary new feature for secure environment variable collection
  - **Declarative Method**: Scripts can export `variables` to define required inputs with custom prompts and types
  - **Imperative Method**: Use `--env-prompts` CLI flag to prompt for any variables on demand
  - **Smart Detection**: Only prompts for variables that aren't already set in the environment
  - **Password Masking**: Secure input for sensitive data with hidden characters (`*`)
  - **Variable Types**: Support for `input` (default) and `password` types
  - **Mixed Format Support**: Shorthand (string array) and full definition (object array) formats
- **Enhanced CLI Options**: Added `--env-prompts <vars...>` option to both `exec` and `run` commands
- **Execution Priority System**: Intelligent merging of environment sources with proper precedence

### Enhanced
- **Script Module Interface**: Extended with optional `variables` property for declarative environment prompts
- **Context Environment**: All prompted variables automatically available in `context.env`
- **Security**: Prompted values are process-isolated and not logged in output
- **User Experience**: Clear prompting flow with colored output and progress indicators

### Technical
- **New Utilities**: Added comprehensive prompting utilities in `src/common/utils/prompt.ts`
- **Type Safety**: Enhanced TypeScript interfaces for `VariableDefinition` and environment handling
- **Cross-Platform**: Readline-based prompting works consistently across all supported runtimes
- **Error Handling**: Graceful handling of script loading errors during variable detection

### Examples
- **Interactive Example Script**: Added `examples/ui/scripts/interactive-example.ts` demonstrating all features
- **Documentation**: Comprehensive documentation with usage examples and security guidance

### Migration Notes

This is a backward-compatible feature addition. Existing scripts continue to work unchanged.

**New Capabilities:**
```typescript
// Declarative method - in your script
export const variables = [
  { name: 'API_KEY', message: 'Enter API key:', type: 'password' },
  'DATABASE_URL'  // Shorthand
];

export async function execute(context) {
  // Prompted variables available in context.env
  console.log(context.env.API_KEY); // Securely collected
}
```

```bash
# Imperative method - via CLI
scriptit exec script.js --env-prompts API_KEY,SECRET_TOKEN
```

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
- **GitHub Actions**: Added automated documentation deployment workflow for GitHub Pages
- **CLI Help**: Enhanced command documentation with complete option lists and examples

### Technical
- **GitHub Pages Deployment**: Added automated documentation deployment with GitHub Actions
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