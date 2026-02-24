import { readFileSync } from 'fs';
import { join } from 'path';
import { loadAvailableSkills } from '../skills';
import { resolveTargetPaths } from './resolve-paths';
import { copySkillDir } from './copy-skill-files';
import { addManifestEntry, removeManifestEntries, getManifestEntries } from './manifest-manager';
import { log } from '../../shared/logger';
import type { InstallOptions } from '../../types';

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
      const result = await copySkillDir(skill.dirPath, destBase, opts.force ?? false);
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

// Update = reinstall with force, comparing pkg version
export async function updateSkills(names: string[], opts: InstallOptions): Promise<void> {
  await installSkills(names, { ...opts, force: true });
}

export { getManifestEntries };
