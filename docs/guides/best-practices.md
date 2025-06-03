# Best Practices

This guide covers best practices for developing, organizing, and maintaining ScriptIt scripts and projects. Following these practices will help you create reliable, maintainable, and performant automation solutions.

## Script Organization

### Directory Structure

Organize your scripts in a logical directory structure:

```
project/
├── scripts/
│   ├── data/
│   │   ├── backup-database.js
│   │   ├── migrate-users.js
│   │   └── cleanup-logs.js
│   ├── api/
│   │   ├── sync-external-data.js
│   │   └── health-check.js
│   ├── deployment/
│   │   ├── deploy-staging.js
│   │   └── rollback.js
│   └── utilities/
│       ├── send-notifications.js
│       └── generate-reports.js
├── config/
│   ├── scriptit.config.js
│   ├── .env.development
│   ├── .env.staging
│   └── .env.production
├── tests/
│   └── scripts/
└── docs/
    └── scripts/
```

### Naming Conventions

Use clear, descriptive names for your scripts:

```javascript
// ✅ Good - descriptive names
backup-database.js
sync-user-data.js
deploy-to-staging.js
cleanup-temp-files.js

// ❌ Avoid - vague names
script1.js
data.js
deploy.js
cleanup.js
```

### Script Categories

Group scripts by functionality:

- **Data Operations**: `data/backup-*.js`, `data/migrate-*.js`
- **API Integration**: `api/sync-*.js`, `api/webhook-*.js`
- **Deployment**: `deployment/deploy-*.js`, `deployment/rollback-*.js`
- **Maintenance**: `maintenance/cleanup-*.js`, `maintenance/health-*.js`
- **Utilities**: `utilities/notify-*.js`, `utilities/report-*.js`

## Code Quality

### Script Structure

Follow consistent script structure patterns:

```javascript
// ✅ Good - consistent structure
export const description = "Clear description of what this script does";

// Configuration at the top
const CONFIG = {
  timeout: parseInt(process.env.TIMEOUT || '30000'),
  retries: parseInt(process.env.RETRIES || '3'),
  batchSize: parseInt(process.env.BATCH_SIZE || '100')
};

// Helper functions
async function validateInput(data) {
  // Validation logic
}

async function processItem(item) {
  // Processing logic
}

// Main execution
export async function execute(context) {
  const console = context.console || global.console;
  
  try {
    // Main logic with proper error handling
    const result = await processData();
    return result;
  } catch (error) {
    console.error('Script failed:', error.message);
    throw error;
  }
}
```

### Error Handling

Implement comprehensive error handling:

```javascript
// ✅ Good - comprehensive error handling
export async function execute(context) {
  const console = context.console || global.console;
  const errors = [];
  let successCount = 0;
  
  try {
    const items = await fetchItems();
    
    for (const item of items) {
      try {
        await processItem(item);
        successCount++;
        console.log(`✅ Processed: ${item.id}`);
      } catch (error) {
        errors.push({ item: item.id, error: error.message });
        console.warn(`⚠️  Failed to process ${item.id}: ${error.message}`);
      }
    }
    
    // Report results
    console.info(`📊 Results: ${successCount}/${items.length} successful`);
    
    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} errors occurred`);
      // Don't throw if partial success is acceptable
      return { success: true, partial: true, errors };
    }
    
    return { success: true, processed: successCount };
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
    throw error;
  }
}
```

### Input Validation

Always validate inputs and environment variables:

```javascript
// ✅ Good - thorough validation
function validateEnvironment(env) {
  const required = ['API_KEY', 'DATABASE_URL'];
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate format
  if (!env.DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }
  
  return {
    apiKey: env.API_KEY,
    databaseUrl: env.DATABASE_URL,
    timeout: parseInt(env.TIMEOUT || '30000'),
    debug: env.DEBUG === 'true'
  };
}

