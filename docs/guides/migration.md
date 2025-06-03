# Migration Guide

This guide helps you migrate between different versions of ScriptIt, understand breaking changes, and maintain compatibility across upgrades.

## Version Compatibility

### Current Version Support

ScriptIt follows semantic versioning (SemVer) with the following support policy:

- **Major versions** (1.x → 2.x): Breaking changes, migration required
- **Minor versions** (1.1 → 1.2): New features, backward compatible
- **Patch versions** (1.1.1 → 1.1.2): Bug fixes, fully compatible

### Supported Versions

| Version | Status | Support Level | End of Life |
|---------|--------|---------------|-------------|
| 2.x | ✅ Current | Full support | - |
| 1.x | 🟡 Maintenance | Security fixes only | 2025-12-31 |
| 0.x | ❌ Deprecated | No support | 2024-06-30 |

## Migration Strategies

### 1. Gradual Migration

Migrate scripts incrementally to minimize risk:

```bash
# Step 1: Install new version alongside old
npm install @glyphtek/scriptit@latest --save-dev

# Step 2: Test individual scripts
scriptit exec test-script.js --runtime=node

# Step 3: Migrate configuration
cp scriptit.config.js scriptit.config.js.backup
# Update configuration file

# Step 4: Update scripts one by one
# Step 5: Remove old version when complete
```

### 2. Parallel Environment

Run both versions side by side during transition:

```javascript
// package.json
{
  "scripts": {
    "scriptit-old": "scriptit-v1 exec",
    "scriptit-new": "scriptit exec",
    "migrate-test": "npm run scriptit-new -- test-script.js"
  },
  "dependencies": {
    "@glyphtek/scriptit": "^2.0.0"
  },
  "devDependencies": {
    "@glyphtek/scriptit-v1": "npm:@glyphtek/scriptit@^1.0.0"
  }
}
```

### 3. Feature Flag Migration

Use environment variables to control migration:

```javascript
// scriptit.config.js
const useV2Features = process.env.SCRIPTIT_V2 === 'true';

export default {
  scriptsDir: 'scripts',
  
  // V2 features
  ...(useV2Features && {
    consoleInterception: { enabled: true },
    eventSystem: { enabled: true }
  }),
  
  // Legacy compatibility
  ...(!useV2Features && {
    legacyMode: true
  })
};
```

## Version-Specific Migration Guides

### Migrating from 1.x to 2.x

#### Breaking Changes

1. **Configuration File Format**
2. **Script Context Object**
3. **CLI Command Changes**
4. **Runtime Detection**

#### Configuration Migration

**Old format (1.x):**
```javascript
// scriptit.config.js (v1)
module.exports = {
  scriptsPath: './scripts',
  tempPath: './tmp',
  defaultRuntime: 'node',
  colors: true
};
```

**New format (2.x):**
```javascript
// scriptit.config.js (v2)
export default {
  scriptsDir: './scripts',  // renamed from scriptsPath
  tmpDir: './tmp',          // renamed from tempPath
  consoleInterception: {    // replaces colors
    enabled: true
  }
};
```

**Migration script:**
```javascript
// migrate-config.js
export const description = "Migrate v1 config to v2 format";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const configPath = './scriptit.config.js';
  
  try {
    // Read old config
    const oldConfig = await import(path.resolve(configPath));
    const config = oldConfig.default || oldConfig;
    
    // Convert to new format
    const newConfig = {
      scriptsDir: config.scriptsPath || './scripts',
      tmpDir: config.tempPath || './tmp',
      consoleInterception: {
        enabled: config.colors !== false
      }
    };
    
    // Write new config
    const configContent = `export default ${JSON.stringify(newConfig, null, 2)};`;
    await fs.writeFile(configPath, configContent);
    
    console.log('✅ Configuration migrated to v2 format');
    return { migrated: true, newConfig };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}
```

#### Script Context Migration

**Old context (1.x):**
```javascript
// v1 script
export async function execute(context) {
  const { env, tmpPath, params } = context;
  
  console.log('Environment:', env.NODE_ENV);
  console.log('Temp path:', tmpPath);
}
```

**New context (2.x):**
```javascript
// v2 script
export async function execute(context) {
  const console = context.console || global.console;  // New: colored console
  const { env, tmpDir, params, log, configPath } = context;  // tmpDir renamed, new properties
  
  console.log('Environment:', env.NODE_ENV);
  console.log('Temp directory:', tmpDir);  // renamed from tmpPath
  context.log('Execution log');             // new logging method
}
```

