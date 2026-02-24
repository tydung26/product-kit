# Research: PM Prompts & CLI Architecture

Sources: glean.com/25-ai-prompts-for-product-managers, productboard.com/6-ai-prompt-templates, chisellabs.com/prd-using-ai, github.com/mrgoonie/claudekit-cli

---

## Product Management Skills to Build

High-ROI PM tasks for AI automation (McKinsey: AI automates 50% of PM tasks by 2026):

| Skill | Use Case | Priority |
|-------|----------|----------|
| `prd-writer` | Draft product requirement docs from feature brief | P0 |
| `user-story-gen` | Generate INVEST-compliant user stories + ACs | P0 |
| `roadmap-planner` | Quarterly/annual roadmap structuring | P0 |
| `feature-prioritize` | RICE/MoSCoW scoring + recommendation | P1 |
| `sprint-planner` | Sprint goal + task breakdown from backlog | P1 |
| `stakeholder-update` | Status update emails/docs for execs | P1 |
| `competitive-analysis` | Structured competitor analysis framework | P2 |
| `okr-definer` | OKR + metric definition for features | P2 |
| `user-interview` | Interview script + synthesis template | P2 |
| `release-notes` | Customer-facing release notes from changelog | P2 |

---

## PM Prompt Engineering Best Practices

**CHAIN Framework:** Context → Hone Goals → Ask Iteratively → Incorporate Examples → Narrow Constraints

**Key patterns for effective PM skills:**

1. **Role specificity**: "You are a Senior PM at a B2B SaaS company with 50k MAU" > "Act as a PM"
2. **Constraint injection**: Always specify format (INVEST criteria, RICE formula, table output)
3. **Few-shot examples**: Include 1 worked example in skill body
4. **Output scaffolding**: Provide template structure the AI fills in
5. **Scope boundaries**: Explicit "Do NOT include..." statements prevent hallucination

**PRD skill example trigger:**
```
Use when user wants to write a PRD, product requirements, feature spec, or technical requirements document.
Activates for: "write a PRD", "draft requirements for", "spec out", "create feature doc"
```

---

## claudekit-cli Architecture Patterns

Reference: github.com/mrgoonie/claudekit-cli (v3.34.5, TypeScript/Bun)

### Core Patterns

**Facade Pattern** — each domain exposes clean API, hides implementation
**Phase Handler Pattern** — complex commands = multiple 50–100 LOC phase files

### Directory Structure
```
src/
├── cli/                  # cac framework setup, entry point
├── commands/             # Command definitions (each has phase files)
│   └── install/
│       ├── index.ts      # Facade
│       ├── phase-01-detect-tool.ts
│       ├── phase-02-resolve-paths.ts
│       └── phase-03-copy-files.ts
├── domains/              # Business logic
│   ├── skills/           # Skill detection, validation, migration
│   ├── config/           # Config management
│   └── ui/               # Prompts, spinners, display
├── services/             # Cross-domain utilities
│   └── file-operations/  # Platform-safe file ops
├── shared/               # Pure utils (logging, paths, env)
├── types/                # TypeScript interfaces
└── schemas/              # Zod validation
```

### CLI Commands for product-kit
```
pk install [skill-names...]   # Install skills to AI tool(s)
pk list                       # List available skills
pk update                     # Update installed skills
pk remove [skill-names...]    # Uninstall skills
pk config                     # View/set configuration
pk doctor                     # Diagnose installation issues
```

---

## npm CLI Package Setup

**Tech stack:** TypeScript + Bun (runtime + build), `cac` (CLI parsing), `@clack/prompts` (UX), `zod` (validation), `chalk` (colors), `ora` (spinners)

**package.json essentials:**
```json
{
  "bin": { "pk": "dist/index.js" },
  "engines": { "node": ">=18.0.0" },
  "files": ["dist/", "skills/", "bin/"]
}
```

**File size rule:** Max 200 lines/file, target 50–100 lines per module.

**Cross-platform path ops:** Use `path.join()`, `os.homedir()`, never string concatenation.

---

## Unresolved Questions

- Does claudekit-cli handle Windows paths correctly? Should product-kit target macOS/Linux only initially?
- Should skills be bundled in the npm package (static) or fetched from a registry (dynamic)?
- Should `pk install` support installing from a custom GitHub repo (power user feature)?
