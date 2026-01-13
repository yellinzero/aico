import kleur from 'kleur';
import ora, { type Ora } from 'ora';

export const logger = {
  info: (msg: string): void => {
    console.log(kleur.blue('ℹ'), msg);
  },

  success: (msg: string): void => {
    console.log(kleur.green('✓'), msg);
  },

  warn: (msg: string): void => {
    console.log(kleur.yellow('⚠'), msg);
  },

  error: (msg: string): void => {
    console.log(kleur.red('✖'), msg);
  },

  log: (msg: string): void => {
    console.log(msg);
  },

  break: (): void => {
    console.log();
  },

  dim: (msg: string): void => {
    console.log(kleur.dim(msg));
  },

  bold: (msg: string): void => {
    console.log(kleur.bold(msg));
  },

  highlight: (msg: string): string => {
    return kleur.cyan(msg);
  },

  table: (rows: string[][]): void => {
    for (const row of rows) {
      console.log('  ' + row.join('  '));
    }
  },

  // Format functions (return string without printing)
  formatSuccess: (msg: string): string => {
    return kleur.green(msg);
  },

  formatError: (msg: string): string => {
    return kleur.red(msg);
  },

  formatDim: (msg: string): string => {
    return kleur.dim(msg);
  },
};

export function spinner(text: string): Ora {
  return ora({
    text,
    spinner: 'dots',
  });
}
