# Contributing to ScriptIt

Thank you for your interest in contributing to ScriptIt! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `develop`
4. **Make your changes** with tests
5. **Submit a pull request** to `develop`

## 📋 Development Setup

### Prerequisites

- **Bun** (recommended) or **Node.js 18+**
- **Git**

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/scriptit.git
cd scriptit

# Install dependencies
bun install  # or npm install

# Run tests to verify setup
bun test

# Build the project
bun run build

# Test the CLI
./bin/scriptit.sh --help
```

## 🌳 Branching Strategy

We use **Git Flow** with the following branches:

- **`main`** - Production-ready code, protected
- **`develop`** - Integration branch for features
- **`feature/*`** - New features and enhancements
- **`bugfix/*`** - Bug fixes
- **`hotfix/*`** - Critical fixes for production
- **`release/*`** - Release preparation

### Branch Naming

- `feature/add-new-runtime-support`
- `bugfix/fix-environment-loading`
- `hotfix/critical-security-fix`
- `docs/update-api-documentation`

## 🔄 Pull Request Process

### Before Submitting

1. **Create an issue** first (unless it's a trivial fix)
2. **Fork and branch** from `develop`
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run the full test suite**

### PR Requirements

- [ ] **Tests pass**: `bun test`
- [ ] **Linting passes**: `bun run check`
- [ ] **Build succeeds**: `bun run build`
- [ ] **Documentation updated** (if applicable)
- [ ] **Changelog updated** (for significant changes)

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
- [ ] Tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/basic.test.ts

# Run tests with coverage
bun test --coverage
```

### Test Structure

- **Unit tests**: Test individual functions/modules
- **Integration tests**: Test component interactions
- **CLI tests**: Test command-line interface
- **Library tests**: Test programmatic API

### Writing Tests

```typescript
// tests/my-feature.test.ts
import { describe, it, expect } from 'bun:test';
import { myFunction } from '../src/my-module';

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

## 📝 Code Style

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Prefer interfaces** over types for object shapes
- **Use strict mode** settings
- **Document public APIs** with JSDoc

### Formatting

We use **Biome** for formatting and linting:

```bash
# Check formatting
bun run check

# Auto-fix issues
bun run format

# Lint only
bun run lint
```

### Code Conventions

- **File naming**: `kebab-case.ts`
- **Function naming**: `camelCase`
- **Class naming**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)

## 📚 Documentation

### Types of Documentation

1. **Code comments** - For complex logic
2. **JSDoc** - For public APIs
3. **README** - For setup and basic usage
4. **Guides** - For detailed features
5. **Examples** - For common use cases

### Documentation Updates

When adding features:

- Update relevant documentation files
- Add examples to `examples/` directory
- Update changelog for significant changes
- Consider adding to the architecture guide

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** first
2. **Try the latest version**
3. **Check documentation**

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What should happen

**Environment:**
- OS: [e.g. macOS 14.0]
- Runtime: [e.g. Bun 1.0.0]
- ScriptIt version: [e.g. 0.7.1]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** and discussions
2. **Consider if it fits** the project scope
3. **Think about implementation** complexity

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Any other relevant information
```

## 🏗️ Architecture Guidelines

### Core Principles

1. **Cross-runtime compatibility** - Support Bun, Node.js, Deno
2. **Modular design** - Separate concerns clearly
3. **Type safety** - Leverage TypeScript fully
4. **Performance** - Optimize for speed and memory
5. **Developer experience** - Prioritize ease of use

### Module Structure

```
src/
├── cli.ts              # CLI entry point
├── lib.ts              # Library entry point
├── common/             # Shared utilities
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utility functions
│   └── logger/         # Logging system
├── core/               # Core execution engine
├── ui/                 # User interface components
└── __tests__/          # Test files
```

### Adding New Features

1. **Design first** - Consider the API
2. **Start with types** - Define interfaces
3. **Write tests** - Test-driven development
4. **Implement incrementally** - Small commits
5. **Document thoroughly** - Update all docs

## 🔒 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email: [security@glyphtek.com](mailto:security@glyphtek.com)
2. Include detailed description
3. Provide reproduction steps
4. Suggest fixes if possible

### Security Guidelines

- **Validate all inputs** from users
- **Sanitize file paths** to prevent traversal
- **Mask sensitive data** in logs
- **Use secure defaults** for configurations

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

### Enforcement

Report unacceptable behavior to [conduct@glyphtek.com](mailto:conduct@glyphtek.com).

## 🎯 Getting Help

- **Documentation**: [https://scriptit.github.io/](https://scriptit.github.io/)
- **Discussions**: [GitHub Discussions](https://github.com/glyphtek/scriptit/discussions)
- **Issues**: [GitHub Issues](https://github.com/glyphtek/scriptit/issues)
- **Discord**: [Community Discord](https://discord.gg/scriptit) (coming soon)

## 🏆 Recognition

Contributors are recognized in:
- **README.md** - All contributors section
- **Release notes** - Major contributions
- **Documentation** - Author credits

Thank you for contributing to ScriptIt! 🚀 