**Compatibility wrapper:**
```javascript
// compatibility-wrapper.js
export function wrapV1Script(v1Execute) {
  return async function execute(context) {
    // Create v1-compatible context
    const v1Context = {
      ...context,
      tmpPath: context.tmpDir  // Map new property to old name
    };
    
    return await v1Execute(v1Context);
  };
}

// Usage in migrated script
import { wrapV1Script } from './compatibility-wrapper.js';

async function v1Execute(context) {
  // Original v1 script logic
  console.log('Temp path:', context.tmpPath);
}

export const execute = wrapV1Script(v1Execute);
```

#### CLI Command Migration

**Old commands (1.x):**
```bash
# v1 commands
scriptit run script.js
scriptit list
scriptit tui
```

**New commands (2.x):**
```bash
# v2 commands
scriptit exec script.js    # renamed from 'run'
scriptit list             # unchanged
scriptit run              # now launches TUI (renamed from 'tui')
```

**Migration aliases:**
```bash
# Add to package.json scripts for compatibility
{
  "scripts": {
    "scriptit-run": "scriptit exec",  # v1 compatibility
    "scriptit-tui": "scriptit run"    # v1 compatibility
  }
}
```

### Migrating from 0.x to 1.x

#### Major Changes

1. **Module System**: CommonJS → ES Modules
2. **Script Structure**: Function exports → Named exports
3. **Configuration**: JSON → JavaScript

#### Module System Migration

**Old format (0.x):**
```javascript
// script.js (v0)
module.exports = async function(context) {
  console.log('Hello from v0');
  return { success: true };
};
```

**New format (1.x+):**
```javascript
// script.js (v1+)
export const description = "Migrated from v0";

export async function execute(context) {
  const console = context.console || global.console;
  console.log('Hello from v1+');
  return { success: true };
}
```

**Automated migration script:**
```javascript
// migrate-v0-scripts.js
export const description = "Migrate v0 scripts to v1+ format";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const path = await import('path');
  const glob = await import('glob');
  
  const scriptsDir = context.env.SCRIPTS_DIR || './scripts';
  const scriptFiles = glob.sync(`${scriptsDir}/**/*.js`);
  
  console.log(`Found ${scriptFiles.length} script files to migrate`);
  
  for (const filePath of scriptFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check if it's a v0 script
      if (content.includes('module.exports') && !content.includes('export')) {
        const migrated = migrateV0Script(content);
        
        // Backup original
        await fs.writeFile(`${filePath}.v0.backup`, content);
        
        // Write migrated version
        await fs.writeFile(filePath, migrated);
        
        console.log(`✅ Migrated: ${filePath}`);
      } else {
        console.log(`⏭️  Skipped: ${filePath} (already migrated)`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate ${filePath}:`, error.message);
    }
  }
  
  return { migrated: scriptFiles.length };
}

function migrateV0Script(content) {
  // Simple regex-based migration (enhance as needed)
  let migrated = content
    .replace(/module\.exports\s*=\s*async\s+function\s*\([^)]*\)\s*{/, 
             'export const description = "Migrated from v0";\n\nexport async function execute(context) {\n  const console = context.console || global.console;')
    .replace(/module\.exports\s*=\s*function\s*\([^)]*\)\s*{/, 
             'export const description = "Migrated from v0";\n\nexport function execute(context) {\n  const console = context.console || global.console;');
  
  return migrated;
}
```

## Compatibility Patterns

### Backward Compatibility Layer

Create a compatibility layer for gradual migration:

```javascript
// compatibility.js
export function createCompatibilityLayer(version) {
  switch (version) {
    case '1.x':
      return {
        wrapContext: (context) => ({
          ...context,
          tmpPath: context.tmpDir  // v1 compatibility
        }),
        
        wrapScript: (script) => async (context) => {
          const wrappedContext = this.wrapContext(context);
          return await script(wrappedContext);
        }
      };
      
    case '0.x':
      return {
        wrapScript: (script) => async (context) => {
          // Convert v0 module.exports to v1+ execute function
          if (typeof script === 'function') {
            return await script(context);
          }
          throw new Error('Invalid v0 script format');
        }
      };
      
    default:
      throw new Error(`Unsupported version: ${version}`);
  }
}
```

### Feature Detection

Detect available features for cross-version compatibility:

```javascript
// feature-detection.js
export function detectFeatures() {
  const features = {
    coloredConsole: false,
    eventSystem: false,
    tuiSupport: false,
    lifecycleHooks: false
  };
  
  try {
    // Test for colored console
    if (typeof process !== 'undefined' && process.stdout?.isTTY) {
      features.coloredConsole = true;
    }
    
    // Test for event system (v2+)
    const { createScriptRunner } = await import('@glyphtek/scriptit');
    const runner = await createScriptRunner({});
    if (typeof runner.on === 'function') {
      features.eventSystem = true;
    }
    
    // Test for TUI support
    if (typeof runner.runTUI === 'function') {
      features.tuiSupport = true;
    }
    
    // Test for lifecycle hooks
    features.lifecycleHooks = true; // Available in all versions
    
  } catch (error) {
    // Feature not available
  }
  
  return features;
}

