import cac from 'cac';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read version from package.json at runtime
function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'));
    return pkg.version as string;
  } catch {
    return '0.0.0';
  }
}

export function createCli() {
  const cli = cac('pkit');
  cli.version(getVersion());
  cli.help();
  // Global flags available on all commands
  cli.option('--json', 'Output as JSON (for scripting)');
  cli.option('--verbose', 'Show verbose output');
  return cli;
}
