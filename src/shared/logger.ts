import chalk from 'chalk';

// Respect --json flag to suppress styled output for scripting
const isJson = process.argv.includes('--json');

export const log = {
  info: (msg: string) => { if (!isJson) console.log(chalk.blue('ℹ'), msg); },
  success: (msg: string) => { if (!isJson) console.log(chalk.green('✓'), msg); },
  warn: (msg: string) => { if (!isJson) console.log(chalk.yellow('⚠'), msg); },
  error: (msg: string) => console.error(chalk.red('✗'), msg),
  plain: (msg: string) => console.log(msg),
};
