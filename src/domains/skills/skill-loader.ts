import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PACKAGE_SKILLS_DIR } from '../../shared/paths';
import { validateSkillContent } from './skill-validator';
import type { Skill } from '../../types';

// Loads all skills from the bundled skills/ directory
export function loadAvailableSkills(): Skill[] {
  if (!existsSync(PACKAGE_SKILLS_DIR)) return [];

  const skills: Skill[] = [];
  const entries = readdirSync(PACKAGE_SKILLS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(PACKAGE_SKILLS_DIR, entry.name);
    const skillFile = join(skillDir, 'SKILL.md');
    if (!existsSync(skillFile)) continue;

    try {
      const content = readFileSync(skillFile, 'utf8');
      const meta = validateSkillContent(content, skillFile);
      skills.push({ name: entry.name, dirPath: skillDir, meta });
    } catch {
      // Skip invalid skills silently in production
    }
  }

  return skills;
}

// Find a single skill by name (directory name)
export function findSkillByName(name: string): Skill | undefined {
  return loadAvailableSkills().find(s => s.name === name);
}
