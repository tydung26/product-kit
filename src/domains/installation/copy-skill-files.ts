import { existsSync } from 'fs';
import { copy, ensureDir, remove } from 'fs-extra';
import { join, basename, resolve } from 'path';

export type CopyResult =
  | { status: 'installed'; destPath: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; error: string };

// Safely copies a single command .md file to destBase/filename.md.
// Validates paths to prevent directory traversal attacks.
export async function copyCommandFile(
  srcFile: string,
  destBase: string,
  force: boolean,
): Promise<CopyResult> {
  const filename = basename(srcFile);

  // Path traversal guard: resolved dest must be inside destBase
  const destFile = join(destBase, filename);
  if (!resolve(destFile).startsWith(resolve(destBase))) {
    return { status: 'failed', error: `Path traversal attempt blocked for: ${filename}` };
  }

  if (existsSync(destFile) && !force) {
    return { status: 'skipped', reason: 'already installed (use --force to overwrite)' };
  }

  try {
    await ensureDir(destBase);
    if (existsSync(destFile) && force) await remove(destFile);
    await copy(srcFile, destFile, { overwrite: force });
    return { status: 'installed', destPath: destFile };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) };
  }
}

// Legacy alias for any callers using the old name
export const copySkillDir = copyCommandFile;
