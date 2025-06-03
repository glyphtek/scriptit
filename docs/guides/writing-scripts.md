# Writing Scripts

This guide covers everything you need to know about writing effective ScriptIt scripts, from basic structure requirements to advanced patterns and best practices.

## Script Structure Requirements

ScriptIt scripts must follow specific structure requirements to be executable. There are two main patterns you can use:

### 1. Execute Function Pattern (Recommended)

The traditional pattern using named exports:

```javascript
// my-script.js
export const description = "Description of what this script does";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Hello from ScriptIt!');
  console.info('This is an info message');
  
  return { success: true, message: 'Script completed' };
}
```

### 2. Default Export Pattern

Perfect for existing functions or simple scripts:

```javascript
// default-export-script.js
export const description = "Default export pattern script";

export default async function(context) {
  const console = context.console || global.console;
  
  console.log('Hello from default export!');
  
  return { success: true };
}
```

### Function Priority

When both patterns are present, ScriptIt prioritizes:
1. **`default` export** (highest priority)
2. **`execute` function** (fallback)

```javascript
// both-functions.js
export async function execute(context) {
  return { functionUsed: 'execute' };
}

export default async function(context) {
  return { functionUsed: 'default' }; // This will be used
}
```

## The Context Object

Every script receives a `context` object containing environment, configuration, and utilities:

### Context Properties

```typescript
interface ScriptContext {
  // Environment variables
  env: Record<string, string | undefined>;
  
  // Temporary directory for this execution
  tmpDir: string;
  
  // Path to loaded configuration file (if any)
  configPath?: string;
  
  // Logging function
  log: (message: string) => void;
  
  // User-defined parameters
  params: Record<string, unknown>;
  
  // Colored console methods (when console interception is enabled)
  console?: {
    log: (message: string) => void;    // White
    error: (message: string) => void;  // Red
    warn: (message: string) => void;   // Yellow
    info: (message: string) => void;   // Blue
    debug: (message: string) => void;  // Gray
  };
  
  // Default parameters from configuration
  [key: string]: unknown;
}
```

### Using the Context

```javascript
export async function execute(context) {
  // Always use fallback for console
  const console = context.console || global.console;
  
  // Access environment variables
  const nodeEnv = context.env.NODE_ENV || 'development';
  const apiKey = context.env.API_KEY;
  
  // Use temporary directory
  const tempFile = `${context.tmpDir}/processing-${Date.now()}.json`;
  
  // Access configuration info
  if (context.configPath) {
    console.log(`Config loaded from: ${context.configPath}`);
  }
  
  // Use default parameters (from scriptit.config.js)
  const appName = context.appName; // From defaultParams
  const version = context.version;
  
  // Access user-provided parameters
  const customParam = context.params.customValue;
  
  // Use logging
  context.log('This goes to the execution log');
  
  return { nodeEnv, appName, tempFile };
}
```

## Script Lifecycle

ScriptIt supports a complete script lifecycle with three phases:

### Basic Lifecycle

```javascript
// lifecycle-script.js
export const description = "Script with full lifecycle";

// 1. Setup phase (optional)
export async function tearUp(context) {
  context.log('Setting up resources...');
  
  // Initialize resources, create temp files, etc.
  const setupData = {
    timestamp: new Date().toISOString(),
    tempFile: `${context.tmpDir}/setup-${Date.now()}.json`
  };
  
  // Create temporary file
  await writeFile(setupData.tempFile, JSON.stringify({ initialized: true }));
  
  return setupData; // Passed to execute function
}

// 2. Main execution (required)
export async function execute(context, tearUpResult) {
  const console = context.console || global.console;
  
  console.log('Running main logic...');
  console.log('Setup data:', tearUpResult);
  
  // Your main script logic here
  const result = {
    success: true,
    processedAt: new Date().toISOString(),
    setupFile: tearUpResult?.tempFile
  };
  
  return result; // Passed to tearDown function
}

// 3. Cleanup phase (optional)
export async function tearDown(context, executeResult, tearUpResult) {
  context.log('Cleaning up resources...');
  
  // Clean up temporary files, close connections, etc.
  if (tearUpResult?.tempFile) {
    await unlink(tearUpResult.tempFile);
    context.log(`Cleaned up: ${tearUpResult.tempFile}`);
  }
  
  context.log('Cleanup completed');
}
```

### Lifecycle Execution Order

1. **`tearUp(context)`** - Setup and initialization
2. **`execute(context, tearUpResult)`** - Main script logic
3. **`tearDown(context, executeResult, tearUpResult)`** - Cleanup

### Error Handling in Lifecycle

