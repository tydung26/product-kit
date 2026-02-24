# Research: AI Tool Skill Formats

Sources: opencode.ai/docs/skills, sabbirz.com/blog/antigravity-skills, developers.googleblog.com/antigravity, deepwiki.com/antigravity-awesome-skills

---

## Key Finding: Unified Skill Standard

All three tools share the **same SKILL.md format** — originally from Anthropic Claude, now an open standard at agentskills.io. One skill file works across Claude Code, Antigravity, and OpenCode.

---

## Universal SKILL.md Format

```
my-skill/
├── SKILL.md              # Required — core instructions
├── references/           # Extended docs (loaded on demand)
├── scripts/              # Executable automation
├── examples/             # Sample outputs
└── templates/            # Pre-filled templates
```

**Required frontmatter:**
```yaml
---
name: skill-name          # 1–64 chars, lowercase alphanumeric + hyphens
description: >            # 1–1024 chars; semantic trigger text
  Use when user needs X. Activates for Y. Do NOT use for Z.
license: MIT
---
```

**Body:** Markdown instructions to the AI agent.

**Name validation:** `^[a-z0-9]+(-[a-z0-9]+)*$` — no leading/trailing/consecutive hyphens, lowercase only.

---

## Installation Paths Per Tool

| Scope | Claude Code | Antigravity | OpenCode |
|-------|-------------|-------------|----------|
| Global | `~/.claude/skills/<name>/` | `~/.gemini/antigravity/skills/<name>/` | `~/.claude/skills/<name>/` OR `~/.config/opencode/skills/<name>/` |
| Project | `.claude/skills/<name>/` | `.agent/skills/<name>/` | `.opencode/skills/<name>/` OR `.claude/skills/<name>/` |

**Critical insight:** OpenCode reads `~/.claude/skills/` and `.claude/skills/` — same as Claude Code. Installing to `~/.claude/skills/` covers both Claude Code + OpenCode.

---

## Invocation

- **Auto-trigger:** Agent reads description field; activates when user prompt semantically matches
- **Manual (Claude):** `/skill-name` slash command
- **Manual (Antigravity):** `/skill-name` or `@skill-name`
- **Manual (OpenCode):** native `skill` tool invocation

---

## Skill Loading Precedence

OpenCode walks up directory tree from CWD → git root, loading:
1. `.opencode/skills/*/SKILL.md`
2. `.claude/skills/*/SKILL.md`
3. `.agents/skills/*/SKILL.md`
Then global paths.

---

## Installation Strategy for product-kit

Given unified format + overlapping paths, `pk install` should:

1. **Claude Code + OpenCode** → copy to `~/.claude/skills/<name>/`
2. **Antigravity global** → copy to `~/.gemini/antigravity/skills/<name>/`
3. **Project-level** → copy to both `.claude/skills/<name>/` and `.agent/skills/<name>/`

CLI options: `--global` (default), `--project`, `--tool claude|antigravity|opencode|all`

---

## Unresolved Questions

- Does Antigravity also read `.claude/skills/` like OpenCode does? (would simplify to single path)
- Does `agentskills.io` offer a registry/API we can leverage for discovery?
- Are there rate limits on skill loading (context window impact for many skills)?
