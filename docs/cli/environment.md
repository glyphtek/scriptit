# Environment Variables

ScriptIt provides comprehensive environment variable management, allowing you to configure scripts for different environments, manage secrets securely, and access environment data within your scripts.

## Overview

Environment variables in ScriptIt can be set through:

1. **System environment variables** - `export VAR=value`
2. **`.env` files** - Loaded automatically
3. **Command-line flags** - `--env VAR=value`
4. **Configuration files** - `scriptit.config.js`

## Environment Variable Priority

Variables are applied in the following order (highest to lowest priority):

1. **Command-line flags** - `--env VAR=value`
2. **System environment variables** - `export VAR=value`
3. **Configuration file** - `env` property in config
4. **`.env` file** - Loaded from project root
5. **Default values** - Built-in defaults

## Using .env Files

### Basic .env File

Create a `.env` file in your project root:

```env
# .env
NODE_ENV=development
DEBUG=true
API_KEY=your-api-key-here
DATABASE_URL=postgresql://localhost:5432/mydb
PORT=3000

# Comments are supported
# Use quotes for values with spaces
APP_NAME="My ScriptIt App"
DESCRIPTION="A powerful script runner"

# Multi-line values (use quotes)
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...
-----END PRIVATE KEY-----"
```

### Environment-Specific .env Files

Create different `.env` files for different environments:

```
project/
├── .env                    # Default/development
├── .env.local             # Local overrides (gitignored)
├── .env.development       # Development environment
├── .env.staging           # Staging environment
├── .env.production        # Production environment
└── .env.test              # Test environment
```

#### .env.development
```env
NODE_ENV=development
DEBUG=true
API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/myapp_dev
LOG_LEVEL=debug
```

#### .env.production
```env
NODE_ENV=production
DEBUG=false
API_URL=https://api.myapp.com
DATABASE_URL=postgresql://prod-server:5432/myapp_prod
LOG_LEVEL=warn
```

### Loading Environment-Specific Files

```bash
# Load development environment
NODE_ENV=development scriptit exec script.js

# Load production environment
NODE_ENV=production scriptit exec script.js

# Load staging environment
NODE_ENV=staging scriptit exec script.js
```

## Accessing Environment Variables

### In Scripts

Access environment variables through the `context.env` object:

```javascript
// script.js
export async function execute(context) {
  const console = context.console || global.console;
  
  // Access environment variables
  const nodeEnv = context.env.NODE_ENV;
  const apiKey = context.env.API_KEY;
  const dbUrl = context.env.DATABASE_URL;
  
  console.log('Environment:', nodeEnv);
  console.log('API Key:', apiKey ? '***' : 'Not set');
  console.log('Database URL:', dbUrl ? '***' : 'Not set');
  
  // Validate required variables
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }
  
  return { environment: nodeEnv, hasApiKey: !!apiKey };
}
```

### Environment Validation

```javascript
// validate-env.js
export const description = "Validate required environment variables";

const REQUIRED_VARS = [
  'NODE_ENV',
  'API_KEY',
  'DATABASE_URL'
];

const OPTIONAL_VARS = [
  'DEBUG',
  'PORT',
  'LOG_LEVEL'
];

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🔍 Validating environment variables...');
  
  const missing = [];
  const present = [];
  
  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (context.env[varName]) {
      present.push(varName);
      console.log(`✅ ${varName}: Set`);
    } else {
      missing.push(varName);
      console.error(`❌ ${varName}: Missing`);
    }
  }
  
  // Check optional variables
  for (const varName of OPTIONAL_VARS) {
    if (context.env[varName]) {
      console.log(`✅ ${varName}: ${context.env[varName]}`);
    } else {
      console.warn(`⚠️ ${varName}: Not set (optional)`);
    }
  }
  
  if (missing.length > 0) {
    console.error(`❌ Missing required variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.info('✅ All required environment variables are set');
  return { required: present, missing, environment: context.env.NODE_ENV };
}
```

## Command-Line Environment Variables

### Setting Variables

```bash
# Single variable
scriptit exec --env NODE_ENV=production script.js

# Multiple variables
scriptit exec --env NODE_ENV=production --env DEBUG=false --env PORT=8080 script.js

# With spaces (use quotes)
scriptit exec --env APP_NAME="My App" --env DESCRIPTION="A great app" script.js
```

### Combining with Other Options

```bash
# With runtime selection
scriptit --runtime=bun exec --env NODE_ENV=production script.js

# With config file
scriptit exec --config prod.config.js --env API_KEY=secret script.js