```javascript
export async function tearUp(context) {
  try {
    // Setup logic
    return setupData;
  } catch (error) {
    context.log(`Setup failed: ${error.message}`);
    throw error; // Stops execution
  }
}

export async function execute(context, tearUpResult) {
  try {
    // Main logic
    return result;
  } catch (error) {
    // tearDown will still be called for cleanup
    throw error;
  }
}

export async function tearDown(context, executeResult, tearUpResult) {
  // Always runs, even if execute fails
  try {
    // Cleanup logic
  } catch (error) {
    context.log(`Cleanup warning: ${error.message}`);
    // Don't re-throw cleanup errors
  }
}
```

## Script Examples

### 1. Simple Hello World

```javascript
// hello.js
export const description = "Simple hello world script";

export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Hello, World!');
  console.info(`Environment: ${context.env.NODE_ENV || 'development'}`);
  console.log(`App: ${context.appName || 'Unknown'}`);
  
  return { 
    message: 'Hello world completed',
    timestamp: new Date().toISOString()
  };
}
```

### 2. File Processing Script

```javascript
// process-files.js
export const description = "Process files in a directory";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const targetDir = context.env.TARGET_DIR || '.';
  
  console.info(`📂 Processing files in: ${targetDir}`);
  
  try {
    const files = await fs.readdir(targetDir);
    console.log(`Found ${files.length} files`);
    
    const stats = { total: 0, js: 0, ts: 0, other: 0 };
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      stats.total++;
      
      switch (ext) {
        case '.js':
          stats.js++;
          console.debug(`📄 JavaScript: ${file}`);
          break;
        case '.ts':
          stats.ts++;
          console.debug(`📘 TypeScript: ${file}`);
          break;
        default:
          stats.other++;
          console.debug(`📄 Other: ${file}`);
      }
    }
    
    console.log('📊 Statistics:');
    console.info(`  JavaScript: ${stats.js}`);
    console.info(`  TypeScript: ${stats.ts}`);
    console.info(`  Other: ${stats.other}`);
    console.log(`  Total: ${stats.total}`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error processing files:', error.message);
    throw error;
  }
}
```

### 3. API Integration Script

```javascript
// api-test.js
export const description = "Test API endpoints with error handling";

export async function execute(context) {
  const console = context.console || global.console;
  
  const apiUrl = context.env.API_URL || 'https://jsonplaceholder.typicode.com';
  const timeout = parseInt(context.env.TIMEOUT || '5000');
  
  console.info(`🌐 Testing API: ${apiUrl}`);
  
  const endpoints = [
    '/posts/1',
    '/users/1',
    '/comments?postId=1'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const url = `${apiUrl}${endpoint}`;
    console.log(`🔍 Testing: ${endpoint}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ Success (${response.status})`);
        results.push({ endpoint, status: response.status, success: true });
      } else {
        console.warn(`  ⚠️  HTTP ${response.status}`);
        results.push({ endpoint, status: response.status, success: false });
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`  ❌ Timeout after ${timeout}ms`);
        results.push({ endpoint, error: 'timeout', success: false });
      } else {
        console.error(`  ❌ Error: ${error.message}`);
        results.push({ endpoint, error: error.message, success: false });
      }
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.info(`📊 Results: ${successful}/${results.length} successful`);
  
  return {
    summary: { total: results.length, successful, failed: results.length - successful },
    results
  };
}
```

### 4. Database Backup Script

```javascript
// backup.js
export const description = "Database backup with lifecycle management";

export async function tearUp(context) {
  const console = context.console || global.console;
  
  console.info('🔧 Setting up backup environment...');
  
  const backupDir = `${context.tmpDir}/backup-${Date.now()}`;
  const fs = await import('fs/promises');
  
  await fs.mkdir(backupDir, { recursive: true });
  console.log(`📁 Created backup directory: ${backupDir}`);
  
  return {
    backupDir,
    startTime: new Date().toISOString()
  };
}

export async function execute(context, tearUpResult) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const path = await import('path');
  
  console.info('💾 Starting database backup...');
  
  const dbUrl = context.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  // Simulate backup process
  console.log('🔄 Connecting to database...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📊 Exporting data...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create backup file
  const backupFile = path.join(tearUpResult.backupDir, 'backup.sql');
  const backupData = `-- Database backup created at ${new Date().toISOString()}\n-- Connection: ${dbUrl.replace(/\/\/.*@/, '//***@')}\nSELECT 'Backup completed' as status;`;
  
  await fs.writeFile(backupFile, backupData);
  console.log(`💾 Backup saved: ${backupFile}`);
  
  const stats = await fs.stat(backupFile);
  console.log(`📏 Backup size: ${stats.size} bytes`);
  
  return {
    backupFile,
    size: stats.size,
    completedAt: new Date().toISOString()
  };
}

export async function tearDown(context, executeResult, tearUpResult) {
  const console = context.console || global.console;
  
  console.info('🧹 Cleaning up backup environment...');
  
  if (executeResult?.backupFile) {
    // In production, you might upload to cloud storage here
    console.log(`📤 Backup ready for upload: ${executeResult.backupFile}`);
  }
  
  const duration = new Date().getTime() - new Date(tearUpResult.startTime).getTime();
  console.log(`⏱️  Total backup time: ${duration}ms`);
  
  console.log('✅ Backup process completed');
}
```

