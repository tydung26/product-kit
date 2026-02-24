import { createCli } from './cli/setup';
import { registerInstall } from './commands/install';
import { registerList } from './commands/list';
import { registerUpdate } from './commands/update';
import { registerRemove } from './commands/remove';
import { registerConfig } from './commands/config';
import { registerDoctor } from './commands/doctor';

const cli = createCli();

registerInstall(cli);
registerList(cli);
registerUpdate(cli);
registerRemove(cli);
registerConfig(cli);
registerDoctor(cli);

// Show help if no command given
cli.on('command:*', () => {
  console.error('Unknown command:', cli.args.join(' '));
  cli.outputHelp();
  process.exit(1);
});

cli.parse();
