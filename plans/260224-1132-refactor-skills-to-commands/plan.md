# Plan: Refactor Skills → Commands Format

**Date:** 2026-02-24
**Branch:** main
**Status:** Ready to implement

## Context

Currently product-kit bundles 4 PM skills as `skills/pkit:*/SKILL.md` (directory-per-skill, YAML frontmatter with `name`/`description`/`license`). This format targets Claude Code's legacy skills system.

The target format is Claude Code's **commands** system (as used in `~/.claude/commands/nicl/`):
- Flat `.md` files under a namespace directory (`pkit/`)
- Frontmatter: `description` + optional `argument-hint`
- Content can reference `$ARGUMENTS` for user input
- Install to `~/.claude/commands/pkit/` (not `~/.claude/skills/`)

---

## Key Structural Difference

| Aspect | Skills (current) | Commands (target) |
|---|---|---|
| Source layout | `skills/pkit:brainstorm/SKILL.md` | `commands/pkit/brainstorm.md` |
| Frontmatter | `name`, `description`, `license` | `description`, `argument-hint` |
| Install dest | `~/.claude/skills/pkit:brainstorm/` | `~/.claude/commands/pkit/` |
| Invocation | `/pkit:brainstorm` | `/pkit:brainstorm` (same) |
| Copy unit | directory | single `.md` file |

---

## Phases

### Phase 01 — Restructure source files

**Files to create:**
- `commands/pkit/brainstorm.md`
- `commands/pkit/competitive-analysis.md`
- `commands/pkit/roadmap-planner.md`
- `commands/pkit/make-prd.md` (embed prd-template inline)

**Frontmatter format:**
```yaml
---
description: <short description>
argument-hint: <topic-or-context>
---
```

**Changes per file:**
- Remove `name:` and `license:` fields
- Keep `description:` (shorten to ≤120 chars)
- Add `argument-hint:`
- Add `<task>$ARGUMENTS</task>` block after frontmatter
- Keep workflow content intact

**Files to delete:**
- `skills/` directory (entire)

---

### Phase 02 — Update schema & validator

**`src/schemas/skill-schema.ts`:**
```typescript
export const CommandSchema = z.object({
  description: z.string().min(1).max(256),
  'argument-hint': z.string().optional(),
});
```

**`src/domains/skills/skill-validator.ts`:**
- Update to validate `CommandSchema` instead of `SkillSchema`
- Remove `name` and `license` parsing
- Export stays as `validateSkillContent` for backward compat

---

### Phase 03 — Update loader & paths

**`src/shared/paths.ts`:**
- Rename `PACKAGE_SKILLS_DIR` → `PACKAGE_COMMANDS_DIR` = `join(__dirname, '..', '..', 'commands', 'pkit')`
- Update `DEFAULT_TOOL_PATHS`:
  - `claude`: `~/.claude/commands/pkit`
  - `opencode`: `~/.claude/commands/pkit` (shared)
  - `antigravity`: `~/.gemini/antigravity/commands/pkit`
- Update `PROJECT_TOOL_SEGMENTS` accordingly

**`src/domains/skills/skill-loader.ts`:**
- Read flat `.md` files from `PACKAGE_COMMANDS_DIR`
- Derive command name from filename: `brainstorm.md` → `pkit:brainstorm`
- Filter only `.md` files (not directories)

---

### Phase 04 — Update install logic

**`src/domains/installation/copy-skill-files.ts`:**
- Rename `copySkillDir` → `copyCommandFile`
- Copy single `.md` file (not directory) to `destBase/filename.md`
- Keep path traversal guard

**`src/domains/installation/index.ts`:**
- Update to call `copyCommandFile` instead of `copySkillDir`
- `destPath` is now a file path, not directory

---

### Phase 05 — Update types

**`src/types/index.ts`:**
- `SkillMeta`: replace `name`/`license` fields with `argumentHint?: string`
- `Skill.name` stays derived from filename as before

---

### Phase 06 — Update tests

**`tests/skill-validator.test.mjs`:**
- Update valid frontmatter to command format (no `name`/`license`)
- Update invalid cases accordingly

**`tests/skill-loader.test.mjs`:**
- Expectations unchanged (still 4 commands, same names)

**`tests/resolve-paths.test.mjs`:**
- Update expected paths to `commands/pkit` variants

---

### Phase 07 — Update README & package.json

**README.md:**
- Update install paths table
- Update `files` section if needed

**package.json:**
- Update `files` array: `skills/` → `commands/`

---

## Files Changed Summary

| File | Action |
|---|---|
| `skills/` | DELETE entire directory |
| `commands/pkit/brainstorm.md` | CREATE |
| `commands/pkit/competitive-analysis.md` | CREATE |
| `commands/pkit/roadmap-planner.md` | CREATE |
| `commands/pkit/make-prd.md` | CREATE |
| `src/schemas/skill-schema.ts` | MODIFY |
| `src/domains/skills/skill-validator.ts` | MODIFY |
| `src/domains/skills/skill-loader.ts` | MODIFY |
| `src/shared/paths.ts` | MODIFY |
| `src/domains/installation/copy-skill-files.ts` | MODIFY |
| `src/domains/installation/index.ts` | MODIFY |
| `src/types/index.ts` | MODIFY |
| `tests/skill-validator.test.mjs` | MODIFY |
| `tests/resolve-paths.test.mjs` | MODIFY |
| `README.md` | MODIFY |
| `package.json` | MODIFY |

---

## Open Questions

1. **Antigravity commands path**: Unknown if Antigravity reads `~/.gemini/antigravity/commands/`. Defaulting to that path — user to confirm.
2. **OpenCode commands path**: OpenCode currently shares `~/.claude/skills/`. Does it also read `~/.claude/commands/`? Assumed yes.
3. **`prd-template.md`**: Currently a separate file in `skills/pkit:make-prd/templates/`. With flat command files, embed inline in `make-prd.md` or keep as separate template file in `commands/pkit/templates/`? Defaulting to **embed inline**.
