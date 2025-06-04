// examples/ui/scripts/interactive-example.ts
// This demonstrates the interactive environment variable prompts feature

export const description = "Example script showing interactive environment prompts";

// Declarative method: Define required variables
export const variables = [
  { name: 'API_KEY', message: 'Enter your API key:', type: 'password' as const },
  { name: 'USER_NAME', message: 'Enter your username:', type: 'input' as const },
  'ENVIRONMENT',  // Shorthand - will generate default prompt
  'DEBUG_MODE'    // Shorthand - will generate default prompt
];

export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('🔧 Interactive Environment Example');
  console.log('===============================');
  
  console.log('📊 Environment Variables:');
  console.log(`  API_KEY: ${context.env.API_KEY ? '***hidden***' : 'Not set'}`);
  console.log(`  USER_NAME: ${context.env.USER_NAME || 'Not set'}`);
  console.log(`  ENVIRONMENT: ${context.env.ENVIRONMENT || 'Not set'}`);
  console.log(`  DEBUG_MODE: ${context.env.DEBUG_MODE || 'Not set'}`);
  
  console.info('🎯 Simulating API call...');
  
  if (!context.env.API_KEY) {
    console.error('❌ API_KEY is required but not provided');
    throw new Error('Missing required API_KEY');
  }
  
  if (!context.env.USER_NAME) {
    console.warn('⚠️ USER_NAME not provided, using default');
  }
  
  const config = {
    apiKey: context.env.API_KEY,
    username: context.env.USER_NAME || 'anonymous',
    environment: context.env.ENVIRONMENT || 'development',
    debug: context.env.DEBUG_MODE === 'true'
  };
  
  console.log('✅ Configuration assembled:');
  console.log(`  Username: ${config.username}`);
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Debug Mode: ${config.debug}`);
  console.log(`  API Key: ${'*'.repeat(Math.min(config.apiKey.length, 10))}`);
  
  return {
    success: true,
    config: {
      ...config,
      apiKey: '***hidden***' // Don't return sensitive data
    },
    message: 'Interactive environment variables processed successfully'
  };
} 