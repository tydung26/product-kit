import * as p from '@clack/prompts';
import type { ToolName, InstallScope } from '../../types';

// Step 1: Which AI tool? Default: claude
export async function promptToolSelection(): Promise<ToolName | null> {
  const selected = await p.select<ToolName>({
    message: 'Install skills to which AI tool?',
    options: [
      { value: 'claude', label: 'Claude Code', hint: 'also covers OpenCode (recommended)' },
      { value: 'antigravity', label: 'Antigravity', hint: '~/.gemini/antigravity/skills/' },
      { value: 'all', label: 'All tools', hint: 'Claude Code + Antigravity' },
    ],
  });
  if (p.isCancel(selected)) { p.cancel('Cancelled.'); return null; }
  return selected;
}

// Step 2: Which skills? Default: all
export async function promptSkillSelection(skillNames: string[]): Promise<string[] | null> {
  const allLabel = `All skills (${skillNames.length})`;
  const choices = [
    { value: '__all__', label: allLabel, hint: 'recommended' },
    ...skillNames.map(n => ({ value: n, label: n })),
  ];

  const selected = await p.multiselect<string>({
    message: 'Select skills to install:',
    options: choices,
    required: true,
  });
  if (p.isCancel(selected)) { p.cancel('Cancelled.'); return null; }

  const result = selected as string[];
  // If "All skills" was selected, return full list
  if (result.includes('__all__')) return skillNames;
  return result;
}

// Step 3: Global or project scope?
export async function promptScopeSelection(): Promise<InstallScope | null> {
  const selected = await p.select<InstallScope>({
    message: 'Install to global or project scope?',
    options: [
      { value: 'global', label: 'Global', hint: '~/.claude/skills/ (recommended)' },
      { value: 'project', label: 'Project', hint: '.claude/skills/ in current directory' },
    ],
  });
  if (p.isCancel(selected)) { p.cancel('Cancelled.'); return null; }
  return selected;
}

// Confirm destructive actions
export async function promptConfirm(message: string): Promise<boolean> {
  const ok = await p.confirm({ message });
  if (p.isCancel(ok)) return false;
  return ok as boolean;
}

export const { intro, outro, spinner, log: clackLog } = p;
