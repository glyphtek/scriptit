# ScriptIt Library Example

This example demonstrates how to use **ScriptIt** as a library for programmatic script execution in your Node.js/TypeScript applications.

## Overview

This example shows how to:
- Initialize a script runner instance programmatically
- Configure scripts directory, temp directory, and exclude patterns
- List available scripts
- Execute scripts with custom parameters and environment variables
- Handle script execution events
- Manage the complete script lifecycle

## Structure

```
examples/lib/
├── package.json         # Project configuration
├── src/
│   └── index.ts         # Main library example
├── scripts/             # Example scripts (auto-created)
│   ├── example.ts       # Simple script example
│   └── data-processor.ts # Complex script with lifecycle
├── tmp/                 # Temporary files directory
└── env.example          # Example environment variables
```

## Getting Started

### 1. Install Dependencies

Navigate to this directory and install dependencies:
```bash
cd examples/lib
bun install
```

### 2. Set Up Environment

Copy the example environment file:
```bash
cp env.example .env
```

### 3. Run the Example

Execute the library example:
```bash
bun start
```

Or run in development mode with auto-reload:
```bash
bun dev
```

## What the Example Demonstrates

This example shows how to:

1. **Initialize ScriptIt programmatically** with custom configuration
2. **Auto-generate example scripts** for testing
3. **Execute scripts programmatically** with custom parameters
4. **Handle events** during script execution
5. **Use both traditional and lambda-style scripts**
6. **Manage environment variables and configuration**

## Key Features Showcased

### Script Auto-Generation
The example automatically creates sample scripts to demonstrate different patterns:
- Traditional scripts with `tearUp`, `execute`, and `tearDown` lifecycle
- Lambda-style scripts with default exports
- Data processing workflows

### Event Handling
```typescript
runner.on('script:beforeExecute', (scriptPath, params) => {
  console.log(`🔄 About to execute: ${path.basename(scriptPath)}`);
});

runner.on('script:afterExecute', (scriptPath, result) => {
  console.log(`✅ Completed: ${path.basename(scriptPath)}`);
});
```

## Example Scripts

The example automatically creates two demonstration scripts:

### example.ts
- Simple script showing basic parameter and environment access
- Demonstrates return values
- Shows logging capabilities

### data-processor.ts
- Complex script with full tearUp/execute/tearDown lifecycle
- File operations and data processing
- Temporary file management
- Error handling

## Integration Patterns

### Web Application Integration

```typescript
// Express.js example
app.post('/api/scripts/:scriptName', async (req, res) => {
  try {
    const result = await runner.executeScript(req.params.scriptName, {
      params: req.body.params,
      env: req.body.env,
    });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Background Job Processing

```typescript
// Queue job processor
async function processJob(job) {
  const result = await runner.executeScript(job.scriptName, {
    params: job.data,
    env: { JOB_ID: job.id },
  });
  
  await updateJobStatus(job.id, 'completed', result);
}
```

### Scheduled Tasks

```typescript
// Cron job example
import cron from 'node-cron';

cron.schedule('0 2 * * *', async () => {
  await runner.executeScript('daily-backup.ts');
});
```

## Building and Distribution

Build the example for production:
```bash
bun run build
```

This creates a `dist/` directory with compiled JavaScript that can be deployed to any Node.js environment.

## Next Steps

- Modify `src/index.ts` to experiment with different configurations
- Create your own scripts in the `scripts/` directory
- Try integrating ScriptIt into your existing applications
- Explore the TUI example in `../ui/` for interactive usage

## API Reference

For complete API documentation, see the main project README and TypeScript definitions in the `src/` directory of the parent project. 