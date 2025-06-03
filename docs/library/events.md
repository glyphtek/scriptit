# Event System

ScriptIt provides a comprehensive event system that allows you to monitor and react to script execution lifecycle events. This enables powerful integrations, logging, monitoring, and workflow automation.

## Overview

The event system is built on Node.js EventEmitter and provides type-safe event handling for all script execution phases. Events are emitted automatically during script execution and TUI operations.

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

// Listen to events
runner.on('script:beforeExecute', (scriptPath, params) => {
  console.log(`Starting: ${scriptPath}`)
})

runner.on('script:afterExecute', (scriptPath, result) => {
  console.log(`Completed: ${scriptPath}`)
})

// Execute script - events will be fired automatically
await runner.executeScript('my-script.js')
```

## Available Events

### Script Execution Events

#### `script:beforeExecute`

Fired before a script starts execution.

```typescript
runner.on('script:beforeExecute', (scriptPath: string, params: Record<string, unknown>) => {
  // Handle before execution
})
```

**Parameters:**
- `scriptPath` - Absolute path to the script being executed
- `params` - Execution parameters passed to the script

**Use Cases:**
- Logging script start times
- Validating parameters
- Setting up monitoring
- Preparing resources

#### `script:afterExecute`

Fired after a script completes successfully.

```typescript
runner.on('script:afterExecute', (scriptPath: string, result: ScriptExecutionResult) => {
  // Handle successful completion
})
```

**Parameters:**
- `scriptPath` - Absolute path to the executed script
- `result` - Result returned by the script

**Use Cases:**
- Logging completion status
- Processing script results
- Triggering follow-up actions
- Updating metrics

#### `script:error`

Fired when a script execution fails.

```typescript
runner.on('script:error', (scriptPath: string, error: unknown) => {
  // Handle execution error
})
```

**Parameters:**
- `scriptPath` - Absolute path to the failed script
- `error` - Error object or message

**Use Cases:**
- Error logging and reporting
- Alerting systems
- Retry logic
- Cleanup operations

#### `script:log`

Fired when a script logs a message (when using custom logger).

```typescript
runner.on('script:log', (scriptPath: string, message: string) => {
  // Handle log message
})
```

**Parameters:**
- `scriptPath` - Absolute path to the script that logged
- `message` - Log message content

**Use Cases:**
- Centralized logging
- Real-time monitoring
- Debug information collection
- Log aggregation

### TUI Events

#### `tui:beforeStart`

Fired before the Terminal UI starts.

```typescript
runner.on('tui:beforeStart', () => {
  // Handle TUI startup
})
```

**Use Cases:**
- Preparing TUI environment
- Loading initial data
- Setting up monitoring
- Initializing resources

#### `tui:afterEnd`

Fired after the Terminal UI ends.

```typescript
runner.on('tui:afterEnd', () => {
  // Handle TUI shutdown
})
```

**Use Cases:**
- Cleanup operations
- Saving state
- Generating reports
- Resource cleanup

## Event Handler Types

### `ScriptEventHandler`

Complete type definition for all event handlers:

```typescript
type ScriptEventHandler = {
  'script:beforeExecute': (scriptPath: string, params: Record<string, unknown>) => void;
  'script:afterExecute': (scriptPath: string, result: ScriptExecutionResult) => void;
  'script:error': (scriptPath: string, error: unknown) => void;
  'script:log': (scriptPath: string, message: string) => void;
  'tui:beforeStart': () => void;
  'tui:afterEnd': () => void;
};
```

## Event Methods

### `on(eventName, listener)`

Register an event listener.

```typescript
runner.on<K extends keyof ScriptEventHandler>(
  eventName: K,
  listener: ScriptEventHandler[K]
): ScriptRunnerInstance
```

**Returns:** The script runner instance for method chaining.

### `off(eventName, listener)`

Remove an event listener.

```typescript
runner.off<K extends keyof ScriptEventHandler>(
  eventName: K,
  listener: ScriptEventHandler[K]
): ScriptRunnerInstance
```

**Returns:** The script runner instance for method chaining.

### `emit(eventName, ...args)`

Emit an event manually (primarily for internal use).

```typescript
runner.emit<K extends keyof ScriptEventHandler>(
  eventName: K,
  ...args: Parameters<ScriptEventHandler[K]>
): boolean
```

**Returns:** `true` if the event had listeners, `false` otherwise.

## Usage Patterns

### Basic Event Handling

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

async function setupBasicEventHandling() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  })

  // Basic logging
  runner.on('script:beforeExecute', (scriptPath) => {
    console.log(`🚀 Starting: ${scriptPath}`)
  })

  runner.on('script:afterExecute', (scriptPath, result) => {
    console.log(`✅ Completed: ${scriptPath}`)
    console.log('Result:', result)
  })

  runner.on('script:error', (scriptPath, error) => {
    console.error(`❌ Failed: ${scriptPath}`)
    console.error('Error:', error)
  })

  return runner
}
```

