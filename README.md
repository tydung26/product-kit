# product-kit

PM commands for Claude Code, Antigravity, and OpenCode AI assistants.

## Install

```bash
pnpm add -g @tydung26/product-kit
# or
npm install -g @tydung26/product-kit
```

## Usage

```bash
pkit init              # Interactive: pick tool + commands
pkit init --yes        # Install all commands to all tools
pkit list                 # Show available/installed commands
pkit update               # Update all installed commands
pkit remove pkit:discover
pkit config               # View configuration
pkit config set toolPaths.antigravity /custom/path
pkit doctor               # Diagnose installation issues
```

## Commands

| Slash Command | Purpose |
|---|---|
| `/pkit:discover` | Discovery → customer slicing → clustered ideas → top picks |
| `/pkit:market-intel` | Competitor profiles → feature matrix → whitespace → strategic recs |
| `/pkit:roadmap` | NOW/NEXT/LATER table → risk register → exec narrative |
| `/pkit:product-design` | PRD → brand guideline → wireframes → polished design |

## Install Paths

| Tool | Global path |
|---|---|
| Claude Code + OpenCode | `~/.claude/skills/` |
| Antigravity | `~/.gemini/antigravity/skills/` |

## License

MIT
