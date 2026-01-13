import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger.js';

/**
 * Constraint document mapping for each employee
 */
const CONSTRAINT_DOCS: Record<string, string[]> = {
  pm: ['docs/reference/pm/constitution.md'],
  frontend: ['docs/reference/frontend/constraints.md'],
  backend: ['docs/reference/backend/constraints.md'],
};

/**
 * Check if constraint documents exist for an employee
 */
export async function checkConstraintDocs(
  employeeName: string,
  cwd: string
): Promise<{ existing: string[]; missing: string[] }> {
  const docs = CONSTRAINT_DOCS[employeeName] || [];
  const existing: string[] = [];
  const missing: string[] = [];

  for (const doc of docs) {
    const fullPath = path.join(cwd, doc);
    if (await fs.pathExists(fullPath)) {
      existing.push(doc);
    } else {
      missing.push(doc);
    }
  }

  return { existing, missing };
}

/**
 * Show constraint document hints after installation
 */
export function showConstraintDocHints(
  employeeName: string,
  existing: string[],
  missing: string[]
): void {
  if (missing.length === 0 && existing.length === 0) {
    return;
  }

  // Get the init command name for this employee
  const initCommand = `/${employeeName}.init`;

  if (missing.length > 0) {
    logger.break();
    logger.info(`💡 Tip: Run ${initCommand} to create constraint documents:`);
    for (const doc of missing) {
      logger.dim(`   - ${doc}`);
    }
  }

  if (existing.length > 0) {
    logger.break();
    logger.info('📄 Existing constraint documents:');
    for (const doc of existing) {
      logger.dim(`   - ${doc}`);
    }
    logger.dim(`   Run ${initCommand} to update these if needed.`);
  }
}