### Advanced Monitoring

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

class ScriptMonitor {
  private executions = new Map<string, {
    startTime: number
    params: Record<string, unknown>
  }>()

  private stats = {
    total: 0,
    successful: 0,
    failed: 0,
    totalDuration: 0
  }

  setupMonitoring(runner: any) {
    runner.on('script:beforeExecute', (scriptPath: string, params: Record<string, unknown>) => {
      this.executions.set(scriptPath, {
        startTime: Date.now(),
        params
      })
      this.stats.total++
      
      console.log(`📊 Execution #${this.stats.total}: ${scriptPath}`)
    })

    runner.on('script:afterExecute', (scriptPath: string, result: any) => {
      const execution = this.executions.get(scriptPath)
      if (execution) {
        const duration = Date.now() - execution.startTime
        this.stats.successful++
        this.stats.totalDuration += duration
        
        console.log(`✅ Success in ${duration}ms: ${scriptPath}`)
        this.executions.delete(scriptPath)
      }
    })

    runner.on('script:error', (scriptPath: string, error: unknown) => {
      const execution = this.executions.get(scriptPath)
      if (execution) {
        const duration = Date.now() - execution.startTime
        this.stats.failed++
        
        console.error(`❌ Failed after ${duration}ms: ${scriptPath}`)
        console.error('Error:', error)
        this.executions.delete(scriptPath)
      }
    })
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.total > 0 ? (this.stats.successful / this.stats.total) * 100 : 0,
      averageDuration: this.stats.successful > 0 ? this.stats.totalDuration / this.stats.successful : 0
    }
  }
}

// Usage
const monitor = new ScriptMonitor()
const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

monitor.setupMonitoring(runner)

// Execute scripts
await runner.executeScript('script1.js')
await runner.executeScript('script2.js')

