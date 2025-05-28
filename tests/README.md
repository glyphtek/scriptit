# ScriptIt Tests

This directory contains comprehensive tests for the ScriptIt library and examples.

## Test Structure

### Core Library Tests

#### `basic.test.ts`
Tests the fundamental library functionality:
- Script runner initialization
- Script listing with exclude patterns
- Basic script execution
- Configuration validation

#### `lib-example.test.ts`
Comprehensive tests for the library API:
- **Initialization**: Verifies script runner can be created with various configurations
- **Script Discovery**: Tests script listing with exclude patterns
- **Script Execution**: Tests both simple and lifecycle scripts
- **Event Handling**: Validates event emission and listening
- **Error Handling**: Tests error scenarios and edge cases
- **Custom Logging**: Tests custom logger functionality
- **Environment Variables**: Tests variable interpolation
- **Configuration**: Validates all configuration options

#### `lib-integration.test.ts`
Integration tests for the library example:
- **File Structure**: Verifies all required files and directories exist
- **Package Configuration**: Validates package.json setup
- **Documentation**: Checks README completeness
- **Environment Setup**: Validates environment file structure
- **Import Validation**: Ensures the example can be imported without errors

#### `run-lib-example.test.ts`
End-to-end execution tests:
- **Full Execution**: Runs the complete library example
- **Script Creation**: Verifies auto-generated scripts work
- **Event Handling**: Tests event system in real execution
- **Configuration**: Validates configuration handling in practice

## Running Tests

### Run All Tests
```bash
bun test
```

### Run Library-Specific Tests
```bash
bun run test:lib
```

### Run Individual Test Files
```bash
# Core functionality tests
bun test tests/basic.test.ts

# Library API tests
bun test tests/lib-example.test.ts

# Integration tests
bun test tests/lib-integration.test.ts

# End-to-end tests
bun test tests/run-lib-example.test.ts
```

## Test Coverage

The test suite covers:

### ✅ **Core Functionality**
- Script runner initialization
- Configuration loading and validation
- Script discovery and filtering
- Environment variable handling
- Parameter interpolation

### ✅ **Library API**
- `createScriptRunner()` with all options
- `listScripts()` functionality
- `executeScript()` with parameters and custom loggers
- Event system (`on`, `off`, `emit`)
- Error handling and edge cases

### ✅ **Script Execution**
- Simple scripts with basic functionality
- Complex scripts with tearUp/execute/tearDown lifecycle
- Custom parameter passing
- Environment variable access
- Temporary file handling

### ✅ **Configuration**
- Exclude patterns (glob matching)
- Multiple environment files
- Default parameter interpolation
- Custom scripts and temp directories
- Initial environment overrides

### ✅ **Integration**
- Example project structure validation
- Package.json configuration
- Documentation completeness
- Real-world execution scenarios

### ✅ **Error Scenarios**
- Non-existent script execution
- Invalid configuration
- Missing dependencies
- File system errors

## Test Data

Tests use isolated test data:
- Temporary scripts created in `examples/lib/scripts/`
- Test environment files
- Isolated temporary directories
- Auto-cleanup after test completion

## Continuous Integration

These tests are designed to run in CI environments:
- No external dependencies required
- Self-contained test data
- Proper cleanup procedures
- Timeout handling for long-running tests

## Adding New Tests

When adding new functionality:

1. **Unit Tests**: Add to `lib-example.test.ts` for API changes
2. **Integration Tests**: Add to `lib-integration.test.ts` for structural changes
3. **End-to-End Tests**: Add to `run-lib-example.test.ts` for workflow changes
4. **Basic Tests**: Add to `basic.test.ts` for core functionality changes

### Test Naming Convention
- Use descriptive test names: `"library example - feature description"`
- Group related tests with consistent prefixes
- Include both positive and negative test cases
- Test edge cases and error conditions

### Test Structure
```typescript
test("descriptive test name", async () => {
  // Arrange: Set up test data and conditions
  const runner = await createScriptRunner({...});
  
  // Act: Execute the functionality being tested
  const result = await runner.someMethod();
  
  // Assert: Verify the expected outcomes
  expect(result).toBeDefined();
  expect(result.someProperty).toBe(expectedValue);
});
```

This comprehensive test suite ensures the ScriptIt library works correctly across all supported use cases and environments. 