# product-kit

PM commands for Claude Code, Antigravity, and OpenCode AI assistants.

## Install

```bash
npm install -g @tydung26/product-kit
```

## Usage

```bash
pkit init              # Interactive: pick tool + commands
pkit init --yes        # Install all commands to all tools
pkit list                 # Show available/installed commands
pkit update               # Update all installed commands
pkit remove pkit:brainstorm
pkit config               # View configuration
pkit config set toolPaths.antigravity /custom/path
pkit doctor               # Diagnose installation issues
```

## Commands

| Slash Command | Purpose |
|---|---|
| `/pkit:brainstorm` | Ideation → clustered ideas → top picks |
| `/pkit:competitive-analysis` | Competitor profiles → feature matrix → whitespace |
| `/pkit:roadmap-planner` | NOW/NEXT/LATER table → risk register → exec narrative |
| `/pkit:make-prd` | Clarifying questions → full PRD → user stories |

## Install Paths

| Tool | Global path |
|---|---|
| Claude Code + OpenCode | `~/.claude/commands/pkit/` |
| Antigravity | `~/.gemini/antigravity/commands/pkit/` |

## License

MIT
