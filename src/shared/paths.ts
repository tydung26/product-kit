import { homedir } from 'os';
import { join } from 'path';

const home = homedir();

// Absolute path to the commands/pkit/ directory bundled in this npm package
export const PACKAGE_COMMANDS_DIR = join(__dirname, '..', '..', 'commands', 'pkit');

// Manifest + config storage
export const CONFIG_DIR = join(home, '.config', 'product-kit');
export const MANIFEST_PATH = join(CONFIG_DIR, 'manifest.json');
export const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

// Default install paths per tool (global scope) — commands go into commands/pkit/
export const DEFAULT_TOOL_PATHS = {
  // Claude Code + OpenCode both read ~/.claude/commands/
  claude: join(home, '.claude', 'commands', 'pkit'),
  // OpenCode shares the same path as Claude Code
  opencode: join(home, '.claude', 'commands', 'pkit'),
  // Antigravity uses a separate path (configurable)
  antigravity: join(home, '.gemini', 'antigravity', 'commands', 'pkit'),
} as const;

// Project-scope path segments (joined with cwd at runtime in resolve-paths.ts)
export const PROJECT_TOOL_SEGMENTS = {
  claude: join('.claude', 'commands', 'pkit'),
  opencode: join('.claude', 'commands', 'pkit'),
  antigravity: join('.agent', 'commands', 'pkit'),
} as const;
