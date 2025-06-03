# CLI Examples

This page provides practical examples of using ScriptIt from the command line, covering common workflows, environment variable usage, and error handling scenarios.

## Basic Script Execution

### Simple Script Execution

```bash
# Execute a script
scriptit exec hello-world.js

# Execute with specific runtime
scriptit exec --runtime=bun hello-world.js
scriptit exec --runtime=node hello-world.js
scriptit exec --runtime=deno hello-world.js

# Execute TypeScript script
scriptit exec process-data.ts
```

### Script Discovery and Listing

```bash
# List all available scripts
scriptit list

# List scripts with descriptions
scriptit list --verbose

# List scripts in specific directory
scriptit list --dir=./automation-scripts

# Filter scripts by pattern
scriptit list --filter="backup*"
scriptit list --filter="*deploy*"
```

## Environment Variables

### Setting Environment Variables

```bash
# Single environment variable
scriptit exec backup-database.js --env DATABASE_URL=postgresql://localhost:5432/mydb

# Multiple environment variables
scriptit exec sync-data.js \
  --env API_KEY=abc123 \
  --env API_ENDPOINT=https://api.example.com \
  --env TIMEOUT=30000

# Using environment files
scriptit exec deploy.js --env-file=.env.production

# Combining environment file and variables
scriptit exec migrate.js \
  --env-file=.env.staging \
  --env MIGRATION_VERSION=2024.01.15
```

### Environment Variable Examples

```bash
# Development environment
scriptit exec process-users.js \
  --env NODE_ENV=development \
  --env DEBUG=true \
  --env BATCH_SIZE=10

# Production environment
scriptit exec process-users.js \
  --env NODE_ENV=production \
  --env DEBUG=false \
  --env BATCH_SIZE=1000 \
  --env LOG_LEVEL=info

# Testing with mock data
scriptit exec api-integration.js \
  --env NODE_ENV=test \
  --env API_ENDPOINT=http://localhost:3001 \
  --env USE_MOCK_DATA=true
```

## Script Parameters

### Passing Parameters

```bash
# Single parameter
scriptit exec process-user.js --param userId=123

# Multiple parameters
scriptit exec generate-report.js \
  --param startDate=2024-01-01 \
  --param endDate=2024-01-31 \
  --param format=pdf

# Complex parameters
scriptit exec bulk-update.js \
  --param userIds='[1,2,3,4,5]' \
  --param config='{"batchSize":50,"dryRun":false}'

# Boolean parameters
scriptit exec cleanup.js \
  --param dryRun=true \
  --param verbose=false \
  --param force=true
```

### Parameter Examples by Use Case

```bash
# Data processing
scriptit exec process-csv.js \
  --param inputFile=data.csv \
  --param outputFile=processed.json \
  --param delimiter=, \
  --param skipHeader=true

# API synchronization
scriptit exec sync-users.js \
  --param since=2024-01-01T00:00:00Z \
  --param batchSize=100 \
  --param dryRun=false

# Deployment
scriptit exec deploy-app.js \
  --param environment=staging \
  --param version=v1.2.3 \
  --param rollback=false
```

## Common Workflows

### Development Workflow

```bash
# 1. List available scripts
scriptit list

# 2. Test script in development
scriptit exec my-script.js \
  --env NODE_ENV=development \
  --env DEBUG=true \
  --param dryRun=true

# 3. Run with verbose output
scriptit exec my-script.js \
  --env NODE_ENV=development \
  --env DEBUG=true \
  --verbose

# 4. Test with different runtimes
scriptit exec --runtime=node my-script.js
scriptit exec --runtime=bun my-script.js
scriptit exec --runtime=deno my-script.js
```

### Data Processing Workflow

```bash
# 1. Validate input data
scriptit exec validate-data.js \
  --param inputFile=raw-data.csv \
  --env STRICT_VALIDATION=true

# 2. Process data in batches
scriptit exec process-data.js \
  --param inputFile=raw-data.csv \
  --param outputFile=processed-data.json \
  --env BATCH_SIZE=1000 \
  --env PARALLEL_WORKERS=4

# 3. Generate reports
scriptit exec generate-report.js \
  --param dataFile=processed-data.json \
  --param reportType=summary \
  --env OUTPUT_FORMAT=pdf
```

