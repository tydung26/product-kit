---
name: "pkit:naming"
description: >
  Generate product/project name suggestions across multiple naming styles.
  Use when user says "name my product", "name my app", "suggest a product name",
  "I need a name for my project/tool/service". For software products only.
license: MIT
---

# Naming

Interview the user and propose **product names** across 8 naming styles. This skill is for naming software products, apps, tools, APIs, and services — not general naming tasks.

**⚠️ ONLY for naming/renaming software products, apps, tools, APIs, or services.**
Do NOT use for: naming people/pets/companies/teams, branding exercises, or domain research.

## Usage

```
/pkit:naming <optional context>
```

## Workflow

### Step 1 — Interview

Use `AskUserQuestion` with up to 4 questions at once:

1. What does this project do? (1-sentence pitch)
2. Who is the audience? (developers, consumers, enterprise, internal team)
3. What personality/feel? (serious, playful, minimal, bold, technical, approachable)
4. Any keywords, domain concepts, or technologies central to it?

If answers are thin, ask a follow-up batch:

1. Any hard constraints? (must be pronounceable, short, avoid certain words)
2. Any names you already like or dislike — and why?

### Step 2 — Generate Names

Propose **exactly 3 names per style** across all 6 styles (18 total).

Per name format: `**Name** — one-line reason it fits (5–10 words)`

| Style              | Approach                            | Example                        |
| ------------------ | ----------------------------------- | ------------------------------ |
| **Descriptive**    | Says exactly what it does           | `product-kit`, `file-sync`     |
| **Portmanteau**    | Blend 2 relevant words              | `Snapchat`, `DevKit`           |
| **Brandable**      | Invented/abstract, memorable        | `Notion`, `Vercel`, `Supabase` |
| **Metaphor**       | Abstract concept mirroring essence  | `Forge`, `Anchor`, `Tide`      |
| **Greek / Latin**  | Classical roots, timeless authority | `Hermes`, `Aether`, `Kairos`   |
| **Simple / Plain** | Common everyday words, zero jargon  | `Quick`, `Base`, `Core`, `Kit` |

### Step 3 — Follow-up

End with:

> "Want more in a specific style, or variations on any of these?"

## Rules

- **Product names only** — for software, apps, tools
- If user asks to name something non-product (person, pet, etc.), politely redirect: "This skill is for product naming — try `/pkit:naming` with a product concept."
- **Names only** — no domain checks, no trademark lookups, no availability
- Group output by style with a `##` heading per style
- If user provides very little context, state your assumptions briefly and proceed
