# CLI Configuration

ScriptIt provides flexible configuration options through configuration files, environment variables, and command-line flags. This allows you to customize behavior for different environments and use cases.

## Configuration Priority

Configuration is applied in the following order (highest to lowest priority):

1. **Command-line flags** - `--config`, `--env`, etc.
2. **Environment variables** - `SCRIPTIT_RUNTIME`, etc.
3. **Configuration file** - `scriptit.config.js`
4. **Default values** - Built-in defaults

## Configuration File

### Basic Configuration

Create a `scriptit.config.js` file in your project root:

```javascript
// scriptit.config.js
export default {
  // Runtime selection
  runtime: 'auto',              // 'auto', 'bun', 'deno', 'node'
  
  // Directory configuration
  scriptsDir: 'scripts',        // Directory containing scripts
  tmpDir: 'tmp',               // Temporary files directory
  
  // Console configuration
  consoleColors: true,         // Enable colored console output
  
  // Execution configuration
  timeout: 30000,              // Script timeout in milliseconds
  
  // Environment variables
  env: {
    NODE_ENV: 'development',
    DEBUG: 'true'
  }
}
```

### Advanced Configuration

```javascript
// scriptit.config.js
export default {
  // Runtime configuration
  runtime: 'auto',
  runtimeOptions: {
    bun: {
      // Bun-specific options
      experimental: true
    },
    deno: {
      // Deno-specific options
      permissions: ['--allow-all'],
      unstable: true
    },
    node: {
      // Node.js-specific options
      useTsx: true,
      nodeOptions: ['--max-old-space-size=4096']
    }
  },
  
  // Directory configuration
  scriptsDir: 'scripts',
  tmpDir: 'tmp',
  workingDirectory: process.cwd(),
  
  // Console configuration
  consoleColors: true,
  logLevel: 'info',            // 'debug', 'info', 'warn', 'error'
  
  // Execution configuration
  timeout: 30000,
  maxConcurrentScripts: 5,
  retryAttempts: 0,
  
  // Environment configuration
  env: {
    NODE_ENV: 'development',
    DEBUG: 'scriptit:*'
  },
  envFile: '.env',             // Path to .env file
  
  // TUI configuration
  tui: {
    enabled: true,
    theme: 'default',          // 'default', 'dark', 'light'
    refreshInterval: 1000      // Milliseconds
  },
  
  // Script filtering
  include: ['**/*.js', '**/*.ts'],
  exclude: ['node_modules/**', '*.test.js'],
  
  // Hooks
  hooks: {
    beforeScript: './hooks/before.js',
    afterScript: './hooks/after.js',
    onError: './hooks/error.js'
  }
}
```

## Environment-Specific Configuration

### Multiple Environments

```javascript
// scriptit.config.js
const baseConfig = {
  scriptsDir: 'scripts',
  tmpDir: 'tmp',
  consoleColors: true
}

const environments = {
  development: {
    ...baseConfig,
    runtime: 'bun',
    logLevel: 'debug',
    timeout: 60000,
    env: {
      NODE_ENV: 'development',
      DEBUG: 'true'
    }
  },
  
  staging: {
    ...baseConfig,
    runtime: 'node',
    logLevel: 'info',
    timeout: 45000,
    env: {
      NODE_ENV: 'staging',
      DEBUG: 'false'
    }
  },
  
  production: {
    ...baseConfig,
    runtime: 'node',
    logLevel: 'warn',
    timeout: 30000,
    consoleColors: false,
    env: {
      NODE_ENV: 'production',
      DEBUG: 'false'
    }
  }
}

const env = process.env.NODE_ENV || 'development'
export default environments[env]
```

### Using Environment-Specific Configs

```bash
# Development (default)
scriptit exec script.js

# Staging
NODE_ENV=staging scriptit exec script.js

# Production
NODE_ENV=production scriptit exec script.js
```

