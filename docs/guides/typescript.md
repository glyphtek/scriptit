# TypeScript Support

ScriptIt provides excellent TypeScript support across all runtimes, with native support in Bun and Deno, and seamless integration with Node.js through tsx. This guide covers everything you need to know about writing TypeScript scripts.

## Runtime Support

### TypeScript Support by Runtime

| Runtime | TypeScript Support | Configuration Required | Performance |
|---------|-------------------|----------------------|-------------|
| **Bun** | ✅ Native | None | 🚀 Fastest |
| **Deno** | ✅ Native | None | 🟢 Fast |
| **Node.js** | 🟡 Via tsx/ts-node | tsx installation | 🟢 Fast |

### Bun (Recommended)

Bun provides the best TypeScript experience with zero configuration:

```bash
# Works out of the box
scriptit exec script.ts

# Force Bun runtime
scriptit --runtime=bun exec script.ts
```

### Deno

Deno has excellent built-in TypeScript support:

```bash
# Native TypeScript support
scriptit --runtime=deno exec script.ts
```

### Node.js

Node.js requires tsx for TypeScript execution:

```bash
# Install tsx globally
npm install -g tsx

# ScriptIt will automatically use tsx when available
scriptit --runtime=node exec script.ts
```

## Type Definitions

### ScriptIt Types

ScriptIt provides comprehensive TypeScript types for better development experience:

```typescript
// Import types for better IDE support
interface ScriptContext {
  env: Record<string, string | undefined>;
  tmpDir: string;
  configPath?: string;
  log: (message: string) => void;
  params: Record<string, unknown>;
  console?: {
    log: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
  };
  [key: string]: unknown;
}

interface ScriptResult {
  [key: string]: unknown;
}
```

### Basic TypeScript Script

```typescript
// hello-typescript.ts
export const description = "TypeScript script with type safety";

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

interface ScriptResult {
  users: User[];
  count: number;
  timestamp: string;
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
  
  return {
    users: activeUsers,
    count: activeUsers.length,
    timestamp: new Date().toISOString()
  };
}
```

### Typed Context

Create a typed context interface for better type safety:

```typescript
// typed-script.ts
interface CustomScriptContext {
  env: {
    NODE_ENV?: string;
    API_KEY?: string;
    DATABASE_URL?: string;
    PORT?: string;
  };
  tmpDir: string;
  configPath?: string;
  log: (message: string) => void;
  params: {
    userId?: string;
    batchSize?: number;
    dryRun?: boolean;
  };
  console?: {
    log: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
  };
  // Default parameters from config
  appName?: string;
  version?: string;
}

export async function execute(context: CustomScriptContext) {
  const console = context.console || global.console;
  
  // Type-safe access to environment variables
  const nodeEnv: string = context.env.NODE_ENV || 'development';
  const apiKey: string | undefined = context.env.API_KEY;
  
  // Type-safe access to parameters
  const userId: string | undefined = context.params.userId;
  const batchSize: number = context.params.batchSize || 100;
  const dryRun: boolean = context.params.dryRun || false;
  
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Dry run: ${dryRun}`);
  
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }
  
  return {
    nodeEnv,
    batchSize,
    dryRun,
    hasApiKey: true
  };
}
```

## Advanced TypeScript Patterns

### Generic Script Functions

```typescript
// generic-script.ts
interface ProcessingResult<T> {
  data: T[];
  count: number;
  errors: string[];
  timestamp: string;
}

interface DataItem {
  id: number;
  name: string;
  value: number;
}

async function processData<T extends DataItem>(
  items: T[],
  processor: (item: T) => Promise<T>
): Promise<ProcessingResult<T>> {
  const results: T[] = [];
  const errors: string[] = [];
  
  for (const item of items) {
    try {
      const processed = await processor(item);
      results.push(processed);
    } catch (error) {
      errors.push(`Failed to process item ${item.id}: ${error.message}`);
    }
  }
  
  return {
    data: results,
    count: results.length,
    errors,
    timestamp: new Date().toISOString()
  };
}

export async function execute(context: any): Promise<ProcessingResult<DataItem>> {
  const console = context.console || global.console;
  
  const items: DataItem[] = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 }
  ];
  
  const result = await processData(items, async (item) => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return { ...item, value: item.value * 2 };
  });
  
  console.log(`Processed ${result.count} items`);
  if (result.errors.length > 0) {
    console.warn(`Errors: ${result.errors.length}`);
  }
  
  return result;
}
```

### Enum and Union Types

```typescript
// enum-script.ts
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