### 5. Default Export Script

```javascript
// default-export-example.js
export const description = "Default export script for simple tasks";

export default async function(context) {
  const console = context.console || global.console;
  
  console.info('🚀 Default export execution starting...');
  
  // Simple processing logic
  const data = {
    timestamp: new Date().toISOString(),
    environment: context.env.NODE_ENV || 'development',
    params: context.params
  };
  
  // Process data
  const processed = {
    ...data,
    processed: true,
    processingTime: Date.now()
  };
  
  // Save to temp file
  const outputFile = `${context.tmpDir}/default-export-output.json`;
  await writeFile(outputFile, JSON.stringify(processed, null, 2));
  
  console.log('✅ Default export completed!');
  
  return {
    success: true,
    outputFile,
    message: 'Default export execution completed'
  };
}
```

## TypeScript Support

### Basic TypeScript Script

```typescript
// typescript-example.ts
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

```typescript
// typed-context.ts
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

export async function execute(context: ScriptContext) {
  const console = context.console || global.console;
  
  // Type-safe access to context properties
  const nodeEnv: string = context.env.NODE_ENV || 'development';
  const tmpDir: string = context.tmpDir;
  
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Temp directory: ${tmpDir}`);
  
  return { nodeEnv, tmpDir };
}
```

## Environment Variables

### Accessing Environment Variables

```javascript
export async function execute(context) {
  const console = context.console || global.console;
  
  // Standard environment variables
  const nodeEnv = context.env.NODE_ENV || 'development';
  const port = parseInt(context.env.PORT || '3000');
  
  // Custom environment variables
  const apiKey = context.env.API_KEY;
  const dbUrl = context.env.DATABASE_URL;
  
  // Validate required variables
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }
  
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Port: ${port}`);
  console.log(`API Key: ${apiKey ? '***' : 'Not set'}`);
  
  return { nodeEnv, port, hasApiKey: !!apiKey };
}
```

### Environment Variable Patterns

```javascript
// config-driven.js
export async function execute(context) {
  const console = context.console || global.console;
  
  // Configuration with defaults
  const config = {
    timeout: parseInt(context.env.TIMEOUT || '5000'),
    retries: parseInt(context.env.RETRIES || '3'),
    debug: context.env.DEBUG === 'true',
    apiUrl: context.env.API_URL || 'https://api.example.com',
    batchSize: parseInt(context.env.BATCH_SIZE || '100')
  };
  
  if (config.debug) {
    console.debug('Configuration:', config);
  }
  
  console.info(`Processing with batch size: ${config.batchSize}`);
  console.info(`Timeout: ${config.timeout}ms`);
  
  return config;
}
```

## Error Handling

### Basic Error Handling

```javascript
export async function execute(context) {
  const console = context.console || global.console;
  
  try {
    // Risky operation
    const result = await riskyOperation();
    console.log('✅ Operation successful');
    return result;
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    
    // Log additional context
    console.error('Stack trace:', error.stack);
    console.error('Context:', { env: context.env.NODE_ENV });
    
    // Re-throw to indicate script failure
    throw error;
  }
}
```

### Graceful Error Handling

```javascript
export async function execute(context) {
  const console = context.console || global.console;
  const errors = [];
  let successCount = 0;
  
  const tasks = ['task1', 'task2', 'task3'];
  
  for (const task of tasks) {
    try {
      await processTask(task);
      successCount++;
      console.log(`✅ ${task} completed`);
    } catch (error) {
      errors.push({ task, error: error.message });
      console.warn(`⚠️  ${task} failed: ${error.message}`);
    }
  }
  
  console.info(`📊 Results: ${successCount}/${tasks.length} successful`);
  
  if (errors.length > 0) {
    console.warn('⚠️  Some tasks failed:', errors);
  }
  
  // Return results even with partial failures
  return {
    successful: successCount,
    total: tasks.length,
    errors: errors.length > 0 ? errors : undefined
  };
}
```

### Validation and Error Messages

```javascript
export async function execute(context) {
  const console = context.console || global.console;
  
  // Validate required environment variables
  const required = ['API_KEY', 'DATABASE_URL'];
  const missing = required.filter(key => !context.env[key]);
  
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error('❌ Configuration error:', message);
    throw new Error(message);
  }
  
  // Validate parameters
  if (!context.params.userId) {
    throw new Error('userId parameter is required');
  }
  
  const userId = parseInt(context.params.userId);
  if (isNaN(userId) || userId <= 0) {
    throw new Error('userId must be a positive number');
  }
  
  console.log(`✅ Validation passed for user: ${userId}`);
  
  return { userId, validated: true };
}
```

## Best Practices

### 1. Script Organization

```javascript
// ✅ Good - clear structure and documentation
export const description = "Process user data with validation and cleanup";

