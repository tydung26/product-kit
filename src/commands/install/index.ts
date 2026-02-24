import type { CAC } from 'cac';
import { loadAvailableSkills } from '../../domains/skills';
import { installSkills } from '../../domains/installation';
import { promptToolSelection, promptSkillSelection, intro, outro } from '../../domains/ui/prompts';
import { log } from '../../shared/logger';
import type { ToolName, InstallScope } from '../../types';

interface InstallOpts {
  tool?: ToolName;
  scope: InstallScope;
  force?: boolean;
  yes?: boolean;
}

export function registerInstall(cli: CAC) {
  cli
    .command('init [...skills]', 'Install PM commands to AI coding tools')
    .option('--tool <tool>', 'Target tool: claude, antigravity, opencode, all')
    .option('--scope <scope>', 'Scope: global or project', { default: 'global' })
    .option('--force', 'Overwrite existing installations')
    .option('-y, --yes', 'Skip interactive prompts (installs all skills to all tools)')
    .action(async (skills: string[], opts: InstallOpts) => {
      intro('pkit — PM skills installer');

      // Resolve tool: use flag, non-interactive default, or prompt
      let tool = opts.tool;
      if (!tool) {
        if (opts.yes) {
          tool = 'all';
        } else {
          tool = await promptToolSelection() ?? undefined;
          if (!tool) return;
        }
      }

      // Resolve skill names: use args, or prompt, or all (with -y)
      let skillNames = skills;
      if (skillNames.length === 0) {
        const available = loadAvailableSkills().map(s => s.name);
        if (opts.yes) {
          skillNames = available;
        } else {
          const selected = await promptSkillSelection(available);
          if (!selected) return;
          skillNames = selected;
        }
      }

      await installSkills(skillNames, {
        tools: tool as ToolName,
        scope: opts.scope as InstallScope,
        force: opts.force,
        yes: opts.yes,
      });

      outro('Done! Use /pkit:brainstorm (or other skill names) in your AI tool.');
    });
}
