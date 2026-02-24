# Phase 03 — Install Domain: Multi-Tool Path Resolution

## Context Links
- Parent plan: [plan.md](plan.md)
- Research: [AI Tool Skill Formats](research/researcher-01-ai-tools-skill-formats.md)
- Depends on: [Phase 01](phase-01-project-bootstrap.md), [Phase 02](phase-02-pm-skills-content.md)

## Overview
- **Date:** 2026-02-24
- **Priority:** P0
- **Status:** pending
- **Effort:** ~3h
- **Description:** Build the core install domain — resolves target paths per tool and scope, copies skill files, handles conflicts, and tracks installed skills in a manifest.

## Key Insights
- Claude Code + OpenCode share `~/.claude/skills/` → single copy covers both
- Antigravity needs a separate copy to `~/.gemini/antigravity/skills/`
- Manifest file at `~/.config/product-kit/manifest.json` tracks what's installed
- Never overwrite user-modified skills without explicit `--force` flag
- Use `fs-extra` for cross-platform dir creation and file copy

## Requirements
- **Functional:**
  - Resolve correct destination paths per tool + scope
  - Copy skill directory recursively (SKILL.md + subdirs)
  - Skip already-installed skills (unless `--force`)
  - Track installations in manifest (tool, path, version, date)
  - Support `--tool claude|antigravity|opencode|all` option
  - Support `--scope global|project` option (default: global)
- **Non-functional:** Pure TypeScript, no shell scripts, ≤200 lines per file

## Architecture

```
src/domains/installation/
├── index.ts                       # Facade: installSkills(names, options)
├── resolve-paths.ts               # Phase: determine dest paths per tool+scope
├── copy-skill-files.ts            # Phase: recursive file copy with conflict check
└── manifest-manager.ts            # Phase: read/write ~/.config/product-kit/manifest.json

src/domains/skills/
├── index.ts                       # Facade: listAvailable(), getSkillMeta()
├── skill-loader.ts                # Find skills in package skills/ dir
└── skill-validator.ts             # Validate SKILL.md frontmatter with Zod
```

## Related Code Files
- Create: `src/domains/installation/index.ts`
- Create: `src/domains/installation/resolve-paths.ts`
- Create: `src/domains/installation/copy-skill-files.ts`
- Create: `src/domains/installation/manifest-manager.ts`
- Create: `src/domains/skills/index.ts`
- Create: `src/domains/skills/skill-loader.ts`
- Create: `src/domains/skills/skill-validator.ts`
- Modify: `src/shared/paths.ts` (finalize path constants)

## Implementation Steps

### 1. `src/shared/paths.ts` — finalize tool paths
```ts
export function getToolPaths(tool: ToolName, scope: InstallScope) {
  if (scope === 'global') {
    return {
      claude: join(home, '.claude', 'skills'),
      antigravity: join(home, '.gemini', 'antigravity', 'skills'),
      opencode: join(home, '.claude', 'skills'), // OpenCode reads ~/.claude/skills
    }[tool === 'all' ? 'claude' : tool];
  }
  // project scope...
}
export function getAllToolPaths(scope: InstallScope): Record<string, string> { ... }
export const MANIFEST_PATH = join(home, '.config', 'product-kit', 'manifest.json');
export const PACKAGE_SKILLS_DIR = join(__dirname, '..', '..', 'skills');
```

### 2. `src/domains/skills/skill-loader.ts`
- Read `skills/` dir from package root
- For each subdirectory, read SKILL.md frontmatter
- Return array of `{ name, path, meta }` objects

### 3. `src/domains/skills/skill-validator.ts`
```ts
import { z } from 'zod';
const SkillSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(64),
  description: z.string().min(1).max(1024),
  license: z.string().optional(),
});
```

### 4. `src/domains/installation/resolve-paths.ts`
- Input: `ToolName`, `InstallScope`, `skillName`
- Output: `string[]` — all destination paths to copy to
- Logic: `all` → expand to `['claude', 'antigravity']` (opencode shares claude path)

### 5. `src/domains/installation/copy-skill-files.ts`
```ts
async function copySkill(srcDir: string, destDir: string, force: boolean) {
  const destSkillDir = join(destDir, basename(srcDir));
  if (await exists(destSkillDir) && !force) {
    return { status: 'skipped', reason: 'already installed' };
  }
  await ensureDir(destSkillDir);
  await copy(srcDir, destSkillDir, { overwrite: force });
  return { status: 'installed' };
}
```

### 6. `src/domains/installation/manifest-manager.ts`
```ts
interface ManifestEntry {
  name: string; tool: string; path: string; installedAt: string; version: string;
}
// readManifest(), writeManifest(), addEntry(), removeEntry(), isInstalled()
```

### 7. `src/domains/installation/index.ts` — Facade
```ts
export async function installSkills(names: string[], opts: InstallOptions) {
  const available = await loadAvailableSkills();
  const toInstall = names.length ? available.filter(s => names.includes(s.name)) : available;
  const paths = resolveTargetPaths(opts.tools, opts.scope);
  for (const skill of toInstall) {
    for (const destBase of paths) {
      const result = await copySkill(skill.path, destBase, opts.force);
      // log result, update manifest
    }
  }
}
```

## Todo List
- [ ] Finalize `src/shared/paths.ts` with `getToolPaths()` and `getAllToolPaths()`
- [ ] `src/domains/skills/skill-loader.ts` — read package skills dir
- [ ] `src/domains/skills/skill-validator.ts` — Zod schema + validator
- [ ] `src/domains/skills/index.ts` — facade
- [ ] `src/domains/installation/resolve-paths.ts`
- [ ] `src/domains/installation/copy-skill-files.ts`
- [ ] `src/domains/installation/manifest-manager.ts`
- [ ] `src/domains/installation/index.ts` — facade
- [ ] Unit test: path resolution for each tool+scope combo
- [ ] Manual test: install one skill → verify files appear in correct dirs

## Success Criteria
- `installSkills(['prd-writer'], { tools: 'all', scope: 'global' })` copies to:
  - `~/.claude/skills/prd-writer/` (Claude + OpenCode)
  - `~/.gemini/antigravity/skills/prd-writer/` (Antigravity)
- Installing same skill twice → skipped (no `--force`), overwrites with `--force`
- Manifest correctly records installed skills

## Risk Assessment
- **Low-Medium:** Path resolution logic is the most complex part; unit test all combos
- `~/.gemini/antigravity/skills/` path may differ across Antigravity versions — make configurable

## Security Considerations
- Validate skill names before constructing file paths (prevent path traversal)
- Never follow symlinks during copy
- Manifest file is user-local; no sensitive data stored

## Next Steps
- Phase 04: Wire install domain into CLI commands
