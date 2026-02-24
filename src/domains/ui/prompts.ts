import * as p from '@clack/prompts';
import type { ToolName } from '../../types';

// Interactive multi-select for tool choice when --tool not provided
export async function promptToolSelection(): Promise<ToolName | null> {
  const selected = await p.select<ToolName>({
    message: 'Install skills to which AI tool?',
    options: [
      { value: 'all', label: 'All tools', hint: 'Claude Code + Antigravity (recommended)' },
      { value: 'claude', label: 'Claude Code', hint: 'Also covers OpenCode (~/.claude/skills/)' },
      { value: 'antigravity', label: 'Antigravity', hint: '~/.gemini/antigravity/skills/' },
      { value: 'opencode', label: 'OpenCode only', hint: '~/.config/opencode/skills/' },
    ],
  });
  if (p.isCancel(selected)) { p.cancel('Cancelled.'); return null; }
  return selected;
}

// Interactive multi-select for skill names when none provided
export async function promptSkillSelection(skillNames: string[]): Promise<string[] | null> {
  const selected = await p.multiselect<string>({
    message: 'Select skills to install:',
    options: skillNames.map(n => ({ value: n, label: n })),
    required: true,
  });
  if (p.isCancel(selected)) { p.cancel('Cancelled.'); return null; }
  return selected as string[];
}

// Confirm destructive actions
export async function promptConfirm(message: string): Promise<boolean> {
  const ok = await p.confirm({ message });
  if (p.isCancel(ok)) return false;
  return ok as boolean;
}

export const { intro, outro, spinner, log: clackLog } = p;
