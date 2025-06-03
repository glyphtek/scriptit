# Runtime Selection

ScriptIt supports multiple JavaScript runtimes with intelligent auto-detection and manual selection. Each runtime has its own strengths and use cases, allowing you to choose the best option for your specific needs.

## Supported Runtimes

### Overview

| Runtime | TypeScript | Performance | Ecosystem | Security | Best For |
|---------|------------|-------------|-----------|----------|----------|
| **Bun** | ✅ Native | 🚀 Fastest | 🟡 Growing | 🟢 Good | Development, TypeScript |
| **Deno** | ✅ Native | 🟢 Fast | 🟡 Moderate | 🚀 Excellent | Security-focused, TypeScript |
| **Node.js** | 🟡 Via tsx | 🟢 Fast | 🚀 Largest | 🟢 Good | Production, Compatibility |

### Runtime Detection Priority

ScriptIt automatically detects and selects runtimes in this order:

1. **Manual selection** (highest priority)
2. **Bun** - If available
3. **Deno** - If available  
4. **Node.js** - Fallback option

## Bun Runtime

### Overview

Bun is a fast all-in-one JavaScript runtime with native TypeScript support, built-in bundler, and excellent performance.

### Features

- ✅ **Native TypeScript** - No transpilation needed
- ✅ **Fastest startup** - Optimized for development
- ✅ **Built-in bundler** - No additional tools needed
- ✅ **Node.js compatibility** - Most npm packages work
- ✅ **Modern APIs** - Latest JavaScript features

### Installation

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# npm (alternative)
npm install -g bun
```

### Usage

```bash
# Auto-detection (Bun will be selected if available)
scriptit exec script.ts

# Force Bun runtime
scriptit --runtime=bun exec script.ts
SCRIPTIT_RUNTIME=bun scriptit exec script.ts
```

### Configuration

```javascript
// scriptit.config.js
export default {
  runtime: 'bun',
  runtimeOptions: {
    bun: {
      // Bun-specific options
      experimental: true,
      bunfig: './bunfig.toml'
    }
  }
}
```

### Example Script

```typescript
// bun-example.ts
export const description = "Bun runtime example with TypeScript";

interface User {
  id: number;
  name: string;
  email: string;
}

export async function execute(context: any) {
  const console = context.console || global.console;
  
  console.info('🚀 Running with Bun runtime');
  console.log('TypeScript support: Native');
  console.log('Performance: Excellent');
  
  // Use modern JavaScript features
  const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
  
  // Bun has excellent performance for data processing
  const processedUsers = users.map(user => ({
    ...user,
    displayName: `${user.name} <${user.email}>`
  }));
  
  console.log('Processed users:', processedUsers);
  
  return { 
    runtime: 'bun',
    users: processedUsers,
    performance: 'excellent'
  };
}
```

## Deno Runtime

### Overview

Deno is a secure runtime for JavaScript and TypeScript with built-in security features and modern APIs.

### Features

- ✅ **Native TypeScript** - First-class TypeScript support
- ✅ **Secure by default** - Explicit permissions required
- ✅ **Modern APIs** - Web standards and modern JavaScript
- ✅ **Built-in tools** - Formatter, linter, test runner
- ✅ **No package.json** - Direct URL imports

### Installation

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
iwr https://deno.land/install.ps1 -useb | iex

# Homebrew
brew install deno

# npm (alternative)
npm install -g deno
```

### Usage

```bash
# Auto-detection (Deno will be selected if Bun is not available)
scriptit exec script.ts

# Force Deno runtime
scriptit --runtime=deno exec script.ts
SCRIPTIT_RUNTIME=deno scriptit exec script.ts
```

### Configuration

```javascript
// scriptit.config.js
export default {
  runtime: 'deno',
  runtimeOptions: {
    deno: {
      // Deno-specific options
      permissions: ['--allow-all'],
      unstable: true,
      importMap: './import_map.json'
    }
  }
}
```

### Example Script

```typescript
// deno-example.ts
export const description = "Deno runtime example with security";

interface ApiResponse {
  status: string;
  data: any;
}

export async function execute(context: any) {
  const console = context.console || global.console;
  
  console.info('🦕 Running with Deno runtime');
  console.log('TypeScript support: Native');
  console.log('Security: Excellent');
  
  try {
    // Deno has built-in fetch
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    
    console.log('API Response:', data);
    
    return {
      runtime: 'deno',
      security: 'excellent',
      apiData: data
    };
  } catch (error) {
    console.error('API Error:', error.message);
    return {
      runtime: 'deno',
      error: error.message
    };
  }
}
```

## Node.js Runtime

### Overview

Node.js is the most mature and widely-used JavaScript runtime with the largest ecosystem and excellent production stability.

### Features

- ✅ **Largest ecosystem** - Millions of npm packages
- ✅ **Production proven** - Battle-tested in production
- ✅ **TypeScript support** - Via tsx or ts-node
- ✅ **Excellent tooling** - Mature development tools
- ✅ **Long-term support** - LTS versions available

### Installation

