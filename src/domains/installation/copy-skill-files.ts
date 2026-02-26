import { existsSync } from 'fs';
import { copy, ensureDir, remove } from 'fs-extra';
import { join, resolve } from 'path';

export type CopyResult =
  | { status: 'installed'; destPath: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; error: string };

// Copies a skill directory (e.g. skills/discover/) into destBase/<dirName>/
// Preserves folder structure so each skill lives in its own subdirectory.
export async function copySkillDir(
  srcDir: string,
  dirName: string,
  destBase: string,
  force: boolean,
): Promise<CopyResult> {
  const destDir = join(destBase, dirName);

  // Path traversal guard
  if (!resolve(destDir).startsWith(resolve(destBase))) {
    return { status: 'failed', error: `Path traversal attempt blocked for: ${dirName}` };
  }

  if (existsSync(destDir) && !force) {
    return { status: 'skipped', reason: 'already installed (use --force to overwrite)' };
  }

  try {
    await ensureDir(destBase);
    if (existsSync(destDir) && force) await remove(destDir);
    await copy(srcDir, destDir, { overwrite: force });
    return { status: 'installed', destPath: destDir };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) };
  }
}
