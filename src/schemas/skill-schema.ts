import { z } from 'zod';

// Validates SKILL.md YAML frontmatter per agentskills.io spec
// Name: 1-64 chars, lowercase alphanumeric + hyphens + colons (pkit:name pattern)
export const SkillSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9:]+([:-][a-z0-9]+)*$/, 'Name must be lowercase alphanumeric with hyphens/colons'),
  description: z.string().min(1).max(1024),
  license: z.string().optional(),
});

export type SkillFrontmatter = z.infer<typeof SkillSchema>;
