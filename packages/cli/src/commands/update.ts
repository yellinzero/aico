import { Command } from 'commander';
import prompts from 'prompts';
import { z } from 'zod';
import kleur from 'kleur';
import { getConfig, updateSkill, getInstalledSkills } from '../utils/config.js';
import { logger, spinner } from '../utils/logger.js';
import { handleError, notInitializedError } from '../utils/errors.js';
import { fetchSkill } from '../registry/client.js';
import { installSkill, uninstallSkill } from '../installer/skill-installer.js';
import { parseTarget } from '../utils/parse-target.js';
import { hasUpdate, formatVersionChange } from '../utils/version.js';

const updateOptionsSchema = z.object({
  skills: z.array(z.string()),
  cwd: z.string(),
  yes: z.boolean(),
  dryRun: z.boolean(),
});

type UpdateOptions = z.infer<typeof updateOptionsSchema>;

interface UpdateCheckResult {
  skillName: string;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
}

async function runUpdate(options: UpdateOptions): Promise<void> {
  const { skills, cwd, yes, dryRun } = options;

  // Load config
  const config = await getConfig(cwd);
  if (!config) {
    throw notInitializedError();
  }

  logger.info('Checking for updates...');

  // Determine which skills to check
  let skillsToCheck: string[];
  if (skills.length > 0) {
    // Parse provided skill names
    skillsToCheck = skills.map((s) => parseTarget(s).fullName);
  } else {
    // Check all installed skills
    skillsToCheck = await getInstalledSkills(cwd);
  }

  if (skillsToCheck.length === 0) {
    logger.info('No skills installed.');
    return;
  }

  const s = spinner('Fetching latest versions...').start();

  // Check updates for each skill
  const updateResults: UpdateCheckResult[] = [];

  for (const skillName of skillsToCheck) {
    try {
      const currentState = config.skills?.[skillName];
      const currentVersion = currentState?.version ?? '0.0.0';

      // Fetch latest version
      const latestSkill = await fetchSkill(skillName, config, cwd);

      updateResults.push({
        skillName,
        currentVersion,
        latestVersion: latestSkill.version,
        hasUpdate: hasUpdate(currentVersion, latestSkill.version),
      });
    } catch {
      logger.dim(`  Could not check ${skillName}`);
    }
  }

  s.stop();

  // Filter skills that have updates
  const updatesAvailable = updateResults.filter((r) => r.hasUpdate);

  if (updatesAvailable.length === 0) {
    logger.success('All skills are up to date!');
    return;
  }

  // Display update table
  logger.break();
  logger.log(formatUpdateTable(updateResults));
  logger.break();

  // Dry run mode
  if (dryRun) {
    logger.info(`${updatesAvailable.length} update(s) available.`);
    return;
  }

  // Confirm updates
  if (!yes) {
    const { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: `Update ${updatesAvailable.length} skill(s)?`,
      initial: true,
    });

    if (!confirmed) {
      logger.info('Cancelled.');
      return;
    }
  }

  // Execute updates
  for (const result of updatesAvailable) {
    const updateSpinner = spinner(`Updating ${result.skillName}...`).start();

    try {
      // Fetch latest skill
      const latestSkill = await fetchSkill(result.skillName, config, cwd);
      const platform = config.defaultPlatform;

      // Uninstall old version
      await uninstallSkill(result.skillName, config, cwd, { platform });

      // Install new version
      await installSkill(latestSkill, config, cwd, {
        platform,
        overwrite: true,
      });

      // Update config
      await updateSkill(
        cwd,
        result.skillName,
        latestSkill.version,
        [platform],
        'standalone'
      );

      updateSpinner.succeed(
        `Updated ${result.skillName} (${formatVersionChange(result.currentVersion, result.latestVersion)})`
      );
    } catch (error) {
      updateSpinner.fail(`Failed to update ${result.skillName}`);
      throw error;
    }
  }

  logger.break();
  logger.success('Update complete!');
}

/**
 * Format update results as a table
 */
function formatUpdateTable(results: UpdateCheckResult[]): string {
  const maxNameLen = Math.max(...results.map((r) => r.skillName.length), 20);
  const maxVerLen = 10;

  const lines: string[] = [];

  // Header
  const header = [
    'Skill'.padEnd(maxNameLen),
    'Current'.padEnd(maxVerLen),
    'Latest'.padEnd(maxVerLen),
    'Status',
  ].join(' │ ');

  const separator = [
    '─'.repeat(maxNameLen),
    '─'.repeat(maxVerLen),
    '─'.repeat(maxVerLen),
    '─'.repeat(16),
  ].join('─┼─');

  lines.push('┌' + separator.replace(/─┼─/g, '─┬─') + '┐');
  lines.push('│ ' + header + ' │');
  lines.push('├' + separator + '┤');

  // Rows
  for (const r of results) {
    const status = r.hasUpdate
      ? kleur.yellow('update available')
      : kleur.green('up to date');

    const row = [
      r.skillName.padEnd(maxNameLen),
      r.currentVersion.padEnd(maxVerLen),
      r.latestVersion.padEnd(maxVerLen),
      status,
    ].join(' │ ');

    lines.push('│ ' + row + ' │');
  }

  lines.push('└' + separator.replace(/─┼─/g, '─┴─') + '┘');

  return lines.join('\n');
}

export const update = new Command()
  .name('update')
  .description('Update installed skills to latest versions')
  .argument('[skills...]', 'Skill names to update (all if empty)')
  .option('--dry-run', 'Preview updates without applying', false)
  .option('-y, --yes', 'Skip confirmation', false)
  .option('-c, --cwd <cwd>', 'Working directory', process.cwd())
  .action(async (skills: string[], opts) => {
    try {
      const options = updateOptionsSchema.parse({
        skills,
        cwd: opts.cwd,
        yes: opts.yes,
        dryRun: opts.dryRun,
      });

      await runUpdate(options);
    } catch (error) {
      handleError(error);
    }
  });
