import { Command } from 'commander';
import prompts from 'prompts';
import { z } from 'zod';
import { configExists, writeConfig } from '../utils/config.js';
import { logger, spinner } from '../utils/logger.js';
import { handleError } from '../utils/errors.js';
import {
  createDefaultConfig,
  platformSchema,
  type Platform,
} from '../schema/config.js';

const initOptionsSchema = z.object({
  cwd: z.string(),
  defaultPlatform: platformSchema.optional(),
  force: z.boolean(),
});

type InitOptions = z.infer<typeof initOptionsSchema>;

async function runInit(options: InitOptions): Promise<void> {
  const { cwd, defaultPlatform, force } = options;

  // Check if config already exists
  if (await configExists(cwd)) {
    if (!force) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: 'aico.json already exists. Overwrite?',
        initial: false,
      });

      if (!overwrite) {
        logger.info('Initialization cancelled.');
        return;
      }
    }
  }

  // Determine platform
  const platform: Platform = defaultPlatform ?? 'claude-code';

  // Create config
  const config = createDefaultConfig(platform);

  // Write config
  const s = spinner('Creating aico.json...').start();
  await writeConfig(cwd, config);
  s.succeed('Created aico.json');

  logger.break();
  logger.success('Project initialized!');
  logger.dim(`Default platform: ${platform}`);
  logger.break();
  logger.info('Next steps:');
  logger.log(`  ${logger.highlight('aico add pm')}  Add the PM employee`);
  logger.log(
    `  ${logger.highlight('aico list')}   View available employees`
  );
}

export const init = new Command()
  .name('init')
  .description('Initialize aico in your project')
  .option(
    '-p, --default-platform <platform>',
    'Default platform (claude-code, codex)'
  )
  .option('-f, --force', 'Overwrite existing configuration', false)
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: opts.cwd,
        defaultPlatform: opts.defaultPlatform,
        force: opts.force,
      });

      await runInit(options);
    } catch (error) {
      handleError(error);
    }
  });
