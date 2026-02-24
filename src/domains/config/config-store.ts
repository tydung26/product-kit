import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { dirname } from 'path';
import { CONFIG_PATH, DEFAULT_TOOL_PATHS } from '../../shared/paths';

export interface ProductKitConfig {
  defaultScope: 'global' | 'project';
  // Allow users to override per-tool install paths (e.g. if Antigravity changes its path)
  toolPaths: {
    claude: string;
    antigravity: string;
    opencode: string;
  };
}

const DEFAULT_CONFIG: ProductKitConfig = {
  defaultScope: 'global',
  toolPaths: {
    claude: DEFAULT_TOOL_PATHS.claude,
    antigravity: DEFAULT_TOOL_PATHS.antigravity,
    opencode: DEFAULT_TOOL_PATHS.opencode,
  },
};

export function getConfig(): ProductKitConfig {
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Partial<ProductKitConfig>;
    return { ...DEFAULT_CONFIG, ...raw, toolPaths: { ...DEFAULT_CONFIG.toolPaths, ...raw.toolPaths } };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setConfigValue(key: string, value: string): void {
  const config = getConfig();
  // Support dot notation: "toolPaths.antigravity"
  if (key.startsWith('toolPaths.')) {
    const tool = key.split('.')[1] as keyof ProductKitConfig['toolPaths'];
    if (tool in config.toolPaths) config.toolPaths[tool] = value;
    else throw new Error(`Unknown tool path key: ${tool}`);
  } else if (key === 'defaultScope') {
    if (value !== 'global' && value !== 'project') throw new Error('defaultScope must be global or project');
    config.defaultScope = value;
  } else {
    throw new Error(`Unknown config key: ${key}. Valid keys: defaultScope, toolPaths.claude, toolPaths.antigravity, toolPaths.opencode`);
  }
  ensureDirSync(dirname(CONFIG_PATH));
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
