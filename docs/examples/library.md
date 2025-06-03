# Library Examples

This page provides practical examples of using ScriptIt programmatically as a library, covering integration patterns, event handling, error management, and TypeScript usage.

## Basic Library Usage

### Simple Script Execution

```javascript
// basic-execution.js
import { createScriptRunner } from '@glyphtek/scriptit';

async function runScript() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    tmpDir: './tmp'
  });
  
  try {
    const result = await runner.executeScript('hello-world.js');
    console.log('Script result:', result);
  } catch (error) {
    console.error('Script failed:', error.message);
  }
}

runScript();
```

### Script Execution with Parameters

```javascript
// parameterized-execution.js
import { createScriptRunner } from '@glyphtek/scriptit';

async function runWithParameters() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    consoleInterception: { enabled: true }
  });
  
  const result = await runner.executeScript('process-user.js', {
    params: {
      userId: 123,
      action: 'update',
      dryRun: false
    },
    env: {
      NODE_ENV: 'development',
      API_KEY: 'your-api-key',
      DATABASE_URL: 'postgresql://localhost:5432/mydb'
    }
  });
  
  console.log('Processing result:', result);
}

runWithParameters();
```

### Configuration Options

```javascript
// advanced-configuration.js
import { createScriptRunner } from '@glyphtek/scriptit';

async function advancedSetup() {
  const runner = await createScriptRunner({
    scriptsDir: './automation-scripts',
    tmpDir: './temp',
    envFiles: ['.env', '.env.local'],
    excludePatterns: ['**/*.test.js', '**/*.spec.js'],
    defaultParams: {
      appName: 'My Application',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    consoleInterception: {
      enabled: true,
      useColors: true,
      includeLevel: false,
      preserveOriginal: false
    }
  });
  
  return runner;
}

advancedSetup().then(runner => {
  console.log('ScriptIt runner configured');
});
```

## Event Handling

### Basic Event Listeners

```javascript
// event-handling.js
import { createScriptRunner } from '@glyphtek/scriptit';

async function setupEventHandling() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts',
    consoleInterception: { enabled: true }
  });
  
  // Script execution events
  runner.on('script:beforeExecute', (scriptPath, params) => {
    console.log(`🚀 Starting script: ${scriptPath}`);
    console.log('Parameters:', params);
  });
  
  runner.on('script:afterExecute', (scriptPath, result) => {
    console.log(`✅ Script completed: ${scriptPath}`);
    console.log('Result:', result);
  });
  
  runner.on('script:error', (scriptPath, error) => {
    console.error(`❌ Script failed: ${scriptPath}`);
    console.error('Error:', error.message);
  });
  
  // Console output events
  runner.on('script:log', (scriptPath, level, message) => {
    console.log(`[${level.toUpperCase()}] ${scriptPath}: ${message}`);
  });
  
  // Execute a script
  await runner.executeScript('example-script.js', {
    params: { test: true }
  });
}

setupEventHandling();
```

### Advanced Event Handling

