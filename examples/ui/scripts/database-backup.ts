// example/scripts/database-backup.ts
// Example database backup script

export const description = "Simulates a database backup process with validation";

export async function tearUp(context: any) {
  context.log("TearUp: Preparing backup environment...");
  
  // Validate required environment variables
  const requiredVars = ['DATABASE_URL'];
  for (const varName of requiredVars) {
    if (!context.env[varName]) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
  }
  
  const backupDir = `${context.tmpDir}/backups`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `${backupDir}/backup-${timestamp}.sql`;
  
  // Create backup directory
  await Bun.write(`${backupDir}/.gitkeep`, "");
  
  context.log(`TearUp: Backup directory prepared: ${backupDir}`);
  context.log(`TearUp: Backup file will be: ${backupFile}`);
  
  return {
    backupDir,
    backupFile,
    timestamp,
    databaseUrl: context.env.DATABASE_URL,
  };
}

export async function execute(context: any, tearUpResult: any) {
  context.log("Execute: Starting database backup...");
  context.log(`Execute: Database URL: ${tearUpResult.databaseUrl}`);
  context.log(`Execute: Backup file: ${tearUpResult.backupFile}`);
  
  // Simulate backup process
  context.log("Execute: Connecting to database...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  context.log("Execute: Dumping database schema...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  context.log("Execute: Dumping database data...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create a mock backup file
  const backupContent = `-- Database Backup
-- Generated: ${tearUpResult.timestamp}
-- Database: ${tearUpResult.databaseUrl}

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);

INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com');
`;
  
  await Bun.write(tearUpResult.backupFile, backupContent);
  
  const file = Bun.file(tearUpResult.backupFile);
  const fileSize = file.size;
  context.log(`Execute: Backup completed! File size: ${fileSize} bytes`);
  
  return {
    success: true,
    backupFile: tearUpResult.backupFile,
    fileSize,
    recordsBackedUp: 2,
  };
}

export async function tearDown(context: any, executeResult: any, tearUpResult: any) {
  context.log("TearDown: Finalizing backup process...");
  
  if (executeResult.success) {
    context.log(`TearDown: Backup successful - ${executeResult.recordsBackedUp} records backed up`);
    context.log(`TearDown: Backup file: ${executeResult.backupFile}`);
    context.log("TearDown: You might want to upload this to cloud storage");
  } else {
    context.log("TearDown: Backup failed - cleaning up partial files");
    // In a real scenario, you might delete partial backup files here
  }
  
  context.log("TearDown: Backup process completed");
} 