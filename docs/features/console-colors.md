# Colored Console Output

One of ScriptIt's standout features is its beautiful colored console output that makes debugging and monitoring script execution much more pleasant and efficient.

## Overview

ScriptIt automatically intercepts console methods and applies color coding based on the log level:

- 🤍 **White** for `console.log()` - Regular information
- 🔴 **Red** for `console.error()` - Errors and critical issues
- 🟡 **Yellow** for `console.warn()` - Warnings and cautions
- 🔵 **Blue** for `console.info()` - Informational messages
- ⚫ **Gray** for `console.debug()` - Debug information

## Enabling Colored Console

### CLI Usage

Colored console output is **enabled by default** when using ScriptIt CLI commands:

```bash
# Colored console is enabled by default
scriptit exec my-script.js

# Interactive TUI mode (also has colored console)
scriptit run
```

No additional flags are needed - just use `context.console` in your scripts.

### Library Usage

Enable console interception when creating a script runner:

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp',
  consoleInterception: {
    enabled: true,
    useColors: true
  }
})

await runner.executeScript('my-script.js')
```

## Using Colored Console in Scripts

### Recommended Approach (Fallback Pattern)

For colored console output, use the fallback pattern to access the enhanced console:

```javascript
// my-script.js
export async function execute(context) {
  // Use context.console with fallback to global console
  const console = context.console || global.console;
  
  console.log('This will be white');
  console.error('This will be red');
  console.warn('This will be yellow');
  console.info('This will be blue');
  console.debug('This will be gray');
}
```

### Direct Context Console Usage

You can also use `context.console` directly:

```javascript
// direct-context.js
export async function execute(context) {
  // Use context.console directly
  context.console.log('This will be white');
  context.console.error('This will be red');
  context.console.warn('This will be yellow');
  context.console.info('This will be blue');
  context.console.debug('This will be gray');
}
```

### Global Console (No Colors)

Using global console directly will **not** have colors:

```javascript
// no-colors.js
export async function execute(context) {
  // Global console - no colors, goes directly to stdout/stderr
  console.log('This will not be colored');
  console.error('This will not be colored');
}
```

**Note**: The global `console` is not automatically intercepted. You must use `context.console` or the fallback pattern to get colored output.

## Advanced Usage

### Object Logging

The colored console handles complex objects safely:

```javascript
// object-logging.js
export const description = "Script demonstrating object logging";

export async function execute(context) {
  const console = context.console || global.console;

  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  };

  console.log('User object:', user);
  console.info('User preferences:', user.preferences);
  
  return { user };
}
```

### Error Objects

Error objects are formatted nicely with stack traces:

```javascript
// error-logging.js
export const description = "Script demonstrating error logging";

export async function execute(context) {
  const console = context.console || global.console;

  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    console.error('Caught error:', error);
    console.warn('Error message:', error.message);
  }
  
  return { errorHandled: true };
}
```

### Arrays and Collections

Arrays and other collections are displayed clearly:

```javascript
// array-logging.js
export const description = "Script demonstrating array logging";

export async function execute(context) {
  const console = context.console || global.console;

  const items = ['apple', 'banana', 'cherry'];
  const numbers = [1, 2, 3, 4, 5];

  console.log('Fruits:', items);
  console.info('Numbers:', numbers);
  
  return { items, numbers };
}
```

### Mixed Arguments

Multiple arguments are handled gracefully:

```javascript
// mixed-args.js
export const description = "Script demonstrating mixed argument logging";

export async function execute(context) {
  const console = context.console || global.console;

  const userId = 123;
  const userName = 'Alice';

  console.log('User login:', userId, userName, new Date());
  console.info('Processing user:', { id: userId, name: userName });
  
  return { userId, userName };
}
```

## Configuration

### Default Behavior

By default, colored console is disabled to maintain compatibility. Enable it explicitly when needed.

### Runtime Compatibility

Colored console works across all supported runtimes:

- ✅ **Bun** - Full support with optimal performance
- ✅ **Node.js** - Full support with chalk integration
- ✅ **Deno** - Full support with built-in color utilities

### Performance Considerations

The colored console implementation is optimized for performance:

- **Minimal overhead** when disabled
- **Safe object serialization** prevents memory leaks
- **Efficient color rendering** using platform-specific methods

## Examples

### Basic Logging Script

```javascript
// basic-logging.js
export const description = "Basic logging script with colored console";

