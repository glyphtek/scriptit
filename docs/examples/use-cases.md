# Real-World Use Cases

This page showcases real-world examples of ScriptIt in production environments, covering common automation scenarios, integration patterns, and workflow solutions.

## Data Processing and ETL

### CSV Data Processing Pipeline

```javascript
// process-csv-data.js
export const description = "Process large CSV files with validation and transformation";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  const csv = await import('csv-parser');
  const createReadStream = (await import('fs')).createReadStream;
  
  const inputFile = context.params.inputFile || context.env.INPUT_FILE;
  const outputFile = `${context.tmpDir}/processed-${Date.now()}.json`;
  const batchSize = parseInt(context.env.BATCH_SIZE || '1000');
  
  console.info(`📊 Processing CSV: ${inputFile}`);
  
  let processed = 0;
  let errors = 0;
  const results = [];
  
  return new Promise((resolve, reject) => {
    createReadStream(inputFile)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Validate and transform data
          const transformed = {
            id: parseInt(row.id),
            email: row.email.toLowerCase().trim(),
            name: row.name.trim(),
            createdAt: new Date(row.created_at).toISOString(),
            isActive: row.status === 'active'
          };
          
          // Validate email format
          if (!/\S+@\S+\.\S+/.test(transformed.email)) {
            throw new Error('Invalid email format');
          }
          
          results.push(transformed);
          processed++;
          
          // Process in batches
          if (results.length >= batchSize) {
            await fs.writeFile(
              `${outputFile}.batch-${Math.floor(processed / batchSize)}`,
              JSON.stringify(results, null, 2)
            );
            results.length = 0;
          }
          
          if (processed % 10000 === 0) {
            console.log(`Processed ${processed} records`);
          }
          
        } catch (error) {
          errors++;
          console.warn(`Row ${processed + errors}: ${error.message}`);
        }
      })
      .on('end', async () => {
        // Write remaining results
        if (results.length > 0) {
          await fs.writeFile(outputFile, JSON.stringify(results, null, 2));
        }
        
        console.log(`✅ Processing complete: ${processed} records, ${errors} errors`);
        resolve({ processed, errors, outputFile });
      })
      .on('error', reject);
  });
}
```

### Database Migration Script

```javascript
// migrate-database.js
export const description = "Database migration with rollback support";

export async function tearUp(context) {
  const console = context.console || global.console;
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    connectionString: context.env.DATABASE_URL
  });
  
  // Create backup before migration
  const backupFile = `${context.tmpDir}/backup-${Date.now()}.sql`;
  console.info('📦 Creating database backup...');
  
  // Simplified backup (in production, use pg_dump)
  const tables = await pool.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
  `);
  
  console.log(`✅ Backup created: ${backupFile}`);
  
  return { pool, backupFile, tables: tables.rows };
}

export async function execute(context, tearUpResult) {
  const console = context.console || global.console;
  const { pool } = tearUpResult;
  
  const migrationVersion = context.params.version || '001';
  const dryRun = context.params.dryRun === 'true';
  
  console.info(`🔄 Running migration ${migrationVersion} (dry run: ${dryRun})`);
  
  const migrations = {
    '001': `
      CREATE TABLE IF NOT EXISTS users_new (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
    '002': `
      ALTER TABLE users_new ADD COLUMN last_login TIMESTAMP;
      CREATE INDEX idx_users_email ON users_new(email);
    `
  };
  
  const migration = migrations[migrationVersion];
  if (!migration) {
    throw new Error(`Migration ${migrationVersion} not found`);
  }
  
  if (dryRun) {
    console.log('🔍 Dry run - would execute:', migration);
    return { dryRun: true, migration };
  }
  
  try {
    await pool.query('BEGIN');
    await pool.query(migration);
    await pool.query('COMMIT');
    
    console.log('✅ Migration completed successfully');
    return { success: true, version: migrationVersion };
    
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

export async function tearDown(context, executeResult, tearUpResult) {
  const console = context.console || global.console;
  const { pool } = tearUpResult;
  
  await pool.end();
  console.log('🔌 Database connection closed');
}
```

## API Integration and Synchronization

### Multi-API Data Sync

```javascript
// sync-external-apis.js
export const description = "Synchronize data from multiple external APIs";

export async function execute(context) {
  const console = context.console || global.console;
  
  const apis = [
    { name: 'CRM', url: context.env.CRM_API_URL, key: context.env.CRM_API_KEY },
    { name: 'Analytics', url: context.env.ANALYTICS_API_URL, key: context.env.ANALYTICS_API_KEY },
    { name: 'Support', url: context.env.SUPPORT_API_URL, key: context.env.SUPPORT_API_KEY }
  ];
  
  const since = context.params.since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const results = {};
  
  console.info(`🔄 Syncing data since: ${since}`);
  
  for (const api of apis) {
    try {
      console.log(`📡 Syncing ${api.name}...`);
      
      const response = await fetch(`${api.url}/data?since=${since}`, {
        headers: {
          'Authorization': `Bearer ${api.key}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      results[api.name] = {
        success: true,
        records: data.length,
        data: data.slice(0, 10) // Store sample
      };
      
      console.log(`✅ ${api.name}: ${data.length} records`);
      
    } catch (error) {
      console.error(`❌ ${api.name} failed: ${error.message}`);
      results[api.name] = {
        success: false,
        error: error.message
      };
    }
  }
  
  const successful = Object.values(results).filter(r => r.success).length;
  console.info(`📊 Sync complete: ${successful}/${apis.length} APIs successful`);
  
  return results;
}
```

### Webhook Processing System

```javascript
// process-webhooks.js
export const description = "Process incoming webhooks with retry logic";

