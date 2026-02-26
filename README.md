# product-kit

Product engineer skills kit for Claude Code, Antigravity, and OpenCode AI assistants.

## Install

```bash
npm install -g @tydung26/product-kit
```

## Usage

```bash
# Setup
pkit init                  # Interactive: pick tool → skills → scope
pkit init --yes            # Install all skills to claude (global)
pkit i                     # Alias for init

# Add skills (skip full init)
pkit add                   # Interactive: pick scope → skills
pkit add pkit:discover     # Add specific skill (prompts for scope)
pkit add pkit:discover --scope global --tool claude

# Manage
pkit list                  # Show available/installed skills
pkit ls                    # Alias for list
pkit update                # Update all installed skills (both scopes)
pkit u                     # Alias for update
pkit remove pkit:discover  # Remove specific skill (both scopes)
pkit rm --all              # Remove all installed skills
pkit doctor                # Diagnose installation issues
```

## Skills

| Slash Command          | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `/pkit:discover`       | Discovery → customer slicing → clustered ideas → top picks         |
| `/pkit:market-intel`   | Competitor profiles → feature matrix → whitespace → strategic recs |
| `/pkit:roadmap`        | NOW/NEXT/LATER table → risk register → exec narrative              |
| `/pkit:product-design` | PRD → brand guideline → wireframes → polished design               |

## Install Paths

| Tool                   | Global                                  | Project                   |
| ---------------------- | --------------------------------------- | ------------------------- |
| Claude Code + OpenCode | `~/.claude/skills/<skill>/`             | `.claude/skills/<skill>/` |
| Antigravity            | `~/.gemini/antigravity/skills/<skill>/` | `.agent/skills/<skill>/`  |

## License

MIT
