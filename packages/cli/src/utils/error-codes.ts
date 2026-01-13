/**
 * AICO Error Codes
 *
 * Error codes are grouped by category for easier understanding and maintenance.
 */
export const AicoErrorCode = {
  // Network errors (1xx)
  NETWORK_ERROR: 'NETWORK_ERROR',
  FETCH_ERROR: 'FETCH_ERROR',
  TIMEOUT: 'TIMEOUT',
  REGISTRY_UNAVAILABLE: 'REGISTRY_UNAVAILABLE',

  // Resource errors (2xx)
  NOT_FOUND: 'NOT_FOUND',
  SKILL_NOT_FOUND: 'SKILL_NOT_FOUND',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',

  // Configuration errors (3xx)
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_EXISTS: 'CONFIG_EXISTS',
  CONFIG_PARSE_ERROR: 'CONFIG_PARSE_ERROR',

  // Dependency errors (4xx)
  DEPENDENCY_MISSING: 'DEPENDENCY_MISSING',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',

  // File errors (5xx)
  FILE_EXISTS: 'FILE_EXISTS',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  WRITE_ERROR: 'WRITE_ERROR',

  // Platform errors (6xx)
  PLATFORM_NOT_SUPPORTED: 'PLATFORM_NOT_SUPPORTED',

  // Validation errors (7xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
} as const;

export type AicoErrorCodeType = keyof typeof AicoErrorCode;