export async function execute(context) {
  const console = context.console || global.console;
  const Redis = await import('redis');
  
  const redis = Redis.createClient({
    url: context.env.REDIS_URL || 'redis://localhost:6379'
  });
  await redis.connect();
  
  const queueKey = 'webhook:queue';
  const maxRetries = parseInt(context.env.MAX_RETRIES || '3');
  let processed = 0;
  
  console.info('🎣 Processing webhook queue...');
  
  while (true) {
    const webhook = await redis.blPop(queueKey, 5);
    if (!webhook) break;
    
    const data = JSON.parse(webhook.element);
    
    try {
      await processWebhook(data);
      processed++;
      console.log(`✅ Processed webhook ${data.id}`);
      
    } catch (error) {
      const retryCount = (data.retryCount || 0) + 1;
      
      if (retryCount <= maxRetries) {
        data.retryCount = retryCount;
        await redis.rPush(`${queueKey}:retry`, JSON.stringify(data));
        console.warn(`⚠️  Webhook ${data.id} failed, retry ${retryCount}/${maxRetries}`);
      } else {
        await redis.rPush(`${queueKey}:failed`, JSON.stringify(data));
        console.error(`❌ Webhook ${data.id} failed permanently`);
      }
    }
  }
  
  await redis.disconnect();
  console.log(`📊 Processed ${processed} webhooks`);
  
  return { processed };
}

async function processWebhook(data) {
  // Simulate webhook processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (Math.random() < 0.1) { // 10% failure rate
    throw new Error('Random processing error');
  }
  
  return { success: true };
}
```

## DevOps and Deployment

### Blue-Green Deployment

```javascript
// blue-green-deploy.js
export const description = "Blue-green deployment with health checks";

export async function execute(context) {
  const console = context.console || global.console;
  
  const environment = context.env.ENVIRONMENT || 'staging';
  const version = context.params.version;
  const rollback = context.params.rollback === 'true';
  
  if (!version && !rollback) {
    throw new Error('Version parameter is required');
  }
  
  console.info(`🚀 ${rollback ? 'Rolling back' : 'Deploying'} to ${environment}`);
  
  const config = {
    staging: {
      blueSlot: 'staging-blue',
      greenSlot: 'staging-green',
      loadBalancer: 'staging-lb'
    },
    production: {
      blueSlot: 'prod-blue',
      greenSlot: 'prod-green',
      loadBalancer: 'prod-lb'
    }
  };
  
  const slots = config[environment];
  if (!slots) {
    throw new Error(`Unknown environment: ${environment}`);
  }
  
  // Determine current and target slots
  const currentSlot = await getCurrentActiveSlot(slots.loadBalancer);
  const targetSlot = currentSlot === slots.blueSlot ? slots.greenSlot : slots.blueSlot;
  
  console.log(`Current slot: ${currentSlot}`);
  console.log(`Target slot: ${targetSlot}`);
  
  if (!rollback) {
    // Deploy new version to inactive slot
    console.info(`📦 Deploying version ${version} to ${targetSlot}...`);
    await deployToSlot(targetSlot, version);
    
    // Health check
    console.info('🏥 Running health checks...');
    const healthy = await healthCheck(targetSlot);
    
    if (!healthy) {
      throw new Error('Health check failed');
    }
  }
  
  // Switch traffic
  console.info(`🔄 Switching traffic to ${targetSlot}...`);
  await switchTraffic(slots.loadBalancer, targetSlot);
  
  // Verify switch
  await new Promise(resolve => setTimeout(resolve, 5000));
  const newActiveSlot = await getCurrentActiveSlot(slots.loadBalancer);
  
  if (newActiveSlot !== targetSlot) {
    throw new Error('Traffic switch verification failed');
  }
  
  console.log(`✅ ${rollback ? 'Rollback' : 'Deployment'} completed successfully`);
  
  return {
    environment,
    version: rollback ? 'previous' : version,
    activeSlot: newActiveSlot,
    previousSlot: currentSlot
  };
}