console.log('Execution stats:', monitor.getStats())
```

### Event-Driven Workflow

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

class WorkflowEngine {
  private workflows = new Map<string, string[]>()
  private runner: any

  constructor(runner: any) {
    this.runner = runner
    this.setupEventHandlers()
  }

  // Define a workflow as a sequence of scripts
  defineWorkflow(name: string, scripts: string[]) {
    this.workflows.set(name, scripts)
  }

  private setupEventHandlers() {
    this.runner.on('script:afterExecute', async (scriptPath: string, result: any) => {
      // Check if this script is part of any workflow
      for (const [workflowName, scripts] of this.workflows) {
        const currentIndex = scripts.findIndex(script => scriptPath.endsWith(script))
        
        if (currentIndex !== -1 && currentIndex < scripts.length - 1) {
          // Execute next script in workflow
          const nextScript = scripts[currentIndex + 1]
          console.log(`🔄 Workflow ${workflowName}: Executing next script: ${nextScript}`)
          
          try {
            await this.runner.executeScript(nextScript, {
              params: { 
                workflowName,
                previousResult: result,
                step: currentIndex + 2
              }
            })
          } catch (error) {
            console.error(`❌ Workflow ${workflowName} failed at step ${currentIndex + 2}:`, error)
          }
        } else if (currentIndex === scripts.length - 1) {
          console.log(`🎉 Workflow ${workflowName} completed successfully`)
        }
      }
    })

    this.runner.on('script:error', (scriptPath: string, error: unknown) => {
      // Find and halt any workflows containing this script
      for (const [workflowName, scripts] of this.workflows) {
        if (scripts.some(script => scriptPath.endsWith(script))) {
          console.error(`🛑 Workflow ${workflowName} halted due to error in ${scriptPath}`)
        }
      }
    })
  }

  async executeWorkflow(name: string, initialParams?: Record<string, unknown>) {
    const scripts = this.workflows.get(name)
    if (!scripts || scripts.length === 0) {
      throw new Error(`Workflow ${name} not found or empty`)
    }

    console.log(`🚀 Starting workflow: ${name}`)
    await this.runner.executeScript(scripts[0], {
      params: { 
        workflowName: name,
        step: 1,
        ...initialParams
      }
    })
  }
}

// Usage
const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

const workflow = new WorkflowEngine(runner)

// Define workflows
workflow.defineWorkflow('deployment', [
  'build.js',
  'test.js',
  'deploy.js',
  'notify.js'
])

workflow.defineWorkflow('data-processing', [
  'extract.js',
  'transform.js',
  'load.js'
])

// Execute workflow
await workflow.executeWorkflow('deployment', {
  environment: 'production',
  version: '1.2.0'
})
```

### Centralized Logging

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'
import fs from 'node:fs/promises'
import path from 'node:path'

class ScriptLogger {
  private logFile: string
  private logStream: any

  constructor(logFile: string) {
    this.logFile = logFile
  }

  async initialize() {
    // Ensure log directory exists
    await fs.mkdir(path.dirname(this.logFile), { recursive: true })
    
    // Create log stream
    this.logStream = await fs.open(this.logFile, 'a')
  }

  async log(level: string, message: string, metadata?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      metadata
    }
    
    await this.logStream.write(JSON.stringify(logEntry) + '\n')
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`)
  }

  setupScriptLogging(runner: any) {
    runner.on('script:beforeExecute', async (scriptPath: string, params: Record<string, unknown>) => {
      await this.log('info', 'Script execution started', {
        scriptPath,
        params,
        event: 'beforeExecute'
      })
    })

    runner.on('script:afterExecute', async (scriptPath: string, result: any) => {
      await this.log('info', 'Script execution completed', {
        scriptPath,
        result,
        event: 'afterExecute'
      })
    })

    runner.on('script:error', async (scriptPath: string, error: unknown) => {
      await this.log('error', 'Script execution failed', {
        scriptPath,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        event: 'error'
      })
    })

    runner.on('script:log', async (scriptPath: string, message: string) => {
      await this.log('debug', 'Script log message', {
        scriptPath,
        message,
        event: 'log'
      })
    })

    runner.on('tui:beforeStart', async () => {
      await this.log('info', 'TUI started', { event: 'tuiStart' })
    })

    runner.on('tui:afterEnd', async () => {
      await this.log('info', 'TUI ended', { event: 'tuiEnd' })
    })
  }

  async close() {
    if (this.logStream) {
      await this.logStream.close()
    }
  }
}

// Usage
const logger = new ScriptLogger('./logs/script-execution.log')
await logger.initialize()

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

logger.setupScriptLogging(runner)

// Execute scripts - all events will be logged
await runner.executeScript('example.js')

// Clean up
await logger.close()
```

### Error Handling and Retry Logic

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

class RetryManager {
  private retryConfig = new Map<string, {
    maxRetries: number
    delay: number
    backoff: number
  }>()
  
  private retryAttempts = new Map<string, number>()

