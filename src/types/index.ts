// Supported AI coding assistants
export type ToolName = 'claude' | 'antigravity' | 'opencode' | 'all';

// Installation scope: user-global or current project
export type InstallScope = 'global' | 'project';

// Parsed SKILL.md frontmatter
export interface SkillMeta {
  name: string;
  description: string;
  license?: string;
}

// A skill found in the package's skills/ directory
export interface Skill {
  name: string;       // e.g. "pkit:brainstorm"
  dirPath: string;    // absolute path to skill directory
  meta: SkillMeta;
}

// Options passed to install/remove/update commands
export interface InstallOptions {
  tools: ToolName;
  scope: InstallScope;
  force?: boolean;
  yes?: boolean;      // skip interactive prompts
}

// Entry in the manifest tracking installed skills
export interface ManifestEntry {
  name: string;
  tool: string;
  destPath: string;
  installedAt: string;
  pkgVersion: string;
}
