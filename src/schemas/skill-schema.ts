import { z } from 'zod';

// Validates command .md YAML frontmatter (Claude Code commands format)
// description: required, 1-256 chars
// argument-hint: optional usage hint shown in slash command picker
export const CommandSchema = z.object({
  description: z.string().min(1).max(256),
  'argument-hint': z.string().optional(),
});

export type CommandFrontmatter = z.infer<typeof CommandSchema>;

// Legacy alias kept for test backward compatibility
export const SkillSchema = CommandSchema;
export type SkillFrontmatter = CommandFrontmatter;