## Configuration Options Reference

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `runtime` | `string` | `'auto'` | Runtime to use: `'auto'`, `'bun'`, `'deno'`, `'node'` |
| `scriptsDir` | `string` | `'scripts'` | Directory containing script files |
| `tmpDir` | `string` | `'tmp'` | Directory for temporary files |
| `workingDirectory` | `string` | `process.cwd()` | Working directory for script execution |
| `timeout` | `number` | `30000` | Script timeout in milliseconds |
| `consoleColors` | `boolean` | `true` | Enable colored console output |

### Runtime Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `runtimeOptions.bun` | `object` | `{}` | Bun-specific configuration |
| `runtimeOptions.deno` | `object` | `{}` | Deno-specific configuration |
| `runtimeOptions.node` | `object` | `{}` | Node.js-specific configuration |

### Environment Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `env` | `object` | `{}` | Environment variables to set |
| `envFile` | `string` | `'.env'` | Path to .env file |

### TUI Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tui.enabled` | `boolean` | `true` | Enable Terminal UI |
| `tui.theme` | `string` | `'default'` | TUI theme |
| `tui.refreshInterval` | `number` | `1000` | Refresh interval in milliseconds |

### Filtering Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | `string[]` | `['**/*.js', '**/*.ts']` | Glob patterns for included files |
| `exclude` | `string[]` | `['node_modules/**']` | Glob patterns for excluded files |

## Environment Variables

### ScriptIt Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SCRIPTIT_RUNTIME` | Default runtime | `bun`, `deno`, `node` |
| `SCRIPTIT_DEBUG` | Enable debug mode | `true`, `false` |
| `SCRIPTIT_CONFIG` | Path to config file | `./custom.config.js` |
| `SCRIPTIT_SCRIPTS_DIR` | Scripts directory | `./src/scripts` |
| `SCRIPTIT_TMP_DIR` | Temporary directory | `./temp` |

### Usage Examples

```bash
# Set runtime via environment
SCRIPTIT_RUNTIME=bun scriptit exec script.js

# Enable debug mode
SCRIPTIT_DEBUG=true scriptit run

# Custom config file
SCRIPTIT_CONFIG=./prod.config.js scriptit exec deploy.js

# Custom directories
SCRIPTIT_SCRIPTS_DIR=./src/scripts scriptit run
```

## Command-Line Overrides

### Global Options

```bash
# Override working directory
scriptit --pwd /path/to/project exec script.js

# Enable debug mode
scriptit --debug exec script.js

# Show version
scriptit --version
```

### Command-Specific Options

```bash
# Custom config file
scriptit exec --config ./custom.config.js script.js

# Set environment variables
scriptit exec --env NODE_ENV=production --env DEBUG=false script.js

# Override scripts directory
scriptit run --scripts-dir ./src/scripts

# Disable TUI
scriptit run --no-tui
```

## Configuration Examples

### Development Setup

```javascript
// dev.config.js
export default {
  runtime: 'bun',              // Fast development
  scriptsDir: 'src/scripts',
  tmpDir: 'tmp',
  consoleColors: true,
  logLevel: 'debug',
  timeout: 60000,              // Longer timeout for debugging
  
  env: {
    NODE_ENV: 'development',
    DEBUG: 'scriptit:*',
    API_URL: 'http://localhost:3000'
  },
  
  tui: {
    enabled: true,
    theme: 'dark',
    refreshInterval: 500       // Faster refresh
  }
}
```

### Production Setup

```javascript
// prod.config.js
export default {
  runtime: 'node',             // Stable runtime
  scriptsDir: 'dist/scripts',
  tmpDir: '/tmp/scriptit',
  consoleColors: false,        // No colors in logs
  logLevel: 'warn',
  timeout: 30000,
  
  env: {
    NODE_ENV: 'production',
    DEBUG: 'false'
  },
  
  tui: {
    enabled: false             // No TUI in production
  },
  
  // Production-specific options
  maxConcurrentScripts: 10,
  retryAttempts: 3
}
```

### CI/CD Setup

