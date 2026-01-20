import { Command } from 'commander';
import { z } from 'zod';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { handleError, notInitializedError } from '../utils/errors.js';
import { fetchRegistryIndex } from '../registry/client.js';

const listOptionsSchema = z.object({
  cwd: z.string(),
  installed: z.boolean(),
});

type ListOptions = z.infer<typeof listOptionsSchema>;

async function runList(options: ListOptions): Promise<void> {
  const { cwd, installed } = options;

  // Load config
  const config = await getConfig(cwd);
  if (!config) {
    throw notInitializedError();
  }

  if (installed) {
    // Show installed employees
    const employees = Object.entries(config.employees);

    if (employees.length === 0) {
      logger.info('No employees installed.');
      logger.dim('Run `aico add <employee>` to add an employee.');
      return;
    }

    logger.bold('Installed employees:');
    logger.break();

    for (const [name, state] of employees) {
      const date = new Date(state.installedAt).toLocaleDateString();
      logger.log(`  ${logger.highlight(name.padEnd(15))} ${date}`);
    }
  } else {
    // Show available employees from registry
    logger.info('Fetching employee list...');

    try {
      const index = await fetchRegistryIndex(config, cwd);

      if (index.employees.length === 0) {
        logger.warn('No employees found in registry.');
        return;
      }

      logger.break();
      logger.bold('Available employees:');
      logger.break();

      for (const employee of index.employees) {
        const installed = config.employees[employee.name] ? '✓' : ' ';
        const desc = employee.description ?? employee.role;
        logger.log(
          `  ${installed} ${logger.highlight(employee.name.padEnd(15))} ${desc}`
        );
      }

      logger.break();
      logger.dim('Use `aico add <employee>` to add an employee.');
      logger.dim('Use `aico list --installed` to see installed employees.');
    } catch {
      // If registry is unavailable, show only installed
      logger.warn(
        'Could not fetch registry. Showing installed employees only.'
      );
      logger.break();

      const employees = Object.entries(config.employees);
      if (employees.length === 0) {
        logger.info('No employees installed.');
        return;
      }

      for (const [name] of employees) {
        logger.log(`  ${logger.highlight(name)}`);
      }
    }
  }
}

export const list = new Command()
  .name('list')
  .description('List available or installed employees')
  .option('-i, --installed', 'Show only installed employees', false)
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (opts) => {
    try {
      const options = listOptionsSchema.parse({
        cwd: opts.cwd,
        installed: opts.installed,
      });

      await runList(options);
    } catch (error) {
      handleError(error);
    }
  });
