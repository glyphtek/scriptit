export interface ConsoleInterceptorOptions {
  logFunction: (message: string) => void;
  includeLevel?: boolean; // Whether to include log level in the message
  preserveOriginal?: boolean; // Whether to also call the original console methods
  useColors?: boolean; // Whether to apply colors to different log levels
}

export interface ConsoleInterceptor {
  start: () => void;
  stop: () => void;
  isActive: () => boolean;
}

/**
 * Creates a minimal console interceptor for testing
 */
export function createConsoleInterceptor(
  options: ConsoleInterceptorOptions,
): ConsoleInterceptor {
  const {
    logFunction,
    includeLevel = false,
    preserveOriginal = false,
  } = options;

  // Store original console methods
  const originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
  };

  let isIntercepting = false;

  const createInterceptedMethod = (level: string) => {
    return (...args: unknown[]) => {
      if (!isIntercepting) {
        return originalConsole[level as keyof typeof originalConsole](...args);
      }

      try {
        // Very simple string conversion
        const message = args.map((arg) => String(arg)).join(" ");

        // Add level prefix if requested
        const finalMessage = includeLevel
          ? `[${level.toUpperCase()}] ${message}`
          : message;

        logFunction(finalMessage);

        if (preserveOriginal) {
          originalConsole[level as keyof typeof originalConsole](...args);
        }
      } catch (error) {
        // Fallback - just use original console
        originalConsole[level as keyof typeof originalConsole](...args);
      }
    };
  };

  const start = () => {
    if (isIntercepting) {
      return; // Already intercepting
    }

    try {
      // Replace console methods with intercepted versions
      console.log = createInterceptedMethod("log");
      console.error = createInterceptedMethod("error");
      console.warn = createInterceptedMethod("warn");
      console.info = createInterceptedMethod("info");
      console.debug = createInterceptedMethod("debug");

      isIntercepting = true;
    } catch (error) {
      // If anything goes wrong, don't intercept
      isIntercepting = false;
    }
  };

  const stop = () => {
    if (!isIntercepting) {
      return; // Not intercepting
    }

    try {
      // Restore original console methods
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;

      isIntercepting = false;
    } catch (error) {
      // If restoration fails, at least mark as not intercepting
      isIntercepting = false;
    }
  };

  const isActive = () => isIntercepting;

  return {
    start,
    stop,
    isActive,
  };
}