// Usage in scripts
export async function execute(context) {
  const console = context.console || global.console;
  const features = await detectFeatures();
  
  if (features.coloredConsole) {
    console.info('Using colored console output');
  } else {
    console.log('Using standard console output');
  }
  
  return { features };
}
```

### Version-Agnostic Scripts

Write scripts that work across multiple versions:

```javascript
// version-agnostic.js
export const description = "Script that works across ScriptIt versions";

export async function execute(context) {
  // Safe console access (works in all versions)
  const console = context.console || global.console;
  
  // Safe temp directory access
  const tmpDir = context.tmpDir || context.tmpPath || './tmp';
  
  // Safe environment access
  const env = context.env || process.env;
  
  // Safe parameter access
  const params = context.params || {};
  
  // Safe logging (v2+ feature with fallback)
  const log = context.log || console.log;
  
  console.log('Script running on ScriptIt');
  log('Execution started');
  
  // Feature-specific code
  if (context.configPath) {
    console.log(`Config loaded from: ${context.configPath}`);
  }
  
  return {
    version: 'agnostic',
    tmpDir,
    hasConfigPath: !!context.configPath
  };
}
```

## Testing Migration

### Migration Test Suite

Create comprehensive tests for migration:

```javascript
// migration.test.js
import { describe, test, expect, beforeAll } from 'bun:test';
import { createScriptRunner } from '@glyphtek/scriptit';

describe('Migration Tests', () => {
  let runner;
  
  beforeAll(async () => {
    runner = await createScriptRunner({
      scriptsDir: './test-scripts',
      tmpDir: './tmp/migration-test'
    });
  });
  
  test('should run v1 migrated script', async () => {
    const result = await runner.executeScript('migrated-v1-script.js');
    expect(result.success).toBe(true);
  });
  
  test('should handle v0 compatibility wrapper', async () => {
    const result = await runner.executeScript('v0-wrapped-script.js');
    expect(result.success).toBe(true);
  });
  
  test('should work with version-agnostic script', async () => {
    const result = await runner.executeScript('version-agnostic.js');
    expect(result.version).toBe('agnostic');
  });
});
```

### Validation Scripts

Create scripts to validate migration success:

```javascript
// validate-migration.js
export const description = "Validate migration from previous version";

