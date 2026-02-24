import { join } from 'path';
import { PROJECT_TOOL_SEGMENTS } from '../../shared/paths';
import { getConfig } from '../config';
import type { ToolName, InstallScope } from '../../types';

// Returns the list of destination base directories for a given tool + scope combo.
// "all" expands to claude + antigravity (opencode shares the claude path).
export function resolveTargetPaths(tool: ToolName, scope: InstallScope): string[] {
  const config = getConfig();
  const cwd = process.cwd();

  if (scope === 'global') {
    if (tool === 'claude') return [config.toolPaths.claude];
    if (tool === 'opencode') return [config.toolPaths.opencode]; // same as claude by default
    if (tool === 'antigravity') return [config.toolPaths.antigravity];
    // "all" — deduplicate in case claude + opencode paths are identical
    const paths = [config.toolPaths.claude, config.toolPaths.antigravity];
    if (config.toolPaths.opencode !== config.toolPaths.claude) {
      paths.push(config.toolPaths.opencode);
    }
    return [...new Set(paths)];
  }

  // Project scope
  if (tool === 'claude') return [join(cwd, PROJECT_TOOL_SEGMENTS.claude)];
  if (tool === 'opencode') return [join(cwd, PROJECT_TOOL_SEGMENTS.opencode)];
  if (tool === 'antigravity') return [join(cwd, PROJECT_TOOL_SEGMENTS.antigravity)];
  // "all"
  return [...new Set([
    join(cwd, PROJECT_TOOL_SEGMENTS.claude),
    join(cwd, PROJECT_TOOL_SEGMENTS.antigravity),
    join(cwd, PROJECT_TOOL_SEGMENTS.opencode),
  ])];
}
