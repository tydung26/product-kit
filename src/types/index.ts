// Supported AI coding assistants
export type ToolName = 'claude' | 'antigravity' | 'opencode' | 'all';

// Installation scope: user-global or current project
export type InstallScope = 'global' | 'project';

// Parsed command .md frontmatter
export interface SkillMeta {
  description: string;
  argumentHint?: string;
}

// A command found in the package's commands/skills/ directory
export interface Skill {
  name: string;       // e.g. "pkit:discover" (derived from directory name)
  filePath: string;   // absolute path to the .md file
  meta: SkillMeta;
}

// Options passed to install/remove/update commands
export interface InstallOptions {
  tools: ToolName;
  scope: InstallScope;
  force?: boolean;
  yes?: boolean;      // skip interactive prompts
}

// Entry in the manifest tracking installed commands
export interface ManifestEntry {
  name: string;
  tool: string;
  destPath: string;
  installedAt: string;
  pkgVersion: string;
}