```javascript
// advanced-events.js
import { createScriptRunner } from '@glyphtek/scriptit';

class ScriptMonitor {
  constructor() {
    this.executions = new Map();
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalDuration: 0
    };
  }
  
  async initialize() {
    this.runner = await createScriptRunner({
      scriptsDir: './scripts',
      consoleInterception: { enabled: true }
    });
    
    this.setupEventListeners();
    return this.runner;
  }
  
  setupEventListeners() {
    // Track execution start
    this.runner.on('script:beforeExecute', (scriptPath, params) => {
      const execution = {
        scriptPath,
        params,
        startTime: Date.now(),
        logs: []
      };
      
      this.executions.set(scriptPath, execution);
      this.metrics.totalExecutions++;
      
      console.log(`📊 [${this.metrics.totalExecutions}] Starting: ${scriptPath}`);
    });
    
    // Track execution completion
    this.runner.on('script:afterExecute', (scriptPath, result) => {
      const execution = this.executions.get(scriptPath);
      if (execution) {
        execution.endTime = Date.now();
        execution.duration = execution.endTime - execution.startTime;
        execution.result = result;
        execution.success = true;
        
        this.metrics.successfulExecutions++;
        this.metrics.totalDuration += execution.duration;
        
        console.log(`✅ Completed: ${scriptPath} (${execution.duration}ms)`);
      }
    });
    
    // Track execution errors
    this.runner.on('script:error', (scriptPath, error) => {
      const execution = this.executions.get(scriptPath);
      if (execution) {
        execution.endTime = Date.now();
        execution.duration = execution.endTime - execution.startTime;
        execution.error = error;
        execution.success = false;
        
        this.metrics.failedExecutions++;
        
        console.error(`❌ Failed: ${scriptPath} (${execution.duration}ms)`);
        console.error('Error:', error.message);
      }
    });
    
    // Collect console logs
    this.runner.on('script:log', (scriptPath, level, message) => {
      const execution = this.executions.get(scriptPath);
      if (execution) {
        execution.logs.push({ level, message, timestamp: Date.now() });
      }
    });
    
    // TUI events
    this.runner.on('tui:beforeStart', () => {
      console.log('🖥️  TUI starting...');
    });
    
    this.runner.on('tui:afterEnd', () => {
      console.log('🖥️  TUI ended');
      this.printMetrics();
    });
  }
  
  printMetrics() {
    console.log('\n📊 Execution Metrics:');
    console.log(`Total executions: ${this.metrics.totalExecutions}`);
    console.log(`Successful: ${this.metrics.successfulExecutions}`);
    console.log(`Failed: ${this.metrics.failedExecutions}`);
    console.log(`Average duration: ${Math.round(this.metrics.totalDuration / this.metrics.totalExecutions)}ms`);
    
    const successRate = (this.metrics.successfulExecutions / this.metrics.totalExecutions * 100).toFixed(1);
    console.log(`Success rate: ${successRate}%`);
  }
  
  getExecutionHistory() {
    return Array.from(this.executions.values());
  }
}

// Usage
async function main() {
  const monitor = new ScriptMonitor();
  const runner = await monitor.initialize();
  
  // Execute multiple scripts
  await runner.executeScript('script1.js');
  await runner.executeScript('script2.js');
  await runner.executeScript('script3.js');
  
  monitor.printMetrics();
}

main();
```

## Error Handling and Resilience

### Basic Error Handling

```javascript
// error-handling.js
import { createScriptRunner } from '@glyphtek/scriptit';

async function handleErrors() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts'
  });
  
  try {
    const result = await runner.executeScript('risky-script.js', {
      params: { operation: 'dangerous' }
    });
    
    console.log('Script succeeded:', result);
  } catch (error) {
    console.error('Script execution failed:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // Handle specific error types
    if (error.message.includes('Permission denied')) {
      console.log('💡 Try running with appropriate permissions');
    } else if (error.message.includes('not found')) {
      console.log('💡 Check if the script file exists');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Consider increasing the timeout value');
    }
  }
}

handleErrors();
```

### Retry Logic

```javascript
// retry-logic.js
import { createScriptRunner } from '@glyphtek/scriptit';

async function executeWithRetry(runner, scriptPath, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}: ${scriptPath}`);
      
      const result = await runner.executeScript(scriptPath, options);
      console.log(`✅ Success on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error;
      console.warn(`⚠️  Attempt ${attempt} failed: ${error.message}`);
      
      // Don't retry on certain errors
      if (error.message.includes('not found') || 
          error.message.includes('syntax error')) {
        console.log('🚫 Non-retryable error, stopping');
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Script failed after ${maxRetries} attempts: ${lastError.message}`);
}

async function resilientExecution() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts'
  });
  
  try {
    const result = await executeWithRetry(runner, 'flaky-script.js', {
      params: { retryable: true }
    }, 3);
    
    console.log('Final result:', result);
  } catch (error) {
    console.error('All retry attempts failed:', error.message);
  }
}

resilientExecution();
```

### Circuit Breaker Pattern

```javascript
// circuit-breaker.js
import { createScriptRunner } from '@glyphtek/scriptit';

class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker: HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    console.log('✅ Circuit breaker: CLOSED');
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('🚫 Circuit breaker: OPEN');
    }
  }
}

