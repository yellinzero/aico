import kleur from 'kleur';
import { ZodError } from 'zod';
import { type AicoErrorCodeType } from './error-codes.js';
import { getSuggestion } from './error-suggestions.js';

export { AicoErrorCode, type AicoErrorCodeType } from './error-codes.js';

export interface AicoErrorOptions {
  suggestion?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Enhanced AICO Error class with error codes, suggestions, and context.
 */
export class AicoError extends Error {
  public readonly code: AicoErrorCodeType;
  public readonly suggestion: string;
  public readonly context?: Record<string, unknown>;
  public override readonly cause?: unknown;

  constructor(
    message: string,
    code: AicoErrorCodeType,
    options?: AicoErrorOptions
  ) {
    super(message);
    this.name = 'AicoError';
    this.code = code;
    this.suggestion = options?.suggestion || getSuggestion(code);
    this.context = options?.context;
    this.cause = options?.cause;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      suggestion: this.suggestion,
      context: this.context,
    };
  }
}

export interface HandleErrorOptions {
  verbose?: boolean;
  exitCode?: number;
}

/**
 * Unified error handler with formatted output.
 */
export function handleError(
  error: unknown,
  options: HandleErrorOptions = {}
): never {
  const { verbose = false, exitCode = 1 } = options;

  console.error('');

  if (error instanceof AicoError) {
    // AicoError formatted output
    console.error(kleur.red('✖ Error:'), error.message);
    console.error('');
    console.error(kleur.dim('  Code:'), error.code);
    console.error('');
    console.error(kleur.cyan('  Suggestion:'));
    console.error(`  ${error.suggestion}`);

    if (error.context && verbose) {
      console.error('');
      console.error(kleur.dim('  Context:'));
      for (const [key, value] of Object.entries(error.context)) {
        console.error(`    ${key}: ${JSON.stringify(value)}`);
      }
    }

    if (error.cause && verbose) {
      console.error('');
      console.error(kleur.dim('  Caused by:'));
      if (error.cause instanceof Error) {
        console.error(`    ${error.cause.message}`);
      } else {
        console.error(`    ${String(error.cause)}`);
      }
    }
  } else if (error instanceof ZodError) {
    // Zod validation error friendly display
    console.error(kleur.red('✖ Validation Error:'));
    console.error('');
    for (const issue of error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'value';
      console.error(`  ${kleur.yellow(path)}: ${issue.message}`);
    }
    console.error('');
    console.error(kleur.cyan('  Suggestion:'));
    console.error(
      '  Check the configuration file format or command arguments.'
    );
  } else if (error instanceof Error) {
    // Standard Error
    console.error(kleur.red('✖ Error:'), error.message);

    if (verbose && error.stack) {
      console.error('');
      console.error(kleur.dim('  Stack trace:'));
      const stackLines = error.stack.split('\n').slice(1);
      for (const line of stackLines.slice(0, 5)) {
        console.error(kleur.dim(line));
      }
      if (stackLines.length > 5) {
        console.error(kleur.dim(`    ... ${stackLines.length - 5} more lines`));
      }
    }
  } else {
    // Unknown error
    console.error(kleur.red('✖ Unknown error:'), String(error));
  }

  // GitHub Issue link
  console.error('');
  console.error(kleur.dim('  If the problem persists, please open an issue:'));
  console.error(kleur.dim('  https://github.com/yellinzero/aico/issues'));
  console.error('');

  process.exit(exitCode);
}

// ============================================================================
// Common error factory functions
// ============================================================================

export function notInitializedError(): AicoError {
  return new AicoError(
    'No aico.json found in current directory.',
    'NOT_INITIALIZED'
  );
}

export function configExistsError(): AicoError {
  return new AicoError(
    'aico.json already exists in current directory.',
    'CONFIG_EXISTS'
  );
}

export function employeeNotFoundError(name: string): AicoError {
  return new AicoError(
    `Employee '${name}' not found in registry.`,
    'EMPLOYEE_NOT_FOUND',
    { context: { name } }
  );
}

export function skillNotFoundError(name: string): AicoError {
  return new AicoError(
    `Skill '${name}' not found in registry.`,
    'SKILL_NOT_FOUND',
    { context: { name } }
  );
}

export function platformNotSupportedError(platform: string): AicoError {
  return new AicoError(
    `Platform '${platform}' is not supported.`,
    'PLATFORM_NOT_SUPPORTED',
    { context: { platform } }
  );
}

export function registryFetchError(url: string, status: number): AicoError {
  return new AicoError(
    `Failed to fetch from registry: ${url} (status: ${status})`,
    'FETCH_ERROR',
    { context: { url, status } }
  );
}

export function fileConflictError(path: string): AicoError {
  return new AicoError(`File already exists: ${path}`, 'FILE_EXISTS', {
    context: { path },
  });
}

export function networkError(message: string, cause?: unknown): AicoError {
  return new AicoError(message, 'NETWORK_ERROR', { cause });
}

export function timeoutError(url: string, timeoutMs: number): AicoError {
  return new AicoError(
    `Request timeout after ${timeoutMs}ms: ${url}`,
    'TIMEOUT',
    { context: { url, timeoutMs } }
  );
}

export function circularDependencyError(cycle: string[]): AicoError {
  return new AicoError(
    `Circular dependency detected: ${cycle.join(' → ')}`,
    'CIRCULAR_DEPENDENCY',
    { context: { cycle } }
  );
}

export function validationError(
  message: string,
  context?: Record<string, unknown>
): AicoError {
  return new AicoError(message, 'VALIDATION_ERROR', { context });
}
