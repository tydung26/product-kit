import { homedir } from 'os';
import { join } from 'path';

const home = homedir();

// Absolute path to the skills/ directory bundled in this npm package
export const PACKAGE_COMMANDS_DIR = join(__dirname, '..', '..', 'skills');

// Manifest + config storage
export const CONFIG_DIR = join(home, '.config', 'product-kit');
export const MANIFEST_PATH = join(CONFIG_DIR, 'manifest.json');
export const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

// Default install paths per tool (global scope) — skills install to ~/.claude/skills/
export const DEFAULT_TOOL_PATHS = {
  claude: join(home, '.claude', 'skills'),
  opencode: join(home, '.claude', 'skills'),
  antigravity: join(home, '.gemini', 'antigravity', 'skills'),
} as const;

// Project-scope path segments (joined with cwd at runtime in resolve-paths.ts)
export const PROJECT_TOOL_SEGMENTS = {
  claude: join('.claude', 'skills'),
  opencode: join('.claude', 'skills'),
  antigravity: join('.agent', 'skills'),
} as const;
