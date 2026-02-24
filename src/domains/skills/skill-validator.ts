import { SkillSchema } from '../../schemas/skill-schema';
import type { SkillMeta } from '../../types';

// Parses YAML frontmatter from SKILL.md content (simple regex, no yaml dep needed)
function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    // Handle multi-line values (>) by collapsing them
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '').trim();
    if (key && val) result[key] = val;
  }
  return result;
}

// Validates and returns parsed SKILL.md frontmatter, throws on invalid
export function validateSkillContent(content: string, filePath: string): SkillMeta {
  const raw = parseFrontmatter(content);
  if (!raw) throw new Error(`No frontmatter found in ${filePath}`);

  // For multi-line description (> block), collect continuation lines
  const descMatch = content.match(/description:\s*>\n([\s\S]*?)(?=\n\w|\n---)/);
  if (descMatch) {
    raw['description'] = descMatch[1].replace(/\n\s*/g, ' ').trim();
  }

  const parsed = SkillSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid SKILL.md at ${filePath}: ${parsed.error.message}`);
  }
  return parsed.data;
}
