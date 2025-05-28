export interface ConsoleInterceptorOptions {
  logFunction: (message: string) => void;
  includeLevel?: boolean; // Whether to include log level in the message
  preserveOriginal?: boolean; // Whether to also call the original console methods
}

export interface ConsoleInterceptor {
  start: () => void;
  stop: () => void;
  isActive: () => boolean;
}

/**
 * Creates a simple console interceptor that captures console methods
 * and redirects them to a custom log function with minimal formatting
 */
export function createConsoleInterceptor(
  options: ConsoleInterceptorOptions,
): ConsoleInterceptor {
  const { logFunction, includeLevel = false, preserveOriginal = false } = options;
  
  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  let isIntercepting = false;

  const createInterceptedMethod = (level: string, originalMethod: (...args: unknown[]) => void) => {
    return (...args: unknown[]) => {
      // Simple string conversion - just join arguments with spaces
      const message = args.map(arg => String(arg)).join(' ');
      const finalMessage = includeLevel ? `[${level.toUpperCase()}] ${message}` : message;
      logFunction(finalMessage);
      
      if (preserveOriginal) {
        originalMethod.apply(console, args);
      }
    };
  };

  const start = () => {
    if (isIntercepting) {
      return; // Already intercepting
    }

    // Replace console methods with intercepted versions
    console.log = createInterceptedMethod('log', originalConsole.log);
    console.error = createInterceptedMethod('error', originalConsole.error);
    console.warn = createInterceptedMethod('warn', originalConsole.warn);
    console.info = createInterceptedMethod('info', originalConsole.info);
    console.debug = createInterceptedMethod('debug', originalConsole.debug);

    isIntercepting = true;
  };

  const stop = () => {
    if (!isIntercepting) {
      return; // Not intercepting
    }

    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;

    isIntercepting = false;
  };

  const isActive = () => isIntercepting;

  return {
    start,
    stop,
    isActive,
  };
} 