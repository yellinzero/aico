/**
 * aico check - Check environment and configuration.
 */

import { Command } from 'commander';
import kleur from 'kleur';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../utils/config.js';
import { handleError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { Config, Platform } from '../schema/config.js';

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  children?: CheckResult[];
}

/**
 * Check Node.js version.
 */
function checkNodeVersion(): CheckResult {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0] ?? '0', 10);

  if (major >= 20) {
    return {
      name: 'Node.js',
      status: 'pass',
      message: version,
    };
  }

  if (major >= 18) {
    return {
      name: 'Node.js',
      status: 'warn',
      message: `${version} (recommend >= 20)`,
    };
  }

  return {
    name: 'Node.js',
    status: 'fail',
    message: `${version} (requires >= 18)`,
  };
}

/**
 * Check configuration file.
 */
async function checkConfig(cwd: string): Promise<CheckResult> {
  const configPath = join(cwd, 'aico.json');

  if (!existsSync(configPath)) {
    return {
      name: 'aico.json',
      status: 'fail',
      message: 'not found',
    };
  }

  try {
    const config = await getConfig(cwd);

    if (!config) {
      return {
        name: 'aico.json',
        status: 'fail',
        message: 'invalid',
      };
    }

    if (!config.defaultPlatform) {
      return {
        name: 'aico.json',
        status: 'warn',
        message: 'missing defaultPlatform',
      };
    }

    return {
      name: 'aico.json',
      status: 'pass',
      message: 'valid',
    };
  } catch {
    return {
      name: 'aico.json',
      status: 'fail',
      message: 'parse error',
    };
  }
}

/**
 * Check platform directories.
 */
function checkPlatformDirs(
  cwd: string,
  platform: Platform,
  platformConfig: { skills: string; commands: string }
): CheckResult {
  const children: CheckResult[] = [];

  // Check skills directory
  const skillsPath = join(cwd, platformConfig.skills);
  if (existsSync(skillsPath)) {
    children.push({
      name: platformConfig.skills,
      status: 'pass',
      message: 'exists',
    });
  } else {
    children.push({
      name: platformConfig.skills,
      status: 'warn',
      message: 'not found (will be created)',
    });
  }

  // Check commands directory
  const commandsPath = join(cwd, platformConfig.commands);
  if (existsSync(commandsPath)) {
    children.push({
      name: platformConfig.commands,
      status: 'pass',
      message: 'exists',
    });
  } else {
    children.push({
      name: platformConfig.commands,
      status: 'warn',
      message: 'not found (will be created)',
    });
  }

  const allPass = children.every((c) => c.status === 'pass');
  const hasError = children.some((c) => c.status === 'fail');

  return {
    name: `Platform: ${platform}`,
    status: hasError ? 'fail' : allPass ? 'pass' : 'warn',
    message: '',
    children,
  };
}

/**
 * Check registry connectivity.
 */
async function checkRegistry(
  registries: Record<
    string,
    string | { url: string; headers?: Record<string, string> }
  >
): Promise<CheckResult> {
  const children: CheckResult[] = [];

  for (const [name, registry] of Object.entries(registries)) {
    // Build test URL
    const urlTemplate = typeof registry === 'string' ? registry : registry.url;
    const testUrl = urlTemplate.replace('{name}', 'index');

    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        children.push({
          name,
          status: 'pass',
          message: 'reachable',
        });
      } else {
        children.push({
          name,
          status: 'fail',
          message: `HTTP ${response.status}`,
        });
      }
    } catch {
      children.push({
        name,
        status: 'fail',
        message: 'unreachable',
      });
    }
  }

  const hasError = children.some((c) => c.status === 'fail');

  return {
    name: 'Registry',
    status: hasError ? 'fail' : 'pass',
    message: '',
    children,
  };
}

/**
 * Count items in a directory.
 */
function countDirectory(dir: string): number {
  if (!existsSync(dir)) return 0;

  try {
    return readdirSync(dir).filter((item) => {
      const itemPath = join(dir, item);
      try {
        return statSync(itemPath).isDirectory() || item.endsWith('.md');
      } catch {
        return false;
      }
    }).length;
  } catch {
    return 0;
  }
}

/**
 * Check installed content.
 */