export async function execute(context) {
  const console = context.console || global.console;
  
  // Validate environment
  const config = validateEnvironment(context.env);
  
  // Validate parameters
  if (!context.params.userId) {
    throw new Error('userId parameter is required');
  }
  
  const userId = parseInt(context.params.userId);
  if (isNaN(userId) || userId <= 0) {
    throw new Error('userId must be a positive number');
  }
  
  console.log(`✅ Validation passed for user: ${userId}`);
  
  // Continue with validated inputs
}
```

## Performance Optimization

### Efficient Data Processing

Use efficient patterns for data processing:

```javascript
// ✅ Good - efficient batch processing
export async function execute(context) {
  const console = context.console || global.console;
  const BATCH_SIZE = parseInt(context.env.BATCH_SIZE || '100');
  
  const items = await fetchAllItems();
  console.log(`Processing ${items.length} items in batches of ${BATCH_SIZE}`);
  
  // Process in batches to avoid memory issues
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    await Promise.all(batch.map(async (item) => {
      try {
        await processItem(item);
      } catch (error) {
        console.warn(`Failed to process item ${item.id}: ${error.message}`);
      }
    }));
    
    console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(items.length / BATCH_SIZE)}`);
    
    // Optional: Add delay between batches to avoid overwhelming APIs
    if (i + BATCH_SIZE < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

### Memory Management

Be mindful of memory usage:

```javascript
// ✅ Good - streaming large files
export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs');
  const readline = await import('readline');
  
  const inputFile = context.env.INPUT_FILE;
  const outputFile = `${context.tmpDir}/processed-${Date.now()}.json`;
  
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  const results = [];
  let lineCount = 0;
  
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      const processed = await processLine(data);
      results.push(processed);
      
      lineCount++;
      if (lineCount % 1000 === 0) {
        console.log(`Processed ${lineCount} lines`);
      }
      
      // Write results in chunks to avoid memory buildup
      if (results.length >= 100) {
        await appendToFile(outputFile, results);
        results.length = 0; // Clear array
      }
    } catch (error) {
      console.warn(`Error processing line ${lineCount}: ${error.message}`);
    }
  }
  
  // Write remaining results
  if (results.length > 0) {
    await appendToFile(outputFile, results);
  }
  
  console.log(`✅ Processed ${lineCount} lines, output: ${outputFile}`);
  return { lineCount, outputFile };
}
```

### Caching Strategies

Implement caching for expensive operations:

```javascript
// ✅ Good - caching expensive API calls
const cache = new Map();

async function fetchUserWithCache(userId) {
  if (cache.has(userId)) {
    return cache.get(userId);
  }
  
  const user = await fetchUser(userId);
  cache.set(userId, user);
  
  // Optional: Set cache expiration
  setTimeout(() => cache.delete(userId), 5 * 60 * 1000); // 5 minutes
  
  return user;
}