async function circuitBreakerExample() {
  const runner = await createScriptRunner({
    scriptsDir: './scripts'
  });
  
  const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout
  
  for (let i = 0; i < 10; i++) {
    try {
      const result = await circuitBreaker.execute(async () => {
        return await runner.executeScript('unreliable-script.js', {
          params: { attempt: i + 1 }
        });
      });
      
      console.log(`Attempt ${i + 1} succeeded:`, result);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
    }
    
    // Wait between attempts
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

circuitBreakerExample();
```

## Integration Patterns

### Express.js Integration

```javascript
// express-integration.js
import express from 'express';
import { createScriptRunner } from '@glyphtek/scriptit';

class ScriptAPI {
  constructor() {
    this.app = express();
    this.runner = null;
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  async initialize() {
    this.runner = await createScriptRunner({
      scriptsDir: './api-scripts',
      consoleInterception: { enabled: true }
    });
    
    // Setup event logging
    this.runner.on('script:beforeExecute', (scriptPath, params) => {
      console.log(`API executing: ${scriptPath}`, params);
    });
    
    this.runner.on('script:error', (scriptPath, error) => {
      console.error(`API script error: ${scriptPath}`, error.message);
    });
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, req.body);
      next();
    });
  }
  
  setupRoutes() {
    // List available scripts
    this.app.get('/scripts', async (req, res) => {
      try {
        const scripts = await this.runner.listScripts();
        res.json({ scripts });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Execute script
    this.app.post('/scripts/:scriptName/execute', async (req, res) => {
      try {
        const { scriptName } = req.params;
        const { params = {}, env = {} } = req.body;
        
        const result = await this.runner.executeScript(scriptName, {
          params,
          env: { ...process.env, ...env }
        });
        
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });
    
    // Execute script with async response
    this.app.post('/scripts/:scriptName/execute-async', async (req, res) => {
      const { scriptName } = req.params;
      const { params = {}, env = {} } = req.body;
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Start execution asynchronously
      this.executeAsync(executionId, scriptName, { params, env });
      
      res.json({ 
        success: true, 
        executionId,
        status: 'started'
      });
    });
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
  }
  
  async executeAsync(executionId, scriptName, options) {
    try {
      console.log(`Starting async execution: ${executionId}`);
      
      const result = await this.runner.executeScript(scriptName, options);
      
      console.log(`Async execution completed: ${executionId}`, result);
      
      // Here you could store results in database, send webhooks, etc.
      
    } catch (error) {
      console.error(`Async execution failed: ${executionId}`, error.message);
    }
  }
  
  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`ScriptIt API server running on port ${port}`);
    });
  }
}

// Usage
async function startServer() {
  const api = new ScriptAPI();
  await api.initialize();
  api.start(3000);
}

startServer();
```

### Queue Integration

```javascript
// queue-integration.js
import { createScriptRunner } from '@glyphtek/scriptit';
import Bull from 'bull';

class ScriptQueue {
  constructor(redisConfig = {}) {
    this.queue = new Bull('script execution', {
      redis: redisConfig
    });
    this.runner = null;
    this.setupQueue();
  }
  
  async initialize() {
    this.runner = await createScriptRunner({
      scriptsDir: './queue-scripts',
      consoleInterception: { enabled: true }
    });
    
    console.log('ScriptQueue initialized');
  }
  
  setupQueue() {
    // Process jobs
    this.queue.process('execute-script', async (job) => {
      const { scriptPath, options } = job.data;
      
      console.log(`Processing job ${job.id}: ${scriptPath}`);
      
      try {
        const result = await this.runner.executeScript(scriptPath, options);
        
        console.log(`Job ${job.id} completed successfully`);
        return result;
        
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error.message);
        throw error;
      }
    });
    