async function getCurrentActiveSlot(loadBalancer) {
  // Simulate load balancer API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return 'staging-blue'; // Mock response
}

async function deployToSlot(slot, version) {
  // Simulate deployment
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function healthCheck(slot) {
  // Simulate health check
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Math.random() > 0.1; // 90% success rate
}

async function switchTraffic(loadBalancer, targetSlot) {
  // Simulate traffic switch
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Infrastructure Monitoring

```javascript
// monitor-infrastructure.js
export const description = "Monitor infrastructure health and send alerts";

export async function execute(context) {
  const console = context.console || global.console;
  
  const thresholds = {
    cpu: parseInt(context.env.CPU_THRESHOLD || '80'),
    memory: parseInt(context.env.MEMORY_THRESHOLD || '85'),
    disk: parseInt(context.env.DISK_THRESHOLD || '90'),
    responseTime: parseInt(context.env.RESPONSE_TIME_THRESHOLD || '1000')
  };
  
  const services = [
    { name: 'API Server', url: 'https://api.example.com/health' },
    { name: 'Database', url: 'https://db.example.com/health' },
    { name: 'Cache', url: 'https://cache.example.com/health' },
    { name: 'Queue', url: 'https://queue.example.com/health' }
  ];
  
  console.info('🔍 Starting infrastructure monitoring...');
  
  const results = {
    timestamp: new Date().toISOString(),
    services: {},
    alerts: []
  };
  
  // Check each service
  for (const service of services) {
    try {
      const startTime = Date.now();
      
      const response = await fetch(service.url, {
        signal: AbortSignal.timeout(10000)
      });
      
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      results.services[service.name] = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        metrics: data
      };
      
      // Check thresholds
      if (data.cpu > thresholds.cpu) {
        results.alerts.push({
          service: service.name,
          metric: 'CPU',
          value: data.cpu,
          threshold: thresholds.cpu,
          severity: 'warning'
        });
      }
      
      if (data.memory > thresholds.memory) {
        results.alerts.push({
          service: service.name,
          metric: 'Memory',
          value: data.memory,
          threshold: thresholds.memory,
          severity: 'critical'
        });
      }
      
      if (responseTime > thresholds.responseTime) {
        results.alerts.push({
          service: service.name,
          metric: 'Response Time',
          value: responseTime,
          threshold: thresholds.responseTime,
          severity: 'warning'
        });
      }
      
      console.log(`✅ ${service.name}: ${responseTime}ms`);
      
    } catch (error) {
      results.services[service.name] = {
        status: 'error',
        error: error.message
      };
      
      results.alerts.push({
        service: service.name,
        metric: 'Availability',
        value: 'down',
        severity: 'critical'
      });
      
      console.error(`❌ ${service.name}: ${error.message}`);
    }
  }
  
  // Send alerts if any
  if (results.alerts.length > 0) {
    await sendAlerts(results.alerts, context.env.SLACK_WEBHOOK);
    console.warn(`⚠️  ${results.alerts.length} alerts generated`);
  } else {
    console.log('✅ All services healthy');
  }
  
  return results;
}

async function sendAlerts(alerts, webhookUrl) {
  if (!webhookUrl) return;
  
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  
  const message = {
    text: `🚨 Infrastructure Alert: ${criticalAlerts.length} critical, ${warningAlerts.length} warnings`,
    attachments: alerts.map(alert => ({
      color: alert.severity === 'critical' ? 'danger' : 'warning',
      fields: [
        { title: 'Service', value: alert.service, short: true },
        { title: 'Metric', value: alert.metric, short: true },
        { title: 'Value', value: alert.value, short: true },
        { title: 'Threshold', value: alert.threshold, short: true }
      ]
    }))
  };
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}
```

## Business Process Automation

### Invoice Processing Workflow

```javascript
// process-invoices.js
export const description = "Automated invoice processing with approval workflow";

export async function execute(context) {
  const console = context.console || global.console;
  const fs = await import('fs/promises');
  
  const invoiceDir = context.env.INVOICE_DIR || './invoices';
  const approvalThreshold = parseFloat(context.env.APPROVAL_THRESHOLD || '1000');
  
  console.info('📄 Processing invoices...');
  
  const files = await fs.readdir(invoiceDir);
  const invoiceFiles = files.filter(f => f.endsWith('.pdf') || f.endsWith('.json'));
  
  const results = {
    processed: 0,
    approved: 0,
    pendingApproval: 0,
    errors: 0,
    invoices: []
  };
  
  for (const file of invoiceFiles) {
    try {
      console.log(`📋 Processing: ${file}`);
      
      // Extract invoice data (simplified)
      const invoice = await extractInvoiceData(`${invoiceDir}/${file}`);
      
      // Validate invoice
      const validation = validateInvoice(invoice);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Determine approval requirement
      const requiresApproval = invoice.amount > approvalThreshold;
      
      if (requiresApproval) {
        await sendForApproval(invoice);
        results.pendingApproval++;
        console.log(`⏳ Sent for approval: ${invoice.number} ($${invoice.amount})`);
      } else {
        await autoApprove(invoice);
        results.approved++;
        console.log(`✅ Auto-approved: ${invoice.number} ($${invoice.amount})`);
      }
      
      results.invoices.push({
        file,
        number: invoice.number,
        amount: invoice.amount,
        vendor: invoice.vendor,
        status: requiresApproval ? 'pending_approval' : 'approved'
      });
      
      results.processed++;
      
    } catch (error) {
      console.error(`❌ Error processing ${file}: ${error.message}`);
      results.errors++;
    }
  }
  
  console.info(`📊 Processing complete: ${results.processed} invoices, ${results.approved} approved, ${results.pendingApproval} pending`);
  
  return results;
}

async function extractInvoiceData(filePath) {
  // Simulate OCR/data extraction
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    number: `INV-${Date.now()}`,
    amount: Math.floor(Math.random() * 5000) + 100,
    vendor: 'Example Vendor',
    date: new Date().toISOString(),
    items: [
      { description: 'Service', quantity: 1, price: 500 }
    ]
  };
}

function validateInvoice(invoice) {
  const errors = [];
  
  if (!invoice.number) errors.push('Missing invoice number');
  if (!invoice.amount || invoice.amount <= 0) errors.push('Invalid amount');
  if (!invoice.vendor) errors.push('Missing vendor');
  if (!invoice.date) errors.push('Missing date');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function sendForApproval(invoice) {
  // Send approval request (email, Slack, etc.)
  console.log(`📧 Approval request sent for invoice ${invoice.number}`);
}

async function autoApprove(invoice) {
  // Auto-approve and process payment
  console.log(`💰 Auto-approved invoice ${invoice.number}`);
}
```

### Customer Onboarding Automation

```javascript
// customer-onboarding.js
export const description = "Automated customer onboarding workflow";

export async function execute(context) {
  const console = context.console || global.console;
  
  const customerId = context.params.customerId;
  if (!customerId) {
    throw new Error('customerId parameter is required');
  }
  
  console.info(`👤 Starting onboarding for customer: ${customerId}`);
  
  const workflow = [
    { step: 'createAccount', name: 'Create Account' },
    { step: 'sendWelcomeEmail', name: 'Send Welcome Email' },
    { step: 'setupBilling', name: 'Setup Billing' },
    { step: 'createInitialResources', name: 'Create Initial Resources' },
    { step: 'scheduleOnboardingCall', name: 'Schedule Onboarding Call' },
    { step: 'sendGettingStartedGuide', name: 'Send Getting Started Guide' }
  ];
  
  const results = {
    customerId,
    startTime: new Date().toISOString(),
    steps: [],
    success: true
  };
  
  for (const { step, name } of workflow) {
    try {
      console.log(`🔄 ${name}...`);
      const stepResult = await executeOnboardingStep(step, customerId);
      
      results.steps.push({
        step,
        name,
        status: 'completed',
        result: stepResult,
        completedAt: new Date().toISOString()
      });
      
      console.log(`✅ ${name} completed`);
      
    } catch (error) {
      console.error(`❌ ${name} failed: ${error.message}`);
      
      results.steps.push({
        step,
        name,
        status: 'failed',
        error: error.message,
        failedAt: new Date().toISOString()
      });
      
      // Decide whether to continue or stop
      if (step === 'createAccount') {
        results.success = false;
        break; // Critical step failed
      }
      
      // Continue with other steps for non-critical failures
    }
  }
  
  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);
  
  const completedSteps = results.steps.filter(s => s.status === 'completed').length;
  console.info(`📊 Onboarding ${results.success ? 'completed' : 'failed'}: ${completedSteps}/${workflow.length} steps successful`);
  
  // Send summary notification
  await sendOnboardingSummary(results);
  
  return results;
}

async function executeOnboardingStep(step, customerId) {
  // Simulate step execution
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  switch (step) {
    case 'createAccount':
      return { accountId: `acc_${customerId}`, status: 'active' };
    
    case 'sendWelcomeEmail':
      return { emailId: `email_${Date.now()}`, sent: true };
    
    case 'setupBilling':
      return { billingId: `bill_${customerId}`, plan: 'starter' };
    
    case 'createInitialResources':
      return { 
        resources: [
          { type: 'project', id: `proj_${customerId}` },
          { type: 'api_key', id: `key_${customerId}` }
        ]
      };
    
    case 'scheduleOnboardingCall':
      const callDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return { callId: `call_${customerId}`, scheduledFor: callDate.toISOString() };
    
    case 'sendGettingStartedGuide':
      return { guideId: `guide_${customerId}`, sent: true };
    
    default:
      throw new Error(`Unknown step: ${step}`);
  }
}

async function sendOnboardingSummary(results) {
  console.log(`📧 Sending onboarding summary for customer ${results.customerId}`);
  // Send email/notification with results
}
```

## Monitoring and Analytics

### Performance Analytics Dashboard

```javascript
// generate-analytics.js
export const description = "Generate performance analytics and reports";

export async function execute(context) {
  const console = context.console || global.console;
  
  const timeRange = context.params.timeRange || '24h';
  const metrics = context.params.metrics?.split(',') || ['response_time', 'error_rate', 'throughput'];
  
  console.info(`📊 Generating analytics for ${timeRange}...`);
  
  const analytics = {
    timeRange,
    generatedAt: new Date().toISOString(),
    metrics: {},
    summary: {},
    alerts: []
  };
  
  // Collect metrics
  for (const metric of metrics) {
    console.log(`📈 Collecting ${metric} data...`);
    analytics.metrics[metric] = await collectMetric(metric, timeRange);
  }
  
  // Generate summary
  analytics.summary = {
    avgResponseTime: calculateAverage(analytics.metrics.response_time?.values || []),
    errorRate: calculateErrorRate(analytics.metrics.error_rate?.values || []),
    totalRequests: analytics.metrics.throughput?.total || 0,
    peakHour: findPeakHour(analytics.metrics.throughput?.hourly || [])
  };
  
  // Check for alerts
  if (analytics.summary.avgResponseTime > 1000) {
    analytics.alerts.push({
      type: 'performance',
      message: `High average response time: ${analytics.summary.avgResponseTime}ms`,
      severity: 'warning'
    });
  }
  
  if (analytics.summary.errorRate > 5) {
    analytics.alerts.push({
      type: 'reliability',
      message: `High error rate: ${analytics.summary.errorRate}%`,
      severity: 'critical'
    });
  }
  
  // Generate report
  const reportPath = `${context.tmpDir}/analytics-${Date.now()}.json`;
  const fs = await import('fs/promises');
  await fs.writeFile(reportPath, JSON.stringify(analytics, null, 2));
  
  console.log(`📋 Analytics report generated: ${reportPath}`);
  console.info(`📊 Summary: ${analytics.summary.totalRequests} requests, ${analytics.summary.avgResponseTime}ms avg response, ${analytics.summary.errorRate}% error rate`);
  
  return {
    ...analytics,
    reportPath
  };
}

async function collectMetric(metric, timeRange) {
  // Simulate metric collection from monitoring system
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = Date.now();
  const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
  
  switch (metric) {
    case 'response_time':
      return {
        values: Array.from({ length: hours }, () => Math.random() * 1000 + 200),
        unit: 'ms'
      };
    
    case 'error_rate':
      return {
        values: Array.from({ length: hours }, () => Math.random() * 10),
        unit: '%'
      };
    
    case 'throughput':
      const hourly = Array.from({ length: hours }, () => Math.floor(Math.random() * 1000 + 100));
      return {
        hourly,
        total: hourly.reduce((sum, val) => sum + val, 0),
        unit: 'requests/hour'
      };
    
    default:
      return { values: [], unit: 'unknown' };
  }
}

function calculateAverage(values) {
  return values.length > 0 ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length) : 0;
}

function calculateErrorRate(values) {
  return values.length > 0 ? Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 100) / 100 : 0;
}

function findPeakHour(hourlyData) {
  if (hourlyData.length === 0) return null;
  
  const maxValue = Math.max(...hourlyData);
  const peakIndex = hourlyData.indexOf(maxValue);
  
  return {
    hour: peakIndex,
    requests: maxValue
  };
}
```

## Integration Examples

### Slack Bot Integration

```javascript
// slack-bot-commands.js
export const description = "Handle Slack bot commands and interactions";

export async function execute(context) {
  const console = context.console || global.console;
  
  const command = context.params.command;
  const userId = context.params.userId;
  const channelId = context.params.channelId;
  
  console.info(`🤖 Processing Slack command: ${command} from user ${userId}`);
  
  const commands = {
    '/deploy': handleDeployCommand,
    '/status': handleStatusCommand,
    '/metrics': handleMetricsCommand,
    '/help': handleHelpCommand
  };
  
  const handler = commands[command];
  if (!handler) {
    return {
      response_type: 'ephemeral',
      text: `Unknown command: ${command}. Type /help for available commands.`
    };
  }
  
  try {
    const result = await handler(context.params);
    
    // Send response back to Slack
    await sendSlackResponse(context.env.SLACK_WEBHOOK, {
      channel: channelId,
      user: userId,
      ...result
    });
    
    return result;
    
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    
    return {
      response_type: 'ephemeral',
      text: `Command failed: ${error.message}`
    };
  }
}

async function handleDeployCommand(params) {
  const environment = params.text || 'staging';
  
  // Trigger deployment
  console.log(`🚀 Triggering deployment to ${environment}`);
  
  return {
    response_type: 'in_channel',
    text: `🚀 Deployment to ${environment} started by <@${params.userId}>`,
    attachments: [{
      color: 'good',
      fields: [
        { title: 'Environment', value: environment, short: true },
        { title: 'Status', value: 'In Progress', short: true }
      ]
    }]
  };
}

async function handleStatusCommand(params) {
  // Get system status
  const services = ['API', 'Database', 'Cache', 'Queue'];
  const statuses = services.map(service => ({
    name: service,
    status: Math.random() > 0.1 ? 'healthy' : 'unhealthy'
  }));
  
  const healthyCount = statuses.filter(s => s.status === 'healthy').length;
  
  return {
    response_type: 'ephemeral',
    text: `System Status: ${healthyCount}/${services.length} services healthy`,
    attachments: [{
      color: healthyCount === services.length ? 'good' : 'warning',
      fields: statuses.map(s => ({
        title: s.name,
        value: s.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy',
        short: true
      }))
    }]
  };
}

async function handleMetricsCommand(params) {
  // Get key metrics
  const metrics = {
    'Response Time': '245ms',
    'Error Rate': '0.12%',
    'Throughput': '1,234 req/min',
    'Uptime': '99.98%'
  };
  
  return {
    response_type: 'ephemeral',
    text: 'Current System Metrics',
    attachments: [{
      color: 'good',
      fields: Object.entries(metrics).map(([key, value]) => ({
        title: key,
        value,
        short: true
      }))
    }]
  };
}

async function handleHelpCommand(params) {
  return {
    response_type: 'ephemeral',
    text: 'Available Commands:',
    attachments: [{
      color: 'good',
      text: [
        '`/deploy [environment]` - Deploy to environment (default: staging)',
        '`/status` - Show system status',
        '`/metrics` - Show current metrics',
        '`/help` - Show this help message'
      ].join('\n')
    }]
  };
}

async function sendSlackResponse(webhookUrl, message) {
  if (!webhookUrl) return;
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}
```

## Related Documentation

- [CLI Examples](/examples/cli) - Command-line usage examples
- [Library Examples](/examples/library) - Programmatic integration examples
- [Best Practices](/guides/best-practices) - Development best practices
- [Writing Scripts](/guides/writing-scripts) - Script development guide
- [TypeScript Guide](/guides/typescript) - TypeScript integration patterns 