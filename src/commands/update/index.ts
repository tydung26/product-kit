import type { CAC } from 'cac';
import { getManifestEntries, updateSkills } from '../../domains/installation';
import { intro, outro } from '../../domains/ui/prompts';
import { log } from '../../shared/logger';
import type { ToolName, InstallScope } from '../../types';

interface UpdateOpts { tool?: ToolName; scope: InstallScope; }

export function registerUpdate(cli: CAC) {
  cli
    .command('update [...skills]', 'Update installed PM skills to latest version')
    .option('--tool <tool>', 'Target tool: claude, antigravity, opencode, all')
    .option('--scope <scope>', 'Scope: global or project', { default: 'global' })
    .action(async (skills: string[], opts: UpdateOpts) => {
      intro('pkit — updating skills');

      // Default: update all installed skills
      const toUpdate = skills.length
        ? skills
        : [...new Set(getManifestEntries().map(e => e.name))];

      if (toUpdate.length === 0) {
        log.warn('No skills installed. Run: pkit install');
        return;
      }

      await updateSkills(toUpdate, {
        tools: opts.tool ?? 'all',
        scope: opts.scope as InstallScope,
        force: true,
      });

      outro('Skills updated.');
    });
}