type Environment = 'development' | 'staging' | 'production';

interface Config {
  environment: Environment;
  logLevel: LogLevel;
  features: {
    enableCache: boolean;
    enableMetrics: boolean;
    enableDebug: boolean;
  };
}

function parseConfig(context: any): Config {
  const env = context.env.NODE_ENV as Environment || 'development';
  const logLevel = context.env.LOG_LEVEL as LogLevel || LogLevel.INFO;
  
  return {
    environment: env,
    logLevel,
    features: {
      enableCache: env === 'production',
      enableMetrics: env !== 'development',
      enableDebug: env === 'development' || logLevel === LogLevel.DEBUG
    }
  };
}

export async function execute(context: any) {
  const console = context.console || global.console;
  const config = parseConfig(context);
  
  console.log(`Environment: ${config.environment}`);
  console.log(`Log level: ${config.logLevel}`);
  console.log(`Features:`, config.features);
  
  // Type-safe feature checks
  if (config.features.enableDebug) {
    console.debug('Debug mode enabled');
  }
  
  return config;
}
```

### Class-Based Scripts

```typescript
// class-script.ts
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

class DatabaseManager {
  private config: DatabaseConfig;
  private connected: boolean = false;
  
  constructor(config: DatabaseConfig) {
    this.config = config;
  }
  
  async connect(): Promise<void> {
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connected = true;
  }
  
  async query<T>(sql: string): Promise<T[]> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    
    // Simulate query
    await new Promise(resolve => setTimeout(resolve, 500));
    return [] as T[];
  }
  
  async disconnect(): Promise<void> {
    this.connected = false;
  }
  
  isConnected(): boolean {
    return this.connected;
  }
}

interface User {
  id: number;
  name: string;
  email: string;
}

export async function tearUp(context: any) {
  const console = context.console || global.console;
  
  const config: DatabaseConfig = {
    host: context.env.DB_HOST || 'localhost',
    port: parseInt(context.env.DB_PORT || '5432'),
    database: context.env.DB_NAME || 'myapp',
    username: context.env.DB_USER || 'user',
    password: context.env.DB_PASS || 'password'
  };
  
  const db = new DatabaseManager(config);
  await db.connect();
  
  console.log('✅ Database connected');
  
  return { db };
}

export async function execute(context: any, tearUpResult: { db: DatabaseManager }) {
  const console = context.console || global.console;
  const { db } = tearUpResult;
  
  console.log('📊 Querying users...');
  const users = await db.query<User>('SELECT * FROM users');
  
  console.log(`Found ${users.length} users`);
  
  return {
    userCount: users.length,
    users: users.slice(0, 10) // Return first 10 users
  };
}

export async function tearDown(context: any, executeResult: any, tearUpResult: { db: DatabaseManager }) {
  const console = context.console || global.console;
  const { db } = tearUpResult;
  
  if (db.isConnected()) {
    await db.disconnect();
    console.log('🔌 Database disconnected');
  }
}
```

## Configuration

### TypeScript Configuration

Create a `tsconfig.json` for your scripts:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "outDir": "./dist",
    "rootDir": "./scripts",
    "types": ["node"]
  },
  "include": [
    "scripts/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### ScriptIt Configuration with TypeScript

```typescript
// scriptit.config.ts
interface ScriptItConfig {
  scriptsDir: string;
  tmpDir: string;
  envFiles: string[];
  excludePatterns: string[];
  defaultParams: Record<string, unknown>;
}

const config: ScriptItConfig = {
  scriptsDir: 'scripts',
  tmpDir: 'tmp',
  envFiles: ['.env', '.env.local'],
  excludePatterns: ['**/*.test.ts', '**/*.spec.ts'],
  defaultParams: {
    appName: 'My TypeScript App',
    version: '1.0.0'
  }
};

export default config;
```

## Library Integration

### TypeScript Library Usage

```typescript
// lib-typescript.ts
import { createScriptRunner } from '@glyphtek/scriptit';

interface ScriptResult {
  success: boolean;
  data?: any;
  error?: string;
}

