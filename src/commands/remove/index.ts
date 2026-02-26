import type { CAC } from 'cac';
import { removeSkills, getManifestEntries } from '../../domains/installation';
import { promptConfirm, promptSkillSelection, intro, outro } from '../../domains/ui/prompts';
import { log } from '../../shared/logger';

interface RemoveOpts { yes?: boolean; all?: boolean; }

export function registerRemove(cli: CAC) {
  cli
    .command('remove|rm [...skills]', 'Remove installed PM skills')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('-a, --all', 'Remove all installed pkit skills')
    .action(async (skills: string[], opts: RemoveOpts) => {
      intro('pkit — removing skills');

      let toRemove = skills;

      // --all flag: remove everything installed
      if (opts.all) {
        toRemove = [...new Set(getManifestEntries().map(e => e.name))];
      }

      // If no skills named, prompt to pick from installed
      if (toRemove.length === 0) {
        const installedNames = [...new Set(getManifestEntries().map(e => e.name))];
        if (installedNames.length === 0) {
          log.warn('No skills installed.');
          return;
        }
        const selected = await promptSkillSelection(installedNames);
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