export async function tearUp(context) {
  // Setup resources
}

export async function execute(context, tearUpResult) {
  // Main logic
}

export async function tearDown(context, executeResult, tearUpResult) {
  // Cleanup
}
```

### 2. Console Usage

```javascript
// ✅ Good - always use fallback
export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('Regular message');     // White
  console.info('Information');        // Blue
  console.warn('Warning');           // Yellow
  console.error('Error');            // Red
  console.debug('Debug info');       // Gray
}

// ❌ Avoid - direct global console usage
export async function execute(context) {
  console.log('This bypasses colored output');
}
```

### 3. Environment Variable Handling

```javascript
// ✅ Good - validation and defaults
export async function execute(context) {
  const apiUrl = context.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL environment variable is required');
  }
  
  const timeout = parseInt(context.env.TIMEOUT || '5000');
  const debug = context.env.DEBUG === 'true';
}

// ❌ Avoid - no validation
export async function execute(context) {
  const apiUrl = context.env.API_URL; // Might be undefined
  const timeout = context.env.TIMEOUT; // String, not number
}
```

### 4. Return Values

```javascript
// ✅ Good - structured return values
export async function execute(context) {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: processedData,
    stats: { processed: 100, errors: 0 }
  };
}

// ✅ Also good - simple values
export async function execute(context) {
  return processedData;
}

// ✅ Also good - no return value
export async function execute(context) {
  // Side effects only
}
```

### 5. File Operations

```javascript
// ✅ Good - use temp directory
export async function execute(context) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const tempFile = path.join(context.tmpDir, `processing-${Date.now()}.json`);
  await fs.writeFile(tempFile, JSON.stringify(data));
  
  return { outputFile: tempFile };
}

// ❌ Avoid - writing to current directory
export async function execute(context) {
  await fs.writeFile('./output.json', data); // Pollutes working directory
}
```

### 6. Async/Await Usage

```javascript
// ✅ Good - proper async/await
export async function execute(context) {
  const console = context.console || global.console;
  
  try {
    const data = await fetchData();
    const processed = await processData(data);
    await saveResults(processed);
    
    console.log('✅ All operations completed');
    return processed;
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    throw error;
  }
}

// ❌ Avoid - mixing promises and async/await
export async function execute(context) {
  return fetchData().then(data => {
    return processData(data).then(processed => {
      return saveResults(processed);
    });
  });
}
```

### 7. Resource Management

```javascript
// ✅ Good - proper resource cleanup
export async function tearUp(context) {
  const connection = await createConnection();
  return { connection };
}

export async function execute(context, tearUpResult) {
  // Use connection
  const result = await tearUpResult.connection.query('SELECT * FROM users');
  return result;
}

export async function tearDown(context, executeResult, tearUpResult) {
  // Always clean up
  if (tearUpResult.connection) {
    await tearUpResult.connection.close();
  }
}
```

## Testing Scripts

### Manual Testing

```bash
# Test with different environments
NODE_ENV=development scriptit exec my-script.js
NODE_ENV=production scriptit exec my-script.js

# Test with parameters
scriptit exec my-script.js --env USER_ID=123 DEBUG=true

# Test with different runtimes
scriptit --runtime=bun exec my-script.ts
scriptit --runtime=node exec my-script.ts
```

### Script Validation

```javascript
// validation-script.js
export const description = "Validate script structure and requirements";

export async function execute(context) {
  const console = context.console || global.console;
  
  // Test environment access
  console.log('Environment variables:', Object.keys(context.env).length);
  
  // Test temp directory
  const fs = await import('fs/promises');
  const testFile = `${context.tmpDir}/test-${Date.now()}.txt`;
  await fs.writeFile(testFile, 'test');
  await fs.unlink(testFile);
  console.log('✅ Temp directory accessible');
  
  // Test console colors
  console.log('Regular log');
  console.info('Info message');
  console.warn('Warning message');
  console.error('Error message');
  console.debug('Debug message');
  
  return { validation: 'passed' };
}
```

## Related Documentation

- [CLI Commands](/cli/commands) - Running scripts from command line
- [Library API](/library/api) - Executing scripts programmatically
- [TypeScript Guide](/guides/typescript) - TypeScript-specific patterns
- [Console Colors](/features/console-colors) - Colored console output
- [Configuration](/cli/configuration) - Script configuration options 