  setRetryConfig(scriptPattern: string, config: {
    maxRetries: number
    delay: number
    backoff?: number
  }) {
    this.retryConfig.set(scriptPattern, {
      maxRetries: config.maxRetries,
      delay: config.delay,
      backoff: config.backoff || 1
    })
  }

  setupRetryLogic(runner: any) {
    runner.on('script:error', async (scriptPath: string, error: unknown) => {
      // Find matching retry configuration
      const config = this.findRetryConfig(scriptPath)
      if (!config) return

      const attempts = this.retryAttempts.get(scriptPath) || 0
      
      if (attempts < config.maxRetries) {
        const nextAttempt = attempts + 1
        const delay = config.delay * Math.pow(config.backoff, attempts)
        
        console.log(`🔄 Retrying ${scriptPath} (attempt ${nextAttempt}/${config.maxRetries}) in ${delay}ms`)
        this.retryAttempts.set(scriptPath, nextAttempt)
        
        setTimeout(async () => {
          try {
            await runner.executeScript(scriptPath)
          } catch (retryError) {
            console.error(`❌ Retry ${nextAttempt} failed for ${scriptPath}:`, retryError)
          }
        }, delay)
      } else {
        console.error(`💀 Max retries exceeded for ${scriptPath}`)
        this.retryAttempts.delete(scriptPath)
      }
    })

    runner.on('script:afterExecute', (scriptPath: string) => {
      // Clear retry attempts on success
      this.retryAttempts.delete(scriptPath)
    })
  }