async function runTypedScript(): Promise<ScriptResult> {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp',
    consoleInterception: { enabled: true }
  });
  
  try {
    const result = await runner.executeScript('typed-script.ts', {
      params: {
        userId: '123',
        batchSize: 50,
        dryRun: false
      },
      env: {
        NODE_ENV: 'development',
        API_KEY: 'test-key'
      }
    });
    
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Usage
runTypedScript().then(result => {
  if (result.success) {
    console.log('Script completed:', result.data);
  } else {
    console.error('Script failed:', result.error);
  }
});
```

### Event Handling with Types

```typescript
// events-typescript.ts
import { createScriptRunner } from '@glyphtek/scriptit';

interface ScriptEvent {
  scriptPath: string;
  timestamp: Date;
}

interface ScriptStartEvent extends ScriptEvent {
  params: Record<string, unknown>;
}

interface ScriptEndEvent extends ScriptEvent {
  result: any;
  duration: number;
}

interface ScriptErrorEvent extends ScriptEvent {
  error: Error;
}

async function setupTypedEventHandling() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp',
    consoleInterception: { enabled: true }
  });
  
  // Type-safe event handlers
  runner.on('script:beforeExecute', (scriptPath: string, params: Record<string, unknown>) => {
    const event: ScriptStartEvent = {
      scriptPath,
      params,
      timestamp: new Date()
    };
    console.log('Script starting:', event);
  });
  
  runner.on('script:afterExecute', (scriptPath: string, result: any) => {
    const event: ScriptEndEvent = {
      scriptPath,
      result,
      timestamp: new Date(),
      duration: 0 // Would need to track start time
    };
    console.log('Script completed:', event);
  });
  
  runner.on('script:error', (scriptPath: string, error: Error) => {
    const event: ScriptErrorEvent = {
      scriptPath,
      error,
      timestamp: new Date()
    };
    console.error('Script error:', event);
  });
  
  return runner;
}
```

## Testing TypeScript Scripts

### Unit Testing

```typescript
// script.test.ts
import { describe, test, expect } from 'bun:test';

// Mock context for testing
function createMockContext(overrides: Partial<any> = {}): any {
  return {
    env: { NODE_ENV: 'test', ...overrides.env },
    tmpDir: '/tmp/test',
    configPath: undefined,
    log: jest.fn(),
    params: {},
    console: {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    },
    ...overrides
  };
}

describe('TypeScript Script Tests', () => {
  test('should process users correctly', async () => {
    // Import your script function
    const { execute } = await import('./user-processor.ts');
    
    const context = createMockContext({
      params: { batchSize: 10 },
      env: { NODE_ENV: 'test' }
    });
    
    const result = await execute(context);
    
    expect(result).toBeDefined();
    expect(result.count).toBeGreaterThan(0);
    expect(Array.isArray(result.users)).toBe(true);
  });
  
  test('should handle missing environment variables', async () => {
    const { execute } = await import('./api-script.ts');
    
    const context = createMockContext({
      env: {} // No API_KEY
    });
    
    await expect(execute(context)).rejects.toThrow('API_KEY environment variable is required');
  });
});
```

### Integration Testing

```typescript
// integration.test.ts
import { createScriptRunner } from '@glyphtek/scriptit';
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('TypeScript Integration Tests', () => {
  let tempDir: string;
  let runner: any;
  
  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'scriptit-test-'));
    
    runner = await createScriptRunner({
      scriptsDir: './test-scripts',
      tmpDir: tempDir,
      consoleInterception: { enabled: true }
    });
  });
  
  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });
  
  test('should execute TypeScript script with types', async () => {
    const result = await runner.executeScript('typed-example.ts', {
      params: { testParam: 'integration-test' },
      env: { NODE_ENV: 'test' }
    });
    
    expect(result).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
    expect(result.success).toBe(true);
  });
  
  test('should handle script errors gracefully', async () => {
    await expect(
      runner.executeScript('error-script.ts')
    ).rejects.toThrow();
  });
});
```

## Best Practices

### 1. Type Safety

```typescript
// ✅ Good - explicit types
interface UserData {
  id: number;
  name: string;
  email: string;
}

export async function execute(context: any): Promise<{ users: UserData[] }> {
  const users: UserData[] = await fetchUsers();
  return { users };
}