```javascript
// ci.config.js
export default {
  runtime: 'node',
  scriptsDir: 'scripts',
  tmpDir: './tmp',
  consoleColors: false,        // No colors in CI logs
  logLevel: 'info',
  timeout: 120000,             // Longer timeout for CI
  
  env: {
    NODE_ENV: 'test',
    CI: 'true'
  },
  
  tui: {
    enabled: false             // Never use TUI in CI
  },
  
  // CI-specific filtering
  include: ['scripts/**/*.js'],
  exclude: ['scripts/**/*.test.js', 'scripts/dev/**']
}
```

## Configuration Validation

ScriptIt validates configuration and provides helpful error messages:

```bash
# Invalid runtime
❌ ScriptIt Error: Invalid runtime 'invalid'
💡 Valid options: auto, bun, deno, node

# Invalid timeout
❌ ScriptIt Error: Timeout must be a positive number
💡 Current value: -1000

# Missing scripts directory
❌ ScriptIt Error: Scripts directory not found: ./missing
💡 Create the directory or update scriptsDir in config
```

## Loading Configuration

### Automatic Loading

ScriptIt automatically looks for configuration files in this order:

1. `scriptit.config.js`
2. `scriptit.config.mjs`
3. `scriptit.config.ts`
4. `.scriptitrc.js`
5. `.scriptitrc.json`

### Manual Loading

```bash
# Specify config file
scriptit --config ./custom.config.js exec script.js
scriptit exec --config ./prod.config.js script.js
```

### Programmatic Loading

```javascript
// In your script
export async function execute(context) {
  // Access configuration
  console.log('Runtime:', context.config.runtime);
  console.log('Scripts dir:', context.config.scriptsDir);
  console.log('Environment:', context.config.env);
}
```

## Best Practices

### 1. Environment-Specific Configs

Use different configs for different environments:

```
configs/
├── development.config.js
├── staging.config.js
├── production.config.js
└── ci.config.js
```

### 2. Secure Environment Variables

Never commit sensitive data to config files:

```javascript
// ✅ Good - use environment variables
export default {
  env: {
    API_KEY: process.env.API_KEY,
    DATABASE_URL: process.env.DATABASE_URL
  }
}

// ❌ Bad - hardcoded secrets
export default {
  env: {
    API_KEY: 'secret-key-123',
    DATABASE_URL: 'postgresql://user:pass@host/db'
  }
}
```

### 3. Validate Required Variables

```javascript
// config.js
const requiredEnvVars = ['API_KEY', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter(name => !process.env[name]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default {
  env: {
    API_KEY: process.env.API_KEY,
    DATABASE_URL: process.env.DATABASE_URL
  }
}
```

### 4. Use TypeScript for Config

```typescript
// scriptit.config.ts
import type { ScriptItConfig } from '@glyphtek/scriptit';

const config: ScriptItConfig = {
  runtime: 'bun',
  scriptsDir: 'scripts',
  consoleColors: true,
  env: {
    NODE_ENV: 'development'
  }
};

export default config;
```

## Troubleshooting

### Common Issues

**Config file not found:**
```bash
❌ ScriptIt Error: Configuration file not found: ./missing.config.js
💡 Check the file path or use --config flag
```

**Invalid configuration:**
```bash
❌ ScriptIt Error: Invalid configuration
💡 Check syntax and required properties
```

**Environment variable conflicts:**
```bash
⚠️ Warning: Environment variable NODE_ENV overridden by config
💡 Command-line flags take precedence over config file
```

### Debug Configuration

Use debug mode to see configuration loading:

```bash
scriptit --debug exec script.js
```

Output includes:
- Configuration file path
- Loaded configuration values
- Environment variable overrides
- Final merged configuration

## Related Documentation

- [CLI Commands](/cli/commands) - Available CLI commands
- [Environment Variables](/cli/environment) - Environment management
- [Runtime Selection](/cli/runtime) - Runtime-specific configuration
- [Examples](/examples/cli) - Configuration examples 