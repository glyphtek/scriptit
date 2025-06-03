# Cross-Runtime Support

ScriptIt provides seamless cross-runtime compatibility, allowing you to run the same scripts across Bun, Node.js, and Deno without modification. This flexibility ensures your scripts work in any environment while taking advantage of each runtime's unique strengths.

## Overview

ScriptIt's cross-runtime architecture provides:

- **Unified API** - Same script structure works across all runtimes
- **Intelligent detection** - Automatic runtime selection based on availability
- **Runtime-specific optimizations** - Leverages each runtime's strengths
- **Consistent behavior** - Predictable execution regardless of runtime
- **Zero configuration** - Works out of the box with any runtime

## Supported Runtimes

### Runtime Comparison

| Feature | Bun | Node.js | Deno |
|---------|-----|---------|------|
| **TypeScript** | ✅ Native | 🟡 Via tsx/ts-node | ✅ Native |
| **Performance** | 🚀 Fastest | 🟢 Fast | 🟢 Fast |
| **Ecosystem** | 🟡 Growing | 🚀 Largest | 🟡 Moderate |
| **Security** | 🟢 Good | 🟢 Good | 🚀 Excellent |
| **Startup Time** | 🚀 Instant | 🟢 Fast | 🟢 Fast |
| **Memory Usage** | 🚀 Efficient | 🟢 Good | 🟢 Good |
| **Package Manager** | Built-in | npm/yarn/pnpm | URL imports |

### Runtime Detection Priority

ScriptIt automatically detects and selects runtimes in this order:

1. **Manual selection** (highest priority)
2. **Bun** - If available (recommended)
3. **Deno** - If available
4. **Node.js** - Fallback option

## Bun Runtime

### Overview

Bun is ScriptIt's recommended runtime, offering the best performance and developer experience.

### Key Features

- **Native TypeScript** - No transpilation or configuration needed
- **Fastest startup** - Optimized for development workflows
- **Built-in bundler** - No additional build tools required
- **Node.js compatibility** - Most npm packages work seamlessly
- **Modern APIs** - Latest JavaScript and Web API support

### Installation

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# npm (alternative)
npm install -g bun
```

### Usage Examples

```bash
# Auto-detection (Bun will be selected if available)
scriptit exec script.ts

# Force Bun runtime
scriptit --runtime=bun exec script.ts
SCRIPTIT_RUNTIME=bun scriptit exec script.ts
```

### Bun-Specific Features

```javascript
// bun-features.js
export const description = "Demonstrating Bun-specific features";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🚀 Running with Bun');
  
  // Bun has excellent performance for file operations
  if (typeof Bun !== 'undefined') {
    console.log('Bun version:', Bun.version);
    
    // Fast file operations
    const file = Bun.file('./package.json');
    if (await file.exists()) {
      const content = await file.json();
      console.log('Package name:', content.name);
    }
    
    // Built-in utilities
    console.log('Hash example:', Bun.hash('hello world'));
  }
  
  return { runtime: 'bun', performance: 'excellent' };
}
```

## Node.js Runtime

### Overview

Node.js provides the most mature ecosystem and production stability, making it ideal for enterprise environments.

### Key Features

- **Largest ecosystem** - Millions of npm packages available
- **Production proven** - Battle-tested in production environments
- **TypeScript support** - Via tsx, ts-node, or compilation
- **Excellent tooling** - Mature development and debugging tools
- **Long-term support** - LTS versions for stability

### Installation

```bash
# Official installer
# Download from https://nodejs.org

# nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node

# Package managers
brew install node      # macOS
apt install nodejs npm # Ubuntu/Debian
```

### Usage Examples

```bash
# Auto-detection (Node.js is the fallback)
scriptit exec script.js

# Force Node.js runtime
scriptit --runtime=node exec script.js
SCRIPTIT_RUNTIME=node scriptit exec script.js
```

### Node.js-Specific Features

```javascript
// node-features.js
export const description = "Demonstrating Node.js-specific features";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🟢 Running with Node.js');
  
  if (typeof process !== 'undefined' && process.versions?.node) {
    console.log('Node.js version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);
    
    // Access to Node.js built-ins
    const os = await import('os');
    console.log('CPU count:', os.cpus().length);
    console.log('Free memory:', Math.round(os.freemem() / 1024 / 1024), 'MB');
  }
  
  return { 
    runtime: 'node',
    ecosystem: 'largest',
    stability: 'excellent'
  };
}
```

## Deno Runtime

### Overview

Deno offers a secure-by-default runtime with excellent TypeScript support and modern web standards.

### Key Features

- **Secure by default** - Explicit permissions required for file/network access
- **Native TypeScript** - First-class TypeScript support
- **Modern APIs** - Web standards and modern JavaScript features
- **Built-in tools** - Formatter, linter, test runner included
- **URL imports** - Direct imports from URLs, no package.json needed

### Installation

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
iwr https://deno.land/install.ps1 -useb | iex

# Package managers
brew install deno       # macOS
choco install deno      # Windows
```