export async function execute(context) {
  const console = context.console || global.console;
  const issues = [];
  
  console.info('🔍 Validating migration...');
  
  // Check configuration format
  try {
    if (context.configPath) {
      const config = await import(context.configPath);
      if (config.scriptsPath) {
        issues.push('Configuration still uses old "scriptsPath" property');
      }
      if (config.tempPath) {
        issues.push('Configuration still uses old "tempPath" property');
      }
    }
  } catch (error) {
    issues.push(`Configuration validation failed: ${error.message}`);
  }
  
  // Check script structure
  const fs = await import('fs/promises');
  const glob = await import('glob');
  
  try {
    const scriptFiles = glob.sync('./scripts/**/*.js');
    
    for (const file of scriptFiles) {
      const content = await fs.readFile(file, 'utf8');
      
      if (content.includes('module.exports')) {
        issues.push(`Script ${file} still uses CommonJS exports`);
      }
      
      if (!content.includes('export') && !content.includes('//')) {
        issues.push(`Script ${file} may not have proper exports`);
      }
    }
  } catch (error) {
    issues.push(`Script validation failed: ${error.message}`);
  }
  
  // Report results
  if (issues.length === 0) {
    console.log('✅ Migration validation passed');
    return { valid: true };
  } else {
    console.warn('⚠️  Migration validation found issues:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
    return { valid: false, issues };
  }
}
```

## Rollback Procedures

### Automated Rollback

Create rollback scripts for failed migrations:

```javascript
// rollback-migration.js
export const description = "Rollback failed migration";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const glob = await import('glob');
  
  console.info('🔄 Starting migration rollback...');
  
  // Restore configuration backup
  try {
    const configBackup = './scriptit.config.js.backup';
    const configExists = await fs.access(configBackup).then(() => true).catch(() => false);
    
    if (configExists) {
      await fs.copyFile(configBackup, './scriptit.config.js');
      console.log('✅ Configuration restored from backup');
    }
  } catch (error) {
    console.warn('⚠️  Could not restore configuration:', error.message);
  }
  
  // Restore script backups
  const backupFiles = glob.sync('./scripts/**/*.v0.backup');
  let restoredCount = 0;
  
  for (const backupFile of backupFiles) {
    try {
      const originalFile = backupFile.replace('.v0.backup', '');
      await fs.copyFile(backupFile, originalFile);
      restoredCount++;
    } catch (error) {
      console.warn(`⚠️  Could not restore ${backupFile}:`, error.message);
    }
  }
  
  console.log(`✅ Restored ${restoredCount} script files`);
  
  // Downgrade package version
  console.info('📦 To complete rollback, run:');
  console.info('npm install @glyphtek/scriptit@<previous-version>');
  
  return { 
    configRestored: true, 
    scriptsRestored: restoredCount,
    backupFiles: backupFiles.length
  };
}
```

### Manual Rollback Steps

1. **Stop all ScriptIt processes**
2. **Restore configuration backup**
3. **Restore script backups**
4. **Downgrade package version**
5. **Validate rollback**

```bash
# Manual rollback commands
cp scriptit.config.js.backup scriptit.config.js
find scripts -name "*.backup" -exec sh -c 'cp "$1" "${1%.backup}"' _ {} \;
npm install @glyphtek/scriptit@1.0.0
scriptit exec validate-rollback.js
```

## Best Practices for Migration

### 1. Always Backup

```bash
# Create comprehensive backup before migration
tar -czf scriptit-backup-$(date +%Y%m%d).tar.gz \
  scripts/ \
  scriptit.config.js \
  package.json \
  .env*
```

### 2. Test in Staging

```bash
# Test migration in staging environment first
NODE_ENV=staging scriptit exec validate-migration.js
NODE_ENV=staging npm test
```

### 3. Gradual Rollout

```javascript
// Feature flag for gradual migration
const MIGRATION_PERCENTAGE = parseInt(process.env.MIGRATION_PERCENTAGE || '0');

export async function execute(context) {
  const useNewFeature = Math.random() * 100 < MIGRATION_PERCENTAGE;
  
  if (useNewFeature) {
    return await newImplementation(context);
  } else {
    return await legacyImplementation(context);
  }
}
```

### 4. Monitor After Migration

```javascript
// monitoring-script.js
export async function execute(context) {
  const console = context.console || global.console;
  
  // Monitor key metrics after migration
  const metrics = {
    scriptExecutions: 0,
    errors: 0,
    performance: []
  };
  
  // Implementation...
  
  console.log('📊 Post-migration metrics:', metrics);
  return metrics;
}
```

## Getting Help

### Migration Support

- **Documentation**: Check version-specific documentation
- **Community**: Join ScriptIt community forums
- **Issues**: Report migration issues on GitHub
- **Professional Support**: Contact for enterprise migration assistance

### Common Migration Issues

1. **Configuration format errors**
2. **Script export format incompatibility**
3. **Runtime detection changes**
4. **Dependency version conflicts**

### Migration Checklist

- [ ] Backup current installation
- [ ] Read migration guide for your version
- [ ] Test migration in staging
- [ ] Update configuration files
- [ ] Migrate scripts incrementally
- [ ] Run validation tests
- [ ] Monitor post-migration
- [ ] Document any custom changes

## Related Documentation

- [Installation](/installation) - Installing specific versions
- [Configuration](/cli/configuration) - Configuration file formats
- [Writing Scripts](/guides/writing-scripts) - Current script structure
- [Best Practices](/guides/best-practices) - Migration best practices
- [CLI Commands](/cli/commands) - Current command reference 