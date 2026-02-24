---
parent: ./plan.md
status: pending
priority: P1
effort: 30m
---

# Phase 01: Fix Update Command Tool Derivation

## Context

- Parent: [plan.md](./plan.md)
- Docs: `src/commands/update/index.ts`, `src/domains/installation/index.ts`

## Overview

- **Date:** 2026-02-24
- **Description:** Make `pkit update` respect per-tool manifest entries instead of defaulting to `'all'`
- **Priority:** P1 — breaks user expectations
- **Implementation status:** pending
- **Review status:** pending

## Key Insights

1. Manifest stores `tool` per entry (e.g., `"claude"`, `"antigravity"`, `"all"`)
2. `updateSkills()` just calls `installSkills()` with `force: true` — it doesn't read manifest tool info
3. Update command hardcodes `tools: opts.tool ?? 'all'` — ignores manifest

## Requirements

- When `--tool` flag NOT provided: update each skill only to the tools recorded in its manifest entries
- When `--tool` flag provided: respect the explicit flag (existing behavior)
- Preserve backward compat for `--scope` flag

## Architecture

Current flow:
```
update cmd → get skill names from manifest → installSkills(names, tools='all', force=true)
```

Fixed flow:
```
update cmd → get entries from manifest → group by skill → per skill, derive tools from entries → installSkills per group
```

**Simpler approach:** Instead of grouping, change `updateSkills()` to iterate manifest entries directly and reinstall each entry to its recorded `destPath` only.

## Related Code Files

| File | Role |
|------|------|
| `src/commands/update/index.ts` | Command registration, opts parsing |
| `src/domains/installation/index.ts` | `updateSkills()`, `installSkills()` |
| `src/domains/installation/manifest-manager.ts` | `getManifestEntries()` |
| `src/domains/installation/copy-skill-files.ts` | File copy logic |
| `src/types/index.ts` | `ManifestEntry` type |

## Implementation Steps

### Step 1: Refactor `updateSkills()` in `src/domains/installation/index.ts`

Change `updateSkills` to use manifest entries directly:

```typescript
export async function updateSkills(names: string[], opts: InstallOptions): Promise<void> {
  const entries = getManifestEntries();
  const toUpdate = names.length
    ? entries.filter(e => names.includes(e.name))
    : entries;

  if (toUpdate.length === 0) {
    log.warn('No matching manifest entries to update.');
    return;
  }

  // Group entries by tool to batch reinstalls
  const byTool = new Map<string, string[]>();
  for (const entry of toUpdate) {
    const tool = entry.tool;
    if (!byTool.has(tool)) byTool.set(tool, []);
    const skillNames = byTool.get(tool)!;
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
```

### Step 2: Update `src/commands/update/index.ts`

Remove the `tools: opts.tool ?? 'all'` default. Pass `opts.tool` only when explicitly provided:

```typescript
await updateSkills(toUpdate, {
  tools: opts.tool ?? 'all',  // only used as fallback when updateSkills needs it
  scope: opts.scope as InstallScope,
  force: true,
});
```

Actually — since `updateSkills` now reads manifest entries directly, the `tools` field in opts becomes a filter/override only when `--tool` is explicitly passed. If not passed, `updateSkills` uses manifest-recorded tools.

### Step 3: Verify with tests

Run `npm test` to ensure no regressions.

## Todo

- [ ] Refactor `updateSkills()` to use manifest entries for tool derivation
- [ ] Update `update` command to not default to `'all'`
- [ ] Run tests
- [ ] Manual test: install claude-only, verify update only touches claude paths

## Success Criteria

1. `pkit init --tool claude` then `pkit update` → only updates Claude paths
2. `pkit init --tool all` then `pkit update` → updates all paths
3. `pkit update --tool antigravity` → explicit override works
4. All existing tests pass

## Risk Assessment

- **Low risk** — isolated change to update flow, install flow untouched
- Manifest data already has `tool` field, no schema changes needed

## Security Considerations

- None — file copy paths derived from trusted manifest data

## Next Steps

After implementation: bump version, publish, commit + push.
