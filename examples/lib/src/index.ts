// examples/lib/src/index.ts
// ScriptIt Library Example - Programmatic Usage

import { createScriptRunner } from '@glyphtek/scriptit';
import path from 'node:path';

async function main() {
  console.log('🚀 Script Runner Library Example\n');

  try {
    // Create a script runner instance
    const runner = await createScriptRunner({
      scriptsDir: path.join(process.cwd(), 'scripts'),
      tmpDir: path.join(process.cwd(), 'tmp'),
      envFiles: ['.env'],
      excludePatterns: ['*.helper.*', '_*'],
      defaultParams: {
        appName: 'Library Example App',
        version: '1.0.0',
      },
    });

    console.log('✅ Script runner initialized successfully');
    console.log(`📁 Scripts directory: ${runner.config.scriptsDir}`);
    console.log(`📁 Temp directory: ${runner.config.tmpDir}`);
    console.log(`🔧 Exclude patterns: ${runner.config.excludePatterns?.join(', ') || 'None'}`);
    console.log(`📍 Working directory: ${process.cwd()}\n`);

    // Demonstrate working directory usage
    console.log('💡 Working Directory Example:');
    console.log('   You can also use workingDirectory option:');
    console.log('   const runner = await createScriptRunner({');
    console.log('     workingDirectory: "/path/to/project",');
    console.log('     scriptsDir: "./scripts",  // Resolves from workingDirectory');
    console.log('     tmpDir: "./tmp",');
    console.log('   });\n');

    // List available scripts
    console.log('📋 Listing available scripts...');
    const scripts = await runner.listScripts();
    
    if (scripts.length === 0) {
      console.log('⚠️  No scripts found. Creating example scripts...\n');
      await createExampleScripts();
      
      // Re-list scripts after creation
      const newScripts = await runner.listScripts();
      console.log('📋 Available scripts:');
      newScripts.forEach((script, index) => {
        console.log(`  ${index + 1}. ${script}`);
      });
    } else {
      console.log('📋 Available scripts:');
      scripts.forEach((script, index) => {
        console.log(`  ${index + 1}. ${script}`);
      });
    }

    console.log('\n🎯 Executing example script...');
    
    // Execute a script programmatically
    try {
      const result = await runner.executeScript('example.ts', {
        params: {
          customMessage: 'Hello from library usage!',
        },
        env: {
          EXECUTION_MODE: 'library',
        },
      });
      
      console.log('✅ Script execution completed');
      console.log('📤 Result:', result);
    } catch (error) {
      console.error('❌ Script execution failed:', error);
    }

    // Demonstrate event handling
    console.log('\n🎧 Setting up event listeners...');
    
    runner.on('script:beforeExecute', (scriptPath, params) => {
      console.log(`🔄 About to execute: ${path.basename(scriptPath)}`);
    });
    
    runner.on('script:afterExecute', (scriptPath, result) => {
      console.log(`✅ Completed: ${path.basename(scriptPath)}`);
    });
    
    runner.on('script:error', (scriptPath, error) => {
      console.log(`❌ Error in: ${path.basename(scriptPath)} - ${error.message}`);
    });

    // Execute another script with event handling
    console.log('\n🎯 Executing another script with event handling...');
    try {
      await runner.executeScript('data-processor.ts');
    } catch (error) {
      // Error already logged by event handler
    }

    console.log('\n🎉 Library example completed successfully!');
    
  } catch (error) {
    console.error('💥 Failed to initialize script runner:', error);
    process.exit(1);
  }
}

async function createExampleScripts() {
  const fs = await import('node:fs/promises');
  
  // Create example.ts
  const exampleScript = `// scripts/example.ts
// Example script for library usage

export const description = "Example script demonstrating library integration";

export async function execute(context: any) {
  context.log("🎯 Executing example script from library");
  context.log(\`📱 App: \${context.appName || "Unknown"}\`);
  context.log(\`🔢 Version: \${context.version || "Unknown"}\`);
  context.log(\`💬 Custom message: \${context.params?.customMessage || "No message"}\`);
  context.log(\`🔧 Execution mode: \${context.env.EXECUTION_MODE || "unknown"}\`);
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: "Example script completed",
    timestamp: new Date().toISOString(),
  };
}`;

  // Create data-processor.ts
  const dataProcessorScript = `// scripts/data-processor.ts
// Data processing script example

export const description = "Processes data with tearUp and tearDown";

export async function tearUp(context: any) {
  context.log("🔧 TearUp: Initializing data processor");
  
  const processingId = \`proc_\${Date.now()}\`;
  const dataFile = \`\${context.tmpDir}/data_\${processingId}.json\`;
  
  // Create sample data
  const sampleData = {
    id: processingId,
    items: [
      { name: "Item 1", value: 100 },
      { name: "Item 2", value: 200 },
      { name: "Item 3", value: 300 },
    ],
    createdAt: new Date().toISOString(),
  };
  
  await fs.writeFile(dataFile, JSON.stringify(sampleData, null, 2));
  context.log(\`📄 Created data file: \${dataFile}\`);
  
  return { processingId, dataFile };
}

export async function execute(context: any, tearUpResult: any) {
  context.log("⚡ Execute: Processing data");
  
  // Read and process data
  const data = JSON.parse(await fs.readFile(tearUpResult.dataFile, 'utf-8'));
  context.log(\`📊 Processing \${data.items.length} items\`);
  
  const processedData = {
    ...data,
    totalValue: data.items.reduce((sum: number, item: any) => sum + item.value, 0),
    processedAt: new Date().toISOString(),
  };
  
  // Save processed data
  const outputFile = \`\${context.tmpDir}/processed_\${tearUpResult.processingId}.json\`;
  await fs.writeFile(outputFile, JSON.stringify(processedData, null, 2));
  
  context.log(\`💾 Saved processed data: \${outputFile}\`);
  context.log(\`💰 Total value: \${processedData.totalValue}\`);
  
  return {
    success: true,
    outputFile,
    totalValue: processedData.totalValue,
    itemCount: data.items.length,
  };
}

export async function tearDown(context: any, executeResult: any, tearUpResult: any) {
  context.log("🧹 TearDown: Cleaning up");
  
  if (executeResult.success) {
    context.log(\`✅ Processing completed successfully\`);
    context.log(\`📈 Processed \${executeResult.itemCount} items with total value \${executeResult.totalValue}\`);
  }
  
  // In a real scenario, you might clean up temporary files here
  context.log("🗑️  Cleanup completed");
}`;

  await fs.writeFile('examples/lib/scripts/example.ts', exampleScript);
  await fs.writeFile('examples/lib/scripts/data-processor.ts', dataProcessorScript);
  
  console.log('📝 Created example scripts:');
  console.log('  - scripts/example.ts');
  console.log('  - scripts/data-processor.ts');
}

// Run the example
main().catch(console.error);