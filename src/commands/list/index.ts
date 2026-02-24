import type { CAC } from 'cac';
import { loadAvailableSkills } from '../../domains/skills';
import { getManifestEntries } from '../../domains/installation';
import { log } from '../../shared/logger';

export function registerList(cli: CAC) {
  cli
    .command('list', 'List available and installed PM skills')
    .action(() => {
      const available = loadAvailableSkills();
      const installed = new Set(getManifestEntries().map(e => e.name));

      log.plain('\npkit — available skills\n');
      for (const skill of available) {
        const status = installed.has(skill.name) ? '✓ installed' : '  available';
        // Trim description to 60 chars for display
        const desc = skill.meta.description.replace(/\s+/g, ' ').slice(0, 60);
        log.plain(`  [${status}]  ${skill.name.padEnd(28)} ${desc}...`);
      }

      const installedCount = available.filter(s => installed.has(s.name)).length;
      log.plain(`\n${installedCount}/${available.length} skills installed`);
      log.plain('Install with: pkit install');
    });
}
