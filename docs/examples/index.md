# Examples

This section contains practical examples of using ScriptIt for various tasks. Each example demonstrates different features and use cases.

## Quick Examples

### Hello World with Colors

The simplest example showcasing colored console output:

```javascript
// hello-colors.js
export const description = "Hello world with colored console output";

export async function execute(context) {
  // Use the enhanced console with fallback for colored output
  const console = context.console || global.console;

  console.log('👋 Hello from ScriptIt!');
  console.info('ℹ️ This is an info message');
  console.warn('⚠️ This is a warning');
  console.error('❌ This is an error');
  console.debug('🐛 This is debug info');
  
  return { message: 'Hello completed successfully!' };
}
```

Run with colors:
```bash
scriptit exec hello-colors.js
```

## Practical Examples

### 1. Build Script with Colored Output

```javascript
// build.js
export const description = "Build script with colored console output";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = require('fs');
  const path = require('path');

  console.info('🚀 Starting build process...');

  try {
    // Clean dist directory
    console.log('🧹 Cleaning dist directory');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist');

    // Copy files
    console.log('📁 Copying source files');
    const files = fs.readdirSync('src');
    files.forEach(file => {
      const srcPath = path.join('src', file);
      const distPath = path.join('dist', file);
      fs.copyFileSync(srcPath, distPath);
      console.debug(`Copied: ${file}`);
    });

    console.log('✅ Build completed successfully!');
    console.info(`📦 ${files.length} files processed`);
    
    return { success: true, filesProcessed: files.length };

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}
```

Run the build:
```bash
scriptit exec build.js
```

### 2. API Testing Script

```javascript
// api-test.js
export const description = "API testing script with colored output";

export async function execute(context) {
  const console = context.console || global.console;

  console.info('🌐 Starting API tests...');
  
  const endpoints = [
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://jsonplaceholder.typicode.com/users/1',
    'https://jsonplaceholder.typicode.com/comments?postId=1'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success (${response.status})`);
        console.debug('Response keys:', Object.keys(data));
        results.push({ endpoint, status: 'success', code: response.status });
      } else {
        console.warn(`⚠️ Warning: ${response.status} ${response.statusText}`);
        results.push({ endpoint, status: 'warning', code: response.status });
      }
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.push({ endpoint, status: 'error', error: error.message });
    }
  }
  
  console.info('🏁 API tests completed');
  return { results, totalTests: endpoints.length };
}
```

### 3. File Processing Script

```javascript
// process-files.js
export const description = "File processing script with statistics";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = require('fs');
  const path = require('path');

  // Get directory from context parameters or use current directory
  const directory = context.env.TARGET_DIR || '.';
  
  console.info(`📂 Processing files in: ${directory}`);
  
  try {
    const files = fs.readdirSync(directory);
    console.log(`Found ${files.length} files`);
    
    const stats = {
      total: 0,
      javascript: 0,
      typescript: 0,
      json: 0,
      other: 0
    };
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      stats.total++;
      
      switch (ext) {
        case '.js':
          stats.javascript++;
          console.debug(`📄 JavaScript: ${file}`);
          break;
        case '.ts':
          stats.typescript++;
          console.debug(`📘 TypeScript: ${file}`);
          break;
        case '.json':
          stats.json++;
          console.debug(`📋 JSON: ${file}`);
          break;
        default:
          stats.other++;
          console.debug(`📄 Other: ${file}`);
      }
    });
    
    console.log('📊 File Statistics:');
    console.info(`  JavaScript: ${stats.javascript}`);
    console.info(`  TypeScript: ${stats.typescript}`);
    console.info(`  JSON: ${stats.json}`);
    console.info(`  Other: ${stats.other}`);
    console.log(`  Total: ${stats.total}`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error processing files:', error.message);
    throw error;
  }
}
```

Run with environment variable:
```bash
TARGET_DIR=src scriptit exec process-files.js
```

### 4. Environment Configuration Script

```javascript
// setup-env.js
export const description = "Environment setup script";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = require('fs');

  console.info('⚙️ Setting up environment...');
  
  const environments = ['development', 'staging', 'production'];
  const created = [];
  
  environments.forEach(env => {
    const envFile = `.env.${env}`;
    
    if (fs.existsSync(envFile)) {
      console.log(`✅ Found: ${envFile}`);
    } else {
      console.warn(`⚠️ Missing: ${envFile}`);
      
      // Create template
      const template = `# ${env.toUpperCase()} Environment
NODE_ENV=${env}
API_URL=https://api.${env}.example.com
DEBUG=${env === 'development' ? 'true' : 'false'}
`;
      
      fs.writeFileSync(envFile, template);
      console.log(`📝 Created template: ${envFile}`);
      created.push(envFile);
    }
  });
  
  console.info('🎯 Environment setup completed');
  return { environmentsChecked: environments.length, filesCreated: created };
}
```

### 5. Data Validation Script

```javascript
// validate-data.js
export const description = "Data validation script with detailed reporting";

function validateUser(user) {
  const errors = [];
  
  if (!user.name || user.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!user.email || !user.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!user.age || user.age < 0 || user.age > 150) {
    errors.push('Age must be between 0 and 150');
  }
  
  return errors;
}

