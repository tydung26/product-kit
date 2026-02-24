# Phase 05 — Config, Doctor & UX Polish

## Context Links
- Parent plan: [plan.md](plan.md)
- Depends on: [Phase 04](phase-04-cli-commands.md)

## Overview
- **Date:** 2026-02-24
- **Priority:** P1
- **Status:** pending
- **Effort:** ~2h
- **Description:** Implement `config` command for user preferences, `doctor` for diagnostics, and polish overall UX (intro banner, success/error formatting, verbose mode).

## Key Insights
- `config` only needs to manage `defaultTool` and `defaultScope` preferences — keep simple
- `doctor` checks: required dirs exist, skill files valid, no permission issues
- Banner + spinners from `@clack/prompts` give professional UX at zero cost
- All output should respect `--json` flag for scripting integration

## Requirements
- `pk config` — show current config (defaultTool, defaultScope)
- `pk config set <key> <value>` — set a config value
- `pk doctor` — run diagnostics and report issues with suggestions
- Consistent UX: intro banner, spinners during operations, success/error states
- `--json` flag outputs JSON instead of formatted text (for scripting)

## Architecture

```
src/commands/
├── config/
│   └── index.ts            # Config get/set subcommands
└── doctor/
    └── index.ts            # Diagnostics runner

src/domains/config/
├── index.ts                # Facade: getConfig(), setConfig()
└── config-store.ts         # Read/write ~/.config/product-kit/config.json

src/domains/ui/
├── banner.ts               # Welcome banner with version
├── spinner.ts              # Ora-based spinner wrapper
└── formatter.ts            # Table, success, error, warning formatters
```

## Related Code Files
- Modify: `src/commands/config/index.ts` (was stub)
- Modify: `src/commands/doctor/index.ts` (was stub)
- Create: `src/domains/config/index.ts`
- Create: `src/domains/config/config-store.ts`
- Create: `src/domains/ui/banner.ts`
- Create: `src/domains/ui/spinner.ts`
- Create: `src/domains/ui/formatter.ts`

## Implementation Steps

### 1. Config store (`src/domains/config/config-store.ts`)
```ts
interface ProductKitConfig {
  defaultTool: ToolName;       // default: 'all'
  defaultScope: InstallScope;  // default: 'global'
  version: string;
}
const CONFIG_PATH = join(home, '.config', 'product-kit', 'config.json');
// getConfig(), setConfig(key, value), resetConfig()
```

### 2. `pk config` command
```
pk config                      → shows current config as table
pk config set default-tool claude
pk config set default-scope project
pk config reset                → restore defaults
```

### 3. Doctor diagnostics (`src/commands/doctor/index.ts`)
Checks to run in sequence:
- [ ] Bun/Node version meets minimum (`>=18.0.0`)
- [ ] `~/.claude/skills/` directory exists (or warn + suggest create)
- [ ] `~/.gemini/antigravity/skills/` exists (warn if Antigravity not installed)
- [ ] Manifest file exists and is valid JSON
- [ ] All manifest-listed skill dirs actually exist on disk
- [ ] Each installed SKILL.md has valid frontmatter

Output format:
```
product-kit doctor

✓ Node version: 22.0.0 (ok)
✓ Claude skills dir: ~/.claude/skills/ (exists)
⚠ Antigravity skills dir: not found (Antigravity may not be installed)
✓ Manifest: 3 skills tracked
✓ prd-writer: installed, valid
✓ user-story-gen: installed, valid
✗ roadmap-planner: dir missing (run: pk install roadmap-planner)

Summary: 1 issue found
```

### 4. UX polish (`src/domains/ui/`)

**Banner** — shown on `pk install` and `pk list`:
```
┌─────────────────────────────────┐
│  product-kit v0.1.0             │
│  PM skills for AI assistants    │
└─────────────────────────────────┘
```

**Spinner wrapper** — wrap long operations:
```ts
const spin = spinner('Installing prd-writer...');
spin.start();
await installSkill(...);
spin.succeed('prd-writer installed');
```

**Formatter** — consistent success/error/warning:
```ts
log.success('✓ Installed: prd-writer → ~/.claude/skills/prd-writer/');
log.warn('⚠ Skipped: user-story-gen (already installed, use --force to overwrite)');
log.error('✗ Failed: feature-prioritize — permission denied');
```

### 5. Add `--json` flag support in `src/cli/setup.ts`
- Set global `process.env.JSON_OUTPUT = 'true'` when flag present
- All formatters check this flag → output JSON instead of colored text

## Todo List
- [ ] `src/domains/config/config-store.ts` — JSON config R/W
- [ ] `src/domains/config/index.ts` — facade
- [ ] `src/commands/config/index.ts` — get/set/reset subcommands
- [ ] `src/commands/doctor/index.ts` — 7 diagnostic checks
- [ ] `src/domains/ui/banner.ts`
- [ ] `src/domains/ui/spinner.ts` — ora wrapper
- [ ] `src/domains/ui/formatter.ts` — success/error/warn/table
- [ ] Wire `--json` flag in `src/cli/setup.ts`
- [ ] Integrate banner into `install` and `list` commands
- [ ] Test `pk doctor` with missing Antigravity dir (expect warning, not error)

## Success Criteria
- `pk config` shows defaultTool and defaultScope
- `pk config set default-tool claude` updates config and confirms
- `pk doctor` passes all checks on a clean install, warns about missing Antigravity
- `pk install --json` outputs structured JSON (scriptable)
- Spinners display during `install` operations

## Risk Assessment
- **Low:** UX layer is additive; no risk to core functionality
- `@clack/prompts` spinner may conflict with `--json` mode — suppress in JSON mode

## Security Considerations
- Config file at `~/.config/product-kit/config.json` — no secrets stored
- Validate `setConfig` keys against whitelist to prevent config poisoning

## Next Steps
- Phase 06: Tests, build, and npm publish
