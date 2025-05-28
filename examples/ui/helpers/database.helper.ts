// example/helpers/database.helper.ts
// This file should be excluded by the helpers/** pattern

export class DatabaseHelper {
  constructor(private connectionString: string) {}
  
  async connect() {
    console.log(`Connecting to: ${this.connectionString}`);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  async backup(outputPath: string) {
    console.log(`Creating backup at: ${outputPath}`);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  async disconnect() {
    console.log("Disconnecting from database");
  }
} 