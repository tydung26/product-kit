# Plan: Update init command interactive prompts

## Overview
Update `pkit init` interactive flow with better defaults and add scope prompt.

## Changes

### 1. `src/domains/ui/prompts.ts`

**`promptToolSelection()`** — Reorder options, default to `claude`:
```
1. Claude Code (recommended) — hint: also covers OpenCode
2. Antigravity
3. All tools
```

**`promptSkillSelection()`** — Add "All skills" as first option:
```
1. All skills (recommended)
2. Individual skill multi-select
```
If "All skills" selected → return all names. Otherwise → existing multiselect.

**Add `promptScopeSelection()`** — New prompt:
```
1. Global (~/.claude/skills/) (recommended)
2. Project (.claude/skills/ in current directory)
```

### 2. `src/commands/install/index.ts`

Update flow order:
1. Ask tool (default: claude)
2. Ask skills (default: all)
3. Ask scope (default: global)

Remove hardcoded `--scope` default from CLI options (still accept as flag).

Update `-y` behavior: installs all skills to claude + global scope.

## Files
- `src/domains/ui/prompts.ts` — modify 2 prompts, add 1
- `src/commands/install/index.ts` — add scope prompt step