# With working directory
scriptit --pwd /app exec --env NODE_ENV=production deploy.js
```

## Configuration File Environment Variables

### Basic Configuration

```javascript
// scriptit.config.js
export default {
  env: {
    NODE_ENV: 'development',
    DEBUG: 'true',
    API_URL: 'http://localhost:3000',
    LOG_LEVEL: 'debug'
  }
}
```

### Dynamic Configuration

```javascript
// scriptit.config.js
export default {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DEBUG: process.env.DEBUG || 'false',
    API_URL: process.env.API_URL || 'http://localhost:3000',
    
    // Computed values
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    
    // Default values with fallbacks
    PORT: process.env.PORT || '3000',
    HOST: process.env.HOST || 'localhost'
  }
}
```

### Environment-Specific Configuration

```javascript
// scriptit.config.js
const environments = {
  development: {
    env: {
      NODE_ENV: 'development',
      DEBUG: 'true',
      API_URL: 'http://localhost:3000',
      LOG_LEVEL: 'debug'
    }
  },
  
  staging: {
    env: {
      NODE_ENV: 'staging',
      DEBUG: 'false',
      API_URL: 'https://staging-api.myapp.com',
      LOG_LEVEL: 'info'
    }
  },
  
  production: {
    env: {
      NODE_ENV: 'production',
      DEBUG: 'false',
      API_URL: 'https://api.myapp.com',
      LOG_LEVEL: 'warn'
    }
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
export default environments[currentEnv];
```

## ScriptIt-Specific Environment Variables

### Built-in Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SCRIPTIT_RUNTIME` | Default runtime to use | `bun`, `deno`, `node` |
| `SCRIPTIT_DEBUG` | Enable debug mode | `true`, `false` |
| `SCRIPTIT_CONFIG` | Path to config file | `./custom.config.js` |
| `SCRIPTIT_SCRIPTS_DIR` | Scripts directory | `./src/scripts` |
| `SCRIPTIT_TMP_DIR` | Temporary directory | `./temp` |

### Usage Examples

```bash
# Set default runtime
export SCRIPTIT_RUNTIME=bun
scriptit exec script.js

# Enable debug mode
export SCRIPTIT_DEBUG=true
scriptit run

# Custom config file
export SCRIPTIT_CONFIG=./prod.config.js
scriptit exec deploy.js

# Custom directories
export SCRIPTIT_SCRIPTS_DIR=./src/scripts
export SCRIPTIT_TMP_DIR=./temp
scriptit run
```

## Environment Variable Patterns

### 1. Configuration Pattern

```javascript
// config-script.js
export const description = "Configuration management script";

export async function execute(context) {
  const console = context.console || global.console;
  
  const config = {
    environment: context.env.NODE_ENV || 'development',
    debug: context.env.DEBUG === 'true',
    api: {
      url: context.env.API_URL || 'http://localhost:3000',
      key: context.env.API_KEY,
      timeout: parseInt(context.env.API_TIMEOUT || '5000')
    },
    database: {
      url: context.env.DATABASE_URL,
      pool: {
        min: parseInt(context.env.DB_POOL_MIN || '2'),
        max: parseInt(context.env.DB_POOL_MAX || '10')
      }
    }
  };
  
  console.info('📋 Configuration loaded:');
  console.log('Environment:', config.environment);
  console.log('Debug mode:', config.debug);
  console.log('API URL:', config.api.url);
  console.log('API Key:', config.api.key ? '***' : 'Not set');
  
  return config;
}
```

### 2. Feature Flags Pattern

```javascript
// feature-flags.js
export const description = "Feature flags management";

export async function execute(context) {
  const console = context.console || global.console;
  
  const features = {
    newUI: context.env.FEATURE_NEW_UI === 'true',
    betaFeatures: context.env.FEATURE_BETA === 'true',
    analytics: context.env.FEATURE_ANALYTICS !== 'false', // Default true
    debugging: context.env.FEATURE_DEBUG === 'true'
  };
  
  console.info('🚩 Feature flags:');
  Object.entries(features).forEach(([name, enabled]) => {
    const status = enabled ? '✅ Enabled' : '❌ Disabled';
    console.log(`${name}: ${status}`);
  });
  
  return features;
}
```

### 3. Secrets Management Pattern

```javascript
// secrets.js
export const description = "Secure secrets management";

export async function execute(context) {
  const console = context.console || global.console;
  
  const secrets = {
    apiKey: context.env.API_KEY,
    dbPassword: context.env.DB_PASSWORD,
    jwtSecret: context.env.JWT_SECRET,
    encryptionKey: context.env.ENCRYPTION_KEY
  };
  
  // Validate all secrets are present
  const missingSecrets = Object.entries(secrets)
    .filter(([name, value]) => !value)
    .map(([name]) => name);
  
  if (missingSecrets.length > 0) {
    console.error('❌ Missing secrets:', missingSecrets.join(', '));
    throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
  }
  
  console.info('🔐 All secrets loaded successfully');
  
  // Return without exposing actual values
  return {
    secretsLoaded: Object.keys(secrets),
    allPresent: missingSecrets.length === 0
  };
}
```

## Environment Variable Security

### Best Practices

1. **Never commit secrets to version control:**

```bash
# .gitignore
.env.local
.env.*.local
.env.production
*.key
*.pem
```

2. **Use different files for different environments:**

```javascript
// ✅ Good - environment-specific files
.env.development    # Development secrets
.env.staging       # Staging secrets
.env.production    # Production secrets (never committed)

// ❌ Bad - single file with all secrets
.env               # Contains production secrets
```

3. **Validate required variables:**

```javascript
// ✅ Good - validate at startup
export async function execute(context) {
  const required = ['API_KEY', 'DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(name => !context.env[name]);
  
  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }
}

// ❌ Bad - fail silently
export async function execute(context) {
  const apiKey = context.env.API_KEY || 'default-key';
}
```

### Secret Rotation

```javascript
// secret-rotation.js
export const description = "Check for secret rotation needs";

export async function execute(context) {
  const console = context.console || global.console;
  
  const secrets = [
    { name: 'API_KEY', lastRotated: context.env.API_KEY_ROTATED },
    { name: 'JWT_SECRET', lastRotated: context.env.JWT_SECRET_ROTATED },
    { name: 'DB_PASSWORD', lastRotated: context.env.DB_PASSWORD_ROTATED }
  ];
  
  const now = new Date();
  const rotationThreshold = 90 * 24 * 60 * 60 * 1000; // 90 days
  
  secrets.forEach(secret => {
    if (!secret.lastRotated) {
      console.warn(`⚠️ ${secret.name}: No rotation date set`);
      return;
    }
    
    const lastRotated = new Date(secret.lastRotated);
    const daysSince = Math.floor((now - lastRotated) / (24 * 60 * 60 * 1000));
    
    if (daysSince > 90) {
      console.error(`❌ ${secret.name}: Needs rotation (${daysSince} days old)`);
    } else {
      console.log(`✅ ${secret.name}: OK (${daysSince} days old)`);
    }
  });
  
  return { secrets, checkDate: now.toISOString() };
}
```

## Environment Variable Templates

### Development Template

```env
# .env.development
NODE_ENV=development
DEBUG=true

# API Configuration
API_URL=http://localhost:3000
API_KEY=dev-api-key-123
API_TIMEOUT=10000

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/myapp_dev
DB_POOL_MIN=2
DB_POOL_MAX=10

# Feature Flags
FEATURE_NEW_UI=true
FEATURE_BETA=true
FEATURE_ANALYTICS=false
FEATURE_DEBUG=true

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Development Tools
HOT_RELOAD=true
SOURCE_MAPS=true
```

### Production Template

```env
# .env.production (DO NOT COMMIT)
NODE_ENV=production
DEBUG=false

# API Configuration
API_URL=https://api.myapp.com
API_KEY=prod-api-key-secure
API_TIMEOUT=5000

# Database Configuration
DATABASE_URL=postgresql://prod-server:5432/myapp_prod
DB_POOL_MIN=5
DB_POOL_MAX=50

# Feature Flags
FEATURE_NEW_UI=true
FEATURE_BETA=false
FEATURE_ANALYTICS=true
FEATURE_DEBUG=false

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json

# Security
JWT_SECRET=super-secure-jwt-secret
ENCRYPTION_KEY=32-char-encryption-key-here
```

## Troubleshooting

### Common Issues

**Variable not found:**
```bash
❌ ScriptIt Error: Required environment variable API_KEY not found
💡 Set the variable: export API_KEY=your-key
💡 Or add to .env file: API_KEY=your-key
```

**Invalid .env file:**
```bash
❌ ScriptIt Error: Invalid .env file syntax at line 5
💡 Check for missing quotes or invalid characters
```

**Variable override conflicts:**
```bash
⚠️ Warning: API_KEY overridden by command line
💡 Command-line --env flags take precedence over .env files
```

### Debug Environment Variables

Use debug mode to see environment variable loading:

```bash
scriptit --debug exec script.js
```

Output includes:
- Loaded .env files
- Environment variable sources
- Final merged environment
- Variable precedence information

### Environment Variable Inspection

```javascript
// inspect-env.js
export const description = "Inspect environment variables";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🔍 Environment Variables:');
  
  // Group by prefix
  const groups = {};
  Object.keys(context.env).forEach(key => {
    const prefix = key.split('_')[0];
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  });
  
  // Display grouped variables
  Object.entries(groups).forEach(([prefix, keys]) => {
    console.log(`\n📁 ${prefix}:`);
    keys.forEach(key => {
      const value = context.env[key];
      const displayValue = key.toLowerCase().includes('secret') || 
                          key.toLowerCase().includes('key') || 
                          key.toLowerCase().includes('password')
                          ? '***' : value;
      console.log(`  ${key}: ${displayValue}`);
    });
  });
  
  return { totalVariables: Object.keys(context.env).length, groups };
}
```

## Related Documentation

- [CLI Commands](/cli/commands) - Command-line environment options
- [Configuration](/cli/configuration) - Configuration file environment settings
- [Runtime Selection](/cli/runtime) - Runtime-specific environment variables
- [Examples](/examples/cli) - Environment variable examples 