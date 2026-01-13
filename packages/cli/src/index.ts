import { Command } from 'commander';
import { handleError } from './utils/errors.js';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { remove } from './commands/remove.js';
import { list } from './commands/list.js';
import { build } from './commands/build.js';
import { diff } from './commands/diff.js';
import { update } from './commands/update.js';
import { search } from './commands/search.js';
import { check } from './commands/check.js';

const VERSION = '1.0.0';

// Store global options for access in error handler
let globalVerbose = false;

async function main(): Promise<void> {
  const program = new Command()
    .name('aico')
    .description(
      'AI employee management tool - Build your AI team in seconds, start working immediately'
    )
    .version(VERSION)
    .option('-v, --verbose', 'Show detailed error information')
    .option('--proxy <url>', 'Use HTTP/HTTPS proxy for requests');

  // Hook to capture global options before command execution
  program.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    globalVerbose = opts.verbose ?? false;
  });

  // Register commands
  program.addCommand(init);
  program.addCommand(add);
  program.addCommand(remove);
  program.addCommand(update);
  program.addCommand(list);
  program.addCommand(diff);
  program.addCommand(build);
  program.addCommand(search);
  program.addCommand(check);

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  handleError(error, { verbose: globalVerbose });
});