function checkInstalled(
  cwd: string,
  platformConfig: { skills: string; commands: string }
): CheckResult {
  const skillsCount = countDirectory(join(cwd, platformConfig.skills));
  const commandsCount = countDirectory(join(cwd, platformConfig.commands));

  const message = `${skillsCount} skills, ${commandsCount} commands`;

  return {
    name: 'Installed',
    status: skillsCount > 0 || commandsCount > 0 ? 'pass' : 'skip',
    message,
  };
}

/**
 * Get symbol for status.
 */
function getSymbol(status: CheckResult['status']): string {
  const symbols = {
    pass: kleur.green('●'),
    fail: kleur.red('✖'),
    warn: kleur.yellow('◐'),
    skip: kleur.gray('○'),
  };
  return symbols[status];
}

/**
 * Format results as tree.
 */
function formatResults(results: CheckResult[]): string {
  const lines: string[] = [];

  results.forEach((result, index) => {
    const isLast = index === results.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const extension = isLast ? '    ' : '│   ';

    const symbol = getSymbol(result.status);
    const message = result.message ? kleur.dim(` (${result.message})`) : '';

    lines.push(`${connector}${symbol} ${result.name}${message}`);

    if (result.children) {
      result.children.forEach((child, childIndex) => {
        const childIsLast = childIndex === result.children!.length - 1;
        const childConnector = childIsLast ? '└── ' : '├── ';

        const childSymbol = getSymbol(child.status);
        const childMessage = child.message
          ? kleur.dim(` (${child.message})`)
          : '';

        lines.push(
          `${extension}${childConnector}${childSymbol} ${child.name}${childMessage}`
        );
      });
    }
  });

  return lines.join('\n');
}

export const check = new Command()
  .name('check')
  .description('Check environment and configuration')
  .option('--json', 'Output as JSON')
  .option('--cwd <cwd>', 'Working directory', process.cwd())
  .action(async (opts) => {
    try {
      const cwd = opts.cwd;

      logger.break();
      logger.bold(kleur.cyan('AICO Environment Check'));
      logger.break();

      const results: CheckResult[] = [];

      // 1. Node.js version
      results.push(checkNodeVersion());

      // 2. Configuration file
      const configResult = await checkConfig(cwd);
      results.push(configResult);

      // If config is invalid, skip remaining checks
      if (configResult.status === 'fail') {
        results.push({
          name: 'Platform',
          status: 'skip',
          message: 'skipped (no config)',
        });
        results.push({
          name: 'Registry',
          status: 'skip',
          message: 'skipped (no config)',
        });
        results.push({
          name: 'Installed',
          status: 'skip',
          message: 'skipped (no config)',
        });
      } else {
        const config = (await getConfig(cwd)) as Config;

        // 3. Platform directories
        const platformConfig = config.platforms[config.defaultPlatform];
        if (platformConfig) {
          results.push(
            checkPlatformDirs(cwd, config.defaultPlatform, platformConfig)
          );

          // 4. Registry connectivity
          results.push(await checkRegistry(config.registries));

          // 5. Installed content
          results.push(checkInstalled(cwd, platformConfig));
        } else {
          results.push({
            name: 'Platform',
            status: 'fail',
            message: 'default platform not found in config',
          });
          results.push({
            name: 'Registry',
            status: 'skip',
            message: 'skipped (platform missing)',
          });
          results.push({
            name: 'Installed',
            status: 'skip',
            message: 'skipped (platform missing)',
          });
        }
      }

      // Output
      if (opts.json) {
        logger.log(JSON.stringify(results, null, 2));
      } else {
        logger.log(formatResults(results));
        logger.break();

        // Summary
        const hasError = results.some((r) => r.status === 'fail');
        const hasWarn = results.some((r) => r.status === 'warn');

        if (hasError) {
          logger.log(
            kleur.red('✖ Some checks failed. Run `aico init` to fix.')
          );
        } else if (hasWarn) {
          logger.log(
            kleur.yellow('◐ Some checks have warnings. AICO should work.')
          );
        } else {
          logger.log(kleur.green('✓ All checks passed! AICO is ready to use.'));
        }
        logger.break();
      }
    } catch (error) {
      handleError(error);
    }
  });