export async function execute(context) {
  const console = context.console || global.console;
  
  const userIds = await getUserIds();
  console.log(`Processing ${userIds.length} users`);
  
  for (const userId of userIds) {
    const user = await fetchUserWithCache(userId);
    await processUser(user);
  }
  
  console.log(`Cache hits: ${cache.size} users cached`);
}
```

## Security Best Practices

### Environment Variable Security

Handle sensitive data securely:

```javascript
// ✅ Good - secure environment handling
export async function execute(context) {
  const console = context.console || global.console;
  
  // Validate required secrets
  const apiKey = context.env.API_KEY;
  const dbPassword = context.env.DB_PASSWORD;
  
  if (!apiKey || !dbPassword) {
    throw new Error('Required secrets not provided');
  }
  
  // Never log sensitive values
  console.log('Configuration loaded');
  console.log(`API endpoint: ${context.env.API_ENDPOINT}`);
  console.log(`Database host: ${context.env.DB_HOST}`);
  // ❌ Never do: console.log(`API key: ${apiKey}`);
  
  // Use secrets safely
  const client = createApiClient({
    apiKey,
    endpoint: context.env.API_ENDPOINT
  });
  
  return { success: true };
}
```

### Input Sanitization

Sanitize and validate all inputs:

```javascript
// ✅ Good - input sanitization
function sanitizeFilename(filename) {
  // Remove dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function execute(context) {
  const console = context.console || global.console;
  
  // Sanitize file paths
  const filename = sanitizeFilename(context.params.filename || 'output');
  const outputPath = `${context.tmpDir}/${filename}.json`;
  
  // Validate email inputs
  const emails = context.params.emails || [];
  const validEmails = emails.filter(email => {
    if (!validateEmail(email)) {
      console.warn(`Invalid email skipped: ${email}`);
      return false;
    }
    return true;
  });
  
  console.log(`Processing ${validEmails.length} valid emails`);
  
  return { outputPath, processedEmails: validEmails.length };
}
```

### File System Security

Handle file operations securely:

```javascript
// ✅ Good - secure file operations
export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const inputDir = context.env.INPUT_DIR;
  
  // Validate input directory is within allowed paths
  const allowedPaths = ['/tmp', '/var/data', context.tmpDir];
  const isAllowed = allowedPaths.some(allowed => 
    path.resolve(inputDir).startsWith(path.resolve(allowed))
  );
  
  if (!isAllowed) {
    throw new Error(`Input directory not in allowed paths: ${inputDir}`);
  }
  
  // Use path.join to prevent directory traversal
  const files = await fs.readdir(inputDir);
  
  for (const file of files) {
    // Validate filename
    if (file.includes('..') || file.startsWith('.')) {
      console.warn(`Skipping suspicious file: ${file}`);
      continue;
    }
    
    const filePath = path.join(inputDir, file);
    await processFile(filePath);
  }
}
```

## Testing and Validation

### Unit Testing Scripts

Create testable scripts:

```javascript
// processUsers.js - Testable script structure
export async function processUsers(users, config = {}) {
  const results = [];
  const errors = [];
  
  for (const user of users) {
    try {
      const processed = await processUser(user, config);
      results.push(processed);
    } catch (error) {
      errors.push({ user: user.id, error: error.message });
    }
  }
  
  return { results, errors };
}

export async function execute(context) {
  const console = context.console || global.console;
  
  const users = await fetchUsers();
  const config = {
    timeout: parseInt(context.env.TIMEOUT || '5000'),
    retries: parseInt(context.env.RETRIES || '3')
  };
  
  const { results, errors } = await processUsers(users, config);
  
  console.log(`Processed ${results.length} users`);
  if (errors.length > 0) {
    console.warn(`${errors.length} errors occurred`);
  }
  
  return { results, errors };
}
```

```javascript
// processUsers.test.js
import { describe, test, expect } from 'bun:test';
import { processUsers } from './processUsers.js';

describe('processUsers', () => {
  test('should process valid users', async () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];
    
    const result = await processUsers(users);
    
    expect(result.results).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });
  
  test('should handle invalid users gracefully', async () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob' } // Missing email
    ];
    
    const result = await processUsers(users);
    
    expect(result.results).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].user).toBe(2);
  });
});
```

### Integration Testing

Test scripts in realistic environments:

```javascript
// integration.test.js
import { createScriptRunner } from '@glyphtek/scriptit';
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

describe('Script Integration Tests', () => {
  let runner;
  let testEnv;
  
  beforeAll(async () => {
    // Setup test environment
    testEnv = {
      NODE_ENV: 'test',
      API_KEY: 'test-key',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test'
    };
    
    runner = await createScriptRunner({
      scriptsDir: './scripts',
      tmpDir: './tmp/test',
      consoleInterception: { enabled: true }
    });
  });
  
  test('should execute data processing script', async () => {
    const result = await runner.executeScript('data/process-users.js', {
      env: testEnv,
      params: { batchSize: 10 }
    });
    
    expect(result.success).toBe(true);
    expect(result.processed).toBeGreaterThan(0);
  });
  
  test('should handle missing environment variables', async () => {
    await expect(
      runner.executeScript('api/sync-data.js', {
        env: { NODE_ENV: 'test' }, // Missing API_KEY
        params: {}
      })
    ).rejects.toThrow('API_KEY');
  });
});
```

### Validation Scripts

Create scripts to validate your environment:

```javascript
// validate-environment.js
export const description = "Validate environment configuration";