export async function execute(context) {
  context.console.log('Starting application...');
  context.console.info('Loading configuration');

  try {
    context.console.log('Processing data...');
    // Simulate some work
    const result = { processed: 100, errors: 0 };
    context.console.info('Processing complete:', result);
  } catch (error) {
    context.console.error('Processing failed:', error);
  }

  context.console.warn('Remember to check the logs');
  context.console.debug('Debug info: memory usage', process.memoryUsage());
  
  return { status: 'completed' };
}
```

Run with colors:

```bash
scriptit exec basic-logging.js
```

### Error Handling Script

```javascript
// error-handling.js
export const description = "Error handling script with colored output";

function riskyOperation() {
  if (Math.random() > 0.5) {
    throw new Error('Random failure occurred');
  }
  return 'Success!';
}

export async function execute(context) {
  const console = context.console || global.console;

  console.log('Starting risky operations...');

  const results = [];

  for (let i = 1; i <= 5; i++) {
    try {
      console.info(`Attempt ${i}:`);
      const result = riskyOperation();
      console.log(`✅ ${result}`);
      results.push({ attempt: i, success: true, result });
    } catch (error) {
      console.error(`❌ Attempt ${i} failed:`, error.message);
      console.warn('Retrying...');
      results.push({ attempt: i, success: false, error: error.message });
    }
  }

  console.debug('Operation summary complete');
  return { results };
}
```

### API Response Logging

```javascript
// api-logging.js
export const description = "API response logging with colored console";

async function fetchUserData(userId) {
  const console = context.console || global.console;
  
  console.info(`Fetching data for user ${userId}`);
  
  try {
    // Simulate API call
    const response = {
      id: userId,
      name: 'John Doe',
      status: 'active'
    };
    
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function execute(context) {
  const console = context.console || global.console;

  console.log('Starting API demo...');
  
  try {
    const user = await fetchUserData(123);
    console.info('User data retrieved successfully');
    console.debug('User object keys:', Object.keys(user));
    return { user, success: true };
  } catch (error) {
    console.error('Failed to fetch user data');
    console.warn('Using fallback data');
    return { user: null, success: false, error: error.message };
  }
}
```

## Best Practices

### 1. Use Appropriate Log Levels

Choose the right console method for your message:

```javascript
// ✅ Good
export async function execute(context) {
  const console = context.console || global.console;
  
  console.log('User logged in');           // General information
  console.info('Cache updated');           // System information
  console.warn('API rate limit reached');  // Warnings
  console.error('Database connection failed'); // Errors
  console.debug('Variable state:', vars);  // Debug info
}

// ❌ Avoid
export async function execute(context) {
  console.error('User logged in');         // Wrong level
  console.log('Critical system failure'); // Wrong level
}
```

### 2. Provide Context

Include relevant context in your log messages:

```javascript
// ✅ Good
export async function execute(context) {
  const console = context.console || global.console;
  const orderId = context.env.ORDER_ID;
  const userId = context.env.USER_ID;
  
  console.log('Processing order:', orderId, 'for user:', userId);
  console.error('Payment failed for order:', orderId, 'error:', error.message);
}

// ❌ Less helpful
export async function execute(context) {
  console.log('Processing...');
  console.error('Payment failed');
}
```

### 3. Use Structured Logging

For complex data, use objects:

```javascript
// ✅ Good
export async function execute(context) {
  const console = context.console || global.console;
  
  console.info('Request processed', {
    method: 'POST',
    url: '/api/users',
    status: 201,
    duration: '45ms'
  });
}

// ❌ Less structured
export async function execute(context) {
  console.info('POST /api/users 201 45ms');
}
```

## Troubleshooting

### Colors Not Showing

If colors aren't appearing:

1. **Check the flag**: Ensure `--console-colors` is used
2. **Terminal support**: Verify your terminal supports colors
3. **Context usage**: Use `context.console` in your scripts

### Performance Issues

If you experience performance issues:

1. **Disable in production**: Use colors only during development
2. **Limit object size**: Avoid logging very large objects
3. **Use debug level**: Use `console.debug()` for verbose logging

### Memory Concerns

The colored console is designed to be memory-safe:

- Objects are safely serialized to prevent circular references
- No global console replacement to avoid memory leaks
- Efficient color rendering with minimal overhead

## Related Features

- [Terminal UI (TUI)](/features/tui) - Interactive script management
- [CLI Commands](/cli/commands) - All available CLI options
- [Library API](/library/api) - Programmatic usage
- [Examples](/examples/) - More usage examples 