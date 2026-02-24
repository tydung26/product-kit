# Phase 01 — Project Bootstrap & CLI Shell

## Context Links
- Parent plan: [plan.md](plan.md)
- Reference: [claudekit-cli architecture](https://github.com/mrgoonie/claudekit-cli)
- Research: [PM Prompts & CLI Architecture](research/researcher-02-pm-prompts-cli-architecture.md)

## Overview
- **Date:** 2026-02-24
- **Priority:** P0
- **Status:** pending
- **Effort:** ~2h
- **Description:** Initialize TypeScript/Bun project, configure tooling, wire up `cac` CLI shell with stub commands, create project directory structure mirroring claudekit-cli patterns.

## Key Insights
- Use Facade + Phase Handler patterns from claudekit-cli for maintainability
- `cac` is simpler than `commander`/`yargs` for this scale
- `@clack/prompts` gives polished UX (spinners, confirms, selects) out of the box
- Keep files ≤200 lines, target 50–100 LOC per module
- Bun handles TypeScript natively — no separate ts-node needed

## Requirements
- **Functional:** `pk --version`, `pk --help`, all command stubs respond without errors
- **Non-functional:** Compiles cleanly with `bun build`, no type errors

## Architecture

```
product-kit/
├── bin/
│   └── pk.js                    # Shebang entry point → dist/index.js
├── src/
│   ├── index.ts                 # CLI entry: parse args, route commands
│   ├── cli/
│   │   └── setup.ts             # cac instance, global flags (--verbose, --json)
│   ├── commands/
│   │   ├── install/index.ts     # install command facade (stub)
│   │   ├── list/index.ts        # list command facade (stub)
│   │   ├── update/index.ts      # update command facade (stub)
│   │   ├── remove/index.ts      # remove command facade (stub)
│   │   ├── config/index.ts      # config command facade (stub)
│   │   └── doctor/index.ts      # doctor command facade (stub)
│   ├── domains/
│   │   ├── skills/              # Skill detection, listing (empty)
│   │   ├── installation/        # Path resolution, file copy (empty)
│   │   ├── config/              # Config R/W (empty)
│   │   └── ui/                  # Prompts, spinners (empty)
│   ├── services/
│   │   └── file-operations/     # Cross-platform file utils (empty)
│   ├── shared/
│   │   ├── logger.ts            # Chalk-based logger
│   │   ├── paths.ts             # Tool path constants
│   │   └── errors.ts            # Typed error classes
│   ├── types/
│   │   └── index.ts             # Shared TypeScript interfaces
│   └── schemas/
│       └── skill-schema.ts      # Zod: SKILL.md frontmatter validation
├── skills/                      # Bundled PM skills (populated in Phase 02)
├── package.json
├── tsconfig.json
├── biome.json                   # Linting + formatting
└── .gitignore
```

## Related Code Files
- Create: all files listed above (stubs)
- Create: `package.json`, `tsconfig.json`, `biome.json`

## Implementation Steps

1. **Init project:**
   ```bash
   cd /Users/josephdung/projects/product-kit
   bun init -y
   bun add cac @clack/prompts zod chalk ora fs-extra
   bun add -d typescript @types/node biome @types/fs-extra
   ```

2. **Configure `package.json`:**
   ```json
   {
     "name": "product-kit",
     "version": "0.1.0",
     "description": "PM skills for Claude Code, Antigravity, and OpenCode",
     "bin": { "pk": "bin/pk.js" },
     "main": "dist/index.js",
     "scripts": {
       "build": "bun build src/index.ts --outfile dist/index.js --target node",
       "dev": "bun run src/index.ts",
       "lint": "biome check src/",
       "type-check": "tsc --noEmit"
     },
     "engines": { "node": ">=18.0.0" },
     "files": ["dist/", "skills/", "bin/"]
   }
   ```

3. **Create `bin/pk.js`:**
   ```js
   #!/usr/bin/env node
   import('../dist/index.js');
   ```

4. **Create `src/shared/paths.ts`** — tool install path constants:
   ```ts
   import { homedir } from 'os';
   import { join } from 'path';
   const home = homedir();
   export const TOOL_PATHS = {
     claudeGlobal: join(home, '.claude', 'skills'),
     claudeProject: join(process.cwd(), '.claude', 'skills'),
     antigravityGlobal: join(home, '.gemini', 'antigravity', 'skills'),
     antigravityProject: join(process.cwd(), '.agent', 'skills'),
     opencodeGlobal: join(home, '.config', 'opencode', 'skills'),
     opencodeProject: join(process.cwd(), '.opencode', 'skills'),
   };
   // OpenCode also reads ~/.claude/skills (same as Claude)
   ```

5. **Create `src/types/index.ts`:**
   ```ts
   export type ToolName = 'claude' | 'antigravity' | 'opencode' | 'all';
   export type InstallScope = 'global' | 'project';
   export interface SkillMeta { name: string; description: string; license: string; }
   export interface InstallOptions { tools: ToolName; scope: InstallScope; }
   ```

6. **Wire `src/index.ts` → `src/cli/setup.ts`** with all 6 command stubs using `cac`

7. **Configure `tsconfig.json`** with `strict: true`, `moduleResolution: bundler`

8. **Configure `biome.json`** with reasonable linting rules

9. **Test CLI shell:** `bun run dev -- --help` shows all commands

## Todo List
- [ ] `bun init` + install dependencies
- [ ] Configure `package.json` (bin, scripts, files, engines)
- [ ] Create `bin/pk.js` shebang entry
- [ ] Create `src/shared/paths.ts` with tool path constants
- [ ] Create `src/types/index.ts` with shared interfaces
- [ ] Create `src/schemas/skill-schema.ts` (Zod SKILL.md frontmatter)
- [ ] Create `src/cli/setup.ts` (cac instance)
- [ ] Create 6 command stubs in `src/commands/`
- [ ] Wire `src/index.ts`
- [ ] Configure `tsconfig.json` and `biome.json`
- [ ] Verify `pk --help` and `pk --version` work

## Success Criteria
- `bun run dev -- --help` lists all 6 commands
- `bun build` compiles without errors
- `tsc --noEmit` passes
- `biome check` passes

## Risk Assessment
- **Low:** Well-understood CLI scaffold; claudekit-cli is direct reference
- `cac` is minimal — may need to extend for subcommand option parsing

## Security Considerations
- `bin/pk.js` must have execute permissions (`chmod +x`)
- No secrets or credentials at this phase

## Next Steps
- Phase 02: Write the 10 PM skill SKILL.md files into `skills/` directory