    // Job event handlers
    this.queue.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed:`, result);
    });
    
    this.queue.on('failed', (job, error) => {
      console.error(`❌ Job ${job.id} failed:`, error.message);
    });
    
    this.queue.on('stalled', (job) => {
      console.warn(`⚠️  Job ${job.id} stalled`);
    });
  }
  
  async addScript(scriptPath, options = {}, jobOptions = {}) {
    const job = await this.queue.add('execute-script', {
      scriptPath,
      options
    }, {
      attempts: 3,
      backoff: 'exponential',
      delay: 0,
      ...jobOptions
    });
    
    console.log(`Queued script: ${scriptPath} (Job ID: ${job.id})`);
    return job;
  }
  
  async addScheduledScript(scriptPath, cron, options = {}) {
    const job = await this.queue.add('execute-script', {
      scriptPath,
      options
    }, {
      repeat: { cron },
      attempts: 3,
      backoff: 'exponential'
    });
    
    console.log(`Scheduled script: ${scriptPath} (${cron})`);
    return job;
  }
  
  async getJobStatus(jobId) {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;
    
    return {
      id: job.id,
      data: job.data,
      progress: job.progress(),
      state: await job.getState(),
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null
    };
  }
}

// Usage
async function queueExample() {
  const scriptQueue = new ScriptQueue({
    host: 'localhost',
    port: 6379
  });
  
  await scriptQueue.initialize();
  
  // Add immediate jobs
  await scriptQueue.addScript('process-data.js', {
    params: { batchSize: 100 }
  });
  
  await scriptQueue.addScript('send-notifications.js', {
    params: { type: 'email' }
  });
  
  // Add scheduled job (daily at 2 AM)
  await scriptQueue.addScheduledScript('daily-backup.js', '0 2 * * *', {
    params: { compress: true }
  });
  
  console.log('Jobs queued successfully');
}

queueExample();
```

### Microservice Integration

```javascript
// microservice-integration.js
import { createScriptRunner } from '@glyphtek/scriptit';
import { EventEmitter } from 'events';

class ScriptMicroservice extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      scriptsDir: './microservice-scripts',
      healthCheckInterval: 30000,
      maxConcurrentExecutions: 10,
      ...config
    };
    
    this.runner = null;
    this.activeExecutions = new Map();
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0
    };
  }
  
  async initialize() {
    this.runner = await createScriptRunner({
      scriptsDir: this.config.scriptsDir,
      consoleInterception: { enabled: true }
    });
    
    this.setupEventHandlers();
    this.startHealthCheck();
    
    console.log('ScriptMicroservice initialized');
  }
  
  setupEventHandlers() {
    this.runner.on('script:beforeExecute', (scriptPath, params) => {
      const executionId = `${scriptPath}_${Date.now()}`;
      this.activeExecutions.set(executionId, {
        scriptPath,
        params,
        startTime: Date.now()
      });
      
      this.emit('execution:started', { executionId, scriptPath, params });
    });
    
    this.runner.on('script:afterExecute', (scriptPath, result) => {
      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;
      
      const execution = Array.from(this.activeExecutions.values())
        .find(e => e.scriptPath === scriptPath);
      
      if (execution) {
        const duration = Date.now() - execution.startTime;
        this.updateAverageExecutionTime(duration);
        
        this.emit('execution:completed', {
          scriptPath,
          result,
          duration
        });
      }
    });
    
    this.runner.on('script:error', (scriptPath, error) => {
      this.metrics.totalExecutions++;
      this.metrics.failedExecutions++;
      
      this.emit('execution:failed', {
        scriptPath,
        error: error.message
      });
    });
  }
  
  updateAverageExecutionTime(duration) {
    const total = this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1);
    this.metrics.averageExecutionTime = (total + duration) / this.metrics.totalExecutions;
  }
  
  startHealthCheck() {
    setInterval(() => {
      const health = this.getHealthStatus();
      this.emit('health:check', health);
      
      if (!health.healthy) {
        console.warn('⚠️  Service health check failed:', health);
      }
    }, this.config.healthCheckInterval);
  }
  
  getHealthStatus() {
    const activeCount = this.activeExecutions.size;
    const successRate = this.metrics.totalExecutions > 0 
      ? (this.metrics.successfulExecutions / this.metrics.totalExecutions) * 100 
      : 100;
    
    return {
      healthy: activeCount < this.config.maxConcurrentExecutions && successRate > 80,
      activeExecutions: activeCount,
      totalExecutions: this.metrics.totalExecutions,
      successRate: Math.round(successRate * 100) / 100,
      averageExecutionTime: Math.round(this.metrics.averageExecutionTime),
      uptime: process.uptime()
    };
  }
  
  async executeScript(scriptPath, options = {}) {
    if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
      throw new Error('Maximum concurrent executions reached');
    }
    
    return await this.runner.executeScript(scriptPath, options);
  }
  
  async listAvailableScripts() {
    return await this.runner.listScripts();
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      activeExecutions: this.activeExecutions.size,
      health: this.getHealthStatus()
    };
  }
}

// Usage
async function microserviceExample() {
  const service = new ScriptMicroservice({
    scriptsDir: './scripts',
    maxConcurrentExecutions: 5
  });
  
  await service.initialize();
  
  // Listen to service events
  service.on('execution:started', (data) => {
    console.log('🚀 Execution started:', data.scriptPath);
  });
  
  service.on('execution:completed', (data) => {
    console.log(`✅ Execution completed: ${data.scriptPath} (${data.duration}ms)`);
  });
  
  service.on('execution:failed', (data) => {
    console.error(`❌ Execution failed: ${data.scriptPath}`, data.error);
  });
  
  service.on('health:check', (health) => {
    if (!health.healthy) {
      console.warn('Service health degraded:', health);
    }
  });
  
  // Execute some scripts
  try {
    await service.executeScript('data-processing.js', {
      params: { batchSize: 100 }
    });
    
    await service.executeScript('send-report.js', {
      params: { format: 'pdf' }
    });
    
    console.log('Service metrics:', service.getMetrics());
  } catch (error) {
    console.error('Service error:', error.message);
  }
}

microserviceExample();
```

## TypeScript Integration

### Typed Script Runner

```typescript
// typed-integration.ts
import { createScriptRunner, ScriptRunnerInstance } from '@glyphtek/scriptit';

interface ScriptParams {
  userId?: number;
  batchSize?: number;
  dryRun?: boolean;
  format?: 'json' | 'csv' | 'xml';
}

interface ScriptResult {
  success: boolean;
  data?: any;
  errors?: string[];
  duration?: number;
}

interface ScriptEnvironment {
  NODE_ENV: 'development' | 'staging' | 'production';
  API_KEY?: string;
  DATABASE_URL?: string;
  DEBUG?: string;
}

class TypedScriptRunner {
  private runner: ScriptRunnerInstance;
  
  async initialize(): Promise<void> {
    this.runner = await createScriptRunner({
      scriptsDir: './scripts',
      tmpDir: './tmp',
      consoleInterception: { enabled: true }
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.runner.on('script:beforeExecute', (scriptPath: string, params: Record<string, unknown>) => {
      console.log(`Starting script: ${scriptPath}`, params);
    });
    
    this.runner.on('script:afterExecute', (scriptPath: string, result: any) => {
      console.log(`Script completed: ${scriptPath}`, result);
    });
    
    this.runner.on('script:error', (scriptPath: string, error: Error) => {
      console.error(`Script failed: ${scriptPath}`, error.message);
    });
  }
  
  async executeScript<T = ScriptResult>(
    scriptPath: string,
    params: ScriptParams = {},
    env: Partial<ScriptEnvironment> = {}
  ): Promise<T> {
    const result = await this.runner.executeScript(scriptPath, {
      params,
      env: env as Record<string, string>
    });
    
    return result as T;
  }
  
  async executeUserScript(userId: number, options: {
    batchSize?: number;
    dryRun?: boolean;
  } = {}): Promise<ScriptResult> {
    return await this.executeScript('process-user.js', {
      userId,
      ...options
    });
  }
  
  async executeDataProcessing(config: {
    inputFile: string;
    outputFormat: 'json' | 'csv';
    batchSize?: number;
  }): Promise<ScriptResult> {
    return await this.executeScript('process-data.js', {
      ...config,
      batchSize: config.batchSize || 100
    });
  }
  
  async executeWithRetry<T = ScriptResult>(
    scriptPath: string,
    params: ScriptParams = {},
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeScript<T>(scriptPath, params);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Script failed after ${maxRetries} attempts: ${lastError!.message}`);
  }
  
  async listScripts(): Promise<string[]> {
    return await this.runner.listScripts();
  }
}

