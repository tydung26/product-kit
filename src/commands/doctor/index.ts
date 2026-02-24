import type { CAC } from 'cac';
import { existsSync, readFileSync } from 'fs';
import { getConfig } from '../../domains/config';
import { getManifestEntries } from '../../domains/installation';
import { validateSkillContent } from '../../domains/skills';
import { MANIFEST_PATH, PACKAGE_COMMANDS_DIR } from '../../shared/paths';
import { log } from '../../shared/logger';

function check(label: string, ok: boolean, detail: string, fix?: string) {
  if (ok) {
    log.success(`${label}: ${detail}`);
  } else {
    log.error(`${label}: ${detail}${fix ? `\n    Fix: ${fix}` : ''}`);
  }
  return ok;
}

export function registerDoctor(cli: CAC) {
  cli
    .command('doctor', 'Diagnose pkit installation issues')
    .action(() => {
      log.plain('\npkit doctor\n');
      const config = getConfig();
      let issues = 0;

      // 1. Node version
      const nodeVer = process.version.replace('v', '').split('.').map(Number);
      const nodeOk = nodeVer[0] >= 18;
      if (!check('Node version', nodeOk, process.version, 'Upgrade Node to >=18')) issues++;

      // 2. Commands bundled in package
      const commandsOk = existsSync(PACKAGE_COMMANDS_DIR);
      if (!check('Package commands dir', commandsOk, PACKAGE_COMMANDS_DIR, 'Reinstall product-kit')) issues++;

      // 3. Claude commands path exists
      const claudeOk = existsSync(config.toolPaths.claude);
      check('Claude commands dir', claudeOk, config.toolPaths.claude,
        claudeOk ? undefined : `mkdir -p "${config.toolPaths.claude}"`);
      if (!claudeOk) issues++;

      // 4. Antigravity path (warn only — tool may not be installed)
      const agOk = existsSync(config.toolPaths.antigravity);
      if (agOk) {
        log.success(`Antigravity commands dir: ${config.toolPaths.antigravity}`);
      } else {
        log.warn(`Antigravity commands dir not found: ${config.toolPaths.antigravity} (install Antigravity or set toolPaths.antigravity)`);
      }

      // 5. Manifest exists and is valid JSON
      let manifestOk = false;
      if (existsSync(MANIFEST_PATH)) {
        try { JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); manifestOk = true; }
        catch { /* invalid JSON */ }
      } else {
        manifestOk = true; // no manifest = nothing installed yet, that's fine
      }
      if (!check('Manifest file', manifestOk, MANIFEST_PATH, `rm "${MANIFEST_PATH}" and reinstall`)) issues++;

      // 6. Verify each installed command file still exists and has valid frontmatter
      const entries = getManifestEntries();
      for (const entry of entries) {
        const exists = existsSync(entry.destPath);
        if (!exists) {
          log.error(`Missing: ${entry.name} at ${entry.destPath} — run: pkit install ${entry.name} --force`);
          issues++;
        } else {
          try {
            const content = readFileSync(entry.destPath, 'utf8');
            validateSkillContent(content, entry.destPath);
            log.success(`${entry.name}: valid`);
          } catch (err) {
            log.error(`${entry.name}: invalid command file — ${err instanceof Error ? err.message : String(err)}`);
            issues++;
          }
        }
      }

      log.plain('');
      if (issues === 0) {
        log.success('All checks passed.');
      } else {
        log.error(`${issues} issue(s) found. See fixes above.`);
        process.exit(1);
      }
    });
}
