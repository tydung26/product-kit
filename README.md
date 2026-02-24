# product-kit

PM skills for Claude Code, Antigravity, and OpenCode AI assistants.

## Install

```bash
npm install -g product-kit
```

## Usage

```bash
pkit install              # Interactive: pick tool + skills
pkit install --yes        # Install all skills to all tools
pkit list                 # Show available/installed skills
pkit update               # Update all installed skills
pkit remove pkit:brainstorm
pkit config               # View configuration
pkit config set toolPaths.antigravity /custom/path
pkit doctor               # Diagnose installation issues
```

## Skills

| Slash Command | Purpose |
|---|---|
| `/pkit:brainstorm` | Ideation → clustered ideas → top picks |
| `/pkit:competitive-analysis` | Competitor profiles → feature matrix → whitespace |
| `/pkit:roadmap-planner` | NOW/NEXT/LATER table → risk register → exec narrative |
| `/pkit:make-prd` | Clarifying questions → full PRD → user stories |

## Install Paths

| Tool | Global path |
|---|---|
| Claude Code + OpenCode | `~/.claude/skills/` |
| Antigravity | `~/.gemini/antigravity/skills/` |

## License

MIT