  private findRetryConfig(scriptPath: string) {
    for (const [pattern, config] of this.retryConfig) {
      if (scriptPath.includes(pattern)) {
        return config
      }
    }
    return null
  }
}

// Usage
const retryManager = new RetryManager()

// Configure retry policies
retryManager.setRetryConfig('api-', {
  maxRetries: 3,
  delay: 1000,
  backoff: 2
})

retryManager.setRetryConfig('network-', {
  maxRetries: 5,
  delay: 500,
  backoff: 1.5
})

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

retryManager.setupRetryLogic(runner)

// Scripts matching patterns will be retried on failure
await runner.executeScript('api-fetch-data.js')
await runner.executeScript('network-sync.js')
```

### Real-time Monitoring Dashboard

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'
import { WebSocketServer } from 'ws'

class MonitoringDashboard {
  private wss: WebSocketServer
  private clients = new Set<any>()

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port })
    this.setupWebSocketServer()
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws)
      console.log('Dashboard client connected')

      ws.on('close', () => {
        this.clients.delete(ws)
        console.log('Dashboard client disconnected')
      })
    })
  }

  private broadcast(data: any) {
    const message = JSON.stringify(data)
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  }

  setupScriptMonitoring(runner: any) {
    runner.on('script:beforeExecute', (scriptPath: string, params: Record<string, unknown>) => {
      this.broadcast({
        type: 'script:start',
        timestamp: Date.now(),
        scriptPath,
        params
      })
    })

    runner.on('script:afterExecute', (scriptPath: string, result: any) => {
      this.broadcast({
        type: 'script:success',
        timestamp: Date.now(),
        scriptPath,
        result
      })
    })

    runner.on('script:error', (scriptPath: string, error: unknown) => {
      this.broadcast({
        type: 'script:error',
        timestamp: Date.now(),
        scriptPath,
        error: error instanceof Error ? error.message : String(error)
      })
    })

    runner.on('script:log', (scriptPath: string, message: string) => {
      this.broadcast({
        type: 'script:log',
        timestamp: Date.now(),
        scriptPath,
        message
      })
    })
  }

  close() {
    this.wss.close()
  }
}

// Usage
const dashboard = new MonitoringDashboard(8080)
console.log('Monitoring dashboard available at ws://localhost:8080')

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

dashboard.setupScriptMonitoring(runner)

// Execute scripts - events will be broadcast to connected clients
await runner.executeScript('example.js')

// Clean up
// dashboard.close()
```

## Event Chaining

You can chain event handlers for fluent configuration:

```typescript
const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})
  .on('script:beforeExecute', (scriptPath) => {
    console.log(`Starting: ${scriptPath}`)
  })
  .on('script:afterExecute', (scriptPath, result) => {
    console.log(`Completed: ${scriptPath}`)
  })
  .on('script:error', (scriptPath, error) => {
    console.error(`Failed: ${scriptPath}`, error)
  })
```

## Best Practices

### 1. Error Handling in Event Listeners

Always handle errors in event listeners to prevent crashes:

```typescript
runner.on('script:afterExecute', (scriptPath, result) => {
  try {
    // Process result
    processResult(result)
  } catch (error) {
    console.error('Error processing script result:', error)
  }
})
```

### 2. Async Event Handlers

Use async handlers carefully and handle rejections:

```typescript
runner.on('script:afterExecute', async (scriptPath, result) => {
  try {
    await saveResultToDatabase(result)
  } catch (error) {
    console.error('Failed to save result:', error)
  }
})
```

### 3. Memory Management

Remove event listeners when no longer needed:

```typescript
const handler = (scriptPath: string) => {
  console.log(`Script: ${scriptPath}`)
}

runner.on('script:beforeExecute', handler)

// Later, remove the listener
runner.off('script:beforeExecute', handler)
```

### 4. Event Filtering

Filter events based on script paths or other criteria:

```typescript
runner.on('script:beforeExecute', (scriptPath, params) => {
  // Only log for production scripts
  if (scriptPath.includes('/production/')) {
    console.log(`Production script starting: ${scriptPath}`)
  }
})
```

## Integration Examples

### Express.js API Integration

```typescript
import express from 'express'
import { createScriptRunner } from '@glyphtek/scriptit'

const app = express()
const executions = new Map<string, any>()

const runner = await createScriptRunner({
  scriptsDir: './api-scripts',
  tmpDir: './tmp'
})

// Track executions via events
runner.on('script:beforeExecute', (scriptPath, params) => {
  const executionId = Date.now().toString()
  executions.set(executionId, {
    scriptPath,
    params,
    status: 'running',
    startTime: Date.now()
  })
})

runner.on('script:afterExecute', (scriptPath, result) => {
  // Find and update execution
  for (const [id, execution] of executions) {
    if (execution.scriptPath === scriptPath && execution.status === 'running') {
      execution.status = 'completed'
      execution.result = result
      execution.endTime = Date.now()
      break
    }
  }
})

// API endpoints
app.get('/api/executions', (req, res) => {
  res.json(Array.from(executions.entries()).map(([id, exec]) => ({ id, ...exec })))
})

app.listen(3000)
```

### Slack Notifications

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

class SlackNotifier {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async sendNotification(message: string, color: string = 'good') {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [{
            color,
            text: message,
            ts: Math.floor(Date.now() / 1000)
          }]
        })
      })
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  setupScriptNotifications(runner: any) {
    runner.on('script:error', async (scriptPath: string, error: unknown) => {
      await this.sendNotification(
        `❌ Script failed: ${scriptPath}\nError: ${error}`,
        'danger'
      )
    })

    runner.on('script:afterExecute', async (scriptPath: string, result: any) => {
      if (scriptPath.includes('deploy') || scriptPath.includes('production')) {
        await this.sendNotification(
          `✅ Production script completed: ${scriptPath}`,
          'good'
        )
      }
    })
  }
}

// Usage
const slackNotifier = new SlackNotifier(process.env.SLACK_WEBHOOK_URL!)
const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp'
})

slackNotifier.setupScriptNotifications(runner)
```

## Related Documentation

- [Library API](/library/api) - Main API documentation
- [TypeScript Types](/library/types) - Event type definitions
- [CLI Commands](/cli/commands) - CLI event equivalents
- [Examples](/examples/library) - More event usage examples 