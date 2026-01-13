import type { PlatformAdapter } from './claude-code.js';

/**
 * Codex platform adapter
 *
 * Codex has native support for skills since December 2025, with the same format as Claude Code.
 *
 * Skills:
 * - Location: .codex/skills/{skill-name}/SKILL.md
 * - Format: Identical to Claude Code
 * - Trigger: Auto-detect or $skill-name
 *
 * Commands (Custom Prompts):
 * - Location: .codex/prompts/{prompt-name}.md
 * - Invocation: /prompts:aico.{employee}.{command}
 * - Format: Markdown (same as Claude Code commands)
 *
 * References:
 * - Skills: https://developers.openai.com/codex/skills/
 * - Custom Prompts: https://developers.openai.com/codex/custom-prompts/
 * - Slash Commands: https://developers.openai.com/codex/cli/slash-commands/
 */

export const codexAdapter: PlatformAdapter = {
  name: 'codex',

  /**
   * Codex skill directory name
   * Uses the same naming convention as Claude Code: aico-{employee}-{skill}
   */
  getSkillDirName(employeeName: string, skillName: string): string {
    return `aico-${employeeName}-${skillName}`;
  },

  /**
   * Codex command file name (Custom Prompts)
   *
   * Codex custom prompts are located in .codex/prompts/ directory
   * The file name (without .md) becomes the command name
   *
   * Naming convention: aico.{employee}.{command}.md
   * Invocation: /prompts:aico.{employee}.{command}
   *
   * Example:
   * - File: .codex/prompts/aico.pm.plan.md
   * - Invocation: /prompts:aico.pm.plan
   */
  getCommandFileName(employeeName: string, commandName: string): string {
    return `aico.${employeeName}.${commandName}.md`;
  },
};