```bash
# Official installer
# Download from https://nodejs.org

# nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node

# Homebrew (macOS)
brew install node

# Package managers
apt install nodejs npm  # Ubuntu/Debian
yum install nodejs npm  # CentOS/RHEL
```

### Usage

```bash
# Auto-detection (Node.js is the fallback)
scriptit exec script.js

# Force Node.js runtime
scriptit --runtime=node exec script.js
SCRIPTIT_RUNTIME=node scriptit exec script.js

# TypeScript with tsx (if available)
scriptit --runtime=node exec script.ts
```

### Configuration

```javascript
// scriptit.config.js
export default {
  runtime: 'node',
  runtimeOptions: {
    node: {
      // Node.js-specific options
      useTsx: true,
      nodeOptions: ['--max-old-space-size=4096'],
      tsconfig: './tsconfig.json'
    }
  }
}
```

### Example Script

```javascript
// node-example.js
export const description = "Node.js runtime example with npm packages";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🟢 Running with Node.js runtime');
  console.log('TypeScript support: Via tsx/ts-node');
  console.log('Ecosystem: Largest');
  
  // Access Node.js built-ins
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
  };
  
  console.log('System Info:', systemInfo);
  
  // Node.js has the largest package ecosystem
  try {
    // Example: using a popular npm package (if available)
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    
    console.log('Project:', packageJson.name);
    console.log('Version:', packageJson.version);
    
    return {
      runtime: 'node',
      ecosystem: 'largest',
      systemInfo,
      project: {
        name: packageJson.name,
        version: packageJson.version
      }
    };
  } catch (error) {
    console.warn('Could not read package.json:', error.message);
    return {
      runtime: 'node',
      ecosystem: 'largest',
      systemInfo
    };
  }
}
```

## Runtime Selection Methods

### 1. Command-Line Flag

```bash
# Highest priority - overrides all other settings
scriptit --runtime=bun exec script.ts
scriptit --runtime=deno exec script.ts
scriptit --runtime=node exec script.js
```

### 2. Environment Variable

```bash
# Set for current session
export SCRIPTIT_RUNTIME=bun
scriptit exec script.ts

# Set for single command
SCRIPTIT_RUNTIME=deno scriptit exec script.ts
```

### 3. Configuration File

```javascript
// scriptit.config.js
export default {
  runtime: 'bun'  // Default runtime for this project
}
```

### 4. Auto-Detection

```bash
# ScriptIt will automatically choose the best available runtime
scriptit exec script.ts
```

## Runtime-Specific Features

### TypeScript Support

| Runtime | TypeScript Support | Configuration |
|---------|-------------------|---------------|
| **Bun** | Native, no config needed | Built-in |
| **Deno** | Native, no config needed | Built-in |
| **Node.js** | Via tsx/ts-node | Requires installation |

#### TypeScript Examples

```bash
# Bun - works out of the box
scriptit --runtime=bun exec script.ts

# Deno - works out of the box
scriptit --runtime=deno exec script.ts

# Node.js - requires tsx or ts-node
npm install -g tsx
scriptit --runtime=node exec script.ts
```

### Performance Comparison

```javascript
// performance-test.js
export const description = "Runtime performance comparison";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('⚡ Performance Test');
  
  const start = performance.now();
  
  // CPU-intensive task
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  
  const end = performance.now();
  const duration = Math.round(end - start);
  
  console.log(`Computation result: ${Math.round(result)}`);
  console.log(`Duration: ${duration}ms`);
  
  // Memory usage
  const memoryUsage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
  });
  
  return {
    duration,
    memoryUsage: Math.round(memoryUsage.rss / 1024 / 1024),
    result: Math.round(result)
  };
}
```

### Security Features

#### Deno Security Example

```typescript
// deno-security.ts
export const description = "Deno security features demonstration";

export async function execute(context: any) {
  const console = context.console || global.console;
  
  console.info('🔒 Deno Security Features');
  
  try {
    // This will fail without --allow-net permission
    const response = await fetch('https://api.github.com');
    console.log('Network access: Allowed');
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('Network access: Denied');
    console.error('Error:', error.message);
  }
  
  try {
    // This will fail without --allow-read permission
    const data = await Deno.readTextFile('./package.json');
    console.log('File read access: Allowed');
  } catch (error) {
    console.error('File read access: Denied');
    console.error('Error:', error.message);
  }
  
  return {
    runtime: 'deno',
    securityModel: 'explicit-permissions'
  };
}
```

## Runtime Configuration

### Advanced Configuration

```javascript
// scriptit.config.js
export default {
  runtime: 'auto',
  
  runtimeOptions: {
    bun: {
      // Bun configuration
      experimental: true,
      bunfig: './bunfig.toml',
      env: {
        BUN_ENV: 'development'
      }
    },
    
    deno: {
      // Deno configuration
      permissions: [
        '--allow-net',
        '--allow-read',
        '--allow-env'
      ],
      unstable: true,
      importMap: './import_map.json',
      config: './deno.json'
    },
    
    node: {
      // Node.js configuration
      useTsx: true,
      nodeOptions: [
        '--max-old-space-size=4096',
        '--enable-source-maps'
      ],
      tsconfig: './tsconfig.json',
      env: {
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    }
  }
}
```

