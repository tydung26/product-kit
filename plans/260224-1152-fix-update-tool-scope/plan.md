---
title: "Fix update command to respect per-tool installation"
description: "Update command reinstalls to all tools instead of only the tools recorded in the manifest"
status: completed
priority: P1
effort: 30m
branch: main
tags: [bugfix, cli, update]
created: 2026-02-24
---

# Fix `pkit update` Tool Scope

## Problem

When user runs `pkit init --tool claude`, manifest records `tool: "claude"`. But `pkit update` defaults `opts.tool` to `'all'` (line 28 in `src/commands/update/index.ts`), causing reinstall to both Claude AND Antigravity paths.

**Root cause:** `src/commands/update/index.ts:28` — `tools: opts.tool ?? 'all'`

## Solution

Instead of defaulting to `'all'`, derive the tool set from manifest entries when no `--tool` flag is provided.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Fix update command to use manifest-derived tools | pending | [phase-01](./phase-01-fix-update-tool-derivation.md) |

## Key Files

- `src/commands/update/index.ts` — update command registration
- `src/domains/installation/index.ts` — `updateSkills()` delegates to `installSkills()`
- `src/domains/installation/manifest-manager.ts` — manifest read/write
- `src/types/index.ts` — `ManifestEntry`, `InstallOptions`
