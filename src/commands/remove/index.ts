import type { CAC } from 'cac';
import { removeSkills, scanInstalledSkills } from '../../domains/installation';
import { promptConfirm, promptSkillSelection, intro, outro } from '../../domains/ui/prompts';
import { log } from '../../shared/logger';

interface RemoveOpts { yes?: boolean; all?: boolean; }

export function registerRemove(cli: CAC) {
  cli
    .command('remove [...skills]', 'Remove installed PM skills')
    .alias('rm')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('-a, --all', 'Remove all installed pkit skills')
    .action(async (skills: string[], opts: RemoveOpts) => {
      intro('pkit — removing skills');

      // Scan both global and project scopes for installed skills
      const installed = scanInstalledSkills();
      let toRemove = skills;

      // --all flag: remove everything found
      if (opts.all) {
        toRemove = installed;
      }

      // If no skills named, prompt to pick from installed
      if (toRemove.length === 0) {
        if (installed.length === 0) {
          log.warn('No skills installed.');
          return;
        }
        const selected = await promptSkillSelection(installed);
        if (!selected) return;
        toRemove = selected;
      }

      if (!opts.yes) {
        const ok = await promptConfirm(`Remove ${toRemove.join(', ')}?`);
        if (!ok) { log.info('Cancelled.'); return; }
      }

      await removeSkills(toRemove);
      outro('Done.');
    });
}
