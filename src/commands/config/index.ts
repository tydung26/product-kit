import type { CAC } from 'cac';
import { getConfig, setConfigValue } from '../../domains/config';
import { log } from '../../shared/logger';

export function registerConfig(cli: CAC) {
  // pkit config → show current config
  cli
    .command('config', 'View or set pkit configuration')
    .action(() => {
      const config = getConfig();
      log.plain('\npkit configuration\n');
      log.plain(`  defaultScope         ${config.defaultScope}`);
      log.plain(`  toolPaths.claude     ${config.toolPaths.claude}`);
      log.plain(`  toolPaths.antigravity  ${config.toolPaths.antigravity}`);
      log.plain(`  toolPaths.opencode   ${config.toolPaths.opencode}`);
      log.plain('\nChange with: pkit config set <key> <value>');
      log.plain('Keys: defaultScope, toolPaths.claude, toolPaths.antigravity, toolPaths.opencode');
    });

  // pkit config set <key> <value>
  cli
    .command('config set <key> <value>', 'Set a configuration value')
    .action((key: string, value: string) => {
      try {
        setConfigValue(key, value);
        log.success(`Set ${key} = ${value}`);
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}
