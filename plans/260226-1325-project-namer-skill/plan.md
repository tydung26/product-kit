# Plan: project-namer Skill

**Status:** pending
**Created:** 2026-02-26
**Goal:** Create a Claude skill that generates project name suggestions by interviewing the user and proposing names across multiple naming styles.

---

## Phases

| #   | Phase                             | Status  |
| --- | --------------------------------- | ------- |
| 1   | Create skill directory & SKILL.md | completed |

---

## Skill Design

**Location:** `~/.claude/skills/project-namer/SKILL.md`
**Trigger:** User says "name my project", "suggest a project name", "I need a name for..."

### Interview Questions (via AskUserQuestion)

1. **Purpose** — What does this project do? (1-line pitch)
2. **Audience** — Who uses it? (devs, consumers, enterprise, internal)
3. **Feel** — What personality? (serious/playful, minimal/bold, technical/approachable)
4. **Domain** — Any keywords, technologies, or concepts central to it?
5. **Constraints** — Any hard constraints? (must be pronounceable, avoid X, etc.)

### Naming Styles to Propose

| Style             | Description               | Example                        |
| ----------------- | ------------------------- | ------------------------------ |
| **Descriptive**   | Says exactly what it does | `product-kit`, `file-sync`     |
| **Portmanteau**   | Blend two words           | `Snapchat`, `Brunch`           |
| **Brandable**     | Made-up, memorable        | `Notion`, `Vercel`, `Supabase` |
| **Metaphor**      | Abstract concept          | `Anchor`, `Forge`, `Tide`      |
| **Acronym**       | Initials as word          | `RADAR`, `LAMP`                |
| **Animal/Nature** | Universal appeal          | `Cobra`, `Cedar`               |
| **Greek/Latin**   | Classical roots, timeless | `Hermes`, `Nexus`, `Aether`    |

### Output Format

- 3–5 names per style
- Each name: just the name + 1-line why it fits
- Total: ~20–30 candidates
- **No domain availability checking** — names only

---

## Implementation Notes

- Single SKILL.md file, no references or scripts needed (pure instruction skill)
- Use `AskUserQuestion` for all interview questions
- Keep SKILL.md under 100 lines
- After generating names, ask if user wants more in a specific style
