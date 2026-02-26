# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test

```bash
pnpm run build          # TypeScript → dist/ (CommonJS)
pnpm run lint           # tsc --noEmit
pnpm test               # vitest run (33 tests)
pnpm test -- tests/add-command.test.ts  # Run single test file
pnpm run dev            # Run from source via tsx
```

## Architecture

CLI tool (`pkit`) that installs product-engineering skill files (SKILL.md) into AI assistant directories.

### Domain Structure (`src/`)

- **`commands/`** — CAC CLI command handlers (init, add, list, update, remove, doctor). Each registers via `registerX(cli: CAC)` pattern, wired in `index.ts`.
- **`domains/skills/`** — Loads skills from `skills/` package directory. Each skill is a directory containing `SKILL.md` with YAML frontmatter (`name`, `description`).
- **`domains/installation/`** — Core install/remove/update logic. `copySkillDir()` copies entire skill directories (not individual files). `scanInstalledSkills()` checks both global + project scopes, filtered to pkit-only directories. `safeCwd()` prevents EPERM crash. Manifest tracks installs in `~/.config/product-kit/manifest.json`.
- **`domains/ui/prompts.ts`** — Interactive prompts via @clack/prompts (tool selection, skill picker, scope picker).
- **`domains/config/`** — User config stored at `~/.config/product-kit/config.json`. Overridable tool paths.
- **`shared/paths.ts`** — All path constants (package skills dir, config dir, default tool paths, project segments).
- **`types/`** — Shared TypeScript types (`Skill`, `ToolName`, `InstallScope`, `ManifestEntry`).

### Key Concepts

- **Skill naming**: Directory name becomes command name with `pkit:` prefix (e.g. `skills/discover/` → `pkit:discover`).
- **Install scopes**: Global (`~/.claude/skills/<name>/`) or project (`.claude/skills/<name>/`). Skills are copied as entire directories.
- **Tool targets**: `claude` (also covers opencode), `antigravity`, or `all`.
- **Command aliases**: init→i, list→ls, update→u, remove→rm (use `.alias()` method, NOT pipe syntax in command string).

### Testing

Tests in `tests/` use vitest. Tests importing source (`../src/`) can mock dependencies with `vi.hoisted()` + `vi.mock()`. Tests importing dist (`../dist/`) work for pure/sync tests only (mocking won't intercept).