### Deployment Workflow

```bash
# 1. Pre-deployment checks
scriptit exec pre-deploy-checks.js \
  --env ENVIRONMENT=staging \
  --param version=v1.2.3

# 2. Deploy to staging
scriptit exec deploy.js \
  --env ENVIRONMENT=staging \
  --env TARGET_SERVERS='["staging-1","staging-2"]' \
  --param version=v1.2.3

# 3. Run smoke tests
scriptit exec smoke-tests.js \
  --env ENVIRONMENT=staging \
  --env TEST_TIMEOUT=30000

# 4. Deploy to production (if staging passes)
scriptit exec deploy.js \
  --env ENVIRONMENT=production \
  --env TARGET_SERVERS='["prod-1","prod-2","prod-3"]' \
  --param version=v1.2.3 \
  --param rollback=false
```

### Backup and Maintenance Workflow

```bash
# 1. Create database backup
scriptit exec backup-database.js \
  --env DATABASE_URL=postgresql://localhost:5432/prod \
  --env BACKUP_LOCATION=s3://backups/$(date +%Y%m%d) \
  --param compress=true

# 2. Clean up old logs
scriptit exec cleanup-logs.js \
  --env LOG_DIRECTORY=/var/log/myapp \
  --param retentionDays=30 \
  --param dryRun=false

# 3. Update system dependencies
scriptit exec update-dependencies.js \
  --env ENVIRONMENT=production \
  --param updateType=security \
  --param autoRestart=false

# 4. Generate maintenance report
scriptit exec maintenance-report.js \
  --param reportDate=$(date +%Y-%m-%d) \
  --env EMAIL_RECIPIENTS='["admin@company.com","ops@company.com"]'
```

## Terminal UI (TUI) Examples

### Launching TUI

```bash
# Launch interactive TUI
scriptit run

# Launch TUI with specific configuration
scriptit run --config=./custom-config.js

# Launch TUI in specific directory
scriptit run --dir=./automation-scripts

# Launch TUI with environment variables
scriptit run --env NODE_ENV=development --env DEBUG=true
```

### TUI Navigation Examples

```bash
# TUI supports these keyboard shortcuts:
# Tab - Switch between panels
# Enter - Execute selected script
# j/k or ↑/↓ - Navigate script list
# C - Toggle configuration panel
# F - Toggle files panel
# R - Refresh script list
# Q - Quit TUI
```

## Error Handling and Debugging

### Debugging Failed Scripts

```bash
# Run with debug output
scriptit exec failing-script.js \
  --env DEBUG=true \
  --env LOG_LEVEL=debug \
  --verbose

# Run with specific runtime for debugging
scriptit exec --runtime=node failing-script.js \
  --env DEBUG=true

# Test with dry run
scriptit exec risky-script.js \
  --param dryRun=true \
  --env DEBUG=true
```

### Common Error Scenarios

```bash
# Missing environment variables
scriptit exec api-script.js
# Error: Missing required environment variables: API_KEY

# Fix: Provide required environment variables
scriptit exec api-script.js --env API_KEY=your-key-here

# Script not found
scriptit exec non-existent-script.js
# Error: Script not found: non-existent-script.js

# Fix: Check available scripts
scriptit list

# Runtime not available
scriptit exec --runtime=bun script.js
# Error: Bun runtime not found

# Fix: Install Bun or use different runtime
npm install -g bun
# or
scriptit exec --runtime=node script.js

# Permission errors
scriptit exec file-operations.js
# Error: Permission denied

# Fix: Check file permissions or run with appropriate privileges
chmod +x scripts/file-operations.js
# or provide writable temp directory
scriptit exec file-operations.js --env TEMP_DIR=/tmp/scriptit
```

### Validation and Testing

```bash
# Validate script syntax
scriptit exec validate-syntax.js \
  --param scriptPath=./scripts/my-script.js

# Test script with mock data
scriptit exec my-script.js \
  --env NODE_ENV=test \
  --env USE_MOCK_DATA=true \
  --param dryRun=true

# Run script with timeout
timeout 30s scriptit exec long-running-script.js \
  --env TIMEOUT=25000

# Test script with different configurations
scriptit exec config-test.js --config=./test-config.js
scriptit exec config-test.js --config=./prod-config.js
```

