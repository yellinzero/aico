import type { AicoErrorCodeType } from './error-codes.js';

/**
 * Default suggestions for each error code.
 * These provide actionable guidance for users to resolve errors.
 */
export const defaultSuggestions: Record<AicoErrorCodeType, string> = {
  // Network errors
  NETWORK_ERROR:
    'Check your internet connection or try using a proxy with --proxy option.',
  FETCH_ERROR: 'Verify the registry URL is correct and accessible.',
  TIMEOUT: 'The request timed out. Try again or check your network.',
  REGISTRY_UNAVAILABLE: 'The registry server is unavailable. Try again later.',

  // Resource errors
  NOT_FOUND: 'The requested resource was not found.',
  SKILL_NOT_FOUND: 'Use `aico list --skills` to see available skills.',
  EMPLOYEE_NOT_FOUND: 'Use `aico list` to see available employees.',

  // Configuration errors
  NOT_INITIALIZED: 'Run `aico init` to initialize the project.',
  CONFIG_INVALID:
    'Check your aico.json for syntax errors or run `aico init --force`.',
  CONFIG_EXISTS: 'Use `aico init --force` to overwrite existing config.',
  CONFIG_PARSE_ERROR:
    'Your aico.json contains invalid JSON. Check for syntax errors.',

  // Dependency errors
  DEPENDENCY_MISSING:
    'Install the missing dependency first, or use `--no-deps` to skip.',
  CIRCULAR_DEPENDENCY: 'Check your skill dependencies for circular references.',

  // File errors
  FILE_EXISTS: 'Use `--overwrite` to replace existing files.',
  FILE_NOT_FOUND: 'Verify the file path is correct.',
  PERMISSION_DENIED:
    'Check file permissions or run with appropriate privileges.',
  WRITE_ERROR: 'Unable to write file. Check disk space and permissions.',

  // Platform errors
  PLATFORM_NOT_SUPPORTED: 'Supported platforms: claude-code, codex.',

  // Validation errors
  VALIDATION_ERROR: 'Check the input format and try again.',
  INVALID_ARGUMENT: 'Check the command arguments and options.',
};

/**
 * Get the default suggestion for an error code.
 */
export function getSuggestion(code: AicoErrorCodeType): string {
  return defaultSuggestions[code] || 'Please check the error details above.';
}