// Usage
async function typedExample(): Promise<void> {
  const runner = new TypedScriptRunner();
  await runner.initialize();
  
  try {
    // Type-safe script execution
    const userResult = await runner.executeUserScript(123, {
      batchSize: 50,
      dryRun: false
    });
    
    console.log('User processing result:', userResult);
    
    // Data processing with typed parameters
    const dataResult = await runner.executeDataProcessing({
      inputFile: 'data.csv',
      outputFormat: 'json',
      batchSize: 1000
    });
    
    console.log('Data processing result:', dataResult);
    
    // Retry execution
    const retryResult = await runner.executeWithRetry('flaky-script.js', {
      dryRun: true
    }, 3);
    
    console.log('Retry result:', retryResult);
    
  } catch (error) {
    console.error('Execution failed:', error.message);
  }
}

typedExample();
```

### Generic Script Execution

```typescript
// generic-execution.ts
import { createScriptRunner } from '@glyphtek/scriptit';

interface BaseScriptResult {
  success: boolean;
  timestamp: string;
}

interface DataProcessingResult extends BaseScriptResult {
  processedRecords: number;
  errors: string[];
  outputFile: string;
}

interface ReportGenerationResult extends BaseScriptResult {
  reportPath: string;
  format: string;
  size: number;
}