## Advanced Usage

### Chaining Scripts

```bash
# Sequential execution
scriptit exec prepare-data.js && \
scriptit exec process-data.js && \
scriptit exec generate-report.js

# Conditional execution
scriptit exec validate-data.js && \
scriptit exec process-data.js || \
echo "Data validation failed"

# Pipeline with shared environment
export API_KEY=abc123
export DATABASE_URL=postgresql://localhost:5432/mydb
scriptit exec fetch-data.js
scriptit exec process-data.js
scriptit exec upload-results.js
```

### Using with CI/CD

```bash
# GitHub Actions example
name: Run Scripts
run: |
  scriptit exec validate-build.js \
    --env CI=true \
    --env GITHUB_SHA=${{ github.sha }}
  
  scriptit exec deploy.js \
    --env ENVIRONMENT=production \
    --env VERSION=${{ github.ref_name }}

# Jenkins example
sh '''
  scriptit exec pre-deploy.js \
    --env BUILD_NUMBER=${BUILD_NUMBER} \
    --env GIT_COMMIT=${GIT_COMMIT}
'''

# Docker example
docker run --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  node:18 \
  npx @glyphtek/scriptit exec deploy.js \
    --env ENVIRONMENT=production
```

### Configuration File Usage

```bash
# Using custom configuration
scriptit exec script.js --config=./custom-scriptit.config.js

# Configuration with environment-specific settings
scriptit exec script.js --config=./configs/production.config.js

# Override configuration with environment variables
scriptit exec script.js \
  --config=./scriptit.config.js \
  --env SCRIPTS_DIR=./custom-scripts \
  --env TMP_DIR=/tmp/custom
```

## Performance and Optimization

### Runtime Selection for Performance

```bash
# Use Bun for fastest TypeScript execution
scriptit exec --runtime=bun typescript-heavy-script.ts

# Use Node.js for maximum compatibility
scriptit exec --runtime=node legacy-script.js

# Use Deno for secure execution
scriptit exec --runtime=deno secure-script.ts

# Let ScriptIt choose optimal runtime
scriptit exec auto-optimized-script.js
```

### Batch Processing Examples

```bash
# Process large datasets in batches
scriptit exec process-large-dataset.js \
  --env BATCH_SIZE=1000 \
  --env PARALLEL_WORKERS=4 \
  --env MEMORY_LIMIT=2048

# Parallel processing with different parameters
scriptit exec process-region.js --param region=us-east-1 &
scriptit exec process-region.js --param region=us-west-2 &
scriptit exec process-region.js --param region=eu-west-1 &
wait

# Sequential processing with progress tracking
for i in {1..10}; do
  scriptit exec process-batch.js \
    --param batchNumber=$i \
    --param totalBatches=10
done
```

### Memory and Resource Management

```bash
# Limit memory usage
scriptit exec memory-intensive-script.js \
  --env NODE_OPTIONS="--max-old-space-size=4096" \
  --env BATCH_SIZE=100

# Set timeouts
scriptit exec long-running-script.js \
  --env SCRIPT_TIMEOUT=300000 \
  --env HTTP_TIMEOUT=30000

# Monitor resource usage
time scriptit exec resource-heavy-script.js \
  --env MONITOR_MEMORY=true \
  --env MONITOR_CPU=true
```

## Real-World Examples

### Database Operations

```bash
# Database backup
scriptit exec backup-database.js \
  --env DATABASE_URL=postgresql://user:pass@localhost:5432/prod \
  --env BACKUP_PATH=/backups/$(date +%Y%m%d_%H%M%S).sql \
  --param compress=true \
  --param verify=true

# Database migration
scriptit exec migrate-database.js \
  --env DATABASE_URL=postgresql://user:pass@localhost:5432/prod \
  --param targetVersion=20240115001 \
  --param dryRun=false \
  --env BACKUP_BEFORE_MIGRATION=true

# Data synchronization
scriptit exec sync-databases.js \
  --env SOURCE_DB=postgresql://localhost:5432/source \
  --env TARGET_DB=postgresql://localhost:5432/target \
  --param tables='["users","orders","products"]' \
  --param batchSize=1000
```

