import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { dirname } from 'path';
import { MANIFEST_PATH } from '../../shared/paths';
import type { ManifestEntry } from '../../types';

type Manifest = ManifestEntry[];

function readManifest(): Manifest {
  if (!existsSync(MANIFEST_PATH)) return [];
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
  } catch {
    return [];
  }
}

function writeManifest(manifest: Manifest): void {
  ensureDirSync(dirname(MANIFEST_PATH));
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

export function addManifestEntry(entry: ManifestEntry): void {
  const manifest = readManifest();
  // Remove any existing entry for same skill + tool + dest to avoid duplicates
  const filtered = manifest.filter(
    e => !(e.name === entry.name && e.tool === entry.tool && e.destPath === entry.destPath)
  );
  writeManifest([...filtered, entry]);
}

export function removeManifestEntries(skillName: string): ManifestEntry[] {
  const manifest = readManifest();
  const removed = manifest.filter(e => e.name === skillName);
  writeManifest(manifest.filter(e => e.name !== skillName));
  return removed;
}

export function getManifestEntries(): Manifest {
  return readManifest();
}

export function isSkillInstalled(skillName: string): boolean {
  return readManifest().some(e => e.name === skillName);
}

// Returns the package version recorded when skills were last installed
export function getInstalledVersion(): string | null {
  const manifest = readManifest();
  return manifest[0]?.pkgVersion ?? null;
}