export async function execute(context) {
  const console = context.console || global.console;

  console.info('🔍 Starting data validation...');
  
  const users = [
    { name: 'John Doe', email: 'john@example.com', age: 30 },
    { name: 'J', email: 'invalid-email', age: -5 },
    { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { name: '', email: 'test@example.com', age: 200 }
  ];
  
  let validCount = 0;
  let invalidCount = 0;
  const validationResults = [];
  
  users.forEach((user, index) => {
    console.log(`👤 Validating user ${index + 1}: ${user.name || 'Unknown'}`);
    
    const errors = validateUser(user);
    
    if (errors.length === 0) {
      console.log('  ✅ Valid');
      validCount++;
      validationResults.push({ user, valid: true });
    } else {
      console.error('  ❌ Invalid:');
      errors.forEach(error => {
        console.warn(`    • ${error}`);
      });
      invalidCount++;
      validationResults.push({ user, valid: false, errors });
    }
  });
  
  console.info('📊 Validation Summary:');
  console.log(`  Valid users: ${validCount}`);
  console.error(`  Invalid users: ${invalidCount}`);
  console.log(`  Total processed: ${users.length}`);
  
  return {
    summary: { valid: validCount, invalid: invalidCount, total: users.length },
    results: validationResults
  };
}
```

## Library Usage Examples

### Basic Library Integration

```typescript
// lib-example.ts
import { createScriptRunner } from '@glyphtek/scriptit'

async function runScripts() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp',
    consoleInterception: {
      enabled: true,
      useColors: true
    }
  })

  // Execute a file
  const result = await runner.executeScript('hello-colors.js')
  console.log('Script result:', result)

  // Execute inline code (must have proper structure)
  await runner.executeCode(`
    export async function execute(context) {
      const console = context.console || global.console
      console.log('Running from library!')
      console.info('This will be colored blue')
      return { source: 'library' }
    }
  `)
}

runScripts()
```

### Event Handling

```typescript
// events-example.ts
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = createScriptRunner({
  consoleInterception: true
})

// Listen to events
runner.on('scriptStart', (scriptPath) => {
  console.log(`🚀 Starting: ${scriptPath}`)
})

runner.on('scriptEnd', (scriptPath, exitCode) => {
  if (exitCode === 0) {
    console.log(`✅ Completed: ${scriptPath}`)
  } else {
    console.error(`❌ Failed: ${scriptPath} (exit code: ${exitCode})`)
  }
})

runner.on('error', (error) => {
  console.error('💥 Error:', error.message)
})

// Execute script
await runner.executeScript('my-script.js')
```

## Running Examples

### CLI Examples

```bash
# Run a single script with colored console
scriptit exec example.js

# Specify runtime
scriptit exec example.js --runtime bun

# With environment variables
TARGET_DIR=src scriptit exec process-files.js

# Interactive TUI (browse and select scripts)
scriptit run
```

## Script Structure Requirements

**Important**: All ScriptIt scripts must export either:

1. **An `execute` function** (traditional pattern):
```javascript
export async function execute(context) {
  // Your script logic here
  return result; // optional
}
```

2. **A `default` function** (default export pattern):
```javascript
export default async function(context) {
  // Your script logic here
  return result; // optional
}
```

Scripts without these functions will fail with an error.

## Tips for Better Examples

### 1. Use Descriptive Console Messages

```javascript
// ✅ Good
export async function execute(context) {
  const console = context.console || global.console;
  console.info('🔄 Processing user data...');
  console.log('✅ User validation completed');
  console.error('❌ Database connection failed');
}

// ❌ Less helpful
export async function execute(context) {
  console.log('Processing...');
  console.log('Done');
  console.log('Error');
}
```

### 2. Include Context in Logs

```javascript
// ✅ Good
export async function execute(context) {
  const console = context.console || global.console;
  const orderId = context.env.ORDER_ID;
  const userId = context.env.USER_ID;
  
  console.log('Processing order:', orderId, 'for user:', userId);
  console.error('Payment failed for order:', orderId, 'error:', error.message);
}

// ❌ Less context
export async function execute(context) {
  console.log('Processing order');
  console.error('Payment failed');
}
```

### 3. Use Appropriate Log Levels

```javascript
// ✅ Good usage
export async function execute(context) {
  const console = context.console || global.console;
  
  console.debug('Variable state:', { user, order });  // Development info
  console.info('Cache updated successfully');         // System info
  console.log('User logged in:', username);          // General info
  console.warn('API rate limit approaching');        // Warnings
  console.error('Database connection lost');         // Errors
}

// ❌ Wrong levels
export async function execute(context) {
  console.error('User logged in');                   // Wrong level
  console.log('Critical system failure');           // Wrong level
}
```

## More Examples

- [CLI Examples](/examples/cli) - Command-line usage examples
- [Library Examples](/examples/library) - Programmatic usage examples
- [Real-World Use Cases](/examples/use-cases) - Production scenarios

## Contributing Examples

Have a great example to share? We'd love to include it! Please:

1. Create a clear, well-commented example
2. Include both the script and how to run it
3. Explain what the example demonstrates
4. Test it with colored console output
5. Ensure proper script structure (execute or default function)
6. Submit a pull request

Check our [Contributing Guide](https://github.com/glyphtek/scriptit/blob/main/CONTRIBUTING.md) for more details.