### Usage Examples

```bash
# Auto-detection (Deno will be selected if Bun is not available)
scriptit exec script.ts

# Force Deno runtime
scriptit --runtime=deno exec script.ts
SCRIPTIT_RUNTIME=deno scriptit exec script.ts
```

### Deno-Specific Features

```javascript
// deno-features.js
export const description = "Demonstrating Deno-specific features";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🦕 Running with Deno');
  
  if (typeof Deno !== 'undefined') {
    console.log('Deno version:', Deno.version.deno);
    console.log('TypeScript version:', Deno.version.typescript);
    console.log('V8 version:', Deno.version.v8);
    
    // Built-in fetch (Web API)
    try {
      const response = await fetch('https://api.github.com/zen');
      const zen = await response.text();
      console.log('GitHub Zen:', zen);
    } catch (error) {
      console.warn('Network request failed:', error.message);
    }
    
    // Deno-specific APIs
    console.log('OS:', Deno.build.os);
    console.log('Architecture:', Deno.build.arch);
  }
  
  return { 
    runtime: 'deno',
    security: 'excellent',
    standards: 'web-compliant'
  };
}
```

## Runtime Selection

### Automatic Detection

ScriptIt automatically selects the best available runtime:

```bash
# ScriptIt will choose: Bun > Deno > Node.js
scriptit exec script.js
```

The selection process:
1. Check for manual runtime selection
2. Look for Bun installation
3. Look for Deno installation
4. Fall back to Node.js
5. Error if no runtime found

### Manual Selection

#### Command Line Flag

```bash
# Highest priority - overrides all other settings
scriptit --runtime=bun exec script.ts
scriptit --runtime=deno exec script.ts
scriptit --runtime=node exec script.js
```

#### Environment Variable

```bash
# Set for current session
export SCRIPTIT_RUNTIME=bun
scriptit exec script.ts

# Set for single command
SCRIPTIT_RUNTIME=deno scriptit exec script.ts
```

#### Configuration File

```javascript
// scriptit.config.js
export default {
  runtime: 'bun',  // Default runtime for this project
  
  // Runtime-specific options
  runtimeOptions: {
    bun: {
      experimental: true,
      bunfig: './bunfig.toml'
    },
    deno: {
      permissions: ['--allow-net', '--allow-read'],
      unstable: true
    },
    node: {
      useTsx: true,
      nodeOptions: ['--max-old-space-size=4096']
    }
  }
}
```

### Environment-Specific Selection

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

## Cross-Runtime Compatibility

### Writing Portable Scripts

Write scripts that work across all runtimes:

```javascript
// portable-script.js
export const description = "Cross-runtime compatible script";

export async function execute(context) {
  const console = context.console || global.console;
  
  // Detect current runtime
  let runtime = 'unknown';
  if (typeof Bun !== 'undefined') {
    runtime = 'bun';
  } else if (typeof Deno !== 'undefined') {
    runtime = 'deno';
  } else if (typeof process !== 'undefined' && process.versions?.node) {
    runtime = 'node';
  }
  
  console.info(`🔍 Running on ${runtime}`);
  
  // Use context.env instead of process.env for portability
  const nodeEnv = context.env.NODE_ENV || 'development';
  console.log('Environment:', nodeEnv);
  
  // Cross-runtime file operations
  const fs = await import('fs/promises');
  try {
    const stats = await fs.stat('./package.json');
    console.log('Package.json size:', stats.size, 'bytes');
  } catch (error) {
    console.warn('Could not read package.json');
  }
  
  // Cross-runtime HTTP requests
  const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
  
  return {
    runtime,
    environment: nodeEnv,
    timestamp: new Date().toISOString()
  };
}
```

### Runtime-Specific Optimizations

Optimize for specific runtimes while maintaining compatibility:

```javascript
// optimized-script.js
export const description = "Runtime-optimized script with fallbacks";

export async function execute(context) {
  const console = context.console || global.console;
  
  // Bun optimizations
  if (typeof Bun !== 'undefined') {
    console.info('🚀 Using Bun optimizations');
    
    // Fast file operations with Bun.file
    const file = Bun.file('./data.json');
    if (await file.exists()) {
      const data = await file.json();
      console.log('Data loaded with Bun.file');
      return { data, method: 'bun-file' };
    }
  }
  
  // Deno optimizations
  if (typeof Deno !== 'undefined') {
    console.info('🦕 Using Deno optimizations');
    
    // Use Deno's built-in APIs
    try {
      const data = await Deno.readTextFile('./data.json');
      const parsed = JSON.parse(data);
      console.log('Data loaded with Deno.readTextFile');
      return { data: parsed, method: 'deno-api' };
    } catch (error) {
      console.warn('Deno file read failed:', error.message);
    }
  }
  
  // Node.js fallback
  console.info('🟢 Using Node.js fallback');
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile('./data.json', 'utf8');
    const parsed = JSON.parse(data);
    console.log('Data loaded with Node.js fs');
    return { data: parsed, method: 'node-fs' };
  } catch (error) {
    console.error('File read failed:', error.message);
    return { error: error.message, method: 'failed' };
  }
}
```

## Performance Comparison

### Startup Time Benchmark

```javascript
// startup-benchmark.js
export const description = "Runtime startup time comparison";

export async function execute(context) {
  const console = context.console || global.console;
  
  const startTime = performance.now();
  
  // Simulate some work
  const iterations = 100000;
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.random();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Detect runtime
  let runtime = 'unknown';
  if (typeof Bun !== 'undefined') runtime = 'bun';
  else if (typeof Deno !== 'undefined') runtime = 'deno';
  else if (typeof process !== 'undefined') runtime = 'node';
  
  console.info(`⏱️ Performance Test Results`);
  console.log(`Runtime: ${runtime}`);
  console.log(`Duration: ${duration.toFixed(2)}ms`);
  console.log(`Iterations: ${iterations.toLocaleString()}`);
  console.log(`Avg per iteration: ${(duration / iterations).toFixed(4)}ms`);
  
  return {
    runtime,
    duration,
    iterations,
    avgPerIteration: duration / iterations
  };
}
```

### Memory Usage Monitoring

```javascript
// memory-monitor.js
export const description = "Runtime memory usage monitoring";

export async function execute(context) {
  const console = context.console || global.console;
  
  // Get memory usage based on runtime
  let memoryInfo = {};
  
  if (typeof Bun !== 'undefined') {
    // Bun memory info
    memoryInfo = {
      runtime: 'bun',
      // Bun doesn't expose detailed memory info yet
      available: 'Limited memory info in Bun'
    };
  } else if (typeof Deno !== 'undefined') {
    // Deno memory info
    memoryInfo = {
      runtime: 'deno',
      memoryUsage: Deno.memoryUsage()
    };
  } else if (typeof process !== 'undefined') {
    // Node.js memory info
    memoryInfo = {
      runtime: 'node',
      memoryUsage: process.memoryUsage()
    };
  }
  
  console.info('💾 Memory Usage Information');
  console.log('Runtime:', memoryInfo.runtime);
  
  if (memoryInfo.memoryUsage) {
    const usage = memoryInfo.memoryUsage;
    console.log('RSS:', Math.round(usage.rss / 1024 / 1024), 'MB');
    console.log('Heap Used:', Math.round(usage.heapUsed / 1024 / 1024), 'MB');
    console.log('Heap Total:', Math.round(usage.heapTotal / 1024 / 1024), 'MB');
    
    if (usage.external) {
      console.log('External:', Math.round(usage.external / 1024 / 1024), 'MB');
    }
  } else {
    console.log('Memory info:', memoryInfo.available || 'Not available');
  }
  
  return memoryInfo;
}
```

## TypeScript Support

### Native TypeScript Runtimes

Bun and Deno support TypeScript natively:

```typescript
// typescript-example.ts
export const description = "TypeScript example with type safety";

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

interface ScriptResult {
  users: User[];
  count: number;
  runtime: string;
}

export async function execute(context: any): Promise<ScriptResult> {
  const console = context.console || global.console;
  
  console.info('📝 TypeScript Example');
  
  const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
    { id: 2, name: 'Bob', email: 'bob@example.com', active: false },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', active: true }
  ];
  
  const activeUsers = users.filter((user: User) => user.active);
  
  console.log(`Total users: ${users.length}`);
  console.log(`Active users: ${activeUsers.length}`);
  
  // Runtime detection with type safety
  let runtime: string = 'unknown';
  if (typeof Bun !== 'undefined') runtime = 'bun';
  else if (typeof Deno !== 'undefined') runtime = 'deno';
  else if (typeof process !== 'undefined') runtime = 'node';
  
  console.log(`Runtime: ${runtime}`);
  
  return {
    users: activeUsers,
    count: activeUsers.length,
    runtime
  };
}
```

### Node.js TypeScript Setup

For Node.js, install tsx for TypeScript support:

```bash
# Install tsx globally
npm install -g tsx

# Or use with npx
npx tsx script.ts

# ScriptIt will automatically use tsx if available
scriptit --runtime=node exec script.ts
```

## Debugging and Troubleshooting

### Runtime Detection Debug

```bash
# See detailed runtime detection process
SCRIPTIT_DEBUG=true scriptit exec script.js
```

Output includes:
- Available runtimes on system
- Selection priority and reasoning
- Chosen runtime and version
- Runtime-specific configuration

### Runtime Information Script

```javascript
// runtime-debug.js
export const description = "Comprehensive runtime debugging information";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🔍 Runtime Debug Information');
  
  // Basic runtime detection
  const runtimeInfo = {
    bun: typeof Bun !== 'undefined',
    deno: typeof Deno !== 'undefined',
    node: typeof process !== 'undefined' && !!process.versions?.node
  };
  
  console.log('Runtime availability:', runtimeInfo);
  
  // Current runtime details
  if (runtimeInfo.bun) {
    console.log('Bun version:', Bun.version);
    console.log('Bun revision:', Bun.revision);
  }
  
  if (runtimeInfo.deno) {
    console.log('Deno version:', Deno.version.deno);
    console.log('TypeScript version:', Deno.version.typescript);
    console.log('V8 version:', Deno.version.v8);
  }
  
  if (runtimeInfo.node) {
    console.log('Node.js version:', process.version);
    console.log('V8 version:', process.versions.v8);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);
  }
  
  // Environment information
  console.log('Environment variables count:', Object.keys(context.env).length);
  console.log('Working directory:', process.cwd());
  
  // Feature detection
  const features = {
    fetch: typeof fetch !== 'undefined',
    webStreams: typeof ReadableStream !== 'undefined',
    webCrypto: typeof crypto !== 'undefined',
    nodeBuiltins: typeof require !== 'undefined',
    esModules: typeof import !== 'undefined'
  };
  
  console.log('Feature availability:', features);
  
  return {
    runtimeInfo,
    features,
    environment: {
      cwd: process.cwd(),
      platform: process.platform,
      arch: process.arch
    }
  };
}
```

### Common Issues and Solutions

**Runtime not found:**
```bash
❌ ScriptIt Error: No compatible JavaScript runtime found
💡 Install at least one runtime:
   • Bun: https://bun.sh
   • Deno: https://deno.land  
   • Node.js: https://nodejs.org
```

**TypeScript errors in Node.js:**
```bash
❌ ScriptIt Error: TypeScript execution failed
💡 Install tsx: npm install -g tsx
💡 Or use Bun/Deno: --runtime=bun
```

**Permission denied in Deno:**
```bash
❌ Deno Error: Network access denied
💡 Add permissions in config:
   runtimeOptions: {
     deno: { permissions: ['--allow-net'] }
   }
```

## Best Practices

### 1. Write Runtime-Agnostic Code

```javascript
// ✅ Good - works across all runtimes
export async function execute(context) {
  const console = context.console || global.console;
  
  // Use context.env instead of process.env
  const apiUrl = context.env.API_URL;
  
  // Use standard APIs when possible
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  return data;
}

// ❌ Avoid - runtime-specific code
export async function execute(context) {
  // This only works in Bun
  const file = Bun.file('./data.json');
  
  // This only works in Deno
  const data = await Deno.readTextFile('./data.txt');
}
```

### 2. Use Progressive Enhancement

```javascript
// ✅ Good - progressive enhancement
export async function execute(context) {
  const console = context.console || global.console;
  
  // Try runtime-specific optimizations, fall back to standard APIs
  let data;
  
  if (typeof Bun !== 'undefined') {
    // Bun optimization
    data = await Bun.file('./data.json').json();
  } else {
    // Standard fallback
    const fs = await import('fs/promises');
    const content = await fs.readFile('./data.json', 'utf8');
    data = JSON.parse(content);
  }
  
  return data;
}
```

### 3. Test Across Runtimes

```bash
# Test your script with all available runtimes
scriptit --runtime=bun exec test-script.js
scriptit --runtime=deno exec test-script.js  
scriptit --runtime=node exec test-script.js
```

### 4. Use Configuration for Consistency

```javascript
// ✅ Good - consistent runtime per environment
export default {
  development: { runtime: 'bun' },    // Fast development
  staging: { runtime: 'deno' },       // Security testing
  production: { runtime: 'node' }     // Stable production
}
```

## Related Documentation

- [CLI Commands](/cli/commands) - Runtime selection in commands
- [Runtime Selection](/cli/runtime) - Detailed runtime configuration
- [Configuration](/cli/configuration) - Runtime-specific options
- [Installation](/installation) - Installing different runtimes 