import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { loadAvailableSkills } from '../skills';
import { resolveTargetPaths } from './resolve-paths';
import { copySkillDir } from './copy-skill-files';
import { addManifestEntry, removeManifestEntries, getManifestEntries } from './manifest-manager';
import { log } from '../../shared/logger';
import { DEFAULT_TOOL_PATHS, PROJECT_TOOL_SEGMENTS } from '../../shared/paths';
import type { InstallOptions, ToolName } from '../../types';

// Safe CWD getter — falls back to home when CWD is unavailable (deleted directory)
function safeCwd(): string {
  try { return process.cwd(); }
  catch { return homedir(); }
}

// Read current package version for manifest tracking
function getPkgVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'package.json'), 'utf8'));
    return pkg.version as string;
  } catch { return '0.0.0'; }
}

// Install one or more skills. If names is empty, installs all available.
export async function installSkills(names: string[], opts: InstallOptions): Promise<void> {
  const available = loadAvailableSkills();
  const toInstall = names.length
    ? available.filter(s => names.includes(s.name))
    : available;

  if (toInstall.length === 0) {
    log.warn(names.length ? `No skills found matching: ${names.join(', ')}` : 'No skills available to install');
    return;
  }

  const destPaths = resolveTargetPaths(opts.tools, opts.scope);
  const pkgVersion = getPkgVersion();

  for (const skill of toInstall) {
    for (const destBase of destPaths) {
      const result = await copySkillDir(skill.dirPath, skill.dirName, destBase, opts.force ?? false);
      if (result.status === 'installed') {
        log.success(`Installed: ${skill.name} → ${result.destPath}`);
        addManifestEntry({
          name: skill.name,
          tool: opts.tools,
          destPath: result.destPath,
          installedAt: new Date().toISOString(),
          pkgVersion,
        });
      } else if (result.status === 'skipped') {
        log.warn(`Skipped: ${skill.name} — ${result.reason}`);
      } else {
        log.error(`Failed: ${skill.name} — ${result.error}`);
      }
    }
  }
}

// Remove skills by name from both manifest and actual directories on disk.
// Scans global + project scopes so skills installed outside manifest are also removed.
export async function removeSkills(names: string[]): Promise<void> {
  const { remove } = await import('fs-extra');

  const allDirs = [
    DEFAULT_TOOL_PATHS.claude,
    DEFAULT_TOOL_PATHS.antigravity,
    join(safeCwd(), PROJECT_TOOL_SEGMENTS.claude),
    join(safeCwd(), PROJECT_TOOL_SEGMENTS.antigravity),
  ];

  for (const name of names) {
    // Strip "pkit:" prefix to get directory name
    const dirName = name.replace(/^pkit:/, '');
    let removed = false;

    // Remove from manifest
    removeManifestEntries(name);

    // Remove actual directories from all scopes
    for (const base of allDirs) {
      const skillDir = join(base, dirName);
      if (existsSync(skillDir)) {
        try {
          await remove(skillDir);
          log.success(`Removed: ${name} from ${skillDir}`);
          removed = true;
        } catch (err) {
          log.error(`Failed to remove ${skillDir}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    if (!removed) log.warn(`Not installed: ${name}`);
  }
}

// Update skills using manifest-recorded tools (not blindly 'all').
// When --tool is explicitly passed, use that override instead.
export async function updateSkills(names: string[], opts: InstallOptions & { toolOverride?: boolean }): Promise<void> {
  // If user explicitly passed --tool, use it directly
  if (opts.toolOverride) {
    await installSkills(names, { ...opts, force: true });
    return;
  }

  // Derive tools from manifest entries per skill
  const entries = getManifestEntries().filter(e => names.includes(e.name));
  if (entries.length === 0) {
    log.warn('No matching manifest entries to update.');
    return;
  }

  // Group by tool to batch reinstalls
  const byTool = new Map<string, string[]>();
  for (const entry of entries) {
    if (!byTool.has(entry.tool)) byTool.set(entry.tool, []);
    const skillNames = byTool.get(entry.tool)!;
    if (!skillNames.includes(entry.name)) skillNames.push(entry.name);
  }

  for (const [tool, skillNames] of byTool) {
    await installSkills(skillNames, {
      ...opts,
      tools: tool as ToolName,
      force: true,
    });
  }
}

// Scan both global and project scope directories for installed pkit skills.
// Only matches directories whose names are known pkit skills (not other tools' skills).
export function scanInstalledSkills(): string[] {
  const pkitDirNames = new Set(loadAvailableSkills().map(s => s.dirName));

  const dirs = [
    DEFAULT_TOOL_PATHS.claude,
    DEFAULT_TOOL_PATHS.antigravity,
    join(safeCwd(), PROJECT_TOOL_SEGMENTS.claude),
    join(safeCwd(), PROJECT_TOOL_SEGMENTS.antigravity),
  ];

  const found = new Set<string>();
  for (const base of dirs) {
    if (!existsSync(base)) continue;
    try {
      for (const entry of readdirSync(base, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (pkitDirNames.has(entry.name)) {
          found.add(`pkit:${entry.name}`);
        }
      }
    } catch { /* skip unreadable dirs */ }
  }
  return [...found];
}

export { getManifestEntries };
