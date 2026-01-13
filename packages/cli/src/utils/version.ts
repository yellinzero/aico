/**
 * Version comparison utilities
 */

/**
 * Compare two semantic versions
 * @returns -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const partA = partsA[i] ?? 0;
    const partB = partsB[i] ?? 0;
    if (partA < partB) return -1;
    if (partA > partB) return 1;
  }

  return 0;
}

/**
 * Check if there's an update available
 */
export function hasUpdate(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0;
}

/**
 * Format version change for display
 */
export function formatVersionChange(current: string, latest: string): string {
  if (hasUpdate(current, latest)) {
    return `${current} → ${latest}`;
  }
  return `${current} (up to date)`;
}

/**
 * Parse version string
 */
export function parseVersion(
  version: string
): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
  };
}

/**
 * Validate version string
 */
export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}
