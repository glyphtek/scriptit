// scripts/data-processor.ts
// Data processing script example

import fs from 'node:fs/promises';

export const description = "Processes data with tearUp and tearDown";

export async function tearUp(context: any) {
  context.log("🔧 TearUp: Initializing data processor");
  
  const processingId = `proc_${Date.now()}`;
  const dataFile = `${context.tmpDir}/data_${processingId}.json`;
  
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
  context.log(`📄 Created data file: ${dataFile}`);
  
  return { processingId, dataFile };
}

export async function execute(context: any, tearUpResult: any) {
  context.log("⚡ Execute: Processing data");
  
  // Read and process data
  const data = JSON.parse(await fs.readFile(tearUpResult.dataFile, 'utf-8'));
  context.log(`📊 Processing ${data.items.length} items`);
  
  const processedData = {
    ...data,
    totalValue: data.items.reduce((sum: number, item: any) => sum + item.value, 0),
    processedAt: new Date().toISOString(),
  };
  
  // Save processed data
  const outputFile = `${context.tmpDir}/processed_${tearUpResult.processingId}.json`;
  await fs.writeFile(outputFile, JSON.stringify(processedData, null, 2));
  
  context.log(`💾 Saved processed data: ${outputFile}`);
  context.log(`💰 Total value: ${processedData.totalValue}`);
  
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
    context.log(`✅ Processing completed successfully`);
    context.log(`📈 Processed ${executeResult.itemCount} items with total value ${executeResult.totalValue}`);
  }
  
  // In a real scenario, you might clean up temporary files here
  context.log("🗑️  Cleanup completed");
}