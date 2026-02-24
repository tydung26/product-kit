# Phase 04 — CLI Commands: install, list, update, remove

## Context Links
- Parent plan: [plan.md](plan.md)
- Depends on: [Phase 01](phase-01-project-bootstrap.md), [Phase 03](phase-03-install-domain.md)
- Research: [CLI Architecture](research/researcher-02-pm-prompts-cli-architecture.md)

## Overview
- **Date:** 2026-02-24
- **Priority:** P0
- **Status:** pending
- **Effort:** ~2h
- **Description:** Wire the 4 core CLI commands (`install`, `list`, `update`, `remove`) to the installation domain using `cac` + `@clack/prompts` for interactive UX.

## Key Insights
- `install` with no args → interactive multi-select of all skills
- `install <names...>` → non-interactive, install named skills
- `list` shows installed vs available table
- `update` = remove + reinstall (or `--force` copy)
- `remove` cleans skill dirs from all installed paths + manifest
- Add `-y` flag for CI/non-interactive mode

## Requirements
- All 4 commands working end-to-end
- Interactive prompts when run without args (using `@clack/prompts`)
- Non-interactive mode with `-y` / `--yes` flag for CI
- `--tool <name>` and `--scope <global|project>` options on `install`/`remove`/`update`
- Proper error messages for missing skills, permission errors

## Architecture

```
src/commands/
├── install/
│   ├── index.ts                 # cac command definition
│   └── interactive-select.ts    # Multi-select prompt for skill selection
├── list/
│   └── index.ts                 # Table display of available + installed
├── update/
│   └── index.ts                 # Re-copy with --force
└── remove/
    └── index.ts                 # Delete from all paths + update manifest
```

## Related Code Files
- Modify: `src/commands/install/index.ts` (was stub, now full impl)
- Create: `src/commands/install/interactive-select.ts`
- Modify: `src/commands/list/index.ts`
- Modify: `src/commands/update/index.ts`
- Modify: `src/commands/remove/index.ts`

## Implementation Steps

### 1. `install` command (`src/commands/install/index.ts`)
```ts
cli.command('install [...skills]', 'Install PM skills to AI coding tools')
  .option('--tool <tool>', 'Target tool: claude, antigravity, opencode, all', { default: 'all' })
  .option('--scope <scope>', 'Scope: global or project', { default: 'global' })
  .option('--force', 'Overwrite existing installations')
  .option('-y, --yes', 'Skip interactive prompts')
  .action(async (skills, opts) => {
    const selected = skills.length > 0 ? skills : await selectSkillsInteractively(opts.yes);
    await installSkills(selected, { tools: opts.tool, scope: opts.scope, force: opts.force });
  });
```

### 2. `interactive-select.ts`
```ts
import { multiselect } from '@clack/prompts';
export async function selectSkillsInteractively(skipPrompt: boolean) {
  if (skipPrompt) return getAllSkillNames(); // install all
  const available = await loadAvailableSkills();
  return multiselect({
    message: 'Select PM skills to install:',
    options: available.map(s => ({ value: s.name, label: s.name, hint: s.meta.description })),
  });
}
```

### 3. `list` command — output format
```
PM Skills — product-kit v0.1.0

Available (10):
  ✓ prd-writer          [installed]  Draft product requirement documents
  ✓ user-story-gen      [installed]  Generate INVEST user stories + ACs
  - roadmap-planner     [available]  Plan quarterly/annual roadmaps
  ...

Install path (global): ~/.claude/skills/
Antigravity path:       ~/.gemini/antigravity/skills/
```

### 4. `update` command
- Run `installSkills(names, { ...opts, force: true })`
- If no names given, update all installed skills from manifest

### 5. `remove` command
- Read manifest for installed paths per skill
- Delete directories at those paths
- Remove entries from manifest
- Confirm with user before deletion (unless `-y`)

### 6. Wire all commands in `src/index.ts`
```ts
import { setupCli } from './cli/setup';
import { registerInstall } from './commands/install';
import { registerList } from './commands/list';
import { registerUpdate } from './commands/update';
import { registerRemove } from './commands/remove';

const cli = setupCli();
registerInstall(cli);
registerList(cli);
registerUpdate(cli);
registerRemove(cli);
cli.parse();
```

## Todo List
- [ ] `src/commands/install/index.ts` — full implementation
- [ ] `src/commands/install/interactive-select.ts` — @clack multiselect
- [ ] `src/commands/list/index.ts` — table display with installed status
- [ ] `src/commands/update/index.ts` — force reinstall
- [ ] `src/commands/remove/index.ts` — delete + manifest cleanup
- [ ] Wire all commands in `src/index.ts`
- [ ] E2E test: `pk install prd-writer --tool claude --scope global`
- [ ] E2E test: `pk list` shows correct installed status
- [ ] E2E test: `pk remove prd-writer` removes files and manifest entry

## Success Criteria
- `pk install` (no args) shows interactive multi-select with all 10 skills
- `pk install prd-writer --tool claude` installs only prd-writer to Claude path
- `pk list` shows accurate installed/available status
- `pk remove prd-writer` removes skill dir and manifest entry
- All commands work with `--yes` flag for non-interactive CI use

## Risk Assessment
- **Low:** Standard CLI implementation; well-documented patterns from claudekit-cli
- `@clack/prompts` `multiselect` returns `Symbol` on cancel — handle gracefully

## Security Considerations
- Validate `--tool` and `--scope` options against allowed values (Zod)
- Confirm before `remove` (user prompt or explicit `-y`)
- Never delete directories outside expected skill install paths

## Next Steps
- Phase 05: Config command, doctor diagnostics, UX polish
