import type { CAC } from 'cac';
import { loadAvailableSkills } from '../../domains/skills';
import { installSkills } from '../../domains/installation';
import { promptSkillSelection, promptScopeSelection, intro, outro } from '../../domains/ui/prompts';
import type { ToolName, InstallScope } from '../../types';

interface AddOpts {
  tool?: ToolName;
  scope?: InstallScope;
}

export function registerAdd(cli: CAC) {
  cli
    .command('add [...skills]', 'Add specific skills (skips init setup)')
    .option('--tool <tool>', 'Target tool (default: claude)')
    .option('--scope <scope>', 'Scope (default: global)')
    .action(async (skills: string[], opts: AddOpts) => {
      intro('pkit — add skills');

      const tool = opts.tool ?? 'claude';

      // Ask scope if not provided via flag
      let scope = opts.scope;
      if (!scope) {
        scope = await promptScopeSelection() ?? undefined;
        if (!scope) return;
      }

      // If no skills named, show picker
      let skillNames = skills;
      if (skillNames.length === 0) {
        const available = loadAvailableSkills().map(s => s.name);
        const selected = await promptSkillSelection(available);
        if (!selected) return;
        skillNames = selected;
      }

      await installSkills(skillNames, {
        tools: tool as ToolName,
        scope: scope as InstallScope,
        force: true,
      });

      outro('Done!');
    });
}
