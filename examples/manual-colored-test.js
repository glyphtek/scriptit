// examples/manual-colored-test.js
// Test script to manually demonstrate colored console output

export const description = "Manual test for colored console output";

export async function execute(context) {
  context.log("=== Manual Colored Console Test ===");
  
  // Import chalk for manual coloring
  const chalk = await import('chalk');
  
  // Manually demonstrate what colored console interception should look like
  context.log(chalk.default.white("This would be a console.log message (white)"));
  context.log(chalk.default.red("This would be a console.error message (red)"));
  context.log(chalk.default.yellow("This would be a console.warn message (yellow)"));
  context.log(chalk.default.blue("This would be a console.info message (blue)"));
  context.log(chalk.default.gray("This would be a console.debug message (gray)"));
  
  context.log("\n--- With level prefixes ---");
  
  context.log(chalk.default.white('[LOG]') + ' ' + chalk.default.white("Log message with prefix"));
  context.log(chalk.default.red.bold('[ERROR]') + ' ' + chalk.default.red("Error message with prefix"));
  context.log(chalk.default.yellow.bold('[WARN]') + ' ' + chalk.default.yellow("Warning message with prefix"));
  context.log(chalk.default.blue.bold('[INFO]') + ' ' + chalk.default.blue("Info message with prefix"));
  context.log(chalk.default.gray('[DEBUG]') + ' ' + chalk.default.gray("Debug message with prefix"));
  
  context.log("=== Manual Colored Console Test Complete ===");
  
  return { 
    success: true, 
    message: "Manual colored console test completed"
  };
} 