# Contributing to ScriptIt

Thank you for your interest in contributing to ScriptIt! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js 18+ or Bun 1.0+
- Git

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/scriptit.git
   cd scriptit
   ```

2. **Install Dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Build the Project**
   ```bash
   bun run build
   ```

4. **Run Tests**
   ```bash
   bun test
   ```

## Development Workflow

### Code Style
We use Biome for code formatting and linting:

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check and fix issues
bun run check
```

### Testing
- Write tests for new features in the `tests/` directory
- Run tests before submitting PRs: `bun test`
- Test both CLI and library functionality
- Include integration tests for complex features

### Project Structure
```
src/
├── common/          # Shared utilities and types
├── core/            # Core functionality (config, execution)
├── ui/              # Terminal UI implementation
├── lib.ts           # Library API
└── cli.ts           # CLI implementation
```

## Contribution Guidelines

### Pull Requests
1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Add tests for new functionality
4. Update documentation if needed
5. Ensure all tests pass
6. Submit a pull request with a clear description

### Commit Messages
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions/changes
- `refactor:` for code refactoring

### Issues
- Use issue templates when available
- Provide clear reproduction steps for bugs
- Include environment information (OS, runtime version)

## Feature Requests

We welcome feature requests! Please:
1. Check existing issues first
2. Provide clear use cases
3. Consider backward compatibility
4. Be open to discussion and iteration

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment
- Follow the project's technical standards

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for general questions
- Check the documentation and examples first

Thank you for contributing to ScriptIt! 🚀 