import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { PACKAGE_COMMANDS_DIR } from '../../shared/paths';
import { validateSkillContent } from './skill-validator';
import type { Skill } from '../../types';

// Derives the slash-command name from a filename: "brainstorm.md" → "pkit:brainstorm"
function fileNameToCommandName(filename: string): string {
  return `pkit:${basename(filename, '.md')}`;
}

// Loads all commands from the bundled commands/pkit/ directory
export function loadAvailableSkills(): Skill[] {
  if (!existsSync(PACKAGE_COMMANDS_DIR)) return [];

  const skills: Skill[] = [];
  const entries = readdirSync(PACKAGE_COMMANDS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const filePath = join(PACKAGE_COMMANDS_DIR, entry.name);

    try {
      const content = readFileSync(filePath, 'utf8');
      const meta = validateSkillContent(content, filePath);
      skills.push({ name: fileNameToCommandName(entry.name), filePath, meta });
    } catch {
      // Skip invalid command files silently in production
    }
  }

  return skills;
}

// Find a single command by name (e.g. "pkit:brainstorm")
export function findSkillByName(name: string): Skill | undefined {
  return loadAvailableSkills().find(s => s.name === name);
}
