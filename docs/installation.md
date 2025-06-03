# Installation

ScriptIt can be installed globally for CLI usage or locally as a library dependency. Choose the installation method that best fits your needs.

## Global Installation (CLI Usage)

Install ScriptIt globally to use the `scriptit` command from anywhere in your system:

::: code-group

```bash [Bun (Recommended)]
bun add -g @glyphtek/scriptit
```

```bash [npm]
npm install -g @glyphtek/scriptit
```

```bash [pnpm]
pnpm add -g @glyphtek/scriptit
```

```bash [yarn]
yarn global add @glyphtek/scriptit
```

:::

After global installation, verify it works:

```bash
scriptit --version
```

## Local Installation (Library Usage)

Install ScriptIt as a dependency in your project:

::: code-group

```bash [Bun]
bun add @glyphtek/scriptit
```

```bash [npm]
npm install @glyphtek/scriptit
```

```bash [pnpm]
pnpm add @glyphtek/scriptit
```

```bash [yarn]
yarn add @glyphtek/scriptit
```

:::

## Development Installation

For development or contributing to ScriptIt:

```bash
# Clone the repository
git clone https://github.com/glyphtek/scriptit.git
cd scriptit

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test

# Start development server
bun run dev
```

## Runtime Requirements

ScriptIt supports multiple JavaScript runtimes:

### Bun (Recommended)
- **Version**: 1.0.0 or higher
- **Installation**: [Download from bun.sh](https://bun.sh/)
- **Benefits**: Fastest performance, native TypeScript support

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Node.js
- **Version**: 18.0.0 or higher
- **Installation**: [Download from nodejs.org](https://nodejs.org/)
- **Benefits**: Mature ecosystem, wide compatibility

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18
```

### Deno
- **Version**: 1.30.0 or higher
- **Installation**: [Download from deno.land](https://deno.land/)
- **Benefits**: Secure by default, built-in TypeScript

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh
```

## Verification

After installation, verify ScriptIt is working correctly:

### CLI Verification

```bash
# Check version
scriptit --version

# Run help
scriptit --help

# Test with a simple script
echo 'export async function execute(context) { context.console.log("Hello, ScriptIt!"); }' > test.js
scriptit exec test.js
rm test.js
```

### Library Verification

Create a test file `test-scriptit.js`:

```javascript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = createScriptRunner({
  consoleInterception: true
})

await runner.executeCode(`
  export async function execute(context) {
    context.console.log('ScriptIt is working!')
    context.console.info('Runtime:', process.version)
    return { success: true }
  }
`)
```

Run the test:

```bash
# With Bun
bun test-scriptit.js

# With Node.js
node test-scriptit.js

# With Deno
deno run test-scriptit.js
```

## Platform-Specific Instructions

### macOS

Using Homebrew (if available):
```bash
# Install Bun via Homebrew
brew install bun

# Install ScriptIt
bun add -g @glyphtek/scriptit
```

### Linux

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.bun/bin:$PATH"

# Install ScriptIt
bun add -g @glyphtek/scriptit
```

### Windows

Using PowerShell:
```powershell
# Install Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# Install ScriptIt
bun add -g @glyphtek/scriptit
```

Or using npm:
```cmd
npm install -g @glyphtek/scriptit
```

## Docker Installation

Use ScriptIt in a Docker container:

```dockerfile
FROM oven/bun:latest

# Install ScriptIt globally
RUN bun add -g @glyphtek/scriptit

# Set working directory
WORKDIR /app

# Copy your scripts
COPY . .

# Run your script
CMD ["scriptit", "run", "your-script.js", "--console-colors"]
```

Build and run:
```bash
docker build -t my-scriptit-app .
docker run my-scriptit-app
```

## CI/CD Installation

### GitHub Actions

```yaml
name: Run Scripts with ScriptIt
on: [push]

jobs:
  run-scripts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
          
      - name: Install ScriptIt
        run: bun add -g @glyphtek/scriptit
        
      - name: Run scripts
        run: scriptit run build.js --console-colors
```

### GitLab CI

```yaml
stages:
  - build

run-scripts:
  stage: build
  image: oven/bun:latest
  script:
    - bun add -g @glyphtek/scriptit
    - scriptit run deploy.js --runtime bun
```

## Troubleshooting

### Permission Issues

If you encounter permission errors during global installation:

```bash
# For npm (create .npmrc in home directory)
echo "prefix=~/.npm-global" >> ~/.npmrc
export PATH=~/.npm-global/bin:$PATH

# For Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

### Command Not Found

If `scriptit` command is not found after installation:

1. **Check PATH**: Ensure the installation directory is in your PATH
2. **Restart terminal**: Close and reopen your terminal
3. **Verify installation**: Check if the package was installed correctly

```bash
# Check where scriptit is installed
which scriptit

# Check if it's in your PATH
echo $PATH
```

### Runtime Issues

If you encounter runtime-specific issues:

1. **Update runtime**: Ensure you're using a supported version
2. **Clear cache**: Clear package manager cache
3. **Reinstall**: Remove and reinstall ScriptIt

```bash
# Clear Bun cache
bun pm cache rm

# Clear npm cache
npm cache clean --force

# Reinstall ScriptIt
bun remove -g @glyphtek/scriptit
bun add -g @glyphtek/scriptit
```

## Next Steps

After successful installation:

1. 📖 Read the [Getting Started](/getting-started) guide
2. 🎨 Try the [Colored Console](/features/console-colors) feature
3. 🖥️ Explore the [CLI Commands](/cli/commands)
4. 📚 Check out [Examples](/examples/)

## Support

If you encounter installation issues:

- 🐛 [Report Issues](https://github.com/glyphtek/scriptit/issues)
- 💬 [Join Discussions](https://github.com/glyphtek/scriptit/discussions)
- 📖 [Check Documentation](https://scriptit.github.io/)
- ⭐ [Star on GitHub](https://github.com/glyphtek/scriptit) 