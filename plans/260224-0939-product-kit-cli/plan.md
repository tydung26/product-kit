---
title: "product-kit CLI"
description: "npm CLI tool that installs 4 PM skills (pkit:brainstorm, pkit:competitive-analysis, pkit:roadmap-planner, pkit:make-prd) into Claude Code, Antigravity, and OpenCode"
status: pending
priority: P1
effort: 8h
branch: main
tags: [cli, npm, product-management, ai-skills, typescript, bun]
created: 2026-02-24
---

# product-kit CLI — Implementation Plan

> A `pkit` CLI that installs curated product management skills into Claude Code, Antigravity, and OpenCode AI assistants.

## Research

- [AI Tool Skill Formats](research/researcher-01-ai-tools-skill-formats.md)
- [PM Prompts & CLI Architecture](research/researcher-02-pm-prompts-cli-architecture.md)

## Architecture Summary

All three AI tools share the **same SKILL.md format**. OpenCode reads `~/.claude/skills/` natively, so Claude Code + OpenCode share one install path. Antigravity uses `~/.gemini/antigravity/skills/` separately.

**Single skill → three tools.** `pkit install` copies skill files to tool-specific directories.

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 01 | [Project Bootstrap & CLI Shell](phase-01-project-bootstrap.md) | pending | 2h |
| 02 | [Skill Content: 4 PM Skills](phase-02-pm-skills-content.md) | pending | 2h |
| 03 | [Install Domain: Multi-Tool Path Resolution](phase-03-install-domain.md) | pending | 3h |
| 04 | [CLI Commands: install, list, update, remove](phase-04-cli-commands.md) | pending | 2h |
| 05 | [Config, Doctor & UX Polish](phase-05-config-doctor-ux.md) | pending | 2h |
| 06 | [Tests, Build & npm Publish](phase-06-tests-build-publish.md) | pending | 1h |

## Key Dependencies

- Bun ≥1.3.2 / Node ≥18.0.0
- `cac` (CLI), `@clack/prompts` (UX), `zod` (validation), `chalk`, `ora`, `fs-extra`
- Skills bundled in `skills/` directory inside npm package
- No GitHub API required (skills ship with package, no remote fetch)

## Validation Summary

**Validated:** 2026-02-24
**Questions asked:** 5

### Confirmed Decisions

- **CLI binary name:** `pkit` (not `pk`)
- **Skills distribution:** Bundled in npm package (no remote fetch)
- **Default tool selection:** Always prompt interactively when `--tool` not specified (no silent writes)
- **Antigravity path:** Configurable via `pkit config set antigravity-path <path>` (default: `~/.gemini/antigravity/skills/`)
- **Update strategy:** Compare installed npm package version vs current; reinstall all if outdated

### Action Items
- [ ] Rename all `pk` references to `pkit` in phase files
- [ ] Phase 04: `install` with no `--tool` flag → `@clack/prompts` multiselect for tool selection (not default `all`)
- [ ] Phase 03: Antigravity path read from `config.json` at runtime (not hardcoded constant)
- [ ] Phase 03: Manifest stores `installedVersion`; `update` compares to `package.json` version
- [ ] Phase 05: `pkit config` must expose `antigravity-path`, `opencode-path` as overridable keys
