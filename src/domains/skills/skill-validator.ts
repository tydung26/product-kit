import { CommandSchema } from '../../schemas/skill-schema';
import type { SkillMeta } from '../../types';

// Parses YAML frontmatter from command .md content (simple regex, no yaml dep needed)
function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '').trim();
    if (key && val) result[key] = val;
  }
  return result;
}

// Validates and returns parsed command frontmatter, throws on invalid
export function validateSkillContent(content: string, filePath: string): SkillMeta {
  const raw = parseFrontmatter(content);
  if (!raw) throw new Error(`No frontmatter found in ${filePath}`);

  const parsed = CommandSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid command frontmatter at ${filePath}: ${parsed.error.message}`);
  }

  return {
    description: parsed.data.description,
    argumentHint: parsed.data['argument-hint'],
  };
}