interface APIIntegrationResult extends BaseScriptResult {
  syncedRecords: number;
  apiCalls: number;
  rateLimitRemaining: number;
}

class GenericScriptExecutor {
  private runner: any;
  
  async initialize() {
    this.runner = await createScriptRunner({
      scriptsDir: './scripts',
      consoleInterception: { enabled: true }
    });
  }
  
  async executeDataProcessing(params: {
    inputFile: string;
    batchSize?: number;
  }): Promise<DataProcessingResult> {
    return await this.runner.executeScript('data-processing.js', {
      params: {
        batchSize: 100,
        ...params
      }
    });
  }
  
  async executeReportGeneration(params: {
    reportType: string;
    format: 'pdf' | 'excel' | 'csv';
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ReportGenerationResult> {
    return await this.runner.executeScript('generate-report.js', {
      params
    });
  }
  
  async executeAPIIntegration(params: {
    endpoint: string;
    since?: string;
    batchSize?: number;
  }): Promise<APIIntegrationResult> {
    return await this.runner.executeScript('api-integration.js', {
      params: {
        batchSize: 50,
        ...params
      }
    });
  }
  
  async executeBatch<T extends BaseScriptResult>(
    scripts: Array<{
      script: string;
      params: Record<string, any>;
    }>
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (const { script, params } of scripts) {
      try {
        const result = await this.runner.executeScript(script, { params });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          timestamp: new Date().toISOString(),
          error: error.message
        } as T);
      }
    }
    
    return results;
  }
}

// Usage
async function genericExample() {
  const executor = new GenericScriptExecutor();
  await executor.initialize();
  
  // Execute data processing
  const dataResult = await executor.executeDataProcessing({
    inputFile: 'users.csv',
    batchSize: 500
  });
  
  console.log(`Processed ${dataResult.processedRecords} records`);
  
  // Execute report generation
  const reportResult = await executor.executeReportGeneration({
    reportType: 'monthly-summary',
    format: 'pdf',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    }
  });
  
  console.log(`Report generated: ${reportResult.reportPath}`);
  
  // Execute batch operations
  const batchResults = await executor.executeBatch([
    { script: 'cleanup.js', params: { dryRun: false } },
    { script: 'backup.js', params: { compress: true } },
    { script: 'notify.js', params: { type: 'email' } }
  ]);
  
  console.log(`Batch completed: ${batchResults.length} scripts executed`);
}

genericExample();
```

## Related Documentation

- [Library API](/library/api) - Complete API reference
- [TypeScript Guide](/guides/typescript) - TypeScript integration guide
- [Event System](/library/events) - Event handling documentation
- [CLI Examples](/examples/cli) - Command-line usage examples
- [Best Practices](/guides/best-practices) - Development best practices 