### Environment-Specific Runtime Selection

```javascript
// scriptit.config.js
const environments = {
  development: {
    runtime: 'bun',  // Fast development with Bun
    runtimeOptions: {
      bun: { experimental: true }
    }
  },
  
  staging: {
    runtime: 'deno',  // Security testing with Deno
    runtimeOptions: {
      deno: { permissions: ['--allow-all'] }
    }
  },
  
  production: {
    runtime: 'node',  // Stable production with Node.js
    runtimeOptions: {
      node: { 
        nodeOptions: ['--max-old-space-size=8192']
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
export default environments[env];
```

## Runtime Detection and Debugging

### Debug Runtime Selection

```bash
# See runtime detection process
scriptit --debug exec script.js
```

Output includes:
- Available runtimes
- Selection priority
- Chosen runtime and reason
- Runtime-specific configuration

### Runtime Information Script

```javascript
// runtime-info.js
export const description = "Display runtime information";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🔍 Runtime Information');
  
  // Detect current runtime
  let runtime = 'unknown';
  let version = 'unknown';
  
  if (typeof Bun !== 'undefined') {
    runtime = 'bun';
    version = Bun.version;
  } else if (typeof Deno !== 'undefined') {
    runtime = 'deno';
    version = Deno.version.deno;
  } else if (typeof process !== 'undefined' && process.versions?.node) {
    runtime = 'node';
    version = process.version;
  }
  
  console.log('Runtime:', runtime);
  console.log('Version:', version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);
  
  // Runtime-specific features
  const features = {
    nativeTypeScript: runtime === 'bun' || runtime === 'deno',
    securityModel: runtime === 'deno' ? 'explicit-permissions' : 'full-access',
    packageManager: runtime === 'bun' ? 'bun' : runtime === 'deno' ? 'url-imports' : 'npm'
  };
  
  console.log('Features:', features);
  
  return {
    runtime,
    version,
    platform: process.platform,
    architecture: process.arch,
    features
  };
}
```

## Best Practices

### 1. Choose the Right Runtime

```javascript
// ✅ Good - choose based on needs
// Development: Bun for speed and TypeScript
// Security-focused: Deno for permissions
// Production: Node.js for stability

// ❌ Avoid - using wrong runtime for the job
// Don't use experimental runtimes in production
// Don't ignore security requirements
```

### 2. Handle Runtime Differences

```javascript
// ✅ Good - runtime-agnostic code
export async function execute(context) {
  const console = context.console || global.console;
  
  // Use context.env instead of process.env directly
  const apiUrl = context.env.API_URL;
  
  // Handle different fetch implementations
  const fetchFn = globalThis.fetch || require('node-fetch');
  
  return { apiUrl };
}

// ❌ Avoid - runtime-specific code
export async function execute(context) {
  // This only works in Bun
  const file = Bun.file('./data.json');
  
  // This only works in Deno
  const data = await Deno.readTextFile('./data.txt');
}
```

### 3. Test Across Runtimes

```bash
# Test script with all runtimes
scriptit --runtime=bun exec test-script.js
scriptit --runtime=deno exec test-script.js
scriptit --runtime=node exec test-script.js
```

### 4. Use Configuration for Consistency

```javascript
// ✅ Good - consistent runtime per environment
export default {
  development: { runtime: 'bun' },
  staging: { runtime: 'deno' },
  production: { runtime: 'node' }
}
```

## Troubleshooting

### Common Issues

**Runtime not found:**
```bash
❌ ScriptIt Error: Bun runtime selected but not found
💡 Install Bun: https://bun.sh
💡 Or use different runtime: --runtime=node
```

**TypeScript errors in Node.js:**
```bash
❌ ScriptIt Error: TypeScript file requires tsx or ts-node
💡 Install tsx: npm install -g tsx
💡 Or use Bun/Deno: --runtime=bun
```

**Permission denied in Deno:**
```bash
❌ Deno Error: Network access denied
💡 Add permission: --allow-net
💡 Or allow all: --allow-all
```

### Runtime Compatibility

```javascript
// runtime-compatibility.js
export const description = "Check runtime compatibility";

export async function execute(context) {
  const console = context.console || global.console;
  
  const checks = {
    fetch: typeof fetch !== 'undefined',
    webStreams: typeof ReadableStream !== 'undefined',
    webCrypto: typeof crypto !== 'undefined',
    nodeBuiltins: typeof require !== 'undefined'
  };
  
  console.info('🔧 Runtime Compatibility:');
  Object.entries(checks).forEach(([feature, available]) => {
    const status = available ? '✅' : '❌';
    console.log(`${feature}: ${status}`);
  });
  
  return checks;
}
```

## Related Documentation

- [CLI Commands](/cli/commands) - Runtime selection in commands
- [Configuration](/cli/configuration) - Runtime configuration options
- [Environment Variables](/cli/environment) - Runtime environment variables
- [Cross-Runtime Support](/features/cross-runtime) - Cross-runtime features 