### API Integration

```bash
# Sync data from external API
scriptit exec sync-external-data.js \
  --env API_KEY=your-api-key \
  --env API_ENDPOINT=https://api.external.com \
  --param since=2024-01-01T00:00:00Z \
  --param batchSize=100 \
  --env RATE_LIMIT=10

# Webhook processing
scriptit exec process-webhooks.js \
  --env WEBHOOK_SECRET=your-secret \
  --env QUEUE_URL=redis://localhost:6379 \
  --param maxConcurrent=5 \
  --env RETRY_ATTEMPTS=3

# API health check
scriptit exec api-health-check.js \
  --env API_ENDPOINTS='["https://api1.com","https://api2.com"]' \
  --param timeout=5000 \
  --env ALERT_WEBHOOK=https://hooks.slack.com/...
```

### File Processing

```bash
# Process CSV files
scriptit exec process-csv.js \
  --param inputFile=./data/users.csv \
  --param outputFile=./processed/users.json \
  --env DELIMITER=, \
  --param skipHeader=true \
  --env BATCH_SIZE=1000

# Image processing
scriptit exec process-images.js \
  --param inputDir=./uploads \
  --param outputDir=./processed \
  --env RESIZE_WIDTH=800 \
  --env QUALITY=85 \
  --param formats='["webp","jpg"]'

# Log analysis
scriptit exec analyze-logs.js \
  --param logFile=/var/log/app.log \
  --param startDate=2024-01-01 \
  --param endDate=2024-01-31 \
  --env OUTPUT_FORMAT=json \
  --param metrics='["errors","response_times","requests"]'
```

### Monitoring and Alerts

```bash
# System monitoring
scriptit exec system-monitor.js \
  --env ALERT_THRESHOLDS='{"cpu":80,"memory":90,"disk":95}' \
  --env SLACK_WEBHOOK=https://hooks.slack.com/... \
  --param checkInterval=300

# Application health check
scriptit exec health-check.js \
  --env SERVICES='["api","database","redis","elasticsearch"]' \
  --env TIMEOUT=10000 \
  --param retries=3 \
  --env ALERT_ON_FAILURE=true

# Performance monitoring
scriptit exec performance-monitor.js \
  --env METRICS_ENDPOINT=https://metrics.company.com \
  --param duration=3600 \
  --env SAMPLE_RATE=60 \
  --param alerts='["response_time>1000","error_rate>5"]'
```

## Tips and Best Practices

### Command Line Best Practices

```bash
# Use descriptive parameter names
scriptit exec process-data.js \
  --param inputFile=data.csv \
  --param outputFormat=json \
  --param validateInput=true

# Group related environment variables
export DATABASE_URL=postgresql://localhost:5432/mydb
export DATABASE_POOL_SIZE=10
export DATABASE_TIMEOUT=30000
scriptit exec database-operations.js

# Use configuration files for complex setups
scriptit exec complex-script.js --config=./production.config.js

# Document your commands
# This script processes user data and generates reports
scriptit exec process-users.js \
  --env NODE_ENV=production \
  --param batchSize=1000 \
  --param generateReport=true
```

### Error Prevention

```bash
# Always test with dry run first
scriptit exec risky-operation.js --param dryRun=true

# Validate inputs before processing
scriptit exec validate-inputs.js --param dataFile=input.csv
scriptit exec process-data.js --param dataFile=input.csv

# Use appropriate timeouts
scriptit exec long-operation.js --env TIMEOUT=300000

# Set up proper logging
scriptit exec important-script.js \
  --env LOG_LEVEL=info \
  --env LOG_FILE=./logs/script-$(date +%Y%m%d).log
```

## Related Documentation

- [CLI Commands](/cli/commands) - Complete command reference
- [Configuration](/cli/configuration) - Configuration options
- [Environment Variables](/cli/environment) - Environment variable guide
- [Writing Scripts](/guides/writing-scripts) - Script development guide
- [Library Examples](/examples/library) - Programmatic usage examples 