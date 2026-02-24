import { readFileSync } from 'fs';
import { join } from 'path';
import { loadAvailableSkills } from '../skills';
import { resolveTargetPaths } from './resolve-paths';
import { copyCommandFile } from './copy-skill-files';
import { addManifestEntry, removeManifestEntries, getManifestEntries } from './manifest-manager';
import { log } from '../../shared/logger';
import type { InstallOptions, ToolName } from '../../types';

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
      const result = await copyCommandFile(skill.filePath, destBase, opts.force ?? false);
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

// Remove skills by name, deleting files from all recorded install paths
export async function removeSkills(names: string[]): Promise<void> {
  const { remove } = await import('fs-extra');
  for (const name of names) {
    const removed = removeManifestEntries(name);
    if (removed.length === 0) {
      log.warn(`Not installed: ${name}`);
      continue;
    }
    for (const entry of removed) {
      try {
        await remove(entry.destPath);
        log.success(`Removed: ${name} from ${entry.destPath}`);
      } catch (err) {
        log.error(`Failed to remove ${entry.destPath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
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

export { getManifestEntries };