export async function execute(context) {
  const console = context.console || global.console;
  const issues = [];
  
  console.info('🔍 Validating environment...');
  
  // Check required environment variables
  const required = ['API_KEY', 'DATABASE_URL', 'REDIS_URL'];
  for (const key of required) {
    if (!context.env[key]) {
      issues.push(`Missing environment variable: ${key}`);
    }
  }
  
  // Check file permissions
  const fs = await import('fs/promises');
  try {
    await fs.access(context.tmpDir, fs.constants.W_OK);
    console.log('✅ Temp directory writable');
  } catch (error) {
    issues.push(`Temp directory not writable: ${context.tmpDir}`);
  }
  
  // Check network connectivity
  try {
    const response = await fetch('https://api.github.com/zen', {
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) {
      console.log('✅ Network connectivity OK');
    } else {
      issues.push(`Network connectivity issue: HTTP ${response.status}`);
    }
  } catch (error) {
    issues.push(`Network connectivity failed: ${error.message}`);
  }
  
  // Report results
  if (issues.length === 0) {
    console.log('✅ Environment validation passed');
    return { valid: true };
  } else {
    console.error('❌ Environment validation failed:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    return { valid: false, issues };
  }
}
```

## Deployment and Production

### Environment Management

Use proper environment configuration:

```javascript
// scriptit.config.js
const config = {
  scriptsDir: 'scripts',
  tmpDir: process.env.NODE_ENV === 'production' ? '/tmp/scriptit' : './tmp',
  
  // Environment-specific settings
  envFiles: [
    '.env',
    `.env.${process.env.NODE_ENV}`,
    '.env.local'
  ],
  
  defaultParams: {
    appName: process.env.APP_NAME || 'ScriptIt App',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Production optimizations
  consoleInterception: {
    enabled: process.env.NODE_ENV !== 'production'
  }
};

export default config;
```

### Monitoring and Logging

Implement proper monitoring:

```javascript
// monitored-script.js
export const description = "Script with comprehensive monitoring";

export async function execute(context) {
  const console = context.console || global.console;
  const startTime = Date.now();
  
  // Log execution start
  console.info('📊 Script execution started', {
    script: 'monitored-script.js',
    timestamp: new Date().toISOString(),
    environment: context.env.NODE_ENV,
    params: context.params
  });
  
  try {
    // Your script logic here
    const result = await performWork();
    
    // Log success metrics
    const duration = Date.now() - startTime;
    console.info('✅ Script execution completed', {
      duration: `${duration}ms`,
      result: result.summary,
      timestamp: new Date().toISOString()
    });
    
    return result;
    
  } catch (error) {
    // Log error metrics
    const duration = Date.now() - startTime;
    console.error('❌ Script execution failed', {
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Send alert in production
    if (context.env.NODE_ENV === 'production') {
      await sendAlert({
        script: 'monitored-script.js',
        error: error.message,
        environment: context.env.NODE_ENV
      });
    }
    
    throw error;
  }
}

async function sendAlert(details) {
  // Implementation depends on your alerting system
  // Slack, email, PagerDuty, etc.
}
```

### Graceful Degradation

Handle failures gracefully:

```javascript
// resilient-script.js
export async function execute(context) {
  const console = context.console || global.console;
  const results = {
    primary: null,
    fallback: null,
    success: false,
    warnings: []
  };
  
  try {
    // Try primary approach
    results.primary = await primaryOperation();
    results.success = true;
    console.log('✅ Primary operation successful');
    
  } catch (primaryError) {
    console.warn('⚠️  Primary operation failed:', primaryError.message);
    results.warnings.push(`Primary failed: ${primaryError.message}`);
    
    try {
      // Try fallback approach
      results.fallback = await fallbackOperation();
      results.success = true;
      console.log('✅ Fallback operation successful');
      
    } catch (fallbackError) {
      console.error('❌ Both primary and fallback failed');
      results.warnings.push(`Fallback failed: ${fallbackError.message}`);
      
      // Try minimal operation
      try {
        await minimalOperation();
        results.success = true;
        console.log('✅ Minimal operation completed');
      } catch (minimalError) {
        console.error('❌ All operations failed');
        throw new Error('All operation attempts failed');
      }
    }
  }
  
  return results;
}
```

## Maintenance and Documentation

### Script Documentation

Document your scripts thoroughly:

```javascript
/**
 * User Data Synchronization Script
 * 
 * This script synchronizes user data between our internal database
 * and external CRM system. It handles incremental updates and
 * maintains data consistency.
 * 
 * Environment Variables:
 * - API_KEY: CRM API authentication key (required)
 * - CRM_ENDPOINT: CRM API endpoint URL (required)
 * - BATCH_SIZE: Number of users to process per batch (default: 100)
 * - DRY_RUN: Set to 'true' to simulate without making changes
 * 
 * Parameters:
 * - since: ISO date string for incremental sync (optional)
 * - userIds: Array of specific user IDs to sync (optional)
 * 
 * Returns:
 * - synced: Number of users successfully synchronized
 * - errors: Array of synchronization errors
 * - duration: Execution time in milliseconds
 * 
 * Example Usage:
 * scriptit exec sync-users.js --env DRY_RUN=true
 * scriptit exec sync-users.js --param since=2024-01-01T00:00:00Z
 */

export const description = "Synchronize user data with external CRM";

export async function execute(context) {
  // Implementation...
}
```

### Version Control

Use proper version control practices:

```bash
# .gitignore
node_modules/
tmp/
.env*
!.env.example
*.log
coverage/
dist/

# Include example environment file
.env.example
```

```bash
# .env.example
# Copy to .env and fill in actual values

# API Configuration
API_KEY=your_api_key_here
API_ENDPOINT=https://api.example.com

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Script Configuration
BATCH_SIZE=100
TIMEOUT=30000
DRY_RUN=false
```

### Change Management

Track changes and maintain compatibility:

```javascript
// migration-script.js
export const description = "Database migration with rollback support";

const MIGRATION_VERSION = '2024.01.15.001';

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info(`🔄 Running migration: ${MIGRATION_VERSION}`);
  
  // Check if migration already applied
  const applied = await checkMigrationApplied(MIGRATION_VERSION);
  if (applied) {
    console.log('✅ Migration already applied, skipping');
    return { skipped: true, version: MIGRATION_VERSION };
  }
  
  // Create rollback point
  const rollbackData = await createRollbackPoint();
  
  try {
    // Apply migration
    await applyMigration();
    
    // Record successful migration
    await recordMigration(MIGRATION_VERSION);
    
    console.log('✅ Migration completed successfully');
    return { success: true, version: MIGRATION_VERSION };
    
  } catch (error) {
    console.error('❌ Migration failed, initiating rollback');
    
    try {
      await rollback(rollbackData);
      console.log('✅ Rollback completed');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError.message);
    }
    
    throw error;
  }
}
```

## Related Documentation

- [Writing Scripts](/guides/writing-scripts) - Basic script structure and patterns
- [TypeScript Guide](/guides/typescript) - TypeScript-specific best practices
- [CLI Configuration](/cli/configuration) - Configuration best practices
- [Library API](/library/api) - Programmatic usage patterns
- [Cross-Runtime Support](/features/cross-runtime) - Runtime-specific optimizations 