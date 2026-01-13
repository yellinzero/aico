import type { Platform } from '../../schema/config.js';

export interface PlatformAdapter {
  name: Platform;
  getSkillDirName(employeeName: string, skillName: string): string;
  getCommandFileName(employeeName: string, commandName: string): string;
}

export const claudeCodeAdapter: PlatformAdapter = {
  name: 'claude-code',

  getSkillDirName(employeeName: string, skillName: string): string {
    return `aico-${employeeName}-${skillName}`;
  },

  getCommandFileName(employeeName: string, commandName: string): string {
    return `${employeeName}.${commandName}.md`;
  },
};
