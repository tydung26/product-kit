import { existsSync } from 'fs';
import { copy, ensureDir, remove } from 'fs-extra';
import { join, basename, resolve } from 'path';

export type CopyResult =
  | { status: 'installed'; destPath: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; error: string };

// Safely copies a skill directory to destBase/skillName.
// Validates paths to prevent directory traversal attacks.
export async function copySkillDir(
  srcDir: string,
  destBase: string,
  force: boolean,
): Promise<CopyResult> {
  const skillName = basename(srcDir);

  // Path traversal guard: resolved dest must be inside destBase
  const destSkillDir = join(destBase, skillName);
  if (!resolve(destSkillDir).startsWith(resolve(destBase))) {
    return { status: 'failed', error: `Path traversal attempt blocked for: ${skillName}` };
  }

  if (existsSync(destSkillDir) && !force) {
    return { status: 'skipped', reason: 'already installed (use --force to overwrite)' };
  }

  try {
    await ensureDir(destBase);
    if (existsSync(destSkillDir) && force) await remove(destSkillDir);
    await copy(srcDir, destSkillDir, { overwrite: force });
    return { status: 'installed', destPath: destSkillDir };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) };
  }
}
