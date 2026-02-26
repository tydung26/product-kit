import type { CAC } from 'cac';
import { loadAvailableSkills } from '../../domains/skills';
import { installSkills } from '../../domains/installation';
import { promptToolSelection, promptSkillSelection, promptScopeSelection, intro, outro } from '../../domains/ui/prompts';
import type { ToolName, InstallScope } from '../../types';

interface InstallOpts {
  tool?: ToolName;
  scope?: InstallScope;
  force?: boolean;
  yes?: boolean;
}

export function registerInstall(cli: CAC) {
  cli
    .command('init|i [...skills]', 'Install PM commands to AI coding tools')
    .option('--tool <tool>', 'Target tool: claude, antigravity, opencode, all')
    .option('--scope <scope>', 'Scope: global or project')
    .option('--force', 'Overwrite existing installations')
    .option('-y, --yes', 'Skip interactive prompts (installs all skills to claude, global)')
    .action(async (skills: string[], opts: InstallOpts) => {
      intro('pkit — PM skills installer');

      // Step 1: Which AI tool?
      let tool = opts.tool;
      if (!tool) {
        if (opts.yes) {
          tool = 'claude';
        } else {
          tool = await promptToolSelection() ?? undefined;
          if (!tool) return;
        }
      }

      // Step 2: Which skills?
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

      // Step 3: Global or project scope?
      let scope = opts.scope;
      if (!scope) {
        if (opts.yes) {
          scope = 'global';
        } else {
          scope = await promptScopeSelection() ?? undefined;
          if (!scope) return;
        }
      }

      await installSkills(skillNames, {
        tools: tool as ToolName,
        scope: scope as InstallScope,
        force: opts.force,
        yes: opts.yes,
      });

      outro('Done! Use /pkit:discover (or other skill names) in your AI tool.');
    });
}
