/**
 * Loads environment variables from .env files and merges with system environment
 * and any programmatically provided environment variables
 *
 * @param envFilePaths Array of full paths to env files to load
 * @param initialEnv Optional manually provided environment variables (highest precedence)
 * @param defaultParams Default parameters that may contain env var references to interpolate
 * @returns Combined environment with all variables
 */
export declare function loadEnvironment(envFilePaths: string[], initialEnv?: Record<string, string | undefined>, defaultParams?: Record<string, unknown>): Record<string, string | undefined>;
//# sourceMappingURL=env-loader.d.ts.map