// ❌ Avoid - any everywhere
export async function execute(context: any): Promise<any> {
  const users: any = await fetchUsers();
  return users;
}
```

### 2. Environment Variable Typing

```typescript
// ✅ Good - typed environment
interface Environment {
  NODE_ENV: 'development' | 'staging' | 'production';
  API_KEY: string;
  DATABASE_URL: string;
  PORT?: string;
}

function getTypedEnv(env: Record<string, string | undefined>): Environment {
  const nodeEnv = env.NODE_ENV as Environment['NODE_ENV'] || 'development';
  const apiKey = env.API_KEY;
  const databaseUrl = env.DATABASE_URL;
  
  if (!apiKey) throw new Error('API_KEY is required');
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  
  return {
    NODE_ENV: nodeEnv,
    API_KEY: apiKey,
    DATABASE_URL: databaseUrl,
    PORT: env.PORT
  };
}

export async function execute(context: any) {
  const env = getTypedEnv(context.env);
  // Now env is fully typed
}
```

### 3. Error Handling with Types

```typescript
// ✅ Good - typed errors
class ScriptError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ScriptError';
  }
}

export async function execute(context: any) {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new ScriptError(
        'Operation failed',
        'OPERATION_ERROR',
        { originalError: error.message }
      );
    }
    throw new ScriptError('Unknown error', 'UNKNOWN_ERROR');
  }
}
```

### 4. Async/Await with Types

```typescript
// ✅ Good - proper async typing
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function execute(context: any) {
  interface ApiResponse {
    data: Array<{ id: number; name: string }>;
    total: number;
  }
  
  const result = await fetchData<ApiResponse>('https://api.example.com/data');
  return result;
}
```

### 5. Generic Utilities

```typescript
// ✅ Good - reusable typed utilities
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
}

export async function execute(context: any) {
  const result = await withRetry(
    () => fetchData('https://api.example.com/data'),
    3,
    1000
  );
  
  return result;
}
```

## Runtime-Specific TypeScript Features

### Bun-Specific Types

```typescript
// bun-script.ts
export async function execute(context: any) {
  const console = context.console || global.console;
  
  // Bun-specific APIs
  if (typeof Bun !== 'undefined') {
    console.log('Bun version:', Bun.version);
    
    // Fast file operations
    const file = Bun.file('./package.json');
    if (await file.exists()) {
      const packageJson = await file.json();
      console.log('Package name:', packageJson.name);
    }
    
    // Bun utilities
    const hash = Bun.hash('hello world');
    console.log('Hash:', hash);
  }
  
  return { runtime: 'bun' };
}
```

### Deno-Specific Types

```typescript
// deno-script.ts
export async function execute(context: any) {
  const console = context.console || global.console;
  
  // Deno-specific APIs
  if (typeof Deno !== 'undefined') {
    console.log('Deno version:', Deno.version.deno);
    console.log('TypeScript version:', Deno.version.typescript);
    
    // Deno permissions and APIs
    try {
      const response = await fetch('https://api.github.com/zen');
      const zen = await response.text();
      console.log('GitHub Zen:', zen);
    } catch (error) {
      console.warn('Network request failed:', error.message);
    }
  }
  
  return { runtime: 'deno' };
}
```

### Node.js-Specific Types

```typescript
// node-script.ts
import { cpus, freemem } from 'os';
import { readFile } from 'fs/promises';

export async function execute(context: any) {
  const console = context.console || global.console;
  
  // Node.js-specific APIs
  if (typeof process !== 'undefined' && process.versions?.node) {
    console.log('Node.js version:', process.version);
    console.log('Platform:', process.platform);
    
    // Node.js built-ins
    console.log('CPU count:', cpus().length);
    console.log('Free memory:', Math.round(freemem() / 1024 / 1024), 'MB');
    
    // File operations
    try {
      const packageJson = await readFile('./package.json', 'utf8');
      const pkg = JSON.parse(packageJson);
      console.log('Package name:', pkg.name);
    } catch (error) {
      console.warn('Could not read package.json');
    }
  }
  
  return { runtime: 'node' };
}
```

## Related Documentation

- [Writing Scripts](/guides/writing-scripts) - Basic script structure and patterns
- [Cross-Runtime Support](/features/cross-runtime) - Runtime compatibility
- [Library API](/library/api) - TypeScript library integration
- [CLI Commands](/cli/commands) - Running TypeScript scripts
- [Best Practices](/guides/best-practices) - General best practices 