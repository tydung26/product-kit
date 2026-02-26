import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PACKAGE_COMMANDS_DIR } from '../../shared/paths';
import { validateSkillContent } from './skill-validator';
import type { Skill } from '../../types';

// Derives the slash-command name from a directory: "discover" → "pkit:discover"
function dirNameToCommandName(dirName: string): string {
  return `pkit:${dirName}`;
}

// Loads all skills from skills/ directories (each dir contains a SKILL.md file)
export function loadAvailableSkills(): Skill[] {
  if (!existsSync(PACKAGE_COMMANDS_DIR)) return [];

  const skills: Skill[] = [];
  const entries = readdirSync(PACKAGE_COMMANDS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    // Look for SKILL.md inside each skill directory
    const filePath = join(PACKAGE_COMMANDS_DIR, entry.name, 'SKILL.md');
    if (!existsSync(filePath)) continue;

    try {
      const content = readFileSync(filePath, 'utf8');
      const meta = validateSkillContent(content, filePath);
      skills.push({ name: dirNameToCommandName(entry.name), filePath, meta });
    } catch {
      // Skip invalid skill files silently in production
    }
  }

  return skills;
}

// Find a single skill by name (e.g. "pkit:discover")
export function findSkillByName(name: string): Skill | undefined {
  return loadAvailableSkills().find(s => s.name === name);
}
