import { homedir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const home = homedir();

// Absolute path to the skills/ directory bundled in this npm package
export const PACKAGE_SKILLS_DIR = join(__dirname, '..', '..', 'skills');

// Manifest + config storage
export const CONFIG_DIR = join(home, '.config', 'product-kit');
export const MANIFEST_PATH = join(CONFIG_DIR, 'manifest.json');
export const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

// Default install paths per tool (global scope)
export const DEFAULT_TOOL_PATHS = {
  // Claude Code + OpenCode both read ~/.claude/skills/
  claude: join(home, '.claude', 'skills'),
  // OpenCode also reads ~/.claude/skills — same path, no duplicate copy needed
  opencode: join(home, '.claude', 'skills'),
  // Antigravity uses a separate path (configurable)
  antigravity: join(home, '.gemini', 'antigravity', 'skills'),
} as const;

// Project-scope path segments (joined with cwd at runtime in resolve-paths.ts)
export const PROJECT_TOOL_SEGMENTS = {
  claude: join('.claude', 'skills'),
  opencode: join('.opencode', 'skills'),
  antigravity: join('.agent', 'skills'),
} as const;
