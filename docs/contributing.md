# Contributing to ScriptIt

Thank you for your interest in contributing to ScriptIt! This guide will help you get started with contributing to the project, whether you're fixing bugs, adding features, improving documentation, or helping with community support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Getting Started

### Ways to Contribute

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Fix bugs or implement features
- **Documentation**: Improve guides, examples, and API docs
- **Testing**: Help test new features and report issues
- **Community Support**: Help other users in discussions and issues

### Before You Start

1. Check existing [issues](https://github.com/glyphtek/scriptit/issues) and [pull requests](https://github.com/glyphtek/scriptit/pulls)
2. For major changes, open an issue first to discuss the approach
3. Make sure you understand the project's goals and architecture
4. Read through this contributing guide completely

## Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 1.22+
- **Git** 2.30+
- **Bun** (optional, for testing Bun runtime support)
- **Deno** (optional, for testing Deno runtime support)

### Installation

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/scriptit.git
   cd scriptit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up development environment:**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Install optional runtimes for testing
   npm install -g bun
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

4. **Run initial build:**
   ```bash
   npm run build
   ```

5. **Verify installation:**
   ```bash
   npm test
   npm run lint
   ```

### Development Scripts

```bash
# Development
npm run dev          # Start development mode with watch
npm run build        # Build the project
npm run build:watch  # Build with watch mode

# Testing
npm test             # Run all tests
npm run test:unit    # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:coverage     # Run tests with coverage
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run typecheck    # Run TypeScript type checking

# Documentation
npm run docs:dev     # Start documentation dev server
npm run docs:build   # Build documentation
npm run docs:preview # Preview built documentation

# Release
npm run changeset    # Create a changeset
npm run version      # Version packages
npm run release      # Publish release
```

## Project Structure

```
scriptit/
├── src/                    # Source code
│   ├── cli/               # CLI implementation
│   ├── lib/               # Core library
│   ├── tui/               # Terminal UI
│   ├── runtime/           # Runtime detection and execution
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── fixtures/          # Test fixtures
│   └── helpers/           # Test utilities
├── docs/                  # Documentation (VitePress)
├── examples/              # Example scripts
├── scripts/               # Build and development scripts
├── .github/               # GitHub workflows and templates
└── packages/              # Monorepo packages (if applicable)
```

### Key Components

- **CLI (`src/cli/`)**: Command-line interface implementation
- **Library (`src/lib/`)**: Core ScriptIt library for programmatic use
- **TUI (`src/tui/`)**: Terminal user interface
- **Runtime (`src/runtime/`)**: Runtime detection and script execution
- **Types (`src/types/`)**: TypeScript type definitions

## Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Create a bugfix branch
git checkout -b fix/issue-description

# Create a documentation branch
git checkout -b docs/improvement-description
```

### 2. Make Changes

- Write code following our [code standards](#code-standards)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add support for custom script extensions"

# Bug fix
git commit -m "fix: resolve runtime detection issue on Windows"

# Documentation
git commit -m "docs: add examples for TypeScript integration"

# Breaking change
git commit -m "feat!: change configuration file format"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub.

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use strict TypeScript configuration

```typescript
// ✅ Good
interface ScriptOptions {
  timeout?: number;
  retries?: number;
}

async function executeScript(path: string, options: ScriptOptions): Promise<ScriptResult> {
  // Implementation
}

// ❌ Avoid
function executeScript(path: any, options: any): any {
  // Implementation
}
```

### Code Style

We use Prettier and ESLint for code formatting and linting:

```javascript
// ✅ Good - Clear, descriptive names
async function executeScriptWithRetry(scriptPath, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeScript(scriptPath, options);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
}

// ❌ Avoid - Unclear names and logic
async function exec(p, o, r = 3) {
  for (let i = 1; i <= r; i++) {
    try {
      return await executeScript(p, o);
    } catch (e) {
      if (i === r) throw e;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

### Error Handling

- Use descriptive error messages
- Provide context and suggestions when possible
- Handle errors gracefully

```javascript
// ✅ Good
if (!fs.existsSync(scriptPath)) {
  throw new Error(
    `Script not found: ${scriptPath}\n` +
    `Make sure the file exists and the path is correct.\n` +
    `Available scripts: ${availableScripts.join(', ')}`
  );
}

// ❌ Avoid
if (!fs.existsSync(scriptPath)) {
  throw new Error('File not found');
}
```

### Documentation

- Add JSDoc comments for public APIs
- Include examples in documentation
- Keep README and guides up to date

```javascript
/**
 * Execute a script with the specified options
 * 
 * @param scriptPath - Path to the script file
 * @param options - Execution options
 * @param options.params - Parameters to pass to the script
 * @param options.env - Environment variables
 * @param options.timeout - Execution timeout in milliseconds
 * @returns Promise that resolves to the script result
 * 
 * @example
 * ```javascript
 * const result = await executeScript('my-script.js', {
 *   params: { userId: 123 },
 *   env: { NODE_ENV: 'production' },
 *   timeout: 30000
 * });
 * ```
 */
async function executeScript(scriptPath, options = {}) {
  // Implementation
}
```

## Testing

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete workflows

### Writing Tests

```javascript
// Unit test example
import { describe, test, expect } from 'vitest';
import { parseScriptPath } from '../src/utils/script-parser';

describe('parseScriptPath', () => {
  test('should parse JavaScript file path', () => {
    const result = parseScriptPath('scripts/hello.js');
    
    expect(result).toEqual({
      path: 'scripts/hello.js',
      extension: '.js',
      name: 'hello',
      isTypeScript: false
    });
  });
  
  test('should handle TypeScript files', () => {
    const result = parseScriptPath('scripts/process.ts');
    
    expect(result.isTypeScript).toBe(true);
    expect(result.extension).toBe('.ts');
  });
  
  test('should throw error for invalid path', () => {
    expect(() => parseScriptPath('')).toThrow('Script path cannot be empty');
  });
});
```

```javascript
// Integration test example
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { createScriptRunner } from '../src/lib/script-runner';
import { createTempDir, cleanupTempDir } from './helpers/temp-utils';

describe('ScriptRunner Integration', () => {
  let tempDir;
  let runner;
  
  beforeEach(async () => {
    tempDir = await createTempDir();
    runner = await createScriptRunner({
      scriptsDir: `${tempDir}/scripts`,
      tmpDir: `${tempDir}/tmp`
    });
  });
  
  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });
  
  test('should execute simple script', async () => {
    await writeTestScript(`${tempDir}/scripts/test.js`, `
      export async function execute() {
        return { success: true, message: 'Hello World' };
      }
    `);
    
    const result = await runner.executeScript('test.js');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Hello World');
  });
});
```

### Test Coverage

- Aim for 80%+ test coverage
- Focus on critical paths and edge cases
- Test error conditions and edge cases

```bash
# Check coverage
npm run test:coverage

# Coverage should be reported for:
# - Statements: 80%+
# - Branches: 75%+
# - Functions: 80%+
# - Lines: 80%+
```

## Documentation

### Documentation Types

1. **API Documentation**: JSDoc comments in code
2. **User Guides**: Step-by-step tutorials
3. **Examples**: Practical code examples
4. **Reference**: Complete API reference

### Writing Documentation

- Use clear, concise language
- Include practical examples
- Test all code examples
- Keep documentation up to date with code changes

### Documentation Structure

```markdown
# Page Title

Brief description of what this page covers.

## Section Title

Explanation of the concept or feature.

### Code Example

```javascript
// Example with comments
const runner = await createScriptRunner({
  scriptsDir: './scripts'
});

const result = await runner.executeScript('example.js');
console.log(result);
```

### Best Practices

- Always do X when Y
- Avoid Z because it can cause issues
- Consider using A instead of B for better performance
```

## Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date:**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

3. **Create a pull request with:**
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Breaking change notes if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Manual testing of new features
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Release Workflow

1. **Create Changeset:**
   ```bash
   npm run changeset
   ```

2. **Version Bump:**
   ```bash
   npm run version
   ```

3. **Release:**
   ```bash
   npm run release
   ```

### Release Notes

Each release includes:
- Summary of changes
- Breaking changes (if any)
- Migration guide (for breaking changes)
- Contributors acknowledgment

## Community

### Getting Help

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time community chat (link in README)

### Reporting Issues

When reporting bugs, include:

1. **Environment Information:**
   ```
   - OS: macOS 13.0
   - Node.js: 18.17.0
   - ScriptIt: 1.2.3
   - Runtime: Bun 1.0.0
   ```

2. **Steps to Reproduce:**
   ```
   1. Create script with X
   2. Run command Y
   3. See error Z
   ```

3. **Expected vs Actual Behavior**
4. **Minimal Reproduction Example**
5. **Error Messages and Stack Traces**

### Feature Requests

For feature requests, provide:

1. **Use Case**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: What alternatives have you considered?
4. **Examples**: How would the API look?

### Security Issues

For security vulnerabilities:

1. **Do NOT** open a public issue
2. Email security@glyphtek.com
3. Include detailed description and reproduction steps
4. We'll respond within 48 hours

## Development Tips

### Debugging

```javascript
// Use debug logging
import debug from 'debug';
const log = debug('scriptit:runner');

log('Executing script: %s', scriptPath);
```

### Testing Locally

```bash
# Link local package for testing
npm link
cd /path/to/test/project
npm link @glyphtek/scriptit

# Test CLI commands
scriptit --version
scriptit list
```

### IDE Setup

**VS Code Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Recognition

Contributors are recognized in:
- Release notes
- Contributors section in README
- Annual contributor highlights

### Contributor Levels

- **Contributor**: Made at least one merged PR
- **Regular Contributor**: 5+ merged PRs
- **Core Contributor**: 20+ PRs and ongoing involvement
- **Maintainer**: Commit access and release responsibilities

## Questions?

If you have questions about contributing:

1. Check existing [GitHub Discussions](https://github.com/glyphtek/scriptit/discussions)
2. Open a new discussion
3. Join our [Discord community](https://discord.gg/scriptit)
4. Email us at contribute@glyphtek.com

Thank you for contributing to ScriptIt! 🚀 